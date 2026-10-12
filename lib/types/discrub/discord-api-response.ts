export type DiscordApiResponse<T = void> = {
  success: boolean;
  status?: number;
  data?: T;
  /**
   * Set when the request was abandoned because Discord kept answering
   * 429 (#254): the retry_after exceeded the configured cap, or the
   * consecutive-429 limit was reached. `status` is 429 in that case.
   */
  rateLimited?: boolean;
  /**
   * Discord's JSON error code on a failed response, when the body had one
   * (eg. 10003 Unknown Channel, 10008 Unknown Message, 50001 Missing Access).
   */
  code?: number;
  /** The last retry_after Discord asked for, in seconds. */
  retryAfter?: number;
};
