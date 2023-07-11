import { describe, expect, test } from "vitest";
import { createPandaContext } from "../src/converter/panda-context";

describe("panda-context", () => {
  test("createPandaContext", () => {
    const ctx = createPandaContext({});
    expect(Object.keys(ctx)).toMatchInlineSnapshot(`
      [
        "hooks",
        "dependencies",
        "path",
        "config",
        "isTemplateLiteralSyntax",
        "studio",
        "hash",
        "prefix",
        "tokens",
        "utility",
        "properties",
        "isValidProperty",
        "recipes",
        "conditions",
        "createSheetContext",
        "createSheet",
        "patterns",
        "jsx",
        "paths",
        "file",
        "getArtifacts",
        "getCss",
        "getParserCss",
        "messages",
        "parserOptions",
        "project",
      ]
    `);
  });
});
