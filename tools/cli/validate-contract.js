#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020").default;
const addFormats = require("ajv-formats");

const C = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m"
};

function ok(msg) {
  console.log(`${C.green}PASS${C.reset} ${msg}`);
}

function bad(msg) {
  console.log(`${C.red}FAIL${C.reset} ${msg}`);
}

function info(msg) {
  console.log(`${C.yellow}${msg}${C.reset}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fmtErrors(errors) {
  if (!errors || errors.length === 0) {
    return "(no details)";
  }
  return errors
    .slice(0, 5)
    .map((e) => `${e.instancePath || "/"} ${e.message}`)
    .join(" | ");
}

function main() {
  const root = process.cwd();
  const schemaPath = path.join(root, "schemas", "v01-agent-case-contract.schema.json");
  const positivePath = path.join(root, "tests", "contract", "v01-agent-case-contract.reference-cases.json");
  const negativePath = path.join(root, "tests", "contract", "v01-agent-case-contract.invalid-cases.json");

  const schema = readJson(schemaPath);
  const positiveFile = readJson(positivePath);
  const negativeFile = readJson(negativePath);

  const positiveCases = Array.isArray(positiveFile.cases) ? positiveFile.cases : [];
  const negativeCases = Array.isArray(negativeFile.cases) ? negativeFile.cases : [];

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  const validateCase = ajv.compile(schema);

  let hasFailure = false;

  if (positiveCases.length !== 4) {
    bad(`Positive Datei muss genau 4 Faelle enthalten, gefunden: ${positiveCases.length}`);
    hasFailure = true;
  } else {
    ok("Positive Datei enthaelt genau 4 Faelle.");
  }

  if (negativeCases.length !== 2) {
    bad(`Negative Datei muss genau 2 Faelle enthalten, gefunden: ${negativeCases.length}`);
    hasFailure = true;
  } else {
    ok("Negative Datei enthaelt genau 2 Faelle.");
  }

  info("Pruefe positive Referenzfaelle (erwartet: gueltig)...");
  positiveCases.forEach((item, idx) => {
    const valid = validateCase(item);
    const caseId = item && item.caseId ? item.caseId : `index-${idx}`;
    if (valid) {
      ok(`Positive ${idx + 1} (${caseId}) ist gueltig.`);
    } else {
      bad(`Positive ${idx + 1} (${caseId}) ist UNGUELTIG: ${fmtErrors(validateCase.errors)}`);
      hasFailure = true;
    }
  });

  info("Pruefe negative Referenzfaelle (erwartet: ungueltig)...");
  negativeCases.forEach((item, idx) => {
    const valid = validateCase(item);
    const caseId = item && item.caseId ? item.caseId : `index-${idx}`;
    if (!valid) {
      ok(`Negative ${idx + 1} (${caseId}) ist erwartungsgemaess ungueltig.`);
      console.log(`     -> ${fmtErrors(validateCase.errors)}`);
    } else {
      bad(`Negative ${idx + 1} (${caseId}) ist unerwartet GUELTIG.`);
      hasFailure = true;
    }
  });

  if (hasFailure) {
    bad("Contract-Validierung fehlgeschlagen.");
    process.exit(1);
  }

  ok("Contract-Validierung erfolgreich abgeschlossen.");
}

main();
