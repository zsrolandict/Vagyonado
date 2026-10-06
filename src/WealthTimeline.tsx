import { useEffect, useRef } from 'react';
import { mountWealthTimeline } from './wealthTimeline';
import './wealthTimeline.css';

export default function WealthTimeline() {
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(host.current)return mountWealthTimeline(host.current);
  },[]);
  return <section id="vagyonmegoszlas" className="wealth-timeline-section section-pad" aria-labelledby="wealth-timeline-title">
    <div className="container">
      <div className="section-heading wealth-timeline-heading">
        <div><p className="eyebrow"><span/>VAGYON · PERSPEKTÍVA</p><h2 id="wealth-timeline-title">A vagyon változik.<br/><em>A teljes kép számít.</em></h2></div>
        <p>Illusztratív vagyonátrendeződési forgatókönyv.<br/>A bemutatott arányok szemléltető mintát követnek, nem jelentenek előrejelzést vagy jövőbeli adóbecslést.</p>
      </div>
      <div ref={host} className="wealth-timeline-card"/>
    </div>
  </section>;
}
