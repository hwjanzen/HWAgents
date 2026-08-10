import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("hwagents.hello", async () => {
    await vscode.window.showInformationMessage("HW Agents Extension aktiv.");
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // No-op for baseline milestone.
}
