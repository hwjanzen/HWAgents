import * as vscode from "vscode";

export interface HwAgentsSettings {
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  officeManifestPath: string;
}

const DEFAULT_SETTINGS: HwAgentsSettings = {
  githubOwner: "hwjanzen",
  githubRepo: "HWAgents",
  githubBranch: "main",
  officeManifestPath: "skills/manifest/office-manifest.json"
};

export function getSettings(): HwAgentsSettings {
  const config = vscode.workspace.getConfiguration("hwagents");

  return {
    githubOwner: config.get<string>("githubOwner", DEFAULT_SETTINGS.githubOwner),
    githubRepo: config.get<string>("githubRepo", DEFAULT_SETTINGS.githubRepo),
    githubBranch: config.get<string>("githubBranch", DEFAULT_SETTINGS.githubBranch),
    officeManifestPath: config.get<string>("officeManifestPath", DEFAULT_SETTINGS.officeManifestPath)
  };
}

export async function configureSettings(): Promise<HwAgentsSettings | undefined> {
  const current = getSettings();

  const githubOwner = await vscode.window.showInputBox({
    prompt: "GitHub Owner (User oder Organisation)",
    value: current.githubOwner,
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim().length === 0 ? "Owner darf nicht leer sein." : undefined)
  });
  if (!githubOwner) {
    return undefined;
  }

  const githubRepo = await vscode.window.showInputBox({
    prompt: "GitHub Repository Name",
    value: current.githubRepo,
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim().length === 0 ? "Repo darf nicht leer sein." : undefined)
  });
  if (!githubRepo) {
    return undefined;
  }

  const githubBranch = await vscode.window.showInputBox({
    prompt: "GitHub Branch",
    value: current.githubBranch,
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim().length === 0 ? "Branch darf nicht leer sein." : undefined)
  });
  if (!githubBranch) {
    return undefined;
  }

  const officeManifestPath = await vscode.window.showInputBox({
    prompt: "Pfad zum Office Manifest im Repository",
    value: current.officeManifestPath,
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim().length === 0 ? "Manifest-Pfad darf nicht leer sein." : undefined)
  });
  if (!officeManifestPath) {
    return undefined;
  }

  const config = vscode.workspace.getConfiguration("hwagents");
  const target = vscode.workspace.workspaceFolders?.length
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
  await config.update("githubOwner", githubOwner.trim(), target);
  await config.update("githubRepo", githubRepo.trim(), target);
  await config.update("githubBranch", githubBranch.trim(), target);
  await config.update("officeManifestPath", officeManifestPath.trim(), target);

  return getSettings();
}
