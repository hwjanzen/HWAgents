# Dokumentation erstellen

## Zweck
Aus den Interview-Antworten eine vollstaendige Prozessdokumentation aufbauen
und ueber das Tool **SpeichereVerifiziertesProzessdokument** in SharePoint speichern.

## Schritt 1 - Dokumentationstext aufbauen
Erstelle aus den Interview-Antworten in der aktuellen Sitzung den vollstaendigen Dokumentationstext.
Verwende diese Struktur:
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
12. Fehlerfaelle
13. Ergebnis
14. Folgeprozess

## Schritt 2 - SharePoint-Speicherung

Nach Freigabe muss das Tool SpeichereVerifiziertesProzessdokument verwendet werden.
Vor dem Aufruf des Tools ist die Parameterzuordnung zu validieren:
- Dateiname -> FlowParameter: Dateiname (String)
- Dateiinhalt -> FlowParameter: Dateiinhalt (String)
- Kategorie -> FlowParameter: Kategorie (String)
- Abteilung -> FlowParameter: Abteilung (String)

Der Dokumentationsinhalt darf ausschliesslich an Dateiinhalt uebergeben werden.
Kategorie darf ausschliesslich einen zulaessigen Kategorienwert enthalten.
Dateiname darf ausschliesslich den erzeugten Dateinamen enthalten.
Abteilung darf ausschliesslich den formatierten Abteilungswert enthalten.

Dateiname: Prozessdokumentation_<Prozessname>.txt - Leerzeichen = Unterstrich, Sonderzeichen entfernen, .txt verwenden.
Dateiinhalt: Vollstaendige finale Dokumentation - niemals vom Benutzer anfordern.
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