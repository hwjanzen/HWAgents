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

## Tool-Aufruf: SharePointDokumentationErstellen

Vor dem Aufruf Parameterzuordnung validieren:

| Parameter | Flow-Parameter | Format | Beispiel |
|---|---|---|---|
| Dateiname | `text` | String, Unterstriche statt Leerzeichen, `.txt` | `Prozessdokumentation_Verkaufsauftrag_erfassen.txt` |
| DateiInhalt | `text_1` | Vollständiger Dokumentationstext | (kompletter Inhalt) |
| Kategorie | `text_2` | String, exakt ein zulässiger Wert | `BC Prozesse` |
| Abteilung | `text_3` | JSON-Array als String | `[{"Value":"Vertrieb"},{"Value":"Buchhaltung"}]` |

**Wichtig:** Abteilung MUSS als JSON-Array-String übergeben werden.

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
