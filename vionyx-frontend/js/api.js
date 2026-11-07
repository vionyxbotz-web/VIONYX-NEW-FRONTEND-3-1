export const BASE=(window.VIONYX_API||'https://backend.vionyx.id').replace(/\/$/,'');
const K='vionyx_session';
export const session=()=>{try{return JSON.parse(localStorage.getItem(K))}catch{return null}};
export const setSession=s=>s?localStorage.setItem(K,JSON.stringify(s)):localStorage.removeItem(K);
// any .btn that triggers a request shows a spinner until the request finishes
let lastBtn=null,lastT=0;
document.addEventListener('click',e=>{const b=e.target.closest?.('button.btn,a.btn');lastBtn=b&&!b.hasAttribute('data-x')&&!b.disabled?b:null;lastT=Date.now()},true);
const mark=()=>{const b=lastBtn;if(!b||Date.now()-lastT>2000||!b.isConnected)return()=>{};b.dataset.p=(+b.dataset.p||0)+1;b.classList.add('loading');return()=>{b.dataset.p=Math.max(0,(+b.dataset.p||1)-1);if(!+b.dataset.p)b.classList.remove('loading')}};
export async function api(path,o={}){const done=mark();try{return await call(path,o)}finally{done()}}
async function call(path,{method='GET',body,auth=true}={}){
  const h={'Content-Type':'application/json'};const s=session();
  if(auth&&s?.token)h.Authorization='Bearer '+s.token;
  const r=await fetch(BASE+path,{method,headers:h,body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){
    if(d.code==='TOKEN_EXPIRED'||d.code==='INVALID_TOKEN'){setSession(null);location.assign('/login')}
    throw Object.assign(new Error(d.error||'Terjadi kesalahan'),{code:d.code,status:r.status});
  }
  return d;
}
// Server-issued captcha challenge (question + HMAC-signed token). The answer is verified by the backend.
export async function getCaptcha(purpose='auth'){const r=await fetch(`${BASE}/captcha/challenge?purpose=${encodeURIComponent(purpose)}`,{cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||!d.token)throw new Error(d.error||'Gagal memuat soal verifikasi');return d}
export const rp=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
