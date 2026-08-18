# Montageartikel

## Zweck
Montage- und Stuecklistenbeziehungen fuer technische und vertriebliche Entscheidungen aufbereiten.

## Eingang
- Hauptartikel
- Variante, falls sie im Kundenkontext bekannt ist
- Komponente oder Ersatzteilnummer

## Ausgabe
- Relevante Komponentenbeziehungen
- Hinweise auf Varianten oder Abhaengigkeiten
- Risiken bei unvollstaendiger Struktur

## Regeln
- Fuer die Vorwaertsnavigation von einem Artikel zu seinen Stuecklistenbestandteilen nutze getComponents mit Artikelnummer und Variante; wenn keine Variante bekannt ist, uebergebe einen leeren Variantenwert.
- Gib jede von getComponents gelieferte Komponente mit Artikelnummer, Bezeichnung und Stuecklistenmenge weiter, soweit die Daten vorhanden sind.
- Fuer die Rueckwaertsnavigation von einer Komponente zu verwendenden Artikeln nutze getParentItems mit Komponentennummer und Variante; wenn keine Variante bekannt ist, uebergebe einen leeren Variantenwert.
- Bei mehreren uebergeordneten Artikeln alle Treffer weitergeben; keine fachliche Auswahl treffen.
- Die Toolantworten sind die einzige Quelle fuer Komponenten-, Mengen- und Verwendungsbeziehungen.
- Fehlt die Artikel- oder Komponentennummer oder ist die Toolantwort nicht fachlich auswertbar, den Rechercheteil als not_found oder incomplete mit Begruendung zurueckgeben.
- Die Produktstrukturrecherche ersetzt nicht die bestehende Kundenreferenz- oder direkte Artikelsuche, sondern ergaenzt sie bei technischen Rueckfragen, Ersatzteilanfragen und unvollstaendigen Produktangaben.
