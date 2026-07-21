// ===== ЛОКАЛИЗАЦИЯ (только UI-строки и контент) =====
const UI = {
    ru: {
        toast: "↓ Инструкция по установке",
        aboutDesc: "WhiteMAX — это модифицированная версия мессенджера MAX, нацеленная на максимальное сокращение сбора аналитических данных. Вырезаны трекеры, отключены лишние сетевые запросы и возвращён контроль над приватностью тебе.",
        features: ["Отключены встроенные системы аналитики и сбора метрик", "Заблокированы обращения к сторонним трекерам", "Минимум сетевой активности в фоне", "Сохраняется полная функциональность мессенджера"],
        faq: [
            { q: "Это безопасно? Меня не забанят?", a: "WhiteMAX не вмешивается в логику работы серверной части MAX. Модифицируется только клиент — убирается сбор аналитики. Риск блокировки минимален, но формально это модификация — используй на свой страх и риск." },
            { q: "Чем WhiteMAX отличается от обычного MAX?", a: "Основное отличие — отсутствие фонового сбора данных: метрики использования, краш-репорты, рекламные идентификаторы и прочие трекеры удалены из кода приложения." },
            { q: "Это бесплатно?", a: "Да, WhiteMAX полностью бесплатен. Если хочешь поддержать разработку — есть ссылка на DonationAlerts. Любая помощь приветствуется!" }
        ],
        notFoundTitle: "Страница не найдена",
        notFoundText: "Такой страницы нет. Но есть WhiteMAX — без аналитики и трекеров.",
        notFoundBtn: "← На главную"
    },
    en: {
        toast: "↓ Installation guide",
        aboutDesc: "WhiteMAX is a modified version of the MAX messenger, aimed at minimizing analytics data collection. Trackers are removed, unnecessary network requests are disabled, and privacy control is returned to you.",
        features: ["Built-in analytics and metric collection disabled", "Third-party tracker requests blocked", "Minimal background network activity", "Full messenger functionality preserved"],
        faq: [
            { q: "Is it safe? Will I get banned?", a: "WhiteMAX does not interfere with MAX server-side logic. Only the client is modified — analytics collection is removed. The risk of blocking is minimal, but formally this is a modification — use at your own risk." },
            { q: "How is WhiteMAX different from regular MAX?", a: "The main difference is no background data collection: usage metrics, crash reports, advertising identifiers and other trackers are removed from the app code." },
            { q: "Is it free?", a: "Yes, WhiteMAX is completely free. If you want to support development — there is a DonationAlerts link. Any help is welcome!" }
        ],
        notFoundTitle: "Page not found",
        notFoundText: "This page doesn't exist. But WhiteMAX does — without analytics and trackers.",
        notFoundBtn: "← Home"
    }
};

// ===== УТИЛИТЫ =====
const GITHUB_REPO = 'WhiteMAX-Mod/whitemaxmod';
const $ = id => document.getElementById(id);
const _escEl = document.createElement('div');
const esc = s => { _escEl.textContent = s; return _escEl.innerHTML; };
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let currentLang = localStorage.getItem('whitemax-lang') || 'ru';
const t = key => UI[currentLang][key];

// ===== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА =====
function applyLanguage() {
    document.documentElement.lang = currentLang;
    $('lang-toggle').textContent = currentLang === 'ru' ? 'EN' : 'RU';

    // Элементы с data-ru/data-en
    document.querySelectorAll('[data-ru][data-en]').forEach(el => {
        const val = el.getAttribute(`data-${currentLang}`);
        if (val.includes('<br>')) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });

    $('toast').textContent = t('toast');
    renderContent();
    loadChangelog();
}

// ===== 404 =====
if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    $('main-content').innerHTML = `
        <div class="page-404">
            <div class="code">404</div>
            <h2>${t('notFoundTitle')}</h2>
            <p>${t('notFoundText')}</p>
            <a href="/" class="btn btn-primary" style="display:inline-flex">${t('notFoundBtn')}</a>
        </div>`;
}

// ===== ТЕМА =====
const savedTheme = localStorage.getItem('whitemax-theme');
if (savedTheme === 'light') document.body.classList.add('light');
$('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('whitemax-theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

// ===== ЯЗЫК =====
$('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('whitemax-lang', currentLang);
    applyLanguage();
});

// ===== ПАНЕЛЬ СВЯЗИ =====
const contactToggle = $('contact-toggle');
const contactPanel = $('contact-panel');

contactToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    contactPanel.classList.toggle('visible');
});
document.addEventListener('click', (e) => {
    if (!contactPanel.contains(e.target) && e.target !== contactToggle && !contactToggle.contains(e.target)) {
        contactPanel.classList.remove('visible');
    }
});
document.querySelectorAll('.contact-value').forEach(el => {
    el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.textContent).catch(() => {});
        el.style.opacity = '0.5';
        setTimeout(() => { el.style.opacity = ''; }, 200);
    });
});

// ===== КНОПКА НАВЕРХ =====
addEventListener('scroll', () => { $('scroll-top-btn').classList.toggle('visible', scrollY > 400); }, { passive: true });
$('scroll-top-btn').addEventListener('click', () => { scrollTo({ top: 0, behavior: 'smooth' }); });

// ===== КНОПКА СКАЧИВАНИЯ + ТОСТ =====
const downloadBtn = $('download-btn'), downloadWarning = $('download-warning'), toast = $('toast');
let warningTimer = null, toastTimer = null;

downloadBtn.addEventListener('click', () => {
    if (warningTimer) return;
    if (!downloadWarning.classList.contains('visible')) {
        downloadWarning.classList.add('visible');
    } else {
        downloadWarning.classList.remove('visible');
        void downloadWarning.offsetWidth;
        downloadWarning.classList.add('visible');
    }
    warningTimer = setTimeout(() => { downloadWarning.classList.remove('visible'); warningTimer = null; }, 10000);
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => { toast.classList.remove('visible'); }, 6000);
});

toast.addEventListener('click', () => {
    document.getElementById('install-section').scrollIntoView({ behavior: 'smooth' });
    toast.classList.remove('visible');
    clearTimeout(toastTimer);
});

// ===== GITHUB API: СЧЁТЧИК СКАЧИВАНИЙ =====
(async function () {
    const CACHE_KEY = 'whitemax-dl-cache', CACHE_TTL = 3600000;
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            $('download-count-value').textContent = cached.total.toLocaleString();
            return;
        }
        const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`);
        if (!resp.ok) throw new Error('rate limited');
        const releases = await resp.json();
        let total = 0;
        releases.forEach(r => r.assets.forEach(a => { if (a.name.endsWith('.apk')) total += a.download_count; }));
        localStorage.setItem(CACHE_KEY, JSON.stringify({ total, ts: Date.now() }));
        $('download-count-value').textContent = total.toLocaleString();
    } catch (e) {
        $('download-count-value').textContent = '—';
    }
})();

// ===== ЧЕЙНДЖЛОГ ИЗ JSON =====
async function loadChangelog() {
    try {
        const resp = await fetch('changelog.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        const cl = data[currentLang];
        if (!cl) throw new Error('no lang');

        $('changelog-label').textContent = cl.label;
        $('changelog-title').textContent = cl.title;

        let h = '<div class="changelog-list">';
        cl.versions.forEach((v, i) => {
            h += `<div class="changelog-entry"><div class="changelog-header"><span class="changelog-version">${esc(v.version)}</span>${i === 0 ? ` <span class="current-badge">${esc(cl.currentBadge)}</span>` : ''}<span class="changelog-date">${esc(v.date)}</span></div><ul class="changelog-changes">`;
            v.changes.forEach(c => h += `<li>${esc(c)}</li>`);
            h += '</ul></div>';
        });
        h += '</div>';
        $('changelog-content').innerHTML = h;
    } catch (e) {
        console.error('Changelog load error:', e);
        $('changelog-content').innerHTML = '<p class="description-text">Не удалось загрузить историю версий.</p>';
    }
}

// ===== ДЕСКТОП: ЧАСТИЦЫ + ГРАДИЕНТ =====
if (!isTouch) {
    const canvas = $('particles-canvas'), ctx = canvas.getContext('2d');
    const PC = 100, CR = 400, RF = 0.65;
    const particles = Array.from({ length: PC }, () => new Particle());
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2, currentX = mouseX, currentY = mouseY;
    let glowOpacity = 1, isRising = false, riseStartOpacity = 1, riseStartTime = 0;
    let lastActivity = performance.now(), isFading = false;
    const INACTIVITY_DELAY = 3000, FADE_DURATION = 10000, RISE_DURATION = 2000;
    const gradientBg = $('gradient-bg');


    gradientBg.style.setProperty('--mx', '50%'); gradientBg.style.setProperty('--my', '50%'); gradientBg.style.setProperty('--go', '1');

    function Particle() {
        this.homeX = Math.random() * innerWidth; this.homeY = Math.random() * innerHeight;
        this.x = this.homeX; this.y = this.homeY; this.size = Math.random() * 2 + 1;
        this.op = Math.random() * 0.2 + 0.06; this.cOp = this.op; this.vx = 0; this.vy = 0;
    }
    Particle.prototype.update = function (mx, my) {
        const dx = this.x - mx, dy = this.y - my, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CR && dist > 0) {
            const f = (CR - dist) / CR, a = Math.atan2(dy, dx), pf = f * f * RF;
            this.vx += Math.cos(a) * pf; this.vy += Math.sin(a) * pf;
            this.cOp += (Math.min(this.op + f * 0.25, 0.45) - this.cOp) * 0.1;
        } else {
            this.vx += (this.homeX - this.x) * 0.0003; this.vy += (this.homeY - this.y) * 0.0003;
            this.cOp += (this.op - this.cOp) * 0.02;
        }
        this.vx *= 0.92; this.vy *= 0.92; this.x += this.vx; this.y += this.vy;
    };
    Particle.prototype.draw = function () {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const light = document.body.classList.contains('light'), r = light ? 0 : 255;
        ctx.fillStyle = `rgba(${r},${r},${r},${this.cOp})`; ctx.fill();
    };

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    addEventListener('resize', resize); resize();

    (function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < PC; i++) { particles[i].update(currentX, currentY); particles[i].draw(); }
        requestAnimationFrame(loop);
    })();

    function resetActivity() {
        const now = performance.now();
        if (isFading && glowOpacity < 1) { isFading = false; isRising = true; riseStartOpacity = glowOpacity; riseStartTime = now; }
        lastActivity = now;
    }
    addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; resetActivity(); });
    addEventListener('click', resetActivity); addEventListener('scroll', resetActivity, { passive: true }); addEventListener('keydown', resetActivity);

    (function gloop() {
        currentX += (mouseX - currentX) * 0.07; currentY += (mouseY - currentY) * 0.07;
        const now = performance.now(), idle = now - lastActivity;
        if (isRising) {
            const p = Math.min((now - riseStartTime) / RISE_DURATION, 1);
            glowOpacity = riseStartOpacity + (1 - riseStartOpacity) * (1 - Math.pow(1 - p, 3));
            if (p >= 1) { glowOpacity = 1; isRising = false; isFading = false; }
        } else if (idle < INACTIVITY_DELAY) { glowOpacity = 1; isFading = false; }
        else { isFading = true; glowOpacity = 1 - Math.min((idle - INACTIVITY_DELAY) / FADE_DURATION, 1); }
        gradientBg.style.setProperty('--mx', currentX + 'px');
        gradientBg.style.setProperty('--my', currentY + 'px');
        gradientBg.style.setProperty('--go', glowOpacity);
        requestAnimationFrame(gloop);
    })();
}

// ===== МОБИЛКИ: CSS-ЧАСТИЦЫ =====
if (isTouch) {
    const container = $('particles-css'), N = 50, frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
        const dot = document.createElement('div');
        dot.className = 'particle-dot';
        dot.style.cssText = `left:${Math.random() * 100}%;bottom:-10px;--dur:${6 + Math.random() * 10}s;--delay:${Math.random() * 12}s;--drift:${(Math.random() - 0.5) * 60}px;--op:${0.06 + Math.random() * 0.14};width:${1 + Math.random() * 1.5}px;height:${1 + Math.random() * 1.5}px`;
        frag.appendChild(dot);
    }
    container.appendChild(frag);
}

// ===== РЕНДЕР КОНТЕНТА =====
function renderContent() {
    const lng = UI[currentLang];
    if (!lng) return;

    let h = `<p class="description-text">${esc(lng.aboutDesc)}</p>`;
    if (lng.features?.length) {
        h += '<ul class="feature-list">';
        lng.features.forEach(f => h += `<li>${esc(f)}</li>`);
        h += '</ul>';
    }
    $('about-content').innerHTML = h;

    if (lng.faq?.length) {
        h = '<div class="faq-list">';
        lng.faq.forEach(q => h += `<div class="faq-item"><div class="faq-question">${esc(q.q)}</div><div class="faq-answer">${esc(q.a)}</div></div>`);
        h += '</div>';
        $('faq-content').innerHTML = h;
        $('faq-content').querySelectorAll('.faq-question').forEach(q => {
            q.addEventListener('click', () => {
                const item = q.parentElement, open = item.classList.contains('open');
                $('faq-content').querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
                if (!open) item.classList.add('open');
            });
        });
    }
}

// ===== СТАРТ =====
applyLanguage();