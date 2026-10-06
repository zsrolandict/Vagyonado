import { useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';

export default function Newsletter({onPrivacy,enabled=false}:{onPrivacy:()=>void;enabled?:boolean}) {
  const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const [error,setError]=useState('');
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!enabled)return;
    const form=e.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    setStatus('sending');setError('');
    try {
      const response=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,consent:data.consent==='on'})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'A feliratkozás nem sikerült.');
      setStatus('success');form.reset();
    } catch(err) {
      setError(err instanceof Error?err.message:'A kapcsolat megszakadt. Próbálja újra.');setStatus('error');
    }
  };
  return <section className="newsletter-section" aria-labelledby="newsletter-title"><div className="container newsletter-layout">
    <div><h2 id="newsletter-title">Iratkozzon fel hírlevelünkre!</h2>{!enabled&&<p id="newsletter-availability" className="newsletter-note">A feliratkozás hamarosan elérhető.</p>}</div>
    {status==='success'?<div className="newsletter-success" role="status"><CheckCircle2 size={24}/><div><strong>Sikeres feliratkozás!</strong><p>Köszönjük az érdeklődését.</p></div></div>:<form onSubmit={submit} aria-label="Hírlevél-feliratkozás">
      <label className="newsletter-consent"><input name="consent" type="checkbox" required/><span>Elfogadom az <button type="button" onClick={onPrivacy}>adatkezelési tájékoztatót</button></span></label>
      <div className="newsletter-fields">
        <label><span className="sr-only">Keresztnév</span><input name="firstName" required maxLength={80} autoComplete="given-name" placeholder="Keresztnév"/></label>
        <label><span className="sr-only">Vezetéknév</span><input name="lastName" required maxLength={80} autoComplete="family-name" placeholder="Vezetéknév"/></label>
        <label><span className="sr-only">E-mail-cím</span><input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email"/></label>
        <button type="submit" className="newsletter-submit" disabled={!enabled||status==='sending'} aria-describedby={!enabled?'newsletter-availability':undefined}>{status==='sending'?<><LoaderCircle size={16} className="spin"/>Feliratkozás…</>:'Feliratkozom!'}</button>
      </div>
      <div className="honeypot" aria-hidden="true"><label>Honlap<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <button type="button" className="newsletter-privacy-link" onClick={onPrivacy}>Elolvasom az adatkezelési tájékoztatót</button>
      {status==='error'&&<p className="newsletter-error" role="alert">{error}</p>}
    </form>}
  </div></section>;
}
