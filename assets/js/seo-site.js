(()=>{
 'use strict';
 const config=window.CredMaisSiteConfig;if(!config)return;
 let defaultsPromise,sitePromise,sequence=0;
 const key=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
 const defaults=()=>defaultsPromise||(defaultsPromise=fetch(config.site==='securitizadora'?'/assets/js/seo-defaults.json':'/seo-defaults.json').then(r=>r.json()));
 async function siteConfig(base){
  if(!sitePromise)sitePromise=fetch(config.url+'/rest/v1/cms_public_seo_sites?site=eq.'+config.site+'&select=published_config',{headers:{apikey:config.anonKey}}).then(r=>r.ok?r.json():[]).catch(()=>[]);
  const records=await sitePromise;return {...base,...records[0]?.published_config,origin:base.origin};
 }
 async function load(published){const current=++sequence,pathname=location.pathname;
  try{const base=await defaults(),s=await siteConfig(base.site),native=base.pages.find(p=>key(p.path)===key(pathname));if(!native)return;
   if(!published){const response=await fetch(config.url+'/rest/v1/cms_public_pages?id=eq.'+encodeURIComponent(native.id)+'&select=published_content',{headers:{apikey:config.anonKey}});if(response.ok)published=(await response.json())[0]?.published_content;}
   const p={...native,...published};if(current!==sequence||location.pathname!==pathname)return;
   const head=CredMaisSEO.head(s,p),template=document.createElement('template');template.innerHTML=head;
   document.head.querySelectorAll('title,meta[name="description"],meta[name="robots"],link[rel="canonical"],meta[property^="og:"],meta[name^="twitter:"],meta[name="google-site-verification"],script[type="application/ld+json"]').forEach(node=>node.remove());document.head.append(template.content);
  }catch{/* Original server metadata remains available if the CMS is offline. */}
 }
 window.CredMaisSEOPage={load};
})();
