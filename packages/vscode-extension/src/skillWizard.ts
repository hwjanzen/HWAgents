import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { HwAgentsSettings } from "./settings";

interface NewSkill {
  category: string;
  skillId: string;
  name: string;
  capabilities: string[];
}

async function prompt(message: string, value?: string, validate?: (v: string) => string | undefined): Promise<string | undefined> {
  return vscode.window.showInputBox({ prompt: message, value, ignoreFocusOut: true, validateInput: validate });
}

const required = (v: string) => v.trim().length === 0 ? "Pflichtfeld" : undefined;

export async function runSkillWizard(settings: HwAgentsSettings): Promise<boolean> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    await vscode.window.showErrorMessage("Kein Workspace geoeffnet.");
    return false;
  }
  const root = workspace.uri.fsPath;

  // Step 1: Category
  const categories = ["communication", "meetings", "documents", "productivity", "hr"];
  const categoryPick = await vscode.window.showQuickPick(
    [...categories, "$(add) Neue Kategorie..."],
    { placeHolder: "Kategorie wählen", ignoreFocusOut: true }
  );
  if (!categoryPick) { return false; }
  const category = categoryPick.startsWith("$(add)")
    ? await prompt("Neue Kategorie (Kleinbuchstaben, Bindestrich)", "", required)
    : categoryPick;
  if (!category) { return false; }

  // Step 2: Skill-ID und Name
  const rawId = await prompt("Skill-ID (z.B. draft_report)", "", (v) =>
    /^[a-z0-9_]+$/.test(v.trim()) ? undefined : "Nur Kleinbuchstaben, Zahlen und Unterstrich"
  );
  if (!rawId) { return false; }
  const skillId = `${category}.${rawId.trim()}`;

  const name = await prompt("Anzeigename (z.B. Draft Report)", rawId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), required);
  if (!name) { return false; }

  // Step 3: Capabilities (kommasepariert)
  const capInput = await prompt("Capabilities (kommasepariert)", "", required);
  if (!capInput) { return false; }
  const capabilities = capInput.split(",").map((c) => c.trim()).filter(Boolean);

  const skill: NewSkill = { category, skillId, name, capabilities };

  // Step 4: Dateien schreiben
  const folderName = rawId.trim().replace(/_/g, "-");
  const skillDir = path.join(root, "skills", category, folderName);
  await fs.mkdir(skillDir, { recursive: true });

  await fs.writeFile(path.join(skillDir, "metadata.json"), JSON.stringify({
    $schema: "../../../schemas/skill-metadata.schema.json",
    id: skill.skillId,
    name: skill.name,
    category: skill.category,
    capabilities: skill.capabilities
  }, null, 2) + "\n", "utf8");

  const rawBase = `https://raw.githubusercontent.com/${settings.githubOwner}/${settings.githubRepo}/${settings.githubBranch}`;
  const fileUrl = `${rawBase}/skills/${category}/${folderName}/skill.md`;

  await fs.writeFile(path.join(skillDir, "skill.md"),
    `# ${skill.name}\n\n## Zweck\n\n## Ausgabe\n\n## Regeln\n`, "utf8");

  // Step 5: Manifest aktualisieren
  const manifestPath = path.join(root, "skills", "manifest", "office-manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.skills.push({ id: skill.skillId, file: fileUrl, capabilities: skill.capabilities });
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  // Step 6: skill.md im Editor öffnen
  const doc = await vscode.workspace.openTextDocument(path.join(skillDir, "skill.md"));
  await vscode.window.showTextDocument(doc);

  await vscode.window.showInformationMessage(
    `Skill "${skill.name}" angelegt. Fülle skill.md aus, dann committen.`
  );
  return true;
}
