import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';

const html=readFileSync(process.argv[2]||'./Vagyonado-bemutato.html');
const server=createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const shares=page=>page.locator('.wealth-bubble').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.share)));
const scrub=(page,year)=>page.getByRole('slider',{name:'Vagyonmegoszlás éve'}).evaluate((input,value)=>{input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));},year);
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install();await page.goto(base);
  const widget=page.locator('.wealth-timeline-card');
  const slider=page.getByRole('slider',{name:'Vagyonmegoszlás éve'});
  await widget.waitFor();
  assert.deepEqual(await shares(page),[40,30,15,10,5]);
  assert.equal(await widget.getAttribute('data-playing'),'true');
  assert.equal(await page.locator('.wealth-bubble-property .wealth-bubble-value').count(),0);
  await page.clock.runFor(1510);assert.equal(await slider.inputValue(),'2028');
  await page.getByRole('button',{name:'Animáció szüneteltetése'}).click();
  await page.clock.runFor(3000);assert.equal(await slider.inputValue(),'2028');
  await scrub(page,2035);
  const middle=await shares(page);
  assert.ok(Math.abs(middle[0]-(40-20*8/23))<1e-9);
  assert.ok(Math.abs(middle.reduce((sum,value)=>sum+value,0)-100)<1e-9);
  assert.equal(await widget.getAttribute('data-playing'),'false');
  await page.getByRole('button',{name:'Animáció lejátszása'}).click();
  await page.clock.runFor(15*1500+50);
  assert.equal(await slider.inputValue(),'2050');
  assert.deepEqual(await shares(page),[20,5,60,10,5]);
  assert.equal(await widget.getAttribute('data-playing'),'false');
  await page.clock.runFor(5000);assert.equal(await slider.inputValue(),'2050');
  await page.getByRole('button',{name:'Animáció újraindítása'}).click();
  assert.equal(await slider.inputValue(),'2027');
  await slider.dispatchEvent('pointerdown');
  await page.clock.runFor(3000);assert.equal(await slider.inputValue(),'2027');
  await slider.press('End');assert.equal(await slider.inputValue(),'2050');
  assert.equal(await widget.getAttribute('data-playing'),'false');
  await slider.press('Home');assert.equal(await slider.inputValue(),'2027');
  const value=page.getByRole('spinbutton',{name:'Teljes vagyonelem számított értéke',exact:true});
  await value.fill('1500');await scrub(page,2050);
  assert.equal(await value.inputValue(),'1500');
  assert.match(await page.getByTestId('live-tax').textContent(),/5\s*000\s*000 Ft/);
  assert.deepEqual(errors,[]);await page.close();
  console.log('Idővonal: automatikus léptetés, Pause/Play, kézi és billentyűzetes évválasztás, 2050-es megállás és újraindítás sikeres. A kalkulátor adatai függetlenek.');

  for(const width of [1440,900,700,390,320]) {
    const view=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await view.goto(base);await view.evaluate(()=>document.fonts.ready);
    assert.equal(await view.locator('.wealth-timeline-card').getAttribute('data-playing'),'false');
    const originalHeight=await view.locator('.wealth-canvas').evaluate(el=>el.clientHeight);
    for(const year of [2027,2035,2050]) {
      await scrub(view,year);
      assert.ok(await view.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.equal(await view.locator('.wealth-canvas').evaluate(el=>el.clientHeight),originalHeight,'Lejátszás közben stabil marad a blokk magassága.');
      const boxes=await view.locator('.wealth-canvas').evaluate(canvas=>{
        const frame=canvas.getBoundingClientRect();
        return Array.from(canvas.querySelectorAll('.wealth-bubble')).map(bubble=>{
          const b=bubble.getBoundingClientRect(),title=bubble.querySelector('h3').getBoundingClientRect();
          return {id:bubble.dataset.category,diameter:b.width,x:b.x+b.width/2,y:b.y+b.height/2,inside:b.left>=frame.left-.5&&b.right<=frame.right+.5&&b.top>=frame.top-.5&&b.bottom<=frame.bottom+.5,titleInside:title.left>=b.left&&title.right<=b.right&&title.top>=b.top&&title.bottom<=b.bottom};
        });
      });
      for(const box of boxes){assert.ok(box.inside,`${width}px/${year}: ${box.id} a rajzterületen marad.`);assert.ok(box.titleInside,`${width}px/${year}: ${box.id} felirata elfér.`);}
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.ok(Math.hypot(boxes[i].x-boxes[j].x,boxes[i].y-boxes[j].y)>=(boxes[i].diameter+boxes[j].diameter)/2,`${width}px/${year}: a körök feliratai nem fedik egymást.`);
      if(year===2027)assert.ok(Math.abs((boxes[0].diameter/boxes[1].diameter)**2-4/3)<.002);
      if(year===2050)assert.ok(Math.abs((boxes[2].diameter/boxes[0].diameter)**2-3)<.002);
      if(width===1440||width===390)await view.locator('#vagyonmegoszlas').screenshot({path:`/tmp/wealth-${width}-${year}.png`});
    }
    console.log(`${width}px: arányhelyes körök, stabil magasság, olvasható feliratok, túlcsordulás nélkül.`);
    if(width===1440) {
      for(const [selector,path] of [['.hero-office-photo','public/images/Gemini_Generated_Image_uhcxrguhcxrguhcx.jpg'],['.site-header .brand-logo','LOGO.png']]) {
        const source=await view.locator(selector).getAttribute('src');assert.match(source,/^data:image\//);
        assert.equal(hash(Buffer.from(source.split(',')[1],'base64')),hash(readFileSync(path)),'A beágyazott kép az eredeti feltöltött fájl.');
      }
      assert.equal(await view.locator('.hero-office-photo').evaluate(img=>img.naturalWidth),2400);
      assert.equal(await view.locator('.site-header .brand-logo').evaluate(img=>img.naturalWidth),132);
      assert.equal(await view.locator('.footer-sources').count(),0);
      console.log('Az eredeti főkép és logó pontos bájttartalma beágyazva; a forrásblokk törölve maradt.');
    }
    await view.close();
  }
} finally {await browser.close();await new Promise(r=>server.close(r));}
