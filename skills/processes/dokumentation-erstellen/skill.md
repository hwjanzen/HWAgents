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

Parameter-Zuordnung — verwende ausschließlich Werte aus dem aktuellen Gespräch:

| Flow-Parameter | Wert aus Gespräch | Format | Beispiel |
|---|---|---|---|
| `text` | Prozessname aus dem Interview | `Prozessdokumentation_<Name>.txt` — Leerzeichen = Unterstriche | `Prozessdokumentation_Verkaufsauftrag_erfassen.txt` |
| `text_1` | Vollständiger Dokumentationstext | Markdown-Text | (gesamter Dokumentationsinhalt) |
| `text_2` | Kategorie aus dem Interview | Exakt ein zulässiger String | `BC Prozesse` |
| `text_3` | Abteilungen aus dem Interview | JSON-Array-String — mehrere möglich | `[{"Value":"Vertrieb"},{"Value":"Buchhaltung"}]` |

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
