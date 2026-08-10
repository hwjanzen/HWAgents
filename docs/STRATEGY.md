# HW Agents Platform — Projekt-Roadmap

## Vision
Zentrale, versionierte Skill- und Agenten-Plattform fuer Microsoft Copilot Studio.
Agenten sind schlank und manifest-gesteuert — Fachlogik lebt in Skills, nicht in Instructions.

## Architektur-Prinzipien
- Skills beschreiben WIE gearbeitet wird. Prozessdokumentationen beschreiben WAS bekannt ist.
- Agenten-Instructions bleiben minimal (max. ~16 Zeilen). Alles Fachliche gehoert in Skills.
- Skills sind wiederverwendbar und agentenuebergreifend.
- GitHub ist die einzige Source of Truth. SharePoint und CPS lesen von GitHub.
- VS Code Extension ist die Verwaltungsoberflaeche fuer Agenten, Skills und Routing.

---

## Aktueller Stand (Meilenstein 1 abgeschlossen)

### Repository-Struktur
```
agents/
  registry.json           <- zentrales Agenten-Verzeichnis
  helmut-agent/prompts/system.md
  office-agent/prompts/system.md
skills/
  manifest/
    helmut-manifest.json  <- auto-generiert via generate-manifest.js
    looka-manifest.json   <- auto-generiert
  communication/          <- Looka-Skills
  processes/              <- HELMUT-Skills
  shared/                 <- agentenuebergreifende Skills
packages/vscode-extension/  <- VS Code Extension
tools/cli/
  generate-manifest.js    <- erzeugt Manifeste aus registry.json + Skill-Library
  validate-all.js         <- validiert Manifest-Referenzen
```

### Aktive Agenten
| Agent | Typ | Status | Skills |
|---|---|---|---|
| Looka | Communication | Produktiv | 8 Communication-Skills |
| HELMUT | Process-Manager | Produktiv | 8 Process-Skills |

### VS Code Extension Commands
- HW Agents: Configure Project
- HW Agents: Preview Office Manifest
- HW Agents: Run Skill Tests
- HW Agents: Sync Agent Instruction (agenten-agnostisch, QuickPick)
- HW Agents: Create New Skill (Wizard)
- HW Agents: Copy CPS Manifest URL
- HW Agents: Show CPS Setup Instructions
- HW Agents: Check Copilot Studio Integration

---

## Key Learnings (hart erarbeitet)

### CPS Tool-Aufruf-Verhalten
- CPS befuellt Flow-Parameter semantisch, nicht nach Skill-Instruktionen.
- Der laengste Text geht immer in das erste verfuegbare Pflicht-Feld.
- Loesung: Flow-Parameter-Namen mit semantischen Beispielwerten versehen (Power Automate Trigger).
- Bewiesene Formel: `FileName` + `Inhalt` als Flow-Parameter-Namen funktioniert.

### Skill vs. Instruction
- Instruction = max. 16 Zeilen, nur Routing-Logik und Manifest-URL.
- Alles Fachliche (Kategorien, Abteilungen, ERP-Modell, Tool-Mapping) gehoert in Skills.
- CPS Topics interferieren mit Skill-Logik -> Custom Topics deaktiviert, nur System-Topics aktiv.

### Manifest-Generator
- npm run manifest:generate generiert alle Manifeste aus registry.json automatisch.
- CI prueft: Manifeste muessen vor dem Merge generiert und committed sein.
- Neuen Agenten anlegen: 3 Schritte (registry.json, system.md, generate-manifest).

### GitHubDateiAbrufen-Tool
- Muss pro Agent in CPS registriert sein (Tools-Tab).
- flowId: 7b649503-9294-f111-8075-e4fb1ef70549 (geteilt zwischen Looka und HELMUT).
- Fehlt dieses Tool: Agent laed kein Manifest, faellt auf andere Tools zurueck.

---

## HELMUT — Prozess-Skills

### Aktive Skills
| Skill | Zweck | Status |
|---|---|---|
| prozessaufnahme | Orchestriert Interview -> Validierung -> Dokumentation | Produktiv |
| interview_fuehren | ERP-Modell, Kategorien, Abteilungen erfassen | Produktiv |
| dokumentation_erstellen | Dokumentationstext aufbauen + SharePoint-Speicherung | Produktiv |
| prozess_erklaeren | Prozessfragen beantworten, WIE/WAS-Prinzip | Produktiv |
| dokumentation_aktualisieren | Bestehende Dokumentation aktualisieren | Bereit |
| copilot_wissen_aufbauen | Dokumentation agentenfaehig strukturieren | Bereit |

### HELMUT Tool-Setup in CPS (Pflicht)
- GitHubDateiAbrufen (Flow) -- laedt Manifest und Skills
- SpeichereVerifiziertesProzessdokument (Flow) -- speichert in SharePoint
- SharepointDateiAbrufen (Flow) -- liest bestehende Prozessdokumentationen
- Alle Custom-Topics deaktiviert

### Flow-Parameter-Mapping (bewaehrt)
```
Flow: SpeichereVerifiziertesProzessdokument
FileName  -> kurzer Dateiname (Prozessdokumentation_<Name>.txt)
Inhalt    -> vollstaendiger Dokumentationstext
Kategorie -> ein zulaessiger Kategorie-Wert
Abteilung -> JSON-Array-String ([{"Value":"Vertrieb"}])
```

---

## Offene Punkte / Naechste Schritte

### Meilenstein 2 (geplant)
- [ ] T02: Prozess erklaeren testen (bestehende SharePoint-Doku lesen)
- [ ] T03: Dokumentation aktualisieren testen
- [ ] HELMUT: SharePoint-Wissensquellen-Anbindung verfeinern
- [ ] Looka: Restliche 6 Office-Skills mit echten Testdaten validieren

### Skalierung (Phase 2, 5-20 Agenten)
- [ ] Manifest-Generator auf alle Agenten-Typen erweitern
- [ ] Agent-Templates einfuehren (communication, process-manager, hr-agent)
- [ ] Skill-Kategorien konsolidieren (shared-Skills ausbauen)
- [ ] CI: URL-Erreichbarkeit der Skill-Dateien pruefen

### VS Code Extension (naechste Features)
- [ ] Agent-Katalog-View (alle Agenten aus registry.json anzeigen)
- [ ] Bulk-Sync (alle Agenten auf einmal)
- [ ] Skill-Status-Dashboard (welche Skills sind veraltet?)

---

## Workflow: Neuer Agent
1. Eintrag in agents/registry.json ergaenzen.
2. system.md unter agents/{id}-agent/prompts/ erstellen (max. 16 Zeilen).
3. npm run manifest:generate:{id} ausfuehren.
4. In CPS: GitHubDateiAbrufen-Tool hinzufuegen.
5. Sync Agent Instruction -> Apply -> Publizieren.

## Workflow: Neuer Skill
1. HW Agents: Create New Skill Wizard ausfuehren.
2. skill.md ausfullen.
3. npm run manifest:generate ausfuehren.
4. Committen und pushen.
