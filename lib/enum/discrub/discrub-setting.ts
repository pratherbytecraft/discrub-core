export enum DiscrubSetting {
  // Extension Use Only
  BROWSER_ENV = "browserEnv",
  //

  REACTIONS_ENABLED = "reactionsEnabled",
  REPLIES_ENABLED = "repliesEnabled",
  SERVER_NICKNAME_LOOKUP = "serverNickNameLookup",
  DISPLAY_NAME_LOOKUP = "displayNameLookup",
  SEARCH_DELAY = "searchDelay2",
  DELETE_DELAY = "deleteDelay2",
  DELAY_MODIFIER = "delayModifier2",
  DATE_FORMAT = "dateFormat",
  TIME_FORMAT = "timeFormat",

  EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS = "exportSeparateThreadAndForumPosts",
  EXPORT_ARTIST_MODE = "exportUseArtistMode",
  EXPORT_MESSAGE_SORT_ORDER = "exportMessageSortOrder",
  EXPORT_PREVIEW_MEDIA = "exportPreviewMedia_2",
  EXPORT_DOWNLOAD_MEDIA = "exportDownloadMedia_2",
  EXPORT_MESSAGES_PER_PAGE = "exportMessagesPerPage",
  PURGE_RETAIN_ATTACHED_MEDIA = "purgeRetainAttachedMedia",
  PURGE_DELETE_ATTACHMENTS_ONLY = "purgeDeleteAttachmentsOnly",
  PURGE_REACTION_REMOVAL_FROM = "purgeReactionRemovalFrom",
  PURGE_MODE = "purgeMode",

  APP_SHOW_KOFI_FEED = "appShowKoFiFeed",
  APP_USER_DATA_REFRESH_RATE = "appUserDataRefreshRate",
  APP_THEME_MODE = "appThemeMode",
  APP_THEME_ANIMATIONS = "appThemeAnimations",
  APP_DM_SORT_ORDER = "appDmSortOrder",

  EXPORT_MEDIA_IMAGES = "exportMediaImages",
  EXPORT_MEDIA_VIDEOS = "exportMediaVideos",
  EXPORT_MEDIA_AUDIO = "exportMediaAudio",
  EXPORT_MEDIA_OTHER = "exportMediaOther",
  EXPORT_FORMAT = "exportFormat",
  EXPORT_PRESETS = "exportPresets",
  EXPORT_RECENT_HISTORY = "exportRecentHistory",
  EXPORT_TEMPLATE = "exportTemplate",

  CACHED_USER_MAP = "cachedUserMap",
  CACHED_ANNOUNCEMENT_REV = "cachedAnnouncementRev",

  APP_TOUR_SHELL_COMPLETED = "appTourShellCompleted",
  APP_TOUR_CONTEXTUAL_COMPLETED = "appTourContextualCompleted",

  /** UI language code ("en", "de"); empty until first resolved. */
  APP_LANGUAGE = "appLanguage",
  /** "true" to pause long operations for a rest break on a fixed cadence. */
  REST_BREAKS = "restBreaks",
  /** Seconds to wait before the first retry of a failed request; doubles each retry. */
  RETRY_WAIT = "retryWait",
  /** The host's screen layout: classic, native, workbench, simple, operator or timeline. */
  APP_LAYOUT = "appLayout",
  /** "true" to show the Scrublings, the pixel characters on the host's top bar. */
  APP_SCRUBLINGS_ENABLED = "appScrublingsEnabled",
  /** JSON list of the picked Scrubling ids, in order, at most three. */
  APP_SCRUBLINGS_PICKED = "appScrublingsPicked",
  /** JSON map of Scrubling id to its dragged position as a fraction of the bar's free stretch. */
  APP_SCRUBLINGS_POSITIONS = "appScrublingsPositions",
  /** JSON look of the person's own Scrubling (name, body, skin, hair, clothes, held items). "{}" means not set up. */
  APP_SCRUBLINGS_AVATAR = "appScrublingsAvatar",
  /** JSON list of the Scrubling cosmetic items the person has earned. */
  APP_SCRUBLINGS_UNLOCKS = "appScrublingsUnlocks",
  /** JSON counters of what the person has done in the app, read by the host to earn Scrubling items. */
  APP_SCRUBLINGS_COUNTERS = "appScrublingsCounters",
}
