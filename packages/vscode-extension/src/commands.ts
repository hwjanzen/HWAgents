import * as vscode from "vscode";
import { configureSettings, getSettings } from "./settings";
import { loadOfficeManifest, manifestToMarkdown, validateOfficeManifest } from "./manifestLoader";
import { syncLookaInstruction } from "./lookaSync";
import { runSkillTests, testResultsToMarkdown } from "./skillTester";
import { runSkillWizard } from "./skillWizard";


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
    vscode.commands.registerCommand("hwagents.copyCpsManifestUrl", async () => {
      const settings = getSettings();
      const url = `https://raw.githubusercontent.com/${settings.githubOwner}/${settings.githubRepo}/${settings.githubBranch}/${settings.officeManifestPath}`;
      await vscode.env.clipboard.writeText(url);
      await vscode.window.showInformationMessage(`In Zwischenablage kopiert: ${url}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.showCpsInstructions", async () => {
      const settings = getSettings();
      const manifestUrl = `https://raw.githubusercontent.com/${settings.githubOwner}/${settings.githubRepo}/${settings.githubBranch}/${settings.officeManifestPath}`;
      const lines = [
        "# CPS Office Agent – Looka Konfigurationsanleitung",
        "",
        "## 1. Manifest-URL (fuer DateiinhaltAbrufen)",
        "```",
        manifestUrl,
        "```",
        "",
        "## 2. Agent Instruction fuer Looka",
        "```",
        "Du bist der Office Agent Looka.",
        "",
        "Starte jede Sitzung mit dem Laden des Manifests.",
        "Nutze dazu DateiinhaltAbrufen mit folgendem FullPath:",
        manifestUrl,
        "",
        "Das Manifest listet alle verfuegbaren Skills mit ihren Capabilities.",
        "Jeder Skill enthaelt ein 'file'-Feld mit der vollstaendigen GitHub-URL.",
        "",
        "Arbeite in diesen Schritten:",
        "1. Analysiere die Benutzeranfrage.",
        "2. Waehle den passenden Skill anhand der Capabilities im Manifest.",
        "3. Lade den Skill: Nutze DateiinhaltAbrufen mit dem 'file'-Wert aus dem Manifest direkt als FullPath.",
        "4. Bearbeite die Anfrage gemaess der Skilldefinition.",
        "",
        "Wichtig:",
        "- Nutze ausschliesslich DateiinhaltAbrufen fuer alle Dateioperationen.",
        "- Uebergib immer die vollstaendige URL als FullPath.",
        "- Nutze keine SharePoint-Tools fuer GitHub-Inhalte.",
        "```",
        "",
        "## 3. Testablauf",
        "1. Looka in CPS oeffnen und Instruction ersetzen (siehe Abschnitt 2)",
        "2. Testen: 'Bitte formuliere eine professionelle Antwort auf die Kundenanfrage'",
        "3. Erwartetes Ergebnis:",
        "   - Looka laedt Manifest via DateiinhaltAbrufen",
        "   - Looka waehlt communication.draft_mail",
        "   - Looka laedt skill.md direkt per 'file'-URL aus dem Manifest",
        "   - Antwort wird gemaess Skill erzeugt",
      ];
      const doc = await vscode.workspace.openTextDocument({
        language: "markdown",
        content: lines.join("\n")
      });
      await vscode.window.showTextDocument(doc, { preview: false });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.syncLooka", async () => {
      const result = await syncLookaInstruction();
      if (result.status === "applied") {
        await vscode.window.showInformationMessage(`Looka Sync: ${result.message}`);
      } else if (result.status === "cancelled") {
        await vscode.window.showWarningMessage(`Looka Sync: ${result.message}`);
      } else {
        await vscode.window.showInformationMessage(`Looka Sync: ${result.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.runSkillTests", async () => {
      const settings = getSettings();
      try {
        const results = await runSkillTests(settings);
        const doc = await vscode.workspace.openTextDocument({
          language: "markdown",
          content: testResultsToMarkdown(results)
        });
        await vscode.window.showTextDocument(doc, { preview: false });
        const failed = results.filter((r) => r.status === "fail").length;
        if (failed > 0) {
          await vscode.window.showWarningMessage(`${failed} Skill(s) nicht erreichbar.`);
        } else {
          await vscode.window.showInformationMessage(`Alle ${results.length} Skills erfolgreich geladen.`);
        }
      } catch (e) {
        await vscode.window.showErrorMessage(`Skill-Test fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hwagents.createSkillWizard", async () => {
      const settings = getSettings();
      await runSkillWizard(settings);
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
      const content = [
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
        "3. Execute first Office Agent test in Copilot Studio",
      ].join("\n");
      const doc = await vscode.workspace.openTextDocument({ language: "markdown", content });
      await vscode.window.showTextDocument(doc, { preview: false });
      if (installed) {
        await vscode.window.showInformationMessage("Copilot Studio Extension erkannt. Ready fuer Office-Agent-Test.");
      } else {
        await vscode.window.showWarningMessage("Copilot Studio Extension wurde nicht eindeutig erkannt.");
      }
    })
  );
}
