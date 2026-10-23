export class MessageRegex {
  public static readonly BOLD = /\*\*(?<text>[^*]+)(?=(\*\*))\*\*/g;
  public static readonly LINK =
    /(?:(?<name>\[[^\]]+\])(?<url>\([^ )]+)?(?<description>[^[]*(?=(?:'|")\))'\))?)/g;
  public static readonly QUOTE = /`(?<text>[^`]+)(?=(`))`/g;
  public static readonly CHANNEL_MENTION = /<#(?<channel_id>\d+)>/g;
  public static readonly HYPER_LINK = /(^|\s)(http(s)?:\/\/)+[^\s]+(?=[\s])?/g;
  public static readonly UNDER_LINE = /__(?<text>[^_]+)(?=(__))__/g;
  public static readonly ITALICS =
    /(_|\*)(?<text>[^_*]+)(?=((_|\*)(\s|$)))(_|\*)/g;
  public static readonly STRIKETHROUGH = /~~(?<text>[^~]+)(?=(~~))~~/g;
  public static readonly SPOILER = /\|\|(?<text>[^|]+)(?=(\|\|))\|\|/g;
  public static readonly CODE = /```(?<text>[^]+)(?=(```))```/g;
  public static readonly USER_MENTION = /<@(?:&|!)?(?<user_id>[0-9]+)>/g;
  public static readonly EMOJI = /<a:[^<>]+:[0-9]+>|<:[^<>]+:[0-9]+>/g;
  public static readonly WINDOWS_INVALID_CHARACTERS =
    /\[|<|>|:|"|\/|\\|\||\?|\*|\]/g;
  // Discord headings (# ## ### at start of line)
  public static readonly HEADING = /^(?<hashes>#{1,3})\s+(?<text>.+)$/gm;
  // Discord auto-linked URLs <https://...>
  public static readonly AUTO_LINK = /<(?<url>https?:\/\/[^>]+)>/g;
  // Discord timestamps <t:unix> and <t:unix:style>, style one of t T d D f F R
  public static readonly TIMESTAMP = /<t:(?<unix>\d{1,13})(?::(?<style>[tTdDfFR]))?>/g;
  // Discord subtext (-# at start of line), small muted text
  public static readonly SUBTEXT = /^-#\s+(?<text>.+)$/gm;
}
