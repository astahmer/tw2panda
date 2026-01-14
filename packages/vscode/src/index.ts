import * as vscode from "vscode";
import { debounce } from "perfect-debounce";
import { PandaContext, rewriteTwFileContentToPanda, prettify } from "tw2panda";
import { loadPandaContext, loadTailwindContext } from "tw2panda/config";
import { createMergeCss } from "@pandacss/shared";
import { dirname } from "pathe";
import glob from "fast-glob";
import { resolveConfigFile, resolveConfig, Options } from "prettier";

const debug = false;

/**
 * Resolve Tailwind and Panda context for a file.
 * Cache config paths by file path.
 * ---
 * Does not actually cache context by file path, because it might change and we don't want to start a file watcher.
 * Instead, re-resolving context on every command request "only" cost 100ms.
 */
class ContextResolver {
  private pandaConfigPathByFilepath = new Map<string, string>();
  private twConfigPathByFilepath = new Map<string, string>();

  private pandaConfigDirPathList = new Set<string>();
  private twConfigDirPathList = new Set<string>();

  async findConfigPaths(rootPath: string) {
    const configPathList = await glob(`${rootPath}/**/{panda,tailwind}.config.{ts,cts,mts,js,cjs,mjs}`, {
      cwd: rootPath,
      onlyFiles: true,
      absolute: true,
      ignore: ["**/node_modules/**"],
    });

    configPathList.forEach((configPath) => {
      if (configPath.includes("tailwind.config")) {
        this.twConfigDirPathList.add(configPath);
      } else if (configPath.includes("panda.config")) {
        this.pandaConfigDirPathList.add(configPath);
      }
    });
  }

  async get(filePath: string) {
    let pandaConfigPath: string | undefined;
    let twConfigPath: string | undefined;

    const cwd = dirname(filePath);
    this.pandaConfigDirPathList.forEach((configPath) => {
      if (cwd.startsWith(dirname(configPath))) {
        pandaConfigPath = configPath;
      }
    });

    this.twConfigDirPathList.forEach((configPath) => {
      if (cwd.startsWith(dirname(configPath))) {
        twConfigPath = configPath;
      }
    });

    const [tailwind, panda] = await Promise.all([
      (await loadTailwindContext({ cwd, file: filePath, configPath: twConfigPath! })).context,
      (await loadPandaContext({ cwd, file: filePath, configPath: pandaConfigPath! })).context,
    ]);

    this.twConfigPathByFilepath.set(filePath, twConfigPath!);
    this.pandaConfigPathByFilepath.set(filePath, pandaConfigPath!);

    return { tailwind, panda };
  }
}

export async function activate(context: vscode.ExtensionContext) {
  debug && console.log("activate");

  const output = vscode.window.createOutputChannel("tw2panda");

  const initialDocument = vscode.window.activeTextEditor?.document;
  const initialWorkspaceFolder = vscode.workspace.getWorkspaceFolder(initialDocument?.uri ?? vscode.Uri.file(""));
  let activeDocumentFilepath = initialDocument?.uri.fsPath ?? "";

  const current = { tailwind: undefined, panda: undefined } as {
    tailwind: Awaited<ReturnType<typeof loadTailwindContext>>["context"] | undefined;
    panda: PandaContext | undefined;
  };
  const resolver = new ContextResolver();

  const reloadContext = async () => {
    if (!activeDocumentFilepath) return;

    const contexts = await resolver.get(activeDocumentFilepath);

    current.tailwind = contexts.tailwind;
    current.panda = contexts.panda;
  };

  let prettierConfig: Options | undefined;
  if (initialWorkspaceFolder) {
    resolveConfigFile(initialWorkspaceFolder.uri.fsPath).then(async (configPath) => {
      if (!configPath) return;

      const maybeConfig = await resolveConfig(configPath);
      if (!maybeConfig) return;

      prettierConfig = maybeConfig;
    });
  }

  // TODO RewriteOptions in settings
  // const config = vscode.workspace.getConfiguration('xxx')

  const workspaceFolders = (vscode.workspace.workspaceFolders ?? []).filter((folder) => folder.uri.fsPath);
  await Promise.all(workspaceFolders.map((folder) => resolver.findConfigPaths(folder.uri.fsPath)));

  let currentEditor = vscode.window.activeTextEditor;
  let currentSelection: vscode.Selection | undefined = currentEditor?.selections[0];

  const assignSelection = (editor: vscode.TextEditor, selection: vscode.Selection | undefined) => {
    if (!selection || selection.isEmpty) return;
    currentEditor = editor;
    currentSelection = editor.selection;
  };

  // Update current tailwind/panda context on active editor change
  const updateContextOnEditorChange = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor) return;
    if (editor.document.uri.scheme !== "file") return;

    activeDocumentFilepath = editor.document.uri.fsPath;
    assignSelection(editor, editor.selections[0]);
  });

  // Update current editor/selection on change
  const updateCurrentSelection = vscode.window.onDidChangeTextEditorSelection(
    debounce((e) => {
      assignSelection(e.textEditor, e.selections[0]);
    }, 150),
  );

  // Rewrite current selection
  const registerRewriteCommand = vscode.commands.registerCommand("tw2panda-vscode.rewrite-tw-selection", async () => {
    try {
      if (!currentEditor || !currentSelection) {
        vscode.window.showErrorMessage("No active editor or selection.");
        return;
      }

      const selectedText = currentEditor.document.getText(currentSelection);
      if (selectedText.length < 3) {
        vscode.window.showErrorMessage('Please select a Tailwind class list, e.g. "text-red-500".');
        return;
      }

      // Get fresh context in case config files have changed
      await reloadContext();
      if (!current.tailwind || !current.panda) {
        vscode.window.showErrorMessage("Could not load Tailwind or Panda context.");
        return;
      }

      const { mergeCss } = createMergeCss({ ...current.panda, ...{ hash: false } });
      const range = vscodeRangeToStartEndRange(currentEditor.document, currentSelection);

      // TODO pass RewriteOptions from settings
      const update = rewriteTwFileContentToPanda(
        currentEditor.document.getText(),
        currentEditor.document.uri.fsPath,
        current.tailwind,
        current.panda,
        mergeCss,
        { range },
      );

      // Update the editor's file value programmatically.
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const updatedRange = update.magicStr.slice(range.start, range.end).toString();

        // Apply the text edit to replace the content in the editor.
        const edit = new vscode.TextEdit(currentSelection, prettify(updatedRange, prettierConfig as any));
        const textEditorEdit = new vscode.WorkspaceEdit();
        textEditorEdit.set(editor.document.uri, [edit]);

        // Apply the text edit to the editor.
        vscode.workspace.applyEdit(textEditorEdit);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        output.appendLine("Error: " + err.message);
        if (err.stack) output.appendLine(err.stack);

        vscode.window.showErrorMessage("Could not rewrite Tailwind classes.", err.message);
      }
    }
  });

  context.subscriptions.push(updateContextOnEditorChange, updateCurrentSelection, registerRewriteCommand);
}

export function deactivate() {
  debug && console.log("deactivate");

  debug && console.log("stoppping...");
}

function vscodeRangeToStartEndRange(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
  const start = document.offsetAt(range.start);
  const end = document.offsetAt(range.end);

  return { start, end } as Range;
}

type Range = { start: number; end: number };
