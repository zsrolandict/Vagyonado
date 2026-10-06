import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import {expertTopics} from './expertTopics';
import type {ConsultationRequest,ExpertTopicId} from './expertTopics';
export default function ContactForm({onPrivacy,consultationRequest}:{onPrivacy:()=>void;consultationRequest:ConsultationRequest|null}) {
  const [business,setBusiness]=useState(false);
  const [topic,setTopic]=useState<ExpertTopicId|''>('');
  const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const [reference,setReference]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{if(consultationRequest){setTopic(consultationRequest.topic);setBusiness(consultationRequest.topic==='company');setStatus('idle');setError('');}},[consultationRequest]);
  const topicTitle=expertTopics.find(t=>t.id===topic)?.title;
  const prefix=topicTitle?`Konzultáció témája: ${topicTitle}\n\n`:'';
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));
    setStatus('sending');setError('');
    try {const message=prefix+String(data.message||'');if(message.length>2500)throw new Error('Kérjük, rövidítse az üzenetet, hogy a témával együtt legfeljebb 2 500 karakter legyen.');const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,message,business,consent:data.consent==='on'})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Az űrlap elküldése nem sikerült.');setReference(result.reference);setStatus('success');form.reset();}
    catch(err){setError(err instanceof Error?err.message:'A kapcsolat megszakadt. Próbálja újra.');setStatus('error');}
  };
  return <div className="contact-form-card">{status==='success'?<div className="form-success" role="status"><CheckCircle2 size={44}/><h3>A tesztmegkeresést rögzítettük.</h3><p>Az űrlap működését sikeresen kipróbálta. A bemutató környezet nem küld értesítést az ICT Európának.</p><p className="reference">Hivatkozás: {reference}</p><a className="button button-cyan" href="https://icteuropa.hu/" target="_blank" rel="noreferrer">Valós kapcsolatfelvétel <ArrowUpRight size={17}/></a><button className="text-link" onClick={()=>setStatus('idle')}>Új tesztmegkeresés</button></div>:<form onSubmit={submit}>
    <h3>Ne csak a vagyonadót számolja ki.<br/>Tervezze meg a következő lépést is!</h3><p className="form-intro">Egy gyors kalkuláció megmutatja a várható adóterhet. A részletes vizsgálat megmutatja, hogyan érinti mindez az Ön teljes vagyonát, vállalkozását és családi struktúráját. Szakértőink válaszokat adnak Önnek, vegye fel velünk a kapcsolatot!</p>
    <p className="demo-form-note"><ShieldCheck size={15}/>Bemutató űrlap — kérjük, mintadatokkal próbálja ki. Valós megkereséshez keresse fel az <a href="https://icteuropa.hu/" target="_blank" rel="noreferrer">ICT Európa honlapját</a>.</p>
    <label className="field consultation-topic-field"><span>Konzultáció témája</span><select id="consultation-topic" aria-label="Konzultáció témája" value={topic} onChange={e=>setTopic(e.target.value as ExpertTopicId|'')}><option value="">A teljes vagyoni kép áttekintése</option>{expertTopics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select><small>A kalkulátornál választott témakört itt is áttekintheti és módosíthatja. A megadott vagyonértékek Önnél maradnak.</small></label>
    <div className="field-grid"><label className="field"><span>Vezetéknév <b>*</b></span><input name="lastName" required autoComplete="family-name" maxLength={80} placeholder="Minta"/></label><label className="field"><span>Keresztnév <b>*</b></span><input name="firstName" required autoComplete="given-name" maxLength={80} placeholder="György"/></label></div>
    <div className="field-grid"><label className="field"><span>Telefonszám</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} pattern={'\\+?[0-9 \\(\\)\\/\\-]{6,30}'} placeholder="+36 20 123 4567"/></label><label className="field"><span>E-mail-cím <b>*</b></span><input name="email" required type="email" autoComplete="email" maxLength={254} placeholder="minta@pelda.hu"/></label></div>
    <label className="check-field business-toggle"><input type="checkbox" checked={business} onChange={e=>setBusiness(e.target.checked)}/><span>Vállalkozás kapcsán kérek segítséget</span></label>
    {business&&<><label className="field"><span>Cégnév <b>*</b></span><input required name="company" autoComplete="organization" maxLength={150} placeholder="Minta Kft."/></label><div className="field-grid form-radios"><fieldset><legend>Vállalkozási forma <b>*</b></legend>{['Bt.','Kft.','Zrt. / Nyrt.','Egyéb'].map(x=><label key={x}><input type="radio" name="companyType" value={x} required/>{x}</label>)}</fieldset><fieldset><legend>Éves nettó árbevétel <b>*</b></legend>{['100 millió Ft alatt','100–500 millió Ft','500 millió–2 milliárd Ft','2–5 milliárd Ft','5 milliárd Ft felett'].map(x=><label key={x}><input type="radio" name="revenue" value={x} required/>{x}</label>)}</fieldset></div></>}
    <label className="field"><span>Miben segíthetünk? <b>*</b></span><textarea name="message" required minLength={10} maxLength={2500-prefix.length} rows={4} placeholder="Milyen vagyontervezési, adózási vagy cégértékelési kérdést szeretne átbeszélni? Kérjük, ne adjon meg részletes vagyoni adatokat."/></label>
    <div className="honeypot" aria-hidden="true"><label>Honlap<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="check-field consent-field"><input name="consent" type="checkbox" required/><span>Elolvastam az <button type="button" onClick={onPrivacy}>adatkezelési tájékoztatót</button>, és hozzájárulok a tesztadatok kezeléséhez. <b>*</b></span></label>
    {status==='error'&&<p className="form-error" role="alert">{error}</p>}
    <button type="submit" disabled={status==='sending'} className="button button-cyan form-submit">{status==='sending'?<><LoaderCircle size={16} className="spin"/>Rögzítés…</>:<>Kérem a konzultációt <ArrowUpRight size={17}/></>}</button><small className="required-note">A csillaggal jelölt mezők kitöltése kötelező.</small>
  </form>}</div>;
}
