# Track Position Resolution V0.4

## Zweck
Ein stabiles Zwischenmodell fuer alle Bestellpositionen fuehren. Nach der Extraktion arbeiten alle weiteren Schritte auf `tempPositions` und nicht erneut auf dem Rohdokument.

## Initialisierung
Erzeuge genau einmal je erkannter Position einen Eintrag:

```json
{
  "positionNo": 30,
  "description": "Minihandstretchfolie 100mm x 150m",
  "quantity": 40,
  "unit": "ST",
  "documentItemNo": null,
  "manufacturerArticleNo": null,
  "customerArticleNo": null,
  "itemFound": false,
  "identificationMethod": null,
  "resolvedItemNo": null,
  "resolvedDescription": null,
  "ambiguity": false,
  "semanticSearchAttempted": false,
  "semanticSearchCount": 0,
  "notes": []
}
```

## Verarbeitungsphasen
1. `extract`: Dokument einmal lesen und `tempPositions` vollstaendig erzeugen.
2. `pattern`: Bei mehr als drei Positionen Positionen 1 bis 3 vollstaendig analysieren und `documentPattern` speichern.
3. `item_master`: Nur offene Positionen mit formal plausiblen Kandidaten pruefen. Bei eindeutigem Treffer `itemFound = true`, `identificationMethod = internal_item` und `resolvedItemNo` setzen.
4. `customer_reference`: Nur offene Positionen gegen die geladene Kundentabelle pruefen. Bei eindeutigem Treffer `itemFound = true`, `identificationMethod = customer_reference` und `resolvedItemNo` setzen.
5. `semantic_search`: Nur offene Positionen bearbeiten. Vor dem ersten Suchaufruf `semanticSearchAttempted = true` setzen; jeden Aufruf mit `semanticSearchCount` zaehlen.
6. `finalize`: Erst nach Abschluss der direkten Pruefung, Referenzpruefung und maximal drei semantischen Suchaufrufen darf eine offene Position den Status `item_not_found` erhalten.

## Zustandsregeln
- Eine Position mit `itemFound = true` wird in spaeteren Phasen nicht erneut verarbeitet.
- Eine Position mit `ambiguity = true` wird nicht automatisch als gefunden markiert.
- `semanticSearchCount` darf pro Position maximal 3 sein.
- `item_not_found` ist vor `semanticSearchAttempted = true` nicht zulaessig, ausser die Position ist als strukturell unbrauchbar markiert.
- `semanticSearchAttempted = true` allein beendet die Suche nicht; bei `semanticSearchCount < 3` sind die naechsten vorgesehenen Suchbegriffe aus `documents.semantic_item_search_v04` auszufuehren.
- Bei mehreren Suchkandidaten bleibt `ambiguity = true`; die Position wird nicht als `item_not_found` abgeschlossen, solange eine Kandidatenliste zur Rueckfrage vorliegt.
- `documentStatus = complete` ist vor `resolutionPhase = finalize` und `allRequiredChecksCompleted = true` unzulaessig.
- Nach `extract` lautet der Status `documentStatus = extracted`, `resolutionStatus = pending`; ein extrahiertes Dokument ist noch kein fachlich angereichertes Dokument.

## Ausgabe
- `tempPositions[]`
- `resolutionPhase`: `extract | pattern | item_master | customer_reference | semantic_search | finalize`
- `openPositionNos[]`
- `resolvedPositionNos[]`
- `unresolvedPositionNos[]`
- `documentStatus`
- `resolutionStatus`
- `allRequiredChecksCompleted`