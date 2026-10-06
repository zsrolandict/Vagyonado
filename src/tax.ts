/** Amounts inside the model are in MILLION HUF. Source: supplied draft, not enacted law. */
export type AssetKind = 'property' | 'propertyRight' | 'company' | 'cash' | 'securities' | 'crypto' | 'vehicle' | 'art' | 'personal' | 'metal' | 'insurance' | 'option' | 'mrp' | 'other';
export type Allocation = 'own' | 'spouseHalf' | 'childShared' | 'childSole' | 'childSeparate';
export interface Asset {
  id: string; name: string; kind: AssetKind; value: number; share: number;
  country: 'hu' | 'foreign'; business: boolean; allocation: Allocation;
  treaty: 'none' | 'exclude' | 'progression';
  rights: number; rightsAlreadyIncluded: boolean; specialMrp: boolean;
  companyMethod: 'formula' | 'expert' | 'transaction';
  equity: number; profits: number[]; yearDays: number[]; reserves: number; dividends: number;
  holding: boolean; startup: boolean; startupLost: boolean; minority: boolean; totalShare: number;
  capitalizationRate: number;
  foreignPropertyCompany: boolean;
  optionIntrinsic: number;
}
export interface Settings {
  resident: boolean; subject: 'person' | 'trust'; threshold: number;
  linkedTrusts: boolean; debt: number; debtConfirmed: boolean;
  localTaxes: number; mandatoryFees: number; feesConfirmed: boolean;
}
export const defaultSettings: Settings = { resident: true, subject: 'person', threshold: 1000, linkedTrusts: false, debt: 0, debtConfirmed: false, localTaxes: 0, mandatoryFees: 0, feesConfirmed: false };
export function newAsset(kind: AssetKind = 'property'): Asset {
  return { id: crypto.randomUUID(), name: '', kind, value: 0, share: 100, country: 'hu', business: false, allocation: 'own', treaty: 'none', rights: 0, rightsAlreadyIncluded: false, specialMrp: false, companyMethod: 'formula', equity: 0, profits: [0,0,0], yearDays: [365,365,365], reserves: 0, dividends: 0, holding: false, startup: false, startupLost: false, minority: true, totalShare: 100, capitalizationRate: 15, foreignPropertyCompany: false, optionIntrinsic: 0 };
}
export const assetKinds: { value: AssetKind; label: string; hint: string; ref: string }[] = [
  {value:'property', label:'Ingatlan', hint:'A 15–19. § szerinti számított érték: megfelelő ügyleti, indexált, NAV-modell szerinti vagy szakértői érték. Nincs általános mentesség a saját lakásra.', ref:'15–19. §'},
  {value:'propertyRight', label:'Ingatlanhoz kapcsolódó jog', hint:'Haszonélvezet és más ingatlanjog: a 22. § és az Itv. 72. § szerint már meghatározott értéket adja meg. Építményi jognál szokásos piaci érték. A jogot és az ingatlant ne számítsa kétszer.', ref:'22. §'},
  {value:'company', label:'Társasági részesedés', hint:'Nem jegyzett részesedésnél a tervezet képlete; tőzsdei vagy szakértői értéknél válassza a megfelelő értékelési módot. Konszolidált beszámoló esetén annak adatait adja meg.', ref:'12. §; 1. melléklet'},
  {value:'cash', label:'Pénzeszköz, bankszámla', hint:'December 31-i záróegyenleg vagy készpénz névértéke. Devizát a fordulónapi MNB-árfolyamon váltson forintra.', ref:'11. §; 21. § (1)'},
  {value:'securities', label:'Értékpapír, befektetés', hint:'A 21. § szerinti érték: kötvénynél általában 20 kereskedési nap átlagárfolyama, befektetési jegynél a közzétett nettó eszközérték. A 2026-os átmeneti választást a 35. § tartalmazza.', ref:'21. §; 35. §'},
  {value:'crypto', label:'Kriptoeszköz', hint:'A december 31-i mennyiség és a független kereskedési platform napi záróárfolyamának szorzata.', ref:'21. § (12)'},
  {value:'vehicle', label:'Jármű', hint:'Magánszemélynél a személyes használatú, legfeljebb 10 millió Ft egyedi értékű jármű kimarad. Az értékhatár felett a teljes érték számít, nem csak a többlet.', ref:'6. § (3)–(4); 20. §'},
  {value:'art', label:'Műtárgy, ékszer, gyűjtemény', hint:'Személyes használatnál a 3 millió Ft feletti egyedi értékű tétel teljes értéke számít. Minden tárgyat vagy egységes gyűjteményt külön sorban adjon meg.', ref:'6. § (3)–(4); 20. §'},
  {value:'personal', label:'Szokásos személyes ingóság', hint:'A személyes használati és szokásos berendezési tárgyak főszabály szerint kimaradnak; üzleti használatnál a teljes értékük számít.', ref:'6. § (3)–(4)'},
  {value:'metal', label:'Befektetési nemesfém', hint:'Színnemesfém-mennyiség × fordulónapi nemzetközi referenciaár; más befektetési nemesfémnél szokásos piaci érték. Nem a magánékszerek mentességi szabálya érvényesül.', ref:'21. § (13)'},
  {value:'insurance', label:'Biztosítási jogosultság', hint:'A biztosító által igazolt december 31-i visszavásárlási érték. Nyugdíjbiztosításnál a biztosított, egyébként a szerződő vagyonában számít.', ref:'21. § (8)–(11)'},
  {value:'option', label:'Opciós jogosultság', hint:'A meghatározott piaci érték és a 23. § szerint számított belső érték közül a magasabb összeg számít. A mögöttes vagyont ne duplázza.', ref:'23. §'},
  {value:'mrp', label:'MRP tagi részesedés', hint:'Csak a különleges munkavállalói résztulajdonosi programban fennálló tagi részesedés számít. Ennek értéke a tagra jutó nettó eszközérték, hozamérték nélkül.', ref:'6. § (5); 14. §'},
  {value:'other', label:'Egyéb vagyoni érték, jog', hint:'A tervezet szerinti számított érték; külön szabály hiányában a fordulónapi szokásos piaci érték. Átlátható szervezetnél csak az Önre jutó értéket és tartozást szerepeltesse.', ref:'7. § (6)–(7); 10. §; 22. §'},
];
export function companyValue(a: Asset) {
  const count = a.profits.length;
  const average = count ? a.profits.reduce((s,p,i) => s + p * 365 / a.yearDays[i], 0) / count : 0;
  const rate = a.country === 'foreign' ? a.capitalizationRate / 100 : 0.15;
  const yieldValue = Math.max(0, average / rate);
  const equity = a.equity + (a.equity > 500 ? a.reserves : 0) - a.dividends;
  const startupEligible = a.startup && !a.startupLost && count <= 3 && a.equity <= 500 && yieldValue <= equity * 0.25;
  const total = a.holding ? equity : (equity + 2 * (startupEligible ? 0 : yieldValue)) / 3;
  const discount = a.minority && a.totalShare < 50 ? (a.totalShare >= 33 ? 0.25 : 0.30) : 0;
  return { total: Math.max(0,total), yieldValue, equity, startupEligible, discount, value: Math.max(0,total) * a.share / 100 * (1-discount) };
}
export function assetValue(a: Asset, s: Settings) {
  const reasons: string[] = [];
  let value = a.value;
  let shareIncluded = false;
  const scoped = a.country === 'hu' && ['property','propertyRight','company'].includes(a.kind);
  if (!s.resident && !scoped && !(a.kind === 'company' && a.foreignPropertyCompany)) {
    reasons.push('Külföldi illetőségnél e vagyonelem nem tartozik a 4. § szerinti körbe.'); return { value: 0, reasons, treatyValue: 0 };
  }
  if (s.resident && a.country === 'foreign' && a.treaty === 'exclude') {
    reasons.push('Egyezmény alapján nem vehető figyelembe — 8. § (3).'); return { value: 0, reasons, treatyValue: 0 };
  }
  if (a.kind === 'mrp' && !a.specialMrp) { reasons.push('Nem különleges MRP-részesedés — 6. § (5).'); return {value:0, reasons, treatyValue:0}; }
  if (s.subject === 'person') {
    if (a.allocation === 'childSeparate') { reasons.push('A gyermek örökölt / saját keresményéből származó vagyona a gyermek külön adóalapja.'); return {value:0, reasons, treatyValue:0}; }
    if (!a.business && ((a.kind === 'vehicle' && a.value <= 10) || (a.kind === 'art' && a.value <= 3) || a.kind === 'personal')) {
      reasons.push('Személyes használat miatti figyelmen kívül hagyás — 6. § (3).'); return {value:0, reasons, treatyValue:0};
    }
  }
  if (a.kind === 'company' && a.companyMethod === 'formula' && !(!s.resident && a.country === 'foreign' && a.foreignPropertyCompany)) {
    const c = companyValue(a); value = c.value; shareIncluded = true;
    if (c.discount) reasons.push(`${Math.round(c.discount*100)}% kisebbségi korrekció — 1. melléklet V. b).`);
    if (a.holding) reasons.push('Holding: korrigált saját tőke szerinti érték.');
    if (c.startupEligible && !a.holding) reasons.push('Induló társaság: a hozamérték nulla.');
    if (a.startup && !c.startupEligible && !a.holding) reasons.push('Az induló társaság kedvezményének feltételei nem teljesülnek.');
  }
  if (a.kind === 'option') value = Math.max(a.value,a.optionIntrinsic);
  if (a.kind === 'property' && !a.rightsAlreadyIncluded) { value = Math.max(0,value-a.rights); if (a.rights) reasons.push('A terhelő jog számított értéke egyszer levonva — 22. §.'); }
  if (!shareIncluded) value *= a.share / 100;
  if (s.subject === 'person' && ['spouseHalf','childShared'].includes(a.allocation)) { value *= 0.5; reasons.push('A megadott tulajdoni részből 50% ennél az adóalanynál — 7. §.'); }
  if (!s.resident && a.kind === 'company' && a.country === 'foreign' && a.foreignPropertyCompany) reasons.push('Csak a társaság magyar ingatlanainak részesedésarányos értéke — 12. § (9).');
  if (s.resident && a.country === 'foreign' && a.treaty === 'progression') reasons.push('Egyezményes vagyon: bekerül az alapba, külön adólevonással — 8. § (2); 9. § (3).');
  return {value, reasons, treatyValue:s.resident && a.country==='foreign' && a.treaty==='progression' ? value : 0};
}
/** §9(1): the 100-billion bracket is TAX BASE, after the §6 exemption. */
export function taxOnBase(base: number) { return Math.min(Math.max(0,base),100_000)*0.01 + Math.max(0,base-100_000)*0.015; }
export function calculate(assets: Asset[], settings: Settings) {
  const items = assets.map(asset => ({asset,...assetValue(asset,settings)}));
  const gross = items.reduce((sum,item) => sum+item.value,0);
  const debt = settings.debtConfirmed ? settings.debt : 0;
  const net = Math.max(0,gross-debt);
  const threshold = settings.subject==='trust' && settings.linkedTrusts ? settings.threshold : 1000;
  const base = Math.max(0,net-threshold);
  const tax = taxOnBase(base);
  const treatyAssets = items.reduce((sum,item) => sum+item.treatyValue,0);
  const treatyCredit = taxOnBase(Math.max(0,treatyAssets-threshold));
  const feeCredit = settings.feesConfirmed ? Math.min(2,settings.mandatoryFees*0.5) : 0;
  const credits = feeCredit+settings.localTaxes+treatyCredit;
  const payable = Math.max(0,tax-credits);
  // §25(6): determine the tax in HUF, then round to thousands. The HUF step
  // also prevents binary floating-point subtraction from turning 1 500 into 1 499.999….
  return {items,gross,debt,net,threshold,base,tax,feeCredit,treatyCredit,credits,payable,rounded:Math.round(Math.round(payable*1e6)/1000)*1000};
}
export function validate(assets: Asset[], s: Settings): string[] {
  const errors: string[] = [];
  const valid = (x: number) => Number.isFinite(x);
  assets.forEach((a,i) => {
    const prefix=`${i+1}. vagyonelem`;
    if (![a.value,a.share,a.rights,a.equity,a.reserves,a.dividends,a.totalShare,a.optionIntrinsic,...a.profits,...a.yearDays].every(valid)) errors.push(`${prefix}: minden összeg és arány legyen érvényes szám.`);
    if ([a.value,a.rights,a.reserves,a.dividends,a.optionIntrinsic].some(x=>x<0)) errors.push(`${prefix}: az értékek nem lehetnek negatívak.`);
    if (a.share<=0 || a.share>100 || a.totalShare< a.share || a.totalShare>100) errors.push(`${prefix}: a tulajdoni arány 0 feletti, legfeljebb 100%; az összesített hányad legalább a közvetlen hányad.`);
    if (a.yearDays.some(x=>x<=0)) errors.push(`${prefix}: az üzleti év napjainak száma legyen pozitív.`);
    if (!valid(a.capitalizationRate) || a.capitalizationRate<=0 || a.capitalizationRate>100) errors.push(`${prefix}: a tőkésítési ráta 0 feletti, legfeljebb 100% lehet.`);
    if (a.kind==='company' && a.companyMethod==='formula' && companyValue(a).equity<0) errors.push(`${prefix}: a negatív korrigált saját tőke értékelése szakértői minősítést igényel. Válassza a szakértői értéket.`);
    if (a.kind==='property' && a.rights>a.value && !a.rightsAlreadyIncluded) errors.push(`${prefix}: a terhelő jog nem haladhatja meg az ingatlan teljes számított értékét.`);
  });
  if (![s.debt,s.localTaxes,s.mandatoryFees,s.threshold].every(x=>valid(x)&&x>=0) || s.threshold>1000) errors.push('A levonások nem lehetnek negatívak, a kapcsolt vagyonkezelés kerete legfeljebb 1 000 millió Ft.');
  return errors;
}
export const formatFt = (value: number) => new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(value)+' Ft';
export const formatMillion = (value: number) => new Intl.NumberFormat('hu-HU',{maximumFractionDigits:3}).format(value)+' M Ft';
