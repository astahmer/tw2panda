import { createMergeCss } from "@pandacss/shared";

import { initialInputList } from "../components/Playground/Playground.constants";
import { createPandaContext } from "./panda-context";
import { mapToShorthands } from "./panda-map-to-shorthands";
import { createTailwindContext } from "./tw-context";
import { twClassListToPandaStyles } from "./tw-class-list-to-panda-styles";

export function twClassListToPanda(
  classListString: string,
  useShorthands?: boolean
) {
  const classList = new Set(classListString.split(" "));

  const tw = createTailwindContext(initialInputList["theme.ts"]);
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
