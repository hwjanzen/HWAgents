# Attribute Gap Analysis V0.1

## Zweck
Bei mehreren Kandidaten transparent machen, welche fehlenden Attribute eine eindeutige Zuordnung verhindern.

## Eingang
- `candidateItems[]`
- bekannte Merkmale aus Parser und Position

## Ausgabe
- `resolved` (true|false)
- `missingAttributes[]`
- `clarificationQuestions[]`

## Beispiel
```json
{
  "resolved": false,
  "missingAttributes": ["Folienstaerke", "Kernausfuehrung"],
  "clarificationQuestions": [
    "Welche Folienstaerke wird benoetigt (z. B. 20my oder 23my)?",
    "Ist der Kern buendig oder ueberstehend?"
  ]
}
```

## Regeln
- Fehlende Attribute nur ausgeben, wenn sie die Kandidaten tatsaechlich unterscheiden.
- Keine technische Fehlerdiagnose als Attributluecke ausgeben.
