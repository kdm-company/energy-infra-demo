/* =========================================================
   確認用サイト v2 の動き
   ・メニュー開閉（全画面・中央揃え）
   ・控えめなフェードイン
   ・ニュースのタブ切り替え／記事ページの表示切り替え
   ・ヒーローと見出し帯の「エネルギーの粒」（前回までの確認用サイトから引き継ぎ）
   ・「動きを減らす」設定の端末では、動きを止めて完成形で表示する
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- メニュー開閉 ---------- */
  const burger = document.querySelector('.burger');
  const gnav = document.querySelector('.gnav');
  if (burger && gnav) {
    const set = (open) => {
      gnav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      const label = burger.querySelector('.burger__label');
      if (label) label.textContent = open ? 'CLOSE' : 'MENU';
      document.documentElement.classList.toggle('is-menu-open', open);
      document.body.classList.toggle('is-menu-open', open);
    };
    burger.addEventListener('click', () => set(!gnav.classList.contains('is-open')));
    gnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- 控えめなフェードイン ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const sel = '.sh,.dmis,.pillar,.dnode,.impact,.recruit__in,.nlist,.tech__head,.tech__body > *,.biz__txt,.biz__media,.prods2,.app2,.ems2,.target,.merits li,.dflow li,.ib,.mvv2 > div,.tl2__y,.kind,.cbase > div,.pd2,.research';
    const els = [...document.querySelectorAll(sel)];
    els.forEach((el) => el.classList.add('rv'));
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((n) => n.classList.contains('rv'));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 3) * 80 + 'ms';
    });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    els.forEach((el) => io.observe(el));
    setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 6000);
  }

  /* ---------- ニュース：タブで絞り込み（?cat=trend などで開いたときはそのタブを選ぶ） ---------- */
  const tabs = [...document.querySelectorAll('.tabs [data-cat]')];
  if (tabs.length) {
    const items = [...document.querySelectorAll('#news-list .nitem')];
    const pick = (cat) => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.cat === cat)));
      items.forEach((it) => { it.hidden = !(cat === 'all' || it.dataset.cat === cat); });
    };
    tabs.forEach((t) => t.addEventListener('click', () => {
      pick(t.dataset.cat);
      const u = new URL(location.href);
      if (t.dataset.cat === 'all') u.searchParams.delete('cat'); else u.searchParams.set('cat', t.dataset.cat);
      history.replaceState(null, '', u);
    }));
    const q = new URLSearchParams(location.search).get('cat');
    if (q && tabs.some((t) => t.dataset.cat === q)) pick(q);
  }

  /* ---------- ニュース詳細：?id= の記事だけを表示（無ければ最新の記事） ---------- */
  const arts = [...document.querySelectorAll('.art2[data-id]')];
  if (arts.length) {
    const id = new URLSearchParams(location.search).get('id');
    const hit = arts.find((a) => a.dataset.id === id) || arts[0];
    hit.hidden = false;
    const ttl = hit.querySelector('.art2__ttl');
    if (ttl) document.title = ttl.textContent + '｜株式会社ルメナスホールディングス';
  }
})();

/* 下層ページの見出し帯：エネルギーの粒
   漂う光（CSS）の上に、ゆっくり右へ流れる光の粒を重ねる。
   ・粒は遠・中・近の3つの奥行き。遠いほど小さく淡く、近いほど大きくやわらかくぼける
   ・まっすぐではなく、ゆるやかな気流に乗って波打ちながら進む。速さは気づかない程度に抑える
   ・ときどき混じる太陽色の粒は、短い光の尾を引く
   ・マウスを近づけると、粒がゆっくりよける
   見出し側（左）は CSS のマスクで消す。画面外では止め、動きを減らす設定では静止画にする */
document.querySelectorAll('[data-particles]').forEach((hero) => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.querySelector('.wrap'));
  const c = cv.getContext('2d');
  const m = { px: -999, py: -999 };
  let W = 0, H = 0, ps = [], raf = 0, vis = true, last = 0;

  const spawn = (anywhere) => {
    const z = Math.random() < 0.55 ? 0.25 + Math.random() * 0.25 : Math.random() < 0.75 ? 0.55 + Math.random() * 0.25 : 0.85 + Math.random() * 0.15;
    return { x: anywhere ? Math.random() * W : -20, y: Math.random() * H, z, r: 0.5 + z * 1.7, v: 0.004 + z * 0.009, ph: Math.random() * 6.28, sun: Math.random() < 0.07, ox: 0, oy: 0, tr: [] };
  };
  const init = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
    // 背の高いヒーローでも、粒の量は見出し帯と同じくらいに抑える
    ps = Array.from({ length: Math.round(W * Math.min(H, 360) / (W < 768 ? 2600 : 2400)) }, () => spawn(true));
  };

  const draw = (t) => {
    const dt = reduce ? 0 : Math.min(48, t - (last || t)); last = t;
    c.clearRect(0, 0, W, H);
    const T = t * 0.00004;
    for (const p of ps) {
      const vy = (Math.sin(p.x * 0.0045 + T * 2 + p.y * 0.006) + 0.5 * Math.sin(p.x * 0.011 - T * 3)) * 0.004 * p.z;
      p.x += p.v * dt; p.y += vy * dt; p.ph += dt * 0.0006;
      if (p.x > W + 20 || p.y < -20 || p.y > H + 20) { Object.assign(p, spawn(false)); continue; }
      const dx = p.x - m.px, dy = p.y - m.py, dd = Math.hypot(dx, dy), push = dd < 120 ? (1 - dd / 120) ** 2 : 0;
      p.ox += ((dx / (dd || 1)) * push * 34 * p.z - p.ox) * 0.03; p.oy += ((dy / (dd || 1)) * push * 34 * p.z - p.oy) * 0.03;
      const x = p.x + p.ox, y = p.y + p.oy;
      const a = (0.25 + 0.75 * Math.min(1, x / W * 1.4)) * (0.55 + 0.45 * Math.sin(p.ph)) * (0.35 + 0.65 * p.z);
      if (p.sun) {
        p.tr.push([x, y]); if (p.tr.length > 40) p.tr.shift();
        if (p.tr.length > 2) {
          c.beginPath(); c.moveTo(p.tr[0][0], p.tr[0][1]); for (const q of p.tr) c.lineTo(q[0], q[1]);
          const g = c.createLinearGradient(p.tr[0][0], p.tr[0][1], x, y);
          g.addColorStop(0, 'rgba(232,162,58,0)'); g.addColorStop(1, `rgba(240,180,90,${a * 0.6})`);
          c.strokeStyle = g; c.lineWidth = p.r * 0.9; c.lineCap = 'round'; c.stroke();
        }
      }
      const col = p.sun ? '240,180,90' : '170,222,230';
      if (p.z > 0.85) { // 手前の粒はやわらかくぼかす
        const g = c.createRadialGradient(x, y, 0, x, y, p.r * 3.4);
        g.addColorStop(0, `rgba(${col},${a * 0.45})`); g.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, p.r * 3.4, 0, 6.283); c.fill();
      } else {
        c.fillStyle = `rgba(${col},${a * 0.22})`; c.beginPath(); c.arc(x, y, p.r * 2.8, 0, 6.283); c.fill();
        c.fillStyle = `rgba(${p.sun ? '255,226,170' : '236,250,252'},${Math.min(1, a * 1.3)})`; c.beginPath(); c.arc(x, y, p.r * 0.75, 0, 6.283); c.fill();
      }
    }
    if (!reduce && vis) raf = requestAnimationFrame(draw);
  };
  const start = () => { if (reduce) return; cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(draw); };

  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); m.px = e.clientX - r.left; m.py = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { m.px = m.py = -999; });
  new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) start(); }).observe(hero);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (hero.clientWidth === W && hero.clientHeight === H) return; init(); if (reduce) draw(0); }, 150); });
  init();
  if (reduce) draw(0); else start();
});
