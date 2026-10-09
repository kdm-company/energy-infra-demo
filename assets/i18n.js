/* =========================================================
   多言語対応デモ（日本語 / English / 简体中文）
   ・ページの日本語をそのまま原文として持ち、英語は下の辞書で差し替える
   ・中国語（簡体字）は本番実装で辞書を追加する想定（デモでは「準備中」）
   ・言語は ?lang=en または前回の選択（localStorage）を引き継ぐ
   ========================================================= */
(function () {
  var EN = {
    /* head */
    'デザイン確認用サンプル｜エネルギーインフラ開発会社 TOP': 'Design review sample | Energy infrastructure developer',
    'デザイン確認用サンプル｜お知らせ・ブログ': 'Design review sample | News & Blog',
    'デザイン確認用サンプル｜記事': 'Design review sample | Article',

    /* 新デザイン案（v2）で追加 */
    'デザイン確認用サンプル｜エネルギーインフラ開発会社 TOP（新デザイン案）': 'Design review sample | Energy infrastructure developer (new design)',
    '本文へ移動': 'Skip to content',
    'ページ内の位置': 'Sections',
    'トップ': 'Top',
    '事業を見る': 'Explore our business',
    '電力系統に接続された分散型エネルギー資産を継続的に開発し、運用・収益化・資産化するインフラ開発会社です。':
      'We are an infrastructure developer that continuously develops, operates, monetizes and capitalizes distributed energy assets connected to the power grid.',
    '冷却': 'Cooling',
    '容量': 'Capacity',
    'セル': 'Cell type',
    '出力': 'Output',
    '管理': 'Monitoring',
    '制御': 'Control',
    '現行デザインと比べる': 'Compare with current design',

    /* 折衷案（v3）で追加 */
    'デザイン確認用サンプル｜エネルギーインフラ開発会社 TOP（折衷案）': 'Design review sample | Energy infrastructure developer (hybrid design)',
    'デザイン比較': 'Compare designs',
    '現行': 'Current',
    '折衷案': 'Hybrid',

    /* ヘッダー・共通 */
    '株式会社': 'Sample',
    '〇〇〇〇ホールディングス': 'Holdings Co., Ltd.',
    'トップページ': 'Home',
    'ロゴ（仮）': 'Logo (placeholder)',
    'グローバルナビゲーション': 'Global navigation',
    'メニュー': 'Menu',
    '言語の切り替え': 'Language',
    'ホーム': 'Home',
    '事業内容': 'Business',
    '技術・製品': 'Products',
    '実績・提携': 'Track Record',
    'お知らせ': 'News',
    '会社情報': 'Company',
    'お問い合わせ': 'Contact',
    '電話する 00-0000-0000': 'Call 00-0000-0000',
    '電話でお問い合わせ': 'Call us',
    'デモのご案内': 'Demo guide',
    '中国語（簡体字）は本番実装で追加します。デモでは日本語と英語を切り替えられます。': 'Simplified Chinese will be added in production. This demo switches between Japanese and English.',

    /* ヒーロー */
    'メインビジュアル': 'Main visual',
    'エネルギーを、': 'Energy,',
    '設備から資産へ。': 'from equipment to assets.',
    '太陽光・蓄電システム・EMSで、': 'With solar, battery storage and EMS,',
    '分散型エネルギー資産を開発・運用する。': 'we develop and operate distributed energy assets.',
    '画像はイメージです': 'Images are for illustration only',

    /* 案内カード */
    'お探しの情報はこちら': 'Find what you need',
    '事業の内容を知りたい': 'Our business',
    '開発から資産化までの流れ': 'From development to asset sale',
    '製品・仕様を確認したい': 'Products & specifications',
    '蓄電システム・太陽光・EMS': 'Battery storage, solar, EMS',
    '実績・会社情報を見たい': 'Track record & company',
    '供給実績・提携先・会社概要': 'Supply record, partners, profile',

    /* 会社の定義 */
    '私たちの役割': 'Our role',
    '私たちは、蓄電池設備そのものを販売する会社ではなく、': 'We are not a company that simply sells battery equipment.',
    '電力系統に接続された分散型エネルギー資産を': 'We are an infrastructure developer that',
    '継続的に開発し、運用・収益化・資産化する': 'continuously develops, operates, monetizes and capitalizes',
    'インフラ開発会社です。': 'distributed energy assets connected to the power grid.',
    '土地・設置場所の確保から系統接続、機器調達、EPC、EMS、アグリゲーターとの連携、市場運用、保守管理、資産売却までを一体的に組み立てることで、地域ごとに小規模なエネルギーノードを多数構築します。':
      'By integrating everything from securing land and sites, grid connection, equipment procurement, EPC and EMS to aggregator coordination, market operation, maintenance and asset sale, we build many small-scale energy nodes region by region.',

    /* 事業内容 */
    '用地・系統・機器・運用・売却の条件を最初からつなげて検討し、3つの段階で事業を組み立てます。':
      'We consider land, grid, equipment, operation and sale conditions together from the outset, and structure each project in three stages.',
    '開発': 'Development',
    '用地と系統接続の条件を整え、機器を調達し、EPCで設備を形にします。': 'We secure land and grid-connection conditions, procure equipment and build the facility through EPC.',
    '土地・設置場所の確保': 'Securing land and sites',
    '系統接続': 'Grid connection',
    '機器調達': 'Equipment procurement',
    '運用・収益化': 'Operation & Monetization',
    'EMSで充放電を制御し、アグリゲーターと連携して電力市場で運用。保守管理まで継続して担います。':
      'EMS controls charging and discharging, and we operate in the power market with aggregators, continuing through maintenance.',
    'アグリゲーターとの連携': 'Aggregator coordination',
    '市場運用': 'Market operation',
    '保守管理': 'Maintenance',
    '資産化': 'Asset Sale',
    '稼働した設備を、エネルギー資産として売却します。': 'We sell operating facilities as energy assets.',
    '資産売却': 'Asset sale',
    '設備の導入で終わらせず、資産として売却するところまでを事業の範囲としています。': 'Our scope does not end at installation. It extends to selling the facility as an asset.',

    /* 技術・製品 */
    'エネルギー資産を構成する、蓄電・発電・制御の3つの技術を取り扱っています。仕様の詳細は各製品ページでご覧いただけます。':
      'We handle the three technologies that make up an energy asset: storage, generation and control. Detailed specifications are on each product page.',
    '20フィート液冷蓄電コンテナシステムの外観': 'Exterior of the 20-ft liquid-cooled battery container system',
    'N型太陽光モジュールの表面と裏面': 'Front and back of an N-type solar module',
    '液冷式': 'Liquid-cooled',
    'N型・P型': 'N-type / P-type',
    '状態管理': 'State monitoring',
    '充放電制御': 'Charge control',
    '蓄電システム（BESS）': 'Battery Energy Storage (BESS)',
    '系統用・産業用の蓄電プロジェクトに向けた、20フィート液冷蓄電コンテナシステムとESS用液冷蓄電一体ユニット。2023年10月から自社製蓄電池の開発も進めています。':
      'A 20-ft liquid-cooled battery container system and an integrated liquid-cooled ESS unit for grid-scale and industrial projects. Since October 2023 we have also been developing our own batteries.',
    '太陽光モジュール': 'Solar Modules',
    '海外メーカーとの包括的業務提携のもと、シングルガラス・ダブルガラスのモジュールを国内外へ供給しています。':
      'Under a comprehensive alliance with an overseas manufacturer, we supply single-glass and double-glass modules in Japan and abroad.',
    '蓄電所や充放電需要のある事業者に適したBMS・EMS製品を提供。2024年3月から、国内向け産業用リチウム蓄電池の状態管理システムを共同開発しています。':
      'BMS and EMS products for battery storage sites and businesses with charge/discharge needs. Since March 2024 we have been co-developing a state-management system for industrial lithium batteries.',
    'BMS・EMS': 'BMS / EMS',
    '準備中': 'Coming soon',
    '1枚目の画像を表示': 'Show image 1',
    '2枚目の画像を表示': 'Show image 2',
    'カテゴリ': 'Category',
    '製品を見る': 'View product',
    'EMSについて見る': 'About EMS',
    '製品一覧を見る': 'All products',
    '蓄電池の状態をBMSが管理し、EMSが充放電を制御して系統につなぐ構成の概念図': 'Concept diagram: BMS manages battery state and EMS controls charging and discharging to connect with the grid',

    /* 実績・提携 */
    '電力会社グループの案件への供給実績と、国内外のメーカーとの技術・供給提携です。': 'Our supply record for power-company group projects, and technology and supply partnerships with manufacturers in Japan and overseas.',
    '供給・採用の実績': 'Supply & adoption',
    '技術・供給の提携先': 'Technology & supply partners',
    '採用': 'Adopted',
    '供給': 'Supply',
    '提携': 'Alliance',
    '協業': 'Collaboration',
    '販売提携': 'Sales alliance',
    '共同開発': 'Co-development',
    '大手電力会社グループ A社 PPA事業': 'Major power company group A, PPA project',
    '提携メーカー製太陽光モジュールが初採用': 'Partner-made solar modules adopted for the first time',
    '大手電力会社グループ B社': 'Major power company group B',
    '太陽光モジュールの供給を開始': 'Started supplying solar modules',
    '電機商社 C社向け PPA案件': 'PPA project for electrical trading company C',
    '提携メーカー製太陽光モジュールの供給を開始': 'Started supplying partner-made solar modules',
    '太陽光モジュールメーカー D社': 'Solar module manufacturer D',
    '太陽光モジュールに関する包括的業務提携': 'Comprehensive alliance on solar modules',
    '蓄電池メーカー E社': 'Battery manufacturer E',
    'PCSを含む家庭用蓄電池システム分野での協業': 'Collaboration on residential battery systems including PCS',
    '販売会社 F社': 'Sales company F',
    '住宅メーカー向け家庭用蓄電ソリューションの販売提携': 'Sales alliance on residential storage for home builders',
    '蓄電池メーカー G社': 'Battery manufacturer G',
    '日本国内向け産業用蓄電池に関する包括的業務提携': 'Comprehensive alliance on industrial batteries for Japan',
    'エネルギー機器メーカー H社': 'Energy equipment manufacturer H',
    '国内向け産業用リチウム蓄電池状態管理システムの共同開発': 'Co-development of a state-management system for industrial lithium batteries',

    /* お知らせ・ブログ */
    'お知らせ・ブログ': 'News & Blog',
    'お知らせやコラムは、管理画面から更新できます。': 'News and columns are updated from the admin panel.',
    '一覧を見る': 'View all',
    'まだ記事がありません': 'No posts yet',
    'すべて': 'All',
    '記事一覧に戻る': 'Back to all posts',
    '記事が見つかりませんでした': 'Post not found',

    /* 会社情報 */
    '大阪から、': 'From Osaka,',
    '地域ごとの': 'region by region,',
    'エネルギーノードを。': 'we build energy nodes.',
    '2021年2月に設立し、2022年10月に再生可能エネルギー事業への一本化に伴って現社名へ変更しました。2023年8月に本社を大阪市内へ移転し、現在は大阪本社と海外子会社を拠点に事業を展開しています。':
      'Founded in February 2021, we adopted our current name in October 2022 when we consolidated into renewable energy. In August 2023 we moved our head office within Osaka City, and we now operate from our Osaka head office and an overseas subsidiary.',
    '設立': 'Founded',
    '2021年2月': 'February 2021',
    '代表取締役': 'Representative Director',
    '拠点': 'Offices',
    '大阪本社／海外子会社': 'Osaka HQ / Overseas subsidiary',
    '会社概要を見る': 'Company profile',
    '沿革を見る': 'History',

    /* お問い合わせ */
    '系統用蓄電所、産業用蓄電、太陽光モジュール、BMS・EMS、発電所の運営、協業に関するご相談を承ります。設置場所・想定容量・時期など、分かる範囲でお知らせください。':
      'We welcome inquiries about grid-scale storage, industrial storage, solar modules, BMS/EMS, power plant operation and partnerships. Please tell us what you know about the site, expected capacity and timing.',
    'お電話でのお問い合わせ': 'Call us',
    'タップして電話をかける': 'Tap to call',
    '電話で問い合わせる 00-0000-0000': 'Call 00-0000-0000',

    /* フッター */
    'サイトマップ': 'Sitemap',
    '事業・製品': 'Business & Products',
    '蓄電システム': 'Battery Storage',
    '発電所運営': 'Power Plant Operation',
    '会社概要': 'Company Profile',
    '沿革': 'History',
    '業界動向': 'Industry News',
    'ブログ': 'Blog',
    '電話でのお問い合わせ': 'Contact by phone',
    'プライバシーポリシー': 'Privacy Policy',
    'サイトのご利用について': 'Terms of Use',
    '© 2026 Sample Holdings Co., Ltd.（デザイン確認用サンプル・社名と連絡先は仮の表記です）': '© 2026 Sample Holdings Co., Ltd. (Design review sample. Company name and contact details are placeholders.)'
  };
  var DICT = { en: EN };
  var SUPPORTED = ['ja', 'en'];      // デモで切り替えられる言語
  var PLANNED = ['zh'];              // 本番で追加する言語
  var STORE = 'demo-site-lang';
  var ATTRS = ['aria-label', 'alt', 'title', 'placeholder', 'content'];

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
    // data-en を持つ要素は中身ごと差し替え（住所など改行を含むもの）
    Array.prototype.forEach.call(root.querySelectorAll('[data-en]'), function (el) {
      touched.push({ type: 'html', node: el, orig: el.innerHTML });
      el.innerHTML = el.getAttribute('data-en');
    });
    // テキスト
    var base = root === document ? document.documentElement : root;
    var walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-i18n-skip],[data-en]')) return NodeFilter.FILTER_REJECT;
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
    document.documentElement.lang = lang;
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
