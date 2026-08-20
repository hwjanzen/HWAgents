# Customer Order Interpreter V0.1

## Zweck
Kundenbestellfelder semantisch interpretieren und daraus priorisierte Suchhypothesen bauen.

## Eingabefelder
- Ihre Artikelnummer
- Lieferantenartikelnummer
- Herstellerartikelnummer
- Kundenreferenz

## Feldregeln
- `Ihre Artikelnummer`: zuerst als moegliche interne Nummer pruefen
- `Lieferantenartikelnummer`: zuerst als moegliche interne Nummer pruefen
- `Herstellerartikelnummer`: zuerst als moegliche interne Nummer pruefen
- `Kundenreferenz`: primaer Referenzkandidat

## Ausgabe
- `fieldHypotheses[]` mit Wert, Feldquelle, Hypothesentyp und Score-Beitrag

## Regeln
- Feldsemantik ist ein Signal, ersetzt aber nicht die Nummernvalidierung.
- Bei Konflikt gewinnt der Kandidat mit hoeherem Gesamtscore aus Feldsignal + Musterlogik.
