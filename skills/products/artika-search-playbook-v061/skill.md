# Artika Search Playbook V0.6.1

## Zweck
Zentrale Orchestrierungslogik fuer Artika. Dieser Skill definiert die Reihenfolge, Fallbacks und Ergebnisregeln.

## Pflichtskills je Position
- products.order_position_parser_v01
- products.position_analyse_v01
- products.artikelnummern
- products.customer_order_interpreter_v01
- products.article_hypothesis_ranker_v01
- products.category_first_search_v01
- products.composita_search_v01
- products.attribute_gap_analysis_v01

## Suchalgorithmus (scorebasiert)
1. Debitor eindeutig ueber GetCustomersByName aufloesen.
2. Position parsen und Hypothesen erzeugen.
3. Alle starken Kandidaten (score >= 90) zuerst ueber GetItem/GetItemDetails pruefen.
4. Wenn kein unique: category-first + composita + produktsuche.
5. Wenn weiterhin kein unique: GetItemReferencesByCustomerNo als letzter Fallback.
6. Wenn mehrere plausible Treffer bleiben: Attribute Gap Analysis und missingAttributes ausgeben.

## Nummernlogik
- 7-9 stellig numerisch: starker interner Kandidat (95-98)
- 6 stellig numerisch: eher Referenz/Legacy (20-35)
- alphanumerisch: Referenzkandidat (20-40)
- unpassendes Muster: niedrig (<=10)

## Tool-Output-Mapping
- GetCustomersByName: filejson
- GetItemReferencesByCustomerNo: respondjson oder filejson
- GetItem/GetItemDetails: jsonsqlbody
- getComponents: jsonresult
- getParentItems: jsonfile
- GetItemInventory: jsonresult

## Ergebnisregeln
- Status nur: unique | ambiguous | not_found
- toolPayloadStatus: complete nur bei fachlich auswertbarem Payload
- not_found ist nicht automatisch incomplete
- Bei ambiguous: Kandidaten plus score und missingAttributes liefern
- Keine fachliche Einzelauswahl bei ambiguous/not_found

## Contract-Hinweis
Rueckgabe muss kompatibel zu v01-agent-case-contract sein, inklusive positionChecks und articleReferenceSearch.
