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

async function readSystemMd(workspaceRoot: string): Promise<string> {
  const p = path.join(workspaceRoot, "agents", "office-agent", "prompts", "system.md");
  return fs.readFile(p, "utf8");
}

// Finds the agent.sync.yaml root file - CPS extension activates on this file
async function findAgentSyncRoot(workspaceRoot: string): Promise<string | undefined> {
  const pattern = new vscode.RelativePattern(workspaceRoot, "**/agent.sync.yaml");
  const files = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 5);
  return files[0]?.fsPath;
}

// Finds the .mcs.yaml file that contains the instructions field
async function findInstructionFile(agentDir: string): Promise<string | undefined> {
  const files = await vscode.workspace.findFiles(
    new vscode.RelativePattern(agentDir, "**/*.mcs.yaml"), undefined, 20
  );
  for (const f of files) {
    const content = await fs.readFile(f.fsPath, "utf8");
    if (content.includes("instructions:")) {
      return f.fsPath;
    }
  }
  // Fallback: any yaml with instructions
  const yamlFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(agentDir, "**/*.yaml"), undefined, 20
  );
  for (const f of yamlFiles) {
    const content = await fs.readFile(f.fsPath, "utf8");
    if (content.includes("instructions:")) {
      return f.fsPath;
    }
  }
  return undefined;
}

// Replaces the instructions block value, preserving the key and YAML block scalar style
function patchInstructionsField(yaml: string, newInstruction: string): string {
  const indented = newInstruction.trimEnd().split("\n").map((l) => `  ${l}`).join("\n");
  // Matches: instructions: | or instructions: >- or instructions: "..." etc.
  return yaml.replace(
    /(^|\n)([ \t]*instructions:[ \t]*)(\|[-]?|>[-]?|"[^"]*"|'[^']*'|[^\n]*)((\n[ \t]+[^\n]*)*)/,
    (_m, pre, key) => `${pre}${key}|\n${indented}`
  );
}

export async function syncLookaInstruction(): Promise<SyncResult> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return { status: "cancelled", message: "Kein Workspace geoeffnet." };
  }

  const instruction = await readSystemMd(workspace.uri.fsPath);
  const agentSyncFile = await findAgentSyncRoot(workspace.uri.fsPath);

  if (!agentSyncFile) {
    await vscode.env.clipboard.writeText(instruction);
    const action = await vscode.window.showWarningMessage(
      "Kein geklonter CPS-Agent (agent.sync.yaml) im Workspace gefunden.\nInstruction in Zwischenablage kopiert.",
      "Agent klonen"
    );
    if (action === "Agent klonen") {
      await vscode.commands.executeCommand(CPS_CLONE);
    }
    return { status: "copied", message: "Instruction in Zwischenablage. Nach dem Klonen erneut ausfÃ¼hren." };
  }

  const agentDir = path.dirname(agentSyncFile);
  const instructionFile = await findInstructionFile(agentDir);

  if (!instructionFile) {
    // Agent found but no instructions field - open agent dir for manual inspection
    await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(agentDir));
    await vscode.env.clipboard.writeText(instruction);
    return {
      status: "copied",
      message: `agent.sync.yaml gefunden in ${path.basename(agentDir)}, aber kein instructions-Feld. Verzeichnis geÃ¶ffnet. Instruction in Zwischenablage.`
    };
  }

  // Show diff before patching
  const original = await fs.readFile(instructionFile, "utf8");
  const patched = patchInstructionsField(original, instruction);

  const relPath = path.relative(workspace.uri.fsPath, instructionFile);
  const confirm = await vscode.window.showInformationMessage(
    `Instructions-Datei: ${relPath}\nInstruction aus system.md einspielen und Apply ausfÃ¼hren?`,
    { modal: true }, "Ja, Apply", "Nur Vorschau", "Datei Ã¶ffnen"
  );

  if (confirm === "Datei Ã¶ffnen") {
    const doc = await vscode.workspace.openTextDocument(instructionFile);
    await vscode.window.showTextDocument(doc);
    return { status: "cancelled", message: "Datei geÃ¶ffnet." };
  }

  if (confirm === "Nur Vorschau") {
    await vscode.commands.executeCommand(CPS_PREVIEW);
    return { status: "copied", message: "Vorschau geÃ¶ffnet." };
  }

  if (confirm === "Ja, Apply") {
    await fs.writeFile(instructionFile, patched, "utf8");
    await vscode.commands.executeCommand(CPS_APPLY);
    return { status: "applied", message: `${relPath} aktualisiert und Apply ausgefÃ¼hrt.` };
  }

  return { status: "cancelled", message: "Abgebrochen." };
}
