import * as vscode from "vscode";
import { configureSettings, getSettings } from "./settings";
import { loadOfficeManifest, manifestToMarkdown, validateOfficeManifest } from "./manifestLoader";

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.hello", async () => {
      await vscode.window.showInformationMessage("HW Agents Extension aktiv.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.configureProject", async () => {
      const updated = await configureSettings();
      if (!updated) {
        return;
      }

      await vscode.window.showInformationMessage(
        `HW Agents Konfiguration gespeichert: ${updated.githubOwner}/${updated.githubRepo}@${updated.githubBranch}`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.previewOfficeManifest", async () => {
      const settings = getSettings();

      try {
        const { source, manifest } = await loadOfficeManifest(settings);
        const errors = validateOfficeManifest(manifest);

        const report = manifestToMarkdown(manifest, source, settings);
        const doc = await vscode.workspace.openTextDocument({
          language: "markdown",
          content: report
        });
        await vscode.window.showTextDocument(doc, { preview: false });

        if (errors.length > 0) {
          await vscode.window.showWarningMessage(`Manifest geladen mit ${errors.length} Validierungsproblem(en).`);
          const output = vscode.window.createOutputChannel("HW Agents");
          output.appendLine("Manifest Validation Issues:");
          for (const err of errors) {
            output.appendLine(`- ${err}`);
          }
          output.show(true);
          return;
        }

        await vscode.window.showInformationMessage(`Office Manifest geladen (${manifest.skills.length} Skills, Quelle: ${source}).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        await vscode.window.showErrorMessage(`Manifest konnte nicht geladen werden: ${message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.checkCopilotStudio", async () => {
      const installed = vscode.extensions.all.find(
        (ext) =>
          ext.id.toLowerCase().includes("copilot-studio") ||
          ext.packageJSON?.displayName?.toLowerCase?.().includes("copilot studio")
      );

      const settings = getSettings();
      const lines = [
        "# Copilot Studio Readiness",
        "",
        `- Copilot Studio Extension: ${installed ? "Installed" : "Not detected"}`,
        `- Detected ID: ${installed?.id ?? "n/a"}`,
        `- GitHub Repo: ${settings.githubOwner}/${settings.githubRepo}`,
        `- Branch: ${settings.githubBranch}`,
        `- Office Manifest Path: ${settings.officeManifestPath}`,
        "",
        "## Next Test",
        "1. Run: HW Agents: Preview Office Manifest",
        "2. Verify loaded skills match Office baseline",
        "3. Execute first Office Agent test in Copilot Studio"
      ];

      const doc = await vscode.workspace.openTextDocument({
        language: "markdown",
        content: lines.join("\n")
      });
      await vscode.window.showTextDocument(doc, { preview: false });

      if (installed) {
        await vscode.window.showInformationMessage("Copilot Studio Extension erkannt. Ready fuer Office-Agent-Test.");
      } else {
        await vscode.window.showWarningMessage("Copilot Studio Extension wurde nicht eindeutig erkannt.");
      }
    })
  );
}
