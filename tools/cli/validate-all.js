const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(baseDir, relPath) {
  return fs.existsSync(path.resolve(baseDir, relPath));
}

function main() {
  const root = process.cwd();
  const manifestPath = path.join(root, "skills", "manifest", "office-manifest.json");
  const manifest = readJson(manifestPath);

  const ids = new Set();
  for (const skill of manifest.skills) {
    if (ids.has(skill.id)) {
      throw new Error(`Duplicate skill id: ${skill.id}`);
    }
    ids.add(skill.id);

    const skillFile = path.resolve(path.dirname(manifestPath), skill.file);
    if (!fs.existsSync(skillFile)) {
      throw new Error(`Missing skill file: ${skill.file}`);
    }
  }

  console.log("Validation OK: manifest references and unique IDs are valid.");
}

main();
