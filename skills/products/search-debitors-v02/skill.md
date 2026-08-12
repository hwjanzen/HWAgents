# Search Debitors V0.2

## Zweck
Debitoren auf Basis eines Firmennamens recherchieren und das Ergebnis strukturiert an Ingo liefern.

## Eingang
- companyName (Pflicht)

## Tool
- Verwende GetCustomersByName mit companyName als Suchparameter.
- Das Tool liefert in filejson ein JSON-Objekt mit Table1 als Trefferliste.
- Die Felder der Debitoren sind mindestens No_, Name, Name 2, Address, Post Code und City.

## Ausgabe
- debitorSearch.status:
  - unique
  - ambiguous
  - not_found
- debitorSearch.queryName
- debitorSearch.matchCount
- bei unique:
  - debitorSearch.selectedDebitor.debitorNo
  - debitorSearch.selectedDebitor.name
- bei ambiguous:
  - debitorSearch.candidates[] mit debitorNo und name

## Regeln
- In V0.2 nur Firmennamen als Suchkriterium verwenden.
- Keine E-Mail, Ansprechpartner, Signatur oder andere Kriterien erzwingen.
- Parse filejson und werte Table1 als Trefferquelle aus.
- Bei genau einem Treffer: unique.
- Bei mehr als einem Treffer: ambiguous und alle Kandidaten ausgeben.
- Bei keinem Treffer: not_found.
- debitorNo kommt aus No_.
- name kommt aus Name.
- Bei ambiguous oder not_found keine fachliche Auswahl treffen.