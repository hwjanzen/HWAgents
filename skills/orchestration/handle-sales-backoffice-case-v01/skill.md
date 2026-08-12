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
  - Weise Looka an, Betreff und Mailtext fuer Tanja mit Hinweis auf nicht eindeutige Artikelidentifikation zu formulieren.
  - Danach genau eine Folgeaktion: ask_user_for_clarification oder end_conversation.

## Artikelsuche
- Keine Websuche oder Internetquellen fuer Artikelfindung verwenden.
- Artikelsuche ausschliesslich ueber Artika und interne Systemtreffer ausfuehren.
- Wenn keine eindeutige Artikelnummer vorliegt, fordere eine Praezisierung an oder lasse Artika interne Kandidaten mit Artikelnummer und Beschreibung liefern.
- Zeige niemals externe Webtreffer als Grundlage fuer einen bestellbaren Artikel.

## Regeln
- Pro Schritt genau eine naechste Business-Aktion ableiten.
- Fuer jede Information an Tanja zuerst Looka fuer subject und message einsetzen.
- Nur vom Case-Contract und intern ermittelten Fakten ausgehen.