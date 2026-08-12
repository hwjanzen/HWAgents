# Resolve Ambiguous Debitor V0.2

## Zweck
Mehrdeutige Debitorensuche ohne Auto-Entscheidung sauber aufloesen.

## Eingang
- debitorSearch mit status ambiguous
- letzte Nutzerangabe zur Debitorauswahl

## Ausgabe
- resolutionStatus:
  - selected
  - invalid_selection
  - pending_selection
- selectedDebitor (bei selected)
- followUpPrompt (bei invalid_selection oder pending_selection)

## Regeln
- Bei ambiguous immer Kandidatenliste mit debitorNo, name und optional Adresse/PLZ ausgeben.
- Nur Debitornummern akzeptieren, die exakt in der Kandidatenliste vorkommen.
- Unscharfe Kurzformen (z. B. 9140 statt BI19140) nur nach expliziter Rueckbestaetigung akzeptieren.
- Bei ungueltiger Auswahl erneut gueltige Kandidaten anzeigen und um eindeutige Auswahl bitten.
- Nach selected ist die naechste Aktion zwingend die Referenzsuche fuer diesen Debitor.
