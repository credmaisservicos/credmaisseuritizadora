(() => {
 'use strict';
 const settings=window.CredMaisSiteConfig;if(!settings)return;
 let sequence=0,lastPath='',cache=new Map();
 const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
 const safeURL=value=>{try{const u=new URL(value,location.href);return ['http:','https:','mailto:','tel:'].includes(u.protocol)?value:'';}catch{return '';}};
 function image(node,media,alt){if(!node||!media||!safeURL(media.url))return;node.closest('picture')?.querySelectorAll('source').forEach(s=>s.remove());node.removeAttribute('srcset');node.src=media.url;node.alt=alt||media.name||'';}
 function safeHTML(html){
  const t=document.createElement('template');t.innerHTML=html||'';
  t.content.querySelectorAll('script,iframe,object,embed,link,style,form').forEach(e=>e.remove());
  t.content.querySelectorAll('*').forEach(e=>{for(const a of [...e.attributes]){if(a.name.startsWith('on')||a.name==='srcdoc'||(['href','src'].includes(a.name)&&!safeURL(a.value)))e.removeAttribute(a.name);}});
  return t.content.firstElementChild;
 }
 function apply(data,baseline){
  if(!data)return;const main=[...document.querySelectorAll('main')].at(-1);if(!main||main.dataset.cmApplied)return;main.dataset.cmApplied='true';
  const sections=[...main.querySelectorAll('section')].filter(s=>!s.parentElement.closest('section'));
  const hero=sections.find(s=>s.querySelector('h1'))||sections[0],native=sections.filter(s=>s!==hero&&s.querySelector('h2'));
  const originals=new Map(baseline.sections.map((s,i)=>[s.id,native[i]]));
  const images=Object.fromEntries((data.media||[]).map(m=>[m.id,m]));
  if(hero){
   hero.hidden=data.visible===false;
   const title=hero.querySelector('h1'),text=[...hero.querySelectorAll('p')].find(p=>p.textContent.trim().length>40),button=[...hero.querySelectorAll('a')].find(a=>/button|btn|cta/.test(a.className));
   if(title&&data.title!==baseline.title){title.textContent=data.title;if(title.classList.contains('hero__title')){title.style.display='block';title.style.fontSize='clamp(36px,4.6vw,68px)';title.style.lineHeight='1.1';title.style.color='white';}}
   if(text&&data.description!==baseline.description)text.textContent=data.description;
   if(button){if(data.button!==baseline.button)button.textContent=data.button;if(safeURL(data.buttonUrl))button.href=data.buttonUrl;}
   if(data.imageEdited)image(hero.querySelector('img'),images[data.imageId],data.title);
   if(data.heroStyleFields?.includes('position'))hero.querySelectorAll('img').forEach(i=>i.style.objectPosition=data.position);
   if(data.heroStyleFields?.includes('alignment'))hero.classList.toggle('cm-hero-copy-right',data.alignment==='right');
   if(data.heroStyleFields?.includes('theme')){hero.classList.add('cm-hero-theme-'+data.theme);hero.style.setProperty('--cm-ink',settings.brand.ink);hero.style.setProperty('--cm-accent',settings.brand.accent);hero.style.setProperty('--cm-soft',settings.brand.soft);}
  }
  const first=native[0],marker=document.createComment('CMS');if(first)first.before(marker);else hero?.after(marker);
  let cursor=marker;const used=new Set();
  for(const s of data.sections||[]){
   const base=baseline.sections.find(b=>b.id===(s.sourceId||s.id)),source=originals.get(s.sourceId||s.id);
   let node=s.type==='original'?source:safeHTML(s.rendered);
   if(!node||s.visible===false)continue;
   if(used.has(node)){node=node.cloneNode(true);node.querySelectorAll('[data-cm-bound]').forEach(f=>delete f.dataset.cmBound);}used.add(node);
   if(s.type==='original'&&base){
    const h=node.querySelector('h2'),p=[...node.querySelectorAll('p')].find(p=>p.textContent.trim().length>55);
    if(h&&s.title!==base.title)h.textContent=s.title;if(p&&s.text!==base.text)p.textContent=s.text;
    for(const [i,item]of(s.items||[]).entries()){
     const initial=base.items?.[i];if(!initial)continue;const heading=base.originalKind==='faq'?node.querySelectorAll('details summary')[i]:node.querySelectorAll('h3')[i];
     if(heading&&item.title!==initial.title)heading.textContent=item.title;
     const paragraph=base.originalKind==='faq'?heading?.closest('details')?.querySelector('p'):heading?.parentElement.querySelector('p');
     if(paragraph&&item.text!==initial.text)paragraph.textContent=item.text;
    }
    if(s.imageEdited)image(node.querySelector('img'),images[s.imageId],s.alt);
    if(s.spacing!=='normal')node.style.paddingBlock=s.spacing==='compact'?'40px':'128px';
    if(s.headingSize!=='normal'&&h)h.style.fontSize=s.headingSize==='small'?'36px':'72px';
    if(s.layout!=='left'){if(h)h.style.textAlign=s.layout;if(p)p.style.textAlign=s.layout;}
    if(s.theme!=='white'){const brand=settings.brand;node.classList.add('cm-original-theme');node.style.background=s.theme==='soft'?brand.soft:s.theme==='dark'?brand.ink:brand.accent;node.style.color=['dark','blue'].includes(s.theme)?'#fff':brand.ink;}
    if(s.button){const a=node.querySelector('a.button,a[class*="btn"],a[class*="cta"],a[class*="button"]');if(a){a.textContent=s.button;if(safeURL(s.buttonUrl))a.href=s.buttonUrl;}}
   }
   cursor.after(node);cursor=node;
  }
  for(const node of native)if(!used.has(node))node.remove();marker.remove();
  if(data.seoTitle)document.title=data.seoTitle;if(data.seoDescription){let meta=document.querySelector('meta[name=description]');if(!meta){meta=document.createElement('meta');meta.name='description';document.head.append(meta);}meta.content=data.seoDescription;}
  document.documentElement.dataset.cmWidth=data.pageStyle?.contentWidth||'normal';
  document.querySelectorAll('[data-cm-contact]').forEach(f=>window.CredMaisForms?.bind(f));
 }
 async function load(force=false){
  const path=location.pathname;if(!force&&path===lastPath)return;lastPath=path;const current=++sequence;
  try{
   if(!cache.has('baseline'))cache.set('baseline',await (await fetch(settings.baseline)).json());
   const baseline=cache.get('baseline').find(p=>p.path===path||(p.path==='/'&&path==='/index.html'));if(!baseline)return;
   const response=await fetch(settings.url+'/rest/v1/cms_public_pages?id=eq.'+encodeURIComponent(baseline.id)+'&select=published_content',{headers:{apikey:settings.anonKey},cache:'no-store'});
   if(!response.ok)return;const rows=await response.json();if(current!==sequence)return;
   apply(rows[0]?.published_content,baseline);
  }catch{/* Keep the original website available if the content service is offline. */}
 }
 window.CredMaisCMS={load};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>load());else load();
 addEventListener('popstate',()=>setTimeout(()=>load(),50));
})();
