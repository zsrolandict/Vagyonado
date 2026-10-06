export const expertTopics=[
  {
    id:'company',title:'Cégértékelés és üzletrészek',short:'Céges korrekciók',
    description:'Az alapcégbecslés jó kezdet. A rejtett tartalékok, az osztalék és az értékelési kivételek egyedi vizsgálatot igényelnek.',
    fields:['Rejtett tartalék, halasztott adó után','Tőkében még szereplő osztalék','Holding- és kisebbségi korrekciók'],
    detail:'A beszámolók, a tulajdonosi hányadok és az értékelési kivételek áttekintésével meghatározzuk, hogyan érintheti a tervezet a vállalkozói vagyonát.',
  },
  {
    id:'foreign',title:'Külföldi vagyon és illetőség',short:'Külföldi vagyon',
    description:'Határokon átnyúló vagyon, egyedi adózási helyzet. A teljes képhez az egyezmények is számítanak.',
    fields:['Külföldi ingatlanok és cégek','Adóügyi illetőség','Egyezmények és devizaértékelés'],
    detail:'Áttekintjük az illetőségét, a külföldi vagyonelemek értékelését és az alkalmazandó egyezmények rendelkezéseit, beleértve a kettős adóztatás kérdéseit.',
  },
  {
    id:'family',title:'Családi és vagyonkezelési struktúrák',short:'Családi vagyonkezelés',
    description:'Családi vagyon, bizalmi vagyonkezelés és alapítványok: összehangolt, egyedi vizsgálat.',
    fields:['Családi vagyonmegosztás','Bizalmi vagyonkezelés (BVK)','Magánalapítványok és kapcsolt konstrukciók'],
    detail:'Együtt vizsgáljuk a családi tulajdonviszonyokat, a vagyonkezelési struktúrák adóalanyiságát és a kapcsolt konstrukciók küszöbszabályait.',
  },
] as const;
export type ExpertTopicId=typeof expertTopics[number]['id'];
export type ConsultationRequest={topic:ExpertTopicId};
export const basicScopeText='A becslés a megadott belföldi ingatlanra, forint pénzeszközre, személyes használatú járműre és a korrekciók nélküli alapcégértékre vonatkozik. A rejtett tartalékok, osztalék- és egyéb cégérték-korrekciók, külföldi eszközök, vagyonkezelési struktúrák és más vagyonelemek hatásához egyedi vizsgálat szükséges.';
