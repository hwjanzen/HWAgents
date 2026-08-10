# Dokumentation erstellen

## Zweck
Ein bestätigtes Interview in eine vollständige Prozessdokumentation überführen
und über das Tool **SpeichereVerifiziertesProzessdokument** in SharePoint speichern.

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
Bevor du SpeichereVerifiziertesProzessdokument aufrufst, führe diesen Schritt zwingend aus:

**Zeige dem Benutzer die vier Werte zur Bestätigung:**
> "Ich möchte die Dokumentation mit folgenden Angaben speichern:
> - Dateiname: [Wert] ← muss auf .txt enden
> - Kategorie: [Wert]
> - Abteilung: [Wert]
> - Inhalt: [erste 3 Zeilen der Dokumentation]...
>
> Soll ich jetzt speichern?"

Rufe das Tool erst nach expliziter Bestätigung auf.
Wenn Kategorie oder Abteilung noch nicht bekannt sind: **jetzt erfragen** — Tool-Aufruf ist gesperrt bis beide Werte vorliegen.



## Tool-Aufruf: SpeichereVerifiziertesProzessdokument

⚠️ ACHTUNG: Reihenfolge der Parameter exakt einhalten — Verwechslung führt zu falschem Inhalt.

| Flow-Parameter | Inhalt | Was es NICHT ist |
|---|---|---|
| `text` | Dateiname nach Schema: `Prozessdokumentation_` + Prozessname + `.txt` — Leerzeichen durch Unterstriche ersetzen, Sonderzeichen entfernen. Beispiel: `Prozessdokumentation_Streckenbestellung_aus_Verkaufsauftrag.txt` | Nicht das Wort "Prozessname_" wörtlich. Nicht ohne .txt. Nicht mit Leerzeichen. |
| `text_1` | Der vollständige Dokumentationstext (alle 14 Felder) | Nicht die Kategorie |
| `text_2` | Nur die Kategorie — ein einzelner zulässiger Wert, z.B. `BC Prozesse` | Nicht der Dokumentationstext |
| `text_3` | Abteilungen als JSON-Array-String — z.B. `[{"Value":"Vertrieb"},{"Value":"Einkauf"}]` | Nicht als einfacher Text |

Zulässige Kategoriewerte: `BC Prozesse`, `IT Infrastruktur`, `Onlineshop`, `Qualitätsmanagement`, `Geschäftsprozess`, `Unternehmensbeschreibung`, `Sonstige`

Zulässige Abteilungswerte: `Vertrieb`, `Lager`, `Einkauf`, `Buchhaltung`, `IT`, `Produktion`

## Regeln
- Nur bestätigte Informationen aus dem Interview verwenden.
- Dateiname: `Prozessdokumentation_<Prozessname>.txt` — Leerzeichen = Unterstriche, keine Sonderzeichen, Endung `.txt` ist Pflicht.
- Dateiname niemals ohne `.txt` übergeben — der Flow kann die Datei sonst nicht korrekt anlegen.
- Niemals Dateiinhalt vom Benutzer anfordern — aus dem Interview selbst erzeugen.
- Offene Punkte und ungeklärte Informationen sichtbar in der Dokumentation kennzeichnen.
- Vor der Erstellung prüfen ob eine Dokumentation zu diesem Prozess bereits existiert.
- Dokumentation gilt erst als abgeschlossen wenn sie erfolgreich in SharePoint gespeichert wurde.
- Toolausgaben, IDs, JSON-Daten und technische Metadaten niemals an den Benutzer ausgeben.

## Erfolgsmeldung nach Speicherung
Ausgeben:
- Prozessname
- Dateiname
- Speicherort
- Erstellungsdatum
