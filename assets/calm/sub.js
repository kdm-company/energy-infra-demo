/* =========================================================
   下層ページの動き（site.js の後に読む）
   ・下層の部品にも、TOP と同じ控えめなフェードインをかける
   ・ニュースのタブ切り替え／記事ページの表示切り替え
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 控えめなフェードイン ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const sel = '.sh,.nlist,.tech__head,.tech__body > *,.biz__txt,.biz__media,.prods2,.app2,.ems2,.target,.merits li,.dflow li,.ib,.mvv2 > div,.msg,.tl2__y,.kind,.cbase > div,.pd2,.research,.consult .wrap';
    const els = [...document.querySelectorAll(sel)].filter((el) => !el.classList.contains('rv'));
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
    // タブの題名：記事の見出し＋社名（言語を切り替えたら付け直す。2026-10-27）
    const setTitle = () => {
      if (!ttl) return;
      const en = document.documentElement.lang === 'en';
      const site = window.I18N ? I18N.t('株式会社ルメナスホールディングス') : '株式会社ルメナスホールディングス';
      document.title = ttl.textContent.trim() + (en ? ' | ' : '｜') + site;
    };
    setTitle();
    document.addEventListener('langchange', setTitle);
  }
})();
