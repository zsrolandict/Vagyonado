import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus, Trash2, ChevronDown, ChevronUp, ShieldCheck, Info, Download, RotateCcw, Check, Building2, Wallet, CarFront, CircleHelp, ArrowUpRight, LockKeyhole, Landmark, X } from 'lucide-react';
import { assetKinds, calculate, companyValue, defaultSettings, formatFt, formatMillion, newAsset, validate } from './tax';
import type { Asset, AssetKind, Settings } from './tax';
import ExpertConsultation from './ExpertConsultation';
import {basicScopeText,expertTopics} from './expertTopics';
import type {ExpertTopicId} from './expertTopics';

function Money({ label, value, onChange, hint, signed=false }: {label:string;value:number;onChange:(n:number)=>void;hint?:string;signed?:boolean}) {
  const [draft,setDraft]=useState(()=>Number.isNaN(value)?'':String(value));
  const editing=useRef(false);
  useEffect(()=>{if(!editing.current)setDraft(Number.isNaN(value)?'':String(value));},[value]);
  // Keep the browser's intermediate minus sign and decimal point while typing.
  // Native input events also report incomplete values skipped by React's change event.
  return <label className="field"><span>{label}</span><div className="money-input"><input aria-label={label} type="number" min={signed?undefined:0} step="any" value={draft} onFocus={()=>{editing.current=true;}} onBlur={()=>{editing.current=false;if(Number.isFinite(value))setDraft(String(value));}} onInput={e=>{setDraft(e.currentTarget.value);onChange(e.currentTarget.validity.badInput?NaN:Number(e.currentTarget.value));}}/><span>M Ft</span></div>{hint&&<small>{hint}</small>}</label>;
}
function Toggle({label, checked, onChange, hint}:{label:string;checked:boolean;onChange:(v:boolean)=>void;hint?:string}) {
  return <label className="check-field"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span>{label}{hint&&<small>{hint}</small>}</span></label>;
}
const basicKinds=assetKinds.filter(k=>['property','cash','vehicle','company'].includes(k.value));
const newBasicAsset=(kind:AssetKind='property')=>({...newAsset(kind),minority:false});
const businessYears=['Utolsó lezárt üzleti év','Előző lezárt üzleti év','Az azt megelőző lezárt üzleti év'];
const isBasicKind=(kind:string)=>basicKinds.some(k=>k.value===kind);
const assetIcon=(kind:AssetKind)=>kind==='property'?Building2:kind==='company'?Landmark:kind==='vehicle'?CarFront:Wallet;

function AssetEditor({asset:a,index,onChange,onRemove,onCompanyConsultation}:{asset:Asset;index:number;onChange:(a:Asset)=>void;onRemove:()=>void;onCompanyConsultation:()=>void}) {
  const [open,setOpen]=useState(true);
  const patch=(p:Partial<Asset>)=>onChange({...a,...p});
  const kind=basicKinds.find(k=>k.value===a.kind)!;
  const Icon=assetIcon(a.kind);
  const company=companyValue(a);
  return <div className="asset-card">
    <div className="asset-top"><button type="button" className="asset-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><span className="asset-icon"><Icon size={19}/></span><strong>{a.name||kind.label}</strong><span className="asset-number">{String(index+1).padStart(2,'0')}</span>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button><button type="button" className="icon-button" onClick={onRemove} aria-label={`${index+1}. vagyonelem törlése`}><Trash2 size={16}/></button></div>
    {open&&<div className="asset-body">
      <div className="field-grid"><label className="field"><span>Vagyonelem típusa</span><select value={a.kind} onChange={e=>{if(isBasicKind(e.target.value)){const next=newBasicAsset(e.target.value as AssetKind);onChange({...next,id:a.id,name:a.name,value:a.value,share:a.share,totalShare:a.share});}}}>{basicKinds.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}</select></label><label className="field"><span>Megnevezés <em>opcionális</em></span><input value={a.name} maxLength={100} onChange={e=>patch({name:e.target.value})} placeholder="Pl. budapesti lakás"/></label></div>
      {a.kind==='company'?<>
        <Money label="Beszámoló szerinti saját tőke" value={a.equity} onChange={equity=>patch({equity})} signed/>
        <div className="company-years"><label className="field"><span>Lezárt üzleti évek száma</span><select value={a.profits.length} onChange={e=>{const n=Number(e.target.value);patch({profits:Array.from({length:n},(_,i)=>a.profits[i]??0),yearDays:Array.from({length:n},(_,i)=>a.yearDays[i]??365)});}}><option value={1}>1 év</option><option value={2}>2 év</option><option value={3}>3 év</option></select></label><p>Az utolsó lezárt üzleti évtől visszafelé haladjon.</p></div>
        <div className="profit-grid">{a.profits.map((p,i)=><Money key={i} label={`${businessYears[i]} adózott eredménye`} value={p} onChange={v=>patch({profits:a.profits.map((x,j)=>i===j?v:x)})} signed/>)}</div>
        <details className="basic-year-lengths"><summary>Eltérő hosszúságú üzleti év?</summary><div className="profit-grid">{a.yearDays.map((days,i)=><label className="field" key={i}><span>{businessYears[i]} napjai</span><input type="number" min={1} step={1} value={days} onChange={e=>patch({yearDays:a.yearDays.map((x,j)=>i===j?Number(e.target.value):x)})}/></label>)}</div></details>
        <div className="company-consultation-gate"><p><LockKeyhole size={16}/><strong>A pontos cégértékhez ezek is számíthatnak.</strong></p><div className="field-grid">{['Rejtett tartalék, halasztott adó után','Tőkében még szereplő osztalék'].map(label=><button type="button" className="company-locked-field" key={label} aria-haspopup="dialog" aria-label={`${label} — szakértői konzultáció`} onClick={onCompanyConsultation}><span>{label}</span><span className="company-locked-value" aria-hidden="true"><i/><LockKeyhole size={16}/></span><small>Szakértői konzultáció része <ArrowUpRight size={12}/></small></button>)}</div><button type="button" className="text-link" onClick={onCompanyConsultation}>A cégérték-korrekciókat szakértővel vizsgálom <ArrowRight size={15}/></button></div>
        <div className="company-answer"><span><b className="limited-estimate-badge">KORLÁTOZOTT BECSLÉS</b>Teljes társaság alapértéke</span><strong>{Number.isFinite(company.total)?formatMillion(company.total):'—'}</strong><small>Hozamérték: {Number.isFinite(company.yieldValue)?formatMillion(company.yieldValue):'—'} · Rejtett tartalék, osztalék-, holding- és kisebbségi korrekció nélkül.</small></div>
      </>:<Money label="Teljes vagyonelem számított értéke" value={a.value} onChange={value=>patch({value})} hint="1 M Ft = 1 000 000 forint. A teljes értéket adja meg, a tulajdoni hányadot külön számítjuk."/>}
      <label className="field"><span>Tulajdoni hányad</span><div className="money-input"><input type="number" min="0.001" max="100" step="any" aria-label="Tulajdoni hányad" value={a.share} onChange={e=>{const share=Number(e.target.value);patch({share,totalShare:share});}}/><span>%</span></div></label>
      <div className="asset-hint"><Info size={15}/><p>{a.kind==='company'?'Belföldi társaság alapbecslése: (saját tőke + kétszeres hozamérték) / 3, tulajdoni hányaddal arányosítva. A hozamérték az évesített eredményátlag és a 15%-os ráta alapján készül. Az egyedi korrekciók és értékelési kivételek szakértői vizsgálatot igényelnek.':a.kind==='cash'?'Forint bankszámla december 31-i záróegyenlege vagy készpénz névértéke. Deviza és külföldi pénzügyi vagyon esetén kérjen egyedi vizsgálatot.':kind.hint} <span>{kind.ref}</span></p></div>
    </div>}
  </div>;
}

export default function Calculator({onContact,onConsultation}:{onContact:()=>void;onConsultation:(topic:ExpertTopicId)=>void}) {
  const [expertNeeds,setExpertNeeds]=useState<ExpertTopicId[]>([]);
  const [activeExpertTopic,setActiveExpertTopic]=useState<ExpertTopicId|null>(null);
  const [assets,setAssets]=useState<Asset[]>([newBasicAsset()]);
  const [settings,setSettings]=useState<Settings>({...defaultSettings});
  const [step,setStep]=useState(0);
  const [addOpen,setAddOpen]=useState(false);
  const [resetOpen,setResetOpen]=useState(false);
  const [detailsOpen,setDetailsOpen]=useState(false);
  const resultDialog=useRef<HTMLDialogElement>(null);
  const scrollPending=useRef(false);
  useEffect(()=>{
    if(!scrollPending.current)return;
    scrollPending.current=false;
    document.getElementById('calculator-tabs')?.scrollIntoView({block:'start',behavior:'smooth'});
  },[step]);
  useEffect(()=>{
    const dialog=resultDialog.current;
    if(!detailsOpen){dialog?.close();return;}
    dialog?.showModal();
    if(dialog){dialog.scrollTop=0;dialog.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});}
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previousOverflow;};
  },[detailsOpen]);
  const errors=validate(assets,settings).map(error=>error.replace('Válassza a szakértői értéket.','Kérjen szakértői konzultációt.'));
  const result=calculate(assets,settings);
  const patch=(s:Partial<Settings>)=>setSettings({...settings,...s});
  const hasValue=assets.some(a=>a.kind==='company'?a.equity!==0||a.profits.some(p=>p!==0):a.value>0);
  const hasCompany=assets.some(a=>a.kind==='company');
  const selectedTopics=expertTopics.filter(t=>expertNeeds.includes(t.id));
  const scopeNote=<div className={`partial-scope-note ${expertNeeds.length||hasCompany?'partial-scope-note-emphasized':''}`} role="note"><Info size={16}/><p><strong>{hasCompany?'A céges rész korlátozott becslés.':expertNeeds.length?'További szakértői vizsgálatot jelölt meg.':'Az alapbecslés terjedelme'}</strong>{basicScopeText}{expertNeeds.length>0&&<span> Megjelölt területek: {selectedTopics.map(t=>t.short).join(', ')}.</span>}</p></div>;
  const steps=['Vagyonelemek','Levonások','Eredmény'];
  const move=(n:number)=>{
    if(n===step){document.getElementById('calculator-tabs')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    scrollPending.current=true;setStep(n);
  };
  const exportReport=()=>{
    const lines=['ICT Európa — Ingyenes alapvagyon-becslés','A feltöltött 2026-os törvénytervezet alapján. Tájékoztató becslés, nem adóbevallás.','Összegek forintban.',...(hasCompany?['KORLÁTOZOTT CÉGES BECSLÉS — nem teljes körű cégértékelés.']:[]),basicScopeText,`További megjelölt területek: ${selectedTopics.map(t=>t.title).join(', ')||'Nincs megjelölve'}. Az ezekhez tartozó egyedi korrekciók és struktúrák vizsgálata nem része az alapbecslésnek.`,`Adóalany: ${settings.subject==='person'?'magánszemély':'vagyonkezelési adóalany'}; illetőség: ${settings.resident?'belföldi':'külföldi'}`,'',...result.items.map(i=>`${i.asset.name||assetKinds.find(k=>k.value===i.asset.kind)?.label}: ${formatFt(i.value*1e6)} (${i.asset.share}% tulajdon)\n${i.reasons.join(' ')}`),'',`Adóköteles vagyon: ${formatFt(result.gross*1e6)}`,`Igazolt tartozás: ${formatFt(result.debt*1e6)}`,`Nettó vagyon: ${formatFt(result.net*1e6)}`,`Alkalmazott küszöb: ${formatFt(result.threshold*1e6)}`,`Adóalap: ${formatFt(result.base*1e6)}`,`Számított adó: ${formatFt(result.tax*1e6)}`,`Helyi / járműadó jóváírása: ${formatFt(settings.localTaxes*1e6)}`,`Becsült éves adó, ezer Ft-ra kerekítve: ${formatFt(result.rounded)}`,'','Szabályok: 6–9. §; 11. §; 15–21. §; 25. §. A vagyonelemek helyes értékelése és jogi minősítése külön ellenőrzést igényel.'];
    const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='ICT-Europa-vagyonado-kalkulacio.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const renderResult=(isDialog=false)=><>
        <div className="panel-title"><div><h3 id={isDialog?'result-dialog-title':undefined} tabIndex={isDialog?-1:undefined}>Így áll össze a becslése.</h3><p>Belföldi magánszemély megadott alapvagyonának éves becslése.</p>{hasCompany&&<span className="limited-estimate-badge">KORLÁTOZOTT CÉGES BECSLÉS</span>}</div><span className="tiny-pill">Részletes levezetés</span></div>
        {errors.length>0?<div className="empty-state"><CircleHelp size={32}/><h4>Javítsa a megadott adatokat.</h4><p>Érvényes összegek és arányok után megjelenik a részletes becslés.</p><button type="button" className="button button-dark" onClick={()=>{setDetailsOpen(false);move(0);}}>Adatok ellenőrzése <ArrowRight size={16}/></button></div>:!hasValue?<div className="empty-state"><CircleHelp size={32}/><h4>Még nem adott meg vagyoni értéket.</h4><p>Adjon hozzá egy vagyonelemet a személyre szabott becsléshez.</p><button type="button" className="button button-dark" onClick={()=>{setDetailsOpen(false);move(0);}}>Vagyonelemek megadása <ArrowRight size={16}/></button></div>:<>
          <div className="result-lines">{result.items.map(i=><div key={i.asset.id}><div><span>{i.asset.name||assetKinds.find(k=>k.value===i.asset.kind)?.label}</span><strong>{formatFt(i.value*1e6)}</strong></div>{i.reasons.map((r,j)=><small key={j}>{r}</small>)}</div>)}</div>
          <dl className="breakdown"><div><dt>Adóköteles vagyon összesen</dt><dd>{formatFt(result.gross*1e6)}</dd></div><div><dt>Igazolt tartozások</dt><dd>− {formatFt(result.debt*1e6)}</dd></div><div className="strong"><dt>Nettó vagyon</dt><dd>{formatFt(result.net*1e6)}</dd></div><div><dt>Alkalmazott adómentes küszöb</dt><dd>− {formatFt(result.threshold*1e6)}</dd></div><div className="strong"><dt>Adóalap</dt><dd>{formatFt(result.base*1e6)}</dd></div><div><dt>1%-os sáv adója</dt><dd>{formatFt(Math.min(result.base,100000)*10000)}</dd></div><div><dt>1,5%-os sáv adója</dt><dd>{formatFt(Math.max(0,result.base-100000)*15000)}</dd></div><div><dt>Helyi / járműadó jóváírása</dt><dd>− {formatFt(settings.localTaxes*1e6)}</dd></div><div className="total"><dt>Becsült fizetendő éves adó</dt><dd data-testid={isDialog?'dialog-final-tax':'final-tax'}>{formatFt(result.rounded)}</dd></div></dl>
          {result.payable===0&&<p className="positive-note"><Check size={16}/>A megadott alapvagyonra a becsült éves adó 0 Ft.</p>}
          <p className="small-note">A tervezet szerint az adó ezer forintra kerekítendő. A 100 milliárd Ft-os sávhatár a küszöb levonása utáni adóalapra vonatkozik.</p>
          <button type="button" className="button button-outline export-button" disabled={errors.length>0} onClick={exportReport}><Download size={17}/>Kalkuláció letöltése</button>
        </>}
        {scopeNote}
        <div className="review-note"><Info size={18}/><p>A becslés a megadott, előzetesen meghatározott számított értékekből dolgozik. Ingatlanmodell, MNB-árfolyam, egyezmény és speciális cégértékelés nincs automatikusan lekérve. Az 500 M Ft-ot elérő, nem termőföld ingatlan külön értékelési szabályai, az illetőség és az egyedi jogviszonyok szakértői ellenőrzést igényelnek.</p></div>
  </>;
  return <section id="kalkulator" className="calculator-section section-pad basic-calculator"><div className="container">
    <div className="section-heading"><div><p className="eyebrow"><span/>INGYENES ALAPBECSLÉS</p><h2>Ismerje meg a várható<br/><em>vagyonadó-terhét!</em></h2></div><p>Számolja ki egyszerű belföldi vagyonának becsült adóterhét, név nélkül. Az összetett vagyoni helyzetek teljes elemzését szakértőinkkel tekintheti át.</p></div>
    <div className="calculator-layout"><div className="calc-main">
      <div className="calc-steps" id="calculator-tabs" role="tablist" aria-label="Kalkulátor lépései">{steps.map((s,i)=><button key={s} id={`tab-${i}`} role="tab" aria-selected={step===i} aria-controls={`panel-${i}`} onClick={()=>move(i)} className={step===i?'active':''}><span>{step>i?<Check size={13}/>:i+1}</span>{s}</button>)}</div>
      <div className="calc-panel" id={`panel-${step}`} role="tabpanel" aria-labelledby={`tab-${step}`}>
      {step===0&&<>
        <div className="panel-title"><div><h3>Kezdjük a vagyonával.</h3><p>Összegek millió forintban, a tervezett fordulónapi értéken.</p></div><span className="tiny-pill">2026. 12. 31.</span></div>
        <div className="basic-mode-banner"><ShieldCheck size={22}/><div><strong>Ingyenes · Belföldi magánszemély alapvagyona</strong><p>Ingatlan, forint pénzeszköz, személyes jármű és belföldi társaság korrekciók nélküli alapbecslése. Az 1 milliárd Ft-os nettóvagyon-küszöb egyszer, a bevont vagyonelemek összesített értékére vonatkozik.</p></div></div>
        <div className="asset-list">{assets.map((a,i)=><AssetEditor key={a.id} asset={a} index={i} onCompanyConsultation={()=>setActiveExpertTopic('company')} onChange={next=>setAssets(assets.map(x=>x.id===a.id?next:x))} onRemove={()=>setAssets(assets.filter(x=>x.id!==a.id))}/>)}</div>
        <div className="add-asset"><button type="button" className="add-button" aria-expanded={addOpen} onClick={()=>setAddOpen(!addOpen)}><Plus size={18}/>Vagyonelem hozzáadása<ChevronDown size={16}/></button>{addOpen&&<div className="asset-menu">{basicKinds.map(k=>{const Icon=assetIcon(k.value);return <button key={k.value} type="button" onClick={()=>{setAssets([...assets,newBasicAsset(k.value)]);setAddOpen(false);}}><Icon size={16}/>{k.label}<Plus size={14}/></button>;})}</div>}</div>
      </>}
      {step===1&&<>
        <div className="panel-title"><div><h3>A részletek is számítanak.</h3><p>Az igazolt tartozásokat és a jogosult jóváírásokat adja meg.</p></div><ShieldCheck size={25}/></div>
        <div className="deduction-block"><p className="mini-title">01 — Adóalapot csökkentő tartozás</p><Money label="Igazolt, levonható tartozások" value={settings.debt} onChange={debt=>patch({debt})} hint="Csak a bevont alapvagyonhoz kapcsolódó, a 6. § szerinti fordulónapon fennálló, igazolt és levonható tartozást adja meg. A becsült vagyonadó nem tartozás."/><Toggle label="A tartozás megfelel a tervezet igazolási és levonhatósági feltételeinek" checked={settings.debtConfirmed} onChange={debtConfirmed=>patch({debtConfirmed})} hint={settings.resident?'Jogszabály, jogerős / végleges határozat, vagy megfelelő okiratba foglalt hitel- / kölcsönszerződés alapján.':'Külföldi illetőségnél ezen felül közvetlenül az adóköteles vagyonelemhez kapcsolódik.'}/>{settings.debt>0&&!settings.debtConfirmed&&<p className="inline-warning">Megerősítés nélkül a tartozást nem vonjuk le.</p>}</div>
        <div className="deduction-block"><p className="mini-title">02 — Fizetendő adót csökkentő tétel</p><Money label="Megfizetett helyi és gépjárműadók" value={settings.localTaxes} onChange={localTaxes=>patch({localTaxes})} hint="Csak a bevont alapvagyonhoz kapcsolódó, az érintett adóévben esedékes és megfizetett jogosult adó, visszajáró összeg nélkül. 9. § (2) b)."/></div>
      </>}
      {step===2&&renderResult()}
      {errors.length>0&&<div className="validation-errors" role="alert"><strong>Ellenőrizze a megadott adatokat:</strong>{errors.map((e,i)=><p key={i}>{e}</p>)}</div>}
      <div className="panel-actions"><button type="button" className="reset-button" onClick={()=>setResetOpen(true)}><RotateCcw size={14}/>Újrakezdés</button>{step<2?<button type="button" className="button button-dark" disabled={errors.length>0} onClick={()=>move(step+1)}>{step===0?'Levonások megadása':'Eredmény megtekintése'}<ArrowRight size={16}/></button>:<button type="button" className="text-link" onClick={()=>move(0)}>Adatok módosítása <ArrowRight size={16}/></button>}</div>
      {resetOpen&&<div className="reset-confirm" role="alert"><p>Törli az itt megadott vagyonelemeket és levonásokat?</p><button className="button button-dark" onClick={()=>{setAssets([newBasicAsset()]);setSettings({...defaultSettings});setExpertNeeds([]);setAddOpen(false);setStep(0);setResetOpen(false);}}>Igen, újrakezdem</button><button className="button button-outline" onClick={()=>setResetOpen(false)}>Mégse</button></div>}
      </div><p className="privacy-note"><ShieldCheck size={15}/>A vagyoni adatok a böngészőben maradnak. Nem tároljuk és nem továbbítjuk őket.</p>
    </div>
    <aside className="result-sidebar"><div className="live-result"><div className="summary-top"><span>BECSÜLT VAGYONADÓ AZ ALAPADATOK ALAPJÁN</span><span className="live-dot"/></div><p className="summary-label">Becsült éves adó a megadott alapvagyonra</p>{hasCompany&&<span className="limited-estimate-badge">KORLÁTOZOTT CÉGES BECSLÉS</span>}<div className="summary-value" aria-live="polite" data-testid="live-tax">{errors.length?'Ellenőrizze az adatokat':hasValue?formatFt(result.rounded):'— Ft'}</div><p className="summary-caption">A feltöltött 2026-os tervezet szerint</p><div className="summary-divider"/><dl><div><dt>Nettó vagyon</dt><dd>{errors.length?'—':formatMillion(result.net)}</dd></div><div><dt>Adómentes küszöb</dt><dd>{formatMillion(result.threshold)}</dd></div><div className="summary-base"><dt>Adóalap</dt><dd>{errors.length?'—':formatMillion(result.base)}</dd></div></dl><div className="tax-scale"><span className={result.base>0?'filled':''}/><span className={result.base>100000?'filled':''}/><span/></div><div className="scale-labels"><span>1%-os sáv</span><span>1,5%-os sáv</span></div><p className="summary-footnote">A jóváírásokkal csökkentve, ezer forintra kerekítve. Tájékoztató alapbecslés.</p>{scopeNote}<button type="button" className="button button-light" onClick={()=>setDetailsOpen(true)} aria-haspopup="dialog">Részletes eredmény <ArrowRight size={16}/></button></div>
      <div className="expert-card"><span className="expert-icon"><CircleHelp size={22}/></span><h4>A vagyon több,<br/>mint egy szám.</h4><p>Értse meg a lehetőségeit, és tervezzen szakértővel.</p><button type="button" className="text-link" onClick={onContact}>Szakértői segítséget kérek <ArrowUpRight size={16}/></button></div>
    </aside></div>
    <ExpertConsultation active={activeExpertTopic} onActiveChange={setActiveExpertTopic} selected={expertNeeds} onSelect={topic=>setExpertNeeds(previous=>previous.includes(topic)?previous.filter(t=>t!==topic):[...previous,topic])} onContact={onConsultation}/>
  </div>
    <dialog ref={resultDialog} className="result-dialog" aria-labelledby="result-dialog-title" onCancel={()=>setDetailsOpen(false)} onClose={()=>setDetailsOpen(false)} onClick={e=>{if(e.target===resultDialog.current)setDetailsOpen(false);}}>
      <div className="result-dialog-toolbar"><span>ICT EURÓPA · VAGYONADÓ-KALKULÁCIÓ</span><button type="button" className="icon-button" aria-label="Részletes eredmény bezárása" onClick={()=>setDetailsOpen(false)}><X size={22}/></button></div>
      <div className="result-dialog-content">{renderResult(true)}</div>
    </dialog>
  </section>;
}
