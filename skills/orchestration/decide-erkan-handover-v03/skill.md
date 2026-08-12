# Decide Erkan Handover V0.3

## Zweck
Entscheiden, ob ein Vorgang an Erkan uebergeben werden darf oder an Human-in-the-Loop uebergeben werden muss.

## Eingang
- Debitor-Validierung
- positionResolution[] aus orchestratorischer Iteration

## Ausgabe
- handoverDecision: handover_to_erkan | handover_to_human_innendienst
- decisionReason
- blockingPositions[] (falls vorhanden)

## Regeln
- Handover zu Erkan nur, wenn Debitor eindeutig ist und alle Positionen resolved sind.
- Wenn mindestens eine Position unresolved ist: kein Handover zu Erkan.
- Bei NoGo die blockierenden Positionen explizit benennen.