'use strict';
let cmsSession=null,cmsLeads=[],cmsConnected=false,cmsSaving=new Map(),cmsPoll=null;
const cmsConfig=window.CredMaisBackendConfig;
function cmsStoreSession(session){cmsSession=session;if(session)sessionStorage.setItem('credmais.admin.session',JSON.stringify(session));else sessionStorage.removeItem('credmais.admin.session');}
async function cmsAuth(path,body,token=''){
 const response=await fetch(cmsConfig.url+'/auth/v1/'+path,{method:'POST',headers:{apikey:cmsConfig.anonKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw Error(path.startsWith('token')?'E-mail ou senha inválidos.':'Não foi possível concluir. Tente novamente em instantes.');return data;
}
async function cmsToken(){
 if(!cmsSession)throw Error('Entre no painel para continuar.');
 if(cmsSession.expires_at*1000<Date.now()+60000){try{const session=await cmsAuth('token?grant_type=refresh_token',{refresh_token:cmsSession.refresh_token});cmsStoreSession(session);}catch{cmsStoreSession(null);location.hash='login';throw Error('Sua sessão expirou. Entre novamente.');}}
 return cmsSession.access_token;
}
async function cmsRequest(path,options={}){
 const token=await cmsToken();const response=await fetch(cmsConfig.url+path,{...options,headers:{apikey:cmsConfig.anonKey,Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers}});
 if(!response.ok){if(response.status===401){cmsStoreSession(null);location.hash='login';}throw Error('Não foi possível salvar ou carregar os dados. Tente novamente.');}
 return response.status===204?null:response.json();
}
async function cmsLogin(form){
 if(!form.reportValidity())return;const control=form.querySelector('[type=submit]');control.disabled=true;
 try{const data=new FormData(form);const session=await cmsAuth('token?grant_type=password',{email:cmsConfig.owner,password:data.get('password')});cmsStoreSession(session);
  const admins=await cmsRequest('/rest/v1/cms_admins?select=user_id');if(!admins.length){cmsStoreSession(null);throw Error('Este acesso não está autorizado.');}
  await cmsLoad();location.hash='overview';
 }catch(error){toast(error.message,'help');}finally{control.disabled=false;}
}
function activeLeads(){return state?.demo?state.demoLeads:cmsLeads;}
async function cmsLoad(){
 await seoLoad();
 const identity=await cmsRequest('/rest/v1/cms_admins?select=user_id');if(!identity.length)throw Error('Acesso não autorizado.');
 const settings=await cmsRequest('/rest/v1/cms_settings?select=data&id=eq.central');if(settings[0]){state.owner={...state.owner,...settings[0].data.owner};state.sites=state.sites.map(s=>({...s,...settings[0].data.sites?.find(x=>x.id===s.id)}));}
 const library=await cmsRequest('/rest/v1/cms_media?select=data');for(const record of library){const i=state.media.findIndex(m=>m.id===record.data.id);if(i<0)state.media.push(record.data);else state.media[i]=record.data;}
 const records=await cmsRequest('/rest/v1/cms_pages?select=id,draft_content,published_at');
 for(const record of records){const index=state.pages.findIndex(p=>p.id===record.id);if(index<0)continue;const local=state.pages[index],remote=record.draft_content;
  if(!local.updatedAt||new Date(remote.updatedAt||0)>=new Date(local.updatedAt)){state.pages[index]={...local,...remote,publishedAt:record.published_at};}
  for(const image of remote.media||[])if(!state.media.some(m=>m.id===image.id))state.media.push(image);
 }
 cmsConnected=true;state.demo=false;persist();await cmsRefreshLeads(false);
 clearInterval(cmsPoll);cmsPoll=setInterval(()=>{if(cmsSession&&!document.hidden)cmsRefreshLeads(true).catch(()=>{});},30000);
}
async function cmsRefreshLeads(redraw=true){
 const records=[];for(let offset=0;;offset+=1000){const rows=await cmsRequest('/rest/v1/cms_leads?select=*&order=created_at.desc&limit=1000&offset='+offset);records.push(...rows);if(rows.length<1000)break;}
 cmsLeads=records.map(l=>({...l,at:l.created_at}));
 if(redraw&&['leads','overview'].includes(route?.view)&&!$('#modal').open){if(route.view==='leads')drawLeadResults();else render();drawSidebar();}
}
async function cmsSaveLead(form,id){
 const data=new FormData(form);await cmsRequest('/rest/v1/cms_leads?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({status:data.get('status'),notes:data.get('notes')})});
 await cmsRefreshLeads(false);closeModal();render();toast('Atendimento salvo no painel.');
}
async function cmsUpload(image){
 if(!image.url.startsWith('data:'))return image;
 const blob=await (await fetch(image.url)).blob(),key=image.site+'/'+image.id+'.webp';
 await cmsRequest('/storage/v1/object/cms-images/'+key,{method:'POST',headers:{'Content-Type':blob.type,'x-upsert':'true'},body:blob});
 image.url=cmsConfig.url+'/storage/v1/object/public/cms-images/'+key;image.cloud=true;
 await cmsRequest('/rest/v1/cms_media',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:image.id,data:image})});return image;
}
async function cmsSaveSettings(){await cmsRequest('/rest/v1/cms_settings',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:'central',data:{owner:state.owner,sites:state.sites}})});}
async function cmsDeleteImage(id){const image=getMedia(id);if(image?.cloud){const pages=await cmsRequest('/rest/v1/cms_pages?select=published_content');if(pages.some(p=>p.published_content?.media?.some(m=>m.id===id)))throw Error('Esta imagem está em uma página publicada. Substitua e publique a página antes de remover.');await cmsRequest('/storage/v1/object/cms-images',{method:'DELETE',body:JSON.stringify({prefixes:[image.site+'/'+image.id+'.webp']})});await cmsRequest('/rest/v1/cms_media?id=eq.'+encodeURIComponent(id),{method:'DELETE'});}}
async function cmsPagePayload(page){
 const data=clone(page),ids=new Set([page.imageId,...page.sections.flatMap(s=>[s.imageId,...(s.items||[]).map(i=>i.imageId)])]);
 data.media=[];for(const id of ids){const m=getMedia(id);if(!m)continue;await cmsUpload(m);data.media.push({...m,url:new URL(m.url,'https://sejacredmais.com/admin/').href});}
 const initial=catalog.pages.find(p=>p.id===page.id);data.heroDirty=Boolean(page.heroDirty||['title','description','button','buttonUrl','alignment','theme','position','imageId'].some(k=>page[k]!==initial[k]));data.imageEdited=Boolean(page.imageEdited||page.imageId!==initial.imageId);
 data.sections=data.sections.map(s=>({...s,rendered:s.type!=='original'?bRenderSection(s,page,true):''}));
 delete data.revisions;data.revisions=(page.revisions||[]).slice(0,12).map(r=>({id:r.id,at:r.at,page:r.page}));
 return data;
}
function cmsSavePage(page,automatic=false){
 if(!cmsSession)return;
 const snapshot=clone(page),previous=cmsSaving.get(page.id)||Promise.resolve();
 const task=previous.catch(()=>{}).then(async()=>{
  const payload=await cmsPagePayload(snapshot);
  await cmsRequest('/rest/v1/cms_pages?id=eq.'+encodeURIComponent(snapshot.id),{method:'PATCH',body:JSON.stringify({draft_content:payload,updated_at:new Date().toISOString()})});
  persist();if(workingPage?.id===snapshot.id&&!dirty&&$('#save-state'))$('#save-state').textContent='Rascunho salvo no Supabase';
 }).catch(error=>{if($('#save-state'))$('#save-state').textContent='Salvo localmente · sincronização pendente';toast(error.message+' O rascunho local foi preservado.','help');});
 cmsSaving.set(page.id,task);return task;
}
async function cmsPublish(){
 if(!workingPage)return;const page=workingPage;const control=document.querySelector('[data-cms=publish]');if(control)control.disabled=true;
 try{builderSave(false);await cmsSaving.get(page.id);const payload=await cmsPagePayload(page),at=new Date().toISOString();delete payload.revisions;
  await cmsRequest('/rest/v1/cms_pages?id=eq.'+encodeURIComponent(page.id),{method:'PATCH',body:JSON.stringify({draft_content:payload,published_content:payload,published_at:at,updated_at:at})});
  page.publishedAt=at;getPage(page.id).publishedAt=at;persist();toast('Alterações publicadas. Os visitantes já podem ver o novo conteúdo.');
 }catch(error){toast(error.message,'help');}finally{if(control)control.disabled=false;}
}
async function cmsInit(){
 try{const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('access_token')){cmsStoreSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_at:Date.now()/1000+Number(hash.get('expires_in')||3600)});history.replaceState(null,'','#settings');settingsTab='account';}
 else cmsSession=JSON.parse(sessionStorage.getItem('credmais.admin.session')||'null');
 if(cmsSession)await cmsLoad();}catch{cmsStoreSession(null);cmsConnected=false;}
}
document.addEventListener('click',async event=>{
 const control=event.target.closest('[data-cms]');if(!control)return;
 try{
  if(control.dataset.cms==='publish')await cmsPublish();
  if(control.dataset.cms==='refresh'){control.disabled=true;await cmsRefreshLeads();toast('Formulários atualizados.');}
  if(control.dataset.cms==='logout'){const token=await cmsToken();await fetch(cmsConfig.url+'/auth/v1/logout',{method:'POST',headers:{apikey:cmsConfig.anonKey,Authorization:'Bearer '+token}});cmsStoreSession(null);cmsLeads=[];cmsConnected=false;clearInterval(cmsPoll);location.hash='login';}
 }catch(error){toast(error.message,'help');}finally{control.disabled=false;}
});
document.addEventListener('submit',async event=>{
 if(event.target.id==='login-form'){event.preventDefault();await cmsLogin(event.target);}
 if(event.target.id==='password-form'){event.preventDefault();const form=event.target;if(!form.reportValidity())return;const data=new FormData(form);if(data.get('password')!==data.get('confirm'))return toast('As senhas precisam ser iguais.','help');
  try{await cmsRequest('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:data.get('password')})});form.reset();toast('Senha atualizada.');}catch(error){toast(error.message,'help');}}
});
