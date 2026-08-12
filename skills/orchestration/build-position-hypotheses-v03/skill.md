# Build Position Hypotheses V0.3

## Zweck
Pro Bestellposition aus Kundendaten mehrere plausible Bedeutungen als testbare Hypothesen erzeugen.

## Eingang
- Case-Objekt gemaess schemas/v01-agent-case-contract.schema.json
- Extrahierte Positionen (Wert, Menge, optional Preis, optional Freitext)

## Ausgabe
- positionHypotheses[]
  - positionId
  - rawValue
  - hypotheses[]
    - hypothesisType: customer_reference | internal_item_no | free_text_item_hint
    - confidence: low | medium | high
    - rationale
    - nextCheck: check_customer_references | check_item_master

## Regeln
- Keine externe Recherche verwenden.
- Pro Position mindestens zwei Hypothesen bilden, falls Bedeutung unklar ist.
- Interne Artikelnummer als Hypothese nur setzen, wenn Format/Nummernlogik plausibel ist.
- Fuer Nummernwerte explizit products.artikelnummern anwenden (Hanfwolf-Logik: Industrie 7-8 stellig, Verpackung 9 stellig).
- Hypothesen priorisieren: zuerst die mit hoechster fachlicher Plausibilitaet.