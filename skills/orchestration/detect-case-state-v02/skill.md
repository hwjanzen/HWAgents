# Detect Case State V0.2

## Zweck
Den aktuellen Fallzustand aus Contract, Suchergebnissen und letzter Nutzernachricht eindeutig bestimmen.

## Eingang
- Case-Objekt gemaess schemas/v01-agent-case-contract.schema.json
- Letzte Nutzernachricht

## Ausgabe
- nextStatus
- reason
- confidence (low, medium, high)

## Regeln
- Nur Contract-Daten und interne Ergebnisse verwenden.
- Wenn debitorSearch fehlt und Firmenname vorliegt: Zustand auf Debitorsuche ausrichten.
- Wenn debitorSearch.status = ambiguous: Zustand auf Auswahlentscheidung ausrichten.
- Wenn Debitor eindeutig gewaehlt ist, aber articleReferenceSearch fehlt: Zustand auf Referenzsuche ausrichten.
- Wenn articleReferenceSearch.status = ambiguous oder not_found: Zustand auf Klaerung/Handover ausrichten.
- Wenn Debitor und Referenz jeweils unique: Zustand auf Erkan-Weitergabe ausrichten.
- Wenn Toolantwort nur technischen Status ohne Nutzdaten enthaelt (z. B. Done=true ohne Trefferfelder): reason = incomplete_tool_payload und Zustand auf erneute strukturierte Artika-Anfrage ausrichten.
