import type { Channel } from "./channel";
import type { Message } from "./message";

export type SearchMessageResult = {
  messages: Message[];
  threads: Channel[];
  total_results: number;
  /**
   * True while Discord is still building the search index for this
   * channel/guild — results can be empty or incomplete even though
   * matching messages exist (#216). Surface this to users instead of a
   * bare "no results."
   */
  doing_deep_historical_index?: boolean;
};