import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchAnnouncementData, fetchAnnouncementMarkdown, fetchAnnouncementArchive, fetchDonationData, fetchRevokedSupporterKeys } from './github-service.ts';
import type { Announcement, Donation } from '../types/discrub-types.ts';

describe('GitHubService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Announcement Fetching', () => {
    it('should fetch announcement data successfully', async () => {
      const mockAnnouncement: Announcement = {
        revision: '1.2.3',
        version: '1.2.3',
      };

      const mockGistResponse = {
        files: {
          'announcement.json': {
            content: JSON.stringify(mockAnnouncement),
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAnnouncementData();

      expect(result).toEqual(mockAnnouncement);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gists/e5558088744dbe52edca729425900a69'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should parse announcement JSON correctly', async () => {
      const mockAnnouncement: Announcement = {
        revision: '2.0.0',
        version: '2.0.0',
      };

      const mockGistResponse = {
        files: {
          'announcement.json': {
            content: JSON.stringify(mockAnnouncement),
          },
        },
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchAnnouncementData();

      expect(result).toEqual(mockAnnouncement);
      expect(result.revision).toBe('2.0.0');
      expect(result.version).toBe('2.0.0');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError));

      const result = await fetchAnnouncementData();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching announcement data',
        mockError
      );
    });

    it('should handle malformed JSON in gist response', async () => {
      const mockGistResponse = {
        files: {
          'announcement.json': {
            content: 'invalid json {',
          },
        },
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchAnnouncementData();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Donation Fetching', () => {
    it('should fetch donation data successfully', async () => {
      const mockDonations: Donation[] = [
        {
          donorId: 'abc123hash',
          transactionId: 'tx-001',
          timestamp: '2023-01-15T00:00:00.000Z',
          type: 'Tip',
          fromName: 'John Doe',
          message: 'Great tool!',
          amount: 50,
          currency: 'USD',
        },
        {
          donorId: 'def456hash',
          transactionId: 'tx-002',
          timestamp: '2023-02-20T00:00:00.000Z',
          type: 'Monthly Tip',
          fromName: 'Jane Smith',
          message: '',
          amount: 100,
          currency: 'USD',
        },
      ];

      const mockGistResponse = {
        files: {
          'contributions.json': {
            content: JSON.stringify(mockDonations),
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchDonationData();

      expect(result).toEqual(mockDonations);
      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gists/eb9a7ef2cf49ecab72adebeacea420bf'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should parse donation JSON correctly', async () => {
      const mockDonations: Donation[] = [
        {
          donorId: 'abc123hash',
          transactionId: 'tx-001',
          timestamp: '2023-03-10T00:00:00.000Z',
          type: 'Tip',
          fromName: 'Test Donor',
          message: 'Thanks!',
          amount: 25,
          currency: 'USD',
        },
      ];

      const mockGistResponse = {
        files: {
          'contributions.json': {
            content: JSON.stringify(mockDonations),
          },
        },
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchDonationData();

      expect(result).toEqual(mockDonations);
      expect(result[0].fromName).toBe('Test Donor');
      expect(result[0].amount).toBe(25);
      expect(result[0].type).toBe('Tip');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError));

      const result = await fetchDonationData();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching donations',
        mockError
      );
    });

    it('should handle empty donation array', async () => {
      const mockGistResponse = {
        files: {
          'contributions.json': {
            content: JSON.stringify([]),
          },
        },
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchDonationData();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('Markdown Fetching', () => {
    it('should fetch announcement markdown successfully', async () => {
      const mockMarkdown = '# Announcement\n\nThis is a test announcement.';

      const mockGistResponse = {
        files: {
          'announcement_markdown.md': {
            content: mockMarkdown,
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAnnouncementMarkdown();

      expect(result).toBe(mockMarkdown);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gists/a73736574a1a994e97cbc2d6f467c574'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/text',
          }),
        })
      );
    });

    it('should handle fetch errors and return empty string', async () => {
      const mockError = new Error('Network error');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(mockError));

      const result = await fetchAnnouncementMarkdown();

      expect(result).toBe('');
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching announcement markdown',
        mockError
      );
    });

    it('should handle missing markdown file in gist', async () => {
      const mockGistResponse = {
        files: {},
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchAnnouncementMarkdown();

      expect(result).toBeUndefined();
    });

    it('should handle markdown with special characters', async () => {
      const mockMarkdown = '# Test\n\n**Bold** _italic_ `code` [link](url)';

      const mockGistResponse = {
        files: {
          'announcement_markdown.md': {
            content: mockMarkdown,
          },
        },
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      }));

      const result = await fetchAnnouncementMarkdown();

      expect(result).toBe(mockMarkdown);
      expect(result).toContain('**Bold**');
      expect(result).toContain('_italic_');
      expect(result).toContain('[link](url)');
    });
  });

  describe('Announcement Archive Fetching', () => {
    const archiveGist = {
      files: {
        'index.json': {
          content: JSON.stringify([
            { version: '2.1.0', date: '2026-08-23', title: 'Discrub 2.1.0', file: '2.1.0.md' },
            { version: '2.0.10', date: '2026-08-16', title: 'Discrub 2.0.10', file: '2.0.10.md' },
          ]),
        },
        '2.1.0.md': { content: '# What\'s New in Discrub 2.1.0' },
        '2.0.10.md': { content: '# What\'s New in Discrub 2.0.10' },
      },
    };

    it('joins index.json rows with their markdown files in index order, in one request', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ json: async () => archiveGist });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchAnnouncementArchive();

      expect(result).toEqual([
        { version: '2.1.0', date: '2026-08-23', title: 'Discrub 2.1.0', markdown: '# What\'s New in Discrub 2.1.0' },
        { version: '2.0.10', date: '2026-08-16', title: 'Discrub 2.0.10', markdown: '# What\'s New in Discrub 2.0.10' },
      ]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/api\.github\.com\/gists\//),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('skips rows whose file is missing, truncated, or malformed', async () => {
      const gist = {
        files: {
          'index.json': {
            content: JSON.stringify([
              { version: '2.1.0', date: '2026-08-23', title: 'Discrub 2.1.0', file: '2.1.0.md' },
              { version: '2.0.10', date: '2026-08-16', title: 'Discrub 2.0.10', file: 'missing.md' },
              { version: '2.0.9', date: '2026-08-15', title: 'Discrub 2.0.9', file: '2.0.9.md' },
              { version: 42, file: '2.0.8.md' },
            ]),
          },
          '2.1.0.md': { content: 'ok' },
          '2.0.9.md': { content: 'partial', truncated: true },
          '2.0.8.md': { content: 'never used' },
        },
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => gist }));

      const result = await fetchAnnouncementArchive();

      expect(result.map((e) => e.version)).toEqual(['2.1.0']);
    });

    it('resolves to an empty list when index.json is absent or not an array', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ files: {} }) }));
      expect(await fetchAnnouncementArchive()).toEqual([]);

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => ({ files: { 'index.json': { content: '{"not":"an array"}' } } }),
      }));
      expect(await fetchAnnouncementArchive()).toEqual([]);
    });

    it('resolves to an empty list and logs on fetch or parse failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      expect(await fetchAnnouncementArchive()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching announcement archive', expect.any(Error));

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: async () => ({ files: { 'index.json': { content: '{bad json' } } }),
      }));
      expect(await fetchAnnouncementArchive()).toEqual([]);
    });
  });

  describe('Revoked Supporter Key Fetching', () => {
    it('should fetch revoked key ids from the donation gist', async () => {
      const mockGistResponse = {
        files: {
          'contributions.json': { content: '[]' },
          'revoked_keys.json': { content: JSON.stringify(['a1b2c3d4', 'e5f6a7b8']) },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockGistResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchRevokedSupporterKeys();

      expect(result).toEqual(['a1b2c3d4', 'e5f6a7b8']);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gists/eb9a7ef2cf49ecab72adebeacea420bf'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should resolve to an empty list when the file is absent, without logging', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ files: { 'contributions.json': { content: '[]' } } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchRevokedSupporterKeys();

      expect(result).toEqual([]);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should resolve to an empty list on fetch failure (fail open)', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchRevokedSupporterKeys();

      expect(result).toEqual([]);
    });

    it('should resolve to an empty list on malformed content', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ files: { 'revoked_keys.json': { content: 'not json' } } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchRevokedSupporterKeys();

      expect(result).toEqual([]);
    });

    it('should drop non-string entries from the list', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          files: {
            'revoked_keys.json': { content: JSON.stringify(['ok', 42, null, 'also-ok']) },
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchRevokedSupporterKeys();

      expect(result).toEqual(['ok', 'also-ok']);
    });
  });

  describe('Integration Tests', () => {
    it('should not send an Authorization header to any endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ files: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await fetchAnnouncementData();
      await fetchDonationData();
      await fetchAnnouncementMarkdown();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      mockFetch.mock.calls.forEach(call => {
        expect(call[1].headers.Authorization).toBeUndefined();
      });
    });

    it('should use GET method for all endpoints', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ files: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await fetchAnnouncementData();
      await fetchDonationData();
      await fetchAnnouncementMarkdown();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      mockFetch.mock.calls.forEach(call => {
        expect(call[1].method).toBe('GET');
      });
    });
  });
});
