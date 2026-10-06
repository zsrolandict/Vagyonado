# Ingyenes kalkulátor és szakértői konzultáció — megvalósítási terv

Dátum: 2026. október 7. Állapot: megvalósítva, a céges alapadatoknál kért kiegészítéssel.

Új ág: `ingyenes-kalkulator-szakertoi-kapu`.
Megőrzött változat: `archiv-kalkulator-2026-10-07` címke,
`f1557025ecc22d773ca6e9b366068b43b55c6f7d` commit.
Az `ict-logo-es-kalkulator-javitasok` ág is megőrzi ezt a verziót.

A felhasználó választása: a teljes elemzést a szakértő végzi el a konzultáció
keretében. Az első változat kapcsolatfelvételt kezdeményez; nincs online
belépés, automatikus mezőfeloldás vagy fizetési folyamat.

## Látogatói út

1. A látogató azonnal használhatja az ingyenes alapbecslést.
2. Megadhatja az egyszerű belföldi vagyonelemek értékét és tulajdoni hányadát.
3. Megkapja az alapadatokból számított becslést és annak pontos terjedelmét.
4. A három látható szakértői kártya bemutatja a további vizsgálati területeket.
5. Kártyára kattintva konzultációs ablak nyílik a választott terület leírásával.
6. A „Szakértői konzultációt kérek” gomb az előkészített űrlaphoz vezeti.
7. A kapcsolatfelvételt követő teljes elemzést az ICT szakértője végzi el.

## Ingyenes alapbecslés

Belföldi illetőségű magánszemély megadott belföldi alapvagyonára:

- Ingatlan: lakóingatlan és nyaraló, előzetesen meghatározott számított értékkel.
- Társasági részesedés: saját tőke, 1–3 lezárt év adózott eredménye, évhossz és tulajdoni hányad. Az alapképlet korrekciók nélkül működik.
- Pénzeszköz: forint bankszámla és készpénz.
- Személyes használatú jármű, a modellben szereplő egyedi értékhatárral.
- Tulajdoni hányad, igazolt és levonható tartozás, a bevont alapvagyonhoz
  kapcsolódó jogosult helyi- és gépjárműadó-jóváírás.

A jelenlegi számítási modul szabályait használjuk. Az 1 milliárd Ft-os
nettóvagyon-küszöböt egyszer, az összes bevont alapvagyonra alkalmazzuk.
Az ingatlanérték megállapításának speciális kérdéseit szakértői vizsgálatként
jelezzük; az egyszerű beviteli mező nem végez automatikus értékbecslést.
Az illetőség, a családi vagyonmegosztás, az üzleti használat, a deviza és az
egyéb vagyontípusok vizsgálata a szakértői kör része.

Az eredmény fejlécének javasolt szövege:
**„BECSÜLT VAGYONADÓ AZ ALAPADATOK ALAPJÁN”**.

Mellette mindig olvasható:
„A becslés a megadott alapvagyonra vonatkozik. A céges korrekciók, külföldi
vagyonelemek és vagyonkezelési struktúrák hatását egyedi vizsgálat tárja fel.”

A részletes eredmény és a letöltött jelentés ugyanezt a terjedelmet jelzi.
Ha a látogató összetett vagyont is jelez, ezt kiemeljük a nulla forintos
eredménynél is. Az összetett tételt nem tüntetjük fel kiszámított nulla értékként.
Az alapbecslés nem a teljes vagyonra vonatkozó végleges adókötelezettség,
és a későbbi vizsgálat nem szükségszerűen csökkenti a becsült összeget.

## Három szakértői kártya

| Kártya | Olvasható témák |
| --- | --- |
| Cégértékelés és üzletrészek | Rejtett tartalék és tőkében szereplő osztalék; holdingértékelés; kisebbségi korrekció; induló cégek; értékelési kivételek |
| Külföldi vagyon és illetőség | Külföldi ingatlanok és cégek; illetőség; devizaértékelés; egyezmények és kettős adóztatás |
| Családi és vagyonkezelési struktúrák | Családi vagyonmegosztás; bizalmi vagyonkezelés; magánalapítványok; kapcsolt konstrukciók |

A cím, a témák, a lakat és a „Szakértői konzultáció része” jelölés olvasható.
A mezőket idéző háttér halvány, enyhén elmosott bemutató, valódi összegek nélkül.
A bemutatóelemek nem kitölthető mezők, és nem vesznek részt a kalkulációban.
A céges szerkesztőben a rejtett tartalék és a tőkében szereplő osztalék
mezője ugyanazt a céges konzultációs ablakot nyitja. A képlet ezen mezők,
a holding- és kisebbségi korrekciók nélkül ad alapbecslést; ezt a cégértéknél,
a részletes eredményben és az exportban is feltüntetjük. A céges összeg és az
éves adó mellett jól látható „KORLÁTOZOTT BECSLÉS” jelölés szerepel.
A kártya gombja egérrel, érintéssel és billentyűzettel is működik.
Mobilon a kártyák egymás alatt jelennek meg, az eredmény a konzultációs út során megmarad.

## Konzultációs ablak és kapcsolatfelvétel

Cím: **„Ez a szakmai szint egyedi vizsgálatot igényel.”**

Javasolt szöveg:
„Az ingyenes becslés jó kiindulópont. A cégvagyon, a külföldi eszközök és
a vagyonkezelési struktúrák értékeléséhez az egyedi jogi és számviteli
körülmények áttekintése szükséges.”

A látogató a kiválasztott területhez illő előnyöket látja:

- A teljes vagyoni struktúra és az alkalmazandó szabályok áttekintése.
- A releváns korrekciók és jogszerű tervezési lehetőségek egyedi vizsgálata.
- A következő lépések szakértői meghatározása.

Fő gomb: **„Szakértői konzultációt kérek →”**.
Másodlagos gomb: **„Vissza az alapbecsléshez”**.

A bezárható ablak kezeli a fókuszt és az Escape billentyűt.
A fő gomb a meglévő kapcsolatfelvételi űrlaphoz vezet; a kiválasztott témát
előkészíti, a vagyoni összegek a böngészőben maradnak.
Egy sikeres kapcsolatfelvétel nem aktivál automatikusan online funkciókat.

A jelenlegi konzultációs űrlap bemutató: tesztadatot ment, nem küld
megkeresést az ICT Európának. Valódi érdeklődők fogadásához az ICT megadott
e-mailes vagy CRM-fogadását kell bekötni, és ahhoz igazítani az adatkezelést.
Az önálló HTML-csomagban a konzultáció elérhetőségét az igazolt fogadási módhoz
kell igazítani; az offline bemutató nem jelezhet kézbesítést.

## A marketingállítások pontosítása

A következők a repóban dokumentált, feltöltött tervezetre épülő modellből
következnek; nem jelentenek új, hatályos jogszabály-ellenőrzést.

- Saját lakásra nincs általános mentesség. Az általános nettóvagyon-küszöb
  és a vagyonelemekre vonatkozó szabályok alkalmazandók.
- A holding 90%-os feltétele eszközösszetételi besorolás, nem 90%-os
  adómentesség. A modell korrigált saját tőke szerinti értékelést alkalmaz.
- A BVK és a magánalapítvány önálló adóalanyként szerepel. Az ide helyezett
  vagyon általános levonhatóságát vagy az alapítvány általános mentességét
  nem ígérjük; a kapcsolt konstrukciók küszöbszabálya is vizsgálandó.
- Garantált megtakarítást vagy több tízmilliós eltérést nem állítunk az
  egyedi körülmények megismerése előtt.

Források: [számítási szabályok](szamitasi-szabalyok.md),
[`src/tax.ts`](../src/tax.ts), [`src/articles.ts`](../src/articles.ts).

## Megvalósítás sorrendje és ellenőrzése

1. Az alapbecslés felületének és eredményjelöléseinek kialakítása.
2. A szakértői témák külön bemutató kártyáinak elkészítése.
3. A konzultációs ablak és a témával előkészített űrlap összekötése.
4. Az érintett főoldali, GYIK- és szolgáltatási szövegek összehangolása.
5. A határértékek, a korlátozott számítási kör és a konzultációs út tesztelése.
6. Mobil, billentyűzetes használat, adatok megmaradása és önálló HTML ellenőrzése.
7. A bemutató HTML és ZIP frissítése, commit és push ezen az új ágon.

A maszk szolgáltatási határt jelöl, nem hozzáférés-védelem. A választott
konzultációs modellhez nincs szükség a teljes kalkulátor online feloldására.
Ha később külön ügyfélfelület készül, annak hozzáférését tényleges jogosultság-
ellenőrzésre kell építeni, nem CSS-elmosásra.
