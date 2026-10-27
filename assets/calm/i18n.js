/* =========================================================
   言語切り替え（日本語 / English / 简体中文）
   ・ページの日本語をそのまま原文として持ち、英語・中国語はページ側の辞書で差し替える
   ・中国語（簡体字）は window.I18N_ZH があるページだけで切り替えられる（無いページは「準備中」）
   ・言語は ?lang=en / ?lang=zh または前回の選択（localStorage）を引き継ぐ
   ========================================================= */
(function () {
  // 辞書はページ側で window.I18N_EN / window.I18N_ZH として渡す
  var EN = window.I18N_EN || {};
  var ZH = window.I18N_ZH || null;
  var DICT = { en: EN, zh: ZH };
  var SUPPORTED = ZH ? ['ja', 'en', 'zh'] : ['ja', 'en'];   // 切り替えられる言語
  var PLANNED = ZH ? [] : ['zh'];                           // 辞書がまだ無い言語
  var HTML_LANG = { ja: 'ja', en: 'en', zh: 'zh-CN' };     // html の lang（中国語は簡体字の字形で表示させる）
  var ZH_FONT = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap';
  var STORE = 'preview-site-lang';
  var ATTRS = ['aria-label', 'alt', 'title', 'placeholder', 'content', 'href'];   // href はメールの件名（mailto:）だけ訳す

  var current = 'ja';
  var touched = [];

  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem(STORE); if (SUPPORTED.indexOf(s) >= 0) return s; } catch (e) {}
    return 'ja';
  }

  function restore() {
    for (var i = touched.length - 1; i >= 0; i--) {
      var t = touched[i];
      if (t.type === 'text') t.node.nodeValue = t.orig;
      else if (t.type === 'attr') t.node.setAttribute(t.name, t.orig);
      else if (t.type === 'html') t.node.innerHTML = t.orig;
    }
    touched = [];
  }

  function translate(root) {
    var dict = DICT[current];
    if (!dict) return;
    root = root || document;
    // data-en / data-zh を持つ要素は中身ごと差し替え（住所や改行を含む見出しなど）
    var attr = 'data-' + current;
    Array.prototype.forEach.call(root.querySelectorAll('[' + attr + ']'), function (el) {
      touched.push({ type: 'html', node: el, orig: el.innerHTML });
      el.innerHTML = el.getAttribute(attr);
    });
    // テキスト
    var base = root === document ? document.documentElement : root;
    var walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-i18n-skip],[' + attr + ']')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue, key = v.trim();
      if (dict[key] == null) return;
      touched.push({ type: 'text', node: n, orig: v });
      n.nodeValue = v.replace(key, dict[key]);
    });
    // 属性（alt・aria-label・meta description など）
    var scope = root === document ? document : root;
    ATTRS.forEach(function (name) {
      Array.prototype.forEach.call(scope.querySelectorAll('[' + name + ']'), function (el) {
        if (el.closest('[data-i18n-skip]')) return;
        if (name === 'content' && el.getAttribute('name') !== 'description') return;
        if (name === 'href' && el.getAttribute('href').indexOf('mailto:') !== 0) return;
        var v = el.getAttribute(name);
        if (dict[v] == null) return;
        touched.push({ type: 'attr', node: el, name: name, orig: v });
        el.setAttribute(name, dict[v]);
      });
    });
  }

  function syncButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === current));
    });
  }

  function set(lang, opts) {
    if (SUPPORTED.indexOf(lang) < 0) return;
    restore();
    current = lang;
    document.documentElement.lang = HTML_LANG[lang] || lang;
    if (lang === 'zh' && !document.getElementById('zh-font')) {
      var l = document.createElement('link');
      l.id = 'zh-font'; l.rel = 'stylesheet'; l.href = ZH_FONT;
      document.head.appendChild(l);
    }
    if (lang !== 'ja') translate(document);
    syncButtons();
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    if (!opts || !opts.silentUrl) {
      var u = new URL(location.href);
      if (lang === 'ja') u.searchParams.delete('lang'); else u.searchParams.set('lang', lang);
      history.replaceState(null, '', u);
    }
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  /* 後から描画した部分（ブログ一覧など）にも現在の言語を当てる */
  function apply(root) { if (current !== 'ja') translate(root); }
  function t(ja) { var d = DICT[current]; return d && d[ja] != null ? d[ja] : ja; }

  var toastTimer;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 3200);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (!b) return;
    var lang = b.getAttribute('data-lang');
    if (PLANNED.indexOf(lang) >= 0) { toast(t('中国語（簡体字）は本番実装で追加します。デモでは日本語と英語を切り替えられます。')); return; }
    set(lang);
  });

  window.I18N = { set: set, apply: apply, t: t, toast: toast, get lang() { return current; } };
  document.addEventListener('DOMContentLoaded', function () { set(pick(), { silentUrl: true }); });
})();
