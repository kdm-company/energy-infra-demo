/* メニュー開閉（既存サイトAと同じ） */
(() => {
  const btn = document.querySelector('.burger');
  const nav = document.querySelector('.gnav');
  if (!btn || !nav) return;
  const set = (open) => {
    nav.classList.toggle('is-open', open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('is-menu-open', open);
  };
  btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();

/* ヒーロースライダー：6秒ごとの自動切替（タブ非表示中は停止） */
(() => {
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const dots = Array.from(document.querySelectorAll('.hero__dots li'));
  if (slides.length < 2) return;
  let i = 0, timer = null;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => { stop(); timer = setInterval(() => show(i + 1), 6000); };
  dots.forEach((d, k) => {
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.setAttribute('aria-label', (k + 1) + '枚目の画像を表示');
    d.addEventListener('click', () => { show(k); start(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(k); start(); } });
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('visibilitychange', () => { document.hidden || reduce ? stop() : start(); });
  if (!reduce) start();
})();

/* スクロールに合わせた淡いフェードイン（JSが動かない環境では最初から通常表示） */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sel = '.slg .wrap,.hd8,.hd8__lead,.svc__lead,.svc__item,.work,.rec__box,.about__intro,.about__story,.cta__inner';
  const els = Array.from(document.querySelectorAll(sel)).filter((el) => el.offsetParent !== null);
  els.forEach((el) => el.classList.add('rv'));
  els.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((n) => n.classList.contains('rv'));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 4) * 70 + 'ms';
  });
  let pending = els.slice(), ticking = false;
  const reveal = () => {
    ticking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(reveal); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', reveal);
  reveal();
  setTimeout(() => { els.forEach((el) => el.classList.add('is-in')); }, 8000);
})();

/* お知らせ・ブログ：管理画面で公開した記事を、表示中の言語で並べる */
(() => {
  const B = window.BlogStore;
  if (!B) return;
  const card = (p, lang, base) => {
    const img = p.image
      ? `<img src="${B.esc(B.url(p.image))}" alt="" loading="lazy">`
      : '<span class="post-card__noimg">NEWS</span>';
    return `<a class="post-card" href="${base}blog/post.html?id=${encodeURIComponent(p.id)}">
      <div class="post-card__img">${img}</div>
      <div class="post-card__body">
        <p class="post-card__meta"><time>${B.fmtDate(p.date)}</time><span class="post-card__cat">${B.esc(B.catLabel(p.cat, lang))}</span></p>
        <h3 class="post-card__ttl" data-i18n-skip>${B.esc(p.title)}</h3>
      </div>
    </a>`;
  };
  const empty = () => `<p class="posts__empty">${window.I18N ? I18N.t('まだ記事がありません') : 'まだ記事がありません'}</p>`;

  // トップの3件
  const top = document.querySelector('[data-posts="latest"]');
  // 一覧ページ
  const list = document.querySelector('[data-posts="all"]');
  const cats = document.querySelector('[data-cats]');
  let cat = 'all';

  const render = () => {
    const lang = window.I18N ? I18N.lang : 'ja';
    if (top) {
      const ps = B.published(lang).slice(0, 3);
      top.innerHTML = ps.length ? ps.map((p) => card(p, lang, '')).join('') : empty();
    }
    if (list) {
      const ps = B.published(lang).filter((p) => cat === 'all' || p.cat === cat);
      list.innerHTML = ps.length ? ps.map((p) => card(p, lang, '../')).join('') : empty();
    }
    if (cats) {
      const keys = ['all'].concat(Object.keys(B.CATS));
      cats.innerHTML = keys.map((k) => `<button type="button" data-cat="${k}" aria-pressed="${k === cat}">${k === 'all' ? (window.I18N ? I18N.t('すべて') : 'すべて') : B.esc(B.catLabel(k, lang))}</button>`).join('');
    }
  };
  if (cats) cats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.getAttribute('data-cat');
    render();
  });
  document.addEventListener('langchange', render);
  render();
})();
