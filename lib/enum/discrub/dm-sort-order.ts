/**
 * Orderings for the consumer's DM conversation list (#248). Values are
 * persisted in AppSettings, so they are stable storage strings — rename
 * the member, never the value.
 */
export enum DmSortOrder {
  /** Most recent message first (snowflake-decoded `last_message_id`). */
  RECENT = "recent",
  /** Alphabetical by the conversation's display label. */
  NAME = "name",
  /** Exactly as Discord's API returned the channels. */
  DISCORD = "discord",
}
