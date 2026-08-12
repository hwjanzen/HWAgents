# Search Customer Article References V0.2

## Zweck
Kundenbezogene Artikelreferenzen auf interne ERP-Artikelnummern abbilden.

## Eingang
- articleReferenceText oder Kundenartikelangabe (Pflicht)
- optional Kontext aus Anfrage (z. B. Mengenhinweis)

## Tool
- Verwende GetItemReferencesByCustomerNo, sobald ein eindeutiger Debitor bekannt ist.
- Uebergib die Debitornummer als CustomerNo.
- Das Tool liefert in filejson ein JSON-Objekt mit Table1 als Trefferliste.
- Die Felder der Referenzen sind mindestens Reference Type No_, ItemNo, VariantCode und CustomerRefNo.

## Ausgabe
- articleReferenceSearch.status:
  - unique
  - ambiguous
  - not_found
- articleReferenceSearch.queryText
- articleReferenceSearch.matchCount
- bei unique:
  - articleReferenceSearch.selectedItem.itemNo
  - articleReferenceSearch.selectedItem.description
- bei ambiguous:
  - articleReferenceSearch.candidates[] mit itemNo und description

## Regeln
- Ausschliesslich interne Referenz- und Artikeldaten verwenden.
- Keine Websuche und keine externen Katalogdaten verwenden.
- Parse filejson und werte Table1 als Trefferquelle aus.
- Filtere Table1 anschliessend mit articleReferenceText gegen CustomerRefNo.
- Verwende fuer die Trefferbewertung nur die gefilterten Zeilen.
- Keine Herstellernummer als interne ERP-Artikelnummer ausgeben.
- Bei genau einem Treffer: unique.
- Bei mehreren Treffern: ambiguous und alle Kandidaten ausgeben.
- Bei keinem Treffer: not_found.
- itemNo kommt aus ItemNo.
- Wenn CustomerRefNo leer oder unpassend ist, behandle die Zeile nicht als Treffer fuer die Anfrage.
- Wenn keine Artikelbeschreibung im Tool-Ergebnis enthalten ist, gib keine erfundene description aus.
- Bei ambiguous oder not_found keine fachliche Auswahl treffen.