import {useEffect,useRef} from 'react';
import {ArrowRight,Building2,Globe2,LockKeyhole,ShieldCheck,UsersRound,X} from 'lucide-react';
import {expertTopics} from './expertTopics';
import type {ExpertTopicId} from './expertTopics';
import './expertConsultation.css';

export default function ExpertConsultation({selected,onSelect,onContact,active,onActiveChange:setActive}:{selected:ExpertTopicId[];onSelect:(topic:ExpertTopicId)=>void;onContact:(topic:ExpertTopicId)=>void;active:ExpertTopicId|null;onActiveChange:(topic:ExpertTopicId|null)=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const topic=expertTopics.find(t=>t.id===active);
  useEffect(()=>{
    const node=dialog.current;
    if(!active){node?.close();return;}
    node?.showModal();
    node?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=overflow;};
  },[active]);
  const icons=[Building2,Globe2,UsersRound];
  return <div className="expert-modules" aria-labelledby="expert-modules-title">
    <div className="expert-modules-heading"><div><p className="eyebrow"><span/>A TELJES KÉPHEZ</p><h3 id="expert-modules-title">Az összetett vagyon egyedi figyelmet érdemel.</h3></div><p>Az alapbecslésen túl ezek a területek szakértői konzultáció keretében vizsgálhatók.</p></div>
    <div className="expert-modules-grid">{expertTopics.map((t,i)=>{const Icon=icons[i];return <article className="expert-module" key={t.id}>
      <div className="expert-module-top"><span className="expert-module-icon"><Icon size={23} strokeWidth={1.5}/></span><span className="expert-module-number">0{i+1}</span></div>
      <h4>{t.title}</h4><p>{t.description}</p>
      <ul className="expert-module-fields">{t.fields.map(field=><li key={field}><LockKeyhole size={13}/>{field}</li>)}</ul>
      <button type="button" className="expert-module-preview" aria-label={`${t.title} — részletek és konzultáció`} aria-haspopup="dialog" onClick={()=>setActive(t.id)}>
        <span className="expert-preview-fields" aria-hidden="true"><span/><span/><span/></span>
        <span className="expert-lock-label"><LockKeyhole size={17}/>Szakértői konzultáció része</span>
        <span className="expert-preview-link">Részletek és konzultáció <ArrowRight size={16}/></span>
      </button>
      <label className="expert-interest"><input type="checkbox" checked={selected.includes(t.id)} onChange={()=>onSelect(t.id)}/><span>Ez a terület is érint engem</span></label>
    </article>;})}</div>
    <p className="expert-selection-note">Az érintett területek megjelölése pontosítja az alapbecslés terjedelmét. A teljes elemzést szakértőnk végzi el a konzultáció keretében.</p>
    <dialog ref={dialog} className="consultation-dialog" aria-labelledby="consultation-title" onCancel={()=>setActive(null)} onClose={()=>setActive(null)} onClick={e=>{if(e.target===dialog.current)setActive(null);}}>
      <button type="button" className="icon-button consultation-close" aria-label="Konzultációs ablak bezárása" onClick={()=>setActive(null)}><X size={22}/></button>
      {topic&&<><span className="consultation-shield"><ShieldCheck size={30} strokeWidth={1.4}/></span><p className="eyebrow">{topic.title}</p><h2 id="consultation-title" tabIndex={-1}>Ez a szakmai szint<br/><em>egyedi vizsgálatot igényel.</em></h2><p className="consultation-intro">Az ingyenes becslés jó kiindulópont. {topic.detail}</p>
        <h3>Mit ad a szakértői konzultáció?</h3><ul className="consultation-benefits"><li>A teljes vagyoni struktúra és az alkalmazandó szabályok áttekintését.</li><li>A releváns korrekciók és jogszerű tervezési lehetőségek egyedi vizsgálatát.</li><li>A következő lépések szakértői meghatározását.</li></ul>
        <p className="consultation-service-note">A konzultációval az egyedi szakértői elemzést kezdeményezi.</p>
        <button type="button" className="button button-cyan" onClick={()=>{setActive(null);onContact(topic.id);}}>Szakértői konzultációt kérek <ArrowRight size={18}/></button>
        <button type="button" className="consultation-back" onClick={()=>setActive(null)}>Vissza az alapbecsléshez</button>
      </>}
    </dialog>
  </div>;
}
