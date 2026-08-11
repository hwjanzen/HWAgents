# Artika Migration V0.1 (CPS SharePoint -> GitHub)

## Ziel
Artika bleibt funktional stark, wechselt aber auf den gleichen GitHub/Manifest-Betriebsmodus wie die anderen Agenten.

## Ist-Stand
- Ingo und Erkan sind neu in CPS angelegt.
- Artika ist in CPS auf V0.1-Instruction umgestellt und nutzt GitHubDateiAbrufen.
- Ingo, Erkan und Artika sind Applied und Published.
- Im Repo existieren bereits Basisdateien fuer Artika:
   - agents/artika---produkt-managerin-agent/prompts/system.md
  - skills/manifest/artika-manifest.json
  - agents/registry.json

## Ergebnisdefinition
- Artika laedt ihr Skill-Manifest aus GitHub.
- Artika nutzt nur die freigegebenen Tools aus dem V0.1-Set.
- Artika liefert an Ingo nur den vereinbarten Ergebnisvertrag:
  - positiv: Debitor und alle Artikel eindeutig
  - negativ: Kunde/Artikel unklar mit Grund

## Migrationsschritte
1. [x] CPS-Agent Artika in VS Code klonen (Clone Agent).
2. [x] Tool-Inventar aus CPS erfassen:
   - Welche Flows/Connector sind heute aktiv?
   - Welche davon sind fuer V0.1 Pflicht, optional oder zu entfernen?
3. [x] Legacy-Instruction sichern und mit GitHub-Systemprompt abgleichen.
4. [x] GitHub-Manifest fuer Artika erweitern:
   - Bestehende, bewaehrte Artika-Faehigkeiten als Skills nachziehen.
   - Jede Faehigkeit als nachvollziehbaren Skill mit metadata.json + skill.md ablegen.
5. [x] Registry und Manifeste regenerieren/validieren.
6. [x] Artika-Instruction aus agents/artika---produkt-managerin-agent/prompts/system.md in den geklonten CPS-Agent einspielen.
7. [x] In CPS Apply + Publish.
8. [ ] E2E-Test mit Ingo:
   - Positivfall (Debitor/Artikel eindeutig)
   - Negativfall (Kunde oder Artikel unklar)

## V0.1 Guardrails fuer Artika
- Keine freie fachliche Expansion ausserhalb V0.1.
- Ergebnis nur strukturiert an Ingo, keine impliziten Entscheidungen.
- Bei Unklarheit aktiv negativ mit Grund statt Halluzination.

## Abnahmekriterien
- Artika laedt Manifest erfolgreich aus GitHub.
- Artika antwortet in beiden Testfaellen stabil im definierten Ergebnisformat.
- Ingo kann anhand der Artika-Antwort deterministisch routen.

## Bereits nachgezogene Skill-Inhalte
- products.produktsuche
- products.artikelanalyse
- products.kategorienavigation
- products.artikelattribute
- products.montageartikel
- products.artikelnummern
- products.datenqualitaet
