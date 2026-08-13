# Semantic Item Search V0.4

## Zweck
Artikelpositionen ohne bestaetigte interne Artikelnummer ueber mehrere gezielte interne `SearchItems(SearchText)`-Aufrufe aufloesen.

## Voraussetzungen
- Es gibt keine durch `GetItem` bestaetigte interne Artikelnummer.
- Eine Kundenreferenz liefert keinen eindeutigen Treffer.
- Die Suche verwendet ausschliesslich das interne ERP-Tool.

## Suchloop
Fuehre fuer eine Position hoechstens drei aufeinander aufbauende Aufrufe aus. Dieser Suchloop darf erst starten, wenn der vollstaendige Hanfwolf-Regelcheck und alle moeglichen `GetItem`- sowie Kundenreferenzpruefungen abgeschlossen sind. Er ist der letzte und teuerste Fallback:

1. Bereinigte Produktbezeichnung, zum Beispiel `Minihandstretchfolie`.
2. Verkuerztes Kernprodukt, zum Beispiel `handstretchfolie`, wenn der erste Aufruf keine Treffer oder nur unbrauchbare Treffer liefert.
3. Technische Merkmale, zum Beispiel `100mmx150m`, wenn die vorherigen Treffer nicht eindeutig sind.

Nicht als ersten Suchtext eine lange Kombination aus Produktname und allen Abmessungen verwenden. Entferne dabei Mengen, Preise, Artikelnummern, Herstellerbezeichnungen und Fuellwoerter. Vereinheitliche `x`, `×`, Leerzeichen und Dezimaltrennzeichen in Massangaben.

## Kandidatenbewertung
Parse jedes Ergebnis aus `jsonsqlbody` und werte `Table1` aus. Vergleiche je Kandidat:
- Produktkern und Material aus `Description`
- Abmessungen, Staerke und Laenge aus `Description 2`
- Einheit und Verpackungseinheit aus Dokument und Treffer
- technische Zusatzangaben aus `Description 3`, sofern vorhanden
- Artikelkategorie als zusaetzliches Indiz

Kombiniere die Ergebnisse der Suchlaeufe als Mengen nach normalisierter `No_`/`ItemNo`-Artikelnummer:
- c1 liefert die breite Produktfamilienmenge.
- c2 verfeinert die Produktfamilie, zum Beispiel `handstretchfolie`.
- c3 liefert die technische Merkmalsmenge, zum Beispiel `100mmx150m`.
- Bilde die Schnittmenge aus c2 und c3. c1 dient als Plausibilisierung und muss nicht selbst einen Treffer enthalten.

Ein Kandidat ist `candidate_found` mit `confidence = high`, wenn die Schnittmenge genau einen Artikel enthaelt und Produktart sowie wesentliche technische Merkmale uebereinstimmen. Mehrere Kandidaten bleiben `ambiguous`; zum Beispiel `106020003`, `106020004` und `106020034`, wenn nur Kernart und Abmessung, nicht aber die Kernausfuehrung eindeutig sind.

## Beispiel
Fuer `Minihandstretchfolie 100mm x 150m`:
- `SearchItems("Minihandstretchfolie")`
- `SearchItems("handstretchfolie")`
- `SearchItems("100mmx150m")`

Die zweite Suche darf etwa 20 Treffer liefern, die dritte Suche drei Treffer. Die Schnittmenge aus c2 und c3 entscheidet. Wenn sie genau einen Artikel enthaelt, wird dieser als Kandidat uebernommen; bei mehreren Treffern darf ohne weiteres unterscheidendes Merkmal keine automatische Auswahl getroffen werden.

## Ausgabe
- `itemIdentification.status`: `candidate_found | ambiguous | item_not_found`
- `itemIdentification.confidence`: `high | medium | low`
- `itemIdentification.searches[]` mit Suchtext, Trefferanzahl und Trefferstatus
- `itemIdentification.candidates[]` mit `itemNo`, Beschreibung und relevanten Merkmalen
- bei eindeutiger Aufloesung `resolvedItemNo` und `resolutionMethod = description_search`

Eine Beschreibungssuche bestaetigt nur einen Artikel, wenn die fachlichen Merkmale eindeutig passen. Sie darf keine unplausible Dokumentnummer nachtraeglich als interne Artikelnummer bestaetigen.