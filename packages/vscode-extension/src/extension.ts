import * as vscode from "vscode";
import { registerCommands } from "./commands";

export function activate(context: vscode.ExtensionContext): void {
  console.log("HW Agents extension activated");
  registerCommands(context);
}

export function deactivate(): void {
  // No-op for baseline milestone.
}
