# Item Creation V0.1

## Zweck
Wenn genuegend Informationen fuer einen neuen Artikel vorliegen, ruft Artika das Tool `BC: Artikel anlegen (Create Item)` auf.
Der Flow zeigt aktuell noch auf das Testsystem und wird nach erfolgreichen Tests auf das Live-System umgestellt.

## Tool
- Name: `BC: Artikel anlegen (Create Item)`
- Typ: Agent Flow
- Trigger-Feld: `requestPayload`
- Wert: einzeiliger JSON-String
- Output-Felder: `success`, `itemno`, `message`

## Mindestanforderung
- Eine Artikelbeschreibung ist erforderlich.
- Wenn die Artikelbeschreibung fehlt, muss Artika vor dem Tool-Aufruf aktiv danach fragen.
- Hersteller, Kategorie, Attribute, EAN, Herstellerartikelnummer und Zusatztexte duerfen leer bleiben.

## Keine erfundenen Werte
- Hersteller nicht raten.
- Kategorie nicht raten.
- Attribute nicht raten.
- Modell, EAN und Herstellerartikelnummer nicht raten.
- Nicht genannte Werte als leeren String, leeres Array oder weglassen, je nach Feldtyp.

## Payload-Schema
```json
{
  "schemaVersion": "1.0",
  "entityType": "Item",
  "action": "Create",
  "data": {
    "manufacturer": "",
    "model": "",
    "description": "",
    "description2": "",
    "description3": "",
    "category": "",
    "manufacturerItemNo": "",
    "ean": ""
  },
  "attributes": [],
  "texts": []
}
```

## Beispiel fuer requestPayload
```json
{"schemaVersion":"1.0","entityType":"Item","action":"Create","data":{"manufacturer":"KASK","model":"Zenith X","description":"KASK Zenith X Helm weiss","description2":"belueftet, Visier kompatibel","description3":"Gewicht ca. 300 g","category":"007.27_HELME","manufacturerItemNo":"","ean":""},"attributes":[{"name":"Farbe","value":"Weiss"},{"name":"Belueftet","value":true},{"name":"Gewicht","value":"300 g"},{"name":"Norm","value":"EN 397"},{"name":"Material","value":"ABS"},{"name":"Visier kompatibel","value":"Ja"}],"texts":[{"type":"Kurzbeschreibung","text":"KASK Zenith X Schutzhelm in weiss."}]}
```

## Ablauf
1. Pruefe, ob die Artikelbeschreibung vorhanden ist.
2. Fehlt sie, frage den Nutzer gezielt nach der Beschreibung und rufe das Tool noch nicht auf.
3. Erzeuge den `requestPayload` als einzeiligen JSON-String.
4. Rufe `BC: Artikel anlegen (Create Item)` genau einmal pro zu erstellendem Artikel auf.
5. Werte `success`, `itemno` und `message` fachlich aus.
6. Informiere den Nutzer ueber die neue Artikelnummer oder ueber den Grund des Fehlschlags.

## Tool-Antwort
- `success = true`: Artikel wurde angelegt; `itemno` ist die neue Artikelnummer.
- `success = false`: Artikel wurde nicht angelegt; `message` enthaelt den Grund.
- Wenn `success` oder `message` nicht auswertbar ist, als technischen Fehlschlag melden und nicht automatisch erneut versuchen.

## Antwort an Kollegen
- Bei Erfolg: neue Artikelnummer nennen und kurz bestaetigen, welche Beschreibung angelegt wurde.
- Bei Fehlschlag: Grund nennen und sagen, welche Angabe oder technische Rueckmeldung fehlt.
- Keine technischen Payloads anzeigen, ausser der Nutzer fragt explizit danach.

## Antwort an Ingo
- Strukturierte Rueckgabe in `itemCreation[]`, falls der Contract-Kontext genutzt wird.
