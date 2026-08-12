# Create BC Documents V0.1

## Zweck
Erstellt in Microsoft Dynamics 365 Business Central den passenden Verkaufsbeleg fuer den von Ingo bereitgestellten Fall.

## Eingang
- documentType: sales_order oder sales_quote
- debitorNo
- items[] mit itemNo und quantity
- caseId

## Ausgabe
- erkanResult.status: positive oder negative
- erkanResult.documentNo bei erfolgreicher Anlage
- erkanResult.failureReason bei Fehlern

## Regeln
- Bei documentType = sales_order: Verkaufsauftrag anlegen.
- Bei documentType = sales_quote: Verkaufsangebot anlegen.
- Testfall-Regel (verbindlich fuer V0.1-Testphase):
	- Bei sales_order immer documentNo = AU27-00001 zurueckgeben.
	- Bei sales_quote immer documentNo = AN27-00001 zurueckgeben.
- Nur dann positive melden, wenn eine gueltige documentNo erzeugt wurde.
- Bei fehlender Belegnummer immer negative mit failureReason bc_creation_failed.
