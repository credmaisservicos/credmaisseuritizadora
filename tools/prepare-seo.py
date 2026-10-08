"""Create editable SEO defaults, public metadata and hosting files for the three sites."""
import json,re,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'admin/catalog.json').read_text(encoding='utf8'))
terms={
'securitizadora':{
'Antecipação':'''antecipação de recebíveis|antecipação de boletos|antecipação para empresas|antecipar vendas a prazo|antecipar contas a receber|antecipação de duplicatas|recebíveis empresariais|capital com recebíveis|fluxo de caixa empresarial|gestão de contas a receber|capital de giro para empresas|como antecipar recebíveis|análise de recebíveis|antecipação para comércio|antecipação para prestadores de serviços''',
'Pix Parcelado':'''Pix parcelado|vender no Pix parcelado|Pix parcelado para empresas|Pix parcelado para lojistas|pagamento em parcelas via Pix|como funciona Pix parcelado|oferecer Pix parcelado|Pix parcelado no comércio|Pix parcelado para serviços|vendas com Pix parcelado|receber vendas no Pix|formas de pagamento para empresas''',
'Boleto Garantido':'''boleto garantido|venda com boleto garantido|garantia de recebimento no boleto|boleto garantido para empresas|como funciona boleto garantido|vender no boleto|receber mesmo com inadimplência|garantia para vendas a prazo|vendas no boleto para comércio|condições do boleto garantido|segurança no recebimento de boletos|boleto com garantia''',
'Cobranças':'''gestão de cobranças|cobrança para empresas|terceirização de cobranças|cobrança empresarial|serviço de cobrança|como organizar cobranças|cobranças de clientes|gestão de pagamentos a receber|apoio à cobrança empresarial|CredMais cobranças|empresa de gestão de cobranças|cobrança de boletos''',
'Marca':'''CredMais Securitizadora|CredMais serviços|CredMais recebíveis|soluções para empresas CredMais|contato CredMais|seja CredMais|serviços financeiros para empresas|soluções para vendas a prazo'''},
'cartas':{
'Cartas contempladas':'''carta de crédito contemplada|cartas de crédito contempladas|consórcio contemplado|comprar carta contemplada|carta contemplada à venda|cartas contempladas disponíveis|como comprar carta contemplada|como funciona carta contemplada|análise de carta contemplada|transferência de carta contemplada|condições de carta contemplada|documentação de carta contemplada|carta de crédito já contemplada|crédito de consórcio contemplado|compra de consórcio contemplado|carta contemplada com orientação''',
'Imóveis':'''carta contemplada para imóvel|carta de crédito imobiliária contemplada|consórcio imobiliário contemplado|comprar imóvel com carta contemplada|carta contemplada para casa|carta contemplada para apartamento|crédito contemplado para imóvel|carta imobiliária contemplada|carta de consórcio para imóvel|planejar compra de imóvel|compra de casa com consórcio|condições de carta imobiliária''',
'Veículos':'''carta contemplada para veículo|carta de crédito para carro|consórcio de carro contemplado|carta contemplada para carro usado|carta contemplada para carro novo|comprar carro com carta contemplada|crédito contemplado para veículo|carta de consórcio para automóvel|consórcio de veículos contemplado|carta contemplada automotiva|planejar compra de carro|condições de carta para veículo''',
'Orientação':'''diferença entre consórcio e financiamento|administradora de consórcio|análise da administradora|utilização de crédito contemplado|documentos para transferência de consórcio|orientação sobre cartas contempladas|consultar cartas contempladas|escolher carta contemplada|etapas da compra de carta contemplada|segurança na compra de carta contemplada''',
'Marca':'''CredCartas|CredCartas soluções|CredCartas cartas contempladas|contato CredCartas|CredMais cartas|cartas sejacredmais|consultoria CredCartas|oportunidades CredCartas'''},
'pay':{
'Empréstimos':'''CredMais Pay empréstimos|empréstimo para CLT|crédito para trabalhador CLT|empréstimo para motorista de aplicativo|crédito para motorista de aplicativo|empréstimo para entregador de aplicativo|crédito para entregadores|empréstimo para pequenos negócios|crédito para pequeno empreendedor|crédito para vendedor no iFood|empréstimo para motorista Uber|crédito para motorista 99|crédito para vendedor iFood|empréstimo para autônomo|como solicitar empréstimo|análise de crédito|condições de empréstimo|simulação de crédito|solicitar crédito online|entender custo do empréstimo''',
'Conta digital':'''CredMais Pay conta digital|conta digital|conta digital pelo celular|abrir conta digital|pagar pelo celular|receber pelo celular|acompanhar dinheiro pelo celular|organização financeira digital|pagamentos digitais|conta para autônomo|conta para motorista de aplicativo|conta para pequenos negócios''',
'Segurança':'''segurança financeira digital|segurança no Pix|como evitar golpes no Pix|proteção de dados financeiros|reconhecer golpes financeiros|canal oficial CredMais Pay|segurança da conta digital|cuidados ao solicitar empréstimo|proteção contra fraude|orientação financeira segura''',
'Educação financeira':'''educação financeira|planejamento financeiro|organizar orçamento pessoal|entender crédito pessoal|como organizar as finanças|gestão financeira para autônomos|controle de despesas|uso consciente do crédito|dicas financeiras para motoristas|dicas financeiras para entregadores''',
'Marca e atendimento':'''CredMais Pay|CredMaisPay|credmaispay.com|contato CredMais Pay|atendimento CredMais Pay|ajuda CredMais Pay|produtos CredMais Pay|soluções financeiras CredMais Pay'''}}
origins={'securitizadora':'https://sejacredmais.com','cartas':'https://cartas.sejacredmais.com','pay':'https://credmaispay.com'}
titles={
'securitizadora-0':'CredMais | Soluções para recebíveis e vendas da sua empresa',
'securitizadora-1':'Contato | CredMais Securitizadora',
'securitizadora-2':'Pix Parcelado para empresas | CredMais',
'securitizadora-3':'Antecipação de boletos e recebíveis | CredMais',
'securitizadora-4':'Boleto Garantido para empresas | CredMais',
'securitizadora-5':'Gestão de cobranças para empresas | CredMais',
'cartas-0':'CredCartas | Cartas contempladas para carros e imóveis',
'cartas-1':'Cartas de crédito contempladas | CredCartas',
'cartas-2':'Cartas contempladas para veículos | CredCartas',
'cartas-3':'Como funciona a carta contemplada | CredCartas',
'cartas-4':'Sobre a CredCartas | Cartas de crédito contempladas',
'cartas-5':'Contato | Encontre sua carta contemplada com a CredCartas',
'pay-0':'CredMais Pay | Crédito e soluções financeiras digitais',
'pay-1':'Conta digital | CredMais Pay',
'pay-2':'Empréstimos para CLT, aplicativos e negócios | CredMais Pay',
'pay-3':'Segurança digital e prevenção de golpes | CredMais Pay',
'pay-4':'Ajuda e atendimento | CredMais Pay',
'pay-5':'Blog | Educação financeira e crédito | CredMais Pay'}
default={}
for s in catalog['sites']:
 sid=s['id'];pages=[p for p in catalog['pages'] if p['site']==sid]
 keywords=[]
 for group,values in terms[sid].items():
  destination=next((p['path'] for p in pages if (sid=='securitizadora' and {'Antecipação':'antecipacao','Pix Parcelado':'pix-parcelado','Boleto Garantido':'boleto-garantido','Cobranças':'gestao-de-cobrancas'}.get(group,'!') in p['path']) or (sid=='cartas' and {'Cartas contempladas':'cartas.html','Imóveis':'cartas.html','Veículos':'veiculos.html','Orientação':'como-funciona.html'}.get(group,'!') in p['path']) or (sid=='pay' and {'Empréstimos':'emprestimos','Conta digital':'conta','Segurança':'seguranca','Educação financeira':'blog'}.get(group,'!') in p['path'])),'/')
  keywords.extend({'term':term,'group':group,'path':destination,'status':'planned'} for term in values.split('|'))
 default[sid]={'name':s['fullName'],'origin':origins[sid],'description':s['summary'],'indexing':True,'disallow':[],'verification':'','socialImage':'','logo':'','sameAs':['https://www.instagram.com/credmais.sa/'] if sid=='securitizadora' else [],'keywords':keywords}
for p in catalog['pages']:
 p['seoTitle']=titles[p['id']];p['seoDescription']=p['description'];p['seo']={'canonical':'','focusKeyword':'','noindex':False,'nofollow':False,'image':'','imageAlt':''}
# Read actual hero/logo locations; use existing site assets, never invent identity/images.
for sid in default:
 image=next((m for m in catalog['media'] if m['id']==next(p for p in catalog['pages'] if p['site']==sid and p['path']=='/')['imageId']),None)
 if image:default[sid]['socialImage']=str((ROOT/'admin'/image['url']).resolve()) if False else 'https://sejacredmais.com/admin/'+image['url'].removeprefix('./')
default['securitizadora']['logo']='https://sejacredmais.com/assets/img/logo.png'
(ROOT/'admin/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(ROOT/'admin/seo-defaults.json').write_text(json.dumps(default,ensure_ascii=False,indent=2),encoding='utf8')
public={sid:{'site':{k:v for k,v in config.items() if k!='keywords'},'pages':[{k:p.get(k) for k in ['id','path','name','seoTitle','seoDescription','seo']} for p in catalog['pages'] if p['site']==sid]} for sid,config in default.items()}
(ROOT/'tools/seo-defaults-public.json').write_text(json.dumps(public,ensure_ascii=False,indent=2),encoding='utf8')
for sid,directory in [('securitizadora',ROOT/'assets/js'),('cartas',ROOT.parent/'credcartas/public'),('pay',ROOT.parent/'credmaispay/public')]:
 directory.mkdir(exist_ok=True,parents=True)
 (directory/'seo-defaults.json').write_text(json.dumps(public[sid],ensure_ascii=False),encoding='utf8')
 if sid!='securitizadora':shutil.copyfile(ROOT/'assets/js/seo-core.js',directory/'seo-core.js')
print('SEO defaults prepared:',{s:len(v['keywords']) for s,v in default.items()})
