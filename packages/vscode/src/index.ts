import { type CancellationToken } from "vscode";
import * as vscode from "vscode";
import {
  LanguageClient,
  type LanguageClientOptions,
  type MessageSignature,
  type ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { join } from "pathe";
// import { registerClientCommands } from "./commands";

// Adapted from https://github.com/chakra-ui/panda/blob/b75905d8882ffaf8ada6052a6333166a463bac47/extension/vscode/src/index.ts

const extensionId = "chakra-ui.panda-css-vscode";

// Client entrypoint
const docSelector: vscode.DocumentSelector = [
  "typescript",
  "typescriptreact",
  "javascript",
  "javascriptreact",
  "astro",
];

let client: LanguageClient;
const debug = true;

export async function activate(context: vscode.ExtensionContext) {
  debug && console.log("activate");

  const extension = vscode.extensions.getExtension(extensionId);

  const activeDocument = vscode.window.activeTextEditor?.document;
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  let serverModule;
  if (extension) {
    serverModule = join(extension.extensionPath, "dist", "server.js");
  } else {
    statusBarItem.text = "🐼 Loading...";
    statusBarItem.show();
    statusBarItem.command = "tw2panda-vscode.open-config";

    // The server is implemented in node
    serverModule = context.asAbsolutePath(join("dist", "server.js"));
  }

  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = debug ? { execArgv: ["--nolazy", "--inspect=6099"] } : {};

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
  };

  // Options to control the language client
  let activeDocumentFilepath = activeDocument?.uri.fsPath;
  const clientOptions: LanguageClientOptions = {
    documentSelector: docSelector as string[],
    synchronize: {
      fileEvents: [vscode.workspace.createFileSystemWatcher("**/*/panda.config.{ts,js,cjs,mjs}")],
    },
    initializationOptions: () => {
      return {
        activeDocumentFilepath: activeDocument?.uri.fsPath,
      };
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient("tw2panda-vscode", "tw2panda", serverOptions, clientOptions);
  client.outputChannel.appendLine("Starting tw2panda extension...");

  // global error handler
  client.handleFailedRequest = (
    type: MessageSignature,
    token: CancellationToken | undefined,
    error: any,
    defaultValue: any,
    showNotification?: boolean,
  ) => {
    console.log("handleFailedRequest", { type, token, error, defaultValue, showNotification });
    return defaultValue;
  };

  // synchronize the active document with the extension LSP
  // so that we can retrieve the corresponding configPath (xxx/yyy/panda.config.ts)
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      if (!client.isRunning()) return;
      if (editor.document.uri.scheme !== "file") return;

      activeDocumentFilepath = editor.document.uri.fsPath;
      client.sendNotification("$/panda-active-document-changed", { activeDocumentFilepath });
    }),
  );

  debug && console.log("before start");

  // registerClientCommands({ context, debug, client, loadingStatusBarItem: statusBarItem });

  try {
    // Start the client. This will also launch the server
    statusBarItem.text = "🐼 Starting...";

    await client.start();
    debug && console.log("starting...");
    statusBarItem.text = "🐼";
    statusBarItem.tooltip = "Open current panda config";
  } catch (err) {
    debug && console.log("error starting client", err);
  }
}

export function deactivate(): Thenable<void> | undefined {
  debug && console.log("deactivate");

  if (!client) {
    return undefined;
  }

  debug && console.log("stoppping...");
  return client.stop();
}
