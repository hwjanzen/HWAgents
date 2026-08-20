# Category First Search V0.1

## Zweck
Vor der Artikelsuche zuerst die wahrscheinlichste Kategorie bestimmen und den Suchraum reduzieren.

## Eingang
- `parsedPosition`
- `compositaQueries[]`
- optionale Kategoriehinweise aus Artikeldaten

## Ausgabe
- `categoryCandidates[]` mit Score
- `selectedCategory` bei hoher Eindeutigkeit

## Regeln
- Nutze Produktklasse und Composita-Hierarchie fuer Kategoriehypothesen.
- Bei `score >= 85` darf die Artikelsuche auf diese Kategorie eingeschraenkt werden.
- Bei mehreren Kategorien > 80 alle als Kandidaten ausgeben und parallel pruefen.

## Beispiel
```json
{
  "query": "Minihandstretchfolie",
  "categoryCandidates": [
    { "categoryCode": "106.02_HAN", "score": 92, "reason": "Stretchfolie + Hand + Mini" }
  ],
  "selectedCategory": "106.02_HAN"
}
```
