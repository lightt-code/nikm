const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(130, Math.floor(innerWidth / 9));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.35 + .25,
    s: Math.random() * .16 + .025,
    a: Math.random() * .55 + .18
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of stars) {
    p.y -= p.s;
    if (p.y < -2) { p.y = innerHeight + 2; p.x = Math.random() * innerWidth; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,200,255,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
resize();
addEventListener('resize', resize);
draw();

// Music
const audio = document.getElementById('bgMusic');
const musicButton = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicText');
musicButton.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      audio.volume = .45;
      await audio.play();
      musicButton.classList.add('playing');
      musicLabel.textContent = 'PAUSE MUSIC';
      musicButton.setAttribute('aria-label', 'Pause music');
    } else {
      audio.pause();
      musicButton.classList.remove('playing');
      musicLabel.textContent = 'PLAY MUSIC';
      musicButton.setAttribute('aria-label', 'Play music');
    }
  } catch (e) {
    musicLabel.textContent = 'AUDIO UNAVAILABLE';
  }
});

audio.addEventListener('ended', () => {
  musicButton.classList.remove('playing');
  musicLabel.textContent = 'PLAY MUSIC';
  musicButton.setAttribute('aria-label', 'Play music');
});

// Interactive 3D business card — one pointer system for mouse, pen and touch.
const cardStage = document.getElementById('cardStage');
const businessCard = document.getElementById('businessCard');
const cardReset = document.getElementById('cardReset');
let rotX = -8;
let rotY = 16;
let targetX = rotX;
let targetY = rotY;
let dragging = false;
let lastX = 0;
let lastY = 0;
let moved = false;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function normalizeAngle(angle) {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}
function renderCard() {
  rotX += (targetX - rotX) * 0.09;
  rotY += (targetY - rotY) * 0.09;
  businessCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  requestAnimationFrame(renderCard);
}
renderCard();

cardStage.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  dragging = true;
  moved = false;
  lastX = event.clientX;
  lastY = event.clientY;
  cardStage.classList.add('is-dragging');
  try { cardStage.setPointerCapture(event.pointerId); } catch (_) {}
});

cardStage.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
  lastX = event.clientX;
  lastY = event.clientY;
  targetY = normalizeAngle(targetY + dx * 0.5);
  targetX = clamp(targetX - dy * 0.22, -62, 62);
});

function stopDrag(event) {
  if (!dragging) return;
  dragging = false;
  cardStage.classList.remove('is-dragging');
  try { cardStage.releasePointerCapture(event.pointerId); } catch (_) {}
}
cardStage.addEventListener('pointerup', stopDrag);
cardStage.addEventListener('pointercancel', stopDrag);
cardStage.addEventListener('lostpointercapture', () => {
  dragging = false;
  cardStage.classList.remove('is-dragging');
});

if (cardReset) {
  cardReset.addEventListener('click', () => {
    targetX = -8;
    targetY = 16;
  });
}

businessCard.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 12 : 6;
  if (event.key === 'ArrowLeft') targetY = normalizeAngle(targetY - step);
  if (event.key === 'ArrowRight') targetY = normalizeAngle(targetY + step);
  if (event.key === 'ArrowUp') targetX = clamp(targetX - step, -62, 62);
  if (event.key === 'ArrowDown') targetX = clamp(targetX + step, -62, 62);
  if (event.key === 'Home') { targetX = -8; targetY = 16; }
});

// Portfolio grid + detail modal.
const portfolioCards = Array.from(document.querySelectorAll('.portfolio-card'));
const portfolioModal = document.getElementById('portfolioModal');
const modalImage = document.getElementById('modalImage');
const modalNumber = document.getElementById('modalNumber');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalList = document.getElementById('modalList');
let lastFocusedTrigger = null;

function openPortfolioModal(card, trigger) {
  const img = card.querySelector('.portfolio-card-visual img');
  const index = portfolioCards.indexOf(card);
  modalImage.src = img.src;
  modalImage.alt = img.alt;
  modalNumber.textContent = `WORK / ${String(index + 1).padStart(2, '0')}`;
  modalTitle.textContent = card.dataset.title || '';
  modalText.textContent = card.dataset.detail || '';
  modalList.innerHTML = '';
  (card.dataset.points || '').split(';').map((point) => point.trim()).filter(Boolean).forEach((point) => {
    const li = document.createElement('li');
    li.textContent = point;
    modalList.appendChild(li);
  });
  lastFocusedTrigger = trigger;
  portfolioModal.classList.add('is-open');
  portfolioModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  portfolioModal.querySelector('.portfolio-modal-close').focus();
}

function closePortfolioModal() {
  if (!portfolioModal.classList.contains('is-open')) return;
  portfolioModal.classList.remove('is-open');
  portfolioModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  if (lastFocusedTrigger) lastFocusedTrigger.focus();
}

portfolioCards.forEach((card) => {
  const trigger = card.querySelector('.btn-shine');
  if (trigger) trigger.addEventListener('click', () => openPortfolioModal(card, trigger));
});

portfolioModal.querySelectorAll('[data-modal-close]').forEach((el) => {
  el.addEventListener('click', closePortfolioModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePortfolioModal();
});
