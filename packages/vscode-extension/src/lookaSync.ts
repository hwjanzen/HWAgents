import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";

const CPS_APPLY = "microsoft-copilot-studio.applyChanges";
const CPS_CLONE = "microsoft-copilot-studio.cloneAgent";
const CPS_PREVIEW = "microsoft-copilot-studio.previewChanges";

export interface SyncResult {
  status: "applied" | "copied" | "cancelled";
  message: string;
}

// Extracts componentName from agent.mcs.yml metadata block
function extractComponentName(yaml: string): string | undefined {
  const m = yaml.match(/componentName:\s*(.+)/);
  return m?.[1]?.trim();
}

// Maps componentName to the corresponding system.md path
function resolveSystemMdPath(workspaceRoot: string, componentName: string): string {
  const agentId = componentName.toLowerCase().replace(/\s+/g, "-");
  return path.join(workspaceRoot, "agents", `${agentId}-agent`, "prompts", "system.md");
}

async function findAllAgentFiles(workspaceRoot: string): Promise<vscode.Uri[]> {
  return vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceRoot, "**/agent.mcs.yml"),
    "**/node_modules/**", 10
  );
}

function patchInstructionsField(yaml: string, newInstruction: string): string {
  const indented = newInstruction.trimEnd().split("\n").map((l) => `  ${l}`).join("\n");
  return yaml.replace(
    /(instructions:[ \t]*)(\|[-+]?|>[-+]?)?[\s\S]*?(?=\n\S|\n*$)/m,
    (_m, key) => `${key}|\n${indented}`
  );
}

export async function syncAgentInstruction(): Promise<SyncResult> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return { status: "cancelled", message: "Kein Workspace geÃ¶ffnet." };
  }

  const agentFiles = await findAllAgentFiles(workspace.uri.fsPath);

  if (agentFiles.length === 0) {
    const action = await vscode.window.showWarningMessage(
      "Kein geklonter CPS-Agent (agent.mcs.yml) im Workspace gefunden.",
      "Agent klonen"
    );
    if (action === "Agent klonen") {
      await vscode.commands.executeCommand(CPS_CLONE);
    }
    return { status: "cancelled", message: "Kein Agent gefunden. Nach dem Klonen erneut ausfÃ¼hren." };
  }

  // Pick agent if multiple are cloned
  let selectedFile: string;
  if (agentFiles.length === 1) {
    selectedFile = agentFiles[0].fsPath;
  } else {
    const items = await Promise.all(agentFiles.map(async (f) => {
      const content = await fs.readFile(f.fsPath, "utf8");
      const name = extractComponentName(content) ?? path.basename(path.dirname(f.fsPath));
      return { label: name, fsPath: f.fsPath };
    }));
    const pick = await vscode.window.showQuickPick(items, {
      placeHolder: "Welchen Agent synchronisieren?",
      ignoreFocusOut: true
    });
    if (!pick) { return { status: "cancelled", message: "Abgebrochen." }; }
    selectedFile = pick.fsPath;
  }

  const agentYaml = await fs.readFile(selectedFile, "utf8");
  const componentName = extractComponentName(agentYaml);
  if (!componentName) {
    return { status: "cancelled", message: "componentName in agent.mcs.yml nicht gefunden." };
  }

  const systemMdPath = resolveSystemMdPath(workspace.uri.fsPath, componentName);
  let instruction: string;
  try {
    instruction = await fs.readFile(systemMdPath, "utf8");
  } catch {
    return {
      status: "cancelled",
      message: `system.md nicht gefunden: ${path.relative(workspace.uri.fsPath, systemMdPath)}\nBitte zuerst anlegen.`
    };
  }

  const patched = patchInstructionsField(agentYaml, instruction);
  const relPath = path.relative(workspace.uri.fsPath, selectedFile);

  const confirm = await vscode.window.showInformationMessage(
    `Agent: ${componentName}\nDatei: ${relPath}\nInstruction aus system.md einspielen und Apply ausfÃ¼hren?`,
    { modal: true }, "Ja, Apply", "Nur Vorschau", "Datei Ã¶ffnen"
  );

  if (confirm === "Datei Ã¶ffnen") {
    const doc = await vscode.workspace.openTextDocument(selectedFile);
    await vscode.window.showTextDocument(doc);
    return { status: "cancelled", message: "Datei geÃ¶ffnet." };
  }

  if (confirm === "Nur Vorschau") {
    await vscode.commands.executeCommand(CPS_PREVIEW);
    return { status: "copied", message: "Vorschau geÃ¶ffnet." };
  }

  if (confirm === "Ja, Apply") {
    await fs.writeFile(selectedFile, patched, { encoding: "utf8" });
    await vscode.commands.executeCommand(CPS_APPLY);
    return { status: "applied", message: `${componentName} aktualisiert und Apply ausgefÃ¼hrt.` };
  }

  return { status: "cancelled", message: "Abgebrochen." };
}

// Keep old export name for backward compatibility
export const syncLookaInstruction = syncAgentInstruction;
