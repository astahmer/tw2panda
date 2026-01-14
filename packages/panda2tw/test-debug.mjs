import { Project, SourceFile, Node } from "ts-morph";
import { findJsxElementsWithPandaProps } from "./dist/parser.js";

const code = `export const Component = () => {
  return (
    <div css={{ display: "flex", gap: "16", marginTop: "4" }} />
  );
};`;

const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile("test.tsx", code);

const elements = findJsxElementsWithPandaProps(sourceFile);
console.log("Found elements:", elements.length);
elements.forEach((el) => {
  console.log("Tag:", el.tagName);
  console.log("Panda props:", el.pandaProps.map(p => ({ name: p.name, value: p.value })));
});
