# Run Iterative Position Clarification V0.3

## Zweck
Hypothesen pro Position iterativ mit Artika pruefen, bis eine eindeutige interne Artikelnummer vorliegt oder keine sinnvolle Aufloesung mehr moeglich ist.

## Eingang
- positionHypotheses aus orchestration.build_position_hypotheses_v03
- artikaResult mit Recherchetreffern je Position und Hypothese

## Ausgabe
- positionResolution[]
  - positionId
  - status: resolved | unresolved
  - resolvedItemNo (bei resolved)
  - testedHypotheses[] mit Ergebnis
  - unresolvedReason (bei unresolved)
- nextIterationAction:
  - ask_artika_next_hypothesis
  - ask_user_for_clarification
  - finish_resolution

## Regeln
- Pro Schleife nur die naechste fachlich beste Hypothese pruefen.
- Bei eindeutigem Treffer sofort als resolved markieren.
- Bei widerspruechlichen oder mehrfachen Treffern als unresolved behandeln und Rueckfrage vorbereiten.
- Iteration beenden, wenn keine unbeprueften plausiblen Hypothesen mehr vorhanden sind.