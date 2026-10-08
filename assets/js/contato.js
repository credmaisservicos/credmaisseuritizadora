(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  if (!form || !status) return;
  const requiredText = [...form.querySelectorAll('input[required], textarea[required]')];

  requiredText.forEach((field) => {
    field.addEventListener('input', () => {
      field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    requiredText.forEach((field) => {
      field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');
    });
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const message = [
      'Olá, CredMais! Gostaria de conversar sobre a minha empresa.',
      `Meu nome: ${String(data.get('name')).trim()}`,
      `Empresa: ${String(data.get('company')).trim()}`,
      `Tenho interesse em: ${String(data.get('service')).trim()}`,
      `Mensagem: ${String(data.get('message')).trim()}`,
    ].join('\n');
    const url = `https://wa.me/5511940893852?text=${encodeURIComponent(message)}`;

    status.replaceChildren(document.createTextNode('Sua mensagem está pronta. Se o WhatsApp não abrir, '));
    const fallback = document.createElement('a');
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'clique aqui para continuar';
    status.append(fallback, document.createTextNode('.'));

    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
