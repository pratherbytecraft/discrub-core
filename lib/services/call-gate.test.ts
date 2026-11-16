/**
 * The gate every API call passes through: calls from anywhere in the app
 * start at least `minGapMs` apart, in the order they were made.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscordService, resetCallGate, resetRateLimitState, setCallGate } from './discord-service.ts';
import { mockRateLimitResponse, mockSuccessResponse } from '../__tests__/test-fixtures.ts';

describe('API call gate', () => {
  let starts: Array<{ url: string; at: number }>;
  let t0: number;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    resetRateLimitState();
    setCallGate({ minGapMs: 500, jitterMs: 0 });
    resetCallGate();
    starts = [];
    t0 = Date.now();
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      starts.push({ url: String(url), at: Date.now() - t0 });
      return String(url).includes('cdn') ? ({ ok: true, status: 200, blob: async () => new Blob(['x']) } as Response) : mockSuccessResponse({ id: '1' });
    }));
  });

  afterEach(() => {
    setCallGate({ minGapMs: 0, jitterMs: 150 });
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const settle = async (calls: Array<Promise<unknown>>) => {
    await vi.runAllTimersAsync();
    return Promise.all(calls);
  };

  it('two instances calling at the same moment start 500 ms apart, in the order they called', async () => {
    const a = new DiscordService(undefined, { autoDelay: false });
    const b = new DiscordService(undefined, { autoDelay: false });
    await settle([a.getUser('t', 'first'), b.getUser('t', 'second'), a.getUser('t', 'third')]);
    expect(starts.map((s) => s.url.split('/').pop())).toEqual(['first', 'second', 'third']);
    expect(starts.map((s) => s.at)).toEqual([0, 500, 1000]);
  });

  it('a call made after a quiet spell is not held', async () => {
    const service = new DiscordService(undefined, { autoDelay: false });
    await settle([service.getUser('t', 'one')]);
    vi.advanceTimersByTime(2000);
    t0 = Date.now();
    starts = [];
    await settle([service.getUser('t', 'two')]);
    expect(starts[0].at).toBe(0);
  });

  it('a loop that already waits longer than the gap is not slowed', async () => {
    const service = new DiscordService(undefined, { autoDelay: false });
    const loop = (async () => {
      for (const id of ['a', 'b', 'c']) {
        await service.getUser('t', id);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();
    await settle([loop]);
    expect(starts.map((s) => s.at)).toEqual([0, 1000, 2000]);
  });

  it('a caller that wakes late keeps the one behind it a full gap away from its real start', async () => {
    const { setSleepImplementation } = await import('../utils/common-utils.ts');
    // The first waiter's timer fires 200 ms late, as on a busy page.
    let sleeps = 0;
    setSleepImplementation((ms) => new Promise((resolve) => setTimeout(resolve, ms + (sleeps++ === 0 ? 200 : 0))));
    try {
      const service = new DiscordService(undefined, { autoDelay: false });
      await settle([service.getUser('t', 'one'), service.getUser('t', 'two'), service.getUser('t', 'three')]);
      const at = starts.map((s) => s.at);
      expect(at[1]).toBe(700);
      expect(at[2] - at[1]).toBeGreaterThanOrEqual(500);
    } finally {
      setSleepImplementation();
    }
  });

  it('adds up to the jitter on top of the gap', async () => {
    setCallGate({ minGapMs: 500, jitterMs: 150 });
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const service = new DiscordService(undefined, { autoDelay: false });
    await settle([service.getUser('t', 'one'), service.getUser('t', 'two')]);
    expect(starts[1].at - starts[0].at).toBeGreaterThanOrEqual(649);
    expect(starts[1].at - starts[0].at).toBeLessThanOrEqual(650);
  });

  it('media downloads are not held and do not take a turn', async () => {
    const service = new DiscordService(undefined, { autoDelay: false });
    await settle([
      service.getUser('t', 'one'),
      service.downloadFile('https://cdn.discordapp.com/a.png'),
      service.downloadFile('https://cdn.discordapp.com/b.png'),
      service.getUser('t', 'two'),
    ]);
    const at = (name: string) => starts.find((s) => s.url.endsWith(name))!.at;
    expect(at('a.png')).toBe(0);
    expect(at('b.png')).toBe(0);
    expect(at('one')).toBe(0);
    expect(at('two')).toBe(500);
  });

  it('a retry after a 429 waits out the cooldown, then takes a new turn behind nothing', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => { starts.push({ url: 'first try', at: Date.now() - t0 }); return mockRateLimitResponse(2); })
      .mockImplementation(async (url: string) => { starts.push({ url: String(url), at: Date.now() - t0 }); return mockSuccessResponse({ id: '1' }); });
    vi.stubGlobal('fetch', fetchMock);
    const service = new DiscordService(undefined, { autoDelay: false });
    await settle([service.getUser('t', 'one'), service.getUser('t', 'two')]);
    // The first call is refused at 0 and retries at 2000. The second, queued for 500, waits out the same cooldown.
    const times = starts.map((s) => s.at);
    expect(times[0]).toBe(0);
    expect(times.slice(1).every((at) => at >= 2000)).toBe(true);
    expect(Math.abs(times[2] - times[1])).toBeGreaterThanOrEqual(500);
  });

  it('a gap of 0 turns the gate off', async () => {
    setCallGate({ minGapMs: 0 });
    const service = new DiscordService(undefined, { autoDelay: false });
    await settle([service.getUser('t', 'one'), service.getUser('t', 'two'), service.getUser('t', 'three')]);
    expect(starts.map((s) => s.at)).toEqual([0, 0, 0]);
  });
});
