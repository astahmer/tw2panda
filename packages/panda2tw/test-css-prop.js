const { rewritePandaToTailwind } = require('./dist/rewrite.js');

const input = `export const Component = () => {
  return (
    <div css={{ display: "flex", gap: "16", marginTop: "4" }} />
  );
};`;

const result = rewritePandaToTailwind(input, "test.tsx");
console.log("Output:");
console.log(result.output);
console.log("\nConversions:");
console.log(JSON.stringify(result.conversions, null, 2));
