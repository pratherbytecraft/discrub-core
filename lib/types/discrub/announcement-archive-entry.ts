/**
 * One past release announcement from the archive gist. The archive is a
 * public gist holding `index.json` (ordered newest first) plus one markdown
 * file per release; `fetchAnnouncementArchive` joins them into these.
 */
export type AnnouncementArchiveEntry = {
  /** Release version, e.g. "2.1.0". Unique within the archive. */
  version: string;
  /** ISO date (YYYY-MM-DD) the announcement was posted. */
  date: string;
  /** Short display title, e.g. "Discrub 2.1.0". */
  title: string;
  /** Full announcement body, the same markdown the dialog rendered at the time. */
  markdown: string;
};
