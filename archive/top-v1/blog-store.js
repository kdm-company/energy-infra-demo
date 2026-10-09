/* =========================================================
   ブログ投稿デモ：記事データの保存と表示
   ・デモのため記事はこのブラウザの localStorage にだけ保存する
   ・本番ではサーバー（CMS）側に保存する想定
   ========================================================= */
(function () {
  var KEY = 'demo-blog-posts-v2';
  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/archive\/top-v1\/blog-store\.js.*$/, '') : './';

  var CATS = {
    news: { ja: 'お知らせ', en: 'News', zh: '新闻' },
    column: { ja: 'コラム', en: 'Column', zh: '专栏' },
    product: { ja: '製品・技術', en: 'Products', zh: '产品与技术' }
  };
  var LANGS = { ja: '日本語', en: 'English', zh: '简体中文' };

  function seed() {
    return [
      {
        id: 'p1', lang: 'ja', status: 'published', cat: 'news', date: '2026-10-01',
        title: '【サンプル】ホームページをリニューアルしました',
        image: 'assets/hero-1.jpg', excerpt: '',
        content:
          '<p>このたび、ホームページを全面的にリニューアルしました。事業の流れや取り扱い製品を、これまでより分かりやすく整理しています。</p>' +
          '<h2>主な変更点</h2>' +
          '<ul><li>事業内容を「開発・運用・収益化・資産化」の流れで整理しました</li><li>蓄電システム・太陽光モジュール・BMS／EMSの紹介を見直しました</li><li>英語ページを追加しました（中国語は準備中です）</li></ul>' +
          '<blockquote>この記事は管理画面デモ用のサンプルです。管理画面から自由に編集・削除できます。</blockquote>'
      },
      {
        id: 'p2', lang: 'ja', status: 'published', cat: 'column', date: '2026-09-20',
        title: '【サンプル】分散型エネルギー資産ができるまで',
        image: 'assets/product-bess.jpg', excerpt: '',
        content:
          '<p>分散型エネルギー資産は、用地・系統・機器・運用・売却の条件を最初からつなげて検討することで形になります。</p>' +
          '<h2>1. 開発</h2><p>用地と系統接続の条件を整え、機器を調達し、EPCで設備を形にします。</p>' +
          '<h2>2. 運用・収益化</h2><p>EMSで充放電を制御し、アグリゲーターと連携して電力市場で運用します。</p>' +
          '<figure><img src="assets/product-solar.jpg" alt="太陽光モジュール"><figcaption>記事の途中にも画像を入れられます</figcaption></figure>' +
          '<h2>3. 資産化</h2><p>稼働した設備を、エネルギー資産として売却します。</p>' +
          '<p>※この記事は管理画面デモ用のサンプルです。</p>'
      },
      {
        id: 'p3', lang: 'ja', status: 'published', cat: 'product', date: '2026-09-05',
        title: '【サンプル】太陽光モジュールのラインアップ',
        image: 'assets/product-solar.jpg', excerpt: '',
        content:
          '<p>N型・P型、シングルガラス・ダブルガラスの太陽光モジュールを取り扱っています。</p>' +
          '<h3>公称出力</h3><p>545W〜670Wクラスのモジュールをご用意しています。詳しい仕様は製品ページをご覧ください。</p>' +
          '<p>※この記事は管理画面デモ用のサンプルです。</p>'
      },
      {
        id: 'd1', lang: 'ja', status: 'draft', cat: 'news', date: '2026-10-09',
        title: '【下書き】展示会出展のお知らせ',
        image: '', excerpt: '',
        content: '<p>（日程・会場は確定後に記入）</p>'
      },
      {
        id: 'e1', lang: 'en', status: 'published', cat: 'news', date: '2026-10-01',
        title: '[Sample] Our website has been renewed',
        image: 'assets/hero-1.jpg', excerpt: '',
        content:
          '<p>We have fully renewed our website, organizing our business flow and products more clearly.</p>' +
          '<h2>What has changed</h2>' +
          '<ul><li>Our business is now explained as development, operation, monetization and asset sale</li><li>Updated introductions of battery storage, solar modules and BMS/EMS</li><li>English pages added (Simplified Chinese coming soon)</li></ul>' +
          '<blockquote>This is a sample post for the admin demo. It can be edited or deleted from the admin panel.</blockquote>'
      },
      {
        id: 'e2', lang: 'en', status: 'published', cat: 'column', date: '2026-09-20',
        title: '[Sample] How a distributed energy asset is built',
        image: 'assets/product-bess.jpg', excerpt: '',
        content:
          '<p>A distributed energy asset takes shape when land, grid, equipment, operation and sale conditions are considered together from the outset.</p>' +
          '<h2>1. Development</h2><p>We secure land and grid-connection conditions, procure equipment and build the facility through EPC.</p>' +
          '<h2>2. Operation &amp; Monetization</h2><p>EMS controls charging and discharging, and we operate in the power market with aggregators.</p>' +
          '<h2>3. Asset Sale</h2><p>We sell operating facilities as energy assets.</p>'
      },
      {
        id: 'e3', lang: 'en', status: 'published', cat: 'product', date: '2026-09-05',
        title: '[Sample] Our solar module lineup',
        image: 'assets/product-solar.jpg', excerpt: '',
        content:
          '<p>We handle N-type and P-type solar modules in single-glass and double-glass designs.</p>' +
          '<h3>Rated output</h3><p>Modules in the 545W to 670W class are available. See the product page for detailed specifications.</p>' +
          '<p>This is a sample post for the admin demo.</p>'
      }
    ];
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 読めない環境では初期データで表示する */ }
    var s = seed();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function save(posts) {
    localStorage.setItem(KEY, JSON.stringify(posts)); // 容量超過時は呼び出し側で例外を受ける
  }

  function all() { return load().slice().sort(byDate); }
  function byDate(a, b) { return (b.date || '').localeCompare(a.date || '') || (b.updated || 0) - (a.updated || 0); }
  function get(id) { return load().filter(function (p) { return p.id === id; })[0] || null; }
  function published(lang) {
    return all().filter(function (p) { return p.status === 'published' && (!lang || p.lang === lang); });
  }
  function upsert(post) {
    var posts = load();
    post.updated = Date.now();
    var i = posts.findIndex(function (p) { return p.id === post.id; });
    if (i >= 0) posts[i] = post; else posts.push(post);
    save(posts);
    return post;
  }
  function remove(id) { save(load().filter(function (p) { return p.id !== id; })); }
  function reset() { save(seed()); }
  function newId() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* 画像の参照先：サイト内の画像はサイト直下からの相対パスで持つ */
  function url(src) {
    if (!src) return '';
    if (/^(data:image\/|https?:)/.test(src)) return src;
    return ROOT + src.replace(/^\.?\//, '');
  }

  /* 表示前に許可したタグ・属性だけを残す */
  var ALLOW = { P: 1, H2: 1, H3: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, A: 1, FIGURE: 1, FIGCAPTION: 1, IMG: 1, BR: 1, HR: 1 };
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    var rootEl = doc.body.firstChild;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (el) {
        if (el.nodeType === 3) return;
        if (el.nodeType !== 1) { el.remove(); return; }
        if (!ALLOW[el.tagName]) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED)$/.test(el.tagName)) { el.remove(); return; }
          walk(el);
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.remove();
          return;
        }
        Array.prototype.slice.call(el.attributes).forEach(function (a) {
          var keep = (el.tagName === 'A' && a.name === 'href' && /^(https?:|#|\/|\.)/.test(a.value)) ||
                     (el.tagName === 'IMG' && a.name === 'src' && /^(data:image\/|https?:|assets\/)/.test(a.value)) ||
                     (el.tagName === 'IMG' && a.name === 'alt');
          if (!keep) el.removeAttribute(a.name);
        });
        if (el.tagName === 'A') { el.setAttribute('rel', 'noopener'); }
        if (el.tagName === 'IMG') { el.setAttribute('src', url(el.getAttribute('src'))); el.setAttribute('loading', 'lazy'); }
        walk(el);
      });
    })(rootEl);
    return rootEl.innerHTML;
  }

  function textOf(html) {
    var d = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    return (d.body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function excerpt(post, n) {
    var t = post.excerpt || textOf(post.content);
    n = n || 80;
    return t.length > n ? t.slice(0, n) + '…' : t;
  }
  function fmtDate(d) { return (d || '').replace(/-/g, '.'); }
  function catLabel(cat, lang) { var c = CATS[cat]; return c ? (c[lang] || c.ja) : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.BlogStore = {
    all: all, get: get, published: published, upsert: upsert, remove: remove, reset: reset,
    newId: newId, url: url, sanitize: sanitize, excerpt: excerpt, textOf: textOf,
    fmtDate: fmtDate, catLabel: catLabel, esc: esc, CATS: CATS, LANGS: LANGS, ROOT: ROOT
  };
})();
