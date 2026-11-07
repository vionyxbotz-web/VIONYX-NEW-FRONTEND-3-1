import {esc,session,getCaptcha} from './api.js?v=20';
export const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
export const app=$('#app'),R={id:0};
export const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),3400)};
// page-level click delegation (never preventDefault)
export const click=fn=>{app.onclick=async e=>{try{await fn(e)}catch(x){toast(x.message)}}};
let router=null;export const setRouter=f=>router=f;
export const go=(p,replace)=>{if(location.pathname+location.search!==p)history[replace?'replaceState':'pushState']({},'',p);router&&router()};
const lv=[];export const onLeave=f=>lv.push(f);export const runLeave=()=>{lv.splice(0).forEach(f=>{try{f()}catch{}})};
export const guard=()=>{const s=session();if(!s){go('/login',true);return null}return s};
export const fmt=d=>{if(!d)return '-';const t=new Date(d);return isNaN(t)?String(d):t.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})};
export const badge=on=>`<span class="badge ${on?'on':'off'}"><i></i>${on?'ONLINE':'OFFLINE'}</span>`;
const svg=(p,s=20)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const I={
 bot:s=>svg('<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4M8.5 14h.01M15.5 14h.01"/>',s),plus:s=>svg('<path d="M12 5v14M5 12h14"/>',s),
 refresh:s=>svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',s),sliders:s=>svg('<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',s),
 wifi:s=>svg('<path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>',s),trash:s=>svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',s),
 coin:s=>svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',s),warn:s=>svg('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',s),
 copy:s=>svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',s),check:s=>svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>',s),x:s=>svg('<path d="M6 6l12 12M18 6L6 18"/>',s),
 server:s=>svg('<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',s),lock:s=>svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',s),
 user:s=>svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',s),info:s=>svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',s),
 chev:s=>svg('<path d="M9 6l6 6-6 6"/>',s),back:s=>svg('<path d="M15 6l-6 6 6 6"/>',s),search:s=>svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',s)};
// ---- cool liquid-glass modal ----
const stack=[];addEventListener('keydown',e=>{if(e.key==='Escape'){const m=stack[stack.length-1];if(m&&!m.lock)m.close()}});
export function modal(inner,{wide=false,danger=false}={}){
  const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="md${wide?' wide':''}${danger?' danger':''}" role="dialog" aria-modal="true">${inner}</div>`;
  document.body.append(o);document.documentElement.classList.add('lock');
  const m={root:o,el:o.firstElementChild,lock:false,$:s=>o.querySelector(s),$$:s=>[...o.querySelectorAll(s)],
    close(){o.classList.remove('in');const i=stack.indexOf(m);if(i>-1)stack.splice(i,1);setTimeout(()=>{o.remove();if(!document.querySelector('.ov'))document.documentElement.classList.remove('lock')},320)}};
  o.addEventListener('mousedown',e=>{if(e.target===o&&!m.lock)m.close()});
  o.addEventListener('click',e=>{if(e.target.closest('[data-x]'))m.close()});
  stack.push(m);requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add('in')));return m}
// ---- custom glass dropdown (replaces native <select> list) ----
export function enhance(root=app){$$('select',root).forEach(sel=>{if(sel.dataset.cs)return;sel.dataset.cs=1;const w=document.createElement('div'),b=document.createElement('button'),l=document.createElement('ul');
  w.className='cs';b.type='button';b.className='cs-b';l.className='cs-l';l.setAttribute('role','listbox');
  const sync=()=>{b.innerHTML=`<span>${esc(sel.options[sel.selectedIndex]?.textContent||'Pilih')}</span><i></i>`;[...l.children].forEach((li,i)=>li.classList.toggle('on',i===sel.selectedIndex))};
  [...sel.options].forEach((o,i)=>{const li=document.createElement('li');li.textContent=o.textContent;if(o.disabled)li.className='dis';li.onclick=()=>{if(o.disabled)return;sel.selectedIndex=i;sel.dispatchEvent(new Event('change',{bubbles:true}));sync();w.classList.remove('open')};l.append(li)});
  b.onclick=e=>{e.stopPropagation();const o=w.classList.toggle('open');$$('.cs.open').forEach(x=>x!==w&&x.classList.remove('open'));b.setAttribute('aria-expanded',o)};
  if(sel.disabled)b.disabled=true;sel.style.display='none';sel.after(w);w.append(b,l);sync()})}
document.addEventListener('click',()=>$$('.cs.open').forEach(x=>x.classList.remove('open')));

// ---- server-verified captcha widget: question comes from the backend, one fresh question per action ----
export const capHtml=(req=true)=>`<div class="capbox"><label data-cq>Memuat soal verifikasi...</label><input name="cap" inputmode="numeric" autocomplete="off" ${req?'required':''}></div>`;
export function capInit(root,purpose='auth'){let ch=null;const q=()=>root.querySelector('[data-cq]'),i=()=>root.querySelector('[name=cap]');
  const refresh=async()=>{ch=null;if(!q())return;q().textContent='Memuat soal verifikasi...';if(i())i().value='';
    try{const c=await getCaptcha(purpose);if(!q())return;ch=c;q().textContent='Verifikasi: '+c.question}catch{if(q()){q().innerHTML='Gagal memuat soal. <button type="button" class="lnk" data-cr>Muat ulang</button>';q().querySelector('[data-cr]').onclick=refresh}}};
  refresh();
  return{refresh,take:()=>{const a=(i()?.value||'').trim();if(!ch)throw new Error('Soal verifikasi belum siap, tunggu sebentar');if(!a)throw new Error('Isi jawaban verifikasi dulu');return{captchaToken:ch.token,captchaAnswer:a}}}}
