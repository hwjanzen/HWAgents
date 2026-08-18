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

Aktueller Teststatus:
- [x] Negativfall validiert (GetItem ohne Match -> negativer Ruecklauf an Ingo).
- [ ] Positivfall mit gueltigem Debitor/Artikel bis Erkan-Belegnummer noch offen.

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

## V0.6 Runtime-Handoff

Die V0.6-Suchlogik ist im Repository und im CPS-Export vorbereitet.

### GitHub-Manifest

Artika laedt weiterhin dieses Manifest:

`https://raw.githubusercontent.com/hwjanzen/HWAgents/main/skills/manifest/artika-manifest.json`

Das Manifest enthaelt die neuen Skills:

- `products.position_analyse_v01`
- `products.composita_search_v01`
- `products.article_hypothesis_generator_v01`

### CPS-Schritte vor dem Publish

1. [x] `Artika - Produkt Managerin/agent.mcs.yml` mit der V0.6-Instruction synchronisieren.
2. [x] Manifest mit `npm run manifest:generate` regenerieren.
3. [x] Repository mit `npm run validate:all` validieren.
4. [ ] Agent in Copilot Studio importieren oder Instruction aktualisieren.
5. [ ] `GitHubDateiAbrufen` und die ERP-Tools im Agent pruefen.
6. [ ] Apply und Publish ausfuehren.
7. [ ] Manueller Smoke-Test mit einer internen Artikelnummer, einer Kundenreferenz und einer Komponentensuche ausfuehren.

### Erwartete Suchreihenfolge

`position_analyse_v01` -> `composita_search_v01` -> `article_hypothesis_generator_v01` -> interne Artikel-/Referenztools.

Bei einer plausiblen internen Artikelnummer muss `GetItem` vor `GetItemReferencesByCustomerNo` aufgerufen werden. Bei unbekannter Variante muss fuer `getComponents` und `getParentItems` ein leerer Variantenwert uebergeben werden.
