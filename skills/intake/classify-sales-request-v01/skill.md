# Classify Sales Request V0.1

## Zweck
Kundenanfragen fuer die V0.1-Teststrecke in genau eine der vier zugelassenen Kategorien einordnen.

## Eingang
- Kunden-E-Mail-Text

## Ausgabe
- classification: genau einer der Werte
  - order_item_clear
  - order_item_unclear
  - quote_item_clear
  - quote_item_unclear
- documentType:
  - sales_order bei order_*
  - sales_quote bei quote_*
- optional extractedItems aus der E-Mail

## Regeln
- Genau eine Klassifikation ausgeben, niemals mehrere.
- Wenn Artikel nicht eindeutig zuordenbar sind, immer *_unclear waehlen.
- Keine Produkt- oder Debitorannahmen erfinden.
