import * as vscode from "vscode";
import { debounce } from "perfect-debounce";
import { PandaContext, loadPandaContext, loadTailwindContext, rewriteTwFileContentToPanda } from "tw2panda";
import { createMergeCss } from "@pandacss/shared";

const debug = true;

class ContextResolver {
  private twConfigPathByFilepath = new Map<string, any>();
  private twWorkspaceRootByFilepath = new Map<string, any>();

  private pandaConfigPathByFilepath = new Map<string, any>();
  private pandaWorkspaceRootByFilepath = new Map<string, any>();

  async loadTailwindContext({ cwd, file }: { cwd: string; file: string }) {
    const result = await loadTailwindContext({ cwd, file: this.twConfigPathByFilepath.get(file) });
    this.twConfigPathByFilepath.set(result.filePath ?? cwd, result);
    this.twWorkspaceRootByFilepath.set(result.filePath ?? cwd, cwd);
    return result.context;
  }

  async loadPandaContext({ cwd, file }: { cwd: string; file: string }) {
    const result = await loadPandaContext({ cwd, file: this.pandaConfigPathByFilepath.get(file) });
    this.pandaConfigPathByFilepath.set(result.filePath ?? cwd, result);
    this.pandaWorkspaceRootByFilepath.set(result.filePath ?? cwd, cwd);
    return result.context;
  }
}

export async function activate(context: vscode.ExtensionContext) {
  debug && console.log("activate");

  const activeDocument = vscode.window.activeTextEditor?.document;
  let activeDocumentFilepath = activeDocument?.uri.fsPath ?? "";
  const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(activeDocument?.uri ?? vscode.Uri.file(""));

  const current = { tailwind: undefined, panda: undefined } as {
    tailwind: Awaited<ReturnType<typeof loadTailwindContext>>["context"] | undefined;
    panda: PandaContext | undefined;
  };
  const resolver = new ContextResolver();

  if (activeWorkspaceFolder) {
    current.tailwind = await resolver.loadTailwindContext({
      cwd: activeDocumentFilepath,
      file: activeDocumentFilepath,
    });
    current.panda = await resolver.loadPandaContext({ cwd: activeDocumentFilepath, file: activeDocumentFilepath });
  }

  // TODO RewriteOptions in settings
  // const config = vscode.workspace.getConfiguration('xxx')

  // TODO watch config files & reload corresponding context on change
  // const onConfigChange = async (e: vscode.Uri) => {
  //   const filePath = e.fsPath;
  //   const cwd = vscode.workspace.getWorkspaceFolder(e)?.uri.fsPath ?? "";
  //   if (filePath.includes("tailwind")) {
  //     // current.tailwind = await resolver.loadTailwindContext({ cwd, filePath });
  //   } else if (filePath.includes("panda")) {
  //     // current.panda = await resolver.loadPandaContext({ cwd, filePath });
  //   }
  // };

  // const watcher = vscode.workspace.createFileSystemWatcher("**/*/{panda,tailwind}.config.{ts,js,cjs,mjs}");
  // watcher.onDidDelete(onConfigChange);
  // watcher.onDidChange(onConfigChange);

  const workspaceFolders = (vscode.workspace.workspaceFolders ?? []).filter((folder) => folder.uri.fsPath);
  console.log({ workspaceFolders });

  let currentEditor = vscode.window.activeTextEditor;
  let currentSelection: vscode.Selection | undefined;

  context.subscriptions.push(
    // Update current editor/selection on change
    vscode.window.onDidChangeTextEditorSelection(
      debounce((e) => {
        const selection = e.selections[0];
        if (!selection || selection.isEmpty) return;

        currentEditor = e.textEditor;
        currentSelection = selection;
      }, 150),
    ),
    // Update current tailwind/panda context on active editor change
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      if (editor.document.uri.scheme !== "file") return;

      activeDocumentFilepath = editor.document.uri.fsPath;
      // TODO assign current.tailwind/panda if it has changed
    }),
    // Rewrite current selection
    vscode.commands.registerCommand("tw2panda-vscode.rewrite-tw-selection", async () => {
      if (!currentEditor || !currentSelection) return;
      const text = currentEditor.document.getText(currentSelection);
      if (text.length < 3) return;

      if (!current.tailwind || !current.panda) return;
      const { mergeCss } = createMergeCss(Object.assign(current.panda, { hash: false }));
      // TODO pass RewriteOptions from settings
      // TODO pass whole file content to get a clean AST output, instead of a selection that might be incomplete/invalid
      const update = rewriteTwFileContentToPanda(text, current.tailwind, current.panda, mergeCss, {});

      // Update the editor's file value programmatically.
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        // Apply the text edit to replace the content in the editor.
        const edit = new vscode.TextEdit(new vscode.Range(currentSelection.start, currentSelection.end), update.output);
        const textEditorEdit = new vscode.WorkspaceEdit();
        textEditorEdit.set(editor.document.uri, [edit]);

        // Apply the text edit to the editor.
        vscode.workspace.applyEdit(textEditorEdit);
      }
    }),
  );
}

export function deactivate() {
  debug && console.log("deactivate");

  debug && console.log("stoppping...");
}
