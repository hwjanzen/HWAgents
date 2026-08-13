# Produktsuche

## Zweck
Passende Artikelkandidaten fuer eine Anfrage ermitteln und fuer die naechste Entscheidung strukturieren.

## Eingang
- Suchtext aus Kundenanfrage oder interner Rueckfrage
- Optional: Kategoriecode, bekannte Artikelnummern, Mengenhinweise

## Ausgabe
- Liste relevanter Artikelkandidaten mit kurzer Begruendung
- Markierung von Unsicherheiten oder fehlenden Eingaben
- Empfehlung fuer naechsten Schritt (Direktzuordnung oder Rueckfrage)

## Regeln
- Nutze ausschliesslich interne Produktdaten vor Annahmen.
- Webtreffer, Herstellerseiten und externe Produktkataloge sind keine gueltige Quelle.
- Hersteller-Artikelnummern duerfen niemals als interne Artikelnummer ausgegeben werden.
- Wenn mehrere interne Treffer moeglich sind: Unterschiede knapp benennen und eine Kandidatenliste mit interner Artikelnummer und Beschreibung liefern.
- Wenn keine internen Treffer vorliegen: das explizit sagen und keine externen Alternativen konstruieren.
- Bei unklarer Anfrage zuerst Rueckfrage priorisieren.
- Wenn der Suchtext wie eine konkrete interne Artikelnummer aussieht,
  zuerst einen direkten internen Stammdatencheck auf genau diese Nummer ausfuehren
  (z. B. GetItem/GetItemDetails) und das Ergebnis als unique/ambiguous/not_found melden.
- Bei mehreren Positionswerten die Pruefung pro Position einzeln ausfuehren und
    je Wert ein separates Ergebnis liefern (kein Sammelstatus ohne Positionsbezug).
