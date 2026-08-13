# Dori V0.4 Diagnose-Fragenkatalog

## Zweck

Dieser Fragenkatalog dient dazu, Abweichungen zwischen Doris erwartetem und tatsächlichem Verhalten reproduzierbar einzugrenzen. Er wird pro Testlauf ausgefuellt und anhand der Toolspur, der Skillausgabe und des finalen `documentModel` beantwortet.

Der Katalog trennt vier Ebenen:

1. Eingang und Extraktion
2. Skill- und Manifestaufladung
3. Zustandsmaschine und Toolreihenfolge
4. Ergebnis- und Abschlusskonsistenz

## Testprotokoll

Vor jeder Analyse festhalten:

- Test-ID:
- Datum/Uhrzeit:
- Branch/Commit:
- CPS-Agentenversion:
- Verwendetes Dokument:
- Dokument erneut importiert: ja | nein
- Erwartetes Ergebnis:
- Tatsächliches Ergebnis:
- Abweichung in einem Satz:

## A. Eingang und Extraktion

### A1. Wurde der richtige Eingang verarbeitet?

- Wurde genau das erwartete Dokument oder der erwartete Text übergeben?
- Wurde ein altes Dokumentmodell aus einem vorherigen Lauf wiederverwendet?
- Wurde das Dokument einmal vollständig gelesen?

**Evidenz:** Eingangsnachricht, Dateiname, Laufprotokoll.

**Mögliche Ursache:** Falscher Eingang, Session-Kontext, Wiederverwendung alter Variablen.

### A2. Sind die Rollen korrekt?

- Ist `buyer` der Besteller?
- Ist `supplier` der Lieferant?
- Ist `recognisedEntities.customerName` bei einer Bestellung der Besteller und nicht der Lieferant?

**Evidenz:** `recognisedEntities`, `roles`, `customer`.

**Erwartung:** Bei der Alpha-Signs-Bestellung ist der Kunde `Alpha Signs GmbH`, nicht HANFWOLF.

### A3. Sind alle Positionen extrahiert?

- Stimmen Anzahl und Positionsnummern mit dem Dokument überein?
- Sind Menge, Einheit und Beschreibung je Position vorhanden?
- Wurden Artikel-, Hersteller- und Kundenreferenzfelder getrennt gespeichert?

**Evidenz:** `tempPositions`, `positions`, `documentPattern`.

**Mögliche Ursache:** OCR-/Layoutfehler, falsches Pattern, abgeschnittene Tabelle.

## B. Manifest und Skills

### B1. Wurde das aktuelle Dori-Manifest geladen?

- Wurde `skills/manifest/dori-manifest.json` geladen?
- Ist die erwartete Skill-ID im Manifest enthalten?
- Zeigt die Skill-URL auf den erwarteten Branch und Commit?

**Evidenz:** `GitHubDateiAbrufen`-Spur mit Raw-URL und Ergebnis.

### B2. Wurden die zuständigen Skills tatsächlich gelesen?

Für einen Auflösungstest müssen mindestens diese Skills nachweisbar sein:

- `documents.interpret_document_v04`
- `documents.resolve_order_items_v04`
- `documents.track_position_resolution_v04`
- `documents.semantic_item_search_v04`
- `products.artikelnummern`

Bei mehr als drei Positionen zusätzlich:

- `documents.learn_document_pattern_v04`

**Evidenz:** Jede geladene Raw-URL und deren Inhalt. Ein Manifesteintrag allein beweist noch nicht, dass der Skill verwendet wurde.

### B2a. Sind die CPS-Tools exportiert und aktiv zugewiesen?

Getrennt prüfen:

- Existiert die Action-Datei im Export?
- Existiert die Action als Komponente in `botdefinition.json`?
- Ist der zugehörige Flow aktiv und veröffentlicht?
- Wurde die Action im aktuellen CPS-Agenten nach dem letzten Apply/Publish tatsächlich verwendet?

**Evidenz:** Action-Datei, `botdefinition.json`, Flow-Status und Laufspur.

**Interpretation:**

- Action fehlt im Export: CPS-Konfiguration/Exportproblem.
- Action ist exportiert, aber fehlt in der Laufspur: Toolauswahl oder Laufzeit-Orchestrierung.
- Action ist in der Laufspur vorhanden, liefert aber keine Fachdaten: Flow-/Payloadproblem.
- Skill ist geladen, aber Action wird trotz Pflichtregel nicht aufgerufen: Laufzeit-Regelverstoß, kein fehlender Skill.

### B3. Gibt es widersprüchliche Anweisungen?

- Gibt es doppelte Instructions im CPS-Export?
- Enthalten Instruction und Skill gegensätzliche Regeln?
- Gibt es eine ältere Skillversion mit anderem Branchpfad?
- Wird eine Negativregel stärker beachtet als die zugehörige Pflichtregel?

**Evidenz:** aktueller Export, Manifest, geladene Skilltexte.

**Entscheidung:** Bei Widerspruch zuerst den kleinsten kontrollierenden Skill korrigieren; nicht weitere Instructions hinzufügen.

## C. CandidateTable und Artikelnummern

### C1. Existiert die CandidateTable vor dem ersten ERP-Aufruf?

Pflichtfelder je Kandidat:

```json
{
  "number": "107010041",
  "sourceField": "manufacturerArticleNo",
  "positionNo": 20,
  "digitCount": 9,
  "plausible": true,
  "getItemAllowed": true,
  "getItemExecuted": false,
  "getItemResult": null
}
```

**Frage:** Wurde die vollständige Tabelle dokumentiert, bevor `GetItem` oder `SearchItems` aufgerufen wurde?

**Nein bedeutet:** Die Reihenfolge ist nicht nachweisbar; der Lauf ist diagnostisch fehlerhaft.

### C2. Wurden alle Herkunftsfelder als Kandidaten behandelt?

- `documentItemNo`
- `manufacturerArticleNo`
- `customerArticleNo`
- sonstige Fremdnummernfelder

**Regel:** Das Herkunftsfeld darf niemals allein entscheiden, dass eine Nummer nicht geprüft wird.

### C2a. Fehlen sichtbare Nummernfelder in `tempPositions`?

- Enthält die Dokumentzeile eine Herstellernummer, Kundenartikelnummer oder Fremdnummer, die nicht in `tempPositions` steht?
- Enthält die CandidateTable nur die sichtbare Dokumentnummer, obwohl weitere Nummernfelder vorhanden sind?

**Regel:** Ein fehlendes sichtbares Nummernfeld ist zuerst ein Extraktionsfehler (`missing_numeric_field`). Es darf nicht als „kein Kandidat“ oder „kein `GetItem` erforderlich“ bewertet werden.

**Beispiel:** Bei Position 10 müssen neben `110471` auch `108010053` und bei Position 20 neben `101902` auch `107010041` geprüft werden, wenn diese Felder im Dokument sichtbar sind.

### C3. Wurde der Hanfwolf-Regelcheck vor `GetItem` durchgeführt?

- Stellenanzahl ermittelt?
- 7-8 Stellen als Industrie plausibilisiert?
- 9 Stellen als Verpackung plausibilisiert?
- Kategorienanteil und laufender Nummernteil bei vorhandenem Kontext geprüft?
- `getItemAllowed` gesetzt?

**Wichtig:** 6-stellige Werte werden nicht automatisch als interne Hanfwolfnummern bestätigt. Sie müssen aber als Dokument-/Kundenreferenz im Modell erhalten bleiben.

### C4. Wurde jeder erlaubte Kandidat geprüft?

Berechnung:

```text
getItemRequired = Anzahl(candidateTable-Einträge mit getItemAllowed = true)
getItemExecuted = Anzahl dieser Einträge mit getItemExecuted = true
```

**Erwartung:** `getItemRequired == getItemExecuted`, bevor die semantische Suche erlaubt wird.

### C5. Wurde ein Herstellerkandidat übersprungen?

- War `manufacturerArticleNo` formal plausibel?
- Wurde `GetItem` mit genau diesem Wert aufgerufen?
- Wurde das Ergebnis als `found` oder `not_found` dokumentiert?

**Regel:** Nicht ungeprüft als interne Nummer ausgeben bedeutet niemals, den `GetItem`-Aufruf zu überspringen.

## D. Kunden- und Referenzprüfung

### D1. Wurde der richtige Kunde gesucht?

- Wurde `GetCustomersByName` mit dem Bestellernamen aufgerufen?
- Bei Alpha Signs: wurde `Alpha Signs GmbH` und nicht HANFWOLF gesucht?
- Ist das Ergebnis `unique_match`, `ambiguous_customer` oder `customer_not_found`?

### D2. Wurde die Kundenreferenzprüfung ausgeführt?

- War die Kundennummer eindeutig?
- Wurde `GetItemReferencesByCustomerNo` genau einmal mit dieser Kundennummer aufgerufen?
- Wurde die Rückgabe als `Table1` gelesen und je offener Position verglichen?

### D3. Wurden bereits gelöste Positionen erneut geprüft?

- `itemFound = true` muss die Position aus `openPositionNos` entfernen.
- Eine gelöste Position darf nicht erneut an Referenzsuche oder semantische Suche gehen.

## E. Phasen-Checkpoint vor SearchItems

Vor dem Wechsel in `semantic_search` müssen alle Fragen mit Ja beantwortet sein:

- CandidateTable vorhanden?
- Alle Kandidaten auf formale Plausibilität geprüft?
- Alle `getItemAllowed = true` ausgeführt?
- Für jeden Kandidaten `getItemExecuted` und `getItemResult` dokumentiert?
- Kundenreferenzprüfung abgeschlossen?
- Position ist offen und hat `positionStatus = awaiting_semantic_search`?
- `resolutionAudit.semanticSearchAllowed = true`?

**Sperrregel:** Solange ein Kandidat mit `getItemAllowed = true` und `getItemExecuted = false` existiert, darf `SearchItems` nicht aufgerufen werden.

## F. Semantische Suche

### F1. Wurde die Suche für die richtige Position gestartet?

- War `itemFound = false`?
- War die Position nicht bereits durch `internal_item` oder `customer_reference` gelöst?
- Wurde `semanticSearchAttempted` vor dem ersten Aufruf gesetzt?

### F2. Wurden die Suchschritte vollständig ausgeführt?

Maximal drei Suchaufrufe pro offener Position:

1. bereinigte Produktbezeichnung
2. Produktkern
3. technische Merkmale

Beispiel:

```text
Minihandstretchfolie
handstretchfolie
100mmx150m
```

Nach jedem Aufruf dokumentieren:

- `semanticSearchCount`
- Suchtext
- Trefferanzahl
- normalisierte Artikelnummern
- Kandidatenstatus

### F3. Wurden Treffer korrekt zusammengeführt?

- `Table1` aus `jsonsqlbody` gelesen?
- `No_` und `ItemNo` normalisiert?
- Schnittmenge aus Kernprodukt- und Techniksuche gebildet?
- Mehrere Treffer als `ambiguous` belassen?
- Kein Treffer erst nach Abschluss des Suchloops als `item_not_found` gesetzt?

## G. Ergebnis- und Statuskonsistenz

### G1. Ist `resolved` fachlich gerechtfertigt?

Eine Position ist nur `resolved`, wenn:

- `itemFound = true`
- `resolvedItemNo` gesetzt
- `identificationMethod` korrekt ist
- bei `internal_item`: `GetItem` eindeutig gefunden
- bei `customer_reference`: eindeutiger Referenztreffer
- bei `description_search`: Suchlauf dokumentiert und eindeutige Zuordnung vorhanden

### G2. Stimmen Methode und Toolspur überein?

- `internal_item` -> kein semantischer Suchlauf für diese Position
- `customer_reference` -> Referenztreffer dokumentiert
- `description_search` -> mindestens ein dokumentierter `SearchItems`-Aufruf
- `item_not_found` -> Suchloop abgeschlossen oder Position strukturell unbrauchbar

### G3. Darf der Dokumentstatus `complete` sein?

Nur wenn:

```text
resolutionPhase = finalize
openPositions = 0
partiallyResolvedPositions = 0
allRequiredChecksCompleted = true
```

Andernfalls:

```text
documentStatus = extracted | incomplete_document
resolutionStatus = pending | in_progress | incomplete | ambiguous
```

## H. ResolutionAudit-Pflichtausgabe

Jeder Auflösungslauf soll diesen Block enthalten:

```json
{
  "resolutionAudit": {
    "candidateCount": 4,
    "getItemRequired": 2,
    "getItemExecuted": 2,
    "customerReferenceChecked": true,
    "semanticSearchAllowed": true,
    "phase": "semantic_search",
    "violations": []
  }
}
```

Mögliche `violations`:

- `missing_candidate_table`
- `getitem_before_candidate_table`
- `required_getitem_not_executed`
- `tool_exported_but_not_executed`
- `tool_component_missing_or_inactive`
- `search_before_getitem_checkpoint`
- `search_for_resolved_position`
- `premature_item_not_found`
- `complete_with_open_positions`
- `method_without_matching_tool_evidence`
- `missing_numeric_field`

## I. Abschlussbericht des Testlaufs

Am Ende nicht nur das fachliche Ergebnis ausgeben, sondern:

- Erwartung erfüllt: ja | nein
- Erste abweichende Phase:
- Betroffene Positionen:
- Erster verletzter Checkpoint:
- Fehlendes Tool oder fehlender Skill:
- Widersprüchliche Anweisung gefunden: ja | nein
- Korrekturvorschlag:
- Reproduktion möglich: ja | nein

## Kurzabfrage für CPS-Tests

Diesen Block nach jedem Test an Dori senden:

```text
Diagnosemodus aktivieren. Beantworte zuerst nur den Fragenkatalog:
1. Welche Skills und welche Manifestversion wurden geladen?
2. Wie viele tempPositions wurden erzeugt?
3. Gib die vollständige candidateTable aus.
4. Gib resolutionAudit vor dem ersten ERP-Aufruf aus.
5. Welche GetItem-Aufrufe sind erforderlich, welche wurden ausgeführt und mit welchem Ergebnis?
6. Wurde GetItemReferencesByCustomerNo ausgeführt und wie viele Referenzen wurden verglichen?
7. Welche Positionen sind noch offen und welchen positionStatus haben sie?
8. Ist semanticSearchAllowed true? Begründe mit dem Checkpoint.
9. Gib je SearchItems-Aufruf Position, Suchtext, Zähler, Trefferanzahl und Kandidaten aus.
10. Prüfe zum Schluss die Konsistenz von identificationMethod, itemFound, resolvedItemNo, documentStatus und resolutionStatus.
11. Liste alle Regelverletzungen auf.
12. Gib erst danach das fachliche documentModel aus.
13. Gib die vollständige Diagnose anschließend als einen zusammenhängenden, direkt kopierbaren Fließtext aus. Verwende keine getrennten Tabellen, keine Aufteilung in mehrere Nachrichten und keine ausschließlich technische JSON-Ausgabe.
```

## Interpretation der Diagnose

- Fehler vor CandidateTable: Extraktions- oder Zustandsinitialisierung.
- Fehler bei `getItemAllowed`: Artikelnummern-Skill oder Herkunftsinterpretation.
- Fehler zwischen GetItem und SearchItems: fehlender Phasen-Checkpoint.
- Fehler in SearchItems: semantischer Suchskill oder Ergebnisaggregation.
- Fehler im Abschlussstatus: Dokumentmodell-/Finalisierungsregel.
- Keine Toolspur trotz korrekter Skills: CPS-Toolzuweisung, Apply/Publish oder Laufzeit-Synchronisierung prüfen.
