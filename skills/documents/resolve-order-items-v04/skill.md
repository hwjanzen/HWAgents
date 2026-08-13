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
8. Sammle zuerst alle nummerischen Kandidaten je offener Position aus Dokumentnummer, Kundenreferenz, `manufacturerArticleNo` und Fremdnummernfeldern.
9. Erstelle vor dem ersten ERP-Aufruf eine vollstaendige `candidateTable` mit `number`, `sourceField`, `positionNo`, `digitCount`, `plausible` und `getItemAllowed`.
10. Fuehre fuer jeden Tabelleneintrag den `products.artikelnummern`-Regelcheck aus: 7-8 Stellen fuer Industrie, 9 Stellen fuer Verpackung.
11. Erst nachdem die Tabelle vollstaendig ist, darf `GetItem` fuer formal plausible Kandidaten offener Positionen aufgerufen werden. Bei Treffer `itemFound = true` setzen.
12. Nur offene Positionen ohne eindeutige Kundenreferenz werden an `documents.semantic_item_search_v04` gegeben. Vor dem ersten Aufruf `semanticSearchAttempted = true` setzen und jeden Suchaufruf zaehlen.
13. `item_not_found` ist erst in der Phase `finalize` zulaessig, nachdem pro offener Position der semantische Suchloop mit bis zu drei Aufrufen abgeschlossen wurde. Bei mehreren Suchkandidaten ist der Status `ambiguous`, nicht `item_not_found`.
14. Setze `resolutionStatus = complete` und `documentStatus = complete` nur, wenn alle Positionen einen finalen Status haben und `allRequiredChecksCompleted = true` ist. Nach reiner Extraktion gilt `documentStatus = extracted` und `resolutionStatus = pending`.

## Prioritaet der Artikelaufloesung
1. Gueltige interne HANFWOLF-Artikelnummer aus dem Dokument
2. Eindeutige Kundenreferenz ueber `GetItemReferencesByCustomerNo`
3. Eindeutiger Treffer ueber `SearchItems(SearchText)`
4. Mehrere plausible Treffer: `ambiguous`
5. Kein Treffer: `item_not_found`

Eine Hersteller- oder Fremdartikelnummer darf nicht allein aufgrund ihrer Feldbezeichnung als interne Artikelnummer ausgegeben werden. Ist sie formal plausibel und bestaetigt `GetItem` genau diese Nummer, darf sie als `resolvedItemNo` uebernommen werden; die Feldherkunft bleibt transparent. Bei einem eindeutigen direkten `GetItem`-Treffer darf ein fehlender Kundenreferenztreffer die Position nicht wieder ungueltig machen.
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

Verwende die Statuswerte `unique_match`, `ambiguous_customer`, `customer_not_found`, `found`, `invalid_item_reference`, `candidate_found`, `ambiguous` und `item_not_found` nur gemaess ihrer Bedeutung. Dokumentiere fehlende oder widerspruechliche Daten in `hypotheses` beziehungsweise `ambiguityNotes`. Gib ausserdem `validationSummary.allRequiredChecksCompleted` aus.