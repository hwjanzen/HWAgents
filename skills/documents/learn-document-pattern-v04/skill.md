# Learn Document Pattern V0.4

## Zweck
Bei Bestellungen mit vielen Positionen das Spaltenmodell frueh erkennen und anschliessend wiederverwenden, damit nicht jede Tabellenzeile erneut vollstaendig interpretiert wird.

## Aktivierung
- Bei mehr als drei erkannten Positionen Pattern Learning aktivieren.
- Bei drei oder weniger Positionen alle Positionen normal interpretieren.

## Musterlernen
1. Positionen 1 bis 3 vollstaendig analysieren.
2. Aus den stabil wiederkehrenden Feldlabels und Positionen ein `documentPattern` ableiten.
3. Das Muster mindestens mit diesen Feldern dokumentieren, sofern vorhanden:
   - `internalItemNoColumn`
   - `vendorItemNoColumn`
   - `customerItemNoColumn`
   - `descriptionColumn`
   - `quantityColumn`
   - `unitColumn`
   - `priceColumn`
   - `deliveryDateColumn`
4. Vor der seriellen Anwendung pruefen, dass Position 1 bis 3 dasselbe Spaltenmuster verwenden.

## Serielle Verarbeitung
Ab Position 4 nur noch:
1. Position aus dem erkannten Spaltenmodell lesen.
2. Werte normalisieren und einen `candidateTable`-Eintrag erzeugen.
3. Hanfwolf-Plausibilitaetsregel anwenden.
4. ERP-Aufloesung gemaess `documents.resolve_order_items_v04` ausfuehren.
5. Nur bei ungeloster Position den semantischen Suchloop starten.

Die vollstaendige OCR-/Dokumentinterpretation wird ab Position 4 nicht wiederholt.

## Strukturbruch
Eine einzelne Position wird wieder vollstaendig analysiert, wenn:
- ein erwartetes Feld fehlt,
- ein Feldlabel oder die Spaltenposition abweicht,
- die Anzahl der Spalten nicht zum Muster passt,
- die Zeile nicht eindeutig einer Position zugeordnet werden kann.

Nach erfolgreicher Vollanalyse darf das Muster fuer die folgenden Positionen aktualisiert werden. Ein Strukturbruch bei einer Position darf die bereits sicher gelesenen Positionen nicht neu verarbeiten.

## Ausgabe
- `documentPattern`
- `patternStatus`: `learned | not_applicable | broken`
- `patternSourcePositions`: `[1, 2, 3]` sofern vorhanden
- `patternBreaks[]` mit Position und Grund
- `fullInterpretationPositions[]`
- `serialInterpretationPositions[]`