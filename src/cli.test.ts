import { describe, expect, it, vi } from "vitest";

import { getHelloWorld, main } from "./cli";

describe("cli", () => {
  it("returns the hello world message", () => {
    expect(getHelloWorld()).toBe("Hello World");
  });

  it("writes the hello world message to the provided output", () => {
    const write = vi.fn();

    main({ write });

    expect(write).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledWith("Hello World\n");
  });
});
