# Vagyonado fejlesztői környezet

A feladat eleve elkülönített felhőkörnyezetben fut. Használd a meglévő /workspace/Vagyonado checkoutot; Git worktree-t csak kifejezett felhasználói kérésre hozz létre. Node.js 24.x szükséges (a tesztelt verzió a .node-version fájlban van).

A függőségek, a public/forrasok dokumentumok és a dist build megtarthatók; élő folyamat fennmaradását új feladatban ne feltételezd. Ha hiányoznak a függőségek, a checkoutban futtasd: npm ci --cache /workspace/.cache/npm --no-audit --no-fund. A lockfile-t ne módosítsd a környezet indításához.

Normál fejlesztéshez /workspace/Vagyonado könyvtárból indítsd az npm run dev parancsot hosszú életű terminálfolyamatként. Ez együtt indítja a Vite felületet az 5173-as és a Node API-t a 3001-es porton. A Vite /api proxyn keresztül ugyanazon eredettel kapcsolódik az API-hoz. A puszta vite indítás nem indítja a kapcsolatfelvételi API-t.

Kész build ellenőrzéséhez npm run build, majd npm start használható: ekkor a felület és az API együtt a 3000-es porton fut. A PORT és LEADS_DB_PATH változó felülírhatja a produkciós kiszolgáló portját és privát adatbázishelyét. A .env.example csak példa, nem automatikusan betöltött konfiguráció. Ha port foglalt, azonosítsd a meglévő folyamatot, és ellenőrizd a működését; ne állíts le ismeretlen vagy felhasználó által indított szolgáltatást.

Készenlét: az aktív felület portján a GET /api/health adjon 200 választ és {status:'ok',formMode:'demo'} adatot, a főoldal tartalmazza a magyar Vagyonadó címet, és a /forrasok/vagyonado-tervezet.pdf, illetve /cikkek/vagyonado-2026 útvonalak is válaszoljanak. Egy 1 500 M Ft-os saját ingatlan, 100% tulajdon és nulla levonás a kalkulátorban 500 M Ft alapot és 5 000 000 Ft éves becsült adót adjon. A kapcsolatfelvételi űrlap mintadatokkal történő beküldése valóban rögzüljön és bemutató visszajelzést adjon; ez nem értesíti az ICT Európát.

Ellenőrzések: npm test futtatja a számítási és API-teszteket; npm run build a típusellenőrzést és buildet. Futó fejlesztői szerver mellett npm run test:browser ellenőrzi a kalkulációt, cégértékelést, levonást, letöltést, cikket, űrlapot és mobilmenüt. A felhőben /usr/bin/chromium használatos. Produkciós szerverhez TEST_URL=http://127.0.0.1:3000 npm run test:browser alkalmazható. Böngészőteszt csak mintadatot küldjön. Belső ellenőrzéshez helyi kéréseket használj; onboardingban ne adj felhasználói localhost-előnézeti linket.

A vagyoni adatok kizárólag a böngésző memóriájában vannak, nem kerülnek az API-ba. A bemutató űrlap tesztadatai a .local/leads.sqlite privát adatbázisba kerülnek, legfeljebb 30 napig; indításkor és óránként takarítás fut. Az adatbázist, exportot és személyes adatokat ne publikáld vagy commitold. Üzemeltetői tesztexport: npm run leads:export, a .local/teszt-megkeresesek.json privát fájlba.

A kapcsolatfelvétel jelenleg bemutató módú. Éles e-mail/CRM-fogadás és a tényleges adatkezelőre vonatkozó jóváhagyott tájékoztató még nincs bekötve; ne állítsd, hogy az ICT megkapja az űrlapot. A kalkulátor a feltöltött 2026-os tervezet alapján becsül: hivatalos jogszabályi státusz, illetőség, egyezmény és számított vagyonérték előzetesen ellenőrizendő. A modellezett szabályok és korlátok a docs/szamitasi-szabalyok.md fájlban vannak. A kész vfinal cikk a docs/vagyonado-cikk-vfinal.md és public/forrasok/vagyonado-cikk-vfinal.docx fájlban van.

A publikálás külön felhasználói lépés, a futó szolgáltatás és a konfigurációs tervezet mentése önmagában nem publikálja a weboldalt vagy a környezetet.
