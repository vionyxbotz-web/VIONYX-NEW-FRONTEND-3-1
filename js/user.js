import {api,session,rp,esc} from './api.js?v=20';
import {setMode} from './scene.js?v=20';
import {$,$$,app,click,toast,go,guard,R,onLeave,fmt,badge,I,modal,enhance,capHtml,capInit} from './ui.js?v=20';
const reload=()=>{R.silent=true;go(location.pathname+location.search)};
const hd=(t,sub,ic='bot')=>`<div class="ttl"><div class="ic grad">${I[ic](24)}</div><div><h2>${t}</h2><p>${sub}</p></div></div>`;
const stat=(ic,l,v,c='')=>`<div class="glass card stat"><div class="ic ${c}">${I[ic](22)}</div><div><label>${l}</label><div class="big">${v}</div></div></div>`;
const phoneOf=x=>x.phoneNumber||x.name||x.id||'?',typeOf=x=>x.type||x.botType||'Jadibot';
const botRow=(x,del)=>{const p=phoneOf(x),on=!!x.online;return `<div class="brow"><div class="av ${on?'on':''}">${esc(String(p)[0]).toUpperCase()}</div><div class="bi"><b>${esc(p)}</b><div class="bt">${badge(on)}<span class="tp">${esc(typeOf(x))}</span></div>${x.lastStatus?.at||x.lastOnline?`<small>Terakhir: ${esc(x.lastStatus?.at||fmt(x.lastOnline))}</small>`:''}</div>${del?`<button class="btn bad sm" data-del="${esc(p)}" data-ty="${esc(typeOf(x))}">${I.trash(15)}<span>Hapus</span></button>`:''}</div>`};
const empty=(t,s)=>`<div class="empty"><div class="ic grad">${I.bot(28)}</div><h3>${t}</h3><p>${s}</p></div>`;

// ================= DASHBOARD =================
async function dashboard(){
  const s=guard();if(!s)return;setMode('page');const u=s.username,my=R.id;
  const [b,l,h,d]=await Promise.allSettled([api('/coin/balance/'+u),api('/bot/list/'+u),api('/coin/history/'+u),api('/coin/deductions/'+u)]);
  if(my!==R.id)return;
  const coins=b.value?.coins??0,bots=l.value?.bots||[],tops=h.value?.topups||[],ded=d.value?.deductions||[],on=bots.filter(x=>x.online).length;
  const hist=t=>t?(ded.length?ded.map(x=>`<div class="li"><div><b>-${x.amount} koin</b><small>${esc(x.description||'Pemotongan koin')}${x.botPhone?` · ${esc(x.botPhone)}`:''}</small></div><span>${esc(fmt(x.createdAt))}</span></div>`).join(''):'<p class="mt">Belum ada pengurangan koin</p>')
    :(tops.length?tops.map(x=>{const c=typeof x.newBalance==='number'&&typeof x.previousBalance==='number'?x.newBalance-x.previousBalance:x.amount;return `<div class="li"><div><b>+${c} koin</b><small>${esc(x.method||'-')} · ${esc(x.status||'-')}</small></div><span>${esc(fmt(x.createdAt))}</span></div>`}).join(''):'<p class="mt">Belum ada riwayat top up</p>');
  app.innerHTML=`<div class="page"><div class="glass card pnl">${hd('Dashboard',`Halo, ${esc(u)}. Ringkasan akun dan bot kamu.`,'user')}</div>
  <div class="stats3">${stat('coin','Saldo Koin',coins,'gold')}${stat('wifi','Bot Aktif',on,'green')}${stat('plus','Total Top Up',tops.length)}</div>
  <div class="glass card pnl"><div class="hd2"><h3>Bot Kamu</h3><a class="btn sm" href="/manage-bot">Kelola Bot</a></div>${bots.length?`<div class="blist">${bots.map(x=>botRow(x,false)).join('')}</div>`:empty('Belum ada bot','Sambungkan nomor WhatsApp pertama kamu di halaman Kelola Bot.')}</div>
  <div class="glass card pnl"><h3>Riwayat Transaksi</h3><div class="tabs"><button class="tab on" data-t="0">Histori Top Up</button><button class="tab" data-t="1">Pengurangan Koin</button></div><div id="hist" class="hlist">${hist(0)}</div></div></div>`;
  click(e=>{const t=e.target.closest('.tab');if(!t)return;$$('.tab',app).forEach(x=>x.classList.toggle('on',x===t));$('#hist').innerHTML=hist(+t.dataset.t)});
}

// ================= MANAGE BOT =================
const LIM=5,WIN=5*60*1000,KEY='manage_bot_refresh_history';
const hist5=()=>{try{return (JSON.parse(sessionStorage.getItem(KEY))||[]).filter(t=>Date.now()-t<WIN)}catch{return[]}};
async function manage(){
  const s=guard();if(!s)return;setMode('page');const u=s.username,my=R.id;let bots=[],loading=true,spin=false;
  app.innerHTML=`<div class="page"><div class="glass card pnl"><div class="hd2">${hd('Kelola Bot','Sambungkan dan kelola bot WhatsApp Anda')}<div class="acts2"><button class="btn ghost sm" id="rf">${I.refresh(16)}<span>Refresh</span></button><button class="btn ghost sm" id="cf">${I.sliders(16)}<span>Config Bot</span></button><button class="btn sm" id="ad">${I.plus(16)}<span>TAMBAH BOT</span></button></div></div><div class="stats2" id="st"></div></div>
  <div class="glass card pnl" id="lst"></div>
  <div class="glass card pnl info-card"><div class="hd2"><div class="ttl"><div class="ic grad">${I.info(22)}</div><h3>Cara Menggunakan Bot</h3></div></div><div class="steps4">${[['Tambah Bot','Klik "TAMBAH BOT" dan masukkan nomor WhatsApp'],['Kode Pairing','Masukkan kode pairing ke aplikasi WhatsApp di HP tersebut'],['Bot Aktif','Bot otomatis aktif dan status berubah ONLINE'],['Koin Terpotong','Koin dipotong otomatis sesuai tarif selama bot aktif']].map((x,i)=>`<div class="st4"><span>${i+1}</span><div><b>${x[0]}</b><small>${x[1]}</small></div></div>`).join('')}</div></div></div>`;
  const draw=()=>{const on=bots.filter(x=>x.online).length,rem=LIM-hist5().length;
    $('#st').innerHTML=stat('bot','Total Bot',bots.length)+stat('wifi','Online',on,'green');
    $('#rf span').textContent=spin?'Refresh...':hist5().length?`Refresh (${rem}/${LIM})`:'Refresh';$('#rf').classList.toggle('spin',spin);
    $('#lst').innerHTML=`<div class="hd2"><div class="ttl"><div class="ic sm">${I.bot(20)}</div><h3>Daftar Bot</h3>${loading?'':`<span class="cnt">${bots.length} bot</span>`}</div>${!loading&&bots.length?`<small>${on} online · ${bots.length-on} offline</small>`:''}</div>`+
      (loading?'<div class="ld"><i class="spin"></i>Memuat daftar bot...</div>':bots.length?`<div class="blist">${bots.map(x=>botRow(x,true)).join('')}</div>`:empty('Belum ada bot','Klik "Tambah Bot" untuk menyambungkan nomor WhatsApp')+`<div style="text-align:center"><button class="btn" id="ad2">${I.plus(16)} TAMBAH BOT SEKARANG</button></div>`)};
  const load=async()=>{const r=await api('/bot/list/'+u);if(my!==R.id)return;bots=r.bots||[];loading=false;draw()};
  draw();load().catch(x=>{loading=false;draw();toast(x.message)});
  const t=setInterval(()=>load().catch(()=>{}),30000);onLeave(()=>clearInterval(t));
  const refresh=async()=>{const h=hist5();if(h.length>=LIM){const w=WIN-(Date.now()-h[0]);return toast(`Terlalu sering refresh. Coba lagi dalam ${Math.floor(w/60000)>0?Math.floor(w/60000)+' mnt ':''}${Math.ceil((w%60000)/1000)} detik.`)}
    if(spin)return;sessionStorage.setItem(KEY,JSON.stringify([...h,Date.now()]));spin=true;draw();try{await load();toast(`Status diperbarui. Sisa ${LIM-hist5().length}/${LIM}.`)}catch(x){toast(x.message)}spin=false;draw()};
  click(e=>{const c=e.target.closest('button');if(!c)return;
    if(c.id==='rf')refresh();else if(c.id==='cf')configModal(u);else if(c.id==='ad'||c.id==='ad2')addBot(u,()=>load().catch(()=>{}));
    else if(c.dataset.del)delBot(u,c.dataset.del,c.dataset.ty,()=>load().catch(()=>{}))});
}
// ---- Add bot popup: Input -> Proses -> Pairing -> Aktif ----
const stepper=a=>`<div class="stp">${['Input','Proses','Pairing','Aktif'].map((l,i)=>`<div class="sp ${i<a?'done':i===a?'cur':''}"><b>${i<a?I.check(14):i+1}</b><small>${l}</small></div>${i<3?'<hr>':''}`).join('')}</div>`;
function captcha(cb,purpose='bot'){const m=modal(`<div class="mh"><span class="ic grad">${I.lock(22)}</span><h3>Verifikasi Keamanan</h3><button class="mx" data-x aria-label="Tutup">${I.x(16)}</button></div><form class="mb">${capHtml()}<button class="btn">Verifikasi</button></form>`),f=m.$('form'),cw=capInit(f,purpose);
  f.onsubmit=e=>{e.preventDefault();try{const c=cw.take();m.close();cb(c)}catch(x){toast(x.message)}};setTimeout(()=>m.$('input')?.focus(),350)}
async function addBot(u,done){
  const m=modal(`<div class="mh"><span class="ic grad">${I.bot(22)}</span><h3 id="mt">Sambungkan Bot</h3><button class="mx" data-x aria-label="Tutup">${I.x(16)}</button></div><div class="mb" id="mb"><div class="ld"><i class="spin"></i>Memuat tipe bot...</div></div>`);
  const body=m.$('#mb'),title=m.$('#mt');let poll=null,types=[],all=[];const c0=m.close;m.close=()=>{clearInterval(poll);c0()};
  try{const r=await api('/bot/available-types/'+u);all=r.types||[];types=all.filter(t=>t.available)}catch{try{const r=await api('/bot/types',{auth:false});all=types=(r.bot_configs||[]).filter(t=>t.enabled!==false)}catch{}}
  const form=()=>{title.textContent='Sambungkan Bot';body.innerHTML=`${stepper(0)}<div><label>Nomor WhatsApp <span class="req">*</span></label><input id="ph" placeholder="628123456789" inputmode="numeric" autocomplete="off"><small>Format internasional (628...), tanpa + di depan</small></div>
  <div><label>Tipe Bot</label><select id="ty" ${types.length?'':'disabled'}>${types.length?types.map(t=>`<option value="${esc(t.type)}">${esc(t.type)} - ${esc(t.baseType)}</option>`).join(''):'<option value="">Belum ada tipe bot tersedia</option>'}</select></div><div id="ti"></div>
  <div class="info"><b>Yang Perlu Diketahui</b><ul id="il"></ul></div>
  <label class="chk"><input type="checkbox" id="ag"><i>${I.check(14)}</i><span>Saya memahami risiko penggunaan jadibot dan menyetujui pemotongan koin sesuai kebijakan</span></label>
  <div class="mf0"><button class="btn ghost" data-x>${I.x(16)} Batal</button><button class="btn" id="go" disabled>${I.wifi(16)} SAMBUNGKAN</button></div>`;
    enhance(m.el);const sel=$('#ty',m.el),info=()=>{const t=types.find(x=>x.type===sel.value);$('#ti',m.el).innerHTML=t?`<div class="info warn"><b>Base Type: ${esc(t.baseType)}</b>${t.isFree?'':`<div>Biaya: ${t.costPerFive||0} koin per 5 menit (dipotong otomatis selama bot online)</div>`}<div>Database akan di-share dengan bot Free/Coin yang sama di base type ini</div></div>`:'';
      $('#il',m.el).innerHTML=`<li>Nomor WA ini akan terhubung sebagai bot layanan</li>${t?.isFree?'<li>Bot Free tidak memotong koin</li>':`<li>Koin dipotong otomatis setiap 5 menit selama bot online</li><li>Biaya: ${t?.costPerFive||0} koin per 5 menit</li>`}<li>Anda akan mendapat kode pairing untuk dihubungkan ke WA</li><li>1 user hanya bisa memiliki 1 tipe bot (Free atau Potong Koin) per Base Type</li>`};
    info();sel.onchange=info;const ag=$('#ag',m.el),go_=$('#go',m.el);const chk=()=>go_.disabled=!(ag.checked&&sel.value);ag.onchange=chk;sel.addEventListener('change',chk);
    go_.onclick=()=>{const ph=$('#ph',m.el).value.replace(/\D/g,'');if(!ph)return toast('Masukkan nomor WhatsApp');if(!/^\d{9,15}$/.test(ph))return toast('Nomor harus 9-15 digit angka');captcha(c=>connect(ph,sel.value,c))};setTimeout(()=>$('#ph',m.el)?.focus(),350)};
  const fail=msg=>{title.textContent='Sambungkan Bot';body.innerHTML=`<div class="res bad"><div class="ic">${I.warn(30)}</div><h3>Koneksi Gagal</h3><p>${esc(msg)}</p></div><div class="mf0"><button class="btn ghost" data-x>${I.x(16)} Tutup</button></div>`};
  const connect=async(phone,type,c)=>{body.innerHTML=`${stepper(1)}<div class="res"><i class="spin big"></i><h3>Menghubungkan ke WhatsApp...</h3><p>Sedang meminta kode pairing, mohon tunggu</p></div>`;m.lock=true;
    try{let snap=null;const find=l=>(l.bots||[]).find(b=>[b.phoneNumber,b.phone,b.name,b.id].filter(Boolean).map(v=>String(v).replace(/\D/g,'')).includes(phone));
      try{snap=find(await api('/bot/list/'+u))?.lastStatus?.at||null}catch{}
      const r=await api('/bot/connect',{method:'POST',body:{username:u,phoneNumber:phone,type,...c}}),code=r?.data?.pairingCode||r?.data?.pairing||r?.pairingCode;
      if(!code){m.lock=false;return fail(r?.message||'Gagal mendapat kode pairing. Coba lagi.')}
      body.innerHTML=`${stepper(2)}<div class="pcode"><label>Kode Pairing Anda</label><div class="cd"><b>${esc(code)}</b><button class="btn ghost sm" id="cp" aria-label="Salin">${I.copy(16)}</button></div></div>
      <div class="info"><b>Langkah Menghubungkan</b><ol class="ol"><li>Buka WhatsApp di HP nomor <b>${esc(phone)}</b></li><li>Ketuk ikon <b>titik tiga</b> di pojok kanan atas</li><li>Pilih <b>Perangkat Tertaut</b></li><li>Ketuk <b>Tautkan Perangkat</b></li><li>Pilih <b>Tautkan dengan nomor telepon</b></li><li>Masukkan kode <b>${esc(code)}</b> lalu tekan <b>OK</b></li></ol></div><div class="wait"><i class="spin"></i>Menunggu bot tersambung...</div>`;
      $('#cp',m.el).onclick=()=>{navigator.clipboard?.writeText(code);toast('Kode pairing disalin')};
      const dl=Date.now()+5*60*1000;poll=setInterval(async()=>{try{const f=find(await api('/bot/list/'+u));if(f?.online===true){const at=f.lastStatus?.at||null;if(snap===null||at!==snap){clearInterval(poll);m.lock=false;title.textContent='Bot Berhasil Aktif!';body.innerHTML=`${stepper(3)}<div class="res ok"><div class="ic">${I.check(34)}</div><h3>Bot Berhasil Aktif!</h3><p>Nomor <b>${esc(phone)}</b> telah tersambung</p></div><div class="mf0"><button class="btn" id="fin">${I.check(16)} SELESAI</button></div>`;$('#fin',m.el).onclick=()=>{m.close();done()};toast('Bot aktif');done()}}if(Date.now()>dl)clearInterval(poll)}catch{}},3000);
    }catch(x){m.lock=false;if(/verifikasi/i.test(x.message||'')){body.innerHTML=`${stepper(0)}<div class="res bad"><div class="ic">${I.lock(30)}</div><h3>Verifikasi Gagal</h3><p>Jawaban salah atau soal kedaluwarsa. Soal sudah diganti.</p></div><div class="mf0"><button class="btn ghost" data-x>${I.x(16)} Tutup</button><button class="btn" id="rt">${I.lock(16)} Verifikasi lagi</button></div>`;const again=()=>captcha(c2=>connect(phone,type,c2));$('#rt',m.el).onclick=again;again();return}fail(x.message||'Terjadi kesalahan saat menghubungkan')}};
  form();
}
// ---- Delete popup ----
function delBot(u,phone,type,done){
  const m=modal(`<div class="mh"><span class="ic bad">${I.warn(22)}</span><h3>Hapus Bot?</h3><button class="mx" data-x aria-label="Tutup">${I.x(16)}</button></div><div class="mb"><div class="info bad"><b>${esc(phone)}</b><div>${esc(type)}</div></div><p>Sesi bot ini akan dihapus permanen dan bot berhenti berjalan. Tindakan ini tidak bisa dibatalkan.</p></div><div class="mf0"><button class="btn ghost" data-x>${I.x(16)} Batal</button><button class="btn bad" id="ok">${I.trash(16)} Ya, Hapus</button></div>`,{danger:true});
  $('#ok',m.el).onclick=async()=>{const b=$('#ok',m.el);b.disabled=true;b.textContent='Menghapus...';m.lock=true;try{await api('/bot/delete-session',{method:'DELETE',body:{username:u,phoneNumber:phone}});toast(`Bot ${phone} berhasil dihapus`);m.lock=false;m.close();done()}catch(x){m.lock=false;b.disabled=false;b.innerHTML=`${I.trash(16)} Ya, Hapus`;toast(x.message)}}
}
// ---- Config popup: pilih tipe -> form dinamis dari schema ----
const fieldsHtml=(schema,cfg,cat)=>Object.entries(schema).filter(([k,e])=>cat==='all'||e.category===cat).map(([k,e])=>{const v=cfg[k],dis=!e.editable,K=esc(k);let c;
  if(e.type==='boolean')c=`<label class="sw"><input type="checkbox" data-k="${K}" ${v?'checked':''} ${dis?'disabled':''}><i></i></label>`;
  else if(e.type==='array')c=`<div class="chips">${(Array.isArray(v)?v:[]).map((x,i)=>`<span class="chip">${esc(x)}${dis?'':`<button type="button" data-rm="${K}" data-i="${i}" aria-label="Hapus">${I.x(12)}</button>`}</span>`).join('')}</div>${dis?'':`<div class="row"><input data-add="${K}" placeholder="Tambah item..." style="flex:1"><button type="button" class="btn ghost sm" data-addb="${K}" aria-label="Tambah">${I.plus(16)}</button></div>`}`;
  else c=`<input data-k="${K}" type="${e.type==='number'?'number':'text'}" value="${esc(v??'')}" ${dis?'disabled':''}>`;
  return `<div class="fld"><div class="fl"><b>${esc(e.label||k)}</b>${dis?`<span class="lk">${I.lock(12)} terkunci</span>`:''}<small>${K}</small></div>${c}</div>`}).join('')||'<p>Tidak ada pengaturan.</p>';
export async function configModal(u){
  const m=modal(`<div class="mh"><span class="ic grad">${I.sliders(22)}</span><h3 id="mt">Pilih Tipe Bot</h3><button class="mx" data-x aria-label="Tutup">${I.x(16)}</button></div><div class="mb" id="mb"><div class="ld"><i class="spin"></i>Memuat tipe bot...</div></div>`,{wide:true});
  const body=m.$('#mb'),title=m.$('#mt');let types=[];
  const pick=async t=>{title.textContent=`Config ${t.type}`;body.innerHTML='<div class="ld"><i class="spin"></i>Memuat konfigurasi...</div>';
    try{const sc=await api(`/user/config-schema/${encodeURIComponent(u)}?configId=${encodeURIComponent(t.id)}`);const schema=sc.schema||{},cats=['all',...(sc.categories||[]).filter(Boolean)],cfg={};let cat='all';
      for(const [k,e] of Object.entries(schema))cfg[k]=e.value;
      try{const uc=await api(`/user/config/${encodeURIComponent(u)}?configId=${encodeURIComponent(t.id)}`);for(const [k,v] of Object.entries(uc.config||{}))if(schema[k])cfg[k]=v}catch{}
      const draw=()=>{$('#fl',m.el).innerHTML=fieldsHtml(schema,cfg,cat);$$('.catb',m.el).forEach(b=>b.classList.toggle('on',b.dataset.c===cat))};
      body.innerHTML=`<button class="btn ghost sm" id="bk" style="justify-self:start">${I.back(16)} Kembali</button><div class="cats">${cats.map(c=>`<button class="tab catb" data-c="${esc(c)}">${c==='all'?'Semua':esc(c)}</button>`).join('')}</div><div id="fl" class="flds"></div><div class="mf0" style="padding:0"><button class="btn ghost" data-x>${I.x(16)} Batal</button><button class="btn" id="sv">${I.check(16)} Simpan</button></div>`;draw();
      $('#bk',m.el).onclick=show;$$('.catb',m.el).forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
      const set=el=>{const k=el.dataset.k;if(!k)return;cfg[k]=el.type==='checkbox'?el.checked:schema[k]?.type==='number'?Number(el.value):el.value};
      body.addEventListener('input',e=>set(e.target));body.addEventListener('change',e=>set(e.target));
      const add=k=>{const i=$(`[data-add="${CSS.escape(k)}"]`,m.el),v=i.value.trim();if(!v)return;cfg[k]=[...(Array.isArray(cfg[k])?cfg[k]:[])];if(!cfg[k].includes(v))cfg[k].push(v);draw()};
      body.addEventListener('click',e=>{const r=e.target.closest('[data-rm]'),a=e.target.closest('[data-addb]');if(r){cfg[r.dataset.rm]=cfg[r.dataset.rm].filter((_,i)=>i!==+r.dataset.i);draw()}if(a)add(a.dataset.addb)});
      body.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.add){e.preventDefault();add(e.target.dataset.add)}});
      $('#sv',m.el).onclick=async()=>{const b=$('#sv',m.el);b.disabled=true;const out={};for(const [k,e] of Object.entries(schema))if(e.editable)out[k]=cfg[k];
        try{await api('/user/config/update',{method:'POST',body:{username:u,config:out,configId:t.id,botType:t.type,baseType:t.baseType}});toast('Konfigurasi tersimpan');m.close()}catch(x){toast(x.message);b.disabled=false}};
    }catch(x){body.innerHTML=`<div class="res bad"><div class="ic">${I.warn(30)}</div><h3>Gagal memuat</h3><p>${esc(x.message)}</p></div><button class="btn ghost" id="bk">${I.back(16)} Kembali</button>`;$('#bk',m.el).onclick=show}};
  const show=()=>{title.textContent='Pilih Tipe Bot';body.innerHTML=`<p>Pilih tipe bot yang ingin dikonfigurasi</p><div class="tlist">${types.map((t,i)=>`<button class="tcard" data-i="${i}"><span class="ic ${t.isFree?'green':'gold'}">${I.server(22)}</span><div><b>${esc(t.type)}</b><small>${esc(t.baseType)} · ${t.isFree?'Gratis':'Berbayar'}</small></div>${I.chev(18)}</button>`).join('')}</div>`;$$('.tcard',m.el).forEach(b=>b.onclick=()=>pick(types[+b.dataset.i]))};
  try{const r=await api('/user/bot-types-config',{auth:false});types=r.types||[];if(!types.length)throw new Error('Tidak ada tipe bot yang dikonfigurasi di Admin Dashboard');show()}catch(x){body.innerHTML=`<div class="res bad"><div class="ic">${I.warn(30)}</div><h3>Gagal memuat tipe bot</h3><p>${esc(x.message)}</p></div>`}
}

// ================= TOP UP + REDEEM =================
const loadSnap=()=>new Promise((ok,no)=>{if(window.snap)return ok();const s=document.createElement('script');s.src=(window.MIDTRANS_ENV==='sandbox'?'https://app.sandbox.midtrans.com':'https://app.midtrans.com')+'/snap/snap.js';s.dataset.clientKey=window.MIDTRANS_CLIENT_KEY||'';s.onload=ok;s.onerror=()=>no(new Error('snap.js gagal dimuat'));document.head.appendChild(s)});
async function pay(token,url,done){token=token||String(url||'').split('#')[0].split('?')[0].split('/').pop();
  try{if(!token||!window.MIDTRANS_CLIENT_KEY)throw 0;await loadSnap()}catch{if(url)location.href=url;else toast('Pembayaran tidak bisa dibuka');return}
  window.snap.pay(token,{onSuccess:()=>{toast('Pembayaran berhasil, koin segera masuk');done?.()},onPending:()=>{toast('Menunggu pembayaran selesai');done?.()},onError:()=>toast('Pembayaran gagal, coba lagi'),onClose:()=>done?.()})}
async function topup(){
  const s=guard();if(!s)return;setMode('page');const my=R.id;
  const [pk,ch,tx]=await Promise.all([api('/coin/packages',{auth:false}),api('/payment/channels',{auth:false}),api('/payment/transactions/'+s.username,{auth:false})]);if(my!==R.id)return;
  app.innerHTML=`<div class="page"><div class="glass card pnl">${hd('Top up koin','Pilih paket koin dan metode pembayaran','coin')}</div><div class="grid pk">${pk.packages.map(k=>`<div class="glass card"><div class="big">${k.coins}</div><p>koin</p><b>${rp(k.price)}</b><button class="btn sm" data-c="${k.coins}">Beli</button></div>`).join('')||'<p>Belum ada paket aktif.</p>'}</div>
  <div class="glass card"><label>Metode bayar</label><select id="pm">${ch.channels.filter(c=>c.active).map(c=>`<option value="${c.code}">${esc(c.name)}</option>`).join('')}</select><label>Nomor HP</label><input id="ph" placeholder="08xxxxxxxxxx" inputmode="tel"></div>
  <div class="glass card scroll"><h3>Riwayat transaksi</h3><table><tr><th>Referensi</th><th>Koin</th><th>Jumlah</th><th>Status</th><th></th></tr>${tx.transactions.map(t=>`<tr><td>${esc(t.reference)}</td><td>${t.coins}</td><td>${rp(t.amount)}</td><td>${esc(t.status)}</td><td>${t.isPayable?`<button class="btn sm" data-pay="${esc(t.checkout_url)}">Bayar</button>`:''}</td></tr>`).join('')}</table></div></div>`;
  click(async e=>{const u=e.target.dataset.pay;if(u)return pay(null,u,reload);const c=+e.target.dataset.c;if(!c)return;
    const r=await api('/payment/create-transaction',{method:'POST',body:{userId:s.username,username:s.username,email:s.email,phone:$('#ph').value,coins:c,paymentMethod:$('#pm').value}});pay(r.snap_token,r.checkout_url,reload)});
}
function redeem(){const s=guard();if(!s)return;setMode('page');
  app.innerHTML=`<div class="page" style="place-items:center;align-content:center"><div class="glass auth"><h2 style="margin-bottom:18px">Tukar kode redeem</h2><form><label>Kode</label><input name="code" required autocomplete="off">${capHtml()}<button class="btn">Tukar</button></form></div></div>`;
  const f=$('form',app),cw=capInit(f,'redeem');
  f.onsubmit=async e=>{e.preventDefault();try{const c=cw.take(),r=await api('/redeem/use',{method:'POST',body:{code:new FormData(f).get('code'),username:s.username,...c}});toast(`+${r.data.coinsAdded} koin. Saldo ${r.data.newBalance}`)}catch(x){toast(x.message)}finally{cw.refresh()}}}
export const userPages={'/dashboard':dashboard,'/manage-bot':manage,'/topup':topup,'/top-up':topup,'/redeem':redeem};
export {hd,stat,empty,botRow};
