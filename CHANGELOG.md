# Changelog

All notable changes to `discrub-core` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`DiscrubSetting.APP_DM_SORT_ORDER` + `DmSortOrder` enum (#248).** New
  Display setting for the consumer's DM list ordering: `recent` (default,
  most recent message first via snowflake-decoded `last_message_id`),
  `name` (alphabetical by conversation label), or `discord` (the API's
  own order). Storage values are stable strings.

## [1.0.9] - 2026-08-22

### Changed

- **`SearchCriteria.searchMessageContent` is now `searchMessageContents: string[]`,
  matched any-of (#244).** Discord's search takes one `content` term per
  request (a second `content` param is ignored), so `fetchSearchMessageData`
  issues one request per term at the same offset and merges the page
  (deduped by message id, `total_results` summed), and `iterateSearchResults`
  fetches the first page of every term up front as one merged page before
  draining each term's remaining cap-shifted pages. One or zero terms behave
  exactly as before. Consumers must rename the field; the helpers
  `isCriteriaActive` and `countActiveFilters` count each term.

### Added

- **`fetchAnnouncementArchive()`** reads the past-announcements archive gist
  (`index.json` plus one `<version>.md` per release) in a single request and
  resolves to `AnnouncementArchiveEntry[]`, newest first; any failure resolves
  to an empty list.
- **`AnnouncementArchiveEntry` type.**

## [1.0.8] - 2026-08-22

### Added

- **`DiscrubSetting.APP_THEME_ANIMATIONS` setting key.** New
  `DiscrubSetting` + `AppSettingsMap` entry backing the consumer app's
  "Theme animations" toggle (supporter theme accents, Discrub 2.1.0).
  Additive; existing settings are unchanged.
- **`fetchRevokedSupporterKeys()`.** Reads `revoked_keys.json` from the
  donation gist and resolves to the list of revoked supporter key ids. The
  file is a rare-remedy tool and normally absent, so a missing file resolves
  to an empty list rather than throwing.

## [1.0.7] - 2026-08-16

### Fixed

- **`entityIsImage` now recognizes webp filenames (#234).** The
  filename-extension fallback (used when an attachment carries no
  `content_type`) covered png/jpg/jpeg/gif but not webp, so a webp
  attachment without a content type was not classified as an image.

### Added

- **`DiscordService` `autoDelay` constructor option (#241).** `new
  DiscordService(settings, { autoDelay: false })` disables the service's
  built-in pre-request delays entirely, for consumers whose call sites pace
  themselves — previously such loops paid every delay twice (the service's
  pre-request sleep plus their own between-call sleep). Defaults to `true`,
  preserving self-pacing for adapter-driven flows (e.g. the enrichment
  services) that have no pacing of their own. The delay fields
  (`searchDelaySecs` etc.) are still populated from settings either way, so
  consumers that read them for their own pacing are unaffected.

## [1.0.6] - 2026-07-18

### Added

- **Search-indexing state on search results (#216).** Search responses now
  surface Discord's `doing_deep_historical_index` flag so consumers can warn
  when a still-indexing guild may return incomplete results.

### Changed

- **Bare image/gifv embeds render as inline media (#219).** Link-only image
  and gifv embeds format as Discord-style inline media instead of embed
  cards, with capped natural-size dimensions on bare images. Gifv
  playability is decided on the RESOLVED URL, so a downloaded local copy
  always plays even when the remote URL is a provider player page.

## [1.0.5] - 2026-06-27

### Added

- **`DiscordService.fetchGuildEmojis` (#202).** Fetches a guild's custom emoji
  set, backing the consumer's new bulk "Add Reactions" emoji picker.
- **`PollObject` type + `Message.poll` field (#213).** A typed poll payload so
  consumers can render poll questions and vote tallies without `as any` casts.

## [1.0.4] - 2026-05-29

### Added

- **`MessageFetchService.resolveMessageReplies` + `DiscrubSetting.REPLIES_ENABLED` (#194).**
  A reply-parent enrichment pass mirroring `resolveMessageReactions`: search
  results omit the referenced message body, so this backfills it. Gated behind
  the new opt-out setting.
- **Forwarded-message support (#197).** New `Message.message_snapshots` field +
  `MessageSnapshot` type, `MessageReferenceObject.type` (0 = reply, 1 = forward),
  and an `isForwardedMessage` helper so consumers can detect and render the
  forwarded snapshot's content, attachments, and embeds.
- **`textEmitter` + emitter-knob types promoted into the library (#195).** The
  plain-text export emitter and its supporting utilities, plus the shared
  emitter configuration types (`MediaMaps`, `ExportConfig`, `TextFormatOptions`,
  et al), now live in `lib/utils/export-utils` and `lib/types/export-types`.
- **SearchCriteria active-filter counters promoted into `lib/filtering` (#195).**
  `countActiveFilters`, `countTotalFilters`, and `hasActiveSearchFilters` are now
  exported from the library so consumers no longer maintain their own copies.

### Fixed

- **Raw HTML in message content is now escaped in `formatContentAsHtml` (#198).**
  Unescaped angle brackets in user content could open an HTML tag that never
  closed, cascading the rest of an HTML export sideways. The formatter now
  escapes raw content while preserving Discord's pseudo-tags via a
  placeholder-based pipeline.

## [1.0.3] - 2026-05-15

### Changed

- **`iterateSearchResults` always cap-shifts (#186 + #188).** Every
  iteration after the first sets `searchBeforeDate = oldestSeenTimestamp`,
  narrowing the upper bound past everything yielded so far. Discord's
  `max_id` is exclusive, so previously-yielded messages are structurally
  unreachable on subsequent calls. Live-verified on a 9-channel purge
  with 234 deletes and 41 skips and zero anomalies; every channel's
  per-batch tally exactly matches Discord's `total_results`.

- User-supplied `searchAfterDate` becomes a hard lower bound: when the
  cap-shift snowflake would drop to or below it, the iterator
  terminates cleanly instead of issuing a wasted call.

### Removed

- **`terminateOnDedupEmpty?: boolean` option** (added in 1.0.2) is no
  longer needed and has been removed. The new unconditional cap-shift
  rule subsumes both behaviors: the consumer no longer has to pick
  between "stop on dedup-empty" and "walk past it", because the
  iterator can no longer produce a dedup-empty page in the first place
  (the bound shrinks every iteration).

- **`crossedQueryBoundary` field on `SearchIterationPage`** is removed.
  The cap-shift formulation makes the concept meaningless: the boundary
  shifts on every iteration. Consumers that previously branched on this
  field should treat every page as a cap-shifted page.

- Internal five-flag pagination state (`offset`, `pendingReset`,
  `consecutiveEmptyPages`, `wastedResets`, `prevTotalResults`) collapses
  to one boundary advance per page plus a 2-consecutive-empty-response
  terminator. The 5000-cap-cross branch and wasted-resets safety valve
  are gone. The in-memory `seen` Set is gone.

### Preserved

- The incomplete-page synthetic yield (95% retention threshold above
  100 totalResults) is preserved, so genuine Discord-side index churn
  still surfaces an `incomplete: true` page that consumers can warn on.

### Notes

This release subsumes the #186 cap-shift-on-reset fix originally filed
as a separate item: scorpihoe-420's 20,550-match channel that quit at
98 deleted / 22 skipped is covered by the same advance-on-every-iteration
rule that #188 introduced.

## [1.0.2] - 2026-05-10

### Added

- **`terminateOnDedupEmpty?: boolean` option on `iterateSearchResults`**
  (default `true` to preserve existing purge behavior). When `false`,
  the iterator no longer terminates after two consecutive dedup-empty
  pages; instead it keeps walking via offset advances + resets until
  either `aggregatedCount` reaches `totalResults` or a safety valve
  fires (5 consecutive resets that fail to advance the aggregated
  count). On safety-valve trip the iterator yields one final synthetic
  page with `incomplete: true` so the consumer can surface a clear
  "stopped early" warning instead of silently producing partial data.
  Read-only consumers (bulk export) should pass `false`; purge-style
  consumers that delete and re-search should keep the default. Driven
  by a real-world bulk export that stalled at 500 of 2,311 matches
  with no warning.

- **`MessageFetchService.resolveMessageReactions` is now public.**
  Promotes the previously-private reaction-enrichment primitive so
  consumers paginating search results page-by-page can apply reaction
  enrichment to each page as it lands, without re-implementing the
  AROUND-window dedup. Behavior is unchanged; internal callers (e.g.
  `fetchMessages`) use the same code path. Five new tests pin the
  public surface: AROUND-window population, per-call `?around=` use,
  within-pass dedup via `trackMap`, `shouldStop` partial-enrichment
  semantics, and the `reactions = undefined` outcome on a failed
  AROUND fetch.

- **`postMessage`, `addReaction`, `pinMessage` on `DiscordService`.**
  Three Discord API methods that were missing from the lib but needed
  by consumer code (Discrub's seed-messages dev tool). All three
  route through the existing `withRetry` wrapper so 429 backoff is
  transparent, matching the guarantee already provided by
  `editMessage` / `deleteMessage`. `pinMessage` uses a new private
  `put<T>` helper. `MessageCreate` is a new minimal type for the
  create-message body (`content`, `message_reference`,
  `allowed_mentions`, `tts`, `flags`); the surface stays narrow until
  a consumer needs more. Tests cover the PUT path's typical 204
  return and the 50-pin-cap 403, `postMessage` with both plain
  content and reply shape, and `addReaction`'s URL-encoding of the
  emoji.

## [1.0.1] - 2026-05-01

### Fixed

- **Search iterator no longer terminates early on large match sets.**
  `iterateSearchResults` previously bailed out after Discord returned a
  short page (`< 25` results), even when far more matches still
  existed. Per Discord's own docs ("Search may return slightly fewer
  results than the limit specified... Clients should not rely on the
  length of the messages array to paginate"), short pages are not a
  reliable end-of-data signal. Termination now waits for two
  consecutive resets that yield zero new unique IDs. This was the root
  cause of a user-reported r/discrub bug where a 24,314-match purge
  stopped at 31 deletions.

- **5000-cap continuation now uses the correct query field.**
  When a search hit Discord's 5000-result cap, the iterator continued
  the next query window using `searchAfterDate` (= `min_id`, the
  *lower* bound), which re-queried the already-walked range. The fix
  uses `searchBeforeDate` (= `max_id`, the *upper* bound) of the
  oldest seen message, walking strictly forward into older results.
  Did not affect users below the 5000 cap; will affect anyone above
  it.

- **Index-reshuffle reset is now self-detected via `total_results`
  change.** Previously the consumer had to signal a reset between
  delete batches via `onBetweenPages: () => 'reset'`. The iterator
  now watches Discord's `total_results` field across pages and
  resets to `offset=0` of the same query when it shifts. The
  caller-provided `'reset'` signal remains supported as a safety
  hatch for tests and future consumers.

- **`202 Accepted` (`retry_after`) responses from Discord's search
  endpoint are now handled.** When the search index has not yet been
  built for a freshly-imported or recently-rebuilt channel, Discord
  returns `202` with a `retry_after` duration. The iterator now
  sleeps the indicated duration and retries the same fetch instead
  of treating the response as a failure.

- **Trailing search loop on fully-deduplicated pages.** A separate
  fix on top of the rewrite: when Discord kept returning the same
  set of (already-seen) messages — typically system messages like
  type-21 thread starters — the previous "rawCount === 0"
  termination check looped forever. Now keys off `pageMessages.length
  === 0` after dedup, so the loop terminates cleanly even when
  Discord is repeatedly returning the same dedup-eaten results.

### Internal

- 16 new iterator-focused tests cover all of the above scenarios:
  total-results-shift reset, short-page-doesn't-terminate, cap
  continuation field correctness, user-supplied `searchBeforeDate`
  preservation, cap-shift-below-user-min termination, empty-initial,
  index-lag dedup termination, mid-loop `shouldStop`, `202` retry,
  and dedup-eaten page termination.

## [1.0.0] - 2026-04-27

Initial release on npm. Renamed from the internal `discrub-lib`
package. See `memory/project_discrub_core_publish.md` in the
consumer repo for the full migration history (security sweep,
license posture, version rationale, build hygiene additions).