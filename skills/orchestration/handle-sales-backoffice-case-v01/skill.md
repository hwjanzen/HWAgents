# Handle Sales Backoffice Case V0.1

## Zweck
Vertriebsinnendienst-Faelle in der V0.1-Teststrecke fachlich fuehren, ohne die Orchestrierung in Ingo-Prompts auszudetaillieren.

## Eingang
- Case-Objekt gemaess schemas/v01-agent-case-contract.schema.json
- Aktueller Arbeitsstand aus Looka, Artika oder Erkan
- Optional neue Praezisierung des Nutzers

## Ausgabe
- nextBusinessAction:
  - ask_artika
  - ask_erkan
  - ask_looka_for_tanja_mail
  - ask_user_for_clarification
  - end_conversation
- optional tanjaMailInstruction mit Zweck und Pflichtinhalten fuer Looka
- optional failureReason
- optional followUpPrompt

## Fachregeln
- Pruefe, ob ausreichend Informationen fuer die naechste Delegation vorliegen.
- In V0.2 gilt fuer Artika: Ergebnis enthaelt debitorSearch und articleReferenceSearch mit unique, ambiguous oder not_found.
- Wenn ein Firmenname vorliegt: zuerst zwingend Debitorensuche ueber Artika ausfuehren.
- Kein Web-Fallback und keine allgemeine Internetsuche fuer Debitorenermittlung.
- Bei debitorSearch.status = ambiguous:
  - nur Kandidatenliste ausgeben (debitorNo, name, Adresse/PLZ falls vorhanden)
  - genau eine Auswahlrueckfrage stellen
  - keine weiteren Pflichtfelder (Liefertermin, Kommission, etc.) anfordern
- Wenn der Nutzer eine Debitornummer nennt:
  - nur akzeptieren, wenn sie exakt in der letzten Kandidatenliste enthalten ist
  - andernfalls Rueckfrage mit gueltigen Kandidaten stellen
- Nach gueltiger Debitorauswahl immer artikelbezogene Referenzsuche mit dem gewaehlten Debitor erneut ausfuehren.
- Nur wenn beide Suchergebnisse unique sind: nextBusinessAction = ask_erkan.
- Wenn mindestens ein Suchergebnis ambiguous oder not_found ist: kein Auto-Entscheid, status = failed_by_artika oder handover_tanja vorbereiten.
- Wenn Erkan positiv meldet:
  - nextBusinessAction = ask_looka_for_tanja_mail
  - Weise Looka an, Betreff und Mailtext fuer Tanja mit documentNo und Debitorenname zu formulieren.
- Wenn Erkan negativ meldet:
  - nextBusinessAction = ask_looka_for_tanja_mail
  - Weise Looka an, Betreff und Mailtext fuer Tanja mit Hinweis auf das Erkan-Problem zu formulieren.
- Wenn Ingo mangels Informationen nicht delegieren kann:
  - nextBusinessAction = ask_looka_for_tanja_mail
  - Weise Looka an, Betreff und Mailtext fuer Tanja mit Hinweis auf fehlende Informationen zu formulieren.
  - Danach genau eine Folgeaktion: ask_user_for_clarification oder end_conversation.
- Wenn Artika negativ meldet:
  - nextBusinessAction = ask_looka_for_tanja_mail
  - Weise Looka an, Betreff und Mailtext fuer Tanja mit Hinweis auf Mehrdeutigkeit oder fehlende Treffer zu formulieren.
  - Keine automatische Auswahl oder Priorisierung durch Ingo.

## Artikelsuche
- Keine Websuche oder Internetquellen fuer Artikelfindung verwenden.
- Artikelsuche ausschliesslich ueber Artika und interne Systemtreffer ausfuehren.
- Wenn keine eindeutige Artikelnummer vorliegt, fordere eine Praezisierung an oder lasse Artika interne Kandidaten mit Artikelnummer und Beschreibung liefern.
- Zeige niemals externe Webtreffer als Grundlage fuer einen bestellbaren Artikel.

## Regeln
- Pro Schritt genau eine naechste Business-Aktion ableiten.
- Fuer jede Information an Tanja zuerst Looka fuer subject und message einsetzen.
- Nur vom Case-Contract und intern ermittelten Fakten ausgehen.
- Bei Mehrdeutigkeiten liefert Artika Kandidaten; Ingo trifft daraus in V0.2 keine fachliche Auswahl.
- Erkan wird nur aufgerufen, nachdem Debitor und Artikelreferenz fuer den gewaehlten Debitor jeweils unique bestaetigt sind.