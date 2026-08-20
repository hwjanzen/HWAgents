# Artikelnummern V0.6.1

## Zweck
Nummernwerte aus Bestellungen als Hypothesen bewerten und mit Score priorisieren.
Der Skill liefert keine Endentscheidung, sondern eine belastbare Nummernlogik fuer die naechsten Tool-Aufrufe.

## Eingang
- `numbers[]` aus Positionstext, Feldern und Referenzspalten
- Optional: Feldkontext (`Ihre Artikelnummer`, `Lieferantenartikelnummer`, `Herstellerartikelnummer`, `Kundenreferenz`)
- Optional: Kategorie-/Attributhinweise

## Scoring-Regeln
- 7-9 stellig, rein numerisch: starker Kandidat fuer interne Hanfwolf-Artikelnummer
	- Standardscore: `95`
- 6 stellig, rein numerisch: eher Kundenreferenz, Legacy oder Fremdnummer
	- Standardscore: `30`
- Alphanumerisch: Referenzkandidat
	- Standardscore: `30`
- Offensichtlich unpassendes Muster: unwahrscheinlich
	- Standardscore: `10`

## Score-Feinjustierung
- Hebe auf `98`, wenn zusaetzlich Feldkontext auf Lieferanten-/Herstellerartikel oder interne ERP-Angabe hinweist.
- Senke auf `70`, wenn 7-9 stellig numerisch ist, aber Kontext/Format uneinheitlich ist.
- Senke auf `25`, wenn 6-stellig numerisch und gleichzeitig eine 7-9-stellige Alternative in derselben Position vorkommt.

## Ausgabe
- `numberHypotheses[]` mit:
	- `value`
	- `patternType` (`numeric_7_9`, `numeric_6`, `alphanumeric`, `other`)
	- `hypothesisType` (`internal_item_no`, `customer_reference`, `foreign_item_no`)
	- `score` (0-100)
	- `reason`

## Beispiel
```json
{
	"positionId": "10",
	"numberHypotheses": [
		{
			"value": "110471",
			"patternType": "numeric_6",
			"hypothesisType": "customer_reference",
			"score": 25,
			"reason": "6-stellig numerisch; in derselben Position existiert ein staerkerer 9-stelliger Kandidat"
		},
		{
			"value": "108010053",
			"patternType": "numeric_7_9",
			"hypothesisType": "internal_item_no",
			"score": 98,
			"reason": "9-stellig numerisch mit passendem Feldkontext"
		}
	],
	"recommendedFirstAction": "GetItem"
}
```

## Regeln
- Der hoechste Score steuert den ersten Tool-Aufruf.
- Gleichstand > 90: mehrere starke Kandidaten parallel pruefen.
- Referenzsuche darf nicht den ersten Aufruf erhalten, wenn ein interner Kandidat >= 90 vorliegt.
