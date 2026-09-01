const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const count = Math.min(130, Math.floor(innerWidth / 9));
  stars = Array.from({length: count}, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.35 + .25, s: Math.random() * .16 + .025,
    a: Math.random() * .55 + .18
  }));
}
function draw() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for (const p of stars) {
    p.y -= p.s; if (p.y < -2) { p.y = innerHeight + 2; p.x = Math.random()*innerWidth; }
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(220,200,255,${p.a})`; ctx.fill();
  }
  requestAnimationFrame(draw);
}
resize(); addEventListener('resize', resize); draw();

const audio = document.getElementById('bgMusic');
const button = document.getElementById('musicToggle');
const label = document.getElementById('musicText');
button.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      audio.volume = .45;
      await audio.play();
      button.classList.add('playing');
      label.textContent = 'PAUSE MUSIC';
      button.setAttribute('aria-label','Pause music');
    } else {
      audio.pause();
      button.classList.remove('playing');
      label.textContent = 'PLAY MUSIC';
      button.setAttribute('aria-label','Play music');
    }
  } catch (e) {
    label.textContent = 'AUDIO UNAVAILABLE';
  }
});

audio.addEventListener('ended', () => {
  button.classList.remove('playing');
  label.textContent = 'PLAY MUSIC';
  button.setAttribute('aria-label','Play music');
});

// Portfolio carousel: auto-advance, wrap-around navigation and timer reset after manual changes.
const slides = Array.from(document.querySelectorAll('.portfolio-slide'));
const dots = document.getElementById('portfolioDots');
const prevButton = document.getElementById('portfolioPrev');
const nextButton = document.getElementById('portfolioNext');
let currentSlide = 0;
let portfolioTimer;
const portfolioInterval = 4800;

function renderDots() {
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider-dot';
    dot.setAttribute('aria-label', `Показать работу ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index, true));
    dots.appendChild(dot);
  });
}

function showSlide(index, resetTimer = false) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  Array.from(dots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === currentSlide);
    dot.setAttribute('aria-current', dotIndex === currentSlide ? 'true' : 'false');
  });
  if (resetTimer) restartPortfolioTimer();
}

function restartPortfolioTimer() {
  clearInterval(portfolioTimer);
  portfolioTimer = setInterval(() => showSlide(currentSlide + 1), portfolioInterval);
}

if (slides.length) {
  renderDots();
  showSlide(0);
  restartPortfolioTimer();
  prevButton.addEventListener('click', () => showSlide(currentSlide - 1, true));
  nextButton.addEventListener('click', () => showSlide(currentSlide + 1, true));
}
