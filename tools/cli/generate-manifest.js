#!/usr/bin/env node
// Generates agent manifests from registry.json + skill library.
// Usage: node tools/cli/generate-manifest.js [agentId]
//        Omit agentId to regenerate all active agents.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "agents", "registry.json");
const RAW_BASE = "https://raw.githubusercontent.com/hwjanzen/HWAgents/main";

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function discoverSkillsInCategory(category) {
  const categoryDir = path.join(ROOT, "skills", category);
  if (!fs.existsSync(categoryDir)) { return []; }

  return fs.readdirSync(categoryDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const metaPath = path.join(categoryDir, e.name, "metadata.json");
      if (!fs.existsSync(metaPath)) { return null; }
      const meta = loadJson(metaPath);
      const relSkillPath = `skills/${category}/${e.name}/skill.md`;
      return {
        id: meta.id,
        file: `${RAW_BASE}/${relSkillPath}`,
        capabilities: meta.capabilities
      };
    })
    .filter(Boolean);
}

function resolveAdditionalSkill(skillId) {
  // Format: "category.skill_name" → skills/category/skill-name/
  const parts = skillId.split(".");
  if (parts.length < 2) { return null; }
  const category = parts[0];
  const skillName = parts[1].replace(/_/g, "-");
  const metaPath = path.join(ROOT, "skills", category, skillName, "metadata.json");
  if (!fs.existsSync(metaPath)) {
    console.warn(`  WARNING: Additional skill not found: ${skillId}`);
    return null;
  }
  const meta = loadJson(metaPath);
  return {
    id: meta.id,
    file: `${RAW_BASE}/skills/${category}/${skillName}/skill.md`,
    capabilities: meta.capabilities
  };
}

function generateManifest(agent) {
  const skills = [];
  const seenIds = new Set();

  for (const category of (agent.skillCategories || [])) {
    for (const skill of discoverSkillsInCategory(category)) {
      if (!seenIds.has(skill.id)) {
        skills.push(skill);
        seenIds.add(skill.id);
      }
    }
  }

  for (const additionalId of (agent.additionalSkills || [])) {
    const skill = resolveAdditionalSkill(additionalId);
    if (skill && !seenIds.has(skill.id)) {
      skills.push(skill);
      seenIds.add(skill.id);
    }
  }

  return {
    "$schema": "../../schemas/skill-manifest-list.schema.json",
    manifestId: agent.id,
    generatedAt: new Date().toISOString(),
    skills
  };
}

function main() {
  const registry = loadJson(REGISTRY_PATH);
  const targetId = process.argv[2];

  const agents = registry.agents.filter((a) =>
    a.status === "active" && (!targetId || a.id === targetId)
  );

  if (agents.length === 0) {
    console.error(`No active agent found${targetId ? ` with id: ${targetId}` : ""}`);
    process.exit(1);
  }

  for (const agent of agents) {
    console.log(`Generating manifest for: ${agent.id}`);
    const manifest = generateManifest(agent);
    const outPath = path.join(ROOT, agent.manifestFile);
    writeJson(outPath, manifest);
    console.log(`  -> ${agent.manifestFile} (${manifest.skills.length} skills)`);
  }

  console.log("Done.");
}

main();
