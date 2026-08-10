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

// Searches workspace for CPS-cloned agent YAML (instruction file contains "kind: AdaptiveDialog")
async function findCpsInstructionFile(workspaceRoot: string): Promise<string | undefined> {
  const pattern = new vscode.RelativePattern(workspaceRoot, "**/*.yaml");
  const files = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 20);
  for (const f of files) {
    const content = await fs.readFile(f.fsPath, "utf8");
    if (content.includes("kind: AdaptiveDialog") || content.includes("instructions:")) {
      return f.fsPath;
    }
  }
  return undefined;
}

async function patchInstructionInYaml(yamlPath: string, newInstruction: string): Promise<void> {
  const original = await fs.readFile(yamlPath, "utf8");
  // Replace the instructions block: covers single and multi-line values
  const updated = original.replace(
    /^(\s*instructions:\s*)(['"][\s\S]*?['"]|>-[\s\S]*?(?=\n\S|\n$)|\|[\s\S]*?(?=\n\S|\n$)|[^\n]*)/m,
    (_match, key) => `${key}|\n${newInstruction.split("\n").map((l) => `  ${l}`).join("\n")}`
  );
  await fs.writeFile(yamlPath, updated, "utf8");
}

export async function syncLookaInstruction(): Promise<SyncResult> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return { status: "cancelled", message: "Kein Workspace geoeffnet." };
  }

  const instruction = await readSystemMd(workspace.uri.fsPath);
  const yamlFile = await findCpsInstructionFile(workspace.uri.fsPath);

  if (yamlFile) {
    const confirm = await vscode.window.showInformationMessage(
      `CPS-Agent-Datei gefunden: ${path.basename(path.dirname(yamlFile))}/${path.basename(yamlFile)}\nInstruction aktualisieren und Apply ausfuehren?`,
      { modal: true }, "Ja, Apply", "Nur Vorschau"
    );
    if (confirm === "Ja, Apply") {
      await patchInstructionInYaml(yamlFile, instruction);
      await vscode.commands.executeCommand(CPS_APPLY);
      return { status: "applied", message: "Instruction aktualisiert und Apply ausgefuehrt." };
    }
    if (confirm === "Nur Vorschau") {
      await vscode.commands.executeCommand(CPS_PREVIEW);
      return { status: "copied", message: "Vorschau geoeffnet." };
    }
    return { status: "cancelled", message: "Abgebrochen." };
  }

  // Fallback: clipboard + guidance
  await vscode.env.clipboard.writeText(instruction);
  const action = await vscode.window.showWarningMessage(
    "Kein geklonter CPS-Agent im Workspace gefunden. Instruction in Zwischenablage kopiert.",
    "Agent klonen"
  );
  if (action === "Agent klonen") {
    await vscode.commands.executeCommand(CPS_CLONE);
  }
  return { status: "copied", message: "Instruction in Zwischenablage. Bitte in CPS einfuegen." };
}
