import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as fsSync from "fs";
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

// Maps componentName to the corresponding system.md path.
// Some cloned CPS agents use a component name like "Dori - Dokument Analystin",
// which resolves to a folder name with multiple hyphens, while the repo currently
// uses the normalized form "dori-agent". Support both layouts.
function resolveSystemMdPath(workspaceRoot: string, componentName: string): string {
  const raw = componentName.toLowerCase();
  const variants = [
    raw.replace(/\s+/g, "-"),
    raw.replace(/\s*[-_/]+\s*/g, "-"),
    raw.replace(/\s+/g, "-").replace(/-+/g, "-")
  ].map((v) => `${v}-agent`);

  // Keep repo-style naming first, then CPS-derived variants.
  const candidateDirs = [
    ...variants,
    "dori-agent",
    "dori---dokument-analystin-agent",
    "dori-dokument-analystin-agent"
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  for (const dirName of candidateDirs) {
    const candidate = path.join(workspaceRoot, "agents", dirName, "prompts", "system.md");
    if (fsSync.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(workspaceRoot, "agents", candidateDirs[0], "prompts", "system.md");
}

async function findAllAgentFiles(workspaceRoot: string): Promise<vscode.Uri[]> {
  return vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceRoot, "**/agent.mcs.yml"),
    "**/node_modules/**", 10
  );
}

// Line-based replacement ensures the full instructions block is overwritten, not prepended
function patchInstructionsField(yaml: string, newInstruction: string): string {
  const lines = yaml.split("\n");
  const instrIdx = lines.findIndex((l) => /^instructions:/.test(l));
  if (instrIdx === -1) { return yaml; }

  // Collect all continuation lines (indented or empty) belonging to the block
  let endIdx = instrIdx + 1;
  while (endIdx < lines.length && (lines[endIdx].startsWith(" ") || lines[endIdx].startsWith("\t") || lines[endIdx] === "")) {
    endIdx++;
  }

  const indented = newInstruction.trimEnd().split("\n").map((l) => `  ${l}`).join("\n");
  return [
    ...lines.slice(0, instrIdx),
    "instructions: |",
    indented,
    ...lines.slice(endIdx)
  ].join("\n");
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
    // Publish is a separate manual step — applyChanges does not publish
    await vscode.window.showInformationMessage(
      `${componentName}: Apply abgeschlossen.\nBitte in Copilot Studio manuell publizieren (Veröffentlichen-Button).`,
      "OK"
    );
    return { status: "applied", message: `${componentName} aktualisiert. Manuelles Publizieren in CPS erforderlich.` };
  }

  return { status: "cancelled", message: "Abgebrochen." };
}

// Keep old export name for backward compatibility
export const syncLookaInstruction = syncAgentInstruction;
