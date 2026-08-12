# Artika Tool Output Contract V0.3

## Ziel
Sicherstellen, dass Ingo aus Artika-Antworten immer fachliche Nutzdaten verarbeiten kann.
Done-only Antworten sind nicht zulaessig.

## Mindeststruktur
```json
{
  "toolPayloadStatus": "complete",
  "debitorSearch": {
    "status": "unique|ambiguous|not_found",
    "queryName": "...",
    "matchCount": 0,
    "selectedDebitor": { "debitorNo": "...", "name": "..." },
    "candidates": [
      { "debitorNo": "...", "name": "..." }
    ]
  },
  "articleReferenceSearch": {
    "status": "unique|ambiguous|not_found",
    "queryText": "...",
    "matchCount": 0,
    "selectedItem": {
      "itemNo": "...",
      "description": "...",
      "customerRefNo": "...",
      "variantCode": "..."
    },
    "candidates": [
      {
        "itemNo": "...",
        "description": "...",
        "customerRefNo": "...",
        "variantCode": "..."
      }
    ]
  },
  "failureReason": "optional",
  "notes": "optional"
}
```

## Nicht zulaessig
```json
{ "Done": true }
```

## Verhalten bei unvollstaendiger Toolantwort
- `toolPayloadStatus` auf `incomplete` setzen.
- Fehlende Felder explizit benennen.
- Kein positiver Abschluss ohne fachliche Daten.
