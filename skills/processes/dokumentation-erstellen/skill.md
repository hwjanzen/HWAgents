# Dokumentation erstellen

## Zweck
Ein bestätigtes Interview in eine vollständige Prozessdokumentation überführen
und über das Tool **SharePointDokumentationErstellen** in SharePoint speichern.

## Voraussetzung
Der Prozessverantwortliche hat das Prozessverständnis bestätigt.

## Dokumentations-Struktur
Jede Dokumentation enthält:
1. Prozessname
2. Ziel
3. Kategorie
4. Abteilungen
5. Trigger
6. Triggerkanal
7. Rollen
8. ERP-Objekte
9. Benutzeraktionen
10. Systemautomatiken
11. Entscheidungen
12. Fehlerfälle
13. Ergebnis
14. Folgeprozess

## Pflicht-Checkliste vor Tool-Aufruf
Bevor du SharePointDokumentationErstellen aufrufst, stelle sicher dass alle vier Werte aus dem aktuellen Gespräch vorliegen.
Wenn ein Wert fehlt, frage gezielt nach — rufe das Tool NICHT auf bevor alle vier Werte bestätigt sind.

| # | Wert | Quelle | Pflicht |
|---|---|---|---|
| 1 | Dateiname | Aus Prozessname ableiten: `Prozessdokumentation_<Prozessname>.txt` | ✅ |
| 2 | DateiInhalt | Vollständiger Dokumentationstext — aus dem Interview selbst erzeugen | ✅ |
| 3 | Kategorie | Aus dem Interview — exakt einer der zulässigen Werte | ✅ |
| 4 | Abteilung | Aus dem Interview — als JSON-Array-String | ✅ |



## Tool-Aufruf: SharePointDokumentationErstellen

⚠️ ACHTUNG: Reihenfolge der Parameter exakt einhalten — Verwechslung führt zu falschem Inhalt.

| Flow-Parameter | Inhalt | Was es NICHT ist |
|---|---|---|
| `text` | Nur der Dateiname — z.B. `Prozessdokumentation_Streckenbestellung.txt` | Nicht der Dokumentationstext |
| `text_1` | Der vollständige Dokumentationstext (alle 14 Felder) | Nicht die Kategorie |
| `text_2` | Nur die Kategorie — ein einzelner zulässiger Wert, z.B. `BC Prozesse` | Nicht der Dokumentationstext |
| `text_3` | Abteilungen als JSON-Array-String — z.B. `[{"Value":"Vertrieb"},{"Value":"Einkauf"}]` | Nicht als einfacher Text |

Zulässige Kategoriewerte: `BC Prozesse`, `IT Infrastruktur`, `Onlineshop`, `Qualitätsmanagement`, `Geschäftsprozess`, `Unternehmensbeschreibung`, `Sonstige`

Zulässige Abteilungswerte: `Vertrieb`, `Lager`, `Einkauf`, `Buchhaltung`, `IT`, `Produktion`

## Regeln
- Nur bestätigte Informationen aus dem Interview verwenden.
- Dateiname: `Prozessdokumentation_<Prozessname>.txt` — Leerzeichen = Unterstriche, keine Sonderzeichen.
- Niemals Dateiinhalt vom Benutzer anfordern — aus dem Interview selbst erzeugen.
- Vor der Erstellung prüfen ob eine Dokumentation zu diesem Prozess bereits existiert.
- Toolausgaben, IDs, JSON-Daten und technische Metadaten niemals an den Benutzer ausgeben.

## Erfolgsmeldung nach Speicherung
Ausgeben:
- Prozessname
- Dateiname
- Speicherort
- Erstellungsdatum
