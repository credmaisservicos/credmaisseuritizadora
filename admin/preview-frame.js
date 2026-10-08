'use strict';
(()=>{
 const CHANNEL='credmais-builder';const originals=new Map(),baselines=new Map();let heroBaseline={},selected='',lastScroll=0;
 const send=data=>parent.postMessage({channel:CHANNEL,...data},'*');
 const hero=document.querySelector('[data-cm-hero]');
 for(const el of document.querySelectorAll('[data-cm-section]'))originals.set(el.dataset.cmSection,el.cloneNode(true));
 const first=[...document.querySelectorAll('[data-cm-section]')][0];
 const marker=document.createComment('CredMais editable sections');if(first)first.before(marker);else if(hero)hero.after(marker);else document.querySelector('main')?.append(marker);
 const heroOriginal=hero?.cloneNode(true);let currentHero=hero;
 function pick(id,scroll){
  selected=id;for(const el of document.querySelectorAll('.cm-selected'))el.classList.remove('cm-selected');
  const target=id==='hero'?currentHero:[...document.querySelectorAll('[data-cm-section]')].find(el=>el.dataset.cmSection===id);target?.classList.add('cm-selected');
  if(scroll)target?.scrollIntoView({block:'start',behavior:'auto'});
 }
 function update(data){
  const y=scrollY;const page=data.page;
  if(heroOriginal){
   const fresh=heroOriginal.cloneNode(true);
   if(page.heroDirty){
    const h=fresh.querySelector('[data-cm-hero-title]'),p=fresh.querySelector('[data-cm-hero-text]'),a=fresh.querySelector('[data-cm-hero-button]');
    if(h){h.textContent=page.title;if(h.classList.contains('hero__title')){h.style.display='block';h.style.fontSize='clamp(36px,4.6vw,68px)';h.style.lineHeight='1.1';h.style.color=page.theme==='white'?'#0e2257':'white';}}if(p)p.textContent=page.description;if(a){a.textContent=page.button;a.href=page.buttonUrl||'#';}
    if(page.imageEdited){const media=data.images[page.imageId],img=fresh.querySelector('img');if(img&&media){for(const source of fresh.querySelectorAll('picture source'))source.remove();img.removeAttribute('srcset');img.src=media.url;}else if(img&&!media)img.style.visibility='hidden';}
    if(page.heroStyleFields?.includes('alignment'))fresh.classList.toggle('cm-hero-copy-right',page.alignment==='right');
    if(page.heroStyleFields?.includes('position')){for(const img of fresh.querySelectorAll('img'))img.style.objectPosition=page.position;}
    if(page.heroStyleFields?.includes('theme')){fresh.classList.add('cm-hero-theme-'+page.theme);fresh.style.setProperty('--cm-accent',data.brand.accent);fresh.style.setProperty('--cm-ink',data.brand.ink);fresh.style.setProperty('--cm-soft',data.brand.soft);}
   }
   fresh.hidden=page.visible===false;currentHero?.replaceWith(fresh);currentHero=fresh;
  }
  for(const el of document.querySelectorAll('[data-cm-section]'))el.remove();
  let cursor=marker;
  for(const record of data.sections){
   const s=record.config;if(s.visible===false)continue;let node;
   if(s.type==='original'){
    const source=originals.get(s.sourceId||s.id);if(!source)continue;node=source.cloneNode(true);node.dataset.cmSection=s.id;
    const baseline=baselines.get(s.sourceId||s.id),title=node.querySelector('[data-cm-title]'),text=node.querySelector('[data-cm-text]');
    if(title&&s.title!==baseline?.title)title.textContent=s.title;if(text&&s.text!==baseline?.text)text.textContent=s.text;
    for(const [index,item] of (s.items||[]).entries()){
      const original=baseline?.items?.[index];if(!original)continue;
      const heading=baseline.originalKind==='faq'?node.querySelectorAll('details summary')[index]:node.querySelectorAll('h3')[index];
      if(heading&&item.title!==original.title)heading.textContent=item.title;
      const paragraph=baseline.originalKind==='faq'?heading?.closest('details')?.querySelector('p'):heading?.parentElement.querySelector('p');
      if(paragraph&&item.text!==original.text)paragraph.textContent=item.text;
    }
    const img=node.querySelector('[data-cm-image]');if(s.imageEdited&&img){const media=data.images[s.imageId];if(media){for(const src of img.closest('picture')?.querySelectorAll('source')||[])src.remove();img.removeAttribute('srcset');img.src=media.url;img.alt=s.alt||media.name;}else img.remove();}
    if(s.spacing!=='normal')node.style.paddingBlock=s.spacing==='compact'?'40px':'128px';
    if(s.headingSize!=='normal'&&title)title.style.fontSize=s.headingSize==='small'?'36px':'72px';
    if(s.layout!=='left'){if(title)title.style.textAlign=s.layout;if(text)text.style.textAlign=s.layout;}
    if(s.theme!=='white'){node.classList.add('cm-original-theme');node.style.background=s.theme==='soft'?data.brand.soft:s.theme==='dark'?data.brand.ink:data.brand.accent;node.style.color=['dark','blue'].includes(s.theme)?'#fff':data.brand.ink;}
    if(s.button){const a=node.querySelector('a.button,a[class*="btn"],a[class*="cta"],a[class*="button"]');if(a){a.textContent=s.button;a.href=s.buttonUrl||'#';}}
   }else{const tpl=document.createElement('template');tpl.innerHTML=record.html;node=tpl.content.firstElementChild;}
   if(node){cursor.after(node);cursor=node;}
  }
  document.documentElement.dataset.cmWidth=page.pageStyle?.contentWidth||'normal';pick(data.selected,false);scrollTo(0,y);
 }
 window.addEventListener('message',event=>{
  if(event.source!==parent||event.data?.channel!==CHANNEL)return;const data=event.data;
  if(data.kind==='source'){for(const s of data.sections)baselines.set(s.id,s);heroBaseline=data.hero;requestAnimationFrame(()=>scrollTo(0,data.scroll||0));}
  if(data.kind==='update')update(data);
  if(data.kind==='select')pick(data.id,data.scroll);
 });
 document.addEventListener('click',event=>{
  if(event.target.closest('a,button'))event.preventDefault();
  const section=event.target.closest('[data-cm-section],[data-cm-hero]');if(section){const id=section.dataset.cmSection||'hero';pick(id,false);send({kind:'selected',id});}
 },true);
 document.addEventListener('submit',event=>event.preventDefault(),true);
 function syncHeader(){if(document.body.dataset.cmBrand==='securitizadora')document.querySelector('.header')?.classList.toggle('is-scrolled',scrollY>24);}
 window.addEventListener('scroll',()=>{syncHeader();if(Date.now()-lastScroll>180){lastScroll=Date.now();send({kind:'scroll',y:scrollY});}},{passive:true});
 syncHeader();
 send({kind:'ready'});
})();
