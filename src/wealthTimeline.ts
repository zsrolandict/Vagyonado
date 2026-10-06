// Framework-free DOM widget. Only the sample scenario drives this timeline.
const firstYear=2027;
const lastYear=2050;
const yearDuration=1500;
const categories=[
  {id:'property',label:'Ingatlanvagyon',start:40,end:20,icon:'<path d="M5 21 24 8l19 13M9 19v23h30V19M16 42V28h10v14M30 27h5v7M15 22h8M33 14V8h5v9"/>'},
  {id:'company',label:'Cégvagyon &amp; Üzletrészek',start:30,end:5,icon:'<path d="M9 42V12h24v30M33 23h7v19M5 42h39M18 42v-9h7v9M15 19h3m6 0h3M15 25h3m6 0h3M36 30h1m-1 6h1"/>'},
  {id:'finance',label:'Pénzügyi Eszközök',start:15,end:60,icon:'<path d="M8 7v34h34M14 32l9-11 8 5 11-14M34 12h8v8"/>'},
  {id:'art',label:'Műtárgyak &amp; Gyűjtemények',start:10,end:10,icon:'<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M12 15h24v18H12zM12 29l8-9 8 8 4-4 4 5M18 42h12"/><circle cx="30" cy="19" r="2"/>'},
  {id:'luxury',label:'Luxus Ingóságok &amp; Járművek',start:5,end:5,icon:'<path d="m6 29 5 9h25l7-14-16 5H6ZM15 29l4-10h13l5 7M22 19v-8h7v8M5 42c4-3 7 3 11 0s7 3 11 0 7 3 11 0 5 1 7 0"/>'},
];
const svg=(paths:string)=>`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const playIcon=svg('<path d="m18 12 18 12-18 12z"/>');
const pauseIcon=svg('<path d="M18 12v24M30 12v24"/>');
const number=new Intl.NumberFormat('hu-HU',{maximumFractionDigits:1});

export function mountWealthTimeline(host:HTMLElement) {
  host.innerHTML=`<div class="wealth-canvas" role="group" aria-label="A mintaforgatókönyv vagyonmegoszlása">
    ${categories.map(c=>`<div class="wealth-bubble wealth-bubble-${c.id}" data-category="${c.id}" role="img"><div class="wealth-bubble-content">${svg(c.icon)}<h3>${c.label}</h3>${c.id==='property'?'':'<span class="wealth-bubble-value"></span>'}</div></div>`).join('')}
    </div>
    <div class="wealth-controls">
      <div class="wealth-controls-top"><p>Vagyonmegoszlás idővonala <span>2027–2050</span></p><output for="wealth-year-range" data-wealth-year>${firstYear}</output></div>
      <div class="wealth-slider-row"><button type="button" class="wealth-play" aria-label="Animáció lejátszása" aria-pressed="false">${playIcon}</button><div class="wealth-slider-track"><input id="wealth-year-range" type="range" min="${firstYear}" max="${lastYear}" step="1" value="${firstYear}" aria-label="Vagyonmegoszlás éve"/><div class="wealth-year-ticks" aria-hidden="true"><span>2027</span><span>2035</span><span>2042</span><span>2050</span></div></div></div>
      <p class="wealth-controls-hint">1 év = 1,5 másodperc · Az idővonal mozgatásával megállíthatja az animációt.</p>
    </div>`;
  const canvas=host.querySelector<HTMLElement>('.wealth-canvas')!;
  const bubbles=Array.from(host.querySelectorAll<HTMLElement>('.wealth-bubble'));
  const slider=host.querySelector<HTMLInputElement>('input[type=range]')!;
  const button=host.querySelector<HTMLButtonElement>('.wealth-play')!;
  const output=host.querySelector<HTMLOutputElement>('output')!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sizeRatios=Array.from({length:lastYear-firstYear+1},(_,year)=>categories.map(c=>Math.sqrt((c.start+(c.end-c.start)*year/(lastYear-firstYear))/60)));
  const compactBudget=Math.max(...sizeRatios.map(s=>s[0]+s[1]+s[2]+Math.max(s[3],s[4])));
  const wideBudget=Math.max(...sizeRatios.map(s=>Math.max(s[0],s[1])+Math.max(...s.slice(2))));
  let year=firstYear;
  let playing=false;
  let timer:number|undefined;

  function render() {
    const progress=(year-firstYear)/(lastYear-firstYear);
    const shares=categories.map(c=>c.start+(c.end-c.start)*progress);
    // Round the displayed percentages together so they still total 100%.
    const tenths=shares.map(value=>Math.floor(value*10));
    const order=shares.map((value,i)=>({i,fraction:value*10-tenths[i]})).sort((a,b)=>b.fraction-a.fraction);
    const remainder=1000-tenths.reduce((sum,value)=>sum+value,0);
    for(let i=0;i<remainder;i++)tenths[order[i].i]++;
    const width=canvas.clientWidth;
    const compact=width<700;
    const padding=compact?12:28;
    const gap=compact?18:28;
    const maxDiameter=compact?Math.min(340,width-padding*2):Math.min(390,(width-padding*2-gap*2)/(1+Math.sqrt(10/60)+Math.sqrt(5/60)));
    const diameters=shares.map(value=>maxDiameter*Math.sqrt(value/60));
    const positions:{x:number;y:number}[]=Array(5);
    let height:number;
    if(compact) {
      let top=padding;
      for(let i=0;i<3;i++) {
        const shift=Math.max(0,Math.min(20,(width-diameters[i])/2-padding));
        positions[i]={x:width/2+(i===0?-shift:i===1?shift:0),y:top+diameters[i]/2};
        top+=diameters[i]+gap;
      }
      const rowWidth=diameters[3]+diameters[4]+gap;
      const left=(width-rowWidth)/2;
      const rowHeight=Math.max(diameters[3],diameters[4]);
      positions[3]={x:left+diameters[3]/2,y:top+rowHeight/2};
      positions[4]={x:left+diameters[3]+gap+diameters[4]/2,y:top+rowHeight/2};
      height=top+rowHeight+padding;
    } else {
      const upperHeight=Math.max(diameters[0],diameters[1]);
      const lowerHeight=Math.max(...diameters.slice(2));
      const upperWidth=diameters[0]+diameters[1]+gap;
      const lowerWidth=diameters[2]+diameters[3]+diameters[4]+gap*2;
      const top=padding+12;
      let left=(width-upperWidth)/2;
      for(let i=0;i<2;i++) {
        positions[i]={x:left+diameters[i]/2,y:top+upperHeight/2};left+=diameters[i]+gap;
      }
      left=(width-lowerWidth)/2;
      const rowY=top+upperHeight+gap+lowerHeight/2+12;
      for(let i=2;i<5;i++) {
        positions[i]={x:left+diameters[i]/2,y:rowY+(i===3?-12:i===4?8:0)};left+=diameters[i]+gap;
      }
      height=rowY+lowerHeight/2+padding+16;
    }
    const stableHeight=maxDiameter*(compact?compactBudget:wideBudget)+(compact?padding*2+gap*3:padding*2+gap+40);
    const offset=(stableHeight-height)/2;
    positions.forEach(p=>{p.y+=offset;});
    canvas.style.height=`${stableHeight}px`;
    canvas.dataset.year=String(year);
    bubbles.forEach((bubble,i)=>{
      const diameter=diameters[i];
      bubble.style.setProperty('--bubble-size',`${diameter}px`);
      bubble.style.width=`${diameter}px`;bubble.style.height=`${diameter}px`;
      bubble.style.left=`${positions[i].x}px`;bubble.style.top=`${positions[i].y}px`;
      bubble.dataset.share=String(shares[i]);
      const label=categories[i].label.replace(/&amp;/g,'&');
      bubble.setAttribute('aria-label',`${label}: ${number.format(tenths[i]/10)}%`);
      const value=bubble.querySelector<HTMLElement>('.wealth-bubble-value');
      if(value)value.textContent=`${number.format(tenths[i]/10)}%`;
    });
    slider.value=String(year);slider.setAttribute('aria-valuetext',`${year}. év`);
    slider.style.setProperty('--timeline-progress',`${progress*100}%`);
    output.value=String(year);
  }
  function updateButton() {
    button.innerHTML=playing?pauseIcon:playIcon;
    button.setAttribute('aria-label',playing?'Animáció szüneteltetése':year===lastYear?'Animáció újraindítása':'Animáció lejátszása');
    button.setAttribute('aria-pressed',String(playing));
    host.dataset.playing=String(playing);
  }
  function pause() {
    if(timer!==undefined)window.clearInterval(timer);
    timer=undefined;playing=false;updateButton();
  }
  function play() {
    if(playing)return;
    if(year===lastYear){year=firstYear;render();}
    playing=true;updateButton();
    timer=window.setInterval(()=>{
      year++;render();if(year===lastYear)pause();
    },yearDuration);
  }
  const toggle=()=>playing?pause():play();
  const scrub=()=>{pause();year=Number(slider.value);render();};
  const changeMotion=()=>{if(motion.matches)pause();};
  button.addEventListener('click',toggle);
  slider.addEventListener('pointerdown',pause);
  slider.addEventListener('keydown',pause);
  slider.addEventListener('input',scrub);
  motion.addEventListener('change',changeMotion);
  let previousWidth=canvas.clientWidth;
  const resize=new ResizeObserver(()=>{
    if(canvas.clientWidth!==previousWidth){previousWidth=canvas.clientWidth;render();}
  });resize.observe(canvas);
  render();if(!motion.matches)play();else updateButton();
  return ()=>{
    pause();resize.disconnect();motion.removeEventListener('change',changeMotion);
    button.removeEventListener('click',toggle);slider.removeEventListener('pointerdown',pause);
    slider.removeEventListener('keydown',pause);slider.removeEventListener('input',scrub);
    host.replaceChildren();
  };
}
