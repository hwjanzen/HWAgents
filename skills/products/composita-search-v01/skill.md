# Composita Search V0.1

## Zweck
Eine Produktbezeichnung in relevante Suchbestandteile zerlegen und in einer nachvollziehbaren Reihenfolge durchsuchen, statt nur einen Single-String zu verwenden.

## Eingang
- Produktbezeichnung aus Dokument, E-Mail oder OCR-Text
- Optional: bekannte Produktkategorie, Material, Abmessungen, Einheit, Verpackung

## Ausgabe
- `searchGraph` mit Tokenisierung, Normalisierung und Priorisierung
- `candidateQueries[]` in Reihenfolge der Ausführung
- `rankingBasis` mit Gewichtung von Exaktheit, Teilkompositum, Kategorie, Attribut und Produktart

## Regeln
- Zerlege die Produktbezeichnung nicht als einen einzigen Text, sondern als zusammengesetzte Suchstruktur.
- Erzeuge zuerst Grundtoken, dann zusammengesetzte Varianten:
  - exakte Produktbezeichnung
  - Teilkomposita
  - zusammengesetzte Wortfolgen
  - Kategorie- und Attributableitungen
- Beispiel: `Minihandstretchfolie` -> `Mini`, `Hand`, `Stretch`, `Folie`, `Stretchfolie`, `Handstretchfolie`, `Ministretchfolie`.
- Nutze die Reihenfolge:
  1. Exakt
  2. Teilkompositum
  3. Kategorie
  4. Attribut
  5. ähnliche Produktvarianten
- Zuerst die beste exakte Beschreibung, dann Teilkomposita und abgeleitete zusammengesetzte Begriffe abfragen.
- Wenn die Bezeichnung Oberbegriffe wie `Mini`, `Hand`, `Stretch`, `Folie` enthält, verwende diese als relevante Suchbausteine, nicht als irrelevante Füllwörter.
- Wenn Material, Abmessungen oder Einheit aus dem Text gelesen werden, nutze diese als zusätzliche Suchkriterien und nicht nur als Nebensatz.
- Produziere keine externen Treffer; nur interne Produktdaten sind gültig.
- Liefere die Suchpfade als strukturierte `candidateQueries[]` und nutze danach ein Ranking.

## Schema
```json
{
  "query": "Minihandstretchfolie",
  "productTokens": ["mini", "hand", "stretch", "folie"],
  "normalizedTerms": [
    "stretchfolie",
    "handstretchfolie",
    "ministretchfolie"
  ],
  "candidateQueries": [
    { "type": "exact", "value": "Minihandstretchfolie" },
    { "type": "compound", "value": "Stretchfolie" },
    { "type": "compound", "value": "Handstretchfolie" },
    { "type": "compound", "value": "Ministretchfolie" }
  ],
  "rankingBasis": [
    "exact_match",
    "compound_match",
    "category_match",
    "attribute_match"
  ]
}
```

## Verarbeitungsregel
- Wenn eine Bezeichnung aus mehreren Wörtern besteht, zähle relevante Teilbegriffe und verwende sie als parallele Hypothesen.
- Eine Produktbeschreibung darf niemals als einzelner String ohne Zerlegung in die erste Suchstufe gelangen.
- Das Ergebnis des Skills ist eine priorisierte Suchstrategie, nicht das endgültige Produktresultat.
