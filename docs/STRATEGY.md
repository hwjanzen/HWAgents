# HW Agents Platform — Projekt-Roadmap

## Projektfokus V0.1
Ziel ist die automatisierte Erfassung von Verkaufsauftraegen und Verkaufsangeboten aus eingehenden Kunden-E-Mails.

In V0.1 wird bewusst nur die stabile Kommunikation und ein nachvollziehbares Routing zwischen den Agenten umgesetzt. Die fachliche Intelligenz bleibt auf wenige klar definierte Szenarien begrenzt.

Agenten koennen weiterhin ihre produktiven Skills behalten. Fuer die V0.1-Validierung wird ein Testmodus vorgesehen (Manifest oder Instruction), sodass nur Testszenarien die reduzierte Prozesslogik triggern.

## Vision
Zentrale, versionierte Skill- und Agenten-Plattform fuer Microsoft Copilot Studio.
Agenten sind schlank und manifest-gesteuert — Fachlogik lebt in Skills, nicht in Instructions.

## Architektur-Prinzipien
- Skills beschreiben WIE gearbeitet wird. Prozessdokumentationen beschreiben WAS bekannt ist.
- Agenten-Instructions bleiben minimal (max. ~16 Zeilen). Alles Fachliche gehoert in Skills.
- Skills sind wiederverwendbar und agentenuebergreifend.
- GitHub ist die einzige Source of Truth. SharePoint und CPS lesen von GitHub.
- VS Code Extension ist die Verwaltungsoberflaeche fuer Agenten, Skills und Routing.

## Naechste Ausbaustufe: Multi Agent Orchestrated Process (V0.1)

### Rollenmodell
- Ingo: zentraler Orchestrator im Innendienst, fuehrt den End-to-End-Vorgang.
- Looka: Office Agent fuer die initiale E-Mail-Klassifikation.
- Artika: Produktmanagerin, identifiziert Debitor und Artikel.
- Erkan: operative Erfassung in Microsoft Dynamics 365 Business Central.
- Tanja: Human in the Loop bei unklaren oder fehlerhaften Faellen.

### Zielbild
- Startpunkt ist eine neue Kunden-E-Mail.
- Endpunkt ist entweder ein erfolgreich erzeugter Beleg (Auftrag/Angebot) oder eine geordnete Uebergabe an Tanja.
- Jeder Vorgang erhaelt eine eindeutige Referenz (Case-ID), die zwischen allen Agenten mitgefuehrt wird.

### Prozessablauf V0.1
1. Eingang einer neuen Kunden-E-Mail.
2. Looka klassifiziert die Anfrage in genau eine von vier Kategorien:
  - Auftrag + Artikel eindeutig erkannt
  - Auftrag + Artikel unklar
  - Angebot + Artikel eindeutig erkannt
  - Angebot + Artikel unklar
3. Ingo eroeffnet den Vorgang (Case-ID) und bewertet die Mindestvollstaendigkeit.
4. Falls Informationen unbrauchbar oder unvollstaendig sind: sofortiger Abbruch mit Uebergabe an Tanja.
5. Falls grundsaetzlich verarbeitbar: Weitergabe an Artika.
6. Artika liefert zurueck:
  - positiv: Debitor eindeutig gefunden UND alle benoetigten Artikel gefunden
  - negativ: Kunde oder mindestens ein benoetigter Artikel nicht eindeutig identifizierbar
7. Bei positivem Ergebnis von Artika leitet Ingo an Erkan weiter.
8. Erkan erzeugt in Business Central den passenden Beleg (Verkaufsauftrag oder Verkaufsangebot) und meldet die Belegnummer an Ingo zurueck.

### Routing- und Abbruchregeln
- Ingo stoppt den Prozess sofort, sobald ein negativer Status vorliegt.
- Bei jedem Abbruch informiert Ingo Tanja mit konkretem Grund.
- Nur bei durchgehend positivem Status erfolgt der Abschluss als Erfolg.

### V0.1-Szenarien
1. Auftrag erkannt, Artikel identifizierbar, Verkaufsauftrag erfolgreich angelegt.
2. Auftrag erkannt, Artikel unklar oder nicht auffindbar, Uebergabe an Tanja.
3. Angebot erkannt, Artikel identifizierbar, Verkaufsangebot erfolgreich angelegt.
4. Angebot erkannt, Artikel unklar/unvollstaendig, Uebergabe an Tanja.

### Endzustaende V0.1
- Erfolg: Verkaufsauftrag oder Verkaufsangebot mit Belegnummer erzeugt und an Tanja gemeldet.
- Nicht erfolgreich: Prozessabbruch mit Begruendung und Uebergabe an Tanja zur manuellen Bearbeitung.

### Scope-Grenze V0.1
- Keine komplexe KI-Interpretation freier Texte.
- Keine vollautomatische Kundenerkennung ausserhalb der definierten Artika-Logik.
- Keine erweiterte Produktauswahl-Optimierung.

---

## Aktueller Stand (Meilenstein 1 abgeschlossen)

### Repository-Struktur
```
agents/
  registry.json           <- zentrales Agenten-Verzeichnis
  helmut-agent/prompts/system.md
  looka-agent/prompts/system.md
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

## Entwicklungsstufe V0.2 (fachliche Erweiterung Artika)

In V0.2 bleibt die Agentenkommunikation zwischen Looka, Ingo, Artika, Erkan und Tanja unveraendert.
Der Fokus liegt ausschliesslich auf Artikas produktiver Recherchefaehigkeit.

### V0.2 Ziel
- Artika recherchiert Debitoren auf Basis eines Firmennamens.
- Artika loest Kundenartikelreferenzen auf interne ERP-Artikelnummern auf.
- Artika liefert bei Mehrdeutigkeiten Kandidaten statt Entscheidungen.
- Ingo bleibt schlanker Orchestrator ohne automatische Auswahl bei Mehrdeutigkeit.
- Ingo, Artika und Erkan arbeiten im Innendienst strikt ohne Online-Recherche.

### V0.2 Scope
- Neue Artika-Tools/Skills:
  - products.search_debitors_v02
  - products.search_customer_article_references_v02
- Neue Ingo-Orchestrierungs-Skills:
  - orchestration.detect_case_state_v02
  - orchestration.plan_next_action_v02
  - orchestration.resolve_ambiguous_debitor_v02
- Neue Shared-Compliance fuer Innendienst:
  - shared.innendienst_compliance_v02
- Debitorensuche basiert in V0.2 nur auf Firmennamen.
- Artikelsuche basiert auf Kundenreferenzen und Referenztexten in internen Daten.
- Keine Websuche und keine Herstellernummern als interne Artikelnummer.
- Looka bleibt ausgenommen und darf fuer die Formulierung von Mailtexten netzoffen arbeiten.

### V0.2 Ergebnisregeln
- Debitorensuche:
  - genau ein Treffer -> unique
  - mehrere Treffer -> ambiguous mit Kandidatenliste
  - kein Treffer -> not_found
- Artikelreferenzsuche:
  - genau ein Treffer -> unique
  - mehrere Treffer -> ambiguous mit Kandidatenliste
  - kein Treffer -> not_found
- Prozessentscheidung durch Ingo:
  - beide Ergebnisse unique -> Weitergabe an Erkan
  - sonst -> Human-in-the-Loop Uebergabe an Tanja

## Entwicklungsstufe V0.4 - Dori (Document Request Interpreter)

Mit der Entwicklungsstufe V0.4 wird die Agentenarchitektur um einen neuen spezialisierten Agenten erweitert: Dori (Document Request Interpreter). Die Einführung von Dori erfolgt vor dem Hintergrund, dass die Dokumentenanalyse zunehmend komplexer wird und nicht langfristig durch den Orchestrator Ingo übernommen werden sollte. Während Ingo für die Steuerung der Prozesse, die Koordination der Agenten und die Entscheidungsfindung verantwortlich bleibt, übernimmt Dori künftig die vollständige Interpretation eingehender Dokumente.

Dori fungiert als zentrale Instanz für das Dokumentenverständnis innerhalb des Multi-Agenten-Systems. Seine Aufgabe besteht darin, eingehende Kundenunterlagen zu analysieren, relevante Geschäftsdaten zu erkennen und diese in eine strukturierte Form für die nachgelagerten Agenten aufzubereiten. In der ersten Ausbaustufe verarbeitet Dori insbesondere PDF-Dokumente und unstrukturierte Fließtexte aus E-Mails oder Dokumentanhängen. In späteren Entwicklungsstufen wird der Funktionsumfang auf strukturierte Formate wie XML-Dokumente erweitert.

### Dori-Analyseprozess

Der Analyseprozess von Dori gliedert sich in mehrere Schritte. Zunächst liest Dori das Dokument ein und identifiziert dessen grundlegende Struktur. Anschließend extrahiert er die relevanten Geschäftsinformationen wie Kundennamen, Bestellpositionen, Mengen, Preise, Referenzen und weitere auftragsrelevante Daten. Dabei beschränkt sich Dori nicht auf die reine Texterkennung, sondern interpretiert auch die Bedeutung der einzelnen Felder innerhalb des Dokuments. Ziel ist es, die fachliche Struktur einer Kundenbestellung unabhängig von deren Aufbau zu verstehen.

Ein besonderer Schwerpunkt liegt auf der Identifikation und Klassifizierung von Artikelinformationen. Dori soll erkennen, welche Spalten Kundenreferenzen enthalten, welche Werte interne Artikelnummern darstellen und welche Informationen Mengen, Preise oder Beschreibungen repräsentieren. Hierdurch entsteht bereits vor der eigentlichen Auftragsbearbeitung ein strukturiertes Bestellmodell, das den weiteren Agenten zur Verfügung gestellt werden kann.

### Rollenverteilung V0.4

Nach Abschluss der Analyse übergibt Dori seine Ergebnisse an Ingo. Anstatt ein Rohdokument zu erhalten, arbeitet Ingo künftig mit einem fachlich interpretierten Datenmodell. Dadurch wird die Verantwortung klar getrennt:

- Dori versteht und strukturiert Dokumente.
- Ingo orchestriert den Gesamtprozess, koordiniert die Agenten und trifft Entscheidungen.
- Artika validiert Kunden- und Artikeldaten.
- Erkan übernimmt die Anlage von Angeboten und Aufträgen im ERP-System.

Die Zielarchitektur von V0.4 sieht somit eine klare Spezialisierung der Agenten vor. Dori entwickelt sich zum Experten für Dokumentenanalyse und Dokumentenverständnis. Er bildet die Brücke zwischen unstrukturierten Kundenunterlagen und den strukturierten Geschäftsprozessen des Systems. Durch diese Erweiterung wird die Gesamtarchitektur modularer, skalierbarer und besser auf zukünftige Anforderungen vorbereitet. Insbesondere die spätere Verarbeitung unterschiedlicher Dokumenttypen wie PDF, E-Mail-Texten, XML-Dateien oder weiterer elektronischer Belegformate kann dadurch umgesetzt werden, ohne den Orchestrator Ingo zusätzlich zu belasten.

### Technische Umsetzung im Repo

- Dori erhält eine eigene Agent-Definition in der Registry und ein eigenes Systemprompt.
- Dori nutzt einen dedizierten Document-Skill, der das eingehende Dokument in ein strukturiertes Bestellmodell übersetzt.
- Ingo wird auf das neue Dokumentverständnis ausgerichtet: Ingo arbeitet mit dem interpretierten Modell, nicht mit Rohdaten.
- Das Skill-Manifest für Ingo wird um Dokumentenverständnis erweitert, damit die neue Architektur in CPS konsistent abgebildet wird.

## Offene Punkte / Naechste Schritte

### CPS Deployment Status (Stand 2026-08-11)
- [x] Ingo in CPS angelegt, GitHubDateiAbrufen zugewiesen, Applied und Published.
- [x] Erkan in CPS angelegt, GitHubDateiAbrufen zugewiesen, Applied und Published.
- [x] Artika in CPS auf V0.1-Instruction umgestellt, GitHubDateiAbrufen zugewiesen, Applied und Published.

### Smoke-Test Status (Stand 2026-08-12)
- [x] Technischer Startpunkt auf Ingo umgestellt (Orchestrator als Entry-Agent).
- [x] Routing Ingo -> Artika funktioniert ohne Agent-Chaining-Fehler.
- [x] Negativpfad fachlich bestaetigt: Artika prueft reale Artikeldaten via GetItem und liefert bei fehlendem Match korrekt negativ.
- [x] Positivpfad mit gueltiger Debitor/Artikel-Kombination bis Erkan-Belegnummer (completed) bestaetigt.
- [x] Interne Artikelsuche gehaertet: keine Websuche und keine Hersteller-Artikelnummer als interne Nummer.
- [x] Unklare Artikelanfrage mit Kandidatenliste und Nutzerauswahl bis Abschluss getestet.

### Meilenstein 2 (neu priorisiert: Ingo Orchestrator V0.1)
- [x] Agentenrollen in Registry und Routing-Konfiguration abbilden (Ingo, Looka, Artika, Erkan, Tanja).
- [x] Einheitliches Vorgangsobjekt (Case-ID, Dokumentart, Status, Fehlergrund) definieren (Schema: schemas/v01-agent-case-contract.schema.json).
- [x] Looka-Klassifikation auf vier V0.1-Kategorien begrenzen (Testmodus, Contract-Werte order_item_* / quote_item_*).
- [x] Ingo-Routingregeln als zustandsbasierten Ablauf implementieren (inkl. fruehem Abbruch, Contract-Statusmodell).
- [x] Artika von altem SharePoint-Skillstand auf GitHub-Manifeststand migrieren (Skill-Inhalte nachgezogen; Tools/Prompt im GitHub-Modus).
- [x] Artika-Ergebnisvertrag definieren: positiv/negativ inkl. strukturierter Fehlergruende (Contract v0.1).
- [x] Erkan-Auftrag fuer BC-Erfassung standardisieren (Dokumentart, Debitor, Artikelpositionen) (Contract v0.1).
- [x] Abschlussmeldungen an Tanja vereinheitlichen (Erfolg mit Belegnummer vs. Abbruch mit Grund) (Contract v0.1, Feld tanjaOutput).

### Bestehender Plattform-Track (parallel)
- [ ] T02: Prozess erklaeren testen (bestehende SharePoint-Doku lesen)
- [ ] T03: Dokumentation aktualisieren testen
- [ ] HELMUT: SharePoint-Wissensquellen-Anbindung verfeinern
- [ ] Looka: Restliche 6 Office-Skills mit echten Testdaten validieren

### V0.1 Abschluss (Stand 2026-08-12)
- [x] Referenzdatensatz fuer Positivpfad festgelegt und erfolgreich ausgefuehrt.
- [x] E2E Positivlauf ueber Ingo durchgefuehrt: Looka -> Artika -> Erkan -> completed.
- [x] Ingo-Prompt verschlankt; fachliche Vertriebsinnendienst-Logik in Skills ausgelagert.
- [x] Tanja-Handover ueber Looka-Mailentwurf (subject + message) in allen Zielcases umgesetzt.

### Next Step (V0.2 Umsetzung und Test)
- [x] Debitorensuche als Skill products.search_debitors_v02 eingefuehrt.
- [x] Kundenartikelreferenzsuche als Skill products.search_customer_article_references_v02 eingefuehrt.
- [x] Contract um strukturierte Suchergebnisse (debitorSearch, articleReferenceSearch) erweitert.
- [x] Ingo auf schlankes V0.2-Skill-Set fuer Zustand, Folgeaktion und Debitor-Klaerung umgestellt.
- [x] Innendienst-Compliance als Shared-Kernregel eingefuehrt (nie online suchen, Kollegen befragen).
- [ ] E2E-Testfaelle fuer unique, ambiguous und not_found bei Debitor und Artikelreferenz durchfuehren.
- [ ] Artika-Runtime-Ausgabe gegen den erweiterten Contract stabilisieren.

### V0.3 Definition of Done (Start-Template)
- [ ] Debitorensuche erweitert: zusaetzliche Suchkriterien (z. B. Ort/PLZ) ohne Regelbruch der Innendienst-Compliance.
- [ ] Artikelreferenz-Matching verbessert: nachvollziehbare Match-Begruendung je Treffer (unique/ambiguous/not_found).
- [ ] Contract-Erweiterung versioniert und rueckwaertskompatibel dokumentiert.
- [ ] E2E-Tests fuer Positiv- und Negativpfade inkl. Mehrdeutigkeitsaufloesung automatisiert und bestanden.
- [ ] Runtime-Qualitaet: keine Web-Fallback-Antworten bei Ingo, Artika oder Erkan.
- [ ] Publish-Checkliste (Sync, Apply, Publish) fuer alle betroffenen Agenten dokumentiert und verifiziert.

## Entwicklungsstufe V0.3 (iterative Abstimmung Ingo + Artika)

### Zielbild V0.3
- Ingo validiert unklare Positionsdaten iterativ statt sie direkt weiterzuleiten.
- Pro Position werden Hypothesen gebildet und mit Artika nacheinander geprueft.
- Erst bei vollstaendiger eindeutiger Aufloesung aller Positionen erfolgt Handover zu Erkan.
- Wenn mindestens eine Position nicht eindeutig aufloesbar ist: Handover an Human-in-the-Loop.

### V0.3 Kernablauf
1. Ingo extrahiert Kundenname, Positionen, Mengen und Referenzhinweise aus der Bestellung.
2. Debitor wird mit Artika eindeutig bestimmt.
3. Fuer jede Position erzeugt Ingo mehrere Bedeutungs-Hypothesen.
4. Artika prueft die Hypothesen iterativ gegen Kundenreferenzen und internen Artikelstamm.
5. Ingo bewertet pro Iteration die Ergebnisse und waehlt den naechsten Check.
6. Go-NoGo Entscheidung:
  - alle Positionen resolved -> Erkan
  - mindestens eine unresolved -> Human-in-the-Loop

### V0.3 Implementierungsstand (Foundation)
- [x] Ingo-Skills fuer Hypothesenbildung, Iteration und Handover-Entscheidung angelegt.
- [x] Ingo-Instruction auf V0.3-Fluss umgestellt.
- [x] Artika-Instruction fuer positionierte Hypothesenpruefung erweitert.
- [x] Contract um optionale Positions- und Iterationsfelder erweitert.
- [ ] E2E-Testserie V0.3 fuer mehrdeutige Feldbedeutungen durchlaufen.

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
