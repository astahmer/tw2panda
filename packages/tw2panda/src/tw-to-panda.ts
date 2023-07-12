import { createMergeCss } from "@pandacss/shared";

import { createPandaContext } from "./panda-context";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { createTailwindContext } from "./tw-context";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";
import { initialInputList } from "../../../demo-code-sample";

export function twClassListToPanda(
  classListString: string,
  useShorthands?: boolean
) {
  const classList = new Set(classListString.split(" "));

  const tw = createTailwindContext(initialInputList["tailwind.config.js"]);
  const tailwind = tw.context;

  const panda = createPandaContext();
  const { mergeCss } = createMergeCss({
    utility: panda.utility,
    conditions: panda.conditions,
    hash: false,
  });

  const { styles } = twClassListToPandaStyles(classList, tailwind, panda);
  if (!styles.length) return;

  const merged = mergeCss(...styles);
  return useShorthands ? mapToShorthands(merged, panda) : merged;
}
