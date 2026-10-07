'use strict';
const $ = id => document.getElementById(id);
const keys = ['initial', 'monthly', 'years', 'rate', 'inflation'];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const presets = {student: [1000,150,10,7,2.5], steady:[10000,500,25,7,2.5], early:[0,100,40,7,2.5]};
const params = new URLSearchParams(location.search);
keys.forEach(key => {
  const input = $(key), raw = params.get(key), value = Number(raw);
  if (raw !== null && Number.isFinite(value) && value >= Number(input.min) && value <= Number(input.max)) input.value = String(key === 'years' ? Math.round(value) : value);
});
if(params.get('real') === '1') $('real').checked = true;
let current;
function settings(){return Object.fromEntries(keys.map(key => [key,Number($(key).value)]));}
function draw(series, comparison, low, high, real){
  const field = real ? 'real' : 'nominal', width=760,height=290,left=72,right=22,top=15,bottom=35;
  const maximum = Math.max(1,...high.map(x=>x[field]),...comparison.map(x=>x.value));
  const ceiling = maximum*1.08;
  const x = year => left + year/series.at(-1).year*(width-left-right);
  const y = value => height-bottom-value/ceiling*(height-top-bottom);
  const path = (rows,get) => rows.map((row,i)=>`${i?'L':'M'}${x(row.year).toFixed(2)},${y(get(row)).toFixed(2)}`).join(' ');
  let markup = '<title>Projected balance and contributions over time</title><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".18"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
  for(let i=0;i<=4;i++){const value=ceiling*i/4;markup+=`<line x1="${left}" x2="${width-right}" y1="${y(value)}" y2="${y(value)}" stroke="var(--grid)"/><text x="${left-12}" y="${y(value)+4}" text-anchor="end" fill="var(--muted)" font-size="11">${value>=1000000?'$'+(value/1000000).toFixed(1)+'m':value>=1000?'$'+Math.round(value/1000)+'k':money(value)}</text>`;}
  const horizon=series.at(-1).year;
  [...new Set([0,Math.round(horizon/4),Math.round(horizon/2),Math.round(horizon*3/4),horizon])].forEach(year=>{markup+=`<text x="${x(year)}" y="${height-8}" text-anchor="middle" fill="var(--muted)" font-size="11">${year===0?'Now':year+'y'}</text>`;});
  markup+=`<path d="${path(series,r=>r[field])} L${x(horizon)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#fill)"/>`;
  [low,high].forEach(rows=>{markup+=`<path d="${path(rows,r=>r[field])}" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 6" opacity=".7"/>`;});
  markup+=`<path d="${path(comparison,r=>r.value)}" fill="none" stroke="var(--muted)" stroke-width="2"/><path d="${path(series,r=>r[field])}" fill="none" stroke="var(--accent)" stroke-width="3"/><circle cx="${x(horizon)}" cy="${y(series.at(-1)[field])}" r="5" fill="var(--accent)"/>`;
  $('chart').innerHTML=markup;
}
function update(){
  for(const key of keys){const input=$(key);if(input.value===''||!Number.isFinite(Number(input.value))||Number(input.value)<Number(input.min)||Number(input.value)>Number(input.max)){input.setAttribute('aria-invalid','true');$('status').textContent='Enter an amount within the allowed range.';return;}input.removeAttribute('aria-invalid');}
  $('status').textContent='';
  const s=settings(),rows=ReturnLab.simulate(s),last=rows.at(-1),real=$('real').checked;
  current={s,rows};
  $('years-out').value=s.years+' years';$('rate-out').value=s.rate.toFixed(1)+'%';$('inflation-out').value=s.inflation.toFixed(1)+'%';
  $('value-label').textContent=real?'PROJECTED BALANCE · TODAY’S DOLLARS':'PROJECTED BALANCE · FUTURE DOLLARS';
  $('balance').textContent=money(real?last.real:last.nominal);
  $('summary').textContent=`${money(s.monthly)} a month · ${s.years} years · ${s.rate}% assumed annual return`;
  $('contributed').textContent=money(last.contributions);$('gain').textContent=money(last.nominal-last.contributions);$('real-value').textContent=money(last.real);
  const base=ReturnLab.simulate({...s,monthly:0}).at(-1).nominal;
  $('insight').innerHTML=`Your monthly deposits contribute <b>${money(last.contributions-s.initial)}</b> of principal and add <b>${money(last.nominal-base)}</b> to the final nominal balance, including their assumed growth.`;
  const comparison=rows.map(row=>({year:row.year,value:real?row.contributions/(1+s.inflation/100)**row.year:row.contributions}));
  draw(rows,comparison,ReturnLab.simulate({...s,rate:s.rate-2}),ReturnLab.simulate({...s,rate:s.rate+2}),real);
}
keys.forEach(key=>$(key).addEventListener('input',update));$('real').addEventListener('change',update);
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{keys.forEach((key,i)=>$(key).value=presets[button.dataset.preset][i]);update();}));
$('theme').addEventListener('click',()=>document.body.classList.toggle('light'));
$('share').addEventListener('click',async()=>{if(keys.some(key=>$(key).getAttribute('aria-invalid')==='true'))return;const url=new URL(location.href);keys.forEach(key=>url.searchParams.set(key,$(key).value));url.searchParams.set('real',$('real').checked?'1':'0');try{await navigator.clipboard.writeText(url.href);$('status').textContent='Scenario link copied.';}catch{window.prompt('Copy your scenario link:',url.href);}});
$('export').addEventListener('click',()=>{if(!current||keys.some(key=>$(key).getAttribute('aria-invalid')==='true'))return;const {s,rows}=current;const text='Starting amount,Monthly contribution,Years,Annual return percent,Inflation percent\n'+keys.map(key=>s[key]).join(',')+'\n\nYear,Nominal contributions,Nominal balance,Inflation adjusted balance\n'+rows.map(row=>[row.year,row.contributions,row.nominal,row.real].map(value=>value.toFixed(2)).join(',')).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='return-lab-scenario.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='CSV exported.';});
update();
