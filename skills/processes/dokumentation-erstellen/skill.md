# Dokumentation erstellen

## Zweck
Aus den Interview-Antworten eine vollstaendige Prozessdokumentation aufbauen
und ueber das Tool **SpeichereVerifiziertesProzessdokument** in SharePoint speichern.

## Schritt 1 - Dokumentationstext aufbauen
Erstelle aus den Interview-Antworten einen fliessenden Dokumentationstext ohne Prefix-Labels.
Nicht: "Prozessname: Streckenbestellung" — sondern direkt den Inhalt beschreiben.
Verwende Abschnitte mit Markdown-Ueberschriften:

## Prozessname
[Name]
## Ziel
[Ziel]
## Kategorie
[Kategorie]
## Abteilungen
[Abteilungen]
## Trigger
[Trigger]
## Triggerkanal
[Triggerkanal]
## Rollen
[Rollen]
## ERP-Objekte
[ERP-Objekte]
## Benutzeraktionen
[Benutzeraktionen]
## Systemautomatiken
[Systemautomatiken]
## Entscheidungen
[Entscheidungen]
## Fehlerfaelle
[Fehlerfaelle]
## Ergebnis
[Ergebnis]
## Folgeprozess
[Folgeprozess]

## Schritt 2 - SharePoint-Speicherung

Nach Freigabe muss das Tool SpeichereVerifiziertesProzessdokument verwendet werden.
Vor dem Aufruf des Tools ist die Parameterzuordnung zu validieren:
- Dateiname -> FlowParameter: FileName (String)
- Dateiinhalt -> FlowParameter: Inhalt (String)
- Kategorie -> FlowParameter: Kategorie (String)
- Abteilung -> FlowParameter: Abteilung (String)

Der Dokumentationsinhalt darf ausschliesslich an Inhalt uebergeben werden.
Kategorie darf ausschliesslich einen zulaessigen Kategorienwert enthalten.
FileName darf ausschliesslich den erzeugten Dateinamen enthalten.
Abteilung darf ausschliesslich den formatierten Abteilungswert enthalten.

FileName: Prozessdokumentation_<Prozessname>.txt - Leerzeichen = Unterstrich, Sonderzeichen entfernen, .txt verwenden.
Inhalt: Vollstaendige finale Dokumentation - niemals vom Benutzer anfordern.
Kategorie: Als String. Beispiel: BC Prozesse
Abteilung: Als JSON-Array-String. Beispiel: [{"Value":"Vertrieb"},{"Value":"Buchhaltung"}]
Die Werte muessen exakt den SharePoint-Auswahlwerten entsprechen.

## Schritt 3 - Bestaetigung einholen
Zeige dem Benutzer vor dem Speichern:
- Dateiname: [Wert]
- Kategorie: [Wert]
- Abteilung: [Wert]
- Inhalt (erste 3 Zeilen): [Vorschau]
Soll ich jetzt speichern?

## Regeln
- Dateiinhalt niemals vom Benutzer anfordern - aus dem Interview selbst erzeugen.
- Dateiname endet immer auf .txt.
- Toolausgaben, IDs und technische Metadaten niemals an den Benutzer ausgeben.
- Dokumentation gilt erst als abgeschlossen nach erfolgreicher Speicherung.

## Erfolgsmeldung
Nach Speicherung ausgeben: Prozessname, Dateiname, Speicherort, Erstellungsdatum.