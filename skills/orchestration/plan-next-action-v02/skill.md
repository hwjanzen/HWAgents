# Plan Next Action V0.2

## Zweck
Aus dem Zustand des Falls genau eine naechste Business-Aktion ausgeben.

## Eingang
- nextStatus aus orchestration.detect_case_state_v02
- Case-Objekt gemaess schemas/v01-agent-case-contract.schema.json

## Ausgabe
- nextBusinessAction:
  - ask_artika
  - ask_erkan
  - ask_looka_for_tanja_mail
  - ask_user_for_clarification
  - end_conversation
- actionReason

## Regeln
- Immer genau eine naechste Aktion ausgeben.
- Bei vorhandenem Firmennamen und fehlender Debitorentscheidung: ask_artika.
- Bei Debitor ambiguous: ask_user_for_clarification (nur Kandidatenauswahl).
- Nach gueltiger Debitorauswahl immer erst Referenzsuche ueber Artika.
- Nur wenn Debitor und Referenz jeweils unique sind: ask_erkan.
- Bei not_found oder unresolved ambiguous: ask_looka_for_tanja_mail oder ask_user_for_clarification gemaess Prozessstatus.
- Bei reason = incomplete_tool_payload immer ask_artika mit strukturierter Nachforderung der fehlenden Fachdaten (Trefferliste, itemNo, Beschreibung, Begruendung).
- Keine Websuche als Aktion erzeugen.
