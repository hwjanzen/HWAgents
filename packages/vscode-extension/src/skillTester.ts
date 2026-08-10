import { HwAgentsSettings } from "./settings";
import { loadOfficeManifest } from "./manifestLoader";

export interface SkillTestResult {
  skillId: string;
  fileUrl: string;
  status: "ok" | "fail";
  error?: string;
  loadedBytes?: number;
}

export async function runSkillTests(settings: HwAgentsSettings): Promise<SkillTestResult[]> {
  const { manifest } = await loadOfficeManifest(settings);
  const results: SkillTestResult[] = [];

  for (const skill of manifest.skills) {
    try {
      const res = await fetch(skill.file);
      if (!res.ok) {
        results.push({ skillId: skill.id, fileUrl: skill.file, status: "fail", error: `HTTP ${res.status}` });
        continue;
      }
      const text = await res.text();
      if (text.trimStart().startsWith("<")) {
        results.push({ skillId: skill.id, fileUrl: skill.file, status: "fail", error: "HTML statt Markdown empfangen" });
        continue;
      }
      results.push({ skillId: skill.id, fileUrl: skill.file, status: "ok", loadedBytes: text.length });
    } catch (e) {
      results.push({ skillId: skill.id, fileUrl: skill.file, status: "fail", error: String(e) });
    }
  }

  return results;
}

export function testResultsToMarkdown(results: SkillTestResult[]): string {
  const ok = results.filter((r) => r.status === "ok").length;
  const lines = [
    "# Skill Baseline Test",
    "",
    `**Ergebnis: ${ok}/${results.length} OK**`,
    "",
    "| Skill | Status | Details |",
    "|---|---|---|",
    ...results.map((r) =>
      `| ${r.skillId} | ${r.status === "ok" ? "✅" : "❌"} | ${r.status === "ok" ? `${r.loadedBytes} Bytes` : r.error} |`
    ),
  ];
  return lines.join("\n");
}
