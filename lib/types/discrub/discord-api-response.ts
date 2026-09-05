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
  /** The last retry_after Discord asked for, in seconds. */
  retryAfter?: number;
};
