import { createMergeCss } from "@pandacss/shared";

import { createPandaContext } from "./panda-context";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { createTailwindContext } from "./tw-context";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { initialInputList } from "../../../demo-code-sample";
import { RewriteOptions } from "./types";

export function twClassListToPanda(classListString: string, options: RewriteOptions = { shorthands: true }) {
  const classList = new Set(classListString.split(" "));

  const tw = createTailwindContext(initialInputList["tailwind.config.js"]);
  const tailwind = tw.context;

  const panda = createPandaContext();
  const { mergeCss } = createMergeCss({
    utility: panda.utility,
    conditions: panda.conditions,
    hash: false,
  });

  const styles = twClassListToPandaStyles(classList, tailwind, panda);
  if (!styles.length) return;

  const merged = mergeCss(...styles.map((s) => s.styles));
  return options?.shorthands ? mapToShorthands(merged, panda) : merged;
}
