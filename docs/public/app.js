const state = { view: "home", query: "", categories: [], quantity: null, deadline: "", method: "all", region: "all", sort: "fit", compare: [] };
const app = document.querySelector("#app");
let lastFocusedElement = null;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cat = id => CATEGORIES.find(c => c.id === id);
const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[ch]);

function parseRequest(text) {
  const lower = text.toLowerCase();
  const categories = CATEGORIES.filter(c => c.keywords.some(k => lower.includes(k))).map(c => c.id);
  const number = lower.match(/([\d,]+)\s*(個|件|通|枚|セット|点|回)/);
  const date = lower.match(/(\d{1,2})月(\d{1,2})日/);
  let method = "all";
  if (/オンライン|web|ウェブ/.test(lower)) method = "オンライン";
  else if (/訪問|現地|オフィス|店舗|共用部/.test(lower)) method = "訪問";
  else if (/配送|発送|郵送/.test(lower)) method = "配送";
  let deadline = "";
  if (date) { const now = new Date(); let year = now.getFullYear(); const candidate = new Date(year, Number(date[1])-1, Number(date[2])); if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) year += 1; deadline = `${year}-${String(date[1]).padStart(2,"0")}-${String(date[2]).padStart(2,"0")}`; }
  return { categories, quantity: number ? Number(number[1].replaceAll(",", "")) : null, deadline, method };
}

function deadlineStatus(f, works) {
  if (!state.deadline) return "unknown";
  const startMatch = f.availability.match(/(\d{1,2})月(\d{1,2})日/);
  if (!startMatch) return "unknown";
  const deadline = new Date(`${state.deadline}T00:00:00`);
  let start = new Date(deadline.getFullYear(), Number(startMatch[1])-1, Number(startMatch[2]));
  if (start > deadline && start.getMonth() > deadline.getMonth()) start.setFullYear(start.getFullYear()-1);
  const days = Math.max(...works.map(w=>w.days));
  const finish = new Date(start); finish.setDate(finish.getDate()+days);
  return finish <= deadline ? "ok" : "ng";
}

function matchingWork(f) {
  const target = state.categories.length ? state.categories : f.work.map(w => w.category);
  return f.work.filter(w => target.includes(w.category));
}

function fit(f) {
  const work = matchingWork(f);
  const matchedCats = state.categories.filter(c => f.work.some(w => w.category === c));
  const quantityWorks = work.filter(w => !state.quantity || (state.quantity >= w.min && state.quantity <= w.max));
  const methodOk = state.method === "all" || f.delivery.includes(state.method);
  const regionOk = state.region === "all" || f.place.includes(state.region);
  const total = Math.max(1, state.categories.length) + (state.quantity ? 1 : 0) + (state.method !== "all" ? 1 : 0) + (state.region !== "all" ? 1 : 0);
  const matched = (state.categories.length ? matchedCats.length : 1) + (state.quantity && quantityWorks.length ? 1 : 0) + (state.method !== "all" && methodOk ? 1 : 0) + (state.region !== "all" && regionOk ? 1 : 0);
  const allRequired = !state.categories.length || matchedCats.length === state.categories.length;
  const deadlineFit = deadlineStatus(f, work.length ? work : f.work);
  return { work, matchedCats, quantityWorks, methodOk, regionOk, total, matched, allRequired, deadlineFit };
}

function searchFacilities() {
  let list = FACILITIES.filter(f => {
    const x = fit(f);
    return (!state.categories.length || x.matchedCats.length > 0) && x.regionOk && x.methodOk && (!state.quantity || x.quantityWorks.length > 0) && x.deadlineFit !== "ng";
  });
  if (state.sort === "fast") list.sort((a,b) => Math.min(...matchingWork(a).map(w=>w.days)) - Math.min(...matchingWork(b).map(w=>w.days)));
  if (state.sort === "small") list.sort((a,b) => Math.min(...matchingWork(a).map(w=>w.min)) - Math.min(...matchingWork(b).map(w=>w.min)));
  if (state.sort === "capacity") list.sort((a,b) => Math.max(...matchingWork(b).map(w=>w.max)) - Math.max(...matchingWork(a).map(w=>w.max)));
  if (state.sort === "fit") list.sort((a,b) => fit(b).matched - fit(a).matched);
  return list;
}

function navigate(view, patch = {}) { Object.assign(state, patch, { view }); closeModal(); window.scrollTo(0,0); render(); }

function home() {
  return `<section class="hero simplified" id="home"><div class="hero-inner"><div class="eyebrow">企業の外注先探しを、もっと簡単に</div><h1>頼みたい仕事を<br><em>対応できる施設</em>を探せます。</h1><p>梱包・発送・データ入力・清掃など。<br>数量や納期を比べて、無料で相談できます。</p><form class="hero-search" id="heroSearch"><span>⌕</span><input aria-label="頼みたい仕事" id="heroInput" placeholder="例：商品500個を袋詰めしてラベルを貼り、8月末までに発送したい"><button>依頼内容を整理する <b>→</b></button></form><button class="ai-link" data-action="guided">何を入力すればよいか分からない方はこちら</button><div class="trust-note">✓ 相談無料　✓ 送信時点では発注になりません　✓ 未定の条件も相談できます</div></div><div class="hero-art"><div class="photo-card"><img src="hero-matching-v2.png" alt="企業担当者と施設担当者が作業内容を確認し、背景で梱包や検品を行うチームのイメージ"></div></div></section>
  <section class="section categories" id="search"><div class="section-head"><div><span>代表的な仕事</span><h2>仕事内容から選ぶ</h2><p>作業名が分かる場合は、こちらからすぐに探せます。</p></div></div><div class="category-grid">${CATEGORIES.map((c,i)=>`<button class="category-card" data-category="${c.id}"><span class="category-icon c${i}">${c.icon}</span><b>${c.name}</b><small>${c.desc}</small><i>対応条件を見る →</i></button>`).join("")}</div></section>
  <section class="guide" id="guide"><div><span>かんたん3ステップ</span><h2>検索から相談まで、無料で使えます</h2></div><ol><li><b>01</b><span>⌕</span><h3>仕事を入力</h3><p>何を・どのくらい・いつまでに、を入力</p></li><li><b>02</b><span>⚖</span><h3>条件を比較</h3><p>対応工程・数量・納期・品質を確認</p></li><li><b>03</b><span>✉</span><h3>対応可否を相談</h3><p>相談時に無料登録し、施設や事務局と条件を整理</p></li></ol></section>
  <section class="onboarding-section" id="onboarding"><div class="section-head"><div><span>登録・掲載の流れ</span><h2>企業も施設も、必要な情報だけを順番に</h2><p>検索は登録不要です。相談や掲載の段階で、必要な情報をご登録いただきます。</p></div></div><div class="onboarding-grid"><article class="flow-panel company-flow"><div class="flow-heading"><span>企業の方</span><h3>仕事を相談するまで</h3><p>検索と比較は無料・登録不要です。</p></div><ol><li><b>1</b><div><strong>仕事内容を検索</strong><span>仕事内容・数量・納期を入力して候補を確認します。</span></div></li><li><b>2</b><div><strong>無料登録</strong><span>相談時に会社名、担当者、連絡先を登録します。</span></div></li><li><b>3</b><div><strong>相談内容を確認</strong><span>送信先、共有情報、希望条件を確認して相談します。</span></div></li><li><b>4</b><div><strong>条件調整・正式見積</strong><span>施設または事務局と仕様・納期・金額を決定します。</span></div></li></ol><button class="primary" data-action="guided">依頼内容を整理する</button></article><article class="flow-panel facility-flow"><div class="flow-heading"><span>就労支援施設の方</span><h3>掲載されるまで</h3><p>基本掲載と企業からの相談受付は無料です。</p></div><ol><li><b>1</b><div><strong>掲載相談・仮登録</strong><span>法人・施設・担当者情報を登録します。電話での代理入力にも対応予定です。</span></div></li><li><b>2</b><div><strong>仕事ごとの情報作成</strong><span>対応工程、数量、納期、品質管理、対象外条件を整理します。</span></div></li><li><b>3</b><div><strong>運営確認</strong><span>法人の存在、掲載同意、記載内容、実績の公開許諾を確認します。</span></div></li><li><b>4</b><div><strong>プレビュー承認・公開</strong><span>施設責任者の承認後に掲載します。無断公開は行いません。</span></div></li><li><b>5</b><div><strong>受付状況を更新</strong><span>30日更新がない空き情報は「要確認」に変更する予定です。</span></div></li></ol><button class="ghost" data-action="facility">掲載について確認する</button></article></div><div class="publication-policy"><h3>掲載時に大切にすること</h3><div><span>✓ 利用者の氏名・障害情報は掲載しません</span><span>✓ 顔写真の掲載は必須ではありません</span><span>✓ 実績は公開許諾を確認します</span><span>✓ 対応できない条件も明記できます</span><span>✓ 施設責任者の承認後に公開します</span><span>✓ 受付停止・辞退で評価を下げません</span></div></div></section>
  <section class="pricing-section" id="pricing"><div class="section-head"><div><span>料金について</span><h2>探す・載せる・相談するまでは無料</h2><p>施設の受取額を減らさず、企業側の成約・運営支援に対して料金をいただく設計です。</p></div><span class="plan-label">正式開始前の料金案</span></div><div class="pricing-grid"><article><span class="audience">企業の方</span><h3>検索・比較・初回相談</h3><strong>無料</strong><p>依頼内容の入力、施設検索、比較、対応可否の相談に費用はかかりません。</p></article><article class="featured-plan"><span class="audience">企業の方</span><h3>成約・マッチング支援</h3><strong>発注額の10%</strong><small>最低5,000円・税別／案件</small><p>条件整理、施設との調整、正式見積への接続に対する手数料です。成約しなかった場合は発生しません。</p></article><article><span class="audience">施設の方</span><h3>基本掲載・相談受付</h3><strong>無料</strong><p>プロフィール掲載、対応業務の登録、企業からの相談受付に月額掲載料はかかりません。</p></article><article><span class="audience">必要な場合のみ</span><h3>個別コーディネート</h3><strong>個別見積</strong><p>仕様書作成、複数施設の調整、試作、進行・検収支援など、追加業務を事前見積で承ります。</p></article></div><div class="pricing-notes"><p><b>料金が発生する前に必ずご案内します。</b> 発注金額、手数料、支援範囲をご確認いただき、合意後に進めます。</p><p>決済、配送、資材、検品、再作業などの費用は案件条件により異なります。正式料金と利用規約はサービス開始前に確定・掲示します。</p></div></section>
  <section class="section cases"><div class="section-head"><div><span>対応事例</span><h2>企業から依頼された仕事</h2><p>作業内容・数量・納期を事実ベースで掲載しています。</p></div></div><div class="case-grid">${FACILITIES.slice(0,3).map(f=>`<article><small>${f.achievement.industry}</small><h3>${f.achievement.title}</h3><p>${f.achievement.detail}</p><button class="text-btn" data-detail="${f.id}">対応した施設を見る →</button></article>`).join("")}</div></section>
  <section class="facility-entry"><div><span>就労支援施設の方へ</span><h2>得意な仕事と空き状況を登録して、<br>企業から相談を受けませんか？</h2><p>仕事ごとの工程・数量・納期を登録すると、条件に合う企業案件につながります。</p></div><div><button class="ghost" data-action="facility">掲載内容を見る</button><button class="primary" data-action="facility">施設登録を相談する</button></div></section>`;
}

function conditionSummary() {
  const names = state.categories.map(id => cat(id).name).join("＋") || "仕事を未指定";
  const known = [names, state.quantity ? `${state.quantity.toLocaleString()}個・件` : null, state.deadline ? `${state.deadline.replaceAll("-","/")}まで` : null, state.method !== "all" ? state.method : null].filter(Boolean);
  const missing = [!state.quantity && "数量", !state.deadline && "希望納期", state.method === "all" && "受渡し方法"].filter(Boolean);
  return `<div class="condition-summary"><div><small>整理した依頼条件</small><strong>${known.join(" ｜ ")}</strong><span>${missing.length ? `未入力：${missing.join("・")}` : "主要条件が揃っています"}</span></div><button class="ghost" id="editConditions">条件を追加・変更</button></div>`;
}

function facilityCard(f) {
  const x = fit(f); const works = x.work.length ? x.work : f.work; const best = works[0];
  const checks = [
    ...state.categories.map(id => f.work.some(w=>w.category===id) ? `✓ ${cat(id).name}` : `△ ${cat(id).name}は要確認`),
    state.quantity ? (x.quantityWorks.length ? `✓ ${state.quantity.toLocaleString()}の数量` : "△ 数量は要確認") : "△ 数量が未入力",
    state.method !== "all" ? (x.methodOk ? `✓ ${state.method}対応` : `△ ${state.method}は要確認`) : "△ 受渡し方法が未入力",
    state.deadline ? (x.deadlineFit === "ok" ? "✓ 入力納期に間に合う目安" : "△ 納期は正式確認が必要") : "△ 希望納期が未入力"
  ];
  const coverage = !state.categories.length ? "作業を指定すると対応範囲を判定" : x.allRequired ? `全${state.categories.length}工程に対応` : `全${state.categories.length}工程中${x.matchedCats.length}工程に対応`;
  return `<article class="facility-card decision-card"><div class="card-photo"><img src="${f.image}" alt="デモ用の作業イメージ"><span class="demo-image-label">デモ画像</span><span class="availability open">● ${f.availability}（架空）</span></div><div class="card-body"><small>${f.place}・架空施設</small><h3>${f.name}</h3><div class="coverage ${x.allRequired?'full':'partial'}">${coverage}${!x.allRequired?'・残りは別途手配が必要':''}</div><div class="work-tags">${works.slice(0,3).map(w=>`<span>${w.title}</span>`).join("")}</div><div class="fit-reasons"><b>${checks.filter(v=>v.startsWith("✓")).length}条件に対応・${checks.filter(v=>v.startsWith("△")).length}件要確認</b>${checks.slice(0,5).map(v=>`<span class="${v.startsWith('△')?'needs':''}">${v}</span>`).join("")}</div><dl><div><dt>依頼量の参考値</dt><dd>${best.min.toLocaleString()}〜${best.max.toLocaleString()}${best.unit}</dd></div><div><dt>作業日数の参考値</dt><dd>${best.days}営業日〜</dd></div><div><dt>参考単価</dt><dd>${best.price}</dd></div></dl><p class="price-note">正式金額には資材・検品・保管・配送等の条件確認が必要です。</p><p class="achievement-line"><b>架空の実績例</b> ${f.achievement.title}</p><div class="availability-meta">デモ更新日：${f.updated}｜返信日数は保証ではありません</div><div class="card-actions"><button class="ghost" data-detail="${f.id}">対応条件を見る</button><button class="primary" data-quote="${f.id}">デモ相談を試す</button></div><button class="compare-button" data-compare="${f.id}">${state.compare.includes(f.id)?"✓ 比較に追加済み":"＋ 比較する"}</button></div></article>`;
}

function results() {
  const list = searchFacilities();
  return `<section class="results-hero"><div><span>仕事から施設を探す</span><h1>${state.query ? `「${escapeHTML(state.query)}」` : "対応施設を検索"}</h1><p>これは検索体験を確認するデモです。正式な対応可否は施設確認後に決まります。</p></div></section><section class="results-shell">${conditionSummary()}<div class="results-layout"><aside><h3>条件を絞り込む</h3><label>仕事<select id="categoryFilter" multiple size="6">${CATEGORIES.map(c=>`<option value="${c.id}" ${state.categories.includes(c.id)?"selected":""}>${c.name}</option>`).join("")}</select><small>複数選択できます</small></label><label>数量<input id="quantityFilter" type="number" min="1" value="${state.quantity||""}" placeholder="例：500"></label><label>希望納期<input id="deadlineFilter" type="date" value="${state.deadline}"></label><label>対応方法<select id="methodFilter"><option value="all">指定なし</option>${["配送","持込","引取","訪問","オンライン"].map(v=>`<option ${state.method===v?"selected":""}>${v}</option>`).join("")}</select></label><label>地域<select id="regionFilter"><option value="all">指定なし</option>${["東京都","神奈川県","埼玉県","千葉県"].map(v=>`<option ${state.region===v?"selected":""}>${v}</option>`).join("")}</select></label><button class="primary wide" id="applyFilters">この条件で探す</button><button class="reset" id="resetFilters">条件をリセット</button></aside><div class="results-main"><div class="result-tools"><span><b>${list.length}件</b>のデモ施設</span><select id="sort"><option value="fit">条件に合う順</option><option value="fast" ${state.sort==='fast'?'selected':''}>納期が早い順</option><option value="small" ${state.sort==='small'?'selected':''}>小ロット順</option><option value="capacity" ${state.sort==='capacity'?'selected':''}>対応量が多い順</option></select></div><div class="result-grid">${list.length ? list.map(facilityCard).join("") : `<div class="empty"><b>すべての条件に合う施設が見つかりませんでした</b><p>数量や対応方法を外すと候補が広がります。</p><button class="ghost" id="relaxConditions">条件を見直す</button></div>`}</div></div></div></section>`;
}

function guidedModal() { return `<div class="modal-backdrop"><section class="modal guided-modal" role="dialog" aria-modal="true"><button class="close" aria-label="閉じる">×</button><span class="spark">依頼内容を整理</span><h2>3つだけ教えてください</h2><form id="guidedForm"><label>1. 何をしてほしいですか？<textarea id="guidedWork" required rows="3" placeholder="例：商品を袋に入れてラベルを貼りたい"></textarea></label><label>2. どのくらいありますか？<input id="guidedQuantity" type="number" min="1" placeholder="例：500"></label><label>3. いつまでですか？<input id="guidedDeadline" type="date"></label><button class="primary wide">この内容で探す</button></form></section></div>`; }

function facilityModal() { return `<div class="modal-backdrop"><section class="modal facility-modal" role="dialog" aria-modal="true" aria-labelledby="facilityTitle"><button class="close" aria-label="閉じる">×</button><span class="spark">就労支援施設の方へ</span><h2 id="facilityTitle">企業が判断しやすい形で、<br>できる仕事を掲載します</h2><p>自由な営業文を書く必要はありません。次の順に、分かる範囲で登録できます。</p><ol class="registration-steps"><li>基本情報</li><li>得意な仕事を最大3つ選択</li><li>担当できる工程</li><li>数量・納期</li><li>受渡し方法</li><li>作業間違いを防ぐ方法</li><li>対応できない条件</li><li>過去の実績1件</li></ol><div class="facility-message">このデモでは登録・送信されません。実運用時は事務局による電話入力・代理登録も用意します。</div><button class="primary wide" id="facilityContact">施設掲載の相談フォームを見る</button></section></div>`; }

function facilityContactModal() { return `<div class="modal-backdrop"><section class="modal quote-modal" role="dialog" aria-modal="true" aria-labelledby="facilityContactTitle"><button class="close" aria-label="閉じる">×</button><span class="spark">施設専用・デモフォーム</span><h2 id="facilityContactTitle">施設掲載について相談</h2><p>このデモでは入力内容は送信・保存されません。</p><form id="facilityForm"><div class="form-grid"><label>法人名 <b>*</b><input required></label><label>施設名 <b>*</b><input required></label><label>担当者名 <b>*</b><input required></label><label>メールアドレス <b>*</b><input type="email" required></label><label>希望連絡方法<select><option>メール</option><option>電話</option><option>オンライン説明</option></select></label><label class="full">相談したいこと<textarea rows="4"></textarea></label></div><button class="primary wide">デモ送信を確認する</button></form></section></div>`; }

function detailModal(f) {
  const x=fit(f); const works=x.work.length?x.work:f.work;
  return `<div class="modal-backdrop"><section class="modal detail-modal" role="dialog" aria-modal="true"><button class="close" aria-label="閉じる">×</button><div class="detail-hero"><img src="${f.image}" alt="${f.name}の作業イメージ"><div><span class="availability open">● ${f.availability}</span><small>${f.place}</small><h2>${f.name}</h2><p>${works.map(w=>w.steps.join("・")).join("、")}に対応。表示条件は目安で、仕様確認後に正式回答します。</p><div class="update-note">空き状況更新：${f.updated}</div></div></div><div class="detail-content"><div><h3>今回の依頼との確認状況</h3><div class="fit-detail">${state.categories.length?state.categories.map(id=>`<span>${f.work.some(w=>w.category===id)?"✓":"△"} ${cat(id).name}</span>`).join(""):"依頼内容を入力すると一致点を表示します"}</div><h3>仕事ごとの対応条件</h3>${works.map(w=>`<article class="work-condition"><div><b>${w.title}</b><span class="status-${w.status}">${w.status==='ok'?'対応できます':'条件を確認して相談'}</span></div><p>${w.steps.join(" → ")}</p><dl><div><dt>依頼量</dt><dd>${w.min.toLocaleString()}〜${w.max.toLocaleString()}${w.unit}</dd></div><div><dt>納期</dt><dd>${w.days}営業日〜</dd></div><div><dt>料金</dt><dd>${w.price}</dd></div></dl></article>`).join("")}<h3>受渡し方法</h3><div class="work-tags">${f.delivery.map(v=>`<span>${v}</span>`).join("")}</div><h3>事前確認・対応できない条件</h3><ul>${f.conditions.map(v=>`<li>${v}</li>`).join("")}</ul><h3>作業間違いを防ぐ方法</h3><ul>${f.quality.map(v=>`<li>✓ ${v}</li>`).join("")}</ul><h3>類似実績</h3><div class="achievement-detail"><small>${f.achievement.industry}</small><b>${f.achievement.title}</b><p>${f.achievement.detail}</p></div><details><summary>設備・施設情報を見る</summary><p>${f.equipment.join("、")}</p><p>${f.type}</p></details></div><aside class="quote-box"><small>現在の受付状況</small><strong class="availability-copy">${f.availability}</strong><p>${f.reply}。条件確認後に正式な納期・金額をご案内します。</p><button class="primary" data-quote="${f.id}">対応できるか相談</button><button class="ghost" data-compare="${f.id}">比較する</button><small>相談無料・送信時点では発注になりません</small></aside></div></section></div>`;
}

function quoteModal(f) { return `<div class="modal-backdrop"><section class="modal quote-modal" role="dialog" aria-modal="true" aria-labelledby="quoteTitle"><button class="close" aria-label="閉じる">×</button><span class="eyebrow">画面確認用デモ</span><h2 id="quoteTitle">${f?`${escapeHTML(f.name)}に`:"運営事務局に"}対応可否を相談</h2><div class="demo-form-warning">入力内容は送信・保存されません。個人情報・機密情報は入力しないでください。</div><form id="quoteForm"><h3>まず、依頼内容を教えてください</h3><div class="form-grid"><label class="full">依頼したい仕事 <b>*</b><textarea required rows="3">${escapeHTML(state.query)}</textarea></label><label>数量<input value="${state.quantity||""}" placeholder="例：500個"></label><label>希望納期<input type="date" value="${state.deadline}"></label><label>案件種別<select><option>単発案件</option><option>継続案件</option><option>未定</option></select></label><label>受渡し方法<select><option>未定</option><option>企業から配送</option><option>施設が引取</option><option>訪問作業</option><option>オンライン</option></select></label><label>資材の用意<select><option>未定</option><option>企業が支給</option><option>施設に依頼</option></select></label><label>検品方法<select><option>相談したい</option><option>全数確認</option><option>抜き取り確認</option><option>企業指定基準あり</option></select></label><label class="full safety"><span>高リスク条件（デモ選択）</span><label><input type="checkbox"> 個人情報</label><label><input type="checkbox"> 機密情報</label><label><input type="checkbox"> 食品</label><label><input type="checkbox"> 危険物</label><small>実運用では、該当案件を施設へ直接送らず、事務局の安全・契約確認へ分岐します。</small></label></div><h3>ご連絡先（デモ用の架空情報を入力してください）</h3><div class="form-grid"><label>会社名 <b>*</b><input required></label><label>担当者名 <b>*</b><input required></label><label>メールアドレス <b>*</b><input required type="email"></label><label>電話番号<input type="tel"></label></div><button class="primary wide">デモ送信を確認する</button></form></section></div>`; }

function compareModal() {
  const fs=state.compare.map(id=>FACILITIES.find(f=>f.id===id));
  return `<div class="modal-backdrop"><section class="modal compare-modal" role="dialog" aria-modal="true"><button class="close">×</button><span class="eyebrow">施設比較</span><h2>対応条件を横並びで比較</h2><div class="compare-table"><div></div>${fs.map(f=>`<h3>${f.name}</h3>`).join("")}<b>対応工程</b>${fs.map(f=>`<span>${matchingWork(f).flatMap(w=>w.steps).slice(0,5).join("・")}</span>`).join("")}<b>数量</b>${fs.map(f=>{const w=matchingWork(f)[0]||f.work[0];return `<span>${w.min.toLocaleString()}〜${w.max.toLocaleString()}${w.unit}</span>`}).join("")}<b>納期</b>${fs.map(f=>`<span>${Math.min(...matchingWork(f).map(w=>w.days))}営業日〜</span>`).join("")}<b>受渡し</b>${fs.map(f=>`<span>${f.delivery.join("・")}</span>`).join("")}<b>受付状況</b>${fs.map(f=>`<span>${f.availability}</span>`).join("")}<b>類似実績</b>${fs.map(f=>`<span>${f.achievement.title}</span>`).join("")}</div><button class="primary wide" data-action="quote">選んだ施設へ同じ条件で相談</button></section></div>`;
}

function show(html) {
  if (!document.body.classList.contains("locked")) lastFocusedElement = document.activeElement;
  $("#modalRoot").innerHTML=html; document.body.classList.add("locked");
  [$(".header"), $("#app"), $("body>footer"), $("#compareBar")].filter(Boolean).forEach(el=>el.setAttribute("aria-hidden","true"));
  $(".close")?.focus(); $(".close")?.addEventListener("click",closeModal);
  $(".modal-backdrop")?.addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop")) closeModal()});
  $("#guidedForm")?.addEventListener("submit",e=>{e.preventDefault();const q=$("#guidedWork").value.trim();const parsed=parseRequest(q);navigate("results",{query:q,categories:parsed.categories,quantity:Number($("#guidedQuantity").value)||null,deadline:$("#guidedDeadline").value})});
  $("#facilityContact")?.addEventListener("click",()=>show(facilityContactModal()));
  $("#quoteForm")?.addEventListener("submit",complete);
  $("#facilityForm")?.addEventListener("submit",complete);
  $("#mobileSearch")?.addEventListener("click",()=>navigate("results",{query:"",categories:[],quantity:null,deadline:"",method:"all",region:"all"}));
  $("#mobileGuide")?.addEventListener("click",()=>{closeModal();navigate("home");setTimeout(()=>$("#guide")?.scrollIntoView({behavior:"smooth"}),0)});
  $("#mobileOnboarding")?.addEventListener("click",()=>{closeModal();navigate("home");setTimeout(()=>$("#onboarding")?.scrollIntoView({behavior:"smooth"}),0)});
  $("#mobilePricing")?.addEventListener("click",()=>{closeModal();navigate("home");setTimeout(()=>$("#pricing")?.scrollIntoView({behavior:"smooth"}),0)});
  $("#mobileGuided")?.addEventListener("click",()=>show(guidedModal()));
  $("#mobileFacility")?.addEventListener("click",()=>show(facilityModal()));
  $$('[data-quote]',$("#modalRoot")).forEach(b=>b.onclick=()=>show(quoteModal(FACILITIES.find(f=>f.id==b.dataset.quote))));
  $$('[data-compare]',$("#modalRoot")).forEach(b=>b.onclick=()=>{toggleCompare(Number(b.dataset.compare));closeModal()});
  $('[data-action="quote"]',$("#modalRoot"))?.addEventListener("click",()=>show(quoteModal()));
}
function closeModal(){ $("#modalRoot").innerHTML=""; document.body.classList.remove("locked");[$(".header"), $("#app"), $("body>footer"), $("#compareBar")].filter(Boolean).forEach(el=>el.removeAttribute("aria-hidden"));if(lastFocusedElement?.focus)lastFocusedElement.focus();lastFocusedElement=null; }
function complete(e){e.preventDefault();$(".quote-modal").innerHTML=`<div class="complete"><span>✓</span><h2>デモ操作が完了しました</h2><p>入力内容は送信・保存されていません。実運用版では、送信先・共有範囲・同意内容を確認した後に受付番号を発行します。</p><button class="primary" id="done">トップへ戻る</button></div>`;$("#done").onclick=()=>navigate("home")}

function toggleCompare(id){ if(state.compare.includes(id)) state.compare=state.compare.filter(x=>x!==id); else if(state.compare.length<3) state.compare.push(id); else return alert("比較できる施設は最大3件です"); renderCompare(); render(); }
function renderCompare(){const el=$("#compareBar");if(!state.compare.length){el.classList.remove("show");el.innerHTML="";return}el.innerHTML=`<b>比較する施設 <span>${state.compare.length}/3</span></b><div>${state.compare.map(id=>`<span>${FACILITIES.find(f=>f.id===id).name}<button data-remove="${id}">×</button></span>`).join("")}</div><button class="primary" id="compareBtn">比較する</button>`;el.classList.add("show");$$('[data-remove]',el).forEach(b=>b.onclick=()=>toggleCompare(Number(b.dataset.remove)));$("#compareBtn").onclick=()=>show(compareModal())}

function bind(){
  $("#heroSearch")?.addEventListener("submit",e=>{e.preventDefault();const q=$("#heroInput").value.trim();if(!q)return;show(`<div class="modal-backdrop"><section class="modal condition-modal" role="dialog" aria-modal="true"><button class="close">×</button><span class="spark">依頼内容を整理しました</span><h2>この条件で探しますか？</h2>${(()=>{const p=parseRequest(q);return `<div class="parsed-conditions"><span>仕事：${p.categories.length?p.categories.map(id=>cat(id).name).join("＋"):"確認が必要"}</span><span>数量：${p.quantity?p.quantity.toLocaleString():"未入力"}</span><span>納期：${p.deadline||"未入力"}</span><span>対応方法：${p.method==='all'?"未入力":p.method}</span></div><p>未入力の項目は、検索結果で追加できます。</p><button class="primary wide" id="confirmSearch">この条件で施設を探す</button>`})()}</section></div>`);$("#confirmSearch").onclick=()=>{const p=parseRequest(q);navigate("results",{query:q,...p})}});
  $$('[data-category]').forEach(b=>b.onclick=()=>navigate("results",{query:cat(b.dataset.category).name,categories:[b.dataset.category],quantity:null,deadline:"",method:"all"}));
  $$('[data-action="guided"]').forEach(b=>b.onclick=()=>show(guidedModal()));
  $$('[data-action="facility"]').forEach(b=>b.onclick=()=>show(facilityModal()));
  $$('[data-action="mobilemenu"]').forEach(b=>b.onclick=()=>show(`<div class="modal-backdrop"><section class="modal mobile-nav" role="dialog" aria-modal="true" aria-label="メニュー"><button class="close" aria-label="閉じる">×</button><h2>メニュー</h2><button class="ghost wide" id="mobileSearch">仕事を探す</button><button class="ghost wide" id="mobileGuide">ご利用の流れ</button><button class="ghost wide" id="mobileOnboarding">登録・掲載の流れ</button><button class="ghost wide" id="mobilePricing">料金について</button><button class="ghost wide" id="mobileGuided">依頼内容を整理</button><button class="ghost wide" id="mobileFacility">仕事を受けたい施設の方</button></section></div>`));
  $$('[data-action="quote"]').forEach(b=>b.onclick=()=>show(quoteModal()));
  $$('[data-detail]').forEach(b=>b.onclick=()=>show(detailModal(FACILITIES.find(f=>f.id==b.dataset.detail))));
  $$('[data-quote]').forEach(b=>b.onclick=()=>show(quoteModal(FACILITIES.find(f=>f.id==b.dataset.quote))));
  $$('[data-compare]').forEach(b=>b.onclick=()=>toggleCompare(Number(b.dataset.compare)));
  $("#applyFilters")?.addEventListener("click",()=>{state.categories=[...$("#categoryFilter").selectedOptions].map(o=>o.value);state.quantity=Number($("#quantityFilter").value)||null;state.deadline=$("#deadlineFilter").value;state.method=$("#methodFilter").value;state.region=$("#regionFilter").value;render()});
  $("#resetFilters")?.addEventListener("click",()=>navigate("results",{query:"",categories:[],quantity:null,deadline:"",method:"all",region:"all"}));
  $("#sort")?.addEventListener("change",e=>{state.sort=e.target.value;render()});
  $("#editConditions")?.addEventListener("click",()=>$(".results-layout>aside")?.scrollIntoView({behavior:"smooth"}));
  $("#relaxConditions")?.addEventListener("click",()=>$(".results-layout>aside")?.scrollIntoView({behavior:"smooth"}));
}
function render(){app.innerHTML=state.view==="home"?home():results();bind();renderCompare()}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();if(e.key==="Tab"&&$(".modal")){const focusable=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',$(".modal")).filter(el=>!el.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.addEventListener("click",e=>{const a=e.target.closest('a[href="#home"]');if(a){e.preventDefault();navigate("home")}});
render();
