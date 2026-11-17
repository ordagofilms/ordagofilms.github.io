const form = document.querySelector('#contact-form');
const review = document.querySelector('#review');
const reviewTitle = document.querySelector('#review-title');
const email = document.querySelector('#email');

const dialog = document.querySelector('dialog#contacto');
if (dialog) {
  const trigger = document.querySelector('.contact-trigger');
  const contactBrand = dialog.querySelector('.contact-brand');
  const contactOrigin = document.querySelector('[data-contact-origin]');
  const contactReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let logoFlight;
  trigger.addEventListener('click', () => {
    const origin = contactOrigin?.getBoundingClientRect();
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    if (!origin || contactReducedMotion.matches) return;

    const destination = contactBrand.getBoundingClientRect();
    if (!destination.width || !destination.height) return;

    dialog.classList.add('logo-in-flight');
    logoFlight = contactBrand.animate([
      {
        transform: `translate(${origin.left - destination.left}px, ${origin.top - destination.top}px)
          scale(${origin.width / destination.width})`,
      },
      { transform: 'none' },
    ], { duration: 480, easing: 'cubic-bezier(.2, .75, .24, 1)' });
    logoFlight.onfinish = () => dialog.classList.remove('logo-in-flight');
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    logoFlight?.cancel();
    dialog.classList.remove('logo-in-flight');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });

}

form.noValidate = true;
const requiredMessages = {
  nombre: 'Indica tu nombre.', correo: 'Indica un correo electrónico válido.',
  proyecto: 'Escribe un mensaje para explicar tu proyecto.',
};
function fieldError(control) {
  const missing = control.required && !control.value.trim();
  const message = missing ? requiredMessages[control.name] : control.validity.typeMismatch ? 'Introduce un correo como nombre@dominio.es.' : '';
  const hint = document.getElementById(control.name + '-error');
  if (hint) { hint.textContent = message; hint.hidden = !message; }
  if (message) control.setAttribute('aria-invalid', 'true');
  else control.removeAttribute('aria-invalid');
  return message;
}
for (const control of form.querySelectorAll('input, textarea')) {
  control.addEventListener('input', () => {
    if (control.hasAttribute('aria-invalid')) fieldError(control);
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const controls = Array.from(form.querySelectorAll('input, textarea'));
  const invalid = controls.filter(control => fieldError(control));
  const errors = document.getElementById('contact-errors');
  errors.hidden = !invalid.length;
  errors.textContent = invalid.length ? 'Revisa los campos indicados antes de continuar.' : '';
  if (invalid.length) { invalid[0].focus(); return; }
  const fields = new FormData(form);
  const labels = {
    nombre: 'Nombre', apellido: 'Apellido', telefono: 'Teléfono',
    correo: 'Correo', proyecto: fields.has('necesidades') ? 'Proyecto' : 'Mensaje',
    necesidades: 'Qué necesitas',
  };
  const entries = Array.from(fields, ([name, value]) => [labels[name], value.trim()])
    .filter(([label, value]) => label && value);
  const summary = review.querySelector('dl');
  summary.replaceChildren();
  for (const [label, value] of entries) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    summary.append(term, description);
  }
  const body = entries.map(([label, value]) => label + ': ' + value).join('\n\n');
  email.href = 'mailto:info@ordagofilms.com?subject=Nuevo%20proyecto%20para%20%C3%93rdago&body=' + encodeURIComponent(body);
  form.hidden = true;
  review.hidden = false;
  reviewTitle.focus();
});

document.querySelector('#edit').addEventListener('click', () => {
  review.hidden = true;
  form.hidden = false;
  form.elements.proyecto.focus();
});

