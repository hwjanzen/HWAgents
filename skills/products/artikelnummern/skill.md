# Artikelnummern

## Zweck
Artikelnummern auf Plausibilitaet und Konsistenz im Produktkontext pruefen.
Hanfwolf-Logik explizit anwenden, um Bereich, Kategorienbezug und Nummernaufbau nachvollziehbar abzuleiten.

## Eingang
- Artikelnummern oder Nummernsegmente
- Optional: Kategorie- und Attributkontext

## Hanfwolf-Logik
- Geschaeftsbereiche:
	- Industrie: Artikelnummern sind 7- oder 8-stellig.
	- Verpackung: Artikelnummern sind 9-stellig.
- Bildung aus Kategoriencode:
	- Basis ist ein 6-stelliger Kategoriencode mit Punktnotation.
	- Fuehrende Nullen und der Punkt werden entfernt.
	- An den verbleibenden Wert wird eine 4-stellige fortlaufende Nummer angehaengt.

## Ableitung
- Aus der Laenge der Artikelnummer den Bereich plausibilisieren:
	- 7-8 Stellen -> Industrie (plausibel)
	- 9 Stellen -> Verpackung (plausibel)
- Aus der Nummer den Kategorienanteil und den laufenden 4-stelligen Endteil identifizieren.
- Bei vorhandenem Kategoriencode die Herleitung transparent pruefen und begruenden.

## Ausgabe
- Plausibilitaetsbewertung der Nummern
- Auffaellige Muster oder Inkonsistenzen
- Empfehlung fuer Verifikation
- Nachvollziehbare Herleitung:
	- vermuteter Bereich (Industrie/Verpackung)
	- erkannter Strukturteil (Kategorienanteil + laufende Endnummer)
	- Begruendung, warum die Zuordnung plausibel oder unplausibel ist

## Regeln
- Nummernlogik unterstuetzt die Bewertung, ersetzt aber keine Kategorie- und Attributpruefung.
- Keine Kategoriezuordnung nur aufgrund schwacher Nummernindizien.
- Wenn Strukturregeln verletzt sind, immer als inkonsistent markieren und zur Rueckfrage/Verifikation empfehlen.
