import { AuthorType, HasType, IsPinnedType } from "../../enum/discord-enum";

export type SearchCriteria = {
  searchBeforeDate: Date | null | undefined;
  searchAfterDate: Date | null | undefined;
  /**
   * Content terms, matched as ANY-OF (OR). Empty = no content filter.
   * Server search: Discord's `content` param takes ONE term (a second
   * `content` param is ignored, verified live 2026-08-26), so
   * `iterateSearchResults` runs one cap-shifted search per term and
   * dedupes by message id. Local refine: case-insensitive substring,
   * any term. (#244)
   */
  searchMessageContents: string[];
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