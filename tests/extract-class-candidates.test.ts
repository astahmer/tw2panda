import { describe, test, expect } from "vitest";
import { createPandaContext } from "../src/converter/panda-context";
import { extractClassCandidates } from "../src/converter/extract-class-candidates";
import buttonRaw from "../samples/button?raw";
import { initialInputList } from "../src/components/Playground/Playground.constants";

describe("extract-class-candidates", () => {
  test("samples/button.ts", () => {
    const panda = createPandaContext();
    const { sourceFile, nodes } = extractClassCandidates(buttonRaw, panda);

    expect(sourceFile.getFilePath()).toMatchInlineSnapshot('"/App.tsx"');
    expect(Array.from(nodes).map((node) => node.getLiteralText()))
      .toMatchInlineSnapshot(`
        [
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "hover:bg-accent hover:text-accent-foreground",
          "text-primary underline-offset-4 hover:underline",
          "h-10 px-4 py-2",
          "h-9 rounded-md px-3",
          "h-11 rounded-md px-8",
          "h-10 w-10",
          "default",
          "default",
          "button",
          "Button",
        ]
      `);
  });

  test("Playground defaultCode", () => {
    const panda = createPandaContext();
    const { sourceFile, nodes } = extractClassCandidates(
      initialInputList["tw-App.tsx"],
      panda
    );

    expect(sourceFile.getFilePath()).toMatchInlineSnapshot('"/App.tsx"');
    expect(Array.from(nodes).map((node) => node.getLiteralText()))
      .toMatchInlineSnapshot(`
        [
          "md:flex bg-slate-100 rounded-xl p-8 md:p-0 dark:bg-slate-800",
          "w-24 h-24 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto",
          "/sarah-dayan.jpg",
          "",
          "384",
          "512",
          "pt-6 md:p-8 text-center md:text-left space-y-4",
          "text-lg font-medium",
          "font-medium",
          "text-sky-500 dark:text-sky-400",
          "text-slate-700 dark:text-slate-500",
        ]
      `);
  });
});
