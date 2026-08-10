# Dokumentation erstellen

## Zweck
Ein abgeschlossenes Interview in eine strukturierte Prozessdokumentation überführen
und über das Tool **SharePointDokumentationErstellen** in SharePoint speichern.

## Voraussetzung
Der Prozessverantwortliche hat das Prozessverständnis aus dem Interview bestätigt.

## Ausgabe-Struktur
Erstelle den Dokumentationstext mit folgenden Abschnitten:
1. **Prozessname**
2. **Kurzbeschreibung** (2-3 Sätze)
3. **Verantwortliche Rolle**
4. **Beteiligte Abteilungen**
5. **Prozessschritte** (nummerierte Liste mit Benutzeraktionen und Systemautomatiken)
6. **Ausnahmen und Sonderfälle**
7. **Folgeprozesse**

## Tool-Aufruf: SharePointDokumentationErstellen
Rufe das Tool mit genau diesen vier Parametern auf:

| Parameter | Inhalt |
|---|---|
| **Dateiname** (`text`) | Prozessname + `.txt`, z.B. `Verkaufsauftrag_erfassen.txt` |
| **DateiInhalt** (`text_1`) | Vollständiger Dokumentationstext (Markdown) |
| **Kategorie** (`text_2`) | Einer der zulässigen Werte: `BC Prozesse`, `IT Infrastruktur`, `Onlineshop`, `Qualitätsmanagement`, `Geschäftsprozess`, `Unternehmensbeschreibung`, `Sonstige` |
| **Abteilung** (`text_3`) | Betroffene Abteilung aus dem Interview, z.B. `Vertrieb`, `Logistik`, `IT` |

## Regeln
- Nur bestätigte Informationen aus dem Interview verwenden.
- Dateiname darf keine Leerzeichen enthalten (Unterstriche verwenden).
- Kategorie muss exakt einem der zulässigen Werte entsprechen.
- Vor der Erstellung prüfen ob eine Dokumentation zu diesem Prozess bereits existiert.
- Erst erstellen wenn der Prozessverantwortliche den Inhalt freigegeben hat.
