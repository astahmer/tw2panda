import { PandaContext } from "./panda-context";
import { walkObject } from "@pandacss/shared";
import { StyleObject } from "./types";

export function mapToShorthands(styles: StyleObject, context: PandaContext) {
  const utilities = context.config.utilities ?? {};

  return walkObject(styles, (v) => v, {
    getKey: (prop) => {
      const shorthand = utilities[prop]?.shorthand;
      return typeof shorthand === "string" ? shorthand : prop;
    },
  });
}
