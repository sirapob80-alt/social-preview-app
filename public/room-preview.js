(()=>{
 const cache=new Map();
 const style=document.createElement('style');
 style.textContent='.linkroom-preview{margin-top:8px}.linkroom-preview-card{display:inline-block;width:min(520px,88vw);text-align:left;background:#151821;border:1px solid #292e39;border-radius:16px;overflow:hidden}.linkroom-preview-card img{display:block;width:100%;max-height:620px;object-fit:cover;background:#0d0f14}.linkroom-preview-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px}.linkroom-preview-meta span{font-size:13px;color:#b7bdc9}.linkroom-preview-meta a{color:#8ea2ff;text-decoration:none;font-size:13px;font-weight:700}.linkroom-preview-fallback{padding:16px 13px;color:#a8aebb;font-size:13px}';
 document.head.appendChild(style);
 function igUrl(text){
  const m=String(text||'').match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
  return m?m[0]:'';
 }
 function makeCard(url,data){
  const wrap=document.createElement('div');
  wrap.className='linkroom-preview';
  const card=document.createElement('div');
  card.className='linkroom-preview-card';
  const images=data&&Array.isArray(data.images)?data.images:[];
  if(images[0]){
   const img=document.createElement('img');
   img.src=images[0];
   img.alt='Instagram preview';
   img.loading='lazy';
   card.appendChild(img);
  }else{
   const fallback=document.createElement('div');
   fallback.className='linkroom-preview-fallback';
   fallback.textContent='ดึงรูปจากโพสต์นี้ไม่ได้ แต่ยังเปิดโพสต์ต้นฉบับได้';
   card.appendChild(fallback);
  }
  const meta=document.createElement('div');
  meta.className='linkroom-preview-meta';
  const label=document.createElement('span');
  label.textContent='Instagram';
  const link=document.createElement('a');
  link.href=url;
  link.target='_blank';
  link.rel='noreferrer';
  link.textContent='เปิดโพสต์ ↗';
  meta.append(label,link);
  card.appendChild(meta);
  wrap.appendChild(card);
  return wrap;
 }
 async function enhanceMessage(msg){
  if(!msg||msg.dataset.previewChecked==='1')return;
  msg.dataset.previewChecked='1';
  const bubble=msg.querySelector('.bubble');
  if(!bubble)return;
  const url=igUrl(bubble.textContent);
  if(!url)return;
  try{
   let data=cache.get(url);
   if(!data){
    const r=await fetch('/api/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
    data=await r.json();
    cache.set(url,data);
   }
   if(msg.isConnected&&!msg.querySelector('.linkroom-preview'))msg.appendChild(makeCard(url,data));
  }catch{
   if(msg.isConnected&&!msg.querySelector('.linkroom-preview'))msg.appendChild(makeCard(url,{images:[]}));
  }
 }
 function scan(){
  document.querySelectorAll('#msgs .msg').forEach(enhanceMessage);
 }
 function start(){
  const root=document.getElementById('msgs');
  if(!root)return;
  scan();
  new MutationObserver(scan).observe(root,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
