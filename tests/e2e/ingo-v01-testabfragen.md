# INGO V0.1 Testabfragen (Copy/Paste)

Diese Datei enthaelt wiederverwendbare Abfragen fuer deine vier Ziel-Cases.
Einfach den jeweiligen Block in den Ingo-Chat kopieren.

## Case A - Erkan positiv

### Abfrage
```text
V0.1 Test Case A:
Erkan hat positiv abgeschlossen.
Nutze folgende Fakten:
- status: completed
- documentType: sales_order
- documentNo: AU27-00001
- debitorName: Testdebitor

Aufgabe:
1) Weise Looka an, eine Mail an Tanja mit Betreff zu formulieren.
2) Im Mailtext muessen Auftragsnummer und Debitorenname vorkommen.
3) Uebernimm den von Looka formulierten Text fuer die Info an Tanja.
```

### Soll-Ergebnis
- Ingo laesst Looka subject + message entwerfen.
- tanjaOutput.outcome = success.
- tanjaOutput.subject ist gesetzt.
- tanjaOutput.message enthaelt AU27-00001 und Testdebitor.

## Case B1 - Erkan negativ

### Abfrage
```text
V0.1 Test Case B1:
Erkan hat negativ abgeschlossen.
Nutze folgende Fakten:
- status: failed_by_erkan
- failureReason: bc_creation_failed

Aufgabe:
1) Weise Looka an, eine Mail an Tanja mit Betreff zu formulieren.
2) Inhalt: Es konnte kein Auftrag erstellt werden, weil Erkan ein Problem hat.
3) Uebernimm den von Looka formulierten Text fuer die Info an Tanja.
```

### Soll-Ergebnis
- Ingo laesst Looka subject + message entwerfen.
- tanjaOutput.outcome = failed.
- tanjaOutput.subject ist gesetzt.
- tanjaOutput.message enthaelt klar den Erkan-Fehlerkontext.

## Case B2 - Ingo bricht selbst ab (Infos fehlen)

### Abfrage
```text
V0.1 Test Case B2:
Die an Ingo gelieferten Informationen reichen nicht aus,
um an Artika oder Erkan zu delegieren.

Aufgabe:
1) Weise Looka an, eine Mail an Tanja mit Betreff zu formulieren.
2) Inhalt: Es sind nicht ausreichend Informationen vorhanden.
3) Uebernimm den von Looka formulierten Text fuer die Info an Tanja.
4) Fuehre danach genau eine Folgeaktion aus:
   - weitere Infos sammeln ODER
   - Unterhaltung beenden
```

### Soll-Ergebnis
- status = rejected_by_ingo.
- tanjaOutput.outcome = failed.
- tanjaOutput.subject ist gesetzt.
- Genau eine Folgeaktion: Rueckfrage oder Beenden.

## Case B3 - Artika negativ (Artikel nicht eindeutig)

### Abfrage
```text
V0.1 Test Case B3:
Artika hat negativ abgeschlossen.
Die Artikelnummer konnte nicht eindeutig identifiziert werden,
es koennen mehrere Artikel passen.

Aufgabe:
1) Weise Looka an, eine Mail an Tanja mit Betreff zu formulieren.
2) Inhalt: Artikelnummer nicht eindeutig, mehrere Treffer moeglich.
3) Uebernimm den von Looka formulierten Text fuer die Info an Tanja.
4) Fuehre danach genau eine Folgeaktion aus:
   - weitere Infos sammeln und Artikel spezifizieren ODER
   - Unterhaltung beenden
```

### Soll-Ergebnis
- status = failed_by_artika.
- tanjaOutput.outcome = failed.
- tanjaOutput.subject ist gesetzt.
- Genau eine Folgeaktion: Spezifizierende Rueckfrage oder Beenden.

## Optional: Schnellcheck pro Lauf

```text
Pruefe am Ende immer:
- tanjaOutput.subject vorhanden?
- tanjaOutput.message vorhanden?
- outcome passend zum Case?
- Bei Erfolg: documentType + documentNo gesetzt?
- Bei Fehler: failureReason gesetzt?
```

## Komplexitaetsstufe 2 - Szenario fuer Ingo nicht bekannt

Diese Tests geben Ingo keinen direkten Case-Hinweis. Ingo muss selbst klassifizieren,
an Artika/Erkan delegieren und den richtigen Abschluss inkl. Tanja-Info liefern.

### Test 2.1

```text
hallo Ingo. Bestelle 7 x Artikel 7240001 fuer den Kunden Schueko.
```

### Test 2.2

```text
Hallo Ingo, bestellen Sie bitte 2x Artikel 1896-S für Debitor 10000.
```

### Soll-Ergebnis Komplexitaetsstufe 2

- Ingo erkennt selbst den passenden Ablauf (ohne vorgegebenes Case A/B1/B2/B3).
- Ingo nutzt den V0.1-Contract und setzt einen gueltigen Statusverlauf.
- Bei positivem Endergebnis: Ingo laesst Looka Betreff + Text fuer Tanja formulieren und uebernimmt beides in tanjaOutput.
- Bei negativem Endergebnis: Ingo laesst Looka Betreff + Text fuer Tanja formulieren und setzt passenden failureReason.
- Falls Informationen fehlen/unklar sind: Ingo sammelt weitere Infos oder beendet die Unterhaltung gemaess Prompt-Regeln.
- Keine Websuche fuer Artikelfindung: nur interne Treffer ueber Artika sind erlaubt.
- Keine Hersteller-Artikelnummer oder externer Webtreffer darf als interne Artikelnummer weiterverwendet werden.

## Entwicklungsstufe V0.2 - Artika Recherchefaehigkeiten

In V0.2 bleibt die Agentenkommunikation unveraendert.
Neu ist die fachliche Recherche durch Artika:
- Debitorensuche auf Basis eines Firmennamens
- Suche in Kundenartikelreferenzen / Artikelreferenzdaten

### V0.2 Test A - Debitor eindeutig, Artikel eindeutig

```text
Hallo Ingo, bitte bestelle 1x140022.00 für Schüco
```

Soll:
- Artika liefert debitorSearch.status = unique.
- Artika liefert articleReferenceSearch.status = unique.
- Ingo darf an Erkan weitergeben.

### V0.2 Test B - Debitor mehrdeutig

```text
Hallo Ingo, bitte bestelle 1x Kundenartikelreferenz KR-4711 fuer Firma Mueller.
```

Soll:
- Artika liefert debitorSearch.status = ambiguous und Kandidatenliste mit debitorNo + name.
- Keine automatische Auswahl durch Artika oder Ingo.
- Ingo uebergibt an Tanja (Human-in-the-Loop).

### V0.2 Test C - Artikelreferenz mehrdeutig

```text
Hallo Ingo, bitte bestelle 3x Referenz "Leiter 2,5m" fuer Firma Schueko.
```

Soll:
- Artika liefert articleReferenceSearch.status = ambiguous und Kandidatenliste mit itemNo + description.
- Keine automatische Auswahl.
- Ingo uebergibt an Tanja.

### V0.2 Test D - Kein Treffer

```text
Hallo Ingo, bitte bestelle 4x Referenz "XYZ-UNBEKANNT-999" fuer Firma Schueko.
```

Soll:
- debitorSearch oder articleReferenceSearch = not_found.
- Ingo uebergibt an Tanja.
- Kein Webtreffer und keine Herstellernummer als interne Artikelnummer.
