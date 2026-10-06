# ICT Európa — Vagyonadó

Ezen az ágon az **ingyenes alapbecslés és szakértői konzultáció** változata található.
Az ingatlan, forint pénzeszköz és személyes jármű mellett a céges saját tőke,
lezárt üzleti évek eredménye és tulajdoni hányad is kitölthető. A rejtett
­tartalék és a tőkében szereplő osztalék mezői konzultációs ablakot nyitnak.
A céges összeg a felületen és az exportban is **KORLÁTOZOTT BECSLÉS** jelölést kap.
A holding-, kisebbségi, külföldi és vagyonkezelési vizsgálatok a szakértői kör részei.
A [megvalósítás leírása](docs/ingyenes-kalkulator-szakertoi-kapu-terv.md) itt olvasható.
A korábbi kalkulátor a `archiv-kalkulator-2026-10-07` címkén visszahívható.

Magyar nyelvű, reszponzív weboldal a feltöltött **2026-os vagyonadó-törvénytervezet** elemzéséhez. React + TypeScript + Vite; külön számítási modul; Node.js + SQLite bemutató kapcsolatfelvétel. A jogszabály hatályosságát és hivatalos közzétételét nem ellenőriztük. Az ICT megadott képernyőképei alapján készült sötétkék–türkiz arculat, helyi betűkészletekkel.

## Bemutató megnyitása telepítés nélkül

Töltse le a [Vagyonado-html-csomag.zip](./Vagyonado-html-csomag.zip?raw=true) fájlt, csomagolja ki, és nyissa meg a benne lévő **index.html** fájlt böngészőben. Node.js és külön kiszolgáló nem szükséges.

Ha a GitHub **Code → Download ZIP** menüpontjával a teljes repozitóriumot tölti le, kicsomagolás után a legfelső szinten található **Vagyonado-bemutato.html** fájlt nyissa meg. A projekt fejlesztői belépője, az `index.html`, az alábbi fejlesztői indítással használható.

A bemutatóban a kalkulátor, a részletes eredmény és a cikkek működnek, a kapcsolatfelvételi űrlap nem küld megkeresést. A HTML és a bemutató ZIP továbbküldhető.

## Futtatás

Node **24.x** szükséges; a tesztelt verzió a `.node-version` fájlban található.

```sh
git clone https://github.com/zsrolandict/Vagyonado.git
cd Vagyonado
npm ci
npm run dev
```

A böngészőben nyissa meg a **http://localhost:5173** címet. A terminál maradjon nyitva; leállítás: `Ctrl+C`. ZIP-ből történő indításkor a kicsomagolt `Vagyonado` mappában kezdje az `npm ci` paranccsal.

A fejlesztői indító a Vite felületet az 5173-as, a kizárólag API-ként működő kiszolgálót a 3001-es porton indítja. A Vite ugyanazon eredetű `/api` proxyt használ. A vagyoni kalkuláció csak a böngésző memóriájában fut, és újratöltéskor törlődik.

```sh
npm test
npm run build
npm run test:browser
```

A böngészőteszthez a fejlesztői szerver fusson; a teszt a felhőkörnyezet `/usr/bin/chromium` böngészőjét használja. Más rendszeren a böngésző elérési útját a tesztben kell a telepített Chromiumra állítani. A `TEST_URL` változóval a produkciós build is tesztelhető.

## A build kiszolgálása

```sh
npm run build
npm start
```

A teljes build és API ugyanazon a 3000-es porton érhető el. A cikkek közvetlen útvonalai is működnek. A `PORT` és `LEADS_DB_PATH` környezeti változó felülírhatja a portot, illetve a privát adatbázis helyét. Éles telepítésnél HTTPS és tartós, privát adatbáziskötet kell.

## Elkészült tartalom

- Főoldal a feltöltött vagyonmegoszlás-képpel és ICT EUROPA logóval, háromlépéses kalkulátor, külön ablakban is megnyitható részletes eredmény és szöveges export.
- Animált, öt tejüveg körből álló vagyonmegoszlás-blokk a kalkulátor után. A 2027–2050 közötti mintaforgatókönyv automatikusan léptet, szüneteltethető és kézzel is beállítható; a körök területe arányos az értékekkel. A kalkulátor saját vagyoni adataitól független szemléltetés. Csökkentett mozgást kérő böngészőbeállításnál kézi indítással használható.
- Belföldi magánszemély alapvagyona: ingatlan, forint pénzeszköz, személyes jármű és korrekciók nélküli cégrészesedés. Tulajdoni hányad, jármű-értékhatár, igazolt tartozás és jogosult helyi/járműadó-jóváírás.
- Céges alapadatok: saját tőke, 1–3 lezárt év eredménye és évesítése. A rejtett tartalék és osztalék mezői konzultációs kapuk; holding- és kisebbségi korrekció nem szerepel az ingyenes összegben.
- Három szakértői kártya a cégérték-korrekciókról, a külföldi vagyonról és a családi/vagyonkezelési struktúrákról. A bezárható ablak az érdeklődési témával előkészített űrlaphoz vezet, a vagyoni adatok továbbítása nélkül.
- Az eredményben és az exportban az alapbecslés terjedelme is megjelenik, céges tételnél és külön megjelölt szakértői témánál kiemelt figyelmeztetéssel.
- Három olvasható cikk, gyakori kérdések és letölthető PDF-források.
- A megküldött v1 cikk szerkesztett **vfinal** változata: `docs/vagyonado-cikk-vfinal.md`, illetve `public/forrasok/vagyonado-cikk-vfinal.docx`.

A cikkeket a `src/articles.ts`, a szabályokat a `src/tax.ts` tartalmazza. A források és a számítási határok részletes megfeleltetése: `docs/szamitasi-szabalyok.md`.

## Kapcsolatfelvételi űrlap

Az űrlap **bemutató módban** működik, ezt a felület és a sikeres beküldés visszajelzése is jelzi. A kiszolgáló ténylegesen ellenőrzi és privát SQLite-adatbázisba menti a tesztbeküldést. Nem küld e-mailt, CRM-bejegyzést vagy értesítést az ICT Európának. Nem gyűjti a kalkulátor vagyoni adatait. A választott konzultációs témát az űrlap üzenetéhez hozzáfűzi. Az API eredetellenőrzést, méretkorlátot, rejtett robotmezőt és beküldési korlátot alkalmaz; reCAPTCHA nincs bekötve és nem állítjuk ennek ellenkezőjét.

A tesztadatok 30 nap után az induláskor vagy óránként futó takarításkor törlődnek. Az adatbázis és az export nem kerül verziókezelésbe vagy a nyilvános buildbe. Az üzemeltető exportálhatja az adatokat:

```sh
npm run leads:export
# Alapértelmezett privát export: .local/teszt-megkeresesek.json
```

A nyilvános élesítéshez még szükséges az ICT által jóváhagyott fogadási mód (e-mail/CRM), a tényleges adatkezelő és adatkezelési tájékoztató, valamint szakmai tartalomellenőrzés. A bemutató tájékoztató nem éles adatkezelési dokumentum. A beküldési fogadást az új célhoz igazítva kell megvalósítani; addig valós megkeresésre az ICT honlapja használható.

## Felhőkörnyezet

A finomhangolás előtti állapot a `finomhangolas-elott-2026-10-06` Git-címkével
megőrzött. A külön forrás- és Git-mentés használata: [visszaállítás](docs/visszaallitas.md).

A lap alján szereplő hírlevélblokk az ICT Európa megadott adatkezelési
tájékoztatóját nyitja meg. A valódi hírlevélküldő rendszer bekötése későbbi lépés:
addig a feliratkozási gomb inaktív, a blokk nem küld vagy ment adatot.

A feladat már elkülönített környezetben fut. Használja ezt a checkoutot, új Git worktree-t csak kifejezett kérésre hozzon létre. A függőségek és fájlok megtarthatók; a folyamatokat új feladatban újra kell indítani. Az install és start utasítások a környezet konfigurációs tervezetébe is menthetők. A GitHubra feltöltött forráskód önmagában nem publikál élő weboldalt.

## Továbbküldhető, önálló bemutató

A buildből egyetlen HTML-fájl készíthető:

```sh
node scripts/export-demo.mjs ./Vagyonado-bemutato.html
```

A fájl helyben megnyitható és továbbküldhető. A felület, az irodaház képe, a betűkészlet, a kalkulátor, a cikkek és a letölthető források be vannak ágyazva, így nem igényel telepítést. A kapcsolatfelvételi űrlap ebben a változatban nem küld és nem ment adatot; ezt külön jelzi. A HTML-fájl önmagában nem jelent nyilvános internetes webcímet.

```sh
node tests/standalone.mjs ./Vagyonado-bemutato.html
node tests/wealth-timeline.mjs ./Vagyonado-bemutato.html
```

Ez az ellenőrzés asztali és mobil nézetben is megnyitja a részletes eredményt, ellenőrzi az adóalapot, az éves adót, a letöltött kalkulációt, a hibás vagy hiányzó adatok visszajelzését, a beágyazott képet és a cikknavigációt. A felhőkörnyezet böngészője tiltja a helyi fájl-URL-eket, ezért ugyanazt a HTML-t ideiglenes helyi HTTP-kiszolgálón vizsgálja, a fájlmegnyitási navigációs ágat aktiválva.
