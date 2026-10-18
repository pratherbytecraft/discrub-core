export enum HasType {
  EMBED = "embed",
  FILE = "file",
  /** Forwarded messages. Discord's search enum calls them `snapshot` (after `message_snapshots`); `forward` is refused with a 400 (found live 2026-10-19). */
  FORWARD = "snapshot",
  IMAGE = "image",
  LINK = "link",
  POLL = "poll",
  SOUND = "sound",
  STICKER = "sticker",
  VIDEO = "video",
}
