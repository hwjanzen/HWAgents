# Order Position Parser V0.1

## Zweck
Freitext aus Bestellpositionen in strukturierte Merkmale fuer Suche und Ranking umwandeln.

## Eingang
- Positionsbezeichnung und optionale Zusatzzeilen

## Ausgabe
- `parsedPosition` mit:
  - `productClass`
  - `variantHints[]`
  - `materialHints[]`
  - `dimensions` (`width_mm`, `length_m`, `thickness_mm`)

## Beispiele
```json
{
  "sourceText": "Minihandstretchfolie 100mm x 150m",
  "parsedPosition": {
    "productClass": "Stretchfolie",
    "variantHints": ["Mini", "Hand"],
    "dimensions": {
      "width_mm": 100,
      "length_m": 150
    }
  }
}
```

```json
{
  "sourceText": "PE-Schaumfolie 1,55m x 500m x 1mm",
  "parsedPosition": {
    "productClass": "PE-Schaumfolie",
    "dimensions": {
      "width_mm": 1550,
      "length_m": 500,
      "thickness_mm": 1
    }
  }
}
```

## Regeln
- Dezimalwerte mit Komma in Punktformat normalisieren.
- `m` bei Breite in `mm` umrechnen.
- Fehlende Merkmale leer lassen, nicht raten.
