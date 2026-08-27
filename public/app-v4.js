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
  return `<section class="hero" id="home"><div class="hero-copy"><span class="eyebrow">社内で手が回らない業務を、もっと頼みやすく</span><h1>手が回らない仕事を、<br><em>相談から納品まで。</em></h1><p class="hero-lead">データ入力、書類の電子化、商品登録、封入・梱包など。内容が固まっていなくても、担当者が依頼内容を整理し、見積りから作業の進行、納品までまとめて対応します。</p><form class="request-box compact" id="requestForm"><label for="requestInput">どんな仕事を依頼したいですか？</label><div><textarea id="requestInput" rows="2" required placeholder="例：紙アンケート5,000枚をExcelに入力して、9月末までに納品してほしい"></textarea><button class="button primary" type="submit">相談内容を整理する <span>→</span></button></div><small>数量や納期が未定でもご相談いただけます。入力内容はこのデモでは送信されません。</small></form><div class="hero-points"><span>相談・見積りは無料</span><span>内容が未確定でも相談OK</span><span>担当窓口が最後まで対応</span></div></div><figure class="hero-photo"><img src="hero-shigotopass-role-v1.png" alt="企業から受け取った仕事を担当者が整理し、データ入力、書類電子化、梱包を行う各チームへ手配するイメージ"><figcaption><b>シゴトパスがまとめて担当</b><span>内容確認・見積り・作業先の手配・進行確認・検品・納品</span></figcaption></figure></section>
  <section class="section services" id="services"><div class="section-heading"><span class="eyebrow">対応できる仕事</span><h2>まずは、困っていることをお聞かせください。</h2><p>社内で手が回らない定型業務を、必要な量や期間に合わせてお引き受けします。</p></div><div class="service-grid">${serviceCards.map(card => `<button class="service-card" data-example="${escapeHTML(card[2].split("、")[0])}を依頼したい"><span>${card[0]}</span><h3>${card[1]}</h3><p>${card[2]}</p><b>この仕事を相談 →</b></button>`).join("")}</div><div class="scope-note"><b>一覧にない仕事もご相談ください。</b><p>仕事内容を伺ったうえで、対応できる方法をご案内します。</p></div></section>
  <section class="section use-cases" id="use-cases"><div class="section-heading"><span class="eyebrow">利用イメージ</span><h2>こんな場面で、シゴトパスを利用できます。</h2><p>仕事の名前や依頼方法が決まっていなくても、「いま何に困っているか」からご相談いただけます。</p></div><div class="case-grid"><article class="case-card"><span class="case-number">SCENE 01</span><h3>入力作業がたまり、本来の仕事に手が回らない</h3><p class="case-problem">紙の申込書やアンケートが増え、社員が入力作業に追われている。</p><div class="case-action"><b>シゴトパスの使い方</b><p>書類の種類、件数、希望納期を確認し、入力方法と確認ルールを決めて作業します。</p></div><div class="case-benefit"><b>メリット</b><p>社員は確認作業だけで済み、本来の業務に時間を使えます。</p></div></article><article class="case-card"><span class="case-number">SCENE 02</span><h3>キャンペーン前だけ、大量の作業が発生する</h3><p class="case-problem">封入、ラベル貼り、セット組みなど、短期間だけ人手が必要になった。</p><div class="case-action"><b>シゴトパスの使い方</b><p>見本、数量、納期を確認し、必要な作業先を手配。進み具合もまとめて確認します。</p></div><div class="case-benefit"><b>メリット</b><p>一時的な採用や複数の外注先との調整をせずに、必要な期間だけ依頼できます。</p></div></article><article class="case-card"><span class="case-number">SCENE 03</span><h3>ECサイトの更新が後回しになっている</h3><p class="case-problem">商品登録や画像整理を進めたいが、担当者の時間を確保できない。</p><div class="case-action"><b>シゴトパスの使い方</b><p>登録項目と完成見本を確認し、決めた形式で商品情報を整えて登録します。</p></div><div class="case-benefit"><b>メリット</b><p>更新を止めずに進められ、担当者ごとの仕上がりのばらつきも抑えられます。</p></div></article></div><div class="benefit-summary"><div><span>01</span><b>相談先を一本化</b><p>作業先を探したり、個別に連絡したりする負担を減らします。</p></div><div><span>02</span><b>必要なときだけ依頼</b><p>繁忙期や一時的な大量作業にも、仕事の量に合わせて対応します。</p></div><div><span>03</span><b>納品まで任せられる</b><p>作業の手配、進行確認、検品までシゴトパスが担当します。</p></div></div></section>
  <section class="managed section" id="managed"><div class="section-heading light"><span class="eyebrow">ご利用の流れ</span><h2>ご相談から納品まで、担当窓口がまとめて対応します。</h2><p>企業のご担当者が、複数の作業先と個別にやり取りする必要はありません。</p></div><ol class="process-grid"><li><b>01</b><span>仕事内容を確認</span><p>数量、納期、完成イメージを伺います</p></li><li><b>02</b><span>見積りをご案内</span><p>費用、納期、作業方法をご確認いただきます</p></li><li><b>03</b><span>作業先を手配</span><p>仕事内容に合う事業所やチームを選びます</p></li><li><b>04</b><span>進み具合を確認</span><p>遅れや確認事項は担当窓口がまとめます</p></li><li><b>05</b><span>検品して納品</span><p>決めた内容どおりか確認してお届けします</p></li></ol><div class="service-promise"><div><small>企業のご担当者</small><h3>シゴトパスだけに相談</h3><p>仕事内容と希望条件を伝え、見積りと納品物を確認します。</p></div><span>→</span><div><small>シゴトパス</small><h3>必要な手配をまとめて担当</h3><p>作業先との連絡、進行確認、検品を行います。</p></div></div></section>
  <section class="section quality" id="quality"><div class="section-heading"><span class="eyebrow">安心して任せていただくために</span><h2>作業を始める前に、納期と完成の基準を確認します。</h2><p>「どこまでやれば完了か」をはっきりさせ、作業中の行き違いを減らします。</p></div><div class="quality-grid"><article><span>01</span><h3>仕事内容を確認</h3><p>作業範囲、数量、期限、受渡方法を書面で確認します。</p></article><article><span>02</span><h3>完成見本を確認</h3><p>必要に応じて見本を作り、仕上がりを合わせてから進めます。</p></article><article><span>03</span><h3>情報を適切に管理</h3><p>個人情報や機密情報がある場合は、対応方法を事前に確認します。</p></article><article><span>04</span><h3>連絡窓口を一本化</h3><p>変更、遅れ、やり直しのご相談は担当窓口が承ります。</p></article></div><div class="caution-box"><b>現在はサービス準備中です</b><p>このサイトはサービス内容を確認するためのデモです。正式な対応範囲や保証内容は、利用規約と契約条件の確定後に掲載します。</p></div></section>
  <section class="section network" id="network"><div class="network-copy"><span class="eyebrow">仕事を受けたい事業所の方へ</span><h2>営業の負担を減らし、<br>得意な仕事に集中できます。</h2><p>企業への営業や日々の連絡はシゴトパスが担当します。事業所には、登録いただいた仕事内容や受入可能量に合う仕事をご案内します。</p><button class="button light" data-action="facility">事業所としての参加を相談</button></div><ol class="network-steps"><li><b>1</b><div><strong>対応できる仕事を登録</strong><span>作業内容、設備、1日に対応できる量などを確認します</span></div></li><li><b>2</b><div><strong>仕事の相談を受ける</strong><span>数量、納期、条件を見て受けられるか回答します</span></div></li><li><b>3</b><div><strong>決めた手順で作業</strong><span>進み具合や確認事項をシゴトパスへ共有します</span></div></li><li><b>4</b><div><strong>企業対応はシゴトパスが担当</strong><span>企業への連絡や納品の調整をまとめて行います</span></div></li></ol></section>
  <section class="section pilot"><div class="section-heading"><span class="eyebrow">実証へのご協力を募集予定</span><h2>企業と事業所、双方の協力から始めます。</h2><p>小さな案件で、相談から納品までの流れを確認しながらサービスを整えます。</p></div><div class="pilot-grid"><article><small>企業の方</small><h3>定型業務を試しに外注したい</h3><p>データ入力、書類電子化、EC登録、封入・梱包などをご相談ください。</p><button class="button primary" data-action="consult">仕事を相談する</button></article><article><small>事業所の方</small><h3>企業からの仕事を受けたい</h3><p>得意な仕事、対応できる量、検品方法などを一緒に整理します。</p><button class="button secondary" data-action="facility">参加について相談</button></article><article><small>共同受注窓口の方</small><h3>地域で連携したい</h3><p>地域の事業所ネットワークとの連携についてご相談ください。</p><button class="button secondary" data-action="partner">連携を相談</button></article></div></section>
  <section class="final-cta"><span>仕事内容や数量が決まっていなくても大丈夫です。</span><h2>まずは、依頼したい仕事をお聞かせください。</h2><button class="button white" data-action="consult">仕事について相談する</button><small>相談・見積りは無料です。このデモでは送信されません。</small></section>`;
}

function brief() {
  const parsed = state.parsed ?? parseRequest(state.query);
  const workNames = parsed.categories.length ? parsed.categories.map(categoryName) : ["仕事内容は担当者が確認します"];
  const missing = [!parsed.categories.length ? "依頼したい作業の詳しい内容" : null, !parsed.quantity ? "数量と単位" : null, !parsed.deadline ? "希望する納期" : null, parsed.method === "未確認" ? "データや資材の受渡方法" : null, "希望する仕上がりや確認方法"].filter(Boolean);
  return `<section class="brief-page"><div class="brief-header"><button class="back-link" id="backHome">← トップへ戻る</button><span class="eyebrow">入力内容の確認</span><h1>ご相談内容を確認しましょう。</h1><p>入力から読み取れた内容を表示しています。未定の項目は、このあと担当者と相談できます。</p></div><div class="brief-layout"><main><article class="original-request"><small>入力された内容</small><p>「${escapeHTML(state.query)}」</p></article><article class="spec-card"><div class="card-heading"><div><small>現在確認できていること</small><h2>${workNames.join("＋")}</h2></div><span class="draft-badge">確認前</span></div><dl class="spec-grid"><div><dt>依頼したい仕事</dt><dd>${workNames.join("、")}</dd></div><div><dt>数量</dt><dd>${parsed.quantity ? `${parsed.quantity.toLocaleString()}${parsed.unit}` : "未定"}</dd></div><div><dt>希望納期</dt><dd>${parsed.deadline ? formatDeadline(parsed.deadline) : "未定"}</dd></div><div><dt>受渡方法</dt><dd>${parsed.method === "未確認" ? "未定" : parsed.method}</dd></div><div><dt>依頼の頻度</dt><dd>${parsed.frequency || "未定"}</dd></div><div><dt>注意が必要な情報</dt><dd>${parsed.risks.length ? parsed.risks.join("、") : "担当者が確認します"}</dd></div></dl></article><article class="questions-card"><span class="eyebrow">追加で確認したいこと</span><h2>お見積りに必要な項目</h2><ol>${missing.map((item, index) => `<li><b>${index + 1}</b><span>${item}</span></li>`).join("")}</ol><button class="button primary" data-action="consult">内容を追加して相談する</button></article></main><aside class="plan-card"><small>ご相談後の流れ</small><h3>担当者が内容を確認します</h3><div class="mini-flow"><span>仕事内容を確認</span><i>↓</i><span>費用と納期をご案内</span><i>↓</i><span>合意後に作業を開始</span><i>↓</i><span>検品して納品</span></div><p>この画面を表示しただけでは、相談や発注は行われません。</p><button class="button secondary" data-action="consult">担当者に相談する</button></aside></div></section>`;
}

function consultationModal(kind = "company") {
  const isCompany = kind === "company";
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" aria-label="閉じる">×</button><span class="eyebrow">${isCompany ? "仕事のご相談" : kind === "facility" ? "事業所の参加相談" : "地域連携のご相談"}</span><h2 id="modalTitle">${isCompany ? "分かる範囲でお聞かせください" : kind === "facility" ? "対応できる仕事について伺います" : "連携についてお聞かせください"}</h2><div class="modal-notice">このフォームは画面確認用です。入力内容は送信・保存されません。個人情報や機密情報は入力しないでください。</div><form id="demoForm">${isCompany ? `<label class="full">依頼したい仕事 <b>*</b><textarea required rows="3">${escapeHTML(state.query)}</textarea></label><div class="form-grid"><label>数量・単位<input placeholder="例：5,000枚"></label><label>希望納期<input type="date" value="${state.parsed?.deadline ?? ""}"></label><label>依頼の頻度<select><option>未定</option><option>今回のみ</option><option>毎月</option><option>継続</option></select></label><label>受渡方法<select><option>未定</option><option>オンライン</option><option>郵送・配送</option><option>現地作業</option></select></label></div><fieldset><legend>該当するものがあれば選択してください</legend><label><input type="checkbox"> 個人情報</label><label><input type="checkbox"> 機密情報</label><label><input type="checkbox"> 原本・現物</label><label><input type="checkbox"> 食品</label></fieldset>` : `<div class="form-grid"><label>法人・団体名 <b>*</b><input required></label><label>${kind === "facility" ? "事業所名" : "窓口・組織名"} <b>*</b><input required></label><label>担当者名 <b>*</b><input required></label><label>メールアドレス <b>*</b><input type="email" required></label></div><label class="full">相談したいこと<textarea rows="4" placeholder="対応できる仕事、地域、連携についてなど"></textarea></label>`}<label class="consent"><input type="checkbox" required> このフォームでは送信・保存されないことを確認しました</label><button class="button primary wide" type="submit">入力内容を確認する</button></form></section></div>`;
}
function menuModal(){return `<div class="modal-backdrop"><section class="modal menu-modal" role="dialog" aria-modal="true" aria-label="メニュー"><button class="modal-close" aria-label="閉じる">×</button><h2>メニュー</h2><button data-scroll="services">対応できる仕事</button><button data-scroll="use-cases">利用イメージ</button><button data-scroll="managed">ご利用の流れ</button><button data-scroll="quality">安心への取り組み</button><button data-scroll="network">事業所の方へ</button><button data-action="consult">仕事を相談する</button></section></div>`}
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
