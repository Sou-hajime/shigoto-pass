const CATEGORIES = [
  { id: "label", name: "シール・ラベル貼り", icon: "🏷️", desc: "商品ラベル、訂正シール、宛名貼付", keywords: ["シール", "ラベル", "タグ"] },
  { id: "packing", name: "袋詰め・梱包", icon: "📦", desc: "封入、セット組み、箱詰め、検品", keywords: ["袋", "梱包", "箱詰", "封入", "セット", "検品"] },
  { id: "dm", name: "DM・発送", icon: "✉️", desc: "仕分け、封入、宛名貼り、発送", keywords: ["dm", "発送", "配送", "郵便", "チラシ"] },
  { id: "data", name: "データ入力・書類電子化", icon: "⌨️", desc: "入力、転記、スキャン、PDF化、書類整理", keywords: ["データ", "入力", "転記", "名刺", "アンケート", "ocr", "スキャン", "pdf", "書類", "商品登録"] },
  { id: "sns", name: "EC・デジタル業務", icon: "🎨", desc: "EC登録、画像整理、AI用データ、投稿補助", keywords: ["ec", "商品情報", "商品登録", "sns", "投稿", "画像", "バナー", "canva", "ai", "教師データ", "デザイン"] },
  { id: "clean", name: "清掃", icon: "🧹", desc: "オフィス、店舗、共用部、草刈り", keywords: ["清掃", "掃除", "草刈", "除草"] }
];

const FACILITIES = [
  { id: 1, name: "ワークス青葉", place: "東京都江東区", image: "https://picsum.photos/seed/work-aoba/900/560", type: "就労継続支援B型", availability: "8月15日以降に開始可能", updated: "2026年8月3日", reply: "通常2営業日以内", delivery: ["配送", "持込", "引取"], conditions: ["個人情報は要相談", "食品加工は非対応"], work: [
    { category: "label", title: "シール・ラベル貼り", steps: ["数量確認", "ラベル貼り", "全数検品"], min: 100, max: 10000, unit: "個", days: 5, price: "8円〜／個", status: "ok" },
    { category: "packing", title: "袋詰め・梱包", steps: ["袋詰め", "検品", "箱詰め"], min: 50, max: 20000, unit: "個", days: 5, price: "10円〜／個", status: "ok" },
    { category: "dm", title: "DM発送", steps: ["封入", "宛名貼り", "発送"], min: 500, max: 12000, unit: "通", days: 7, price: "個別見積", status: "consult" }
  ], quality: ["作業前に完成見本を作成", "職員が100個ごとに数量確認", "完成品を全数検品", "写真付き作業記録を提出可能"], achievement: { industry: "化粧品卸", title: "サンプル5,000セットの封入・箱詰め", detail: "職員2名が工程別に検品し7営業日で納品。月1回の継続受注。" }, equipment: ["ラベルプリンター", "卓上シーラー", "保管棚"] },
  { id: 2, name: "みらいステップ横浜", place: "神奈川県横浜市", image: "https://picsum.photos/seed/mirai-yokohama/900/560", type: "就労継続支援A型", availability: "新規相談受付中", updated: "2026年8月4日", reply: "通常1営業日以内", delivery: ["オンライン", "配送"], conditions: ["個人情報取扱い対応", "紙原稿は配送が必要"], work: [
    { category: "data", title: "データ入力", steps: ["入力", "二者照合", "納品データ作成"], min: 100, max: 15000, unit: "件", days: 3, price: "20円〜／件", status: "ok" },
    { category: "sns", title: "SNS画像制作", steps: ["画像制作", "校正", "データ納品"], min: 5, max: 200, unit: "点", days: 5, price: "1,500円〜／点", status: "ok" }
  ], quality: ["入力者と確認者を分離", "個人情報管理区域で作業", "作業ログを保存"], achievement: { industry: "EC運営", title: "商品情報8,000件の登録", detail: "画像名の照合と二者確認を行い、20営業日で納品。" }, equipment: ["PC 18台", "高速スキャナー", "Adobe CC"] },
  { id: 3, name: "つむぎワーク大宮", place: "埼玉県さいたま市", image: "https://picsum.photos/seed/tsumugi-omiya/900/560", type: "就労継続支援B型", availability: "小ロットのみ相談可能", updated: "2026年8月1日", reply: "通常3営業日以内", delivery: ["配送", "持込"], conditions: ["資材支給の場合に対応", "重量物は非対応"], work: [
    { category: "packing", title: "セット組み・箱詰め", steps: ["仕分け", "セット組み", "箱詰め"], min: 50, max: 3000, unit: "個", days: 4, price: "個別見積", status: "ok" },
    { category: "label", title: "ラベル貼り", steps: ["位置合わせ", "ラベル貼り", "検品"], min: 50, max: 5000, unit: "個", days: 3, price: "9円〜／個", status: "consult" }
  ], quality: ["初回品を職員が確認", "作業マニュアルを案件ごとに作成"], achievement: { industry: "イベント運営", title: "景品800セットの組み立て", detail: "封入物の順番をマニュアル化し、4営業日で納品。" }, equipment: ["広幅作業台", "卓上シーラー"] },
  { id: 4, name: "ソーシャルラボ千葉", place: "千葉県千葉市", image: "https://picsum.photos/seed/social-chiba/900/560", type: "就労継続支援A型", availability: "新規相談受付中", updated: "2026年8月4日", reply: "通常2営業日以内", delivery: ["オンライン"], conditions: ["制作前にブランド資料が必要"], work: [
    { category: "sns", title: "SNS画像・バナー制作", steps: ["構成", "画像制作", "校正"], min: 5, max: 300, unit: "点", days: 5, price: "1,500円〜／点", status: "ok" },
    { category: "data", title: "EC商品登録", steps: ["画像加工", "商品情報入力", "公開前確認"], min: 50, max: 5000, unit: "件", days: 5, price: "30円〜／件", status: "ok" }
  ], quality: ["ディレクターが全件確認", "ブランドガイドと照合"], achievement: { industry: "飲食業", title: "SNS投稿画像を月30点制作", detail: "テンプレートを整備し、6か月継続対応。" }, equipment: ["PC 24台", "撮影ブース", "Canva Pro"] },
  { id: 5, name: "ひだまりクリーンサービス", place: "東京都練馬区", image: "https://picsum.photos/seed/hidamari-clean/900/560", type: "就労継続支援B型", availability: "9月から開始可能", updated: "2026年8月2日", reply: "通常2営業日以内", delivery: ["訪問"], conditions: ["深夜作業は非対応", "作業範囲は事前確認"], work: [
    { category: "clean", title: "オフィス・共用部清掃", steps: ["床清掃", "水回り", "完了確認"], min: 1, max: 5, unit: "回／週", days: 7, price: "6,000円〜／回", status: "ok" }
  ], quality: ["現場責任者が同行", "作業前後の写真を提出", "チェックリストで完了確認"], achievement: { industry: "IT企業", title: "オフィスの定期清掃", detail: "週2回、床・水回り・ごみ回収を1年間継続。" }, equipment: ["業務用掃除機", "ポリッシャー", "清掃カート"] },
  { id: 6, name: "多摩パッケージセンター", place: "東京都立川市", image: "https://picsum.photos/seed/tama-package/900/560", type: "就労継続支援A型", availability: "新規相談受付中", updated: "2026年8月5日", reply: "通常1営業日以内", delivery: ["配送", "持込", "引取"], conditions: ["食品は個包装済みのみ", "最低500個から"], work: [
    { category: "packing", title: "大量梱包・セット組み", steps: ["計数", "セット組み", "封緘", "検品"], min: 500, max: 50000, unit: "個", days: 5, price: "6円〜／個", status: "ok" },
    { category: "label", title: "ラベル貼り", steps: ["ラベル貼り", "数量確認", "箱詰め"], min: 500, max: 50000, unit: "個", days: 4, price: "6円〜／個", status: "ok" },
    { category: "dm", title: "DM封入", steps: ["折り", "封入", "封緘"], min: 1000, max: 30000, unit: "通", days: 5, price: "個別見積", status: "ok" }
  ], quality: ["自動計数機と手作業で二重確認", "ロット別チェックシートを保存"], achievement: { industry: "食品メーカー", title: "ノベルティ30,000セットの梱包", detail: "5工程を分担し、10営業日で一括納品。" }, equipment: ["自動計数機", "封緘機", "フォークリフト"] },
  { id: 7, name: "コネクト川崎", place: "神奈川県川崎市", image: "https://picsum.photos/seed/connect-kawasaki/900/560", type: "就労移行支援", availability: "内容により対応可能", updated: "2026年7月30日", reply: "通常3営業日以内", delivery: ["オンライン", "配送"], conditions: ["宛名データ形式を事前確認", "機密保持契約は要相談"], work: [
    { category: "dm", title: "宛名作成・DM発送", steps: ["データ整形", "宛名印刷", "封入", "発送"], min: 300, max: 25000, unit: "通", days: 7, price: "18円〜／通", status: "consult" },
    { category: "data", title: "名簿データ整備", steps: ["入力", "重複確認", "納品"], min: 300, max: 10000, unit: "件", days: 5, price: "個別見積", status: "ok" }
  ], quality: ["個人情報管理区域で作業", "発送件数をデータと突合"], achievement: { industry: "会員団体", title: "会報15,000通の発送", detail: "宛名データ整形から郵便局持込まで対応。" }, equipment: ["高速プリンター", "折り機", "PC 12台"] },
  { id: 8, name: "ハーモニー船橋", place: "千葉県船橋市", image: "https://picsum.photos/seed/harmony-funabashi/900/560", type: "生活介護事業所", availability: "継続案件は相談可能", updated: "2026年8月1日", reply: "通常3営業日以内", delivery: ["配送", "訪問"], conditions: ["単発短納期は要相談", "重量物は10kgまで"], work: [
    { category: "packing", title: "教材・商品の箱詰め", steps: ["仕分け", "数量確認", "箱詰め"], min: 100, max: 8000, unit: "個", days: 7, price: "10円〜／個", status: "consult" },
    { category: "clean", title: "施設・共用部清掃", steps: ["床清掃", "拭き上げ", "完了確認"], min: 1, max: 3, unit: "回／週", days: 10, price: "個別見積", status: "ok" }
  ], quality: ["職員が各工程に常駐", "数量チェックシートを提出可能"], achievement: { industry: "教育", title: "学校教材2,500セットの箱詰め", detail: "学年別に仕分け、数量確認後に納品。" }, equipment: ["作業室120㎡", "運搬車両", "保管スペース"] }
];
