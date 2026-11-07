import {api,session,setSession,rp,esc} from './api.js?v=20';
import {setMode,setProgress,ready,kick} from './scene.js?v=20';
import {$,$$,app,toast,go,R,setRouter,runLeave,enhance,capHtml,capInit} from './ui.js?v=20';
import {userPages} from './user.js?v=20';
import {adminPages} from './admin.js?v=20';
const wrap=fn=>async e=>{e?.preventDefault?.();try{await fn(e)}catch(x){toast(x.message)}};
const fd=f=>Object.fromEntries(new FormData(f));

let onScroll=null;
function showcase(){
  let tick=false;
  onScroll=()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;setProgress(Math.min(2.99,scrollY/Math.max(1,document.body.scrollHeight-innerHeight)*3))})};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(!CSS.supports('animation-timeline','view()')){
    const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
    $$('.panel:not(.plain),.feat .card,.steps li').forEach(el=>{el.classList.add('rvf');io.observe(el)});
  }
}
// navbar-only cursor highlight (cards have no cursor effects)
let pe=null,pq=false;
addEventListener('pointermove',e=>{pe=e;if(pq)return;pq=true;requestAnimationFrame(()=>{pq=false;const b=pe.target.closest?.('.bar');if(!b)return;const r=b.getBoundingClientRect();b.style.setProperty('--mx',(pe.clientX-r.left)+'px');b.style.setProperty('--my',(pe.clientY-r.top)+'px')})},{passive:true});

// ---------- nav (clean URLs) ----------
const norm=p=>p.replace(/\/+$/,'')||'/';
function nav(){const s=session(),p=norm(location.pathname),L=(h,t)=>`<a href="${h}" class="${p===h||(h==='/admin'&&p.startsWith('/admin'))?'on':''}">${t}</a>`;
  const N=$('#nav');N.classList.remove('open');
  const links=s?(s.role==='admin'?L('/admin','Admin'):L('/dashboard','Dashboard')+L('/manage-bot','Kelola Bot')+L('/topup','Top up')+L('/redeem','Redeem')):'';
  N.innerHTML=`<div class="scrim"></div><div class="bar"><a class="logo" href="/"><img src="/favicon/favicon-32x32.png" alt="" width="30" height="30">Vionyx</a>
  ${links?`<nav class="links" aria-label="Menu utama"><span class="ind"></span>${links}</nav>`:''}
  <div class="acts">${s?'<button class="btn ghost sm" id="out">Keluar</button>':'<a class="btn ghost sm hide-m" href="/login">Masuk</a><a class="btn sm hide-m" href="/register">Daftar gratis</a>'}<button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button></div></div>
  <div class="menu">${links}${s?'':'<a href="/login">Masuk</a><a href="/register" class="btn">Daftar gratis</a>'}</div>`;
  $$('.menu a',N).forEach((x,i)=>x.style.setProperty('--i',i));$('.scrim',N).onclick=()=>N.classList.remove('open');
  $('#out')?.addEventListener('click',()=>{setSession(null);N.classList.remove('open');go('/',true)});
  $('.burger').onclick=()=>{const o=N.classList.toggle('open');$('.burger').setAttribute('aria-expanded',o)};
  const ind=$('.ind',N),mv=x=>{if(!x){ind.style.opacity=0;return}ind.style.opacity=1;ind.style.left=x.offsetLeft+'px';ind.style.width=x.offsetWidth+'px'};
  if(ind){$$('.links a',N).forEach(x=>x.onmouseenter=()=>mv(x));$('.links',N).onmouseleave=()=>mv($('.links a.on',N));mv($('.links a.on',N))}}
{let on=false;addEventListener('scroll',()=>{const v=scrollY>20;if(v!==on){on=v;$('#nav').classList.toggle('scrolled',v)}},{passive:true})}
const scrollToId=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
$('#yr').textContent=new Date().getFullYear();

// ---------- public pages ----------
const pages={
async '/'(){
  setMode('landing');
  const my=R.id;
  const [st,tm,pk]=await Promise.allSettled([api('/admin/statistics',{auth:false}),api('/testimonial/list?limit=3',{auth:false}),api('/coin/packages',{auth:false})]);if(my!==R.id)return;
  const s=st.value||{},t=tm.value?.data?.testimonials||[],p=pk.value?.packages||[];
  const F=[['⚡','Online 24 jam','Bot berjalan terus di server kami. Status online dipantau lewat heartbeat, jadi kamu tahu kapan bot bermasalah.'],['🔗','Pairing code, tanpa QR','Cukup masukkan nomor dan salin kode 8 karakter ke WhatsApp. Bisa dari satu HP saja.'],['🪙','Bayar sesuai pemakaian','Tidak ada langganan bulanan. Koin dipotong otomatis berdasarkan jumlah grup bot setiap 5 menit.'],['🧩','Beberapa tipe bot','Pilih tipe bot yang cocok. Tersedia tipe gratis dan tipe potong koin.'],['🛠️','Kontrol penuh','Restart, sinkron status, dan hapus sesi langsung dari dashboard tanpa hubungi admin.'],['🔒','Akun aman','Verifikasi email dengan OTP, login berbasis token, dan pembatasan percobaan untuk mencegah penyalahgunaan.']];
  const Q=[['Apa itu jadibot?','Jadibot adalah bot yang berjalan di nomor WhatsApp milikmu sendiri, terhubung sebagai perangkat tertaut.'],['Bagaimana koin dipotong?','Untuk tipe berbayar, koin dipotong otomatis tiap 5 menit sesuai jumlah grup yang dikelola bot. Tipe gratis tidak memotong koin.'],['Metode pembayaran apa saja?','Top up koin lewat GoPay dan QRIS, diproses oleh Midtrans.'],['Saya punya kode redeem, bagaimana memakainya?','Masuk, buka menu Redeem, lalu masukkan kodenya. Koin langsung masuk ke saldo.'],['Butuh bantuan?','Kirim email ke vionyxbotz@gmail.com dan tim kami akan membalas.']];
  app.innerHTML=`
  <section class="sec hero"><div class="panel plain"><span class="pill" style="justify-self:start">Bot WhatsApp jadibot</span><h1>Bot WhatsApp yang jalan sendiri, 24 jam.</h1><p>Sambungkan nomor WhatsApp kamu, pilih tipe bot, dan bot langsung online. Bayar koin hanya untuk yang kamu pakai.</p><div class="row"><a class="btn" href="/register">Mulai gratis</a><a class="btn ghost" href="/" data-go="fitur">Lihat fitur</a></div>
  <div class="glass stats"><div><b>${s.totalUsers??'–'}</b><label>Pengguna</label></div><div><b>${s.totalActiveBots??'–'}</b><label>Bot online</label></div><div><b>${s.totalTopUps??'–'}</b><label>Top up</label></div></div></div></section>
  <section class="sec c" id="fitur"><div class="glass panel wide"><h2>Semua yang kamu butuhkan untuk bot WhatsApp</h2><div class="feat">${F.map(f=>`<div class="glass card"><div class="ic">${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></div>`).join('')}</div></div></section>
  <section class="sec r" id="kenapa"><div class="glass panel"><h2>Kenapa pilih Vionyx</h2><p><b>Hemat.</b> Kamu hanya membayar saat bot terpakai, tanpa paket bulanan yang terbuang.</p><p><b>Cepat.</b> Dari daftar sampai bot online cukup beberapa menit lewat kode pairing.</p><p><b>Transparan.</b> Riwayat top up dan potongan koin bisa kamu cek kapan saja.</p></div></section>
  <section class="sec" id="cara"><div class="glass panel"><h2>Cara kerja</h2><ol class="steps"><li><div><h3>Buat akun</h3><p>Daftar dengan email dan verifikasi OTP.</p></div></li><li><div><h3>Sambungkan nomor</h3><p>Pilih tipe bot, minta kode pairing, masukkan ke WhatsApp.</p></div></li><li><div><h3>Bot online</h3><p>Pantau dan atur dari dashboard. Top up koin kalau butuh tipe berbayar.</p></div></li></ol></div></section>
  <section class="sec c" id="harga"><div class="glass panel wide"><h2>Paket koin</h2><div class="feat">${p.map(k=>`<div class="glass card"><div class="big">${k.coins}</div><p>koin</p><b>${rp(k.price)}</b><a class="btn sm" href="/topup">Beli paket</a></div>`).join('')||'<p>Paket koin segera tersedia.</p>'}</div></div></section>
  <section class="sec c"><div class="glass panel wide"><h2>Kata pengguna</h2><div class="feat">${t.map(x=>`<div class="glass card"><p>“${esc(x.message)}”</p><b>${esc(x.username)}</b><span>${'★'.repeat(x.rating)}</span></div>`).join('')||'<p>Belum ada testimoni. Jadilah yang pertama setelah top up.</p>'}</div></div></section>
  <section class="sec" id="faq"><div class="glass panel wide"><h2>Pertanyaan umum</h2>${Q.map(q=>`<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('')}</div></section>
  <section class="sec c"><div class="glass panel"><h2>Siap menyalakan bot pertamamu?</h2><p>Daftar gratis dan sambungkan nomor dalam hitungan menit.</p><div class="row" style="justify-content:center"><a class="btn" href="/register">Buat akun</a><a class="btn ghost" href="mailto:vionyxbotz@gmail.com">Email support</a></div></div></section>`;
  showcase();
},
'/login'(){form('Masuk',`<label>Email</label><input name="email" type="email" required><label>Password</label><input name="password" type="password" required>${capHtml()}`,'Masuk',async f=>{
  const v=fd(f),c=f._cw.take();
  try{const u=await api('/auth/login',{method:'POST',auth:false,body:{email:v.email,password:v.password,...c}});
  setSession(u);go(u.role==='admin'?'/admin':'/dashboard')}finally{f._cw.refresh()}},`<a href="/reset-password">Lupa password?</a>`)},
'/register'(){form('Daftar',`<label>Username (3-20, huruf/angka/_/-)</label><input name="name" pattern="[a-zA-Z0-9_-]{3,20}" required><span id="un" class="pill" hidden></span><label>Email</label><input name="email" type="email" required><label>Password</label><input name="password" type="password" minlength="6" required><div class="row"><button type="button" class="btn ghost sm" id="otp">Kirim OTP</button><input name="otp" placeholder="6 digit OTP" maxlength="6" style="flex:1"></div>${capHtml()}`,'Buat akun',async f=>{
  const v=fd(f),c=f._cw.take();
  try{await api('/auth/verify-otp',{method:'POST',auth:false,body:{email:v.email,otp:v.otp}});
  await api('/auth/register',{method:'POST',auth:false,body:{email:v.email,password:v.password,name:v.name,otp:v.otp,...c}});toast('Akun dibuat, silakan masuk');go('/login')}finally{f._cw.refresh()}
  $('[name=name]',f).addEventListener('change',wrap(async()=>{const r=await api('/auth/check-username?username='+encodeURIComponent($('[name=name]',f).value),{auth:false});const u=$('#un');u.hidden=false;u.textContent=r.message}));
  $('#otp').onclick=wrap(async()=>{const v=fd(f),c=f._cw.take();try{const r=await api('/auth/request-otp',{method:'POST',auth:false,body:{email:v.email,name:v.name,...c}});toast(r.message)}finally{f._cw.refresh()}})})},
'/reset-password'(){form('Reset password',`<label>Email</label><input name="email" type="email" required><div class="row"><button type="button" class="btn ghost sm" id="otp">Kirim OTP</button><input name="otp" placeholder="6 digit OTP" maxlength="6" style="flex:1"></div>${capHtml(false)}<label>Password baru</label><input name="newPassword" type="password" minlength="6" required>`,'Simpan password',async f=>{
  const v=fd(f);await api('/auth/verify-otp',{method:'POST',auth:false,body:{email:v.email,otp:v.otp}});
  await api('/auth/reset-password',{method:'POST',auth:false,body:{email:v.email,newPassword:v.newPassword}});toast('Password diperbarui');go('/login')},'',f=>{
  $('#otp').onclick=wrap(async()=>{const c=f._cw.take();try{const r=await api('/auth/request-reset-otp',{method:'POST',auth:false,body:{email:fd(f).email,...c}});toast(r.message)}finally{f._cw.refresh()}})})}
};
const notFound=()=>{setMode('page');app.innerHTML=`<div class="page" style="place-items:center;align-content:center"><div class="glass auth" style="text-align:center"><h2>404</h2><p style="margin:12px auto 20px">Halaman tidak ditemukan.</p><a class="btn" href="/">Kembali ke beranda</a></div></div>`};
function form(title,fields,btn,onsub,extra='',bind){setMode('page');
  app.innerHTML=`<div class="page" style="place-items:center;align-content:center"><div class="glass auth"><h2 style="margin-bottom:18px">${title}</h2><form>${fields}<button class="btn">${btn}</button></form>${extra}</div></div>`;
  const f=$('form');f.onsubmit=wrap(()=>onsub(f));if($('[data-cq]',f))f._cw=capInit(f,'auth');bind?.(f)}
const routes={...pages,'/reset':pages['/reset-password'],...userPages,...adminPages};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function route(){const silent=R.silent,B=document.body,show=!silent&&B.classList.contains('ready'),my=++R.id,t0=Date.now();R.silent=false;
  if(show)B.classList.add('nav-loading');
  app.onclick=null;runLeave();kick();if(onScroll){removeEventListener('scroll',onScroll);onScroll=null}window.scrollTo(0,0);nav();
  try{await(routes[norm(location.pathname)]||notFound)()}catch(x){toast(x.message)}enhance(app);
  if(show)await sleep(Math.max(0,520-(Date.now()-t0)));
  if(my===R.id)B.classList.remove('nav-loading')}
setRouter(route);history.scrollRestoration='manual';
addEventListener('popstate',route);
// SPA link handling: real URLs, no #
document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||a.hasAttribute('download'))return;
  if(a.dataset.go){e.preventDefault();return scrollToId(a.dataset.go)}const h=a.getAttribute('href');if(!h||!h.startsWith('/')||h.startsWith('//'))return;e.preventDefault();$('#nav').classList.remove('open');go(h)});
addEventListener('keydown',e=>{if(e.key==='Escape')$('#nav').classList.remove('open')});
await Promise.race([Promise.all([route(),document.fonts.ready,ready,new Promise(r=>setTimeout(r,800))]),new Promise(r=>setTimeout(r,6000))]);
document.body.classList.add('ready');
