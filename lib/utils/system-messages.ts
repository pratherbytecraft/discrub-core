import type { Message } from "../types/discord/message";
import type { User } from "../types/discord/user";

/**
 * System-message formatting helpers.
 *
 * Discord's client renders non-default message types as stylized one-liners
 * ("Alice pinned a message to this channel." etc.). The templates are
 * documented at https://docs.discord.food/resources/message under
 * "Rendered Content" — these functions mirror them for both the in-app
 * feed and the HTML export pipeline.
 *
 * Output strings use Discord-style `**bold**` markdown for the author name
 * and other emphasized tokens, so callers can pipe the result through the
 * existing `formatContentAsHtml`/markdown renderer and get consistent
 * styling.
 */

/**
 * Semantic bucket for a system message. Consumed by the feed to pick an
 * icon; purely presentational. Message types that produce the same icon
 * share a kind (e.g. all four boost tiers → `BOOST`).
 */
export enum SystemMessageKind {
  RECIPIENT_ADD = "recipientAdd",
  RECIPIENT_REMOVE = "recipientRemove",
  CALL = "call",
  CHANNEL_EDIT = "channelEdit",
  PIN = "pin",
  JOIN = "join",
  BOOST = "boost",
  CHANNEL_FOLLOW = "channelFollow",
  DISCOVERY = "discovery",
  THREAD = "thread",
  INVITE_REMINDER = "inviteReminder",
  AUTO_MOD = "autoMod",
  ROLE_SUBSCRIPTION = "roleSubscription",
  PREMIUM_UPSELL = "premiumUpsell",
  STAGE = "stage",
  APP_PREMIUM = "appPremium",
  INCIDENT = "incident",
  PURCHASE = "purchase",
  POLL_RESULT = "pollResult",
  OTHER = "other",
}

export type SystemMessageDescriptor = {
  kind: SystemMessageKind;
  /** Rendered string with Discord-style `**bold**` markdown already applied. */
  text: string;
  /**
   * True when the payload's meaning lives in `message.embeds[0]` rather
   * than a template string — specifically AUTO_MODERATION_ACTION and
   * POLL_RESULT. Caller should render the embed beneath (or in place of)
   * the notice line.
   */
  showEmbed?: boolean;
};

/** Values a system message template is filled with. Names are already bold. */
export type SystemMessageParams = Record<string, string | number>;

export type FormatSystemMessageOptions = {
  /** Guild display name, for boost-tier and incident templates. */
  guildName?: string;
  /**
   * Optional translator. Called with `systemMessage.<name>` and the
   * template values (author, mention and other names already wrapped in
   * `**bold**`); its result replaces the English line. Returning
   * undefined, or the key itself, keeps the English line, so a host with
   * a partial catalog still gets text. Unset, the output is English.
   * Keys are listed in `SYSTEM_MESSAGE_KEYS`.
   */
  translate?: (key: string, params: SystemMessageParams) => string | undefined;
};

/**
 * Every key `formatSystemMessage` asks `translate` for, with the English
 * template it falls back to. `{name}` marks a value from the params.
 * Join lines are `systemMessage.join_0` to `systemMessage.join_12`.
 */
export const SYSTEM_MESSAGE_KEYS: Readonly<Record<string, string>> = {
  "systemMessage.recipientAdd": "{author} added {mention} to the group.",
  "systemMessage.recipientRemove": "{author} removed {mention} from the group.",
  "systemMessage.call": "{author} started a call.",
  "systemMessage.callLasted": "{author} started a call — lasted {duration}.",
  "systemMessage.channelName": "{author} changed the channel name: {name}.",
  "systemMessage.channelNameRemoved": "{author} removed the channel name.",
  "systemMessage.channelIcon": "{author} changed the channel icon.",
  "systemMessage.pin": "{author} pinned a message to this channel. See all pinned messages.",
  "systemMessage.boost": "{author} just boosted the server!",
  "systemMessage.boostCount": "{author} just boosted the server {times}!",
  "systemMessage.boostTier": "{author} just boosted the server! {guild} has achieved {level}!",
  "systemMessage.channelFollow": "{author} has added {name} to this channel. Its most important updates will show up here.",
  "systemMessage.channelFollowUnnamed": "{author} has added a channel follow.",
  "systemMessage.discoveryDisqualified": "This server has been removed from Server Discovery because it no longer meets the requirements.",
  "systemMessage.discoveryRequalified": "This server is eligible for Server Discovery again and has been re-added.",
  "systemMessage.discoveryWarningInitial": "This server has failed Discovery activity requirements for 1 week. If it fails for 4 weeks in a row, it will be automatically removed from Discovery.",
  "systemMessage.discoveryWarningFinal": "This server has failed Discovery activity requirements for 3 weeks in a row. If it fails for 1 more week, it will be removed from Discovery.",
  "systemMessage.threadCreated": "{author} started a thread: {thread}. See all threads.",
  "systemMessage.inviteReminder": "Wondering who to invite? Start by inviting anyone who can help you build the server!",
  "systemMessage.autoMod": "AutoMod flagged a message.",
  "systemMessage.roleJoined": "{author} joined {tier}.",
  "systemMessage.roleRenewed": "{author} renewed {tier}.",
  "systemMessage.roleJoinedMonth": "{author} joined {tier} ({months} month).",
  "systemMessage.roleRenewedMonth": "{author} renewed {tier} ({months} month).",
  "systemMessage.roleJoinedMonths": "{author} joined {tier} ({months} months).",
  "systemMessage.roleRenewedMonths": "{author} renewed {tier} ({months} months).",
  "systemMessage.roleUnnamed": "a role",
  "systemMessage.premiumUpsell": "Upgrade for premium features.",
  "systemMessage.stageStart": "{author} started {stage}.",
  "systemMessage.stageStartUnnamed": "a stage",
  "systemMessage.stageEnd": "{author} ended {stage}.",
  "systemMessage.stageEndUnnamed": "the stage",
  "systemMessage.stageSpeaker": "{author} is now a speaker.",
  "systemMessage.stageTopic": "{author} changed the Stage topic: {topic}.",
  "systemMessage.stageTopicNone": "(no topic)",
  "systemMessage.appPremium": "{author} upgraded an app to premium.",
  "systemMessage.incidentEnabledUntil": "{author} enabled security actions until {until}.",
  "systemMessage.incidentEnabled": "{author} enabled security actions.",
  "systemMessage.incidentDisabled": "{author} disabled security actions.",
  "systemMessage.incidentRaid": "{author} reported a raid in {guild}.",
  "systemMessage.incidentFalseAlarm": "{author} reported a false alarm in {guild}.",
  "systemMessage.purchase": "{author} has made a purchase.",
  "systemMessage.pollResult": "Poll results",
  "systemMessage.other": "System event (type {type}).",
  "systemMessage.unknownAuthor": "Unknown",
  "systemMessage.theServer": "the server",
  "systemMessage.thread": "thread",
};

/**
 * The 13 USER_JOIN welcome lines Discord rotates through. Selection is
 * deterministic: `(parseInt(timestamp_ms) % 13)`. Documented at
 * https://docs.discord.food/resources/message — types array table.
 */
export const USER_JOIN_VARIANTS: readonly string[] = [
  "{author} joined the party.",
  "{author} is here.",
  "Welcome, {author}. We hope you brought pizza.",
  "A wild {author} appeared.",
  "{author} just landed.",
  "{author} just slid into the server.",
  "{author} just showed up!",
  "Welcome {author}. Say hi!",
  "{author} hopped into the server.",
  "Everyone welcome {author}!",
  "Glad you're here, {author}.",
  "Good to see you, {author}.",
  "Yay you made it, {author}!",
];

/**
 * Types that should render as normal messages (not system notices):
 * - 0  DEFAULT
 * - 19 REPLY (has reply-bar UI)
 * - 20 CHAT_INPUT_COMMAND (user-sent slash command; `content` is real)
 * - 21 THREAD_STARTER_MESSAGE (parent of a thread; `referenced_message.content`)
 * - 23 CONTEXT_MENU_COMMAND (similar to 20)
 */
const NON_SYSTEM_TYPES = new Set<number>([0, 19, 20, 21, 23]);

export const isSystemMessageType = (
  type: number | undefined | null,
): boolean =>
  type !== undefined && type !== null && !NON_SYSTEM_TYPES.has(type);

/**
 * Returns a descriptor for rendering the given message as a Discord-style
 * system notice, or `null` when the message should be rendered as a normal
 * message (type 0/19/20/21/23).
 */
export function formatSystemMessage(
  message: Message,
  options: FormatSystemMessageOptions = {},
): SystemMessageDescriptor | null {
  const { type } = message;
  if (!isSystemMessageType(type)) return null;

  const tx = (name: string, params: SystemMessageParams = {}): string => {
    const key = `systemMessage.${name}`;
    const translated = options.translate?.(key, params);
    if (translated && translated !== key) return translated;
    const template = name.startsWith("join_")
      ? USER_JOIN_VARIANTS[Number(name.slice(5))]
      : SYSTEM_MESSAGE_KEYS[key];
    return template.replace(/\{(\w+)\}/g, (match, p: string) =>
      p in params ? String(params[p]) : match,
    );
  };

  const author = bold(getAuthorDisplay(message.author) ?? tx("unknownAuthor"));
  const mention = bold(getMentionDisplay(message.mentions?.[0]));
  const content = message.content ?? "";
  const guild = bold(options.guildName || tx("theServer"));
  const thread = bold(message.thread?.name || content || tx("thread"));

  switch (type) {
    case 1: // RECIPIENT_ADD
      return { kind: SystemMessageKind.RECIPIENT_ADD, text: tx("recipientAdd", { author, mention }) };
    case 2: // RECIPIENT_REMOVE
      return { kind: SystemMessageKind.RECIPIENT_REMOVE, text: tx("recipientRemove", { author, mention }) };
    case 3: {
      // CALL — message.call?.ended_timestamp gives call duration when ended.
      const duration = formatCallDuration(message);
      return {
        kind: SystemMessageKind.CALL,
        text: duration ? tx("callLasted", { author, duration }) : tx("call", { author }),
      };
    }
    case 4: // CHANNEL_NAME_CHANGE
      return {
        kind: SystemMessageKind.CHANNEL_EDIT,
        text: content
          ? tx("channelName", { author, name: bold(content) })
          : tx("channelNameRemoved", { author }),
      };
    case 5: // CHANNEL_ICON_CHANGE
      return { kind: SystemMessageKind.CHANNEL_EDIT, text: tx("channelIcon", { author }) };
    case 6: // CHANNEL_PINNED_MESSAGE
      // userdoccers lists "{author} pinned a message to this channel." but
      // Discord's actual client appends the "See all pinned messages." link
      // after the sentence. We include it here so the renderer can linkify
      // consistently across PIN (type 6) and THREAD_CREATED (type 18).
      return { kind: SystemMessageKind.PIN, text: tx("pin", { author }) };
    case 7:
      // USER_JOIN — (timestamp_ms % 13) picks one of 13 variants.
      return {
        kind: SystemMessageKind.JOIN,
        text: tx(`join_${pickJoinVariantIndex(message.timestamp)}`, { author }),
      };
    case 8:
      // GUILD_BOOST — content holds the streak count when present.
      return {
        kind: SystemMessageKind.BOOST,
        text: content
          ? tx("boostCount", { author, count: content, times: bold(`${content} times`) })
          : tx("boost", { author }),
      };
    case 9:
    case 10:
    case 11: {
      // GUILD_BOOST_TIER_{1,2,3}
      const tier = type - 8; // 9→1, 10→2, 11→3
      return {
        kind: SystemMessageKind.BOOST,
        text: tx("boostTier", { author, guild, tier, level: bold(`Level ${tier}`) }),
      };
    }
    case 12: // CHANNEL_FOLLOW_ADD
      return {
        kind: SystemMessageKind.CHANNEL_FOLLOW,
        text: content
          ? tx("channelFollow", { author, name: bold(content) })
          : tx("channelFollowUnnamed", { author }),
      };
    case 14: // GUILD_DISCOVERY_DISQUALIFIED
      return { kind: SystemMessageKind.DISCOVERY, text: tx("discoveryDisqualified") };
    case 15: // GUILD_DISCOVERY_REQUALIFIED
      return { kind: SystemMessageKind.DISCOVERY, text: tx("discoveryRequalified") };
    case 16: // GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING
      return { kind: SystemMessageKind.DISCOVERY, text: tx("discoveryWarningInitial") };
    case 17: // GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING
      return { kind: SystemMessageKind.DISCOVERY, text: tx("discoveryWarningFinal") };
    case 18: // THREAD_CREATED
      return { kind: SystemMessageKind.THREAD, text: tx("threadCreated", { author, thread }) };
    case 22: // GUILD_INVITE_REMINDER
      return { kind: SystemMessageKind.INVITE_REMINDER, text: tx("inviteReminder") };
    case 24: // AUTO_MODERATION_ACTION
      return { kind: SystemMessageKind.AUTO_MOD, text: tx("autoMod"), showEmbed: true };
    case 25: {
      // ROLE_SUBSCRIPTION_PURCHASE
      const data = message.role_subscription_data;
      const tierLabel = bold(data?.tier_name || tx("roleUnnamed"));
      const months = data?.total_months_subscribed;
      const name = data?.is_renewal ? "roleRenewed" : "roleJoined";
      return {
        kind: SystemMessageKind.ROLE_SUBSCRIPTION,
        text: months
          ? tx(`${name}${months === 1 ? "Month" : "Months"}`, { author, tier: tierLabel, months })
          : tx(name, { author, tier: tierLabel }),
      };
    }
    case 26: // INTERACTION_PREMIUM_UPSELL
      return { kind: SystemMessageKind.PREMIUM_UPSELL, text: content || tx("premiumUpsell") };
    case 27: // STAGE_START
      return {
        kind: SystemMessageKind.STAGE,
        text: tx("stageStart", { author, stage: bold(content || tx("stageStartUnnamed")) }),
      };
    case 28: // STAGE_END
      return {
        kind: SystemMessageKind.STAGE,
        text: tx("stageEnd", { author, stage: bold(content || tx("stageEndUnnamed")) }),
      };
    case 29: // STAGE_SPEAKER
      return { kind: SystemMessageKind.STAGE, text: tx("stageSpeaker", { author }) };
    case 31: // STAGE_TOPIC
      return {
        kind: SystemMessageKind.STAGE,
        text: tx("stageTopic", { author, topic: bold(content || tx("stageTopicNone")) }),
      };
    case 32: // GUILD_APPLICATION_PREMIUM_SUBSCRIPTION
      return { kind: SystemMessageKind.APP_PREMIUM, text: tx("appPremium", { author }) };
    case 36: // GUILD_INCIDENT_ALERT_MODE_ENABLED
      return {
        kind: SystemMessageKind.INCIDENT,
        text: content
          ? tx("incidentEnabledUntil", { author, until: bold(content) })
          : tx("incidentEnabled", { author }),
      };
    case 37: // GUILD_INCIDENT_ALERT_MODE_DISABLED
      return { kind: SystemMessageKind.INCIDENT, text: tx("incidentDisabled", { author }) };
    case 38: // GUILD_INCIDENT_REPORT_RAID
      return { kind: SystemMessageKind.INCIDENT, text: tx("incidentRaid", { author, guild }) };
    case 39: // GUILD_INCIDENT_REPORT_FALSE_ALARM
      return { kind: SystemMessageKind.INCIDENT, text: tx("incidentFalseAlarm", { author, guild }) };
    case 44: // PURCHASE_NOTIFICATION
      return { kind: SystemMessageKind.PURCHASE, text: tx("purchase", { author }) };
    case 46: // POLL_RESULT
      return { kind: SystemMessageKind.POLL_RESULT, text: tx("pollResult"), showEmbed: true };
    default:
      // Future/unknown types — render a safe placeholder so the row
      // isn't silently blank.
      return { kind: SystemMessageKind.OTHER, text: tx("other", { type }) };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const bold = (s: string | undefined | null): string => (s ? `**${escapeMarkdown(s)}**` : "");

// Only escape `*` and `_` so the author's own name can't accidentally open
// markdown around the intended boldness. Everything else stays literal.
const escapeMarkdown = (s: string): string => s.replace(/([*_])/g, "\\$1");

const getAuthorDisplay = (user: User | undefined): string | undefined =>
  user?.global_name || user?.username || undefined;

const getMentionDisplay = (user: User | undefined): string | undefined => {
  if (!user) return undefined;
  return user.global_name || user.username || undefined;
};

/**
 * Deterministic USER_JOIN variant index: `(parseInt(timestamp_ms) % 13)`.
 * Mirrors Discord's client. For an ISO-8601 timestamp we convert to ms
 * epoch; for anything unparseable we fall back to variant 0.
 */
const pickJoinVariantIndex = (timestamp: string | undefined): number => {
  if (!timestamp) return 0;
  const ms = new Date(timestamp).getTime();
  if (!Number.isFinite(ms)) return 0;
  return ((ms % USER_JOIN_VARIANTS.length) + USER_JOIN_VARIANTS.length) % USER_JOIN_VARIANTS.length;
};

/**
 * Format the duration of a call from `message.call`. Returns e.g. "2m 14s"
 * when the call has ended, or undefined for still-in-progress calls.
 */
const formatCallDuration = (message: Message): string | undefined => {
  const call = message.call;
  if (!call?.ended_timestamp) return undefined;
  const startMs = new Date(message.timestamp).getTime();
  const endMs = new Date(call.ended_timestamp).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;
  const diffSec = Math.max(0, Math.round((endMs - startMs) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  if (minutes < 60) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
};
