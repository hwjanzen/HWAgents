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

// Finds agent.mcs.yml (CPS primary format) or agent.sync.yaml as fallback
async function findAgentRootFile(workspaceRoot: string): Promise<string | undefined> {
  const mcsFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceRoot, "**/agent.mcs.yml"), "**/node_modules/**", 5
  );
  if (mcsFiles.length > 0) { return mcsFiles[0].fsPath; }
  const syncFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceRoot, "**/agent.sync.yaml"), "**/node_modules/**", 5
  );
  return syncFiles[0]?.fsPath;
}

// Returns the agent.mcs.yml itself if it has instructions, otherwise searches siblings
async function findInstructionFile(agentRootFile: string): Promise<string | undefined> {
  const content = await fs.readFile(agentRootFile, "utf8");
  if (content.includes("instructions:")) { return agentRootFile; }
  const agentDir = path.dirname(agentRootFile);
  const siblings = await vscode.workspace.findFiles(
    new vscode.RelativePattern(agentDir, "*.mcs.yml"), undefined, 10
  );
  for (const f of siblings) {
    const c = await fs.readFile(f.fsPath, "utf8");
    if (c.includes("instructions:")) { return f.fsPath; }
  }
  return undefined;
}

// Replaces the instructions block scalar; always writes as literal block (|)
function patchInstructionsField(yaml: string, newInstruction: string): string {
  const indented = newInstruction.trimEnd().split("\n").map((l) => `  ${l}`).join("\n");
  return yaml.replace(
    /(instructions:[ \t]*)(\|[-+]?|>[-+]?)?([\s\S]*?)(?=\n\S|\n*$)/m,
    (_m, key) => `${key}|\n${indented}`
  );
}

export async function syncLookaInstruction(): Promise<SyncResult> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return { status: "cancelled", message: "Kein Workspace geoeffnet." };
  }

  const instruction = await readSystemMd(workspace.uri.fsPath);
  const agentRootFile = await findAgentRootFile(workspace.uri.fsPath);

  if (!agentRootFile) {
    await vscode.env.clipboard.writeText(instruction);
    const action = await vscode.window.showWarningMessage(
      "Kein geklonter CPS-Agent (agent.mcs.yml) im Workspace gefunden.\nInstruction in Zwischenablage kopiert.",
      "Agent klonen"
    );
    if (action === "Agent klonen") {
      await vscode.commands.executeCommand(CPS_CLONE);
    }
    return { status: "copied", message: "Instruction in Zwischenablage. Nach dem Klonen erneut ausführen." };
  }

  const instructionFile = await findInstructionFile(agentRootFile);

  if (!instructionFile) {
    await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(path.dirname(agentRootFile)));
    await vscode.env.clipboard.writeText(instruction);
    return {
      status: "copied",
      message: `agent.mcs.yml gefunden, aber kein instructions-Feld. Verzeichnis geöffnet. Instruction in Zwischenablage.`
    };
  }

  const original = await fs.readFile(instructionFile, "utf8");
  const patched = patchInstructionsField(original, instruction);

  const relPath = path.relative(workspace.uri.fsPath, instructionFile);
  const confirm = await vscode.window.showInformationMessage(
    `Instructions-Datei: ${relPath}\nInstruction aus system.md einspielen und Apply ausführen?`,
    { modal: true }, "Ja, Apply", "Nur Vorschau", "Datei öffnen"
  );

  if (confirm === "Datei öffnen") {
    const doc = await vscode.workspace.openTextDocument(instructionFile);
    await vscode.window.showTextDocument(doc);
    return { status: "cancelled", message: "Datei geöffnet." };
  }

  if (confirm === "Nur Vorschau") {
    await vscode.commands.executeCommand(CPS_PREVIEW);
    return { status: "copied", message: "Vorschau geöffnet." };
  }

  if (confirm === "Ja, Apply") {
    // Write BOM-free UTF-8 so CPS extension reads it correctly
    const { writeFile } = await import("fs/promises");
    await writeFile(instructionFile, patched, { encoding: "utf8" });
    await vscode.commands.executeCommand(CPS_APPLY);
    return { status: "applied", message: `${relPath} aktualisiert und Apply ausgeführt.` };
  }

  return { status: "cancelled", message: "Abgebrochen." };
}
