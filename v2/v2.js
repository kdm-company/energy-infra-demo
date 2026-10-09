/* =========================================================
   TOP 新デザイン案（v2）の動き
   ・どれも transform / opacity / canvas だけで描き、レイアウトを揺らさない
   ・画面外では止める。「動きを減らす」設定では止めた状態で表示する
   ========================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- HUD：ヘッダー・進捗バー・ミニマップ ---------- */
  const hd = document.querySelector('.hd');
  const bar = document.querySelector('.progress span');
  const rail = document.querySelector('.rail');
  const secs = [...document.querySelectorAll('.rail [data-sec]')].map((a) => ({ a, el: document.getElementById(a.dataset.sec) }));
  const navLinks = [...document.querySelectorAll('.hd__nav ul a')];
  const lits = [...document.querySelectorAll('[data-lit]')];
  const heroBg = document.querySelector('.hero__bg');
  const compare = document.querySelector('.compare');

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    hd.classList.toggle('is-solid', y > 40);
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    rail.classList.toggle('is-show', y > vh * 0.5);
    if (compare) compare.classList.toggle('is-show', y > vh * 0.8 && y < max - 260);

    let cur = 0;
    secs.forEach((s, i) => { if (s.el && s.el.getBoundingClientRect().top <= vh * 0.4) cur = i; });
    secs.forEach((s, i) => { s.a.classList.toggle('is-here', i === cur); s.a.classList.toggle('is-done', i < cur); });
    const id = secs[cur] && secs[cur].a.dataset.sec;
    navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + id));

    // 読み進めた分だけ文字が点灯する
    lits.forEach((el) => {
      if (reduce) { el.style.setProperty('--p', '100%'); return; }
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.42), 0, 1);
      el.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    });

    // 背景はゆっくり、手前はそのまま：奥行き（パララックス）
    if (heroBg && !reduce && y < vh * 1.2) heroBg.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  onScroll();

  /* ---------- メニュー（スマホ）：ポーズメニューのように全面表示 ---------- */
  const burger = document.querySelector('.hd__burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 出現・回路の点灯・実績の解除 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      if (el.hasAttribute('data-circuit')) { el.classList.add('is-on'); return; }
      if (el.hasAttribute('data-ach')) {
        el.querySelectorAll('.ach__row').forEach((row, i) => setTimeout(() => row.classList.add('is-in'), reduce ? 0 : 160 * i));
        return;
      }
      el.classList.add('is-in');
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal],[data-circuit],[data-ach]').forEach((el) => io.observe(el));

  /* ---------- ヒーロー：ポインタに追従する光と、背景の微かなずれ ---------- */
  const hero = document.querySelector('.hero');
  if (hero && fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      heroBg.style.setProperty('--px', ((x - 0.5) * -18).toFixed(1) + 'px');
    });
  }

  /* ---------- ヒーロー：エネルギーネットワーク（canvas） ----------
     地域ごとの小さなエネルギーノードが系統でつながり、
     電気（光の粒）が流れて届いた点が灯る。事業そのものの図解でもある。 */
  const cv = document.querySelector('.hero__grid');
  if (cv && hero) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, nodes = [], edges = [], adj = [], pulses = [], raf = 0, last = 0, spawnT = 0, visible = true;
    const mouse = { x: -9999, y: -9999 };
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = W < 768 ? 88 : 116;
      nodes = [];
      for (let y = gap * 0.7; y < H - gap * 0.3; y += gap) {
        for (let x = gap * 0.5; x < W; x += gap) {
          if (Math.random() < 0.24) continue;
          nodes.push({ x: x + (Math.random() - 0.5) * gap * 0.55, y: y + (Math.random() - 0.5) * gap * 0.55, g: 0 });
        }
      }
      edges = []; const seen = new Set();
      nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)])
          .filter(([j, d]) => j !== i && d < gap * 1.55)
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
      const from = Math.random() < 0.5 ? edges[e][0] : edges[e][1];
      pulses.push({ e, from, t: 0, hops: 0, speed: 0.00042 + Math.random() * 0.00028 });
    };
    const draw = (dt) => {
      ctx.clearRect(0, 0, W, H);
      // 系統（線）
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j];
        const mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y;
        const near = Math.max(0, 1 - Math.hypot(mx, my) / 220);
        ctx.strokeStyle = `rgba(159,211,218,${0.12 + near * 0.34})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      // 電気の粒
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        const [i, j] = edges[p.e];
        const to = p.from === i ? j : i;
        const a = nodes[p.from], b = nodes[to];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        p.t += (dt * p.speed * 120) / len;
        const t = Math.min(p.t, 1), t0 = Math.max(0, t - 0.35);
        const hx = a.x + (b.x - a.x) * t, hy = a.y + (b.y - a.y) * t;
        ctx.strokeStyle = 'rgba(191,243,248,.75)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = 'rgba(191,243,248,.22)'; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#E9FBFD'; ctx.beginPath(); ctx.arc(hx, hy, 1.8, 0, 6.283); ctx.fill();
        if (p.t >= 1) {
          nodes[to].g = 1;
          const next = adj[to].filter((e) => e !== p.e);
          if (next.length && p.hops < 6 && Math.random() < 0.7) {
            p.e = next[(Math.random() * next.length) | 0]; p.from = to; p.t = 0; p.hops++;
          } else pulses.splice(k, 1);
        }
      }
      // ノード（届いた点は太陽色に灯る）
      const decay = Math.pow(0.955, dt / 16.7);
      nodes.forEach((n) => {
        const near = Math.max(0, 1 - Math.hypot(n.x - mouse.x, n.y - mouse.y) / 200);
        if (n.g > 0.02) {
          ctx.fillStyle = `rgba(232,162,58,${n.g * 0.28})`; ctx.beginPath(); ctx.arc(n.x, n.y, 5 + n.g * 9, 0, 6.283); ctx.fill();
          n.g *= decay;
        } else n.g = 0;
        ctx.fillStyle = n.g > 0.1 ? `rgba(255,214,150,${0.5 + n.g * 0.5})` : `rgba(159,211,218,${0.32 + near * 0.6})`;
        ctx.fillRect(n.x - 1.6, n.y - 1.6, 3.2, 3.2);
      });
    };
    const loop = (ts) => {
      const dt = Math.min(48, ts - (last || ts)); last = ts;
      spawnT += dt;
      const cap = W < 768 ? 7 : 14;
      if (spawnT > 260 && pulses.length < cap) { spawn(); spawnT = 0; }
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

  /* ---------- 製品カード：傾きと反射で「手に取って見る」感触 ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const stage = card.querySelector('.item__stage');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(2) + 'deg');
        if (stage) stage.style.setProperty('--sx', (120 - x * 140).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        if (stage) stage.style.setProperty('--sx', '120%');
      });
    });
  }

  /* ---------- お知らせ：管理画面で公開した記事を表示中の言語で ---------- */
  const B = window.BlogStore;
  const box = document.querySelector('[data-briefs]');
  if (B && box) {
    const render = () => {
      const lang = window.I18N ? I18N.lang : 'ja';
      const ps = B.published(lang).slice(0, 3);
      box.innerHTML = ps.length ? ps.map((p) => `
        <a class="brief frame" href="../blog/post.html?id=${encodeURIComponent(p.id)}">
          <div class="brief__img">${p.image ? `<img src="${B.esc(B.url(p.image))}" alt="" loading="lazy">` : '<span class="brief__noimg">NEWS</span>'}</div>
          <div class="brief__body">
            <p class="brief__meta"><time>${B.fmtDate(p.date)}</time><span class="brief__cat">${B.esc(B.catLabel(p.cat, lang))}</span></p>
            <h3 class="brief__ttl" data-i18n-skip>${B.esc(p.title)}</h3>
          </div>
        </a>`).join('')
        : `<p class="briefs__empty">${window.I18N ? I18N.t('まだ記事がありません') : 'まだ記事がありません'}</p>`;
    };
    document.addEventListener('langchange', render);
    render();
  }
})();
