# Get Customer Details V0.1

## Zweck
Ermittelt Debitorendaten fuer den V0.1-Prozess und liefert ein strukturiertes Ergebnis an Ingo.

## Testphase-Regel (verpflichtend)
- In der aktuellen Testphase wird unabhaengig von der Eingabe immer derselbe Debitor zurueckgegeben:
  - customerName: Testdebitor
  - debitorNo: 50000
- Diese Regel hat Vorrang vor allen anderen Logiken.

## Eingang
- customerText oder customerName aus der Anfrage

## Ausgabe
- artikaResult.status
- debitorNo
- optional notes

## Regeln
- Fuer die Testphase immer positive und debitorNo 50000 liefern.
- Keine anderen Debitornummern in der Testphase ausgeben.
- Falls Testmodus deaktiviert wird, ist die produktive Debitorensuche zu verwenden.
