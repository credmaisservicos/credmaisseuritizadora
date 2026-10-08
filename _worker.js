(function(root){
 'use strict';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const https=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const path=value=>{const v=String(value||'/');return v.startsWith('/')&&!v.startsWith('//')&&!/[\s?#]/.test(v)?v:'/';};
 function canonical(site,page){const cleaned=path(page.path).replace(/\/index\.html$/,'/').replace(/\.html$/,'');return https(page.seo?.canonical)||site.origin+cleaned;}
 function indexable(site,page){return site.indexing!==false&&!page.seo?.noindex&&!/^\/(admin|login)(\/|$)/.test(page.path);}
 function meta(site,page){
  const title=String(page.seoTitle||page.seo?.title||page.name+' | '+site.name).trim().slice(0,120);
  const description=String(page.seoDescription||page.seo?.description||page.description||site.description||'').trim().slice(0,350);
  const url=canonical(site,page),image=https(page.seo?.image||site.socialImage);
  const robots=(indexable(site,page)?'index':'noindex')+','+(page.seo?.nofollow?'nofollow':'follow')+',max-image-preview:large';
  const org={'@type':'Organization','@id':site.origin+'/#organization',name:site.name,url:site.origin+'/',...(https(site.logo)?{logo:site.logo}:{}),...(site.sameAs?.length?{sameAs:site.sameAs.filter(https)}:{})};
  const graph=[org,{'@type':'WebSite','@id':site.origin+'/#website',url:site.origin+'/',name:site.name,inLanguage:'pt-BR',publisher:{'@id':org['@id']}},{'@type':page.path.includes('contato')||page.path==='/ajuda'?'ContactPage':page.path.includes('sobre')?'AboutPage':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'pt-BR',isPartOf:{'@id':site.origin+'/#website'},...(image?{primaryImageOfPage:{'@type':'ImageObject',url:image}}:{})}];
  if(page.path!=='/')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:site.origin+'/'},{'@type':'ListItem',position:2,name:page.name,item:url}]});
  if(page.path.startsWith('/servicos/'))graph.push({'@type':'Service',name:page.name,description,url,provider:{'@id':org['@id']}});
  if(page.path.startsWith('/blog/'))graph.push({'@type':'BlogPosting',headline:page.name,description,mainEntityOfPage:{'@id':url+'#webpage'},publisher:{'@id':org['@id']},inLanguage:'pt-BR',...(image?{image:[image]}:{})});
  return {title,description,url,image,robots,schema:{'@context':'https://schema.org','@graph':graph}};
 }
 function head(site,page){const m=meta(site,page);return `<title data-cm-seo>${escape(m.title)}</title><meta data-cm-seo name="description" content="${escape(m.description)}"><meta data-cm-seo name="robots" content="${m.robots}"><link data-cm-seo rel="canonical" href="${escape(m.url)}"><meta data-cm-seo property="og:type" content="website"><meta data-cm-seo property="og:locale" content="pt_BR"><meta data-cm-seo property="og:site_name" content="${escape(site.name)}"><meta data-cm-seo property="og:title" content="${escape(m.title)}"><meta data-cm-seo property="og:description" content="${escape(m.description)}"><meta data-cm-seo property="og:url" content="${escape(m.url)}"><meta data-cm-seo name="twitter:card" content="${m.image?'summary_large_image':'summary'}"><meta data-cm-seo name="twitter:title" content="${escape(m.title)}"><meta data-cm-seo name="twitter:description" content="${escape(m.description)}">${m.image?`<meta data-cm-seo property="og:image" content="${escape(m.image)}"><meta data-cm-seo property="og:image:alt" content="${escape(page.seo?.imageAlt||site.name)}"><meta data-cm-seo name="twitter:image" content="${escape(m.image)}">`:''}${site.verification?`<meta data-cm-seo name="google-site-verification" content="${escape(site.verification)}">`:''}<script data-cm-seo type="application/ld+json">${JSON.stringify(m.schema).replace(/</g,'\\u003c')}</script>`;}
 function robots(site){const blocked=['/admin/','/login',...(site.disallow||[])].map(path);return 'User-agent: *\n'+(site.indexing===false?'Disallow: /\n':blocked.map(p=>'Disallow: '+p).join('\n')+'\n')+'\nSitemap: '+site.origin+'/sitemap.xml\n';}
 function sitemap(site,pages){const seen=new Set();return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.filter(p=>indexable(site,p)).map(p=>{const url=canonical(site,p);if(!url.startsWith(site.origin+'/')||seen.has(url))return '';seen.add(url);const at=p.publishedAt||p.published_at;return '<url><loc>'+escape(url)+'</loc>'+(at&&!isNaN(Date.parse(at))?'<lastmod>'+new Date(at).toISOString()+'</lastmod>':'')+'</url>';}).join('\n')+'\n</urlset>\n';}
 root.CredMaisSEO={escape,https,path,canonical,indexable,meta,head,robots,sitemap};
})(globalThis);

const SITE="securitizadora";
const DEFAULTS={"site": {"name": "CredMais Securitizadora", "origin": "https://sejacredmais.com", "description": "Soluções para o caixa e as vendas da empresa.", "indexing": true, "disallow": [], "verification": "", "socialImage": "https://sejacredmais.com/admin/media/securitizadora-1.webp", "logo": "https://sejacredmais.com/assets/img/logo.png", "sameAs": ["https://www.instagram.com/credmais.sa/"]}, "pages": [{"id": "securitizadora-0", "path": "/", "name": "Início", "seoTitle": "CredMais | Soluções para recebíveis e vendas da sua empresa", "seoDescription": "A CredMais antecipa o que a sua empresa tem a receber, com análise de cada operação e atendimento próximo do início ao fim.", "seo": {"canonical": "", "focusKeyword": "recebíveis", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}, {"id": "securitizadora-1", "path": "/contato/", "name": "Contato", "seoTitle": "Contato | CredMais Securitizadora", "seoDescription": "Conte para a CredMais o que a sua empresa precisa. Nossa equipe conversa com você sobre as soluções e os próximos passos.", "seo": {"canonical": "", "focusKeyword": "CredMais", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}, {"id": "securitizadora-2", "path": "/servicos/pix-parcelado/", "name": "Pix Parcelado", "seoTitle": "Pix Parcelado para empresas | CredMais", "seoDescription": "Ofereça ao seu cliente a possibilidade de pagar a compra via Pix em parcelas, conforme as condições da operação.", "seo": {"canonical": "", "focusKeyword": "Pix parcelado", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}, {"id": "securitizadora-3", "path": "/servicos/antecipacao-de-recebiveis/", "name": "Antecipação de recebíveis", "seoTitle": "Antecipação de boletos e recebíveis | CredMais", "seoDescription": "Avalie com a CredMais se os valores que sua empresa tem a receber podem ajudar a organizar o caixa agora.", "seo": {"canonical": "", "focusKeyword": "antecipação de recebíveis", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}, {"id": "securitizadora-4", "path": "/servicos/boleto-garantido/", "name": "Boleto Garantido", "seoTitle": "Boleto Garantido para empresas | CredMais", "seoDescription": "Venda no boleto com garantia de recebimento, mesmo se o cliente não pagar.", "seo": {"canonical": "", "focusKeyword": "boleto garantido", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}, {"id": "securitizadora-5", "path": "/servicos/gestao-de-cobrancas/", "name": "Gestão de cobranças", "seoTitle": "Gestão de cobranças para empresas | CredMais", "seoDescription": "Deixe a gestão das cobranças com a CredMais e concentre sua energia no que faz a empresa seguir em frente.", "seo": {"canonical": "", "focusKeyword": "gestão de cobranças", "noindex": false, "nofollow": false, "image": "", "imageAlt": ""}}]};
const BACKEND={"url": "https://bqfunldpanspuqxsnoib.supabase.co", "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZnVubGRwYW5zcHVxeHNub2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzEzNzUsImV4cCI6MjEwNzA0NzM3NX0.zlAkKWvl4bVMq4KvmWh2qyK1SeEWBEVwjf3q8FRzJto"};
// Advanced-mode Pages worker: only public SEO, no service credentials.
const SEO=globalThis.CredMaisSEO;
const normalize=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
async function publicRows(path){
 const url=BACKEND.url+'/rest/v1/'+path;
 const key=new Request(url),cached=await caches.default.match(key);if(cached)return cached.json();
 const response=await fetch(url,{headers:{apikey:BACKEND.anonKey},signal:AbortSignal.timeout(2500)});
 if(!response.ok)throw Error('SEO data unavailable');
 const data=await response.json();await caches.default.put(key,new Response(JSON.stringify(data),{headers:{'Cache-Control':'public,max-age=30','Content-Type':'application/json'}}));return data;
}
async function configuration(){
 const outcomes=await Promise.allSettled([publicRows('cms_public_seo_sites?site=eq.'+SITE+'&select=published_config'),publicRows('cms_public_pages?site=eq.'+SITE+'&select=id,path,published_at,seo:published_content->seo,seoTitle:published_content->seoTitle,seoDescription:published_content->seoDescription')]);
 const sites=outcomes[0].status==='fulfilled'?outcomes[0].value:[],records=outcomes[1].status==='fulfilled'?outcomes[1].value:[];
 const site={...DEFAULTS.site,...sites[0]?.published_config,origin:DEFAULTS.site.origin};
 const pages=DEFAULTS.pages.map(p=>{const remote=records.find(r=>r.id===p.id);return {...p,...(remote?Object.fromEntries(Object.entries(remote).filter(([,v])=>v!==null)):{}),seo:{...p.seo,...remote?.seo}};});return {site,pages};
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.hostname==='admin.sejacredmais.com'){
  if(url.pathname==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex'}});
  if(!url.pathname.startsWith('/assets/')&&!url.pathname.startsWith('/admin/'))url.pathname='/admin'+(url.pathname==='/'?'/':url.pathname);
  const response=await env.ASSETS.fetch(new Request(url,request));const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex,nofollow');headers.set('Cache-Control','no-store');return new Response(response.body,{status:response.status,headers});
 }
 if(url.hostname==='www.sejacredmais.com'){url.hostname='sejacredmais.com';return Response.redirect(url.href,301);}
 const isFile=['/robots.txt','/sitemap.xml'].includes(url.pathname);
 const native=DEFAULTS.pages.find(p=>normalize(p.path)===normalize(url.pathname));
 if(!isFile&&!native)return env.ASSETS.fetch(request);
 const {site,pages}=await configuration();
 if(isFile){const robots=url.pathname==='/robots.txt';return new Response(robots?SEO.robots(site):SEO.sitemap(site,pages),{headers:{'Content-Type':robots?'text/plain; charset=utf-8':'application/xml; charset=utf-8','Cache-Control':'public,max-age=30','X-Content-Type-Options':'nosniff'}});}
 const response=await env.ASSETS.fetch(request);
 if(!response.headers.get('Content-Type')?.includes('text/html')||response.status!==200)return response;
 const page=pages.find(p=>p.id===native.id),preview=url.hostname.endsWith('.pages.dev');
 const siteConfig=preview?{...site,indexing:false}:site;
 const rewritten=new HTMLRewriter().on('head', {element(element){element.append(SEO.head(siteConfig,page),{html:true});}}).on('title,meta[name="description"],meta[name="robots"],link[rel="canonical"],meta[property^="og:"],meta[name^="twitter:"],meta[name="google-site-verification"],script[type="application/ld+json"]',{element(element){element.remove();}}).transform(response);
 const headers=new Headers(rewritten.headers);headers.set('Cache-Control','public,max-age=30');headers.set('X-Content-Type-Options','nosniff');if(!SEO.indexable(siteConfig,page))headers.set('X-Robots-Tag','noindex');return new Response(rewritten.body,{status:rewritten.status,headers});
}};
