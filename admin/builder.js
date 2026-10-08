'use strict';

const SECTION_MODELS = [
  {id:'image-text',name:'Imagem e texto',category:'Imagem',description:'Foto de um lado, conteúdo e botão do outro.'},
  {id:'editorial',name:'Destaque editorial',category:'Imagem',description:'Uma imagem ampla, título e texto com bastante espaço.'},
  {id:'cards',name:'Cards de conteúdo',category:'Conteúdo',description:'Organize serviços, benefícios ou temas em colunas.'},
  {id:'image-cards',name:'Cards com imagens',category:'Imagem',description:'Cada card tem sua foto, texto e link.'},
  {id:'steps',name:'Etapas do processo',category:'Conteúdo',description:'Explique uma sequência com passos editáveis.'},
  {id:'faq',name:'Perguntas frequentes',category:'Conteúdo',description:'Perguntas e respostas em acordeão.'},
  {id:'contact',name:'Canais de contato',category:'Contato',description:'WhatsApp, e-mail e links de atendimento.'},
  {id:'cta',name:'Chamada para ação',category:'Contato',description:'Título, explicação e um botão em destaque.'},
  {id:'gallery',name:'Galeria de imagens',category:'Imagem',description:'Uma composição de fotos com legendas.'},
  {id:'text',name:'Texto editorial',category:'Conteúdo',description:'Conteúdo com título e parágrafos, sem imagem.'},
  {id:'banner',name:'Banner com imagem',category:'Imagem',description:'Imagem ampla com texto na área livre.'},
  {id:'products',name:'Outros produtos',category:'Imagem',description:'Banners de produtos com destino configurável.'},
];
const BRANDS = {
  securitizadora:{accent:'#105af9',ink:'#0e2257',soft:'#f4f7ff',name:'CredMais'},
  cartas:{accent:'#d9f65a',ink:'#102a32',soft:'#f5f1e8',name:'CredCartas'},
  pay:{accent:'#146cff',ink:'#071a38',soft:'#f3f7ff',name:'CredMais Pay'},
};
let bPageId='',bSelected='hero',bTab='content',bDevice='desktop',bMobileTab='preview',bAutosave=true;
let bUndo=[],bRedo=[],bGroup='',bGroupAt=0,bTimer,bObserver,bFrameReady=false,bSource,bDragId='',bLibraryCategory='Todas';
let bPreviewScroll=0,bImageTarget=null;
const bSnapshots=new Map();
const bModelName=(s)=>s.type==='original'?'Layout do site':SECTION_MODELS.find(m=>m.id===s.type)?.name||'Seção';
function upgradeBuilderState(saved) {
  saved.pages=saved.pages.map(p=>{
    const base=catalog.pages.find(c=>c.id===p.id);if(!base)return p;
    if(saved.version>=2)return {...base,...p,sections:p.sections.map(s=>{const native=base.sections.find(n=>n.id===(s.sourceId||s.id));return native?{...native,...s,originalKind:native.originalKind,items:s.items?.length?s.items:native.items}:s;})};
    if(!p.draft)return {...clone(base)};
    const sections=base.sections.map(s=>{
      const old=p.sections.find(o=>o.id===s.id);return old?{...s,...old,type:old.type||'original',text:old.text||s.text}:s;
    });return {...base,...p,sections,previewSource:base.previewSource,originalHero:base.originalHero};
  });saved.version=2;return saved;
}
function bPrepare(p) {
  if(bPageId!==p.id){bPageId=p.id;bSelected='hero';bTab='content';bUndo=[];bRedo=[];bPreviewScroll=0;bGroup='';}
  p.sections=p.sections.map(s=>({type:'original',theme:'white',layout:'left',spacing:'normal',headingSize:'normal',imageId:'',button:'',buttonUrl:'',items:[],...s}));
  p.pageStyle={font:'Sora',contentWidth:'normal',...p.pageStyle};
}
function bSelectedSection(){return workingPage?.sections.find(s=>s.id===bSelected);}
function renderPageBuilder(p) {
  bPrepare(p);
  return `<div class="builder-heading"><div><a href="#pages?site=${esc(p.site)}" class="builder-back">${icon('back')} Páginas de ${esc(siteLabel(p.site))}</a><h1>${esc(p.name)}</h1></div><div class="builder-heading-actions"><span class="builder-save" id="save-state">${dirty?'Alterações pendentes':'Rascunho'}</span><label class="builder-auto"><input type="checkbox" id="builder-autosave" ${bAutosave?'checked':''}>Salvar automaticamente</label><button class="icon-button" data-builder="undo" aria-label="Desfazer" ${!bUndo.length?'disabled':''}>${icon('reset')}</button><button class="icon-button builder-history-short" data-builder="history" aria-label="Histórico de versões">${icon('clock')}</button><button class="icon-button builder-redo" data-builder="redo" aria-label="Refazer" ${!bRedo.length?'disabled':''}>${icon('reset')}</button>${button('Salvar rascunho','save-page','save','','primary')}<button class="button navy" data-cms="publish">Publicar alterações</button></div></div>
  <div class="builder-toolbar"><div class="builder-live"><span></span>Prévia em tempo real <small>Rascunho</small></div><div class="builder-devices" role="group" aria-label="Tamanho da tela">${[['desktop','monitor','Computador','1440 px'],['tablet','tablet','Tablet','820 px'],['mobile','phone','Celular','390 px']].map(([key,i,name,size])=>`<button data-builder="device" data-id="${key}" class="${bDevice===key?'active':''}" aria-pressed="${bDevice===key}">${icon(i==='tablet'?'monitor':i)}<span>${name}</span><small>${size}</small></button>`).join('')}</div><div class="builder-toolbar-actions"><button class="button small" data-builder="history">${icon('clock')} Histórico</button><button class="button small" data-builder="fullscreen">${icon('external')} Ampliar prévia</button></div></div>
  <div class="builder-mobile-nav" role="group" aria-label="Área do editor">${[['sections','Seções'],['preview','Prévia'],['edit','Editar']].map(([k,n])=>`<button data-builder="mobile-panel" data-id="${k}" class="${bMobileTab===k?'active':''}">${n}</button>`).join('')}</div>
  <div class="builder-layout mobile-${bMobileTab}" id="builder-layout"><aside class="builder-tree"><div class="builder-panel-title"><h2>Seções da página</h2><span id="builder-section-count">${p.sections.length}</span></div><p class="builder-hint">Arraste pela alça para mudar a ordem.</p><div id="builder-tree-list">${bTree()}</div><button class="builder-add" data-builder="library">${icon('plus')} Adicionar seção</button><div class="builder-tree-foot">Cabeçalho e rodapé seguem o site.<br>Você está editando um rascunho.</div></aside>
  <section class="builder-canvas" aria-label="Prévia da página"><div class="builder-canvas-head"><span>${esc(getSite(p.site).domain+p.path)}</span><span id="builder-viewport-label">${bDevice==='desktop'?'1440':bDevice==='tablet'?'820':'390'} px</span></div><div class="builder-preview-stage" id="builder-preview-stage"><div class="builder-loading" id="builder-loading">${icon('eye')} Preparando a prévia da página…</div><iframe id="builder-frame" title="Prévia interativa de ${esc(p.name)}" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div><div class="builder-canvas-foot">Clique em uma seção da prévia para editar. <span>Salve para revisar; publique para atualizar o site.</span></div></section>
  <aside class="builder-inspector"><div class="builder-inspector-tabs" role="group" aria-label="Configuração da seção">${[['content','Conteúdo'],['style','Visual'],['seo','Página']].map(([k,n])=>`<button data-builder="tab" data-id="${k}" class="${bTab===k?'active':''}">${n}</button>`).join('')}</div><div id="builder-inspector-content">${bInspector()}</div></aside></div>`;
}
function bTree() {
  const p=workingPage;
  return `<button class="builder-hero-row ${bSelected==='hero'?'selected':''}" data-builder="select" data-id="hero">${icon('image')}<span><b>Banner principal</b><small>Hero da página</small></span>${icon('chevron')}</button><div class="builder-section-list">${p.sections.map((s,i)=>`<article class="builder-section-row ${bSelected===s.id?'selected':''} ${s.visible===false?'section-hidden':''}" draggable="true" data-section-id="${esc(s.id)}"><button class="builder-drag" aria-label="Arrastar ${esc(s.title)}" title="Arrastar seção"><span>⠿</span></button><button class="builder-section-select" data-builder="select" data-id="${esc(s.id)}"><b>${esc(s.title||bModelName(s))}</b><small>${esc(bModelName(s))}</small></button><button class="builder-row-eye icon-button" data-builder="visibility" data-id="${esc(s.id)}" aria-label="${s.visible===false?'Exibir':'Ocultar'} seção">${icon(s.visible===false?'eyeOff':'eye')}</button><div class="builder-row-move"><button data-builder="move-up" data-id="${esc(s.id)}" aria-label="Mover para cima" ${i===0?'disabled':''}>${icon('up')}</button><button data-builder="move-down" data-id="${esc(s.id)}" aria-label="Mover para baixo" ${i===p.sections.length-1?'disabled':''}>${icon('down')}</button></div></article>`).join('')}</div>`;
}
function bField(label,name,value,type='input',extra='') {
  return `<label class="field"><span>${esc(label)}</span>${type==='textarea'?`<textarea data-b-field="${name}" rows="4" ${extra}>${esc(value||'')}</textarea>`:`<input class="input" data-b-field="${name}" value="${esc(value||'')}" ${extra}>`}</label>`;
}
function bSelect(label,name,value,options) {
  return `<label class="field"><span>${esc(label)}</span><select data-b-field="${name}">${options.map(([k,n])=>`<option value="${k}" ${value===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
}
function bImagePicker(id,target='imageId',label='Imagem') {
  const image=getMedia(id);
  return `<div class="field"><span>${esc(label)}</span><button class="builder-image-picker" data-builder="image" data-target="${target}">${image?`<img src="${esc(image.url)}" alt="">`:icon('image')}<span>${image?'Trocar imagem':'Escolher imagem'}<small>${image?esc(image.name):'Biblioteca desta marca'}</small></span></button>${id?`<button class="inline-link" data-builder="clear-image" data-target="${target}">Remover imagem</button>`:''}</div>`;
}
function bInspector() {
  const p=workingPage,s=bSelectedSection(),hero=bSelected==='hero';
  if(bTab==='seo')return `<div class="builder-inspector-body"><h2>Informações da página</h2><p class="builder-hint">Título e descrição usados nos resultados de busca.</p>${bField('Título na busca','page.seoTitle',p.seoTitle||p.name+' | '+siteLabel(p.site),'input','maxlength="100"')}${bField('Descrição na busca','page.seoDescription',p.seoDescription||p.description,'textarea','maxlength="320"')}<h3 class="builder-subtitle">Composição</h3>${bSelect('Largura do conteúdo','page.pageStyle.contentWidth',p.pageStyle.contentWidth,[['normal','Padrão do site'],['wide','Mais amplo'],['narrow','Mais compacto']])}<div class="builder-seo-result"><b>${esc(p.seoTitle||p.name+' | '+siteLabel(p.site))}</b><span>${esc(getSite(p.site).domain+p.path)}</span><p>${esc(p.seoDescription||p.description)}</p></div><div class="builder-note">Salve o rascunho ou deixe o salvamento automático ligado.</div></div>`;
  if(!hero&&!s)return `<div class="builder-inspector-body">${empty('Selecione uma seção.','Clique na lista ou na prévia para começar.','edit','',true)}</div>`;
  const item=hero?p:s;
  if(bTab==='style')return `<div class="builder-inspector-body"><h2>${hero?'Visual do banner':'Visual da seção'}</h2><p class="builder-hint">A prévia acompanha cada ajuste.</p>${!hero?bSelect('Modelo da seção','type',s.type,[...(bSource?.sections.some(original=>original.id===(s.sourceId||s.id))?[['original','Layout original do site']]:[]),...SECTION_MODELS.map(m=>[m.id,m.name])]):''}${bSelect(hero?'Posição do texto':s.type==='original'?'Alinhamento do texto':'Composição',hero?'alignment':'layout',hero?p.alignment:s.layout,[['left','Imagem à direita / texto à esquerda'],['right','Imagem à esquerda / texto à direita'],...(!hero?[['center','Centralizado']]:[])])}${bSelect('Fundo e contraste','theme',item.theme,[['white','Fundo branco'],['soft','Fundo suave da marca'],['blue',hero?'Texto branco sobre imagem':'Cor principal da marca'],...(!hero?[['dark','Fundo escuro da marca']]:[])])}${hero?bSelect('Enquadramento','position',p.position,[['left','Priorizar esquerda'],['center','Centralizado'],['right','Priorizar direita']]):bSelect('Espaçamento','spacing',s.spacing,[['compact','Compacto'],['normal','Padrão'],['spacious','Mais espaço']])+bSelect('Tamanho do título','headingSize',s.headingSize,[['small','Menor'],['normal','Padrão'],['large','Maior']])}<label class="toggle-row"><span>${hero?'Exibir banner':'Exibir seção'}</span><span class="switch"><input type="checkbox" data-b-field="visible" ${item.visible!==false?'checked':''}><span></span></span></label><div class="builder-note">As cores acompanham a identidade de ${esc(siteLabel(p.site))}.</div></div>`;
  return `<div class="builder-inspector-body"><div class="builder-selected-heading"><h2>${hero?'Banner principal':bModelName(s)}</h2>${!hero?`<div><button class="icon-button" data-builder="duplicate" title="Duplicar seção" aria-label="Duplicar seção">${icon('file')}</button><button class="icon-button" data-builder="remove" title="Remover seção" aria-label="Remover seção">${icon('trash')}</button></div>`:''}</div>${bField('Título','title',item.title,'textarea','maxlength="180"')}${bField(hero?'Descrição':'Texto',hero?'description':'text',hero?p.description:s.text,'textarea','maxlength="5000"')}${bImagePicker(item.imageId)}${!hero?bField('Descrição da imagem','alt',s.alt,'input','maxlength="200"'):''}${bField('Texto do botão','button',item.button,'input','maxlength="80"')}${bField('Destino do botão','buttonUrl',item.buttonUrl,'input','placeholder="/contato/ ou https://..."')}${!hero?bItems(s):''}<div class="builder-note">${hero?'Ajuste a posição do texto na aba Visual para preservar as pessoas na foto.':'Remover uma seção pode ser desfeito pelo botão Desfazer.'}</div></div>`;
}
function bItems(s) {
  if(s.type==='original')return s.items?.length?`<h3 class="builder-subtitle">Conteúdo dos blocos existentes</h3>${s.items.map((item,i)=>`<details class="builder-item"><summary>${esc(item.title||'Bloco '+(i+1))}</summary><div>${bField(s.originalKind==='faq'?'Pergunta':'Título','items.'+i+'.title',item.title,'input','maxlength="180"')}${bField(s.originalKind==='faq'?'Resposta':'Texto','items.'+i+'.text',item.text,'textarea','maxlength="3000"')}</div></details>`).join('')}`:'';
  if(!['cards','image-cards','steps','faq','contact','gallery','products'].includes(s.type))return '';
  const isFAQ=s.type==='faq',hasImage=['image-cards','gallery','products'].includes(s.type);
  return `<h3 class="builder-subtitle">${isFAQ?'Perguntas e respostas':s.type==='gallery'?'Fotos da galeria':'Itens da seção'}</h3><div class="builder-items">${(s.items||[]).map((item,i)=>`<details class="builder-item" ${i===0?'open':''}><summary>${esc(item.title||'Item '+(i+1))}</summary><div>${bField(isFAQ?'Pergunta':'Título','items.'+i+'.title',item.title,'input','maxlength="180"')}${bField(isFAQ?'Resposta':'Descrição','items.'+i+'.text',item.text,'textarea','maxlength="2000"')}${hasImage?bImagePicker(item.imageId,'items.'+i+'.imageId'):''}${!isFAQ?bField('Link','items.'+i+'.url',item.url,'input','placeholder="https://..."'):''}<div class="builder-item-actions"><button class="button small" data-builder="item-up" data-index="${i}" ${i===0?'disabled':''}>${icon('up')} Subir</button><button class="button small" data-builder="item-remove" data-index="${i}">${icon('trash')} Remover</button></div></div></details>`).join('')}</div><button class="button small" data-builder="item-add">${icon('plus')} ${isFAQ?'Adicionar pergunta':'Adicionar item'}</button>`;
}
function bSetPath(object,path,value) {
  const keys=path.split('.');let target=object;for(const key of keys.slice(0,-1)){if(!target[key])target[key]={};target=target[key];}target[keys.at(-1)]=value;
}
function bChange(change,group='') {
  if(!workingPage)return;
  const now=Date.now();if(!group||group!==bGroup||now-bGroupAt>800){bUndo.push(clone(workingPage));if(bUndo.length>50)bUndo.shift();}
  bGroup=group;bGroupAt=now;bRedo=[];change();dirty=true;
  bRefresh(false);clearTimeout(bTimer);if(bAutosave){const id=workingPage.id;bTimer=setTimeout(()=>{if(route.view==='page-edit'&&workingPage?.id===id)builderSave(true);},1100);}
}
function bRefresh(inspector=true,skipPreview=false) {
  if(!$('#builder-tree-list'))return;
  $('#builder-tree-list').innerHTML=bTree();$('#builder-section-count').textContent=workingPage.sections.length;
  if(inspector)$('#builder-inspector-content').innerHTML=bInspector();
  else if(bTab==='seo'&&$('.builder-seo-result')){const p=workingPage;$('.builder-seo-result').innerHTML=`<b>${esc(p.seoTitle||p.name+' | '+siteLabel(p.site))}</b><span>${esc(getSite(p.site).domain+p.path)}</span><p>${esc(p.seoDescription||p.description)}</p>`;}
  for(const [action,stack]of[['undo',bUndo],['redo',bRedo]]){const control=$(`[data-builder="${action}"]`);if(control)control.disabled=!stack.length;}
  $('#save-state').textContent=dirty?'Alterações pendentes':'Rascunho';if(!skipPreview)bSendPreview();
}
function bHistoryAction(redo=false) {
  const from=redo?bRedo:bUndo,to=redo?bUndo:bRedo;if(!from.length)return;
  to.push(clone(workingPage));workingPage=from.pop();dirty=true;bGroup='';if(bSelected!=='hero'&&!bSelectedSection())bSelected='hero';bRefresh();
  clearTimeout(bTimer);if(bAutosave)bTimer=setTimeout(()=>builderSave(true),1100);
}
function builderSave(automatic=false) {
  if(!workingPage||route.view!=='page-edit')return;
  const page=workingPage;
  const allLinks=[page.buttonUrl,...page.sections.flatMap(s=>[s.buttonUrl,...(s.items||[]).map(i=>i.url)])];
  if(allLinks.some(url=>url&&!safeURL(url))){toast('Um botão ou item contém um link inválido. Use um endereço de página ou https://.','help');return;}
  const index=state.pages.findIndex(p=>p.id===page.id);if(index<0)return;
  const previous=state.pages[index],oldActivity=clone(state.activity);page.draft=true;page.updatedAt=new Date().toISOString();
  if(!automatic){const revision=clone(page);delete revision.revisions;page.revisions=[{id:crypto.randomUUID(),at:page.updatedAt,page:revision},...(page.revisions||[])].slice(0,12);}
  state.pages[index]=clone(page);
  if(!automatic||!state.activity[0]||state.activity[0].detail!==`${siteLabel(page.site)} / ${page.name}`)activity(automatic?'Rascunho salvo automaticamente':'Versão do rascunho salva',`${siteLabel(page.site)} / ${page.name}`,page.site);
  if(!persist()){state.pages[index]=previous;state.activity=oldActivity;return;}
  dirty=false;clearTimeout(bTimer);if($('#save-state'))$('#save-state').textContent=(automatic?'Salvo automaticamente · ':'Rascunho salvo · ')+dateFormat(page.updatedAt);
  cmsSavePage(page,automatic);if(!automatic)toast('Rascunho e versão salvos. Sincronizando com o Supabase.');
}
function bSelectSection(id,scroll=true) {
  if(id!=='hero'&&!workingPage.sections.some(s=>s.id===id))return;bSelected=id;bMobileTab='edit';
  if($('#builder-layout'))$('#builder-layout').className='builder-layout mobile-'+bMobileTab;bRefresh(true,true);
  for(const e of $$('.builder-mobile-nav button'))e.classList.toggle('active',e.dataset.id===bMobileTab);
  if(scroll)bPost({kind:'select',id,scroll:true});
}
function bNewSection(type) {
  const titles={'image-text':'Uma solução para o seu próximo passo.',editorial:'Um novo olhar para o seu negócio.',cards:'Conheça nossas soluções.','image-cards':'Possibilidades para o seu objetivo.',steps:'Um caminho claro para começar.',faq:'Suas dúvidas, respondidas.',contact:'Vamos conversar.',cta:'Seu próximo passo começa aqui.',gallery:'Imagens que contam a história.',text:'Informação para decidir com clareza.',banner:'Uma nova possibilidade para você.',products:'Conheça outros produtos.'};
  const p=workingPage,s={id:crypto.randomUUID(),type,title:titles[type],text:'Edite este texto para apresentar a seção com as informações do seu negócio.',visible:true,theme:type==='cta'?'dark':'white',layout:'left',spacing:'normal',headingSize:'normal',imageId:'',alt:'',button:['cta','image-text','banner','editorial'].includes(type)?'Fale com a gente':'',buttonUrl:p.site==='cartas'?'/contato.html':p.site==='pay'?'/ajuda#contato':'/contato/',items:[]};
  if(['cards','image-cards','steps','faq','gallery','products'].includes(type))s.items=Array.from({length:type==='products'?2:3},(_,i)=>({id:crypto.randomUUID(),title:type==='faq'?'Edite sua pergunta '+(i+1):type==='steps'?'Etapa '+(i+1):'Título do item '+(i+1),text:'Adicione uma descrição com informações confirmadas.',button:'Saiba mais',url:'',imageId:'',alt:''}));
  if(type==='contact')s.items=[{id:crypto.randomUUID(),title:'WhatsApp',text:'Converse com nossa equipe.',url:'https://wa.me/5511940893852'},{id:crypto.randomUUID(),title:'E-mail',text:'contato@sejacredmais.com',url:'mailto:contato@sejacredmais.com'}];
  return s;
}
function bMini(type) {
  const shape=type==='image-text'?'split':type==='editorial'||type==='banner'?'photo':type==='faq'?'faq':type==='steps'?'steps':type==='text'?'text':type==='cta'?'cta':'cards';
  return `<div class="builder-model-mini mini-${shape}" aria-hidden="true"><i></i><b></b><span></span><em></em></div>`;
}
function bOpenLibrary() {
  bLibraryCategory='Todas';showModal('Adicionar uma seção',`<p>Escolha um modelo. Você poderá trocar os textos, imagens, cores e disposição depois.</p><div class="builder-library-filters">${['Todas','Imagem','Conteúdo','Contato'].map(c=>`<button data-builder="library-category" data-id="${c}" class="${c==='Todas'?'active':''}">${c}</button>`).join('')}</div><div id="builder-library-grid" class="builder-library-grid">${bLibraryCards()}</div>`,button('Fechar','close-modal'));
  $('#modal').classList.add('builder-library-dialog');
}
function bLibraryCards(){return SECTION_MODELS.filter(m=>bLibraryCategory==='Todas'||m.category===bLibraryCategory).map(m=>`<button class="builder-model" data-builder="insert" data-id="${m.id}">${bMini(m.id)}<h3>${esc(m.name)}</h3><p>${esc(m.description)}</p><span>Adicionar ${icon('plus')}</span></button>`).join('');}
function bOpenImages(target) {
  bImageTarget={section:bSelected,target};
  showModal('Escolha a imagem da seção',`<p>Imagens de ${esc(siteLabel(workingPage.site))}.</p><div class="dialog-media-grid">${state.media.filter(m=>m.site===workingPage.site).map(m=>`<button class="media-select" data-builder="pick-image" data-id="${m.id}"><img src="${esc(m.url)}" alt="${esc(m.name)}"><span>${esc(m.name)}</span></button>`).join('')}</div><p class="builder-hint">Você também pode importar uma imagem do computador.</p>`,`<button class="button primary" data-builder="upload-image">${icon('upload')} Importar imagem</button>`+button('Fechar','close-modal'));
}
function bHistoryDialog() {
  const revisions=workingPage.revisions||[];
  showModal('Versões do rascunho',`<p>O salvamento manual guarda uma versão. Restaurar uma versão mantém as demais disponíveis.</p>${revisions.length?`<div class="builder-revisions">${revisions.map(r=>`<article><div><b>${dateFormat(r.at)}</b><small>${r.page.sections.length} seções</small></div><button class="button small" data-builder="restore-version" data-id="${r.id}">Restaurar</button></article>`).join('')}</div>`:empty('Ainda não há versões salvas.','Clique em Salvar rascunho para guardar a primeira versão.','clock','',true)}`,button('Fechar','close-modal'));
}
function bMove(id,direction){const index=workingPage.sections.findIndex(s=>s.id===id),next=index+direction;if(next<0||next>=workingPage.sections.length)return;bChange(()=>{[workingPage.sections[index],workingPage.sections[next]]=[workingPage.sections[next],workingPage.sections[index]]});bRefresh();}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-builder]');if(!el||el.disabled||route?.view!=='page-edit'||!workingPage)return;
  const {builder:action,id,target,index}=el.dataset;
  switch(action){
    case 'select':bSelectSection(id);break;
    case 'tab':bTab=id;for(const e of $$('.builder-inspector-tabs button'))e.classList.toggle('active',e.dataset.id===id);$('#builder-inspector-content').innerHTML=bInspector();break;
    case 'device':bDevice=id;for(const e of $$('.builder-devices button')){e.classList.toggle('active',e.dataset.id===id);e.setAttribute('aria-pressed',String(e.dataset.id===id));}bScalePreview();requestAnimationFrame(()=>bPost({kind:'select',id:bSelected,scroll:true}));break;
    case 'mobile-panel':bMobileTab=id;$('#builder-layout').className='builder-layout mobile-'+id;for(const e of $$('.builder-mobile-nav button'))e.classList.toggle('active',e.dataset.id===id);requestAnimationFrame(bScalePreview);break;
    case 'undo':bHistoryAction();break;case 'redo':bHistoryAction(true);break;
    case 'library':bOpenLibrary();break;
    case 'library-category':bLibraryCategory=id;for(const e of $$('.builder-library-filters button'))e.classList.toggle('active',e.dataset.id===id);$('#builder-library-grid').innerHTML=bLibraryCards();break;
    case 'insert':{if(!SECTION_MODELS.some(m=>m.id===id))return;const section=bNewSection(id),at=bSelected==='hero'?0:workingPage.sections.findIndex(s=>s.id===bSelected)+1;bChange(()=>workingPage.sections.splice(at,0,section));closeModal();bSelectSection(section.id);toast('Seção adicionada ao rascunho.');break;}
    case 'duplicate':{const s=bSelectedSection();if(!s)return;const copy=clone(s);copy.id=crypto.randomUUID();copy.sourceId=s.sourceId||s.id;copy.title+=' (cópia)';const at=workingPage.sections.indexOf(s)+1;bChange(()=>workingPage.sections.splice(at,0,copy));bSelectSection(copy.id);break;}
    case 'remove':{const s=bSelectedSection();if(!s)return;bChange(()=>workingPage.sections=workingPage.sections.filter(n=>n.id!==s.id));bSelected='hero';bRefresh();toast('Seção removida. Use Desfazer para recuperá-la.');break;}
    case 'visibility':{const s=workingPage.sections.find(s=>s.id===id);if(!s)return;bChange(()=>s.visible=s.visible===false);bRefresh();break;}
    case 'move-up':bMove(id,-1);break;case 'move-down':bMove(id,1);break;
    case 'image':bOpenImages(target);break;
    case 'upload-image':lastUploadSite=workingPage.site;$('#media-upload').click();break;
    case 'pick-image':{if(!bImageTarget)return;const selected=bImageTarget.section==='hero'?workingPage:workingPage.sections.find(s=>s.id===bImageTarget.section);bChange(()=>{bSetPath(selected,bImageTarget.target,id);selected.imageEdited=true;if(selected===workingPage)selected.heroDirty=true;});closeModal();bImageTarget=null;bRefresh();break;}
    case 'clear-image':{const selected=bSelected==='hero'?workingPage:bSelectedSection();bChange(()=>{bSetPath(selected,target,'');selected.imageEdited=true;if(selected===workingPage)selected.heroDirty=true;});bRefresh();break;}
    case 'item-add':{const s=bSelectedSection();bChange(()=>s.items.push({id:crypto.randomUUID(),title:s.type==='faq'?'Nova pergunta':'Novo item',text:'',url:'',imageId:''}));bRefresh();break;}
    case 'item-remove':{const s=bSelectedSection();bChange(()=>s.items.splice(Number(index),1));bRefresh();break;}
    case 'item-up':{const s=bSelectedSection(),i=Number(index);if(i>0)bChange(()=>{[s.items[i],s.items[i-1]]=[s.items[i-1],s.items[i]]});bRefresh();break;}
    case 'history':bHistoryDialog();break;
    case 'restore-version':{const revision=workingPage.revisions?.find(r=>r.id===id);if(!revision)return;const versions=workingPage.revisions;bChange(()=>workingPage={...clone(revision.page),revisions:versions});closeModal();bSelected='hero';bRefresh();break;}
    case 'fullscreen':$('#builder-layout').classList.toggle('preview-expanded');requestAnimationFrame(bScalePreview);break;
  }
});
function bOnField(event) {
  const input=event.target;if(!input.matches('[data-b-field]')||route?.view!=='page-edit')return;
  const path=input.dataset.bField,value=input.type==='checkbox'?input.checked:input.value;
  const object=path.startsWith('page.')?workingPage:bSelected==='hero'?workingPage:bSelectedSection();if(!object)return;
  bChange(()=>{bSetPath(object,path.replace(/^page\./,''),value);if(bSelected==='hero'&&!path.startsWith('page.')){workingPage.heroDirty=true;if(['alignment','theme','position'].includes(path))workingPage.heroStyleFields=[...new Set([...(workingPage.heroStyleFields||[]),path])];}},bSelected+':'+path);
  if(input.tagName==='SELECT'||input.type==='checkbox')bRefresh();
}
document.addEventListener('input',bOnField);
document.addEventListener('change',event=>{
  if(event.target.id==='builder-autosave'){bAutosave=event.target.checked;clearTimeout(bTimer);if(bAutosave&&dirty)builderSave(true);}
});
document.addEventListener('keydown',event=>{
  if(route?.view!=='page-edit'||!workingPage)return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();builderSave();}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.target.matches('input,textarea,[contenteditable]')){event.preventDefault();bHistoryAction(event.shiftKey);}
});
document.addEventListener('dragstart',event=>{
  const row=event.target.closest('[data-section-id]');if(!row||route?.view!=='page-edit')return;bDragId=row.dataset.sectionId;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',bDragId);row.classList.add('dragging');
});
document.addEventListener('dragover',event=>{
  const row=event.target.closest('[data-section-id]');if(!row||!bDragId)return;event.preventDefault();event.dataTransfer.dropEffect='move';for(const e of $$('.builder-section-row'))e.classList.remove('drop-before','drop-after');const after=event.clientY>row.getBoundingClientRect().top+row.offsetHeight/2;row.classList.add(after?'drop-after':'drop-before');
});
document.addEventListener('drop',event=>{
  const row=event.target.closest('[data-section-id]');if(!row||!bDragId)return;event.preventDefault();const dragged=bDragId,target=row.dataset.sectionId,after=row.classList.contains('drop-after');bDragId='';if(dragged===target){bRefresh(false);return;}
  bChange(()=>{const from=workingPage.sections.findIndex(s=>s.id===dragged);if(from<0)return;const [section]=workingPage.sections.splice(from,1);const to=workingPage.sections.findIndex(s=>s.id===target);workingPage.sections.splice(to+(after?1:0),0,section);});bRefresh(false);
});
document.addEventListener('dragend',()=>{bDragId='';for(const row of $$('.builder-section-row'))row.classList.remove('dragging','drop-after','drop-before');});
let bTouch=null;
document.addEventListener('pointerdown',event=>{
  const grip=event.target.closest('.builder-drag');if(!grip||event.pointerType==='mouse')return;
  const row=grip.closest('[data-section-id]');bTouch={id:row.dataset.sectionId,target:null,after:false};grip.setPointerCapture(event.pointerId);row.classList.add('dragging');event.preventDefault();
});
document.addEventListener('pointermove',event=>{
  if(!bTouch)return;const row=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-section-id]');
  for(const el of $$('.builder-section-row'))el.classList.remove('drop-before','drop-after');
  if(row&&row.dataset.sectionId!==bTouch.id){bTouch.target=row.dataset.sectionId;bTouch.after=event.clientY>row.getBoundingClientRect().top+row.offsetHeight/2;row.classList.add(bTouch.after?'drop-after':'drop-before');}
  if(event.clientY<90)window.scrollBy(0,-14);else if(event.clientY>innerHeight-70)window.scrollBy(0,14);event.preventDefault();
},{passive:false});
document.addEventListener('pointerup',()=>{
  if(!bTouch)return;const drag=bTouch;bTouch=null;
  if(drag.target)bChange(()=>{const index=workingPage.sections.findIndex(s=>s.id===drag.id);const [section]=workingPage.sections.splice(index,1);const target=workingPage.sections.findIndex(s=>s.id===drag.target);workingPage.sections.splice(target+(drag.after?1:0),0,section);});bRefresh(false);
});
document.addEventListener('pointercancel',()=>{bTouch=null;bRefresh(false);});
document.querySelector('#modal')?.addEventListener('close',()=>document.querySelector('#modal').classList.remove('builder-library-dialog'));

function bPost(data){const frame=document.querySelector('#builder-frame');if(frame&&bFrameReady)frame.contentWindow.postMessage({channel:'credmais-builder',...data},'*');}
function bSendPreview(){
  if(!workingPage||!bFrameReady)return;
  const page=clone(workingPage);delete page.revisions;
  const initial=catalog.pages.find(p=>p.id===page.id);if(initial){page.heroDirty=page.heroDirty||['title','description','button','buttonUrl','alignment','theme','position','imageId'].some(k=>page[k]!==initial[k]);page.imageEdited=page.imageEdited||page.imageId!==initial.imageId;}
  bPost({kind:'update',page,brand:BRANDS[page.site],selected:bSelected,sections:page.sections.map(s=>({config:s,html:s.type==='original'?null:bRenderSection(s)})),images:Object.fromEntries(state.media.map(m=>[m.id,{url:new URL(m.url,publishing?'https://sejacredmais.com/admin/':location.href).href,name:m.name}]))});
}
function bScalePreview(){
  const stage=document.querySelector('#builder-preview-stage'),frame=document.querySelector('#builder-frame');if(!stage||!frame||!stage.clientWidth)return;
  const width=bDevice==='desktop'?1440:bDevice==='tablet'?820:390,scale=Math.min(1,stage.clientWidth/width),height=stage.clientHeight;
  frame.style.width=width+'px';frame.style.height=Math.ceil(height/scale)+'px';frame.style.transform=`scale(${scale})`;frame.style.left=Math.max(0,(stage.clientWidth-width*scale)/2)+'px';
  $('#builder-viewport-label').textContent=width+' px';
}
async function mountPageBuilder(){
  bObserver?.disconnect();bFrameReady=false;const id=workingPage.id,frame=$('#builder-frame');if(!frame)return;
  bObserver=new ResizeObserver(bScalePreview);bObserver.observe($('#builder-preview-stage'));bScalePreview();
  try{
    if(!bSnapshots.has(id)){const response=await fetch(workingPage.previewSource||'./preview/pages/'+id+'.json');if(!response.ok)throw Error('preview');bSnapshots.set(id,await response.json());}
    if(route.view!=='page-edit'||workingPage?.id!==id||$('#builder-frame')!==frame)return;
    bSource=bSnapshots.get(id);
    const base=location.origin+'/';
    const sourceHead=bSource.head.replace(/\s+crossorigin(?:="[^"]*")?/g,'');
    frame.srcdoc=`<!doctype html><html lang="pt-BR"><head><base href="${base}"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">${sourceHead}<link rel="stylesheet" href="${base}admin/preview-sections.css"><link rel="stylesheet" href="${base}admin/preview-frame.css"></head><body class="${esc(bSource.bodyClass||'')}" data-cm-brand="${workingPage.site}" ${workingPage.site==='securitizadora'?`data-page="${workingPage.path==='/'?'home':workingPage.path.includes('contato')?'contato':workingPage.path.split('/').filter(Boolean).at(-1)}" ${workingPage.path==='/'?'data-header="transparent"':''}`:''}>${bSource.body}<script src="${base}admin/preview-frame.js"><\/script></body></html>`;
  }catch{if($('#builder-loading'))$('#builder-loading').textContent='A prévia não carregou. Reabra esta página no editor.';}
}
function disposePageBuilder(){bObserver?.disconnect();clearTimeout(bTimer);bFrameReady=false;}
window.addEventListener('message',event=>{
  const frame=document.querySelector('#builder-frame');if(!frame||event.source!==frame.contentWindow||event.data?.channel!=='credmais-builder'||route?.view!=='page-edit')return;
  if(event.data.kind==='ready'){bFrameReady=true;$('#builder-loading')?.remove();bPost({kind:'source',sections:bSource.sections,hero:bSource.hero,scroll:bPreviewScroll});bSendPreview();}
  if(event.data.kind==='selected')bSelectSection(String(event.data.id),false);
  if(event.data.kind==='scroll')bPreviewScroll=Math.max(0,Number(event.data.y)||0);
});
function bRenderSection(s,page=workingPage,publishing=false){
  const brand=BRANDS[page.site],image=(id,alt='')=>{const m=getMedia(id);return m?`<img src="${esc(new URL(m.url,publishing?'https://sejacredmais.com/admin/':location.href).href)}" alt="${esc(alt||m.name)}" loading="lazy">`:'<div class="cm-image-placeholder">Escolha uma imagem no editor</div>';};
  const text=(value)=>esc(value||'').replace(/\n/g,'<br>');
  const cta=(label,url)=>label?`<a class="cm-button" href="${esc(safeURL(url)||'#')}">${esc(label)}<span>→</span></a>`:'';
  const head=`<div class="cm-section-head"><h2>${text(s.title)}</h2>${s.text?`<p>${text(s.text)}</p>`:''}</div>`;
  const items=s.items||[];let content='';
  switch(s.type){
    case 'image-text':content=`<div class="cm-split"><div class="cm-split-copy">${head}${cta(s.button,s.buttonUrl)}</div><div class="cm-split-image">${image(s.imageId,s.alt)}</div></div>`;break;
    case 'editorial':content=`${head}<div class="cm-editorial-image">${image(s.imageId,s.alt)}</div>${cta(s.button,s.buttonUrl)}`;break;
    case 'cards':case 'image-cards':case 'products':content=`${head}<div class="cm-cards ${s.type==='products'?'cm-two':''}">${items.map(i=>`<article>${s.type!=='cards'?`<div class="cm-card-image">${image(i.imageId,i.alt)}</div>`:''}<div class="cm-card-copy"><h3>${text(i.title)}</h3><p>${text(i.text)}</p>${i.url?cta(i.button||'Saiba mais',i.url):''}</div></article>`).join('')}</div>`;break;
    case 'steps':content=`${head}<div class="cm-steps">${items.map((i,n)=>`<article><span>${String(n+1).padStart(2,'0')}</span><h3>${text(i.title)}</h3><p>${text(i.text)}</p></article>`).join('')}</div>`;break;
    case 'faq':content=`<div class="cm-faq">${head}<div>${items.map((i,n)=>`<details ${n===0?'open':''}><summary>${text(i.title)}<span>+</span></summary><p>${text(i.text)}</p></details>`).join('')}</div></div>`;break;
    case 'contact':content=`${head}<div class="cm-contact">${items.map(i=>`<a href="${esc(safeURL(i.url)||'#')}"><h3>${text(i.title)}</h3><p>${text(i.text)}</p><span>Entrar em contato →</span></a>`).join('')}</div>`;break;
    case 'cta':content=`<div class="cm-cta">${head}<div>${cta(s.button,s.buttonUrl)}</div></div>`;break;
    case 'gallery':content=`${head}<div class="cm-gallery">${items.map(i=>`<figure>${image(i.imageId,i.alt)}<figcaption>${text(i.title)}</figcaption></figure>`).join('')}</div>`;break;
    case 'banner':content=`<div class="cm-banner"><div class="cm-banner-image">${image(s.imageId,s.alt)}</div><div class="cm-banner-copy">${head}${cta(s.button,s.buttonUrl)}</div></div>`;break;
    default:content=`<div class="cm-text">${head}${cta(s.button,s.buttonUrl)}</div>`;
  }
  return `<section class="cm-section cm-${esc(s.type)} cm-theme-${esc(s.theme)} cm-layout-${esc(s.layout)} cm-space-${esc(s.spacing)} cm-heading-${esc(s.headingSize)}" data-cm-section="${esc(s.id)}" style="--cm-accent:${brand.accent};--cm-ink:${brand.ink};--cm-soft:${brand.soft};--cm-font:${page.site==='cartas'?'Manrope':page.site==='pay'?'DM Sans':'Sora'}"><div class="cm-container">${content}</div></section>`;
}
