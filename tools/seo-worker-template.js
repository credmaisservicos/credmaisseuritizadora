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
