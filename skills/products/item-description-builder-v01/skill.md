# Item Description Builder V0.1

## Zweck
Artika konstruiert die Artikelbeschreibung fuer die Neuanlage selbst. Der Nutzer wird niemals woertlich nach
"der Artikelbeschreibung" gefragt, da er die Hanfwolf-/BC-Beschreibungskonventionen nicht kennt. Artika kennt
Kategorien, Attribute und Textbausteine besser als der Nutzer und leitet die Beschreibung daraus ab.

## Eingang (aus dem Interview, nicht als fertige Beschreibung)
- Produktart/Warengruppe (z. B. "Helm", "Stretchfolie")
- Hersteller
- Modell-/Typbezeichnung
- Kernattribute aus der Kategorie (z. B. Farbe, Groesse, Norm, Material)
- Optionale Zusatzinfos, die der Nutzer von sich aus nennt

## Verbotene Fragen
- "Wie soll die Artikelbeschreibung lauten?"
- "Gib mir bitte die Artikelbeschreibung."
- Jede Frage, die den Nutzer zwingt, ein BC-Beschreibungsformat selbst zu kennen.

## Erlaubte Fragen (Bausteine statt Endtext)
- "Um welche Art von Produkt handelt es sich?"
- "Von welchem Hersteller ist der Artikel?"
- "Welche Modell-/Typbezeichnung hat der Artikel?"
- Kategoriespezifische Attributfragen (z. B. Farbe, Groesse, Norm), abgeleitet aus getCategoryAttributes.

## Konstruktionsregeln
- `description` (Pflichtfeld, max. 100 Zeichen) nach dem Muster:
  `<Hersteller> <Modell> <Produktart> <wichtigstes unterscheidendes Merkmal>`
  Beispiel: `KASK Zenith X Helm Weiss`.
- `description2`/`description3` optional fuer weitere Merkmale, technische Zusatzinfos oder Verwendungszweck,
  wenn `description` sonst zu lang wuerde oder weitere Angaben sinnvoll ergaenzen.
- Bei drohender Ueberlaenge: Merkmale nach description2/description3 verschieben statt description unpraezise zu kuerzen.
- Kurzbeschreibungstext (`texts[]`, type "Kurzbeschreibung") darf ein vollstaendiger Satz sein,
  z. B. `KASK Zenith X Schutzhelm in weiss.`
- Nur Informationen verwenden, die der Nutzer genannt hat oder die aus Kategorie/Attributen bekannt sind.
  Keine erfundenen Merkmale, keine Marketingfloskeln.

## Bestaetigung vor Anlage
- Bevor `BC: Artikel anlegen (Create Item)` aufgerufen wird, dem Nutzer den Beschreibungsvorschlag knapp zeigen,
  z. B.: "Ich lege den Artikel an als: KASK Zenith X Helm Weiss. Passt das so?"
- Bei Korrekturwunsch anpassen und erneut kurz bestaetigen lassen.

## Wenn Informationen fehlen
- Wenn weder Produktart noch Hersteller/Modell bekannt sind, nicht einfach anlegen oder raten.
- Gezielt nach der fehlenden Kernangabe fragen (Produktart, Hersteller oder Modell), nicht nach "der Beschreibung".

## Beispiel
Interview ergibt: Hersteller "KASK", Modell "Zenith X", Produktart "Helm", Farbe "Weiss".
- `description`: "KASK Zenith X Helm Weiss"
- Kurzbeschreibung-Text: "KASK Zenith X Schutzhelm in weiss."
