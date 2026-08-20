# Inventory Availability V0.1

## Zweck
Bestands- und Verfuegbarkeitsauskunft zu einer bereits eindeutig identifizierten Artikelnummer liefern.
Dieser Skill setzt eine vorherige eindeutige Artikelzuordnung voraus (siehe products.artika_search_playbook_v061).

## Eingang
- `itemNo` (eindeutige interne Artikelnummer)

## Tool
- `GetItemInventory`
- Parameter: `ItemNo`
- Output-Feld: `jsonresult`
- Liefert `ResultSets.Table1[]` mit `ItemNo`, `Lagerort`, `Menge`

## Lagerort-Mapping
- `BI_HAUPT`: Hauptlager Bielefeld (Deutschland)
- `ME_HAUPT`: Hauptlager Merseburg (Deutschland)
- `HWAT`: Hauptlager Elixhausen (Oesterreich)
- Unbekannte Lagerortkuerzel unveraendert ausgeben, nicht raten.

## Verarbeitung
- Parse `Table1` vollstaendig, auch wenn einzelne Lagerorte `Menge = 0` melden.
- Summiere `Menge` ueber alle Lagerorte zu `totalQuantity`.
- Liefere zusaetzlich die Aufschluesselung je Lagerort in `byLocation[]`.
- Ein Lagerort mit `Menge = 0` ist ein gueltiges Ergebnis, kein technischer Fehler.
- 0 Zeilen in Table1: `status = not_found` (keine Bestandsdaten fuer diese Artikelnummer vorhanden).
- Mindestens 1 Zeile: `status = complete`.

## Ausgabe
```json
{
  "itemNo": "1010052",
  "status": "complete",
  "totalQuantity": 874.618,
  "byLocation": [
    { "location": "BI_HAUPT", "locationName": "Hauptlager Bielefeld (Deutschland)", "quantity": 211.118 },
    { "location": "ME_HAUPT", "locationName": "Hauptlager Merseburg (Deutschland)", "quantity": 0 },
    { "location": "HWAT", "locationName": "Hauptlager Elixhausen (Oesterreich)", "quantity": 663.5 }
  ]
}
```

## Regeln
- Keine Verfuegbarkeitsaussage ohne vorherige eindeutige Artikelzuordnung (kein Bestandscheck auf ambiguous-Kandidaten).
- Bei mehreren angefragten Artikeln (z. B. Positionsliste) je Artikelnummer ein eigenes Ergebnisobjekt liefern.
- Keine Reservierungs-, Liefertermin- oder Preisaussage; ausschliesslich Ist-Bestand je Lagerort und Summe.
- Bei technischem Fehler (Tool nicht auswertbar) `status = incomplete` mit `failureReason` liefern, nicht `not_found`.

## Antwortformat an Kollegen
- Klartext mit Gesamtmenge und Lagerortaufschluesselung, keine JSON-Struktur zeigen.
- Lagerorte immer mit Klarnamen nennen (z. B. "Hauptlager Bielefeld" statt nur "BI_HAUPT").
- Bei `Menge = 0` an einem Lagerort dies explizit benennen statt zu verschweigen.

## Antwortformat an Ingo
- Strukturiert gemaess `inventorySearch` im v01-agent-case-contract.
- `byLocation[].location` bleibt das technische Kuerzel; `locationName` zusaetzlich mitgeben, wenn verfuegbar.
