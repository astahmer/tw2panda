import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Node, SourceFile } from "ts-morph";
import { assign, createMachine } from "xstate";
import { choose } from "xstate/lib/actions";
import { initialInputList, initialOutputList } from "../../../../demo-code-sample";

import { createMergeCss } from "@pandacss/shared";

import { createPandaContext, createTailwindContext, rewriteTwFileContentToPanda, type TwResultItem } from "tw2panda";

type PlaygroundContext = {
  monaco: Monaco | null;
  inputEditor: editor.IStandaloneCodeEditor | null;
  outputEditor: editor.IStandaloneCodeEditor | null;
  sourceFile: SourceFile | null;
  extracted: Node[];
  resultList: TwResultItem[];
  inputList: Record<string, string>;
  selectedInput: string;
  outputList: Record<string, string>;
  selectedOutput: string;
  decorations: string[];
};

type PlaygroundEvent =
  | {
      type: "Editor Loaded";
      editor: editor.IStandaloneCodeEditor;
      monaco: Monaco;
      kind: "input" | "output";
    }
  | { type: "Select input tab"; name: string }
  | { type: "Select output tab"; name: string }
  | { type: "Update input"; value: string };

const initialContext: PlaygroundContext = {
  monaco: null,
  inputEditor: null,
  outputEditor: null,
  sourceFile: null,
  extracted: [],
  resultList: [],
  inputList: initialInputList,
  selectedInput: "tw-App.tsx",
  outputList: initialOutputList,
  selectedOutput: "App.tsx",
  decorations: [],
};

// @ts-ignore
globalThis.__dirname = "/";

export const playgroundMachine = createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: "playground",
    tsTypes: {} as import("./Playground.machine.typegen").Typegen0,
    schema: {
      context: {} as PlaygroundContext,
      events: {} as PlaygroundEvent,
    },
    context: initialContext,
    initial: "loading",
    states: {
      loading: {
        on: {
          "Editor Loaded": [
            {
              cond: "willBeReady",
              target: "ready",
              actions: ["assignEditorRef", "extractClassList"],
            },
            { actions: "assignEditorRef" },
          ],
        },
      },
      ready: {
        initial: "Playing",
        entry: ["updateInput"],
        states: {
          Playing: {
            on: {
              "Select input tab": {
                actions: ["selectInputTab", "updateInput"],
              },
              "Select output tab": { actions: ["selectOutputTab"] },
              "Update input": { actions: ["updateInput"] },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      assignEditorRef: assign((ctx, event) => {
        if (event.kind === "input") {
          return { ...ctx, inputEditor: event.editor, monaco: event.monaco };
        }

        return { ...ctx, outputEditor: event.editor, monaco: event.monaco };
      }),
      selectInputTab: assign((ctx, event) => {
        return { ...ctx, selectedInput: event.name };
      }),
      selectOutputTab: assign((ctx, event) => {
        return { ...ctx, selectedOutput: event.name };
      }),
      updateSelectedInput: assign((ctx, event) => {
        if (event.type !== "Update input") return ctx;

        const { inputList, selectedInput } = ctx;
        if (inputList[selectedInput]) {
          inputList[selectedInput] = event.value;
        }
        return { ...ctx, inputList };
      }),
      updateInput: choose([
        {
          cond: "isAppFile",
          actions: ["updateSelectedInput", "extractClassList"],
        },
        { actions: ["updateSelectedInput"] },
      ]),
      extractClassList: assign((ctx, event) => {
        const value = (event.type === "Update input" ? event.value : ctx.inputList[ctx.selectedInput]) ?? "";
        const themeContent = ctx.inputList["tailwind.config.js"] ?? "module.exports = {}";

        const tw = createTailwindContext(themeContent);
        const tailwind = tw.context;

        const panda = createPandaContext();
        const { mergeCss } = createMergeCss({
          utility: panda.utility,
          conditions: panda.conditions,
          hash: false,
        });

        const result = rewriteTwFileContentToPanda(value, tailwind, panda, mergeCss);
        const { sourceFile, nodes, output, resultList = [] } = result;

        const outputList = {
          ["App.tsx"]: output,
          "transformed.md": resultList
            .map((result) => {
              return `// ${Array.from(result.classList).join(" ")}\n\`\`\`json\n${JSON.stringify(
                result.styles,
                null,
                2,
              )}\n\`\`\``;
            })
            .join("\n\n//------------------------------------\n"),
        };
        console.log(result);
        console.log({ tailwind: tw, panda });

        // if (ctx.monaco && ctx.outputEditor) {
        //   ctx.outputEditor.setValue(output);
        // }

        return {
          ...ctx,
          sourceFile,
          extracted: nodes as any,
          resultList,
          outputList,
        };
      }),
    },
    guards: {
      willBeReady: (ctx) => {
        return Boolean(ctx.inputEditor || ctx.outputEditor);
      },
      isAppFile: (ctx) => {
        return ctx.selectedInput === "tw-App.tsx";
      },
    },
  },
);
