# Article Hypothesis Generator V0.1

## Zweck
Für eine Position automatisch Suchhypothesen erzeugen und priorisieren, damit die Produktauflösung nicht mit einem linearen Einzelpfad beginnt.

## Eingang
- Artikelnummern aus Dokumentenfeldern oder OCR
- Kundenreferenztexte
- Hersteller-/Fremdnummern
- optional: Produktbeschreibung

## Ausgabe
- `hypotheses[]` mit Typ, Priorität, Plausibilitätswert und Begründung
- `recommendedFirstAction` mit dem bevorzugten ersten Aufruf

## Regeln
- Eine Position kann mehrere gültige Hypothesen gleichzeitig haben.
- Jede Hypothese erhält einen Typ:
  - `internal_item_no`
  - `customer_reference`
  - `foreign_item_no`
  - `description_search`
- Jede Hypothese erhält eine Priorität.
- Wenn eine Nummer formal als interne HANFWOLF-Nummer plausibel ist, hat `internal_item_no` die höchste Priorität.
- Wenn eine Zahl als Hersteller- oder Fremdnummer plausibel ist, aber keine interne Nummer ist, setze `foreign_item_no` mit niedrigerer Priorität.
- Wenn eine Referenzdatenquelle (Kundenartikelnummer) bekannt ist, setze `customer_reference` als zusätzlichen Pfad, aber nicht als alleinigen Pfad.
- `GetItem` muss vor `GetItemReferencesByCustomerNo` ausgeführt werden, wenn eine plausible interne Nummer erkannt wurde.
- `description_search` ist nur der Fallback- oder Ergänzungsweg, wenn keine Nummern-Hypothese eindeutig tragfähig ist.
- Liefere das Ergebnis strukturiert und sortiert nach Priorität.

## Beispiel
```json
{
  "input": "108010053",
  "hypotheses": [
    {
      "type": "internal_item_no",
      "priority": 100,
      "plausible": true,
      "confidence": 95,
      "reason": "9-stellig, numerischer Aufbau weist auf interne Hanfwolf-Stammdaten hin"
    },
    {
      "type": "customer_reference",
      "priority": 80,
      "plausible": false,
      "confidence": 40,
      "reason": "Kundenreferenz nur relevant, wenn ein Kunde eindeutig identifiziert ist"
    },
    {
      "type": "foreign_item_no",
      "priority": 60,
      "plausible": true,
      "confidence": 55,
      "reason": "Fremdnummer kann als Hilfshypothese dienen, aber nicht als primäre Verifikation"
    }
  ],
  "recommendedFirstAction": "GetItem"
}
```

## Verarbeitungsregel
- Die Hypothesenbildung ist Voraussetzung für jede Produkt-Suche.
- Ein direkter, formaler Artikelnummerncheck darf nie durch einen späteren Referenzpfad ersetzt werden.
- Wenn mehrere Hypothesen logisch bestehen, verwende die höchste Priorität als Erstzugang, aber lasse die restlichen Pfade offen und parallel bewerten.
