# Visszaállítás a finomhangolás előtti állapotra

Megőrzött verzió: `finomhangolas-elott-2026-10-06`.
Commit: `12280d034501ad1b819d7689477473a7ad756680`.

A Git-címke a módosítások előtti teljes, tiszta forrásállapotot jelöli.
A GitHubon elérhető mentések:

- [Korábbi HTML-bemutató ZIP-je](https://github.com/zsrolandict/Vagyonado/raw/refs/tags/finomhangolas-elott-2026-10-06/Vagyonado-html-csomag.zip)
- [A korábbi változat teljes forráskódja](https://github.com/zsrolandict/Vagyonado/archive/refs/tags/finomhangolas-elott-2026-10-06.zip)
- [A frissített bemutató ZIP-je](https://github.com/zsrolandict/Vagyonado/raw/refs/heads/finomhangolas-2026-10-06/Vagyonado-html-csomag.zip)

Az új változat a `finomhangolas-2026-10-06` ágban található; a korábbi `main`
verziót ez a feltöltés nem írja felül. A korábbi bemutató megnyitásához a ZIP
kicsomagolása után az `index.html` fájlt kell böngészőben megnyitni.

A Git története és a források külön is megvannak:

- `/workspace/backups/Vagyonado/finomhangolas-elott-2026-10-06.bundle`
- `/workspace/backups/Vagyonado/finomhangolas-elott-2026-10-06.tar.gz`

A forrásarchívum az eredeti `Vagyonado-bemutato.html` és
`Vagyonado-html-csomag.zip` bemutatókat is tartalmazza.
Függőségeket, élő folyamatokat és a privát helyi adatbázist nem tartalmazza.
A két mentés a felhőkörnyezetben van; letöltve a környezeten kívül is megőrizhető.

Ha szeretné visszahívni ezt az állapotot, hivatkozzon a fenti címkére.
Az aktuális munka felülírása előtt az újabb változatot is menteni kell.

Az eredeti források az aktuális projekt felülírása nélkül is megnyithatók:

```sh
set -eu
test ! -e /workspace/Vagyonado-korabbi
mkdir /workspace/Vagyonado-korabbi
tar -xzf /workspace/backups/Vagyonado/finomhangolas-elott-2026-10-06.tar.gz \
  -C /workspace/Vagyonado-korabbi
```

A bemutató HTML-t ebből a mappából is meg lehet nyitni. A források futtatásához
Node.js 24.x mellett `npm ci`, majd `npm run dev` szükséges; a portokat a már
futó verzió is használhatja. A megszokott fejlesztéshez továbbra is a meglévő
checkoutot használjuk, új Git worktree-t csak kifejezett kérésre hozzunk létre.

A mentés sértetlensége így ellenőrizhető:

```sh
cd /workspace/Vagyonado
git bundle verify /workspace/backups/Vagyonado/finomhangolas-elott-2026-10-06.bundle
```
