const state = { view: "home", query: "", parsed: null };
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modalRoot");
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
let lastFocusedElement = null;

function parseRequest(text, now = new Date()) {
  const lower = text.toLowerCase();
  const categories = CATEGORIES.filter(category => category.keywords.some(keyword => lower.includes(keyword))).map(category => category.id);
  const number = lower.match(/([\d,]+)\s*(個|件|通|枚|セット|点|回|箱|冊|行|ページ)/);
  const frequency = lower.match(/(毎月|月次|毎週|週次|継続|定期)/)?.[1] ?? "";
  const risks = [
    /個人情報|氏名|住所|電話番号|顧客情報/.test(lower) ? "個人情報を含む可能性" : null,
    /機密|社外秘|秘密/.test(lower) ? "機密情報を含む可能性" : null,
    /食品|飲食|菓子/.test(lower) ? "食品取扱条件の確認が必要" : null,
  ].filter(Boolean);
  let method = "未確認";
  if (/オンライン|web|ウェブ|クラウド/.test(lower)) method = "オンライン";
  else if (/訪問|現地|オフィス|店舗|共用部/.test(lower)) method = "現地作業";
  else if (/配送|発送|郵送|原本/.test(lower)) method = "配送・郵送";

  let deadline = "";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const formatDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const inferredDate = (month, day, specifiedYear = null) => {
    let year = specifiedYear ?? today.getFullYear();
    let candidate = new Date(year, month - 1, day);
    if (candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null;
    if (specifiedYear === null && candidate < today) candidate = new Date(year + 1, month - 1, day);
    return candidate;
  };
  const exactDate = lower.match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  const relativeMonthEnd = lower.match(/(今月|来月)(?:末(?:日)?|中(?!旬))(?:まで)?(?:に)?/);
  const monthPeriod = lower.match(/(\d{1,2})月(?:の)?(末(?:日)?|中(?!旬)|上旬|中旬|下旬)(?:まで)?(?:に)?/);
  if (exactDate) {
    const candidate = inferredDate(Number(exactDate[2]), Number(exactDate[3]), exactDate[1] ? Number(exactDate[1]) : null);
    if (candidate) deadline = formatDate(candidate);
  } else if (relativeMonthEnd) {
    const offset = relativeMonthEnd[1] === "来月" ? 1 : 0;
    deadline = formatDate(new Date(today.getFullYear(), today.getMonth() + offset + 1, 0));
  } else if (monthPeriod) {
    const month = Number(monthPeriod[1]);
    const period = monthPeriod[2];
    const provisionalYear = month < today.getMonth() + 1 ? today.getFullYear() + 1 : today.getFullYear();
    const lastDay = new Date(provisionalYear, month, 0).getDate();
    const day = period === "上旬" ? 10 : period === "中旬" ? 20 : lastDay;
    const candidate = inferredDate(month, day);
    if (candidate) deadline = formatDate(candidate);
  }
  return { categories, quantity: number ? Number(number[1].replaceAll(",", "")) : null, unit: number?.[2] ?? "", deadline, method, frequency, risks };
}

const categoryName = id => CATEGORIES.find(category => category.id === id)?.name ?? id;
const formatDeadline = value => value ? value.replaceAll("-", "/") : "未確認";

function home() {
  const serviceCards = [
    ["01", "データ・書類", "データ入力、転記、スキャン、PDF化、書類整理"],
    ["02", "EC・デジタル", "商品情報登録、画像整理、AI用データ、投稿補助"],
    ["03", "梱包・発送準備", "封入、ラベル貼り、セット組み、検品、梱包"],
    ["04", "定型バックオフィス", "照合、リスト整備、定期更新、その他の反復業務"],
  ];
  return `<section class="hero" id="home"><div class="hero-copy"><span class="eyebrow">業務相談から納品まで、窓口をひとつに</span><h1>人手が足りない仕事、<br><em>まとめてお任せください。</em></h1><p class="hero-lead">曖昧な相談から作業を整理し、必要に応じて複数の実行拠点へ分配。進捗・検品・納品まで、シゴトパスが一本化します。</p><form class="request-box" id="requestForm"><label for="requestInput">どんな仕事に困っていますか？</label><div><textarea id="requestInput" rows="3" required placeholder="例：紙アンケート5,000枚をExcelに入力して、9月末までに納品してほしい"></textarea><button class="button primary" type="submit">相談内容を整理する <span>→</span></button></div><small>数量や納期が未定でも大丈夫です。入力内容はこのデモでは送信されません。</small></form><div class="hero-points"><span>相談無料</span><span>複数拠点を一括管理</span><span>検品基準を事前確認</span></div></div><div class="hero-visual" aria-label="一つの相談から複数の実行拠点へ仕事を組み立てるイメージ"><div class="visual-title"><small>ONE CONTACT</small><strong>相談窓口は<br>シゴトパスひとつ</strong></div><div class="route-line"></div><div class="route-card main-card"><span>企業</span><b>仕事をまとめて相談</b><small>仕様が曖昧でもOK</small></div><div class="route-hub"><span>パ</span><b>案件を設計</b></div><div class="route-card route-a"><span>実行拠点 A</span><b>データ入力</b></div><div class="route-card route-b"><span>実行拠点 B</span><b>照合・検品</b></div><div class="route-card route-c"><span>実行拠点 C</span><b>梱包・発送準備</b></div></div></section>
  <section class="proof-strip"><div><b>1つの窓口</b><span>相談・見積・連絡を集約</span></div><div><b>複数拠点</b><span>数量と工程に応じて編成</span></div><div><b>共通の基準</b><span>進捗と検品をまとめて管理</span></div><div><b>一括納品</b><span>企業は個別管理不要</span></div></section>
  <section class="section services" id="services"><div class="section-heading"><span class="eyebrow">対応業務</span><h2>「作業名」より、困っていることを教えてください。</h2><p>手順と合格基準を整理しやすい業務から、実行可能な形を検討します。</p></div><div class="service-grid">${serviceCards.map(card => `<button class="service-card" data-example="${escapeHTML(card[2].split("、")[0])}を依頼したい"><span>${card[0]}</span><h3>${card[1]}</h3><p>${card[2]}</p><b>この仕事を相談 →</b></button>`).join("")}</div><div class="scope-note"><b>初期対応の考え方</b><p>工程、数量、合格基準を定義しやすい定型業務を中心に検証します。専門資格が必要な業務、危険物、高度な判断を伴う業務は個別確認となります。</p></div></section>
  <section class="managed section" id="managed"><div class="section-heading light"><span class="eyebrow">MANAGED BPO</span><h2>施設を紹介して終わり、ではありません。</h2><p>仕事が完了するまでに必要な調整を、運営側がつなぎます。</p></div><ol class="process-grid"><li><b>01</b><span>相談</span><p>終わらせたい仕事を自由文で受付</p></li><li><b>02</b><span>案件仕様化</span><p>工程・数量・納期・品質を整理</p></li><li><b>03</b><span>実行体制編成</span><p>能力と受入量を見て拠点を選定</p></li><li><b>04</b><span>進行管理</span><p>分担案件の進捗と課題を集約</p></li><li><b>05</b><span>検品・納品</span><p>共通基準で確認し一括で納品</p></li></ol><div class="difference-grid"><article><small>一般的な紹介型</small><h3>企業が各施設を管理</h3><ul><li>依頼先を自分で比較</li><li>施設ごとに説明・契約</li><li>進捗・品質を個別確認</li></ul></article><article class="recommended"><small>シゴトパスが目指す形</small><h3>企業は仕事の完了を依頼</h3><ul><li>相談窓口を一本化</li><li>工程分解と拠点編成を支援</li><li>進捗・検品・納品を集約</li></ul></article></div></section>
  <section class="section quality" id="quality"><div class="section-heading"><span class="eyebrow">品質と責任</span><h2>「できます」ではなく、完了条件を先に決めます。</h2><p>品質・納期・情報管理を曖昧なまま作業へ流さないことが、ネットワーク型BPOの土台です。</p></div><div class="quality-grid"><article><span>01</span><h3>案件仕様</h3><p>入力項目、作業手順、数量、期限、受渡方法を文書化します。</p></article><article><span>02</span><h3>合格基準</h3><p>許容差、検品方法、不適合時の扱いを作業前に確認します。</p></article><article><span>03</span><h3>情報管理</h3><p>個人情報・機密情報の有無を判定し、扱える拠点だけへ限定します。</p></article><article><span>04</span><h3>責任窓口</h3><p>変更、遅延、再作業などの連絡を運営側で集約します。</p></article></div><div class="caution-box"><b>現在は構想・実証準備段階です</b><p>正式な受託責任、品質保証、再委託条件、事故時の責任範囲は、契約・利用規約の確定後に明示します。このデモ上の説明だけで発注は成立しません。</p></div></section>
  <section class="section network" id="network"><div class="network-copy"><span class="eyebrow">実行ネットワーク</span><h2>営業に追われず、<br>できる工程に集中できる。</h2><p>シゴトパスは、就労継続支援A型・B型事業所を中心とする実行ネットワークを想定しています。施設名を並べるのではなく、能力・設備・品質管理・受入可能量を確認し、条件に合う工程を打診します。</p><button class="button light" data-action="facility">実行拠点としての参加を相談</button></div><ol class="network-steps"><li><b>1</b><div><strong>能力を登録</strong><span>作業、設備、品質管理、対応できない条件</span></div></li><li><b>2</b><div><strong>合う案件だけ届く</strong><span>工程、数量、期限を確認して受注可否を回答</span></div></li><li><b>3</b><div><strong>作業と報告</strong><span>決めた手順で実行し、進捗と成果物を共有</span></div></li><li><b>4</b><div><strong>運営が企業対応</strong><span>営業、全体調整、企業への納品を一本化</span></div></li></ol></section>
  <section class="section pilot"><div class="section-heading"><span class="eyebrow">実証パートナー募集予定</span><h2>まずは、1件の仕事が最後まで流れるかを検証します。</h2></div><div class="pilot-grid"><article><small>企業の方</small><h3>定型業務を外注したい</h3><p>データ入力、書類電子化、EC登録、封入・梱包などの試行案件。</p><button class="button primary" data-action="consult">仕事を相談する</button></article><article><small>実行拠点の方</small><h3>企業案件を受けてみたい</h3><p>対応工程・1日量・検品方法を一緒に整理できるA型・B型事業所。</p><button class="button secondary" data-action="facility">参加について相談</button></article><article><small>共同受注窓口の方</small><h3>地域ネットワークと連携したい</h3><p>既存の仕組みを競合ではなく供給ネットワークとしてつなぐ連携相談。</p><button class="button secondary" data-action="partner">連携を相談</button></article></div></section>
  <section class="final-cta"><span>何をどう頼めばよいか、決まっていなくても大丈夫です。</span><h2>まずは、終わらせたい仕事を教えてください。</h2><button class="button white" data-action="consult">「こんな仕事でも頼める？」から相談</button><small>相談無料・このデモでは送信されません</small></section>`;
}

function brief() {
  const parsed = state.parsed ?? parseRequest(state.query);
  const workNames = parsed.categories.length ? parsed.categories.map(categoryName) : ["仕事内容を確認します"];
  const missing = [!parsed.categories.length ? "具体的な作業工程" : null, !parsed.quantity ? "数量・単位" : null, !parsed.deadline ? "希望納期" : null, parsed.method === "未確認" ? "データ・資材の受渡方法" : null, "品質の合格基準"].filter(Boolean);
  return `<section class="brief-page"><div class="brief-header"><button class="back-link" id="backHome">← トップへ戻る</button><span class="eyebrow">相談内容の整理結果</span><h1>この仕事を、実行できる案件へ整えます。</h1><p>自動抽出できた内容と、これから確認する項目を分けて表示しています。</p></div><div class="brief-layout"><main><article class="original-request"><small>入力された相談</small><p>「${escapeHTML(state.query)}」</p></article><article class="spec-card"><div class="card-heading"><div><small>案件仕様・たたき台</small><h2>${workNames.join("＋")}</h2></div><span class="draft-badge">未確定</span></div><dl class="spec-grid"><div><dt>想定する仕事</dt><dd>${workNames.join("、")}</dd></div><div><dt>数量</dt><dd>${parsed.quantity ? `${parsed.quantity.toLocaleString()}${parsed.unit}` : "未確認"}</dd></div><div><dt>希望納期</dt><dd>${formatDeadline(parsed.deadline)}</dd></div><div><dt>受渡方法</dt><dd>${parsed.method}</dd></div><div><dt>案件種別</dt><dd>${parsed.frequency || "単発／継続を確認"}</dd></div><div><dt>情報リスク</dt><dd>${parsed.risks.length ? parsed.risks.join("、") : "内容確認後に判定"}</dd></div></dl></article><article class="questions-card"><span class="eyebrow">NEXT QUESTIONS</span><h2>実行体制を組むために、確認したいこと</h2><ol>${missing.map((item, index) => `<li><b>${index + 1}</b><span>${item}</span></li>`).join("")}</ol><button class="button primary" data-action="consult">続きの条件を入力する</button></article></main><aside class="plan-card"><small>想定する進め方</small><h3>シゴトパスが実行体制を検討</h3><div class="mini-flow"><span>案件仕様を確定</span><i>↓</i><span>対応能力を照合</span><i>↓</i><span>必要なら複数拠点へ分配</span><i>↓</i><span>概算・納期をご案内</span></div><p>現時点では施設への打診や発注は行われません。</p><button class="button secondary" data-action="consult">相談内容を補足する</button></aside></div><section class="brief-explanation"><h2>施設を選ぶ前に、案件を整える理由</h2><div><p><b>誤った候補を出さない</b><span>作業名だけでなく数量、期限、品質、情報管理まで確認します。</span></p><p><b>大型案件を分けられる</b><span>1拠点で難しい場合は、工程または数量を分けて体制を組みます。</span></p><p><b>企業の管理を増やさない</b><span>複数拠点でも、企業側の相談・進捗・納品窓口は一つです。</span></p></div></section></section>`;
}

function consultationModal(kind = "company") {
  const isCompany = kind === "company";
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" aria-label="閉じる">×</button><span class="eyebrow">${isCompany ? "業務相談" : kind === "facility" ? "実行拠点の参加相談" : "ネットワーク連携相談"}</span><h2 id="modalTitle">${isCompany ? "分かる範囲で教えてください" : kind === "facility" ? "対応できる仕事を一緒に整理します" : "連携について相談"}</h2><div class="modal-notice">構想確認用デモのため、入力内容は送信・保存されません。個人情報・機密情報は入力しないでください。</div><form id="demoForm">${isCompany ? `<label class="full">終わらせたい仕事 <b>*</b><textarea required rows="4">${escapeHTML(state.query)}</textarea></label><div class="form-grid"><label>数量・単位<input placeholder="例：5,000枚"></label><label>希望納期<input type="date" value="${state.parsed?.deadline ?? ""}"></label><label>発生頻度<select><option>未定</option><option>今回のみ</option><option>毎月</option><option>継続</option></select></label><label>受渡方法<select><option>未定</option><option>オンライン</option><option>郵送・配送</option><option>現地作業</option></select></label></div><fieldset><legend>含まれる可能性があるもの</legend><label><input type="checkbox"> 個人情報</label><label><input type="checkbox"> 機密情報</label><label><input type="checkbox"> 原本・現物</label><label><input type="checkbox"> 食品</label></fieldset>` : `<div class="form-grid"><label>法人・団体名 <b>*</b><input required></label><label>${kind === "facility" ? "事業所名" : "窓口・組織名"} <b>*</b><input required></label><label>担当者名 <b>*</b><input required></label><label>メールアドレス <b>*</b><input type="email" required></label></div><label class="full">相談したいこと<textarea rows="4" placeholder="対応業務、地域、連携イメージなど"></textarea></label>`}<label class="consent"><input type="checkbox" required> デモであり、送信・保存されないことを確認しました</label><button class="button primary wide" type="submit">デモ入力を完了する</button></form></section></div>`;
}
function menuModal(){return `<div class="modal-backdrop"><section class="modal menu-modal" role="dialog" aria-modal="true" aria-label="メニュー"><button class="modal-close" aria-label="閉じる">×</button><h2>メニュー</h2><button data-scroll="services">対応業務</button><button data-scroll="managed">シゴトパスの仕組み</button><button data-scroll="quality">品質管理</button><button data-scroll="network">実行拠点の方へ</button><button data-action="consult">仕事を相談する</button></section></div>`}
function showModal(html){lastFocusedElement=document.activeElement;modalRoot.innerHTML=html;document.body.classList.add("locked");$(".modal-close",modalRoot)?.focus();$(".modal-close",modalRoot)?.addEventListener("click",closeModal);$(".modal-backdrop",modalRoot)?.addEventListener("click",event=>{if(event.target.classList.contains("modal-backdrop"))closeModal()});$("#demoForm",modalRoot)?.addEventListener("submit",completeDemo);bindActions(modalRoot)}
function closeModal(){modalRoot.innerHTML="";document.body.classList.remove("locked");lastFocusedElement?.focus?.();lastFocusedElement=null}
function completeDemo(event){event.preventDefault();$(".modal",modalRoot).innerHTML=`<div class="complete"><span>✓</span><h2>デモ入力を確認しました</h2><p>入力内容は送信・保存されていません。正式版では、共有範囲と利用目的を確認後に受付番号を発行します。</p><button class="button primary" id="completeClose">閉じる</button></div>`;$("#completeClose")?.addEventListener("click",closeModal)}
function goHomeAndScroll(id){state.view="home";render();requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}))}
function bindActions(root=document){$$('[data-action="consult"]',root).forEach(button=>button.addEventListener("click",()=>showModal(consultationModal("company"))));$$('[data-action="facility"]',root).forEach(button=>button.addEventListener("click",()=>showModal(consultationModal("facility"))));$$('[data-action="partner"]',root).forEach(button=>button.addEventListener("click",()=>showModal(consultationModal("partner"))));$$('[data-action="menu"]',root).forEach(button=>button.addEventListener("click",()=>showModal(menuModal())));$$('[data-scroll]',root).forEach(button=>button.addEventListener("click",()=>{const id=button.dataset.scroll;closeModal();goHomeAndScroll(id)}))}
function bindPage(){$("#requestForm")?.addEventListener("submit",event=>{event.preventDefault();const query=$("#requestInput").value.trim();if(!query)return;state.query=query;state.parsed=parseRequest(query);state.view="brief";render()});$$("[data-example]",app).forEach(button=>button.addEventListener("click",()=>{state.query=button.dataset.example;state.parsed=parseRequest(state.query);state.view="brief";render()}));$("#backHome",app)?.addEventListener("click",()=>{state.view="home";render()});bindActions(app)}
function render(){app.innerHTML=state.view==="brief"?brief():home();window.scrollTo(0,0);bindPage()}
document.querySelectorAll('a[href^="#"]').forEach(anchor=>anchor.addEventListener("click",event=>{event.preventDefault();const id=anchor.getAttribute("href").slice(1);if(id==="home"){state.view="home";render();return}goHomeAndScroll(id)}));
bindActions(document.querySelector(".site-header"));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal();const modal=$(".modal");if(event.key!=="Tab"||!modal)return;const focusable=$$("button,input,select,textarea,[href]",modal).filter(element=>!element.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
render();
