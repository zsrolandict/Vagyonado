import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
export default function ContactForm({onPrivacy}:{onPrivacy:()=>void}) {
  const [business,setBusiness]=useState(true);
  const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const [reference,setReference]=useState('');
  const [error,setError]=useState('');
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));
    setStatus('sending');setError('');
    try {const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,business,consent:data.consent==='on'})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Az űrlap elküldése nem sikerült.');setReference(result.reference);setStatus('success');form.reset();}
    catch(err){setError(err instanceof Error?err.message:'A kapcsolat megszakadt. Próbálja újra.');setStatus('error');}
  };
  return <div className="contact-form-card">{status==='success'?<div className="form-success" role="status"><CheckCircle2 size={44}/><h3>A tesztmegkeresést rögzítettük.</h3><p>Az űrlap működését sikeresen kipróbálta. A bemutató környezet nem küld értesítést az ICT Európának.</p><p className="reference">Hivatkozás: {reference}</p><a className="button button-cyan" href="https://icteuropa.hu/" target="_blank" rel="noreferrer">Valós kapcsolatfelvétel <ArrowUpRight size={17}/></a><button className="text-link" onClick={()=>setStatus('idle')}>Új tesztmegkeresés</button></div>:<form onSubmit={submit}>
    <h3>Vegye fel velünk<br/>a kapcsolatot!</h3><p className="form-intro">Beszéljük át a vagyonát érintő kérdéseket, és találjuk meg a következő lépést.</p>
    <p className="demo-form-note"><ShieldCheck size={15}/>Bemutató űrlap — kérjük, mintadatokkal próbálja ki. Valós megkereséshez keresse fel az <a href="https://icteuropa.hu/" target="_blank" rel="noreferrer">ICT Európa honlapját</a>.</p>
    <div className="field-grid"><label className="field"><span>Vezetéknév <b>*</b></span><input name="lastName" required autoComplete="family-name" maxLength={80} placeholder="Minta"/></label><label className="field"><span>Keresztnév <b>*</b></span><input name="firstName" required autoComplete="given-name" maxLength={80} placeholder="György"/></label></div>
    <div className="field-grid"><label className="field"><span>Telefonszám</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} pattern={'\\+?[0-9 \\(\\)\\/\\-]{6,30}'} placeholder="+36 20 123 4567"/></label><label className="field"><span>E-mail-cím <b>*</b></span><input name="email" required type="email" autoComplete="email" maxLength={254} placeholder="minta@pelda.hu"/></label></div>
    <label className="check-field business-toggle"><input type="checkbox" checked={business} onChange={e=>setBusiness(e.target.checked)}/><span>Vállalkozás kapcsán kérek segítséget</span></label>
    {business&&<><label className="field"><span>Cégnév <b>*</b></span><input required name="company" autoComplete="organization" maxLength={150} placeholder="Minta Kft."/></label><div className="field-grid form-radios"><fieldset><legend>Vállalkozási forma <b>*</b></legend>{['Bt.','Kft.','Zrt. / Nyrt.','Egyéb'].map(x=><label key={x}><input type="radio" name="companyType" value={x} required/>{x}</label>)}</fieldset><fieldset><legend>Éves nettó árbevétel <b>*</b></legend>{['100 millió Ft alatt','100–500 millió Ft','500 millió–2 milliárd Ft','2–5 milliárd Ft','5 milliárd Ft felett'].map(x=><label key={x}><input type="radio" name="revenue" value={x} required/>{x}</label>)}</fieldset></div></>}
    <label className="field"><span>Miben segíthetünk? <b>*</b></span><textarea name="message" required minLength={10} maxLength={2500} rows={4} placeholder="Milyen vagyontervezési, adózási vagy cégértékelési kérdést szeretne átbeszélni? Kérjük, ne adjon meg részletes vagyoni adatokat."/></label>
    <div className="honeypot" aria-hidden="true"><label>Honlap<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="check-field consent-field"><input name="consent" type="checkbox" required/><span>Elolvastam az <button type="button" onClick={onPrivacy}>adatkezelési tájékoztatót</button>, és hozzájárulok a tesztadatok kezeléséhez. <b>*</b></span></label>
    {status==='error'&&<p className="form-error" role="alert">{error}</p>}
    <button type="submit" disabled={status==='sending'} className="button button-cyan form-submit">{status==='sending'?<><LoaderCircle size={16} className="spin"/>Rögzítés…</>:<>Kérem a konzultációt <ArrowUpRight size={17}/></>}</button><small className="required-note">A csillaggal jelölt mezők kitöltése kötelező.</small>
  </form>}</div>;
}
