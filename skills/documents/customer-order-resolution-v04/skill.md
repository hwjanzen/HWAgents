# Customer Order Resolution V0.4

## Zweck
Dieser Skill gilt fuer den Dokumenttyp `Kundenbestellung` beziehungsweise `Bestellung` und steuert die Artikelaufloesung in Kundenbelegen.

## Leitregel
Der Kunde koennte unsere Artikelnummer als Herstellernummer ausweisen. Denke zum Schluss an die semantische Suche.

## Verbindlicher Ablauf
1. Behandle Nummern aus den Feldern `Artikel`, `Artikel-Nr. Herst.`, `Ihre Artikel-Nr.`, `manufacturerArticleNo`, `customerArticleNo` und sonstigen Fremdnummernfeldern als moegliche interne Artikelkandidaten.
2. Fuehre fuer jede formal plausible Nummer zuerst `GetItem` aus. Die Feldbezeichnung darf niemals der Grund sein, den Artikelstamm-Check zu ueberspringen.
3. Fuehre den Kundenreferenzabgleich fuer einen eindeutig ermittelten Kunden durch.
4. Denke zum Schluss an die semantische Suche: Fuer jede danach offene Position muss `SearchItems` als letzter Fallback gestartet werden.
5. Gib eine Position nur mit passender Toolspur als `resolved`, `ambiguous` oder `item_not_found` aus. Eine reine Dokumentextraktion ist noch keine fachliche Aufloesung.

## Geltungsbereich
Dieser Skill ist nur fuer Kundenbestellungen bestimmt. Andere Dokumenttypen duerfen diese Regeln nicht ungeprueft uebernehmen; sie muessen ihre eigene dokumenttypische Aufloesungslogik verwenden.
