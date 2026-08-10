import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import { HwAgentsSettings } from "./settings";

export interface OfficeManifestSkill {
  id: string;
  file: string;
  capabilities: string[];
}

export interface OfficeManifest {
  manifestId: string;
  skills: OfficeManifestSkill[];
}

async function downloadText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GitHub returned HTTP ${res.status} for: ${url}`);
  }
  const text = await res.text();
  // Sanity check: GitHub auth pages return HTML when the repo is private or the URL is wrong
  if (text.trimStart().startsWith("<")) {
    throw new Error(`GitHub returned HTML instead of JSON. Check that the repo is public and the path is correct.\nURL: ${url}`);
  }
  return text;
}

function toRawGithubUrl(settings: HwAgentsSettings): string {
  const sanitizedPath = settings.officeManifestPath.replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${settings.githubOwner}/${settings.githubRepo}/${settings.githubBranch}/${sanitizedPath}`;
}

async function tryReadLocalWorkspaceFile(relativePath: string): Promise<string | undefined> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return undefined;
  }

  const target = path.join(workspace.uri.fsPath, relativePath);
  try {
    return await fs.readFile(target, "utf8");
  } catch {
    return undefined;
  }
}

export async function loadOfficeManifest(settings: HwAgentsSettings): Promise<{ source: "local" | "github"; manifest: OfficeManifest }> {
  const localText = await tryReadLocalWorkspaceFile(settings.officeManifestPath);
  if (localText) {
    return {
      source: "local",
      manifest: JSON.parse(localText) as OfficeManifest
    };
  }

  const url = toRawGithubUrl(settings);
  const remoteText = await downloadText(url);
  return {
    source: "github",
    manifest: JSON.parse(remoteText) as OfficeManifest
  };
}

export function validateOfficeManifest(manifest: OfficeManifest): string[] {
  const errors: string[] = [];

  if (!manifest.manifestId || typeof manifest.manifestId !== "string") {
    errors.push("manifestId fehlt oder ist ungültig.");
  }

  if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    errors.push("skills muss ein nicht-leeres Array sein.");
    return errors;
  }

  const seen = new Set<string>();
  for (const skill of manifest.skills) {
    if (!skill.id || !skill.file) {
      errors.push("Jeder Skill braucht id und file.");
      continue;
    }

    if (seen.has(skill.id)) {
      errors.push(`Doppelte Skill-ID gefunden: ${skill.id}`);
    }
    seen.add(skill.id);

    if (!Array.isArray(skill.capabilities) || skill.capabilities.length === 0) {
      errors.push(`Skill ${skill.id} hat keine capabilities.`);
    }
  }

  return errors;
}

export function manifestToMarkdown(manifest: OfficeManifest, source: "local" | "github", settings: HwAgentsSettings): string {
  const header = [
    "# Office Manifest Preview",
    "",
    `- Source: ${source}`,
    `- Repository: ${settings.githubOwner}/${settings.githubRepo}`,
    `- Branch: ${settings.githubBranch}`,
    `- Path: ${settings.officeManifestPath}`,
    `- Manifest ID: ${manifest.manifestId}`,
    `- Skill Count: ${manifest.skills.length}`,
    ""
  ];

  const skills = manifest.skills.flatMap((skill, index) => [
    `## ${index + 1}. ${skill.id}`,
    `- File: ${skill.file}`,
    `- Capabilities: ${skill.capabilities.join(", ")}`,
    ""
  ]);

  return [...header, ...skills].join("\n");
}
