# Interpret Document V0.4

## Zweck
Eingehende Kundenunterlagen in ein fachlich strukturiertes Bestellmodell übersetzen, damit nachgelagerte Agenten damit arbeiten können.

## Eingabe
- PDF-Dokumente, E-Mail-Text, Dokumentanhänge oder unstrukturierte Bestelltexte
- Optional: bestehende Case-Informationen aus Ingo oder anderen Agenten

## Ausgabe
- documentModel
- documentStatus: complete | incomplete_document | ambiguous | rejected
- recognisedEntities:
  - buyer
  - supplier
  - customerName
  - customerReference
  - positions[]
  - title / documentType (wenn erkennbar)
- positions[] mit je Position:
  - quantity
  - unit
  - referenceValue
  - referenceType (customer_reference | internal_item_no | unknown)
  - description
  - confidence
  - ambiguityNotes

## Regeln
- Rollen immer getrennt bewerten: Absender, Empfänger, Besteller, Lieferant, Ansprechpartner, Lieferadresse, Rechnungsempfänger.
- Die Dokumentperspektive muss aus dem Text und Kontext abgeleitet werden; nicht aus der Position einer Adresse allein.
- Mehrere Indizien muessen gemeinsam bewertet werden: Briefkopf, Empfängeradresse, Ansprechpartner, Bestellnummer, Liefer- und Zahlungsbedingungen, Unterschriftenblock und Footer.
- Plausibilitaetspruefung ist Pflicht: Dokumentart, Formulierung und Rollenverteilung muessen logisch zusammenpassen.
- Die Prioritaet bei Widerspruechen lautet: Dokumenttext > Briefkopf/Absender > Signaturbereich > Empfaengeranschrift.
- Bei Bestellungen gilt: Der Verfasser des Schreibens ist in der Regel der Besteller; die angeschriebene Firma ist in der Regel Lieferant bzw. Auftragnehmer.
- Keine Vermutungen als Fakten darstellen.
- Mehrdeutige oder unklare Felder immer als Hypothese mit Hinweis auf Unsicherheit kennzeichnen.
- Für jede Position müssen Menge, Referenzwert und mögliche Bedeutung nachvollziehbar sein.
- Keine Websuche und keine externen Quellen nutzen.
- Die Interpretation muss Ingo ein verwendbares, fachlich lesbares Model liefern, nicht nur Rohtext.
- Rollen muessen explizit ausgegeben werden, z. B. "Besteller: Alpha Signs GmbH" und "Lieferant: HANFWOLF GmbH & Co. KG".

## Zielbild
Dori liefert ein strukturiertes Dokumentverständnis, das die Agenten weiterverarbeiten können, ohne das ursprüngliche Rohdokument interpretieren zu müssen.
