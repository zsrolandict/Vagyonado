import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

export async function verifyExpertFlow(page) {
  const type=page.getByRole('combobox',{name:'Vagyonelem típusa',exact:true}).first();
  assert.deepEqual(await type.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value)),['property','company','cash','vehicle']);
  assert.equal(await page.getByRole('spinbutton',{name:'Beszámoló szerinti saját tőke',exact:true}).count(),0);
  assert.equal(await page.getByRole('combobox',{name:'Adóalany',exact:true}).count(),0);
  assert.equal(await page.getByRole('combobox',{name:'Vagyonadó szerinti illetőség',exact:true}).count(),0);
  assert.equal(await page.locator('.expert-preview-fields input').count(),0);
  assert.equal(await page.locator('.expert-module').count(),3);
  const money=page.getByRole('spinbutton',{name:'Teljes vagyonelem számított értéke',exact:true}).first();
  const originalValue=await money.inputValue();
  const originalTax=await page.getByTestId('live-tax').textContent();
  const company=page.locator('.expert-module').filter({has:page.getByRole('heading',{name:'Cégértékelés és üzletrészek',exact:true})});
  await company.getByRole('checkbox').check();
  assert.match(await page.locator('.live-result .partial-scope-note-emphasized').textContent(),/Céges korrekciók/);
  assert.equal(await page.getByTestId('live-tax').textContent(),originalTax);
  const note=page.locator('.live-result .partial-scope-note-emphasized');
  await money.fill('600');assert.match(await page.getByTestId('live-tax').textContent(),/^0 Ft$/);
  assert.match(await note.textContent(),/További szakértői vizsgálatot jelölt meg/);
  await money.fill(originalValue);
  const dialog=page.getByRole('dialog',{name:'Ez a szakmai szint egyedi vizsgálatot igényel.'});
  const message=page.locator('.contact-form-card [name=message]');
  await message.fill('Ez egy megőrzendő tesztüzenet a konzultációhoz.');
  for(const [id,title] of [['company','Cégértékelés és üzletrészek'],['foreign','Külföldi vagyon és illetőség'],['family','Családi és vagyonkezelési struktúrák']]) {
    const trigger=page.getByRole('button',{name:`${title} — részletek és konzultáció`,exact:true});
    await trigger.focus();await trigger.press('Enter');await dialog.waitFor({state:'visible'});
    assert.match(await dialog.textContent(),new RegExp(title));
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await trigger.click();await dialog.getByRole('button',{name:'Vissza az alapbecsléshez',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    await trigger.click();await dialog.getByRole('button',{name:'Szakértői konzultációt kérek',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    await page.waitForFunction(()=>document.getElementById('consultation-topic')===document.activeElement);
    assert.equal(await page.getByRole('combobox',{name:'Konzultáció témája',exact:true}).inputValue(),id);
    assert.equal(await message.inputValue(),'Ez egy megőrzendő tesztüzenet a konzultációhoz.');
    assert.equal(await money.inputValue(),originalValue);
    assert.equal(await page.getByTestId('live-tax').textContent(),originalTax);
    assert.equal(await page.getByRole('checkbox',{name:'Vállalkozás kapcsán kérek segítséget'}).isChecked(),id==='company');
  }
  await page.getByRole('button',{name:'Családi és vagyonkezelési struktúrák — részletek és konzultáció',exact:true}).click();
  await page.mouse.click(1,1);await dialog.waitFor({state:'hidden'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log('Szakértői folyamat: ingyenes alaptípusok, részbecslés/0 Ft jelölése, három lezárt kártya, billentyűzet és bezárás, témaválasztás, megmaradó adatok.');
}

export async function verifyCompanyGate(page) {
  await page.getByRole('button',{name:'Vagyonelem hozzáadása',exact:true}).click();
  await page.getByRole('button',{name:'Társasági részesedés',exact:true}).click();
  const equity=page.getByRole('spinbutton',{name:'Beszámoló szerinti saját tőke',exact:true});
  await equity.fill('');await equity.pressSequentially('255');assert.equal(await equity.inputValue(),'255');
  const years=['Utolsó lezárt üzleti év','Előző lezárt üzleti év','Az azt megelőző lezárt üzleti év'];
  const profits=years.map(year=>page.getByRole('spinbutton',{name:`${year} adózott eredménye`,exact:true}));
  for(const [i,value] of ['-3.2','-8.9','0'].entries()){await profits[i].fill('');await profits[i].pressSequentially(value);assert.equal(await profits[i].inputValue(),value);}
  await profits[0].fill('');await profits[0].pressSequentially('-0.2');assert.equal(await profits[0].inputValue(),'-0.2');
  await profits[0].press('Tab');assert.match(await page.locator('.company-answer strong').textContent(),/85 M Ft/);
  assert.equal(await page.getByRole('alert').count(),0);
  await equity.fill('300');
  for(const [i,value] of [70,90,110].entries())await profits[i].fill(String(value));
  assert.match(await page.locator('.company-answer strong').textContent(),/500 M Ft/);
  assert.equal(await page.locator('.company-answer .limited-estimate-badge').textContent(),'KORLÁTOZOTT BECSLÉS');
  assert.equal(await page.locator('.live-result .limited-estimate-badge').textContent(),'KORLÁTOZOTT CÉGES BECSLÉS');
  await page.getByRole('spinbutton',{name:'Tulajdoni hányad',exact:true}).last().fill('40');
  assert.match(await page.getByTestId('live-tax').textContent(),/7\s*000\s*000 Ft/,'A kisebbségi korrekció nem lép életbe az ingyenes alapbecslésben.');
  assert.match(await page.locator('.live-result .partial-scope-note-emphasized').textContent(),/korrekciók nélküli/);
  await page.getByRole('button',{name:'Részletes eredmény',exact:true}).click();
  const resultDialog=page.getByRole('dialog',{name:'Így áll össze a becslése.'});
  await resultDialog.waitFor({state:'visible'});
  assert.match(await resultDialog.locator('.partial-scope-note').textContent(),/korlátozott becslés/);
  const download=page.waitForEvent('download');await resultDialog.getByRole('button',{name:'Kalkuláció letöltése'}).click();
  assert.match(readFileSync(await (await download).path(),'utf8'),/KORLÁTOZOTT CÉGES BECSLÉS/);
  await page.getByRole('button',{name:'Részletes eredmény bezárása'}).click();
  assert.equal(await page.getByRole('spinbutton',{name:'Rejtett tartalék, halasztott adó után',exact:true}).count(),0);
  assert.equal(await page.getByRole('spinbutton',{name:'Tőkében még szereplő osztalék',exact:true}).count(),0);
  const dialog=page.getByRole('dialog',{name:'Ez a szakmai szint egyedi vizsgálatot igényel.'});
  for(const label of ['Rejtett tartalék, halasztott adó után','Tőkében még szereplő osztalék']) {
    await page.getByRole('button',{name:`${label} — szakértői konzultáció`,exact:true}).click();
    await dialog.waitFor({state:'visible'});assert.match(await dialog.textContent(),/Cégértékelés és üzletrészek/);
    await dialog.getByRole('button',{name:'Vissza az alapbecsléshez'}).click();await dialog.waitFor({state:'hidden'});
    assert.equal(await equity.inputValue(),'300');assert.equal(await profits[0].inputValue(),'70');
    assert.match(await page.getByTestId('live-tax').textContent(),/7\s*000\s*000 Ft/);
  }
  await page.getByRole('button',{name:'Rejtett tartalék, halasztott adó után — szakértői konzultáció',exact:true}).click();
  await dialog.getByRole('button',{name:'Szakértői konzultációt kérek',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.getElementById('consultation-topic')===document.activeElement);
  assert.equal(await page.getByRole('combobox',{name:'Konzultáció témája',exact:true}).inputValue(),'company');
  await equity.fill('');await equity.pressSequentially('-0.2');assert.equal(await equity.inputValue(),'-0.2');
  assert.match(await page.getByRole('alert').textContent(),/Kérjen szakértői konzultációt/);
  await equity.fill('300');
  await page.getByRole('combobox',{name:'Lezárt üzleti évek száma',exact:true}).selectOption('2');
  assert.equal(await profits[2].count(),0);
  await profits[0].fill('45');await profits[1].fill('90');
  await page.getByText('Eltérő hosszúságú üzleti év?',{exact:true}).click();
  await page.getByRole('spinbutton',{name:'Utolsó lezárt üzleti év napjai',exact:true}).fill('182.5');
  assert.match(await page.locator('.company-answer strong').textContent(),/500 M Ft/);
  await page.locator('.company-consultation-gate').screenshot({path:`/tmp/vagyonado-company-gate-${page.viewportSize().width}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
  await profits[0].fill('');await profits[0].pressSequentially('-');
  await page.getByRole('combobox',{name:'Vagyonelem típusa',exact:true}).last().selectOption('cash');
  assert.equal(await page.getByRole('alert').count(),0,'Típusváltás után nem marad rejtett, hibás céges adat.');
  await page.getByRole('button',{name:'2. vagyonelem törlése',exact:true}).click();
  assert.match(await page.getByTestId('live-tax').textContent(),/5\s*000\s*000 Ft/);
  console.log('Céges alapbecslés: saját tőke, 1–3 lezárt év, negatív eredmény és évesítés; rejtett tartalék/osztalék konzultációs kapuja, változatlan adatok, kisebbségi korrekció nélkül.');
}
