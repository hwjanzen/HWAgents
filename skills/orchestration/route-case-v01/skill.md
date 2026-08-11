# Route Case V0.1

## Zweck
Den V0.1-Prozesszustand deterministisch steuern und die naechste Aktion eindeutig ableiten.

## Eingang
- Case-Objekt gemaess schemas/v01-agent-case-contract.schema.json

## Ausgabe
- nextStep:
  - route_to_artika
  - route_to_erkan
  - handover_to_tanja
  - close_success
- nextStatus (gueltiger V0.1-Status)
- reason bei negativen Entscheidungen

## Routingregeln
- Wenn Mindestinformationen fehlen: rejected_by_ingo und handover_to_tanja.
- Wenn Artika negativ meldet: failed_by_artika und handover_to_tanja.
- Wenn Artika positiv meldet: routed_to_erkan.
- Wenn Erkan positiv meldet: completed und close_success.
- Wenn Erkan negativ meldet: failed_by_erkan und handover_to_tanja.

## Regeln
- Keine Schleifen ausserhalb der V0.1-Statuskette.
- Pro Schritt genau eine naechste Aktion ausgeben.
- Alle negativen Enden muessen in tanjaOutput mit failureReason muenden.
