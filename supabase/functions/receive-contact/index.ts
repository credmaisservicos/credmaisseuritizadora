const url = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const allowed = new Set([
 'https://sejacredmais.com','https://www.sejacredmais.com','https://cartas.sejacredmais.com',
 'https://credmaispay.com','https://www.credmaispay.com',
 ...(Deno.env.get('CMS_ALLOWED_ORIGINS')||'').split(',').filter(Boolean),
]);
function local(origin:string){try {const u=new URL(origin);return ['127.0.0.1','localhost'].includes(u.hostname)&&u.protocol==='http:';}catch{return false;}}
function reply(status:number,data:unknown,origin:string){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type, apikey, authorization','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}});}
const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const headers={'apikey':secret,'Authorization':'Bearer '+secret,'Content-Type':'application/json'};
async function notify(id:string,p:any){
 let status='failed';
 try{
  const key=Deno.env.get('CMS_RESEND_API_KEY');
  if(key){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'cms-lead-'+id},body:JSON.stringify({from:'CredMais <contato@sejacredmais.com>',to:['contato@sejacredmais.com'],subject:'Novo contato — '+({securitizadora:'Securitizadora',cartas:'CredCartas',pay:'CredMais Pay'} as any)[p.site],text:`Um novo formulário foi recebido de ${p.name}.\nSite: ${p.site}\nInteresse: ${p.product}\n\nAcesse o painel para consultar os dados:\nhttps://sejacredmais.com/admin/#leads?site=${p.site}`,...(p.email?{reply_to:p.email}:{})}),signal:AbortSignal.timeout(8000)});status=response.ok?'sent':'failed';}
 }catch{}
 await fetch(url+'/rest/v1/cms_leads?id=eq.'+id,{method:'PATCH',headers,body:JSON.stringify({notification_status:status})});
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(!allowed.has(origin)&&!local(origin))return reply(403,{error:'Origem não autorizada.'},'');
 if(req.method==='OPTIONS')return reply(200,{ok:true},origin);
 if(req.method!=='POST')return reply(405,{error:'Método não permitido.'},origin);
 try{
  if(Number(req.headers.get('content-length')||0)>16384)return reply(413,{error:'Mensagem muito longa.'},origin);
  const raw=await req.text();if(raw.length>16384)return reply(413,{error:'Mensagem muito longa.'},origin);
  const body=JSON.parse(raw);
  if(body.website)return reply(400,{error:'Não foi possível enviar.'},origin);
  const p={site:clean(body.site,30),request_id:clean(body.request_id,36),name:clean(body.name,120),phone:clean(body.phone,30),email:clean(body.email,200),company:clean(body.company,160),product:clean(body.product,180),message:clean(body.message,5000),source_path:clean(body.source_path,300)};
  const expected=origin.includes('cartas.sejacredmais.com')?'cartas':origin.includes('credmaispay.com')?'pay':origin.includes('sejacredmais.com')?'securitizadora':null;
  if(!['securitizadora','cartas','pay'].includes(p.site)||(expected&&expected!==p.site))return reply(400,{error:'Site inválido.'},origin);
  if((p.site==='securitizadora'&&(!p.company||!p.message))||(p.site==='pay'&&!p.message)||p.phone.replace(/\D/g,'').length>15)return reply(400,{error:'Confira a empresa, a mensagem e o telefone informado.'},origin);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.request_id)||p.name.length<2||p.phone.replace(/\D/g,'').length<10||!p.product||body.consent!==true||(p.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)))return reply(400,{error:'Confira nome, telefone, assunto e autorização de contato.'},origin);
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||req.headers.get('cf-connecting-ip')||'unknown';
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret+ip));
  const rateKey=Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
  const response=await fetch(url+'/rest/v1/rpc/cms_receive_lead',{method:'POST',headers,body:JSON.stringify({payload:p,rate_key:rateKey})});
  if(!response.ok)return reply(503,{error:'O envio está indisponível. Tente novamente em instantes.'},origin);
  const result=await response.json();
  if(result.limited)return reply(429,{error:'Muitos envios em pouco tempo. Aguarde alguns minutos.'},origin);
  if(!result.duplicate){const promise=notify(result.id,p);if(typeof EdgeRuntime!=='undefined')EdgeRuntime.waitUntil(promise);else await promise;}
  return reply(200,{ok:true,id:result.id},origin);
 }catch{return reply(400,{error:'Não foi possível enviar. Confira os campos e tente novamente.'},origin);}
});
