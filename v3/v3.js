/* =========================================================
   TOP 折衷案（v3）の動き
   ・メニュー開閉とスライド切替は現行（assets/site.js）と同じ
   ・HUD／ネットワーク／点灯文／順に点灯・解除／傾きは v2（v2/v2.js）から移植
   ・どれも transform / opacity / canvas だけで描き、画面外では止める
   ========================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- メニュー開閉（現行と同じ） ---------- */
  const burger = document.querySelector('.burger');
  const gnav = document.querySelector('.gnav');
  if (burger && gnav) {
    const set = (open) => {
      gnav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('is-menu-open', open);
      document.body.classList.toggle('is-menu-open', open);
    };
    burger.addEventListener('click', () => set(!gnav.classList.contains('is-open')));
    gnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- ヒーローのスライド切替（現行と同じ：6秒ごと） ---------- */
  (() => {
    const slides = [...document.querySelectorAll('.hero__slide')];
    const dots = [...document.querySelectorAll('.hero__dots li')];
    if (slides.length < 2) return;
    let i = 0, timer = null;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); timer = setInterval(() => show(i + 1), 6000); };
    dots.forEach((d, k) => {
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', (k + 1) + '枚目の画像を表示');
      d.addEventListener('click', () => { show(k); start(); });
      d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(k); start(); } });
    });
    document.addEventListener('visibilitychange', () => { document.hidden || reduce ? stop() : start(); });
    if (!reduce) start();
  })();

  /* ---------- HUD：進捗バー・ミニマップ・ナビの下線・比較切替 ---------- */
  const bar = document.querySelector('.progress span');
  const rail = document.querySelector('.rail');
  const vswitch = document.querySelector('.vswitch');
  const secs = [...document.querySelectorAll('.rail [data-sec]')].map((a) => ({ a, el: document.getElementById(a.dataset.sec) }));
  const navItems = [...document.querySelectorAll('.gnav__menu li')];
  const lits = [...document.querySelectorAll('[data-lit]')];

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (rail) rail.classList.toggle('is-show', y > vh * 0.6);
    if (vswitch) vswitch.classList.toggle('is-show', y > vh * 0.6 && y < max - 240);

    let cur = 0;
    secs.forEach((s, i) => { if (s.el && s.el.getBoundingClientRect().top <= vh * 0.4) cur = i; });
    secs.forEach((s, i) => { s.a.classList.toggle('is-here', i === cur); s.a.classList.toggle('is-done', i < cur); });
    const id = secs[cur] && secs[cur].a.dataset.sec;
    navItems.forEach((li) => { const a = li.querySelector('a'); li.classList.toggle('is-current', !!a && a.getAttribute('href') === '#' + id); });

    // 読み進めた分だけ文字が濃くなる
    lits.forEach((el) => {
      if (reduce) { el.style.setProperty('--p', '100%'); return; }
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.4), 0, 1);
      el.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    });
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  onScroll();

  /* ---------- 見出し・本文の出現／事業内容の点灯／実績の解除 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      if (el.hasAttribute('data-circuit')) { el.classList.add('is-on'); return; }
      if (el.hasAttribute('data-rec')) {
        el.querySelectorAll('.rec__box').forEach((box, b) => {
          box.querySelectorAll('.rec__list li').forEach((li, i) => setTimeout(() => li.classList.add('is-in'), reduce ? 0 : 120 + b * 120 + i * 150));
        });
        return;
      }
      el.classList.add('is-in');
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.hd8,[data-reveal],[data-circuit],[data-rec]').forEach((el) => io.observe(el));
  // 念のため：何かで止まっても内容が隠れたままにならないように
  setTimeout(() => document.querySelectorAll('.hd8,[data-reveal]').forEach((el) => el.classList.add('is-in')), 9000);

  /* ---------- ヒーロー：ポインタに追従する淡い光 ---------- */
  const hero = document.querySelector('.hero');
  if (hero && fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---------- ヒーロー：エネルギーネットワーク（v2 と同じ仕組み・控えめ） ----------
     地域ごとの小さなエネルギーノードが系統でつながり、光の粒（電気）が流れて、届いた点が灯る */
  const cv = document.querySelector('.hero__net');
  if (cv && hero) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, nodes = [], edges = [], adj = [], pulses = [], raf = 0, last = 0, spawnT = 0, visible = true;
    const mouse = { x: -9999, y: -9999 };
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = W < 768 ? 92 : 128;
      nodes = [];
      for (let y = gap * 0.8; y < H - gap * 0.8; y += gap) {
        for (let x = gap * 0.5; x < W; x += gap) {
          if (Math.random() < 0.28) continue;
          nodes.push({ x: x + (Math.random() - 0.5) * gap * 0.55, y: y + (Math.random() - 0.5) * gap * 0.55, g: 0 });
        }
      }
      edges = []; const seen = new Set();
      nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)])
          .filter(([j, d]) => j !== i && d < gap * 1.5)
          .sort((p, q) => p[1] - q[1]).slice(0, 3)
          .forEach(([j]) => { const k = i < j ? i + '-' + j : j + '-' + i; if (!seen.has(k)) { seen.add(k); edges.push([i, j]); } });
      });
      adj = nodes.map(() => []);
      edges.forEach(([i, j], e) => { adj[i].push(e); adj[j].push(e); });
      pulses = [];
    };
    const spawn = () => {
      if (!edges.length) return;
      const e = (Math.random() * edges.length) | 0;
      pulses.push({ e, from: Math.random() < 0.5 ? edges[e][0] : edges[e][1], t: 0, hops: 0, speed: 0.0004 + Math.random() * 0.00025 });
    };
    const draw = (dt) => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j];
        const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) / 220);
        ctx.strokeStyle = `rgba(159,211,218,${0.12 + near * 0.3})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        const [i, j] = edges[p.e];
        const to = p.from === i ? j : i;
        const a = nodes[p.from], b = nodes[to];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        p.t += (dt * p.speed * 120) / len;
        const t = Math.min(p.t, 1), t0 = Math.max(0, t - 0.3);
        const hx = a.x + (b.x - a.x) * t, hy = a.y + (b.y - a.y) * t;
        ctx.strokeStyle = 'rgba(191,243,248,.6)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = 'rgba(191,243,248,.18)'; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#E9FBFD'; ctx.beginPath(); ctx.arc(hx, hy, 1.6, 0, 6.283); ctx.fill();
        if (p.t >= 1) {
          nodes[to].g = 1;
          const next = adj[to].filter((e) => e !== p.e);
          if (next.length && p.hops < 5 && Math.random() < 0.65) { p.e = next[(Math.random() * next.length) | 0]; p.from = to; p.t = 0; p.hops++; }
          else pulses.splice(k, 1);
        }
      }
      const decay = Math.pow(0.955, dt / 16.7);
      nodes.forEach((n) => {
        const near = Math.max(0, 1 - Math.hypot(n.x - mouse.x, n.y - mouse.y) / 200);
        if (n.g > 0.02) {
          ctx.fillStyle = `rgba(232,162,58,${n.g * 0.24})`; ctx.beginPath(); ctx.arc(n.x, n.y, 4 + n.g * 8, 0, 6.283); ctx.fill();
          n.g *= decay;
        } else n.g = 0;
        ctx.fillStyle = n.g > 0.1 ? `rgba(255,214,150,${0.45 + n.g * 0.5})` : `rgba(159,211,218,${0.36 + near * 0.5})`;
        ctx.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
      });
    };
    const loop = (ts) => {
      const dt = Math.min(48, ts - (last || ts)); last = ts;
      spawnT += dt;
      if (spawnT > 300 && pulses.length < (W < 768 ? 6 : 11)) { spawn(); spawnT = 0; }
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden && !reduce) { last = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    build();
    if (reduce) draw(0); else start();
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (hero.clientWidth !== W) { build(); if (reduce) draw(0); } }, 200); });
    if (fine) {
      hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    }
  }

  /* ---------- 製品カード：傾きと反射（PCのみ） ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const media = card.querySelector('.work__media');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
        if (media) media.style.setProperty('--sx', (120 - x * 140).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        if (media) media.style.setProperty('--sx', '120%');
      });
    });
  }

  /* ---------- お知らせ：管理画面で公開した記事（現行と同じカード） ---------- */
  const B = window.BlogStore;
  const box = document.querySelector('[data-posts="latest"]');
  if (B && box) {
    const render = () => {
      const lang = window.I18N ? I18N.lang : 'ja';
      const ps = B.published(lang).slice(0, 3);
      box.innerHTML = ps.length ? ps.map((p) => `
        <a class="post-card" href="../blog/post.html?id=${encodeURIComponent(p.id)}">
          <div class="post-card__img">${p.image ? `<img src="${B.esc(B.url(p.image))}" alt="" loading="lazy">` : '<span class="post-card__noimg">NEWS</span>'}</div>
          <div class="post-card__body">
            <p class="post-card__meta"><time>${B.fmtDate(p.date)}</time><span class="post-card__cat">${B.esc(B.catLabel(p.cat, lang))}</span></p>
            <h3 class="post-card__ttl" data-i18n-skip>${B.esc(p.title)}</h3>
          </div>
        </a>`).join('')
        : `<p class="posts__empty">${window.I18N ? I18N.t('まだ記事がありません') : 'まだ記事がありません'}</p>`;
    };
    document.addEventListener('langchange', render);
    render();
  }
})();
