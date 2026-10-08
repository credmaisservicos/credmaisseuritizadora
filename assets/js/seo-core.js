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
