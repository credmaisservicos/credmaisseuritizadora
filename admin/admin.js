'use strict';

// Front-end independente. O catálogo e os rascunhos não publicam nos sites.
// Chaves privadas e dados de produção não pertencem a esta aplicação.
const STORE_KEY = 'credmais.admin.frontend.v1';
const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  inbox: '<path d="M4 4h16l2 11v5H2v-5L4 4Z"/><path d="M2 15h6l2 3h4l2-3h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5Z"/><path d="M14 2v5h5M8 12h8M8 16h6"/>',
  library: '<rect x="7" y="7" width="14" height="14" rx="2"/><path d="M17 3H5a2 2 0 0 0-2 2v12M7 17l4-4 3 3 3-4 4 5"/>',
  settings: '<path d="m9 3 .6 2.4a7 7 0 0 1 4.8 0L15 3l3 2-1.8 2a7 7 0 0 1 2.4 4.2L21 12l-1 3-2.5-.2a7 7 0 0 1-3.4 3.4L14 21h-4l-.1-2.8a7 7 0 0 1-3.4-3.4L4 15l-1-3 2.4-.8A7 7 0 0 1 7.8 7L6 5l3-2Z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  external: '<path d="M14 3h7v7M21 3l-10 10M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  down: '<path d="m6 10 6 6 6-6"/>',
  edit: '<path d="m16 3 5 5L8 21H3v-5L16 3Z"/><path d="m13 6 5 5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="m3 3 18 18M10.6 5.1A9 9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6.4 6.4A18 18 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5.6-1.4M10 10a3 3 0 0 0 4 4"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 11 3 3 5-5"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4M7 21h10"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  save: '<path d="M3 3h15l3 3v15H3V3Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  reset: '<path d="M3 10a9 9 0 1 1 2 9M3 3v7h7"/>',
  link: '<path d="m10 13 4-4M9 16l-2 2a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0M15 8l2-2a4 4 0 0 1 5 5l-4 4a4 4 0 0 1-5 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (selector, base = document) => base.querySelector(selector);
const $$ = (selector, base = document) => [...base.querySelectorAll(selector)];
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const navItems = [['overview','grid','Visão geral'],['leads','inbox','Formulários'],['banners','image','Banners'],['pages','file','Páginas e conteúdo'],['media','library','Biblioteca de imagens'],['settings','settings','Configurações']];
let catalog;
let state;
let workingPage = null;
let dirty = false;
let previewMode = 'desktop';
let settingsTab = 'account';
let mediaSelection = false;
let mediaSearch = '';
let lastUploadSite = 'securitizadora';
let search = '';
let statusFilter = 'all';
let route;
let lastRouteKey = '';
let navigationPending = false;

function safeURL(value, image = false) {
  if (image && /^data:image\/(webp|jpeg|png|avif);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value;
  try {
    const url = new URL(value, location.href);
    return ['https:','http:','mailto:','tel:'].includes(url.protocol) ? value : '';
  } catch { return ''; }
}
const getSite = (id) => state.sites.find(s => s.id === id);
const getPage = (id) => state.pages.find(p => p.id === id);
const getMedia = (id) => state.media.find(m => m.id === id);
const sitePages = (id) => state.pages.filter(p => !id || id === 'all' || p.site === id);
const siteLabel = (id) => getSite(id)?.name || 'Todos os sites';
const dateFormat = (value) => new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
const sizeFormat = (value) => value > 1048576 ? (value / 1048576).toFixed(1) + ' MB' : Math.round(value / 1024) + ' KB';
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch { toast('Não há espaço no navegador. Exporte seus rascunhos ou remova imagens importadas.','help'); return false; }
}
function activity(title, detail, site) {
  state.activity.unshift({id:crypto.randomUUID(),title,detail,site,at:new Date().toISOString()});
  state.activity = state.activity.slice(0,50);
}
function toast(text, name = 'check') {
  const item = document.createElement('div'); item.className = 'toast';
  item.innerHTML = icon(name) + `<span>${esc(text)}</span>`;
  $('#toasts').append(item); setTimeout(() => item.remove(),4500);
}
function button(label, action, name, extra = '', style = '') {
  return `<button class="button ${style}" data-action="${action}" ${extra}>${name ? icon(name) : ''}${esc(label)}</button>`;
}
function heading(title, description, actions = '') {
  return `<div class="page-heading"><div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
}
function notice(text, kind = '') { return `<div class="notice ${kind}">${icon('help')}<div>${text}</div></div>`; }
function empty(title, text, name = 'inbox', action = '', compact = false) {
  return `<div class="empty-state ${compact ? 'compact' : ''}"><span class="empty-icon">${icon(name)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
}
function tabs(view, active = 'all', counts = false, allowAll = true) {
  const items = allowAll ? [{id:'all',name:'Todos os sites'},...state.sites] : state.sites;
  return `<nav class="site-tabs" aria-label="Selecionar site">${items.map(s => `<a class="site-tab ${active === s.id ? 'active' : ''}" href="#${view}?site=${s.id}" ${active === s.id ? 'aria-current="page"' : ''}>${esc(s.name)}${counts ? `<small>${activeLeads().filter(l => s.id === 'all' || l.site === s.id).length}</small>` : ''}</a>`).join('')}</nav>`;
}
function drawSidebar() {
  $('.sidebar-bottom b').textContent = state.owner.name;
  $('#primary-nav').innerHTML = navItems.map(([id,name,label]) => `<a class="nav-link ${route.view === id || (route.view === 'banner-edit' && id === 'banners') || (route.view === 'page-edit' && id === 'pages') ? 'is-active' : ''}" href="#${id}" aria-label="${label}" title="${label}">${icon(name)}<span>${label}</span>${id === 'leads' ? `<small class="nav-count">${activeLeads().filter(l => l.status === 'new').length}</small>` : ''}</a>`).join('');
  $('#sidebar-sites').innerHTML = state.sites.map(s => `<a class="site-shortcut" href="#pages?site=${s.id}"><span class="site-dot"></span>${esc(s.name)}</a>`).join('');
}
function stat(label, value, foot, name) {
  return `<article class="stat"><div class="stat-top"><span>${esc(label)}</span>${icon(name)}</div><div class="stat-value">${esc(value)}</div><p class="stat-foot">${foot}</p></article>`;
}
function homeImage(site) { const page = state.pages.find(p => p.site === site && p.path === '/'); return getMedia(page?.imageId)?.url || ''; }
function siteCard(s) {
  return `<article class="site-card"><a href="#pages?site=${s.id}" class="site-card__image" aria-label="Gerenciar ${esc(s.name)}"><img src="${esc(homeImage(s.id))}" alt="Prévia do site ${esc(s.name)}"><span class="site-card-mark">${esc(s.name)}</span></a><div class="site-card__body"><h3>${esc(s.fullName)}</h3><span class="site-card__domain">${esc(s.domain)}</span><div class="site-card__meta"><span><b>${sitePages(s.id).length}</b> páginas</span><span>${s.id === 'pay' ? 'Hospedagem externa' : 'Pages'}</span></div><div class="site-card__buttons"><a class="button small" href="#pages?site=${s.id}">Gerenciar site ${icon('arrow')}</a><a class="icon-button" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(s.name)}">${icon('external')}</a></div></div></article>`;
}
function activityList(limit = 4) {
  if (!state.activity.length) return empty('Tudo pronto para começar','Suas alterações de conteúdo aparecerão aqui.','clock','',true);
  return `<div class="activity-list">${state.activity.slice(0,limit).map(a => `<div class="activity-row"><span class="activity-icon">${icon('edit')}</span><div><b>${esc(a.title)}</b><p>${esc(a.detail)}</p><time datetime="${esc(a.at)}">${dateFormat(a.at)}</time></div></div>`).join('')}</div>`;
}
function overview() {
  const leads = activeLeads();
  const actions = button(state.demo ? 'Sair dos exemplos' : 'Explorar com exemplos','toggle-demo','eye','','demo-button ' + (state.demo ? 'is-enabled' : ''));
  const rows = leads.slice(0,3);
  return heading('Um bom dia para cuidar dos seus sites.','Conteúdo e atendimento do grupo, em um só lugar.',actions)
    + (state.demo ? notice('<b>Dados de exemplo.</b> Os contatos abaixo são fictícios e servem para explorar o painel.','demo') : '')
    + `<section class="dashboard-hero"><div><h2>Três marcas.<br>Uma gestão mais simples.</h2><p>Atualize o que seus clientes veem e organize as conversas que chegam, sem perder de vista cada negócio.</p></div><div class="hero-note"><span>${icon('globe')}</span><div><b>Um acesso para todos os sites</b><p>Securitizadora, CredCartas e CredMais Pay.</p></div></div></section>`
    + `<section class="stats-row" aria-label="Resumo do painel">${stat('Sites no painel',state.sites.length,'<span>Três marcas</span>, uma central','globe')}${stat('Formulários recebidos',leads.length,state.demo ? 'Contatos fictícios para prévia' : 'Formulários enviados pelos sites','inbox')}${stat('Novos contatos',leads.filter(l => l.status === 'new').length,state.demo ? 'Nos exemplos do painel' : 'Acompanhe os novos atendimentos','user')}${stat('Rascunhos de conteúdo',state.pages.filter(p => p.draft).length,'Alterações salvas neste navegador','file')}</section>`
    + `<div class="dashboard-grid"><div><section aria-labelledby="sites-title"><div class="section-heading"><h2 id="sites-title">Seus sites, lado a lado.</h2><a href="#pages">Ver páginas ${icon('arrow')}</a></div><div class="sites-grid">${state.sites.map(siteCard).join('')}</div></section><section class="panel inbox-preview"><div class="panel-heading"><h2>Últimos formulários</h2><a class="inline-link" href="#leads">Abrir caixa de entrada</a></div>${rows.length ? leadTable(rows) : empty('Sua próxima conversa começa aqui.','Os envios de cada site serão organizados nesta caixa, com os dados e o produto de interesse.','inbox',button('Conhecer a caixa de entrada','goto-leads','arrow'),true)}</section></div><aside class="dashboard-aside"><section class="panel quick-actions"><div class="panel-heading"><h2>O que vamos fazer hoje?</h2></div>${[['image','Atualizar um banner','Imagem, texto e botão','banners'],['file','Editar uma página','Organize o conteúdo do site','pages'],['upload','Adicionar imagens','Deixe a biblioteca pronta','media']].map(([i,t,p,v]) => `<a class="quick-action" href="#${v}"><span>${icon(i)}</span><span><b>${t}</b><small>${p}</small></span>${icon('chevron')}</a>`).join('')}</section><section class="panel"><div class="panel-heading"><h2>Últimas alterações</h2>${icon('clock')}</div>${activityList()}</section></aside></div>`;
}
const statuses = {new:['Novo',''],contacted:['Em atendimento','contacted'],done:['Concluído','done']};
function statusTag(value) { const s = statuses[value] || statuses.new; return `<span class="status ${s[1]}">${s[0]}</span>`; }
function leadTable(leads) {
  return `<div class="table-wrap"><table><thead><tr><th>Contato</th><th>Site / interesse</th><th>Recebido em</th><th>Status</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${leads.map(l => `<tr><td><div class="row-person"><span>${esc(l.name.split(' ').map(w => w[0]).slice(0,2).join(''))}</span><div><b>${esc(l.name)}</b><small>${esc(l.email || l.phone)}</small></div></div></td><td><b>${esc(siteLabel(l.site))}</b><br><small style="color:var(--muted)">${esc(l.product)}</small></td><td>${dateFormat(l.at)}</td><td>${statusTag(l.status)}</td><td><button class="icon-button" data-action="lead-detail" data-id="${l.id}" aria-label="Ver dados de ${esc(l.name)}">${icon('chevron')}</button></td></tr>`).join('')}</tbody></table></div>`;
}
function filteredLeads() {
  return activeLeads().filter(l => (route.site === 'all' || !route.site || l.site === route.site) && (statusFilter === 'all' || l.status === statusFilter) && [l.name,l.email,l.phone,l.product,l.company,l.message].join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
}
function leadsView() {
  return heading('Cada contato, no seu lugar.','Acompanhe os formulários e os interesses de cada site.',button(state.demo ? 'Sair dos exemplos' : 'Ver exemplos','toggle-demo','eye','','demo-button ' + (state.demo ? 'is-enabled' : '')) + button('Exportar contatos','export-leads','download')+'<button class="button" data-cms="refresh">Atualizar</button>')
    + tabs('leads',route.site || 'all',true)
    + (state.demo ? notice('<b>Contatos de exemplo.</b> Status e anotações funcionam na prévia. Nenhuma mensagem é enviada.','demo') : notice('Os envios dos três sites chegam nesta caixa. Atualização automática a cada 30 segundos.'))
    + `<section class="panel"><div class="filterbar"><label class="search-field">${icon('search')}<input class="input" id="lead-search" type="search" placeholder="Buscar nome, produto ou telefone" aria-label="Buscar formulários" value="${esc(search)}"></label><div class="filter-controls"><span class="result-count" id="lead-count"></span><label><span class="sr-only">Filtrar por status</span><select id="status-filter"><option value="all">Todos os status</option>${Object.entries(statuses).map(([k,s]) => `<option value="${k}" ${statusFilter === k ? 'selected' : ''}>${s[0]}</option>`).join('')}</select></label></div></div><div id="lead-results"></div><div class="table-footer"><span>Dados separados por site de origem</span><span>${state.demo ? 'Prévia com exemplos' : 'Conectado ao Supabase'}</span></div></section>`;
}
function drawLeadResults() {
  const rows = filteredLeads();
  $('#lead-count').textContent = `${rows.length} contato${rows.length === 1 ? '' : 's'}`;
  $('#lead-results').innerHTML = rows.length ? leadTable(rows) : empty(state.demo ? 'Nenhum contato nesta busca.' : 'Ainda não há formulários recebidos.',state.demo ? 'Tente outro nome ou altere os filtros.' : 'Os formulários enviados nos sites aparecerão aqui, separados pela marca de origem.','inbox',state.demo ? '' : button('Explorar com exemplos','toggle-demo','eye'));
}
function bannerCard(p) {
  const media = getMedia(p.imageId);
  return `<article class="banner-card"><a class="banner-thumb" href="#banner-edit?id=${p.id}" aria-label="Editar banner de ${esc(p.name)}"><img src="${esc(media?.url || '')}" alt="${esc(media?.name || p.name)}" loading="lazy"></a><div class="banner-card__body"><div class="banner-card__title"><h3>${esc(p.name)}</h3><span class="status ${p.draft ? 'contacted' : 'done'}">${p.draft ? 'Rascunho local' : 'Original'}</span></div><p>${esc(siteLabel(p.site))} <span aria-hidden="true">/</span> ${esc(p.path)}</p><div class="banner-card__actions"><span>Texto, imagem e chamada</span><a class="button small" href="#banner-edit?id=${p.id}">${icon('edit')} Editar banner</a></div></div></article>`;
}
function bannersView() {
  const site = route.site || 'all';
  return heading('Uma boa primeira impressão.','Cuide dos banners de cada marca, com prévia em desktop e celular.',`<a href="#media" class="button">${icon('library')} Biblioteca de imagens</a>`)
    + tabs('banners',site)
    + `<div class="banner-list">${sitePages(site).map(bannerCard).join('')}</div>`;
}
function bannerPreview(p, withFrame = true) {
  const image = getMedia(p.imageId);
  const markup = `<div class="banner-preview ${p.alignment === 'right' ? 'copy-right' : ''} ${p.theme === 'white' ? 'copy-light' : ''}" style="--image-position:${esc(p.position || 'center')}"><img src="${esc(image?.url || '')}" style="object-position:${esc(p.position || 'center')}" alt="${esc(image?.name || '')}"><div class="banner-preview__copy"><span>${esc(siteLabel(p.site))}</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><span class="preview-cta">${esc(p.button)} ${icon('arrow')}</span></div></div>`;
  return withFrame ? `<div class="browser-frame ${previewMode === 'mobile' ? 'mobile' : ''}" id="banner-frame"><div class="browser-top"><i></i><i></i><i></i><span>${esc(getSite(p.site).domain + p.path)}</span></div>${markup}</div>` : markup;
}
function field(label,name,value,type = 'input',help = '',extra = '') {
  return `<label class="field"><span>${esc(label)}</span>${type === 'textarea' ? `<textarea name="${name}" rows="3" ${extra}>${esc(value)}</textarea>` : `<input class="input" name="${name}" value="${esc(value)}" ${extra}>`}${help ? `<small>${help}</small>` : ''}</label>`;
}
function bannerEditor() {
  if (!workingPage) return empty('Banner não encontrado.','Abra um banner na lista.','image','<a class="button" href="#banners">Ver banners</a>');
  const p = workingPage; const image = getMedia(p.imageId);
  return heading(`Banner · ${p.name}`,`${siteLabel(p.site)} / ${p.path}`,`<a href="#banners?site=${p.site}" class="button">${icon('back')} Voltar</a>${button('Salvar rascunho','save-page','save','','primary')}`)
    + `<div class="editor-grid"><section class="editor-panel"><h2>Conteúdo do banner</h2><form id="banner-form">${field('Título','title',p.title,'textarea','Use quebras de linha para organizar o título.','maxlength="180" required')}${field('Descrição','description',p.description,'textarea','','maxlength="600"')}${field('Texto do botão','button',p.button,'input','','maxlength="60" required')}${field('Destino do botão','buttonUrl',p.buttonUrl,'input','Uma página do site ou um endereço completo.','required')}<div class="field"><span>Imagem</span><button class="image-picker" type="button" data-action="pick-image"><img src="${esc(image?.url || '')}" alt=""><span><b>${esc(image?.name || 'Selecionar imagem')}</b><small>Escolher na biblioteca</small></span>${icon('library')}</button></div><div class="field-columns"><label class="field"><span>Texto no banner</span><select name="alignment"><option value="left" ${p.alignment === 'left' ? 'selected' : ''}>À esquerda</option><option value="right" ${p.alignment === 'right' ? 'selected' : ''}>À direita</option></select></label><label class="field"><span>Cor do texto</span><select name="theme"><option value="blue" ${p.theme === 'blue' ? 'selected' : ''}>Branco sobre azul</option><option value="white" ${p.theme === 'white' ? 'selected' : ''}>Azul sobre branco</option></select></label></div><label class="field"><span>Enquadramento da imagem</span><select name="position"><option value="left" ${p.position === 'left' ? 'selected' : ''}>Priorizar esquerda</option><option value="center" ${p.position === 'center' ? 'selected' : ''}>Centralizado</option><option value="right" ${p.position === 'right' ? 'selected' : ''}>Priorizar direita</option></select></label><div class="toggle-row"><div><b>Exibir banner</b><p>Controle de visibilidade do rascunho.</p></div><label class="switch"><input type="checkbox" name="visible" ${p.visible ? 'checked' : ''} aria-label="Exibir banner"><span></span></label></div></form><div class="form-actions"><span id="save-state" class="save-state">Rascunho aberto</span>${button('Restaurar original','restore-banner','reset','','small')}</div></section><aside class="preview-column"><div class="preview-toolbar"><span>Prévia do banner</span><div class="segmented" aria-label="Tamanho da prévia"><button data-action="preview-desktop" class="${previewMode === 'desktop' ? 'active' : ''}" aria-label="Prévia desktop" aria-pressed="${previewMode === 'desktop'}">${icon('monitor')}</button><button data-action="preview-mobile" class="${previewMode === 'mobile' ? 'active' : ''}" aria-label="Prévia celular" aria-pressed="${previewMode === 'mobile'}">${icon('phone')}</button></div></div><div id="preview-host">${bannerPreview(p)}</div><p class="preview-caption">Prévia de composição. O layout final segue a página de cada site.<br>Salvar guarda um rascunho neste navegador; a publicação será conectada depois.</p><div class="notice">${icon('image')}<div>Posicione o texto na área livre da imagem para preservar o rosto das pessoas.</div></div></aside></div>`;
}
function pagesView() {
  const site = route.site || 'all';
  return heading('Conteúdo que acompanha o negócio.','Encontre uma página e ajuste textos, seções e informações de busca.',button('Exportar rascunhos','export-drafts','download'))
    + tabs('pages',site)
    + `<div class="page-list">${sitePages(site).map(p => `<article class="page-row"><span class="page-row__icon">${icon('file')}</span><div class="page-row__text"><h3>${esc(p.name)}</h3><p>${esc(siteLabel(p.site))} / ${esc(p.path)}</p></div><span class="page-row__count">${p.sections.length} seções</span><span class="status ${p.draft ? 'contacted' : 'done'}">${p.draft ? 'Rascunho local' : 'Original'}</span><div class="page-row__actions"><a class="button small" href="#page-edit?id=${p.id}">${icon('edit')} Editar conteúdo</a><a class="icon-button" href="${esc(pageURL(p))}" target="_blank" rel="noopener noreferrer" aria-label="Abrir página ${esc(p.name)}">${icon('external')}</a></div></article>`).join('')}</div>`;
}
function pageURL(p) { return p.site === 'securitizadora' ? p.path : getSite(p.site).url + p.path; }
function pageEditor() {
  if (!workingPage) return empty('Página não encontrada.','Escolha uma página na lista.','file','<a class="button" href="#pages">Ver páginas</a>');
  return renderPageBuilder(workingPage);
}
function mediaView() {
  const site = route.site || 'all';
  const media = state.media.filter(m => (site === 'all' || m.site === site) && m.name.toLocaleLowerCase('pt-BR').includes(mediaSearch.toLocaleLowerCase('pt-BR')));
  return heading('Imagens prontas para o próximo passo.','Uma biblioteca para organizar o visual de cada site.',button('Adicionar imagens','upload-media','upload','','primary'))
    + tabs('media',site)
    + `<div class="media-toolbar"><label class="search-field">${icon('search')}<input class="input" id="media-search" type="search" placeholder="Buscar imagem" aria-label="Buscar imagem" value="${esc(mediaSearch)}"></label><span class="result-count">${media.length} imagens · ${sizeFormat(media.reduce((a,m) => a + m.size,0))}</span></div><div class="upload-drop" id="upload-drop" tabindex="0" role="button" aria-label="Adicionar imagens">${icon('upload')}<b>Arraste uma imagem ou escolha no computador.</b><p>PNG, JPG, WebP ou AVIF. As importações ficam na prévia local.</p></div><div class="media-grid">${media.map(mediaCard).join('')}</div>${!media.length ? empty('Nenhuma imagem encontrada.','Altere a busca ou adicione imagens para este site.','image') : ''}`;
}
function mediaCard(m) {
  return `<article class="media-item"><div class="media-item__visual"><img src="${esc(m.url)}" alt="${esc(m.name)}" loading="lazy"></div><div class="media-item__body"><h3 title="${esc(m.name)}">${esc(m.name)}</h3><p>${esc(siteLabel(m.site))} · ${m.width} × ${m.height} · ${sizeFormat(m.size)}</p><div class="media-item__actions">${button('Visualizar','view-media','eye',`data-id="${m.id}"`,'small')}${m.uploaded ? `<button class="icon-button" data-action="delete-media" data-id="${m.id}" aria-label="Remover imagem ${esc(m.name)}">${icon('trash')}</button>` : '<span class="status done">Original</span>'}</div></div></article>`;
}
function settingsView() {
  const names = {account:'Administrador',sites:'Dados dos sites',connections:'Conexões',drafts:'Rascunhos e segurança'};
  return heading('Tudo ajustado para o seu jeito.','Preferências da central e informações dos três sites.')
    + `<div class="settings-layout"><nav class="settings-nav" aria-label="Configurações">${Object.entries(names).map(([k,n]) => `<button data-action="settings-tab" data-id="${k}" class="${settingsTab === k ? 'active' : ''}">${n}</button>`).join('')}</nav>${settingsContent()}</div>`;
}
function settingsContent() {
  if (settingsTab === 'account') return `<section class="settings-card"><h2>Um administrador para o grupo.</h2><p>Um único acesso para acompanhar as três marcas.</p><div class="owner-block"><span class="owner-avatar">CM</span><div><h3>${esc(state.owner.name)}</h3><p>contato@sejacredmais.com</p></div><span class="status done" style="margin-left:auto">Proprietário</span></div><form id="owner-form">${field('Nome de exibição','name',state.owner.name,'input','','required maxlength="80"')}${field('E-mail de acesso','email','contato@sejacredmais.com','input','E-mail exclusivo do proprietário.','type="email" readonly')}${button('Salvar preferência','save-owner','save','','primary')}</form><div class="section-heading section-heading--space"><h2>Tela de acesso</h2><a href="#login">Ver prévia ${icon('arrow')}</a></div><p class="preview-caption">Login conectado ao Supabase. Cadastro público desativado.</p><form id="password-form"><h2>Alterar senha</h2><label class="field"><span>Nova senha</span><input type="password" name="password" autocomplete="new-password" minlength="12" required></label><label class="field"><span>Confirmar senha</span><input type="password" name="confirm" autocomplete="new-password" minlength="12" required></label><button type="submit" class="button primary">Atualizar senha</button></form><button class="button" data-cms="logout" style="margin-top:20px">Sair do painel</button></section>`;
  if (settingsTab === 'connections') return `<section class="settings-card"><h2>Conexões da central</h2><p>Integrações ativas da central.</p>${[['Supabase','Acesso do administrador, formulários e conteúdos.'],['Cloudflare','Hospedagem da Securitizadora e da CredCartas.'],['Resend','Avisos de novos formulários por e-mail.'],['CredMais Pay','Integração do painel com hospedagem externa.']].map(([n,p]) => `<div class="connection-row"><div><h3>${n}</h3><p>${p}</p></div><span class="status done">Conectado</span></div>`).join('')}<div class="notice" style="margin-top:25px;margin-bottom:0">${icon('shield')}<div>Credenciais de serviços são configuradas no servidor. Este painel não recebe nem armazena tokens privados.</div></div></section>`;
  if (settingsTab === 'drafts') return `<section class="settings-card"><h2>Seus rascunhos estão no Supabase.</h2><p>Você também pode exportar uma cópia das alterações.</p><div class="key-value"><span>Páginas com rascunho</span><b>${state.pages.filter(p => p.draft).length}</b></div><div class="key-value"><span>Imagens importadas</span><b>${state.media.filter(m => m.uploaded).length}</b></div><div class="key-value"><span>Armazenamento aproximado</span><b>${sizeFormat(new Blob([JSON.stringify(state)]).size)}</b></div><div class="heading-actions" style="margin-top:22px">${button('Exportar rascunhos','export-drafts','download')}${button('Restaurar a prévia','reset-preview','reset','','danger')}</div><div class="notice" style="margin-top:25px;margin-bottom:0">${icon('shield')}<div>Os formulários reais ficam protegidos no banco. Restaurar esta prévia não apaga contatos ou páginas publicadas.</div></div></section>`;
  const selected = route.site && route.site !== 'all' ? route.site : state.sites[0].id; const s = getSite(selected);
  return `<section class="settings-card"><h2>Informações dos sites</h2><p>Contatos públicos e preferências de cada marca.</p>${tabs('settings',selected,false,false)}<form id="site-settings-form" data-site="${s.id}">${field('Nome do site','fullName',s.fullName,'input','','required maxlength="100"')}${field('Domínio','domain',s.domain,'input','Endereço de referência no painel.','required maxlength="150"')}${field('E-mail de atendimento','email',s.email || 'contato@sejacredmais.com','input','','type="email" required')}${field('WhatsApp de atendimento','phone',s.phone || '(11) 94089-3852','input','','type="tel" maxlength="25"')}${button('Salvar rascunho','save-site-settings','save','','primary')}</form></section>`;
}
function loginView() {
  return `<div class="login-view"><section class="login-card"><a href="#overview"><img src="/assets/img/logo.png" alt="CredMais"></a><h1>Bem-vindo à sua central.</h1><p>Um acesso para cuidar dos seus sites e acompanhar cada nova conversa.</p><form id="login-form">${field('E-mail','email','contato@sejacredmais.com','input','','type="email" autocomplete="username" readonly')}<label class="field"><span>Senha</span><div class="password-field"><input class="input" type="password" name="password" placeholder="Sua senha" autocomplete="current-password" required minlength="12"><button type="button" class="icon-button" data-action="show-password" aria-label="Mostrar senha">${icon('eye')}</button></div></label><div class="login-links"><span>Acesso exclusivo do proprietário</span><button type="button" data-action="forgot-password">Esqueci minha senha</button></div><button type="submit" class="button navy">Entrar no painel ${icon('arrow')}</button></form><small>Acesso exclusivo do proprietário. Seus dados são protegidos pelo Supabase.</small></section></div>`;
}
function showModal(title, body, actions = '') {
  $('#modal-content').innerHTML = `<div class="dialog-head"><h2>${esc(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="Fechar janela">${icon('close')}</button></div><div class="dialog-body">${body}</div>${actions ? `<div class="dialog-actions">${actions}</div>` : ''}`;
  if (!$('#modal').open) $('#modal').showModal();
}
function chooseImage() {
  mediaSelection = true;
  showModal('Escolha uma imagem',`<p>Biblioteca de ${esc(siteLabel(workingPage.site))}. Preserve a identidade de cada marca.</p><div class="dialog-media-grid">${state.media.filter(m => m.site === workingPage.site).map(m => `<button class="media-select" data-action="select-image" data-id="${m.id}"><img src="${esc(m.url)}" alt="${esc(m.name)}"><span>${esc(m.name)}</span></button>`).join('')}</div>`,button('Adicionar imagem','upload-media','upload') + button('Cancelar','close-modal'));
}
function leadDetail(id) {
  const l = activeLeads().find(l => l.id === id); if (!l) return;
  showModal('Dados do formulário',(state.demo ? notice('<b>Contato fictício para prévia.</b> Nenhuma mensagem será enviada.','demo') : '') + `<div class="detail-person"><span class="owner-avatar">${esc(l.name.split(' ').map(w => w[0]).slice(0,2).join(''))}</span><div><h3>${esc(l.name)}</h3><p>${esc(siteLabel(l.site))} · ${dateFormat(l.at)}</p></div></div><dl class="detail-grid">${[['Interesse',l.product],['Empresa',l.company || 'Não informado'],['E-mail',l.email || 'Não informado'],['Telefone',l.phone || 'Não informado']].map(([k,v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="detail-message">${esc(l.message)}</div><form id="lead-form" data-id="${id}"><label class="field"><span>Status do atendimento</span><select name="status">${Object.entries(statuses).map(([k,s]) => `<option value="${k}" ${l.status === k ? 'selected' : ''}>${s[0]}</option>`).join('')}</select></label>${field('Anotações internas','notes',l.notes || '','textarea','As anotações ficam no painel e são visíveis apenas ao proprietário.','maxlength="3000"')}</form>`,button('Fechar','close-modal') + button('Salvar atendimento','save-lead','save',`data-id="${id}"`,'primary'));
}
function editSection(id) {
  const s = workingPage.sections.find(s => s.id === id); if (!s) return;
  showModal('Editar seção',`<form id="section-form" data-id="${id}">${field('Título da seção','title',s.title,'input','','required maxlength="180"')}${field('Texto da seção','text',s.text || '','textarea','Rascunho do texto. A integração com o conteúdo do site será feita na próxima etapa.','rows="6" maxlength="5000"')}</form>`,button('Cancelar','close-modal') + button('Aplicar ao rascunho','save-section','check',`data-id="${id}"`,'primary'));
}
function savePage() {
  if (route.view === 'page-edit') { builderSave(false);return; }
  const form = $('#banner-form');
  if (form && !form.reportValidity()) return;
  if (workingPage && !safeURL(workingPage.buttonUrl)) { toast('Informe um destino válido para o botão.','help'); return; }
  const seo = $('#seo-form');
  if (seo) { const data = new FormData(seo); workingPage.seoTitle = data.get('seoTitle'); workingPage.seoDescription = data.get('seoDescription'); }
  const index = state.pages.findIndex(p => p.id === workingPage.id); if (index < 0) return;
  const previous = state.pages[index]; const previousActivity = clone(state.activity);
  workingPage.draft = true; workingPage.updatedAt = new Date().toISOString();
  state.pages[index] = clone(workingPage);
  cmsSavePage(workingPage);
  activity('Rascunho salvo',`${siteLabel(workingPage.site)} / ${workingPage.name}`,workingPage.site);
  if (!persist()) { state.pages[index] = previous; state.activity = previousActivity; return; }
  dirty = false; $('#save-state').textContent = 'Rascunho salvo · ' + dateFormat(workingPage.updatedAt);
  toast('Rascunho salvo neste navegador.');
}
function updateWorking(form) {
  if (!workingPage) return;
  for (const [name,value] of new FormData(form)) if (name !== 'visible') workingPage[name] = value;
  if (form.id === 'banner-form') workingPage.visible = form.elements.visible.checked;
  dirty = true;
  if ($('#save-state')) $('#save-state').textContent = 'Há alterações ainda não salvas.';
  if ($('#preview-host')) $('#preview-host').innerHTML = bannerPreview(workingPage);
}
function demoContacts() {
  const t = Date.now();
  return [
    ['securitizadora','Contato de exemplo A','Pix Parcelado','Loja de exemplo','Quero conhecer a opção de vender por Pix parcelado.','new'],
    ['cartas','Contato de exemplo B','Carta para imóvel','','Gostaria de entender as condições de uma carta contemplada para imóvel.','new'],
    ['pay','Contato de exemplo C','Empréstimos e microcrédito','','Gostaria de conhecer as opções disponíveis para o meu perfil.','contacted'],
    ['securitizadora','Contato de exemplo D','Antecipação de recebíveis','Empresa de exemplo','Tenho valores a receber e gostaria de conversar sobre antecipação.','new'],
    ['cartas','Contato de exemplo E','Carta para veículo','','Procuro orientação para uma carta de crédito para carro.','done'],
    ['pay','Contato de exemplo F','Conta digital','','Quero entender como funciona a abertura de conta.','done'],
  ].map(([site,name,product,company,message,status],i) => ({id:'demo-'+i,site,name,product,company,message,status,email:`exemplo${i + 1}@example.com`,phone:'Não informado',at:new Date(t-i*3600000).toISOString(),notes:''}));
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content],{type})); const link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
function exportLeads() {
  const leads = filteredLeads();
  if (!leads.length) { toast('Não há contatos para exportar.','help'); return; }
  // Prefixo evita fórmulas ao abrir texto fornecido por clientes em planilhas.
  const csvCell = value => '"' + (/^[=+@\-\t\r\n]/.test(String(value)) ? "'" : '') + String(value ?? '').replace(/"/g,'""') + '"';
  const rows = [['Tipo','Site','Nome','Empresa','E-mail','Telefone','Interesse','Mensagem','Status','Anotações','Recebido em'],...leads.map(l => [state.demo?'Exemplo fictício':'Contato recebido',siteLabel(l.site),l.name,l.company,l.email,l.phone,l.product,l.message,statuses[l.status][0],l.notes,l.at])];
  download(state.demo?'credmais-contatos-exemplo.csv':'credmais-contatos.csv','\uFEFF' + rows.map(r => r.map(csvCell).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  toast('Contatos exportados.');
}
function exportDrafts() {
  download('credmais-rascunhos.json',JSON.stringify({version:1,type:'local-preview',exportedAt:new Date().toISOString(),sites:state.sites,pages:state.pages.filter(p => p.draft),images:state.media.filter(m => m.uploaded)},null,2),'application/json');
  toast('Cópia dos rascunhos exportada.');
}
async function uploadMedia(files) {
  const selectedSite = mediaSelection && workingPage ? workingPage.site : route.site && route.site !== 'all' ? route.site : lastUploadSite;
  for (const file of files) {
    if (!['image/png','image/jpeg','image/webp','image/avif'].includes(file.type)) { toast('Escolha uma imagem PNG, JPG, WebP ou AVIF.','help'); continue; }
    if (file.size > 20 * 1024 * 1024) { toast('Escolha uma imagem de até 20 MB.','help'); continue; }
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      const ratio = Math.min(1,1400 / Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width*ratio);canvas.height = Math.round(bitmap.height*ratio);
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      const url = canvas.toDataURL('image/webp',.82);
      const record = {id:crypto.randomUUID(),site:selectedSite,name:file.name.replace(/\.[^.]+$/,''),url,width:canvas.width,height:canvas.height,size:Math.round((url.length-url.indexOf(',')-1)*.75),uploaded:true};
      await cmsUpload(record);state.media.unshift(record);
      const previousActivity = clone(state.activity); activity('Imagem adicionada',`${siteLabel(selectedSite)} / ${record.name}`,selectedSite);
      if (!persist()) { state.media.shift();state.activity=previousActivity;continue; }
      toast('Imagem adicionada à biblioteca do Supabase.');
    } catch { toast(`Não foi possível abrir ${file.name}. Escolha outra imagem.`,'help'); }
    finally { bitmap?.close(); }
  }
  $('#media-upload').value = '';
  if (route.view==='page-edit'&&bImageTarget){render();bOpenImages(bImageTarget.target);}else if (mediaSelection) chooseImage(); else render();
}
function openUpload() {
  if (mediaSelection || route.site && route.site !== 'all') { $('#media-upload').click(); return; }
  showModal('Adicionar imagens',`<p>Selecione o site que usará estas imagens.</p><label class="field"><span>Site</span><select id="upload-site">${state.sites.map(s => `<option value="${s.id}" ${lastUploadSite === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label><p>As imagens são otimizadas e guardadas no Supabase para usar nos três sites.</p>`,button('Cancelar','close-modal') + button('Escolher arquivos','confirm-upload','upload','','primary'));
}
function openMenu() {
  $('#sidebar').classList.add('open');$('#sidebar-backdrop').hidden=false;$('#mobile-menu').setAttribute('aria-expanded','true');document.body.style.overflow='hidden';$('#sidebar-close').focus();
}
function closeMenu() {
  const opened = $('#sidebar').classList.contains('open');$('#sidebar').classList.remove('open');$('#sidebar-backdrop').hidden=true;$('#mobile-menu').setAttribute('aria-expanded','false');document.body.style.overflow='';if (opened) $('#mobile-menu').focus();
}
function parseRoute() {
  const [view = 'overview',query=''] = location.hash.slice(1).split('?'); const params = new URLSearchParams(query);
  const allowedViews = ['overview','leads','banners','banner-edit','pages','page-edit','media','settings','login'];
  return {view:allowedViews.includes(view) ? view : 'overview',site:params.get('site') || 'all',id:params.get('id')};
}
function navigate() {
  let next = parseRoute();if(!cmsSession&&next.view!=='login'){next={view:'login',site:'all',id:null};history.replaceState(null,'','#login');} const key = next.view + ':' + (next.id || '') + ':' + next.site;
  if (dirty && next.id !== workingPage?.id) {
    if(route.view==='page-edit')clearTimeout(bTimer);
    navigationPending = true;
    showModal('Salvar antes de sair?',`<p>Há alterações neste rascunho. Você pode salvar e continuar ou sair sem salvar.</p>`,button('Continuar editando','cancel-navigation')+button('Sair sem salvar','discard-navigation','',`data-route="${esc(location.hash)}"`)+button('Salvar e continuar','save-navigation','save',`data-route="${esc(location.hash)}"`,'primary'));
    return;
  }
  route = next;
  if (!getSite(route.site) && route.site !== 'all') route.site = 'all';
  if (route.view === 'banner-edit' || route.view === 'page-edit') {
    if (!workingPage || workingPage.id !== route.id) { workingPage = getPage(route.id) ? clone(getPage(route.id)) : null;dirty=false; }
  } else { workingPage = null;dirty=false; }
  if (key !== lastRouteKey) { closeMenu();window.scrollTo({top:0,behavior:'instant'}); }
  lastRouteKey = key;render();
}
function render() {
  if(route.view!=='page-edit')disposePageBuilder();
  document.body.classList.toggle('builder-mode',route.view === 'page-edit');
  $('.preview-indicator').textContent=cmsSession?'Conectado':'Acesso protegido';
  document.title = (route.view === 'login' ? 'Acesso' : navItems.find(n => n[0] === route.view)?.[2] || (route.view === 'banner-edit' ? 'Editor de banner' : 'Editor de página')) + ' | Painel CredMais';
  $('#app-shell').classList.toggle('login-mode',route.view === 'login');
  $('#breadcrumb').textContent = navItems.find(n => n[0] === route.view)?.[2] || (route.view === 'banner-edit' ? 'Editor de banner' : route.view === 'page-edit' ? 'Editor de página' : 'Acesso');
  drawSidebar();
  const views = {overview,leads:leadsView,banners:bannersView,'banner-edit':bannerEditor,pages:pagesView,'page-edit':pageEditor,media:mediaView,settings:settingsView,login:loginView};
  $('#workspace').innerHTML = views[route.view]();
  if (route.view === 'leads') drawLeadResults();
  if (route.view === 'page-edit' && workingPage) mountPageBuilder();
}
function closeModal() {
  $('#modal').close();mediaSelection=false;
  if (navigationPending) {
    history.replaceState(null,'',`#${route.view}${route.id ? '?id='+route.id : route.site !== 'all' ? '?site='+route.site : ''}`);
    navigationPending=false;
  }
}

document.addEventListener('click',async (event) => {
  const element = event.target.closest('[data-action]'); if (!element || element.disabled) return;
  const {action,id} = element.dataset;
  switch (action) {
    case 'close-modal':closeModal();break;
    case 'goto-leads':location.hash='leads';break;
    case 'toggle-demo':state.demo=!state.demo;if (state.demo && !state.demoLeads.length) state.demoLeads=demoContacts();persist();render();break;
    case 'lead-detail':leadDetail(id);break;
    case 'save-lead': {
      const form=$('#lead-form');if (!form.reportValidity()) return;
      if(!state.demo){try{await cmsSaveLead(form,id);}catch(error){toast(error.message,'help');}return;}
      const lead=state.demoLeads.find(l => l.id === id);const data=new FormData(form);lead.status=data.get('status');lead.notes=data.get('notes');persist();closeModal();render();toast('Atendimento de exemplo atualizado.');break;
    }
    case 'export-leads':exportLeads();break;
    case 'export-drafts':exportDrafts();break;
    case 'save-page':savePage();break;
    case 'pick-image':chooseImage();break;
    case 'select-image':workingPage.imageId=id;dirty=true;closeModal();render();$('#save-state').textContent='Há alterações ainda não salvas.';break;
    case 'preview-desktop':case 'preview-mobile':previewMode=action === 'preview-mobile' ? 'mobile' : 'desktop';render();break;
    case 'restore-banner':showModal('Restaurar o banner original?',`<p>O título, a imagem e o botão voltarão à configuração inicial da prévia. Salve o rascunho para guardar essa alteração.</p>`,button('Cancelar','close-modal')+button('Restaurar','confirm-restore','reset','','navy'));break;
    case 'confirm-restore':{
      const original=catalog.pages.find(p => p.id === workingPage.id);
      for (const k of ['title','description','imageId','button','buttonUrl','alignment','theme','position','visible']) workingPage[k]=original[k];
      dirty=true;closeModal();render();$('#save-state').textContent='Há alterações ainda não salvas.';break;
    }
    case 'edit-section':editSection(id);break;
    case 'save-section': {
      const form=$('#section-form');if (!form.reportValidity()) return;
      const data=new FormData(form);const s=workingPage.sections.find(s => s.id === id);s.title=data.get('title');s.text=data.get('text');dirty=true;closeModal();render();break;
    }
    case 'toggle-section':{const s=workingPage.sections.find(s => s.id === id);s.visible=!s.visible;dirty=true;render();break;}
    case 'section-up':case 'section-down':{
      const index=workingPage.sections.findIndex(s => s.id === id);const next=index+(action === 'section-up' ? -1 : 1);
      if (next < 0 || next >= workingPage.sections.length) return;
      [workingPage.sections[index],workingPage.sections[next]]=[workingPage.sections[next],workingPage.sections[index]];dirty=true;render();break;
    }
    case 'upload-media':openUpload();break;
    case 'confirm-upload':lastUploadSite=$('#upload-site').value;closeModal();$('#media-upload').click();break;
    case 'view-media':{const m=getMedia(id);showModal(m.name,`<img class="media-full" src="${esc(m.url)}" alt="${esc(m.name)}"><p style="margin-top:15px">${esc(siteLabel(m.site))} · ${m.width} × ${m.height} · ${sizeFormat(m.size)}</p>`,button('Fechar','close-modal'));break;}
    case 'delete-media':{
      const used=state.pages.some(p => p.imageId === id || p.sections.some(s => s.imageId === id || s.items?.some(i => i.imageId === id)))||workingPage?.imageId === id||workingPage?.sections.some(s=>s.imageId===id||s.items?.some(i=>i.imageId===id));
      if (used) {toast('Esta imagem está em um banner. Troque a imagem antes de remover.','help');return;}
      showModal('Remover esta imagem?',`<p>A imagem importada será removida da biblioteca local.</p>`,button('Cancelar','close-modal')+button('Remover','confirm-delete-media','trash',`data-id="${id}"`,'danger'));break;
    }
    case 'confirm-delete-media':try{await cmsDeleteImage(id);}catch(error){toast(error.message,'help');return;}state.media=state.media.filter(m => m.id !== id || !m.uploaded);persist();closeModal();render();toast('Imagem removida da prévia.');break;
    case 'settings-tab':settingsTab=id;render();break;
    case 'save-owner':{
      const form=$('#owner-form');if (!form.reportValidity()) return;
      state.owner.name=String(new FormData(form).get('name')).trim() || 'Administrador';persist();try{await cmsSaveSettings();toast('Preferência salva.');}catch(error){toast(error.message,'help');}render();break;
    }
    case 'save-site-settings':{
      const form=$('#site-settings-form');if (!form.reportValidity()) return;
      Object.assign(getSite(form.dataset.site),Object.fromEntries(new FormData(form)));activity('Dados do site ajustados',siteLabel(form.dataset.site),form.dataset.site);persist();try{await cmsSaveSettings();toast('Dados do site salvos.');}catch(error){toast(error.message,'help');}render();break;
    }
    case 'reset-preview':showModal('Restaurar toda a prévia?',`<p>Os rascunhos, as imagens importadas e as anotações de exemplo deste navegador serão apagados. Exporte os rascunhos antes, se quiser guardar uma cópia.</p>`,button('Cancelar','close-modal')+button('Restaurar prévia','confirm-reset','reset','','danger'));break;
    case 'confirm-reset':state=initialState();persist();dirty=false;workingPage=null;closeModal();render();toast('Prévia restaurada.');break;
    case 'show-password':{const input=$('#login-form input[name=password]');input.type=input.type==='password'?'text':'password';break;}
    case 'forgot-password':try{await cmsAuth('recover',{email:cmsConfig.owner,redirect_to:location.origin+'/admin/'});toast('Enviamos as instruções para o e-mail do proprietário.');}catch(error){toast(error.message,'help');}break;
    case 'cancel-navigation':closeModal();history.replaceState(null,'',`#${route.view}${route.id ? '?id='+route.id : route.site !== 'all' ? '?site='+route.site : ''}`);break;
    case 'discard-navigation':dirty=false;workingPage=null;navigationPending=false;closeModal();navigate();break;
    case 'save-navigation':savePage();if (!dirty) {navigationPending=false;closeModal();navigate();}break;
  }
});
document.addEventListener('input',(event) => {
  const form=event.target.closest('#banner-form,#seo-form');if (form) updateWorking(form);
  if (event.target.id === 'lead-search') {search=event.target.value;drawLeadResults();}
  if (event.target.id === 'media-search') {
    mediaSearch=event.target.value;const selection=event.target.selectionStart;render();$('#media-search').focus();$('#media-search').setSelectionRange(selection,selection);
  }
});
document.addEventListener('change',(event) => {
  const form=event.target.closest('#banner-form,#seo-form');if (form) updateWorking(form);
  if (event.target.id === 'status-filter') {statusFilter=event.target.value;drawLeadResults();}
  if (event.target.id === 'media-upload') uploadMedia([...event.target.files]);
});
document.addEventListener('submit',(event) => {
  if (event.target.id === 'login-form') event.preventDefault();
  if (event.target.matches('#banner-form,#seo-form,#owner-form,#site-settings-form,#section-form,#lead-form')) event.preventDefault();
});
document.addEventListener('keydown',(event) => {
  if (event.key === 'Escape') closeMenu();
  if (event.target.id === 'upload-drop' && ['Enter',' '].includes(event.key)) {event.preventDefault();openUpload();}
  if (event.key === 'Tab' && $('#sidebar').classList.contains('open')) {
    const nodes=$$('a,button:not([disabled])',$('#sidebar')).filter(n => n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  }
});
document.addEventListener('dragover',(event) => {if (event.target.closest('#upload-drop')) {event.preventDefault();$('#upload-drop').classList.add('dragover');}});
document.addEventListener('dragleave',(event) => {if (event.target.closest('#upload-drop')) $('#upload-drop')?.classList.remove('dragover');});
document.addEventListener('drop',(event) => {
  if (!event.target.closest('#upload-drop')) return;event.preventDefault();$('#upload-drop').classList.remove('dragover');
  const files=[...event.dataTransfer.files];if (route.site === 'all') {toast('Escolha a aba do site antes de arrastar imagens.','help');return;}uploadMedia(files);
});
document.addEventListener('click',(event) => {if (event.target.closest('#upload-drop')) openUpload();});
$('#mobile-menu').addEventListener('click',openMenu);$('#sidebar-close').addEventListener('click',closeMenu);$('#sidebar-backdrop').addEventListener('click',closeMenu);
$('#help-button').innerHTML=icon('help');$('#mobile-menu').innerHTML=icon('menu');$('#sidebar-close').innerHTML=icon('close');$('#account-button').innerHTML=icon('settings');
$('#help-button').addEventListener('click',() => showModal('Sua central CredMais',`<p>Esta é a prévia completa do front-end. Você pode editar banners e páginas, importar imagens, salvar rascunhos e experimentar o atendimento com contatos de exemplo.</p><p>Os rascunhos ficam neste navegador. Login, formulários e rascunhos estão conectados ao Supabase. Use Publicar alterações no editor para atualizar os sites.</p>`,button('Continuar','close-modal')));
for (const id of ['account-button','profile-button']) $('#'+id).addEventListener('click',() => {settingsTab='account';location.hash='settings';if (route.view === 'settings') render();});
$('#modal').addEventListener('cancel',(event) => {event.preventDefault();closeModal();});
$('.skip-link').addEventListener('click',(event) => {event.preventDefault();$('#workspace').focus();$('#workspace').scrollIntoView();});
$('#modal').addEventListener('click',(event) => {if (event.target !== $('#modal')) return;const r=event.target.getBoundingClientRect();if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeModal();});
window.addEventListener('hashchange',navigate);
window.addEventListener('beforeunload',(event) => {if (dirty) {event.preventDefault();event.returnValue='';}});
function initialState() { return {...clone(catalog),owner:{name:'Administrador'},demo:false,demoLeads:[],activity:[]}; }
async function init() {
  try {
    const response=await fetch('./catalog.json');if (!response.ok) throw new Error('catalog');catalog=await response.json();
    state=initialState();
    try { const saved=JSON.parse(localStorage.getItem(STORE_KEY));if (saved?.sites?.length === 3 && Array.isArray(saved.pages) && Array.isArray(saved.media)) state=upgradeBuilderState({...state,...saved}); } catch {}
    await cmsInit();navigate();
  } catch {$('#workspace').innerHTML=empty('Não foi possível abrir o painel.','Abra pelo servidor local e recarregue a página.','help');}
}
init();
