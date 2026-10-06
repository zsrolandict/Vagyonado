import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { newsletterPrivacyParagraphs } from './newsletterPrivacyText';

export default function NewsletterPrivacy({open,onClose}:{open:boolean;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close();},[open]);
  return <dialog ref={ref} className="privacy-dialog newsletter-privacy-dialog" aria-labelledby="newsletter-privacy-title" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
    <button type="button" className="dialog-close icon-button" onClick={onClose} aria-label="Hírlevél-tájékoztató bezárása"><X/></button>
    <h2 id="newsletter-privacy-title">Adatkezelési tájékoztató (GDPR)</h2>
    <div className="newsletter-policy-text">{newsletterPrivacyParagraphs.map((text,i)=>/^\d+\. /.test(text)?<h3 key={i}>{text}</h3>:<p key={i}>{text}</p>)}</div>
    <button type="button" className="button button-dark" onClick={onClose}>Elolvastam</button>
  </dialog>;
}
