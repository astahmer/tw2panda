/**
 * @see https://github.com/tailwindlabs/tailwindcss/blob/6722e78b35c70ac4b1bd4060f9cda9019f326241/src/lib/generateRules.js#L37
 */

// Generate match permutations for a class candidate, like:
// ['ring-offset-blue', '100']
// ['ring-offset', 'blue-100']
// ['ring', 'offset-blue-100']
// Example with dynamic classes:
// ['grid-cols', '[[linename],1fr,auto]']
// ['grid', 'cols-[[linename],1fr,auto]']
export function candidatePermutations(candidate: string) {
  let lastIndex = Infinity;
  const permutations = [];

  while (lastIndex >= 0) {
    let dashIdx;
    let wasSlash = false;

    if (lastIndex === Infinity && candidate.endsWith("]")) {
      let bracketIdx = candidate.indexOf("[");

      // If character before `[` isn't a dash or a slash, this isn't a dynamic class
      // eg. string[]
      if (candidate[bracketIdx - 1] === "-") {
        dashIdx = bracketIdx - 1;
      } else if (candidate[bracketIdx - 1] === "/") {
        dashIdx = bracketIdx - 1;
        wasSlash = true;
      } else {
        dashIdx = -1;
      }
    } else if (lastIndex === Infinity && candidate.includes("/")) {
      dashIdx = candidate.lastIndexOf("/");
      wasSlash = true;
    } else {
      dashIdx = candidate.lastIndexOf("-", lastIndex);
    }

    if (dashIdx < 0) {
      break;
    }

    let prefix = candidate.slice(0, dashIdx);
    let modifier = candidate.slice(wasSlash ? dashIdx : dashIdx + 1);

    lastIndex = dashIdx - 1;

    // TODO: This feels a bit hacky
    if (prefix === "" || modifier === "/") {
      continue;
    }

    permutations.push([prefix, modifier]);
  }

  return permutations;
}
