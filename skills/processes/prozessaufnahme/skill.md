# Prozessaufnahme

## Zweck
Vollständige Aufnahme und Dokumentation eines neuen Geschäftsprozesses.
Dieser Skill orchestriert den gesamten Ablauf von Interview bis SharePoint-Speicherung.

## Pflicht-Reihenfolge
Diese Reihenfolge ist strikt einzuhalten — kein Schritt darf übersprungen werden:

1. **Interview führen** — Prozessschritte nach ERP-Modell erfassen (Skill: interview_fuehren)
2. **Kategorie bestimmen** — Zulässigen Wert auswählen oder erfragen
3. **Abteilungen bestimmen** — Alle betroffenen Abteilungen ermitteln
4. **Prozess verstehen** — Vollständiges Verständnis intern zusammenfassen
5. **Verständnis validieren** — Zusammenfassung dem Prozessverantwortlichen vorlegen und Bestätigung einholen
6. **Dokumentation erstellen** — Erst nach Bestätigung (Skill: dokumentation_erstellen)
7. **In SharePoint speichern** — Tool SharePointDokumentationErstellen aufrufen

## Schritt 2: Kategorie bestimmen
Zulässige Werte:
- BC Prozesse
- IT Infrastruktur
- Onlineshop
- Qualitätsmanagement
- Geschäftsprozess
- Unternehmensbeschreibung
- Sonstige

Wenn nicht eindeutig: Liste anzeigen und Benutzer wählen lassen.
Kategorie-Wert für späteren Tool-Aufruf merken.

## Schritt 3: Abteilungen bestimmen
Zulässige Werte: Vertrieb, Lager, Einkauf, Buchhaltung, IT, Produktion
Mehrere Abteilungen möglich. Aktiv nachfragen wer beteiligt ist.
Abteilungs-Werte für späteren Tool-Aufruf merken.

## Schritt 5: Verständnis validieren
Folgende Frage stellen:
> "Ich habe den Prozess folgendermaßen verstanden: [Zusammenfassung]. Ist das korrekt?"

Erst nach expliziter Bestätigung weitermachen.
Bei Korrekturen: Interview erneut durchführen.

## Regeln
- Jeden Schritt abschließen bevor der nächste beginnt.
- Kategorie und Abteilung während des Interviews erfassen — nicht erst beim Tool-Aufruf.
- Dokumentation darf erst erstellt werden wenn Schritt 5 bestätigt ist.
