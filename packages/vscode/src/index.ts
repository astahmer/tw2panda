import * as vscode from "vscode";
import { debounce } from "perfect-debounce";
import { PandaContext, loadPandaContext, loadTailwindContext, rewriteTwFileContentToPanda } from "tw2panda";
import { createMergeCss } from "@pandacss/shared";
import { dirname } from "pathe";
import glob from "fast-glob";

const debug = true;

class ContextResolver {
  // private pandaContextByFilepath = new Map<string, any>();
  // private twContextByFilepath = new Map<string, any>();

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

  async loadTailwindContext({ cwd, file }: { cwd: string; file?: string }) {
    // const filePath = file ?? cwd;
    // const cached = this.twContextByFilepath.get(filePath);
    // if (cached) {
    //   return cached;
    // }

    const result = await loadTailwindContext({ cwd, file });
    // this.twContextByFilepath.set(result.filePath ?? filePath, result.context);
    return result.context;
  }

  async loadPandaContext({ cwd, file }: { cwd: string; file?: string }) {
    // const filePath = file ?? cwd;
    // const cached = this.pandaContextByFilepath.get(filePath);
    // if (cached) {
    //   return cached;
    // }

    const result = await loadPandaContext({ cwd, file });
    // this.pandaContextByFilepath.set(result.filePath ?? filePath, result.context);
    return result.context;
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
      this.loadTailwindContext({ cwd, file: twConfigPath! }),
      this.loadPandaContext({ cwd, file: pandaConfigPath! }),
    ]);

    this.twConfigPathByFilepath.set(filePath, twConfigPath!);
    this.pandaConfigPathByFilepath.set(filePath, pandaConfigPath!);

    return { tailwind, panda };
  }
}

export async function activate(context: vscode.ExtensionContext) {
  debug && console.log("activate");

  const output = vscode.window.createOutputChannel("tw2panda");

  let activeDocument = vscode.window.activeTextEditor?.document;
  let activeDocumentFilepath = activeDocument?.uri.fsPath ?? "";
  const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(activeDocument?.uri ?? vscode.Uri.file(""));

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

  if (activeWorkspaceFolder) {
    // await reloadContext();
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
  await Promise.all(workspaceFolders.map((folder) => resolver.findConfigPaths(folder.uri.fsPath)));

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
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) return;
      if (editor.document.uri.scheme !== "file") return;

      activeDocumentFilepath = editor.document.uri.fsPath;
      await reloadContext();
      // TODO assign current.tailwind/panda if it has changed
    }),
    // TODO code action ->
    // Rewrite current selection
    vscode.commands.registerCommand("tw2panda-vscode.rewrite-tw-selection", async () => {
      try {
        if (!currentEditor || !currentSelection) return;
        const text = currentEditor.document.getText(currentSelection);
        if (text.length < 3) return;

        console.time("reloadContext");
        await reloadContext();
        console.timeEnd("reloadContext");
        if (!current.tailwind || !current.panda) return;
        const { mergeCss } = createMergeCss(Object.assign(current.panda, { hash: false }));
        // TODO pass RewriteOptions from settings
        const update = rewriteTwFileContentToPanda(text, current.tailwind, current.panda, mergeCss, {});

        // Update the editor's file value programmatically.
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          // Apply the text edit to replace the content in the editor.
          const edit = new vscode.TextEdit(
            new vscode.Range(currentSelection.start, currentSelection.end),
            update.output,
          );
          const textEditorEdit = new vscode.WorkspaceEdit();
          textEditorEdit.set(editor.document.uri, [edit]);

          // Apply the text edit to the editor.
          vscode.workspace.applyEdit(textEditorEdit);
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) output.appendLine("Error: " + err?.message);
      }
    }),
  );
}

export function deactivate() {
  debug && console.log("deactivate");

  debug && console.log("stoppping...");
}
