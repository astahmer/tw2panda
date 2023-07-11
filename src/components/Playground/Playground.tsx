import Editor from "@monaco-editor/react";
import { useActor } from "@xstate/react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { css } from "panda/css";
import { Flex, styled } from "panda/jsx";
import { usePlaygroundContext } from "./PlaygroundMachineProvider";
import { ResizeHandle } from "./ResizeHandle";
import ReactDeclaration from "../../../react.d.ts?raw";
import { useTheme } from "../vite-theme";

export const Playground = () => {
  const service = usePlaygroundContext();
  const [state, send] = useActor(service);
  console.log(state.value, state.context);

  const theme = useTheme();
  const colorMode = theme.resolvedTheme;

  return (
    <styled.div display="flex" w="100%" h="100%" pos="relative">
      <PanelGroup direction="horizontal">
        <Panel
          className={css({ display: "flex", flexDirection: "column" })}
          minSize={20}
        >
          <Flex
            px="2"
            bg="var(--sp-colors-surface1)"
            borderBottom="1px solid var(--sp-colors-surface2)"
            role="tablist"
          >
            {Object.entries(state.context.inputList).map(([fileName]) => (
              <styled.button
                role="tab"
                key={fileName}
                onClick={() =>
                  send({ type: "Select input tab", name: fileName })
                }
                fontSize="sm"
                fontWeight="medium"
                borderRadius="0"
                p="2"
                color="cyan.500"
                opacity={0.8}
                transition="color opacity 150ms ease"
                bg="none"
                cursor="pointer"
                borderBottom="solid 1px transparent"
                data-active={
                  state.context.selectedInput === fileName ? "" : undefined
                }
                _active={{
                  color: "cyan.600",
                  opacity: 1,
                  borderBottom: "solid 1px token(colors.cyan.600, red)",
                }}
                _hover={{ color: "cyan.600" }}
              >
                {fileName}
              </styled.button>
            ))}
          </Flex>
          <styled.div
            boxSize="full"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Editor
              theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
              language="typescript"
              path="tw-App.tsx"
              value={state.context.inputList[state.context.selectedInput]}
              options={{ minimap: { enabled: false } }}
              beforeMount={(monaco) => {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                  {
                    target: monaco.languages.typescript.ScriptTarget.Latest,
                    allowNonTsExtensions: true,
                    moduleResolution:
                      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: monaco.languages.typescript.JsxEmit.Preserve,
                    // reactNamespace: "React",
                    allowJs: true,
                    typeRoots: ["node_modules/@types"],
                  }
                );

                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                  ReactDeclaration,
                  "@types/react"
                );

                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                  { noSemanticValidation: true }
                );
              }}
              onMount={(editor, monaco) => {
                console.log("editor mounted", editor, monaco);
                send({ type: "Editor Loaded", editor, monaco, kind: "input" });
                // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                //     send({ type: "Save" });
                // });
              }}
              onChange={(content) =>
                send({ type: "Update input", value: content ?? "" })
              }
            />
          </styled.div>
        </Panel>
        <ResizeHandle className={css({ color: "black" })} />
        <Panel
          className={css({ display: "flex", flexDirection: "column" })}
          minSize={20}
        >
          <Flex
            px="2"
            bg="var(--sp-colors-surface1)"
            borderBottom="1px solid var(--sp-colors-surface2)"
            role="tablist"
          >
            {Object.entries(state.context.outputList).map(([fileName]) => (
              <styled.button
                role="tab"
                key={fileName}
                onClick={() =>
                  send({ type: "Select output tab", name: fileName })
                }
                fontSize="sm"
                fontWeight="medium"
                borderRadius="0"
                p="2"
                color="cyan.500"
                opacity={0.8}
                transition="color opacity 150ms ease"
                bg="none"
                cursor="pointer"
                borderBottom="solid 1px transparent"
                data-active={
                  state.context.selectedOutput === fileName ? "" : undefined
                }
                _active={{
                  color: "cyan.600",
                  opacity: 1,
                  borderBottom: "solid 1px token(colors.cyan.600, red)",
                }}
                _hover={{ color: "cyan.600" }}
              >
                {fileName}
              </styled.button>
            ))}
          </Flex>
          <styled.div
            boxSize="full"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Editor
              options={{ minimap: { enabled: false } }}
              theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
              language="typescript"
              path="App.tsx"
              value={
                state.context.outputList[state.context.selectedOutput] ?? ""
              }
              beforeMount={(monaco) => {
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                  { noSemanticValidation: true }
                );
              }}
              onMount={(editor, monaco) => {
                send({ type: "Editor Loaded", editor, monaco, kind: "output" });
              }}
            />
          </styled.div>
        </Panel>
      </PanelGroup>
    </styled.div>
  );
};
