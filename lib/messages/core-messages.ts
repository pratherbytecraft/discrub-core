/**
 * User-facing strings produced inside discrub-core (progress lines and
 * permission notices). The library ships English defaults; a host app
 * that localizes its UI can replace any entry with `setCoreMessages`
 * and the services pick the replacement up on the next call. Keeping
 * the catalog here (instead of message codes) leaves every existing
 * `onStatus` / `notify` consumer working unchanged.
 */
export interface CoreMessages {
  retrievedThreads: (count: number) => string;
  retrievedSearchResults: (count: number, total: number) => string;
  retrievedMessages: (count: number) => string;
  retrievingThreadMessages: (threadName: string) => string;
  searchingReactions: (index: number, total: number) => string;
  resolvingReplyParents: (index: number, total: number) => string;
  retrievingReactionUsers: (
    emojiName: string,
    index: number,
    total: number,
    isCustom: boolean,
  ) => string;
  retrievingUserAlias: (user: string) => string;
  retrievingServerData: (user: string) => string;
  permissionMissingSkippingEdit: () => string;
  noPermissionToModifyMessage: () => string;
  noPermissionToModifyLocation: () => string;
  unableToRemoveReaction: (user: string) => string;
  // 1.0.20: the words the plain text export writes around a message, and the
  // stand-in name for a user nothing is known about.
  unknownUser: () => string;
  textUnknownAuthor: () => string;
  /** The tag after a bot's name, without the leading space. */
  textBotTag: () => string;
  /** The part after the sent time, without the leading comma and space. */
  textEdited: (time: string) => string;
  textReplyUnavailable: () => string;
  textReplyTo: (author: string) => string;
  textReplyNoContent: () => string;
  /** The stand-in file name for an attachment that has none. */
  textAttachmentName: () => string;
  textAttachment: (filename: string, target: string) => string;
  textReactions: (list: string) => string;
  textSystemEvent: () => string;
  textForwarded: () => string;
}

export const DEFAULT_CORE_MESSAGES: CoreMessages = {
  retrievedThreads: (count) => `Retrieved ${count} threads`,
  retrievedSearchResults: (count, total) =>
    `Retrieved ${count} of ${total} search results`,
  retrievedMessages: (count) => `Retrieved ${count} messages`,
  retrievingThreadMessages: (threadName) =>
    `Retrieving messages from thread: ${threadName}`,
  searchingReactions: (index, total) =>
    `Searching reactions (${index}/${total})`,
  resolvingReplyParents: (index, total) =>
    `Resolving reply parents (${index}/${total})`,
  retrievingReactionUsers: (emojiName, index, total, isCustom) =>
    `Retrieving reaction users for ${emojiName} (${index}/${total}) ${isCustom ? "[custom]" : ""}`,
  retrievingUserAlias: (user) => `Retrieving user alias for ${user}`,
  retrievingServerData: (user) => `Retrieving server data for ${user}`,
  permissionMissingSkippingEdit: () =>
    "Permission missing for message, skipping edit",
  noPermissionToModifyMessage: () =>
    "You do not have permission to modify this message!",
  noPermissionToModifyLocation: () =>
    "You do not have permission to modify content in this location, skipping",
  unableToRemoveReaction: (user) => `Unable to remove reaction from ${user}`,
  unknownUser: () => "Unknown User",
  textUnknownAuthor: () => "Unknown",
  textBotTag: () => "[BOT]",
  textEdited: (time) => `edited ${time}`,
  textReplyUnavailable: () => "(referenced message unavailable)",
  textReplyTo: (author) => `reply to @${author}`,
  textReplyNoContent: () => "(no content)",
  textAttachmentName: () => "attachment",
  textAttachment: (filename, target) => `[Attachment: ${filename} \u2014 ${target}]`,
  textReactions: (list) => `Reactions: ${list}`,
  textSystemEvent: () => "system event",
  textForwarded: () => "[Forwarded]",
};

let current: CoreMessages = { ...DEFAULT_CORE_MESSAGES };

/** Replace some or all catalog entries. Omitted keys keep the current text. */
export function setCoreMessages(overrides: Partial<CoreMessages>): void {
  current = { ...current, ...overrides };
}

/** Restore the English defaults (tests, or a host switching back to English). */
export function resetCoreMessages(): void {
  current = { ...DEFAULT_CORE_MESSAGES };
}

/** Current catalog. Read at call time so overrides apply immediately. */
export function coreMessages(): CoreMessages {
  return current;
}
