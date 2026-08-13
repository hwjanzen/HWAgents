# Interpret Document V0.4

## Zweck
Eingehende Kundenunterlagen in ein fachlich strukturiertes Bestellmodell übersetzen, damit nachgelagerte Agenten damit arbeiten können.

## Eingabe
- PDF-Dokumente, E-Mail-Text, Dokumentanhänge oder unstrukturierte Bestelltexte
- Optional: bestehende Case-Informationen aus Ingo oder anderen Agenten

## Ausgabe
- documentModel
- documentStatus: extracted | complete | incomplete_document | ambiguous | rejected
- resolutionStatus: pending | in_progress | complete | incomplete | ambiguous
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
- customer:
  - name
  - customerNo (wenn eindeutig ermittelt)
  - matchStatus (unique_match | ambiguous_customer | customer_not_found)
- customerIdentification:
  - customerNo (wenn eindeutig ermittelt)
  - status
- positions[] kann zusaetzlich enthalten:
  - itemValidation (found | invalid_item_reference)
  - customerReference
  - resolvedItemNo
  - itemIdentification (candidate_found | ambiguous | item_not_found)
- itemResolution:
  - method (item_master | customer_reference | description_search | unresolved)
  - confidence (high | medium | low)
- documentPattern:
  - patternStatus (learned | not_applicable | broken)
  - patternSourcePositions[]
  - fullInterpretationPositions[]
  - serialInterpretationPositions[]
  - patternBreaks[]
- tempPositions[]:
  - itemFound (boolean)
  - identificationMethod
  - resolvedItemNo
  - ambiguity (boolean)
  - semanticSearchAttempted (boolean)
  - semanticSearchCount (integer, maximum 3)
- resolutionPhase (extract | pattern | item_master | customer_reference | semantic_search | finalize)
- validationSummary:
  - totalPositions
  - resolvedPositions
  - partiallyResolvedPositions
  - openPositions
  - semanticSearchUsed
  - allRequiredChecksCompleted
- resolutionAudit:
  - candidateCount
  - getItemRequired
  - getItemExecuted
  - customerReferenceChecked
  - semanticSearchAllowed

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
- Nach der Extraktion muessen Besteller, interne Artikelnummern und Kundenreferenzen mit den verfuegbaren internen ERP-Tools validiert werden.
- Vor jeder Plausibilisierung muessen alle im Dokument sichtbaren Nummernfelder je Position extrahiert werden: Dokumentartikelnummer, interne Artikelnummer, `manufacturerArticleNo`, `customerArticleNo`, "Ihre Artikel-Nr." und sonstige Fremdnummern. Ein fehlendes Feld darf nicht als nicht vorhandener Kandidat interpretiert werden.
- Wenn das Dokument ein Nummernfeld sichtbar enthaelt, dieses aber in `tempPositions` oder `candidateTable` fehlt, ist dies ein Extraktions-/Strukturfehler (`missing_numeric_field`) und die Artikelauflösung darf nicht als fachlich abgeschlossen gelten.
- Die Extraktion ist nur eine Zwischenstufe und darf maximal `documentStatus = extracted` liefern. `documentStatus = complete` darf erst in der Phase `finalize` gesetzt werden.
- Vor `finalize` muessen `GetCustomersByName`, die Kundenreferenzpruefung bei eindeutigem Kunden sowie alle zulaessigen `GetItem`-Pruefungen abgeschlossen sein.
- Vor `semantic_search` muss `resolutionAudit.semanticSearchAllowed = true` sein. Das ist nur erlaubt, wenn kein offener CandidateTable-Eintrag mit `getItemAllowed = true` und `getItemExecuted = false` existiert.
- Jede offene Position muss danach den semantischen Suchloop durchlaufen haben oder als strukturell unbrauchbar dokumentiert sein. Eine offene Position darf nicht einfach als `item_not_found` beendet werden.
- `allRequiredChecksCompleted` ist nur `true`, wenn jede Position `resolved`, `ambiguous`, `item_not_found` nach abgeschlossenem Suchloop oder strukturell unbrauchbar ist.
- `openPositions` muss exakt der Anzahl der Positionen mit `itemFound = false` entsprechen. `partiallyResolvedPositions` darf bei `documentStatus = complete` nicht groesser als 0 sein.
- Wenn `openPositions > 0` oder `partiallyResolvedPositions > 0` ist, muss der Status `documentStatus = extracted` oder `incomplete_document` und `resolutionStatus = in_progress` oder `incomplete` lauten.
- `GetCustomersByName` wird immer mit dem extrahierten Bestellernamen ausgefuehrt. Bei mehreren oder keinen Treffern darf keine Kundennummer geraten werden.
- Bei Bestellungen ist `recognisedEntities.customerName` immer der Besteller beziehungsweise Rechnungsempfaenger, nicht der Lieferant. Der Lieferant bleibt ausschliesslich unter `recognisedEntities.supplier` erhalten.
- `GetItem` bestaetigt interne Artikelnummern. Formal plausible Nummern aus `manufacturerArticleNo` oder Fremdnummernfeldern muessen ebenfalls geprueft werden; erst ein eindeutiger Treffer darf sie als interne Artikelnummer bestaetigen. Die urspruengliche Feldherkunft bleibt erhalten.
- `GetItemReferencesByCustomerNo` wird nur bei eindeutiger Kundennummer verwendet. Referenztreffer werden pro Position bewertet.
- `SearchItems(SearchText)` ist nur der nachgelagerte Fallback fuer Positionen ohne gueltige Artikelnummer oder eindeutige Kundenreferenz. Suchtreffer muessen anhand von Material, Abmessungen, Einheit und Verpackungseinheit bewertet werden.
- Der Beschreibungssuch-Fallback verwendet den Skill `documents.semantic_item_search_v04`: maximal drei Suchaufrufe mit Produktbezeichnung, Kernprodukt und technischen Merkmalen; die Kandidaten werden ueber die Suchlaeufe zusammengefuehrt.
- Die semantische Suche ist der letzte und teuerste Fallback. Bei `SearchItems` werden die normalisierten Artikelnummern aus dem Kernproduktsuchlauf und dem Techniksuchlauf geschnitten; ein eindeutiger Treffer aus dieser Schnittmenge kann als Kandidat uebernommen werden.
- 6-stellige Dokumentnummern wie `110471` und `101902` sind nach der Hanfwolf-Logik keine internen Artikelnummern und werden nicht mit `GetItem` geprueft.
- Die Stellenlogik wird erst nach der vollständigen Extraktion angewendet. Eine 6-stellige Dokumentnummer kann als unplausible interne Nummer klassifiziert werden, darf aber nicht dazu führen, dass andere sichtbare 7- bis 9-stellige Nummernfelder derselben Position aus der CandidateTable verschwinden.
- Die Aufloesungsprioritaet lautet: interner Artikelstamm, Kundenreferenz, eindeutiger Beschreibungstreffer, Mehrdeutigkeit, kein Treffer.
- Bei mehr als drei Positionen werden Positionen 1 bis 3 vollstaendig analysiert und als Musterquelle verwendet. Ab Position 4 wird nur das stabile `documentPattern` angewendet.
- Eine Position mit fehlendem Feld, abweichendem Label, anderer Spaltenanzahl oder unklarer Zuordnung wird als `patternBreak` vollstaendig analysiert. Andere Positionen werden dadurch nicht erneut verarbeitet.
- `item_not_found` darf erst nach der semantischen Suchphase ausgegeben werden. Fuer jede offene Position muessen `semanticSearchAttempted` und `semanticSearchCount` nachvollziehbar sein.
- Eine Position ist nur `resolved`, wenn `itemFound = true` und `resolvedItemNo` gesetzt ist. `partially_resolved` beschreibt extrahierte, aber noch nicht intern zugeordnete Positionen.
- Wenn `identificationMethod = description_search`, muss mindestens ein dokumentierter Suchlauf existieren. Wenn `identificationMethod = internal_item` oder `customer_reference`, muss `semanticSearchAttempted = false` und `semanticSearchCount = 0` sein.
- Eine Position mit `itemFound = true` darf `semanticSearchAttempted = false` und `semanticSearchCount = 0` haben, wenn sie direkt ueber Artikelstamm oder Kundenreferenz aufgeloest wurde. Bei `identificationMethod = description_search` muessen die vorherigen direkten Pruefungen als fehlgeschlagen dokumentiert sein.

## Zielbild
Dori liefert ein strukturiertes Dokumentverständnis, das die Agenten weiterverarbeiten können, ohne das ursprüngliche Rohdokument interpretieren zu müssen.
