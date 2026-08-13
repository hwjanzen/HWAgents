# Resolve Order Items V0.4

## Zweck
Nach der Dokumentextraktion Besteller und Bestellpositionen mit internen ERP-Daten abgleichen und fuer Ingo ein belastbares `documentModel` erzeugen.

## Verfuegbare Tools
- `GetCustomersByName` mit dem extrahierten Bestellernamen
- `GetItem` mit einer erkannten internen HANFWOLF-Artikelnummer
- `GetItemReferencesByCustomerNo` mit einer eindeutig ermittelten Kundennummer
- `SearchItems(SearchText)` mit Beschreibung oder technischen Merkmalen
- `products.artikelnummern` fuer die Hanfwolf-Nummernlogik
- `documents.semantic_item_search_v04` fuer den mehrstufigen Beschreibungssuchlauf
- `documents.learn_document_pattern_v04` fuer grosse Bestellungen mit wiederkehrendem Spaltenmuster
- `documents.track_position_resolution_v04` fuer den persistenten Status je Bestellposition

## Verarbeitungsfolge
1. Bestellername extrahieren und `GetCustomersByName` ausfuehren.
2. Genau einen Treffer als `customer.matchStatus = unique_match` uebernehmen.
3. Mehrere Treffer als `ambiguous_customer` und keinen Kunden automatisch auswaehlen.
4. Keinen Treffer als `customer_not_found` kennzeichnen.
5. `documents.track_position_resolution_v04` laden und `tempPositions` genau einmal aus dem Dokument erzeugen. Alle weiteren Phasen arbeiten nur auf offenen Eintraegen mit `itemFound = false`.
6. Bei mehr als drei Positionen `documents.learn_document_pattern_v04` laden: Positionen 1 bis 3 vollstaendig analysieren, ein stabiles `documentPattern` ableiten und ab Position 4 seriell anwenden.
7. Bei eindeutigem Kunden `GetItemReferencesByCustomerNo` einmal abrufen und erkannte Kundenreferenzen dagegen pruefen.
8. Sammle zuerst alle nummerischen Kandidaten je offener Position aus jedem sichtbaren Nummernfeld: Dokumentnummer, Kundenreferenz, `manufacturerArticleNo`, `customerArticleNo` und sonstige Fremdnummernfelder. Jedes Herkunftsfeld ist eine gleichwertige Kandidatenquelle; Kandidaten duerfen niemals vor der CandidateTable herausgefiltert werden.
9. Erstelle vor dem ersten ERP-Aufruf eine vollstaendige `candidateTable` mit `number`, `sourceField`, `positionNo`, `digitCount`, `plausible`, `getItemAllowed`, `getItemExecuted` und `getItemResult`.
10. Fuehre fuer jeden Tabelleneintrag den `products.artikelnummern`-Regelcheck aus: 7-8 Stellen fuer Industrie, 9 Stellen fuer Verpackung. Die Feldbezeichnung entscheidet nicht ueber `getItemAllowed`; ausschliesslich der formale Regelcheck entscheidet. Wenn ein im Dokument sichtbares Nummernfeld fehlt, setze `resolutionAudit.violations = [missing_numeric_field]` und stoppe die fachliche Aufloesung.
11. Erst nachdem die Tabelle vollstaendig ist, muss `GetItem` fuer jeden Eintrag mit `getItemAllowed = true` aufgerufen werden, unabhaengig vom Herkunftsfeld. Ein Hersteller- oder Fremdnummernfeld ist niemals ein Grund, den Aufruf zu ueberspringen. Bei Treffer `itemFound = true` setzen; bei negativem Ergebnis `getItemResult = not_found` dokumentieren.
12. Vor dem Wechsel in `semantic_search` muss ein Phasen-Checkpoint bestaetigen: CandidateTable vorhanden, alle Eintraege mit `getItemAllowed = true` ausgefuehrt, `getItemExecuted = getItemRequired`, Kundenreferenzpruefung abgeschlossen und `semanticSearchAllowed = true`. Solange ein erlaubter, noch nicht ausgefuehrter `GetItem`-Kandidat existiert, ist `SearchItems` verboten.
13. Nur offene Positionen mit Status `awaiting_semantic_search` werden an `documents.semantic_item_search_v04` gegeben. Vor dem ersten Aufruf `semanticSearchAttempted = true` setzen und jeden Suchaufruf zaehlen.
14. `item_not_found` ist erst in der Phase `finalize` zulaessig, nachdem pro offener Position der semantische Suchloop mit bis zu drei Aufrufen abgeschlossen wurde. Bei mehreren Suchkandidaten ist der Status `ambiguous`, nicht `item_not_found`.
15. Setze `resolutionStatus = complete` und `documentStatus = complete` nur, wenn alle Positionen einen finalen Status haben und `allRequiredChecksCompleted = true` ist. Nach reiner Extraktion gilt `documentStatus = extracted` und `resolutionStatus = pending`.
16. Pruefe die Zusammenfassung vor der Ausgabe: `openPositions` muss exakt der Anzahl der `tempPositions` mit `itemFound = false` entsprechen. Bei `openPositions > 0` oder `partiallyResolvedPositions > 0` darf niemals `documentStatus = complete` ausgegeben werden.
17. Eine Position mit `itemFound = true` darf keine semantische Suche mehr erhalten. Wenn `semanticSearchAttempted = true` oder `semanticSearchCount > 0` gesetzt ist, muss dies vor der Ausgabe entfernt oder als inkonsistenter Zustand korrigiert werden.

## Prioritaet der Artikelaufloesung
1. Gueltige interne HANFWOLF-Artikelnummer aus dem Dokument
2. Eindeutige Kundenreferenz ueber `GetItemReferencesByCustomerNo`
3. Eindeutiger Treffer ueber `SearchItems(SearchText)`
4. Mehrere plausible Treffer: `ambiguous`
5. Kein Treffer: `item_not_found`

Wichtig: "nicht allein als interne Artikelnummer ausgeben" bedeutet nur "nicht ungeprueft uebernehmen". Es bedeutet niemals "nicht mit GetItem pruefen". Jede formal plausible Nummer aus jedem Herkunftsfeld muss vor der semantischen Suche an `GetItem` gehen.
Eine verletzte Laengen- oder Strukturregel ist als `invalid_item_reference` beziehungsweise `ambiguous` zu dokumentieren und darf nicht automatisch durch Beschreibungssuche als bestaetigte interne Nummer ersetzt werden.
Eine unplausible Dokumentnummer darf die Beschreibungssuche nicht blockieren: Nach erfolgloser Kundenreferenzpruefung muss die Position in den semantischen Suchloop fallen. Die Beschreibungssuche darf aber erst nach Abschluss aller plausiblen `GetItem`-Pruefungen beginnen.

## Kundenreferenzen
Vergleiche mindestens die Felder `Ihre Artikel-Nr.`, Kundenartikelnummer, Kundenreferenz und Fremdartikelnummer mit den Referenzdaten. Bei genau einem Treffer setze `resolutionMethod = customer_reference`; bei mehreren Treffern keine automatische Auswahl.

## Beschreibungssuche
Verwende zuerst die bereinigte Produktbezeichnung. Bei keinem eindeutigen Ergebnis fuehre hoechstens einige gezielte Folgesuchen mit Material, Abmessungen, Einheit und Verpackungseinheit aus. Bewerte Kandidaten gemeinsam nach Material, Abmessungen, Einheit und Verpackungseinheit, nicht nach einem einzelnen Wort.

## Ausgabevertrag
Erweitere `documentModel` um:
- `customer`: `name`, `customerNo` sofern eindeutig, `matchStatus`
- `customerIdentification`: `customerNo` sofern eindeutig, `status`
- je Position `itemValidation`, `customerReference`, `resolvedItemNo`, `itemIdentification`
- `itemResolution`: `method` und `confidence` auf Dokumentebene, wenn die Positionen konsistent aufgeloest wurden
- `resolutionAudit`:
	- `candidateCount`
	- `getItemRequired`
	- `getItemExecuted`
	- `customerReferenceChecked`
	- `semanticSearchAllowed`

Verwende die Statuswerte `unique_match`, `ambiguous_customer`, `customer_not_found`, `found`, `invalid_item_reference`, `candidate_found`, `ambiguous` und `item_not_found` nur gemaess ihrer Bedeutung. Dokumentiere fehlende oder widerspruechliche Daten in `hypotheses` beziehungsweise `ambiguityNotes`. Gib ausserdem `validationSummary.allRequiredChecksCompleted` aus.