import { afterEach, describe, expect, it } from "vitest";
import {
  coreMessages,
  resetCoreMessages,
  setCoreMessages,
  DEFAULT_CORE_MESSAGES,
} from "./core-messages.ts";
import { getNextSearchStatus } from "./utils.ts";

describe("core message catalog", () => {
  afterEach(() => resetCoreMessages());

  it("ships English defaults", () => {
    expect(coreMessages().retrievedMessages(3)).toBe("Retrieved 3 messages");
    expect(coreMessages().noPermissionToModifyMessage()).toBe(
      DEFAULT_CORE_MESSAGES.noPermissionToModifyMessage(),
    );
  });

  it("applies partial overrides and keeps the rest", () => {
    setCoreMessages({ retrievedMessages: (n) => `${n} Nachrichten geladen` });
    expect(coreMessages().retrievedMessages(7)).toBe("7 Nachrichten geladen");
    expect(coreMessages().retrievingUserAlias("aaron")).toBe(
      "Retrieving user alias for aaron",
    );
  });

  it("is read at call time by the services' helpers", () => {
    setCoreMessages({
      retrievedSearchResults: (c, t) => `${c} von ${t} Treffern`,
    });
    expect(getNextSearchStatus([], [], 10)).toBe("0 von 10 Treffern");
    resetCoreMessages();
    expect(getNextSearchStatus([], [], 10)).toBe(
      "Retrieved 0 of 10 search results",
    );
  });
});
