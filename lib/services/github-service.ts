import type {
  Announcement,
  AnnouncementArchiveEntry,
  Donation,
} from "../types/discrub-types.ts";

const GITHUB_GIST_URL = "https://api.github.com/gists";
const ANNOUNCEMENT_ENDPOINT = `${GITHUB_GIST_URL}/e5558088744dbe52edca729425900a69`;
const DONATION_ENDPOINT = `${GITHUB_GIST_URL}/eb9a7ef2cf49ecab72adebeacea420bf`;
const ANNOUNCEMENT_MARKDOWN_ENDPOINT = `${GITHUB_GIST_URL}/a73736574a1a994e97cbc2d6f467c574`;
const ANNOUNCEMENT_ARCHIVE_ENDPOINT = `${GITHUB_GIST_URL}/d57525174377b474cb7c90210d3ab979`;

const fetchGist = <T>(
  endpoint: string,
  fileName: string,
  fallbackMsg: string,
  options?: { contentType?: string; parseJson?: boolean; fallbackValue?: T },
): Promise<T> => {
  const contentType = options?.contentType ?? "application/json";
  const parseJson = options?.parseJson ?? true;

  return fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": contentType,
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const content = gistData?.files?.[fileName]?.content;
      return parseJson ? (JSON.parse(content) as T) : (content as T);
    })
    .catch((e) => {
      console.error(fallbackMsg, e);
      return (options?.fallbackValue !== undefined
        ? options.fallbackValue
        : undefined) as any;
    });
};

/**
 * Fetches announcement data from GitHub Gist
 * @returns Promise containing announcement revision and version info
 */
export const fetchAnnouncementData = (): Promise<Announcement> =>
  fetchGist<Announcement>(
    ANNOUNCEMENT_ENDPOINT,
    "announcement.json",
    "Error fetching announcement data",
  );

/**
 * Fetches announcement markdown content from GitHub Gist
 * @returns Promise containing announcement markdown string
 */
export const fetchAnnouncementMarkdown = (): Promise<string> =>
  fetchGist<string>(
    ANNOUNCEMENT_MARKDOWN_ENDPOINT,
    "announcement_markdown.md",
    "Error fetching announcement markdown",
    { contentType: "application/text", parseJson: false, fallbackValue: "" },
  );

/**
 * Fetches donation data from GitHub Gist
 * @returns Promise containing array of donation records
 */
export const fetchDonationData = (): Promise<Donation[]> =>
  fetchGist<Donation[]>(
    DONATION_ENDPOINT,
    "contributions.json",
    "Error fetching donations",
  );

/**
 * Fetches the supporter-key revocation list (revoked jti values) from
 * the donation gist. The file is a rare-remedy tool and is normally
 * absent, so absence is not logged as an error; any missing file,
 * fetch failure, or parse failure resolves to an empty list so key
 * verification fails open.
 * @returns Promise containing array of revoked key ids
 */
export const fetchRevokedSupporterKeys = (): Promise<string[]> =>
  fetch(DONATION_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const content = gistData?.files?.["revoked_keys.json"]?.content;
      if (!content) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed)
        ? parsed.filter((jti): jti is string => typeof jti === "string")
        : [];
    })
    .catch(() => []);

type ArchiveIndexRow = { version?: unknown; date?: unknown; title?: unknown; file?: unknown };

/**
 * Fetches the past-announcements archive: a public gist holding `index.json`
 * (rows ordered newest first: version, date, title, file) plus one markdown
 * file per release. The gist API returns every file's content inline, so the
 * whole archive is one request. Rows whose file is missing, truncated, or
 * malformed are skipped; any fetch or parse failure resolves to an empty list
 * so the dialog can show "nothing to browse" instead of breaking.
 * @returns Promise containing archive entries, newest first
 */
export const fetchAnnouncementArchive = (): Promise<AnnouncementArchiveEntry[]> =>
  fetch(ANNOUNCEMENT_ARCHIVE_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (resp) => {
      const gistData = await resp.json();
      const files = gistData?.files ?? {};
      const indexContent = files["index.json"]?.content;
      if (typeof indexContent !== "string") return [];
      const rows = JSON.parse(indexContent);
      if (!Array.isArray(rows)) return [];
      const entries: AnnouncementArchiveEntry[] = [];
      for (const row of rows as ArchiveIndexRow[]) {
        if (
          typeof row?.version !== "string" ||
          typeof row.date !== "string" ||
          typeof row.title !== "string" ||
          typeof row.file !== "string"
        )
          continue;
        const file = files[row.file];
        if (!file || file.truncated || typeof file.content !== "string") continue;
        entries.push({
          version: row.version,
          date: row.date,
          title: row.title,
          markdown: file.content,
        });
      }
      return entries;
    })
    .catch((e) => {
      console.error("Error fetching announcement archive", e);
      return [];
    });
