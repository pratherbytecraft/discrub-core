import { parseISO, isAfter, isBefore, isEqual } from "date-fns";
import type { Message, Channel } from "../types/discord-types.ts";
import type { SearchCriteria } from "../types/discrub-types.ts";
import { messageTypeEquals } from "../utils/discrub-utils.ts";
import { MessageCategory, MessageType, IsPinnedType } from "../enum/discord-enum.ts";

/**
 * Apply inverse logic to a filter condition
 * @param matches - Whether the condition matched
 * @param inverseActive - Whether inverse filtering is enabled
 * @returns true if message should be included, false otherwise
 */
export const applyInverseLogic = (
  matches: boolean,
  inverseActive: boolean,
): boolean => {
  return inverseActive ? !matches : matches;
};

export type TimeComparison = "before" | "after";

/**
 * Unified timestamp filter for both start and end time filtering
 * @param filterValue - The date to compare against
 * @param message - The message to filter
 * @param inverseActive - Whether inverse filtering is enabled
 * @param comparison - Whether to check if message is 'before' or 'after' the filter date
 */
export const filterByTimestamp = (
  filterValue: Date,
  message: Message,
  inverseActive: boolean,
  comparison: TimeComparison,
): boolean => {
  const messageDate = parseISO(message.timestamp);

  const matches =
    comparison === "after"
      ? isAfter(messageDate, filterValue) || isEqual(messageDate, filterValue) // Start time: message is after or equal to filter
      : isBefore(messageDate, filterValue) || isEqual(messageDate, filterValue); // End time: message is before or equal to filter

  return applyInverseLogic(matches, inverseActive);
};

/**
 * Text extractors for different filter types
 */
export type TextExtractor = (message: Message) => string | string[];

export const TextExtractors = {
  property: (propertyName: keyof Message | string) => (message: Message) => {
    // Handle special cases where the filter name doesn't directly map to a Message property
    if (propertyName === "userName") {
      return message.author?.username || "";
    }

    // Default: access property directly on message
    return String(message[propertyName as keyof Message] || "");
  },

  attachments: (message: Message) =>
    message.attachments.map((a) => a.filename).join(),

  contentAndEmbeds: (message: Message) => {
    const texts = [message.content];

    message.embeds?.forEach((embed) => {
      if (embed.type === "rich") {
        const embedTexts = [
          embed.author?.name,
          embed.author?.url,
          embed.description,
          embed.footer?.text,
          embed.title,
          embed.url,
          ...(embed.fields?.map((f) => f.name) || []),
          ...(embed.fields?.map((f) => f.value) || []),
        ].filter((text): text is string => typeof text === "string");
        texts.push(...embedTexts);
      }
    });

    return texts.filter(Boolean) as string[];
  },
};

/**
 * Helper to check if text contains search values
 */
export const createTextContainsCheck = (
  values: string | string[],
  text: string,
  caseSensitive = true,
): boolean => {
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchValues = Array.isArray(values) ? values : [values];

  return searchValues.some((val) => {
    const searchVal = caseSensitive ? val : val.toLowerCase();
    return searchText.includes(searchVal);
  });
};

/**
 * Unified text content filter
 */
export const filterByTextContent = (
  filterValue: string | string[],
  message: Message,
  inverseActive: boolean,
  extractor: TextExtractor,
  caseSensitive = true,
): boolean => {
  const extracted = extractor(message);
  const textArray = Array.isArray(extracted) ? extracted : [extracted];

  const matches = textArray.some((text) =>
    createTextContainsCheck(filterValue, text, caseSensitive),
  );

  return applyInverseLogic(matches, inverseActive);
};

/**
 * Filter messages by type
 */
export const filterMessageType = (
  filterValue: string[],
  message: Message,
  inverseActive: boolean,
  threads: Channel[],
): boolean => {
  const matches = filterValue.some(
    (fv) =>
      messageTypeEquals(message.type, fv as MessageType) ||
      (fv === MessageCategory.PINNED && message.pinned) ||
      (fv === MessageCategory.REACTIONS && !!message.reactions?.length) ||
      (fv === MessageCategory.THREAD &&
        threads.some((t) => t.id === message.channel_id)) ||
      (fv === MessageCategory.THREAD_STARTER && message.thread?.id),
  );
  return applyInverseLogic(matches, inverseActive);
};

/**
 * Filter messages by thread
 */
export const filterThread = (
  filterValue: string,
  message: Message,
  inverseActive: boolean,
): boolean => {
  const matches =
    message.channel_id === filterValue || message.thread?.id === filterValue;
  return applyInverseLogic(matches, inverseActive);
};

/**
 * Normalize a user-typed attachment extension to what Discord's
 * `attachment_extension` search param expects: trimmed, lowercase, no
 * leading dot. "  .PNG " → "png". Empty input stays empty (callers drop it).
 */
export const normalizeAttachmentExtension = (raw: string): string =>
  raw.trim().replace(/^\.+/, "").toLowerCase();

/**
 * Local counterpart of the `attachment_extension` / `attachment_filename`
 * search params, for the Refine layer and package mode where no server
 * search runs. Extensions match the end of any attachment filename
 * (case-insensitive); the filename term is a case-insensitive substring
 * match (looser than the server's exact match on purpose: it is the
 * "I roughly remember the name" complement).
 */
export const messageMatchesAttachmentCriteria = (
  attachments: ReadonlyArray<{ filename?: string }> | undefined,
  extensions: string[] | undefined,
  filename: string | null | undefined,
): boolean => {
  const exts = (extensions ?? []).map(normalizeAttachmentExtension).filter(Boolean);
  const term = filename?.trim().toLowerCase() ?? "";
  if (exts.length === 0 && term.length === 0) return true;
  const names = (attachments ?? []).map((a) => (a.filename ?? "").toLowerCase());
  if (exts.length > 0 && !names.some((n) => exts.some((e) => n.endsWith(`.${e}`)))) return false;
  if (term.length > 0 && !names.some((n) => n.includes(term))) return false;
  return true;
};

// ─── SearchCriteria active-filter counting (#195 cluster A) ────────────────
// Moved from the discrub consumer's src/utils/searchCriteria.ts. These are
// pure transforms over the SearchCriteria type with no consumer-state
// dependencies, so they fit cleanly alongside the rest of the filtering
// helpers and let any future discrub-core consumer (CLI, modded plugin,
// server-side tool) compute filter counts without re-implementing.

/**
 * Count the number of active filter axes on a SearchCriteria. Each
 * userId/mentionId/selectedHasType counts independently (so a 3-user
 * filter contributes 3), but isPinned, authorType, and the two date
 * bounds each count at most 1. Used for UI badges showing "N filters
 * active" + for the consumer's #178 milestone copy ("Loading all
 * filtered messages (N filters active)…").
 */
export const countActiveFilters = (criteria: SearchCriteria): number => {
  let count = 0;
  if (criteria.attachmentExtensions && criteria.attachmentExtensions.length > 0) {
    count += criteria.attachmentExtensions.length;
  }
  if (criteria.attachmentFilename) count++;
  if (criteria.searchMessageContents && criteria.searchMessageContents.length > 0) count += criteria.searchMessageContents.length;
  if (criteria.userIds && criteria.userIds.length > 0) count += criteria.userIds.length;
  if (criteria.selectedHasTypes && criteria.selectedHasTypes.length > 0) {
    count += criteria.selectedHasTypes.length;
  }
  if (criteria.searchAfterDate) count++;
  if (criteria.searchBeforeDate) count++;
  if (criteria.isPinned !== undefined && criteria.isPinned !== IsPinnedType.UNSET) count++;
  if (criteria.authorType) count++;
  if (criteria.mentionIds && criteria.mentionIds.length > 0) count += criteria.mentionIds.length;
  return count;
};

/**
 * Sum of active filters across a (search, refine) criteria pair. Used
 * by FilterModal's header chip to surface the combined filter count.
 */
export const countTotalFilters = (search: SearchCriteria, refine: SearchCriteria): number => {
  return countActiveFilters(search) + countActiveFilters(refine);
};

/**
 * True when at least one filter is active on a SearchCriteria. Null/
 * undefined inputs return false (used by code paths that check whether
 * a saved/restored criteria object is worth applying).
 */
export const hasActiveSearchFilters = (
  criteria: SearchCriteria | null | undefined,
): boolean => {
  if (!criteria) return false;
  return countActiveFilters(criteria) > 0;
};