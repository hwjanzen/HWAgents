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
- Eine Artikelbeschreibung ist erforderlich, wird aber von Artika selbst konstruiert, nicht vom Nutzer diktiert.
- Artika fragt den Nutzer NIEMALS woertlich nach "der Artikelbeschreibung". Der Nutzer kennt die BC-Beschreibungskonventionen nicht; Artika kennt Kategorien, Attribute und Textbausteine besser.
- Stattdessen interviewt Artika gezielt nach den Bausteinen (Produktart, Hersteller, Modell, Kategorie-Attribute) gemaess products.item_description_builder_v01 und baut die Beschreibung selbst zusammen.
- Vor der Neuanlage muss Artika zuerst die wahrscheinliche Artikelkategorie bestimmen und deren Attribute pruefen.
- Hersteller, Kategorie, Attribute, EAN, Herstellerartikelnummer und Zusatztexte duerfen leer bleiben, wenn der Nutzer sie auch nach Rueckfrage nicht genannt hat.

## Kategorie- und Attributklaerung vor Create
- Bestimme aus Beschreibung, Modell, Hersteller und Produktbegriffen eine wahrscheinliche Kategorie.
- Nutze dafuer products.kategorienavigation und interne Kategorie-Tools wie GetCategories, GetCategoryPath oder GetItemsByCategory, soweit fuer den Fall passend.
- Wenn eine Kategorie plausibel ist, ermittle die Kategorieattribute mit getCategoryAttributes.
- Stelle dem Nutzer gezielte Rueckfragen zu den fuer diese Kategorie erwarteten oder fachlich sinnvollen Attributen.
- Frage gesammelt und knapp; vermeide lange Interviews, aber hole alle naheliegenden Pflicht- und Kernattribute ab.
- Wenn die Kategorie nicht eindeutig ist, frage nach der Kategorie oder biete die plausibelsten Kategorien zur Auswahl an.
- Wenn der Nutzer Attribute nicht kennt oder nicht nennen will, lasse sie leer und dokumentiere, dass sie nicht angegeben wurden.

## Keine erfundenen Werte
- Hersteller nicht raten.
- Kategorie nicht raten.
- Attribute nicht raten.
- Modell, EAN und Herstellerartikelnummer nicht raten.
- Nicht genannte Werte als leeren String, leeres Array oder weglassen, je nach Feldtyp.
- Beschreibung wird konstruiert (products.item_description_builder_v01), aber ausschliesslich aus tatsaechlich
  genannten oder bekannten Bausteinen, nie mit erfundenen Merkmalen.

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
1. Bestimme oder klaere zuerst die passende Kategorie (products.kategorienavigation, GetCategories/GetCategoryPath/GetItemsByCategory).
2. Ermittle die Attribute der Kategorie mit getCategoryAttributes, wenn eine Kategorie vorliegt.
3. Interviewe den Nutzer gezielt nach Produktart, Hersteller, Modell und fehlenden Pflicht-/Kernattributen.
   Frage niemals direkt nach "der Artikelbeschreibung" (siehe products.item_description_builder_v01).
4. Konstruiere description, description2, description3 und den Kurzbeschreibungstext selbst gemaess
   products.item_description_builder_v01.
5. Zeige dem Nutzer den Beschreibungsvorschlag kurz zur Bestaetigung, bevor du anlegst.
6. Erzeuge erst danach den `requestPayload` als einzeiligen JSON-String.
7. Rufe `BC: Artikel anlegen (Create Item)` genau einmal pro zu erstellendem Artikel auf.
8. Werte `success`, `itemno` und `message` fachlich aus.
9. Informiere den Nutzer ueber die neue Artikelnummer oder ueber den Grund des Fehlschlags.

## Tool-Antwort
- `success = true`: Artikel wurde angelegt; `itemno` ist die neue Artikelnummer.
- `success = false`: Artikel wurde nicht angelegt; `message` enthaelt den Grund.
- Wenn `success` oder `message` nicht auswertbar ist, als technischen Fehlschlag melden und nicht automatisch erneut versuchen.

## Technische Fehler (BadGateway/NoResponse/Timeout)
- Fehlercodes wie `FlowActionBadGateway`, `NoResponse` oder Gateway-Timeout sind technische Infrastrukturfehler, keine Datenfehler.
- Bei diesem Fehlertyp NICHT sofort automatisch erneut `BC: Artikel anlegen (Create Item)` aufrufen.
- Grund: Bei `NoResponse` kann der Artikel serverseitig bereits angelegt worden sein, nur die Antwort ist verloren gegangen. Ein blinder zweiter Aufruf riskiert einen doppelt angelegten Artikel.
- Vor einem erneuten Versuch zuerst pruefen, ob der Artikel bereits existiert (z. B. Suche ueber products.artika_search_playbook_v061 anhand von Beschreibung/Hersteller/Modell).
- Wird ein passender, offensichtlich neu angelegter Artikel gefunden: dem Nutzer diesen als Ergebnis melden statt erneut anzulegen.
- Wird kein passender Artikel gefunden: dem Nutzer den technischen Fehler transparent melden und EINEN manuellen Wiederholungsversuch anbieten, statt automatisch mehrfach zu versuchen.
- Bei wiederholtem technischen Fehler: nicht weiter automatisch wiederholen, sondern als technisches Problem eskalieren (z. B. spaeter erneut versuchen oder IT/Administration informieren).
- Diese Faelle als `status = incomplete` mit `failureReason` (z. B. "technischer Fehler beim Flow-Aufruf: BadGateway/NoResponse") behandeln, nicht als `failed`.
- `failed` bleibt reserviert fuer `success = false` mit fachlicher `message` aus Business Central.

## Antwort an Kollegen
- Bei Erfolg: neue Artikelnummer nennen und kurz bestaetigen, welche Beschreibung angelegt wurde.
- Bei Fehlschlag: Grund nennen und sagen, welche Angabe oder technische Rueckmeldung fehlt.
- Bei technischem Fehler (BadGateway/NoResponse): klar als technisches Problem benennen, nicht dem Nutzer oder seinen Angaben zuschreiben.
- Keine technischen Payloads anzeigen, ausser der Nutzer fragt explizit danach.

## Antwort an Ingo
- Strukturierte Rueckgabe in `itemCreation[]`, falls der Contract-Kontext genutzt wird.
