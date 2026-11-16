import { beforeEach } from 'vitest';
import { setCallGate } from './services/discord-service.ts';

// Every API call waits its turn at a shared gate (500 ms apart by default).
// The suite runs with it off so each test's own timing is the only timing.
beforeEach(() => {
  setCallGate({ minGapMs: 0 });
});
