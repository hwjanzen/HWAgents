# Position Analyse V0.1

## Zweck
Aus Positionstexten, E-Mail-Inhalten und OCR-Texten strukturierte Produkt-Hypothesen ableiten, damit die anschließende Suchlogik robust und fehlerresistent arbeitet.

## Eingang
- Produktbeschreibung aus einer Position, E-Mail oder PDF
- Optional: Maße, Material, Einheit, Verpackung, Herstellernummer, Kundenreferenz

## Ausgabe
- `productTokens[]`
- `normalizedTerms[]`
- `dimensions` mit Einheiten und Werten
- `searchHints` mit Attributen, Kategorien und Merkmalsmustern

## Regeln
- Zerlege den Text in relevante Suchbausteine statt ihn als EINEN String zu behandeln.
- Extrahiere klar erkennbare Merkmalswerte wie Breite, Länge, Material, Einheit und Verpackung.
- Erzeuge für jeden relevanten Wortteil eine Normalform.
- Beispiel: `Minihandstretchfolie 100mm x 150m` ->
  - `productTokens`: `["mini", "hand", "stretch", "folie"]`
  - `normalizedTerms`: `["stretchfolie", "handstretchfolie", "ministretchfolie"]`
  - `dimensions`: `{ "width_mm": 100, "length_m": 150 }`
- Wenn eine Position Typisches wie `Mini`, `Hand`, `Stretch`, `Folie` enthält, nutze diese Begriffe als signalreiche Suchkandidaten.
- Wenn keine klaren Maße erkannt werden, setze nur die Textmerkmale und die Suchbegriffskette.
- Nutze die extrahierten Merkmale als zusätzliche Priorisierung im Ranking, nicht nur als Textbeschreibung.
- Diese Informationen dienen als Grundlage für `products.composita_search_v01` und spaeteres Ranking.

## Beispiel
```json
{
  "sourceText": "Minihandstretchfolie 100mm x 150m",
  "productTokens": [
    "mini",
    "hand",
    "stretch",
    "folie"
  ],
  "normalizedTerms": [
    "stretchfolie",
    "handstretchfolie",
    "ministretchfolie"
  ],
  "dimensions": {
    "width_mm": 100,
    "length_m": 150
  },
  "searchHints": {
    "categoryHint": "stretchfolie",
    "materialHint": null,
    "unitHint": "mm,m"
  }
}
```

## Verarbeitungsregel
- Die Positionsanalyse ist die Grundlage für zusammengesetzte Suche und Ranking.
- Sie darf keine externen Daten erzeugen; sie dient nur dazu, die interne Suchlogik zu verbessern.
