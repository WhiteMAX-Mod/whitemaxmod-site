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
        notFoundBtn: "← На главную",
        changelogLabel: "История",
        changelogTitle: "Что нового",
        currentBadge: "текущая"
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
        notFoundBtn: "← Home",
        changelogLabel: "History",
        changelogTitle: "What's new",
        currentBadge: "current"
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
    if ($('lang-toggle')) $('lang-toggle').textContent = currentLang === 'ru' ? 'EN' : 'RU';

    document.querySelectorAll('[data-ru][data-en]').forEach(el => {
        const val = el.getAttribute(`data-${currentLang}`);
        if (val) {
            if (val.includes('<br>')) {
                el.innerHTML = val;
            } else {
                el.textContent = val;
            }
        }
    });

    if ($('toast')) $('toast').textContent = t('toast');
    renderContent();
    loadChangelog();
}

if ($('lang-toggle')) {
    $('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        localStorage.setItem('whitemax-lang', currentLang);
        applyLanguage();
    });
}

// ===== 404 =====
const validPaths = ['/', '/index.html', '/about', '/download', '/contacts'];
const is404 = !validPaths.some(p => window.location.pathname.includes(p));
if (is404 && $('main-content')) {
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
if ($('theme-toggle')) {
    $('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light');
        localStorage.setItem('whitemax-theme', document.body.classList.contains('light') ? 'light' : 'dark');
    });
}

// (Старая панель связи удалена, теперь для этого есть отдельная страница)
document.querySelectorAll('.contact-value').forEach(el => {
    el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.textContent).catch(() => {});
        el.style.opacity = '0.5';
        setTimeout(() => { el.style.opacity = ''; }, 200);
    });
});

// ===== КНОПКА НАВЕРХ =====
addEventListener('scroll', () => { $('scroll-top-btn')?.classList.toggle('visible', scrollY > 400); }, { passive: true });
$('scroll-top-btn')?.addEventListener('click', () => { scrollTo({ top: 0, behavior: 'smooth' }); });

// ===== ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (Event Delegation) =====
let warningTimer = null, toastTimer = null;

document.addEventListener('click', (e) => {
    // 1. Кнопка скачивания и Тост
    const btn = e.target.closest('#download-btn');
    if (btn) {
        if (warningTimer) return;
        const dw = $('download-warning');
        if (dw) {
            if (!dw.classList.contains('visible')) {
                dw.classList.add('visible');
            } else {
                dw.classList.remove('visible');
                void dw.offsetWidth;
                dw.classList.add('visible');
            }
            warningTimer = setTimeout(() => { dw.classList.remove('visible'); warningTimer = null; }, 10000);
        }
        const t = $('toast');
        if (t) {
            clearTimeout(toastTimer);
            t.classList.add('visible');
            toastTimer = setTimeout(() => { t.classList.remove('visible'); }, 6000);
        }
    }

    // 2. FAQ
    const faqQ = e.target.closest('.faq-question');
    if (faqQ) {
        const item = faqQ.parentElement;
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!open) item.classList.add('open');
    }

    // 3. (Удален старый SPA роутер на основе pushState)
    
    // 4. Клик по тосту
    const toastEl = e.target.closest('#toast');
    if (toastEl) {
        document.getElementById('install-section')?.scrollIntoView({ behavior: 'smooth' });
        toastEl.classList.remove('visible');
        clearTimeout(toastTimer);
    }
});

// ===== ПАРСИНГ РЕЛИЗОВ =====
const CAT_EN = { 'Добавлено': 'Added', 'Изменено': 'Changed', 'Исправлено': 'Fixed', 'Удалено': 'Removed' };

function parseRelease(body) {
    if (!body) return null;
    const header = body.match(/##\s*\[(.+?)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (!header) return null;
    const content = body.split(/\n---/)[0];
    const sections = content.split(/^###\s+/m).slice(1);
    const categories = [];
    for (const sec of sections) {
        const lines = sec.split('\n');
        const name = lines[0].trim();
        if (!['Добавлено', 'Изменено', 'Исправлено', 'Удалено'].includes(name)) continue;
        const items = lines.slice(1).map(l => l.replace(/^\s*-\s*/, '').trim()).filter(l => l.length > 0);
        if (items.length) categories.push({ name, items });
    }
    return categories.length ? { version: header[1], date: header[2], categories } : null;
}

function formatDate(iso, lang) {
    const [y, m, d] = iso.split('-');
    return lang === 'ru' ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
}

// ===== GITHUB API: СЧЁТЧИК + ССЫЛКА + ЧЕЙНДЖЛОГ =====
async function updateGithubData() {
    const CACHE_KEY = 'whitemax-dl-cache', CACHE_TTL = 300000; // 5 минут
    let cached;
    try {
        cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (e) {
        cached = null;
    }
    
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if ($('download-count-value')) $('download-count-value').textContent = cached.total.toLocaleString();
        if (cached.url && $('download-btn')) $('download-btn').href = cached.url;
        if (cached.changelog) loadChangelog();
        return;
    }

    try {
        const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`);
        if (!resp.ok) throw new Error('rate limited');
        const releases = await resp.json();

        let total = 0, latestUrl = '', latestDate = '';
        const changelog = [];

        for (const r of releases) {
            let apkUrl = '';
            for (const a of r.assets) {
                if (a.name.endsWith('.apk') && !a.name.toLowerCase().includes('increased')) {
                    total += a.download_count;
                    if (!apkUrl) apkUrl = a.browser_download_url;
                }
            }
            const parsed = parseRelease(r.body);
            if (parsed) {
                changelog.push(parsed);
                if (apkUrl && (!latestDate || new Date(parsed.date) > new Date(latestDate))) {
                    latestDate = parsed.date;
                    latestUrl = apkUrl;
                }
            }
        }
        changelog.sort((a, b) => new Date(b.date) - new Date(a.date));

        localStorage.setItem(CACHE_KEY, JSON.stringify({ total, url: latestUrl, changelog, ts: Date.now() }));
        if ($('download-count-value')) $('download-count-value').textContent = total.toLocaleString();
        if (latestUrl && $('download-btn')) $('download-btn').href = latestUrl;
        loadChangelog();
    } catch (e) {
        if (cached) {
            cached.ts = Date.now(); // Фикс лимита API: не долбим API при Rate Limit
            localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
            
            if ($('download-count-value')) $('download-count-value').textContent = cached.total.toLocaleString();
            if (cached.url && $('download-btn')) $('download-btn').href = cached.url;
            if (cached.changelog) loadChangelog();
        } else {
            if ($('download-count-value')) $('download-count-value').textContent = '—';
            loadChangelog();
        }
    }
}

// ===== ЧЕЙНДЖЛОГ =====
function loadChangelog() {
    const clLabel = $('changelog-label'), clTitle = $('changelog-title'), clContent = $('changelog-content');
    if (!clLabel) return;
    const cached = JSON.parse(localStorage.getItem('whitemax-dl-cache') || 'null');
    if (cached && cached.changelog && cached.changelog.length) {
        renderChangelog(cached.changelog);
        return;
    }
    clLabel.textContent = t('changelogLabel');
    if (clTitle) clTitle.textContent = t('changelogTitle');
    if (clContent) clContent.innerHTML = '<p class="description-text">Не удалось загрузить историю версий.</p>';
}

function renderChangelog(changelog) {
    const clLabel = $('changelog-label'), clTitle = $('changelog-title'), clContent = $('changelog-content');
    if (!clLabel || !clTitle || !clContent) return;
    const badge = t('currentBadge');
    let h = '<div class="changelog-list">';
    changelog.forEach((v, i) => {
        h += `<div class="changelog-entry"><div class="changelog-header"><span class="changelog-version">${esc(v.version)}</span>${i === 0 ? ` <span class="current-badge">${esc(badge)}</span>` : ''}<span class="changelog-date">${esc(formatDate(v.date, currentLang))}</span></div>`;
        v.categories.forEach(cat => {
            const catName = currentLang === 'en' ? (CAT_EN[cat.name] || cat.name) : cat.name;
            h += `<div class="changelog-category">${esc(catName)}</div><ul class="changelog-changes">`;
            cat.items.forEach(item => h += `<li>${esc(item)}</li>`);
            h += '</ul>';
        });
        h += '</div>';
    });
    h += '</div>';
    clContent.innerHTML = h;
}

// ===== ДЕСКТОП: ЧАСТИЦЫ + ГРАДИЕНТ =====
if (!isTouch && $('particles-canvas')) {
    const canvas = $('particles-canvas'), ctx = canvas.getContext('2d');
    const PC = 100, CR = 400, RF = 0.65;
    const particles = Array.from({ length: PC }, () => new Particle());
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2, currentX = mouseX, currentY = mouseY;
    let glowOpacity = 1, isRising = false, riseStartOpacity = 1, riseStartTime = 0;
    let lastActivity = performance.now(), isFading = false;
    const INACTIVITY_DELAY = 3000, FADE_DURATION = 10000, RISE_DURATION = 2000;

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
    Particle.prototype.draw = function (isLight) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const r = isLight ? 0 : 255;
        ctx.fillStyle = `rgba(${r},${r},${r},${this.cOp})`; ctx.fill();
    };

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    addEventListener('resize', resize); resize();

    function resetActivity() {
        const now = performance.now();
        if (isFading && glowOpacity < 1) { isFading = false; isRising = true; riseStartOpacity = glowOpacity; riseStartTime = now; }
        lastActivity = now;
    }
    addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; resetActivity(); });
    addEventListener('click', resetActivity); addEventListener('scroll', resetActivity, { passive: true }); addEventListener('keydown', resetActivity);

    (function loop() {
        if (document.hidden) {
            requestAnimationFrame(loop);
            return;
        }
        currentX += (mouseX - currentX) * 0.07; currentY += (mouseY - currentY) * 0.07;
        const now = performance.now(), idle = now - lastActivity;
        if (isRising) {
            const p = Math.min((now - riseStartTime) / RISE_DURATION, 1);
            glowOpacity = riseStartOpacity + (1 - riseStartOpacity) * (1 - Math.pow(1 - p, 3));
            if (p >= 1) { glowOpacity = 1; isRising = false; isFading = false; }
        } else if (idle < INACTIVITY_DELAY) { glowOpacity = 1; isFading = false; }
        else { isFading = true; glowOpacity = 1 - Math.min((idle - INACTIVITY_DELAY) / FADE_DURATION, 1); }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isLight = document.body.classList.contains('light');
        
        // Оптимизация: рисуем свечение средствами канваса
        if (glowOpacity > 0.01) {
            const rg = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 600);
            if (isLight) {
                rg.addColorStop(0, `rgba(0,0,0,${0.10 * glowOpacity})`);
                rg.addColorStop(0.2, `rgba(0,0,0,${0.06 * glowOpacity})`);
                rg.addColorStop(0.4, `rgba(0,0,0,${0.03 * glowOpacity})`);
                rg.addColorStop(0.6, `rgba(0,0,0,${0.012 * glowOpacity})`);
                rg.addColorStop(0.8, `rgba(0,0,0,${0.004 * glowOpacity})`);
                rg.addColorStop(1, 'transparent');
            } else {
                rg.addColorStop(0, `rgba(255,255,255,${0.12 * glowOpacity})`);
                rg.addColorStop(0.2, `rgba(255,255,255,${0.08 * glowOpacity})`);
                rg.addColorStop(0.4, `rgba(255,255,255,${0.04 * glowOpacity})`);
                rg.addColorStop(0.6, `rgba(255,255,255,${0.015 * glowOpacity})`);
                rg.addColorStop(0.8, `rgba(255,255,255,${0.004 * glowOpacity})`);
                rg.addColorStop(1, 'transparent');
            }
            ctx.fillStyle = rg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        for (let i = 0; i < PC; i++) { particles[i].update(currentX, currentY); particles[i].draw(isLight); }
        requestAnimationFrame(loop);
    })();
}

// ===== МОБИЛКИ: CSS-ЧАСТИЦЫ =====
if (isTouch && $('particles-css')) {
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

    if ($('about-content')) {
        let h = `<p class="description-text">${esc(lng.aboutDesc)}</p>`;
        if (lng.features?.length) {
            h += '<ul class="feature-list">';
            lng.features.forEach(f => h += `<li>${esc(f)}</li>`);
            h += '</ul>';
        }
        $('about-content').innerHTML = h;
    }

    if (lng.faq?.length && $('faq-content')) {
        let h = '<div class="faq-list">';
        lng.faq.forEach(q => h += `<div class="faq-item"><div class="faq-question">${esc(q.q)}</div><div class="faq-answer">${esc(q.a)}</div></div>`);
        h += '</div>';
        $('faq-content').innerHTML = h;
    }
}

// Функция копирования почты
window.copyEmail = function(e, email) {
    navigator.clipboard.writeText(email);
    const x = e.clientX;
    const y = e.clientY;
    const toast = document.createElement('div');
    toast.textContent = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'Copied!' : 'Скопировано!';
    toast.style.cssText = `position:fixed; left:${x}px; top:${y-20}px; background:rgba(30,30,30,0.9); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px 12px; border-radius:8px; font-family:'DM Sans', sans-serif; font-size:12px; font-weight:500; pointer-events:none; z-index:9999; transform:translate(-50%, 0); transition:all 1s ease; opacity:1; box-shadow:0 4px 12px rgba(0,0,0,0.5); backdrop-filter:blur(4px);`;
    document.body.appendChild(toast);
    
    // Плавное уплывание вверх
    requestAnimationFrame(() => {
        setTimeout(() => {
            toast.style.transform = 'translate(-50%, -40px)';
            toast.style.opacity = '0';
        }, 50);
    });
    
    setTimeout(() => toast.remove(), 1050);
};

// Запуск при загрузке
updateActiveNav();
applyLanguage();
if ($('minigame-container')) initMiniGame();
loadChangelog();
updateGithubData();

// ===== HASH ROUTER =====
function getHashPath() {
    const hash = window.location.hash.replace('#', '');
    return hash || 'index';
}

function updateActiveNav(hashPath) {
    document.querySelectorAll('.nav-link, .spa-link').forEach(n => {
        let href = n.getAttribute('href');
        if (href) href = href.replace('#', '');
        if (!href || href === '/') href = 'index';
        
        if (href === hashPath) {
            n.classList.add('active');
        } else {
            n.classList.remove('active');
        }
    });
}

async function handleHashChange() {
    const hashPath = getHashPath();
    updateActiveNav(hashPath);
    
    let targetUrl = hashPath === 'index' ? 'index.html' : `${hashPath}.html`;
    
    const mc = $('main-content');
    if (mc) mc.style.opacity = '0';
    
    try {
        const resp = await fetch(targetUrl);
        if (!resp.ok) throw new Error('not found');
        const html = await resp.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('#main-content');
        
        if (mc && newContent) {
            setTimeout(() => {
                mc.className = newContent.className;
                mc.style.cssText = newContent.style.cssText;
                mc.innerHTML = newContent.innerHTML;
                mc.style.opacity = '1';
                document.title = doc.title;
                applyLanguage();
                updateGithubData();
                initMiniGame();
                window.scrollTo(0, 0); // Прокрутка наверх при переходе
            }, 300);
        }
    } catch(e) {
        if (mc) {
            setTimeout(() => {
                mc.innerHTML = `<div class="page-404"><div class="code">404</div><h2>${t('notFoundTitle')}</h2><p>${t('notFoundText')}</p></div>`;
                mc.style.opacity = '1';
            }, 300);
        }
    }
}

window.addEventListener('hashchange', handleHashChange);

if (window.location.hash) {
    handleHashChange();
} else {
    updateActiveNav('index');
}

// ===== МИНИ-ИГРА (Dino-клон) =====
let gameLoop = null;
function initMiniGame() {
    const canvas = $('minigame-canvas');
    const container = $('minigame-container');
    const trigger = $('floating-cubosaur');
    if (!canvas || !container) {
        if (gameLoop) { cancelAnimationFrame(gameLoop); gameLoop = null; }
        return;
    }
    
    let isCaught = false;
    if (trigger && !trigger.dataset.bound) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (isCaught) return;
            isCaught = true;
            trigger.classList.add('is-flying');
            
            // 1. Показываем контейнер и принудительно рассчитываем геометрию открытого состояния
            container.style.transition = 'none';
            container.style.display = 'block';
            container.style.maxHeight = '400px';
            container.style.opacity = '1';
            container.style.marginTop = '48px';
            void container.offsetHeight; // Force reflow

            // 2. Отключаем CSS smooth scroll на время полета
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';

            // 3. Точные неискаженные начальные координаты кубозаврика в документе
            const startScrollY = window.scrollY;
            const startDocX = cx + window.scrollX;
            const startDocY = cy + startScrollY;
            const startRot = crot;

            // 4. Точные координаты центра персонажа Дино в открытом холсте
            const canvasRect = canvas.getBoundingClientRect();
            const targetDocX = canvasRect.left + window.scrollX + (canvasRect.width * (60 / 600)) - 4.5;
            const targetDocY = canvasRect.top + window.scrollY + (canvasRect.height * (110 / 150)) - 4.5;
            
            // Максимально возможный скролл страницы
            const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const targetScrollY = Math.min(maxScrollY, Math.max(0, targetDocY - (window.innerHeight / 2)));
            
            // Восстанавливаем плавность opacity контейнера
            container.style.transition = 'opacity 0.6s ease';

            // Переводим в absolute с точным совпадением с cx/cy
            trigger.style.transition = 'none';
            trigger.style.position = 'absolute';
            trigger.style.left = startDocX + 'px';
            trigger.style.top = startDocY + 'px';
            trigger.style.margin = '0';
            
            const DURATION = 2000;
            const startTime = performance.now();
            
            function flyAndFollow(now) {
                const elapsed = now - startTime;
                const p = Math.min(elapsed / DURATION, 1);
                
                // Плавная easing-функция (easeInOutCubic)
                const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                
                // Вычисляем текущую позицию кубика в документе
                const currX = startDocX + (targetDocX - startDocX) * easeP;
                const currY = startDocY + (targetDocY - startDocY) * easeP;
                
                trigger.style.left = currX + 'px';
                trigger.style.top = currY + 'px';
                trigger.style.transform = `rotate(${startRot + easeP * 1440}deg) scale(${1 + easeP * 0.6})`;
                
                // Затухание под конец полета (последние 15% времени)
                if (p > 0.85) {
                    trigger.style.opacity = (1 - (p - 0.85) / 0.15).toFixed(2);
                }
                
                // Плавное движение камеры от НАЧАЛЬНОЙ позиции скролла к ФИНАЛЬНОЙ
                const currScrollY = startScrollY + (targetScrollY - startScrollY) * easeP;
                window.scrollTo(0, currScrollY);
                
                if (p < 1) {
                    requestAnimationFrame(flyAndFollow);
                } else {
                    trigger.style.display = 'none';
                    document.documentElement.style.scrollBehavior = originalScrollBehavior;
                }
            }
            requestAnimationFrame(flyAndFollow);
        });
        trigger.dataset.bound = "true";

        // Логика отталкивания кубозаврика от курсора
        let cx = Math.random() * (innerWidth - 40) + 20;
        let cy = Math.random() * (innerHeight - 40) + 20;
        let cvx = 0;
        let cvy = 0;
        let crot = 0;
        let cMouseX = innerWidth / 2;
        let cMouseY = innerHeight / 2;

        function updatePointer(e) {
            if (e.touches && e.touches.length > 0) {
                cMouseX = e.touches[0].clientX;
                cMouseY = e.touches[0].clientY;
            } else if (e.clientX !== undefined) {
                cMouseX = e.clientX;
                cMouseY = e.clientY;
            }
        }

        window.addEventListener('mousemove', updatePointer);
        window.addEventListener('touchmove', updatePointer, { passive: true });
        window.addEventListener('touchstart', updatePointer, { passive: true });

        trigger.addEventListener('touchstart', () => {
            if (!isCaught) trigger.click();
        }, { passive: true });

        function animateCubosaur() {
            if (isCaught || trigger.style.display === 'none') return;
            
            const dx = cx - cMouseX;
            const dy = cy - cMouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = innerWidth < 600 ? 140 : 280;
            if (dist < maxDist && dist > 0) {
                const f = (maxDist - dist) / maxDist;
                const angle = Math.atan2(dy, dx);
                const pushForce = innerWidth < 600 ? 0.28 : 0.20;
                cvx += Math.cos(angle) * f * pushForce; 
                cvy += Math.sin(angle) * f * pushForce;
            }
            
            // Трение
            cvx *= 0.91;
            cvy *= 0.91;

            // Мягкое отталкивание от краев экрана
            if (cx <= 20) cvx += 0.15;
            if (cx >= innerWidth - 20) cvx -= 0.15;
            if (cy <= 20) cvy += 0.15;
            if (cy >= innerHeight - 20) cvy -= 0.15;

            cx += cvx;
            cy += cvy;
            
            // Вращение в зависимости от скорости по X
            crot += cvx * 3;

            trigger.style.left = cx + 'px';
            trigger.style.top = cy + 'px';
            trigger.style.transform = `rotate(${crot}deg)`;
            
            requestAnimationFrame(animateCubosaur);
        }
        requestAnimationFrame(animateCubosaur);
    }
    
    const ctx = canvas.getContext('2d');
    let dino = { x: 50, y: 100, w: 20, h: 20, dy: 0, gravity: 0.55, jump: -8.5, grounded: true };
    let obstacles = [];
    let score = 0;
    let highscore = localStorage.getItem('whitemax-game-highscore') || 0;
    $('minigame-highscore').textContent = highscore;
    let frame = 0;
    let playing = false;
    let gameOver = false;

    function reset() {
        dino.y = 100; dino.dy = 0; dino.grounded = true;
        obstacles = []; score = 0; frame = 0;
        $('minigame-score').textContent = score;
        gameOver = false;
    }

    function doJump(e) {
        if (e && e.type !== 'keydown') e.preventDefault();
        if (e && e.type === 'keydown' && e.code !== 'Space') return;
        
        if (gameOver) {
            reset();
            playing = true;
        } else if (!playing) {
            playing = true;
        }
        
        if (dino.grounded) {
            dino.dy = dino.jump;
            dino.grounded = false;
        }
    }

    if (!canvas.dataset.bound) {
        canvas.addEventListener('mousedown', doJump);
        canvas.addEventListener('touchstart', doJump, {passive: false});
        canvas.dataset.bound = "true";
    }

    if (!window.minigameKeydownBound) {
        window.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName !== 'INPUT' && $('minigame-canvas')) {
                if (e.code === 'Space') { 
                    e.preventDefault(); 
                    // trigger click to simulate jump on current canvas
                    $('minigame-canvas').dispatchEvent(new Event('mousedown'));
                }
            }
        });
        window.minigameKeydownBound = true;
    }

    function update() {
        if (!playing) return;
        
        dino.dy += dino.gravity;
        dino.y += dino.dy;
        if (dino.y + dino.h > 120) {
            dino.y = 120 - dino.h;
            dino.dy = 0;
            dino.grounded = true;
        }

        if (frame % 100 === 0) {
            obstacles.push({ x: canvas.width, w: 15, h: 15 + Math.random() * 25 });
        }

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= 3.8 + (score * 0.04); // баланс ускорения
            
            if (
                dino.x < obs.x + obs.w &&
                dino.x + dino.w > obs.x &&
                dino.y < 120 &&
                dino.y + dino.h > 120 - obs.h
            ) {
                gameOver = true;
                playing = false;
                if (score > highscore) {
                    highscore = score;
                    localStorage.setItem('whitemax-game-highscore', highscore);
                    $('minigame-highscore').textContent = highscore;
                }
            }
        }
        
        if (obstacles.length && obstacles[0].x < -20) {
            obstacles.shift();
            score++;
            $('minigame-score').textContent = score;
        }
        
        frame++;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, 120, canvas.width, 2);

        if (!playing && !gameOver) {
            ctx.fillStyle = '#888';
            ctx.font = '500 15px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(currentLang === 'en' ? 'Click or Space to start' : 'Кликни или нажми пробел', canvas.width/2, 60);
        } else if (gameOver) {
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 22px "DM Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, 60);
            ctx.fillStyle = '#888';
            ctx.font = '500 15px "Inter", sans-serif';
            ctx.fillText(currentLang === 'en' ? 'Click to restart' : 'Кликни для рестарта', canvas.width/2, 85);
        }

        // Dino with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = gameOver ? '#ff4444' : '#fff';
        ctx.fillStyle = gameOver ? '#ff4444' : '#fff';
        ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
        ctx.shadowBlur = 0; // reset for obstacles

        ctx.fillStyle = '#888';
        for (let obs of obstacles) {
            ctx.fillRect(obs.x, 120 - obs.h, obs.w, obs.h);
        }
    }

    function loop() {
        if ($('minigame-canvas') !== canvas || document.hidden) {
            requestAnimationFrame(loop);
            return;
        }
        
        if (playing || gameOver) {
            update();
            draw();
        }
        requestAnimationFrame(loop);
    }
    draw(); // первичный статический рисунок
    
    if (!canvas.dataset.looping) {
        loop();
        canvas.dataset.looping = "true";
    }
}
// Запускаем на первой загрузке
initMiniGame();