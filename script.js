'use strict';
// Все цены и расчёты демонстрационные. Сайт не собирает персональные данные.
const services = {
  wash: { name: 'Детейлинг-мойка', price: 3500 },
  polish: { name: 'Полировка кузова', price: 18000 },
  ceramic: { name: 'Керамическая защита', price: 25000 },
  interior: { name: 'Уход за салоном', price: 12000 }
};
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const form = document.querySelector('#estimate-form');
const total = document.querySelector('#total');
const carNames = { '1': 'Седан / Купе', '1.2': 'Кроссовер', '1.4': 'Внедорожник' };
function calculate() {
  const data = new FormData(form);
  const selected = data.getAll('service');
  const multiplier = Number(data.get('car'));
  const amount = Math.round(selected.reduce((sum, key) => sum + services[key].price, 0) * multiplier);
  total.value = selected.length ? 'от ' + money(amount) : 'Выбери уход';
  return { selected, amount, car: carNames[data.get('car')] };
}
form.addEventListener('change', calculate);
// Строка услуги выбирает её в калькуляторе, сохраняя другие выбранные услуги.
document.querySelectorAll('[data-service]').forEach(button => {
  button.addEventListener('click', () => {
    form.querySelector(`[value="${button.dataset.service}"]`).checked = true;
    calculate();
    document.querySelector('#configurator').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
});
const range = document.querySelector('#compare-range');
range.addEventListener('input', () => {
  document.querySelector('.comparison').style.setProperty('--split', range.value + '%');
  range.setAttribute('aria-valuetext', range.value + '% исходной фотографии');
});
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
// Нативный dialog поддерживает Escape, управление фокусом и клавиатурную навигацию.
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
});
const lightbox = document.querySelector('#lightbox');
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    const img = document.querySelector('#lightbox-image');
    img.src = button.dataset.image;
    img.alt = button.querySelector('img').alt;
    document.querySelector('#lightbox-caption').textContent = button.dataset.caption;
    openDialog(lightbox);
  });
});
const requestDialog = document.querySelector('#request-dialog');
const requestText = document.querySelector('#request-text');
form.addEventListener('submit', event => {
  event.preventDefault();
  const result = calculate();
  if (!result.selected.length) {
    form.querySelector('[name="service"]').focus();
    total.value = 'Выбери уход';
    return;
  }
  requestText.value = [
    'APEX Detail — демонстрационный запрос',
    'Автомобиль: ' + result.car,
    '',
    'Выбранные услуги:',
    ...result.selected.map(key => '• ' + services[key].name),
    '',
    'Предварительная стоимость: от ' + money(result.amount),
    'Итоговая стоимость — после осмотра.',
    'Учебный пример. Реальная запись не подключена.'
  ].join('\n');
  document.querySelector('#copy-status').textContent = '';
  openDialog(requestDialog);
});
document.querySelector('#copy-request').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(requestText.value);
    status.textContent = 'Запрос скопирован. Данные никуда не отправлялись.';
  } catch {
    requestText.focus();
    requestText.select();
    status.textContent = 'Выделили текст. Скопируй его вручную: Ctrl+C или ⌘C.';
  }
});
// Анимации появляются только после успешной инициализации наблюдателя.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  document.documentElement.classList.add('js-motion');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const progress = document.querySelector('.scroll-progress');
let scheduled = false;
function updateProgress() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (height > 0 ? window.scrollY / height * 100 : 0) + '%';
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
window.addEventListener('resize', updateProgress);
calculate();
updateProgress();
