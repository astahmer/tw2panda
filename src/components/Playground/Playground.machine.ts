import { ExtractResultByName } from "@box-extractor/core";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { SourceFile } from "ts-morph";
import { assign, createMachine } from "xstate";
import { choose } from "xstate/lib/actions";
import { initialInputList, initialOutputList } from "./Playground.constants";

import {
  extractClassList,
  TwResultItem,
} from "../../converter/extract-class-list";

import { createMergeCss } from "@pandacss/shared";

import { createPandaContext } from "../../converter/panda-context";
import { createTailwindContext } from "../../converter/tw-context";

type PlaygroundContext = {
  monaco: Monaco | null;
  inputEditor: editor.IStandaloneCodeEditor | null;
  outputEditor: editor.IStandaloneCodeEditor | null;
  sourceFile: SourceFile | null;
  extracted: ExtractResultByName | null;
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
  extracted: null,
  resultList: [],
  inputList: initialInputList,
  selectedInput: "tw-App.tsx",
  outputList: initialOutputList,
  selectedOutput: "App.tsx",
  decorations: [],
};

globalThis.__dirname = "/";

export const playgroundMachine = createMachine(
  {
    predictableActionArguments: true,
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

        // if (ctx.inputEditor) {
        // ctx.inputEditor.setValue(event.value);
        // }

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
        const value =
          event.type === "Update input"
            ? event.value
            : ctx.inputEditor?.getValue() ?? "";
        const themeContent = ctx.inputList["theme.ts"] ?? "module.exports = {}";

        const tw = createTailwindContext(themeContent);
        const tailwind = tw.context;

        const panda = createPandaContext();
        const { mergeCss } = createMergeCss({
          utility: panda.utility,
          conditions: panda.conditions,
          hash: false,
        });

        const result = extractClassList(value, tailwind, panda, mergeCss);
        const { sourceFile, extracted, resultList, outputList } = result;
        console.log(result);

        // if (ctx.monaco && ctx.outputEditor) {
        //   ctx.outputEditor.setValue(output);
        // }

        return { ...ctx, sourceFile, extracted, resultList, outputList };
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
  }
);
