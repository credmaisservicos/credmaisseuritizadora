(() => {
 'use strict';
 const endpoint='https://bqfunldpanspuqxsnoib.supabase.co/functions/v1/receive-contact';
 async function submit(payload){
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,source_path:location.pathname}),signal:AbortSignal.timeout(20000)});
  let result;try{result=await response.json();}catch{}
  if(!response.ok||!result?.ok)throw Error(result?.error||'Não foi possível enviar. Tente novamente.');
  return result;
 }
 function bind(form){
  const site=form.dataset.cmContact;if(!site||form.dataset.cmBound)return;form.dataset.cmBound='true';
  const status=form.querySelector('[role=status]')||Object.assign(document.createElement('p'),{className:'form-note'});
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');if(!status.parentElement)form.append(status);
  let id=crypto.randomUUID(),busy=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy||!form.reportValidity())return;
   const data=new FormData(form),button=form.querySelector('[type=submit]'),label=button?.querySelector('span')||button,old=label?.textContent;
   busy=true;if(button)button.disabled=true;if(label)label.textContent='Enviando…';status.textContent='';
   try{await submit({site,request_id:id,name:data.get('name'),phone:data.get('phone'),email:data.get('email')||'',company:data.get('company')||'',product:data.get('service')||data.get('goal')||data.get('subject'),message:data.get('message')||'',consent:data.get('consent')==='on',website:data.get('website')||''});
    status.textContent='Mensagem enviada. Nossa equipe entrará em contato com você.';form.reset();id=crypto.randomUUID();
   }catch(error){status.textContent=error.name==='TimeoutError'?'O envio demorou mais que o esperado. Tente novamente; seu formulário será registrado uma única vez.':error.message||'Confira sua conexão e tente novamente.';}
   finally{busy=false;if(button)button.disabled=false;if(label)label.textContent=old;}
  });
 }
 window.CredMaisForms={submit,bind};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-cm-contact]').forEach(bind));else document.querySelectorAll('[data-cm-contact]').forEach(bind);
})();
