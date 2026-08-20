# Article Hypothesis Ranker V0.1

## Zweck
Mehrere Artikelsuch-Hypothesen als priorisierte Kandidatenliste mit Score ausgeben.

## Eingang
- `positionText`
- `numberHypotheses[]` aus `products.artikelnummern`
- `parsedPosition` aus `products.order_position_parser_v01`
- `compositaQueries[]` aus `products.composita_search_v01`
- optional: Debitor, Kategoriehinweise

## Ausgabe
- `rankedHypotheses[]` sortiert absteigend nach Score
- `executionPlan[]` mit empfohlener Reihenfolge der Tool-Aufrufe

## Scoring
- `internal_item_no` mit 7-9 stellig numerisch: +95 Basis
- Feldkontext Lieferanten-/Herstellerartikel: +3
- 6-stellig numerisch: 20-35
- Alphanumerische Referenzen: 20-40
- Text-/Attributtreffer gegen bekannte Produktklasse: +10 bis +25

## Regeln
- Kandidaten mit `score >= 90` zuerst ueber `GetItem` pruefen.
- Mehrere Kandidaten `>= 90` parallel pruefen.
- `customer_reference` wird erst geprueft, wenn kein Kandidat `>= 70` uebrig ist.
- Bei Gleichstand priorisiere `internal_item_no` vor `foreign_item_no` vor `customer_reference`.

## Beispiel
```json
[
  {
    "hypothesisType": "internal_item_no",
    "value": "108010053",
    "score": 98
  },
  {
    "hypothesisType": "customer_reference",
    "value": "110471",
    "score": 35
  }
]
```
