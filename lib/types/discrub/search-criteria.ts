import { AuthorType, HasType, IsPinnedType } from "../../enum/discord-enum";

export type SearchCriteria = {
  searchBeforeDate: Date | null | undefined;
  searchAfterDate: Date | null | undefined;
  searchMessageContent: string | null | undefined;
  selectedHasTypes: HasType[];
  userIds: string[];
  mentionIds: string[];
  channelIds: string[];
  isPinned: IsPinnedType;
  authorType?: AuthorType | null;
  /**
   * Attachment file extensions, lowercase without the dot ("png", "pdf").
   * Server search: Discord's undocumented `attachment_extension` param,
   * repeatable as OR. Local refine: any attachment whose filename ends
   * with one of them. (#GH13, verified live 2026-08-23.)
   */
  attachmentExtensions?: string[];
  /**
   * Attachment filename. Server search: Discord's `attachment_filename`
   * param, exact full name and case-sensitive. Local refine: substring,
   * case-insensitive.
   */
  attachmentFilename?: string | null;
};