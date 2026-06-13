# MikeHsu Travel Web Style Guide

這個網站是 MikeHsu 的旅行旅程紀錄。`index.html` 是旅行收藏首頁，其他 HTML 檔各自代表一趟旅程。之後新增或修改頁面時，請維持「可愛手帳、旅行小卡、手機友善」的整體風格。

## 整體氣質

- 核心感覺：溫暖、圓潤、活潑、像旅行手帳或行前攻略。
- 視覺語言：白色卡片、圓角、柔和漸層、粗體標題、emoji 貼圖、輕微旋轉的小標籤。
- 使用情境：手機查看行程為主，桌機也要能舒服瀏覽。
- 內容語氣：中文為主，少量英文作為收藏感或旅行感點綴，例如 `View Log →`、`5 Days Trip`。

## 字體與排版

- 全站使用 Google Fonts `Zen Maru Gothic`。
- 字重偏重：標題通常用 `800` 或 `900`，內文用 `500` 或 `700`。
- 字體大小大致維持：
  - 首頁 H1：`2.5rem`
  - 旅程頁主標：`2.2rem`
  - 旅程頁日期膠囊：`1rem`
  - 行程日標：`1.3rem`
  - 行程卡標題：`1.25rem`
  - 內文描述：`0.95rem` 到 `1rem`，行高約 `1.6`
- 中文標題常使用 `・` 分隔目的地與主題，例如 `東京河口湖・春櫻日和`。

## 首頁風格

首頁是旅行收藏牆。

- 背景：溫暖米白 `#fdfbf7`，搭配固定圓點背景。
- 頁首：置中 avatar `M`、大標題、雙語 subtitle。
- 卡片容器：`grid`，`repeat(auto-fit, minmax(300px, 1fr))`，最大寬度約 `1000px`。
- 旅行卡片：
  - 白底、`20px` 圓角、輕陰影。
  - hover 時上浮 `translateY(-10px)`，陰影加深。
  - 上半部是目的地漸層封面，高度約 `180px`。
  - 封面中央放一個大型 emoji，hover 時放大並旋轉。
- 每張卡片應包含：
  - `trip-year`：月份、年份、季節，例如 `Dec 2025 • Winter`
  - `trip-date`：完整起訖日期，格式統一為 `YYYY.MM.DD — MM.DD`，例如 `2026.06.19 — 06.23`
  - `trip-title`：目的地主題名
  - `trip-desc`：一段 1 到 2 句的旅程摘要
  - footer：天數與 `View Log →`
- `trip-date` 放在 `trip-year` 與 `trip-title` 之間，使用小型淺色日期貼紙樣式；不可比標題醒目，也不要讓日期改變卡片主要視覺層級。

## 旅程頁風格

旅程頁是行程手帳。

- 每個旅程頁都應是單一 HTML 檔，內含 CSS 與資料渲染 JS。
- 背景使用該旅程主題色漸層，通常是：
  - `var(--c-bg-top)` 到白色，再到 `var(--c-bg-bot)`
- 主要內容容器：
  - `.container`
  - 最大寬度約 `800px`
  - 左右 padding 約 `20px`
  - 內容層級高於背景特效
- 頁首：
  - `.main-title` 使用 emoji + 旅程名稱
  - `.sub-title` 是白底膠囊，帶陰影與輕微旋轉
- 左上角保留 `.home-btn` 回首頁。
- 底部固定 `.navbar`，寬度約 `92%`、最大 `420px`，白底半透明、圓形膠囊、含四個入口：
  - 行程
  - 清單
  - 叮嚀
  - TOP

## 顏色系統

每個旅程頁都要在 `:root` 定義自己的主題變數：

```css
:root {
    --c-bg-top: #...;
    --c-bg-bot: #...;
    --c-primary: #...;
    --c-food: #...;
    --c-spot: #...;
    --c-move: #...;
    --c-shop: #...;
    --c-hotel: #...;
    --shadow-card: 5px 5px 0px rgba(...);
    --font-main: 'Zen Maru Gothic', sans-serif;
}
```

分類色固定語意：

- `food` / `.c-food`：美食
- `spot` / `.c-spot`：景點與活動
- `move` / `.c-move`：交通與移動
- `shop` / `.c-shop`：購物
- `hotel` / `.c-hotel`：住宿、check-in、休息

新增目的地時，請用該地特色建立色票，例如櫻花粉、海島藍、泰奶橘、冰雪藍、法式黃。整體要柔和，不要改成商務、極簡、黑白或科技風。

## 卡片與元件

共通元件風格：

- 白底卡片為主。
- 圓角常用 `15px`、`18px`、`20px`、`24px`。
- 旅程頁卡片陰影偏手帳感，常用 `5px 5px 0px rgba(...)`。
- 分隔線常用 dashed，例如天氣卡底線、卡片 footer、時間軸線。
- 小標籤常帶 `transform: rotate(-1deg)` 或 `rotate(-2deg)`。

行程卡片：

- `.timeline-container` 左側有粗 dashed 時間軸。
- `.timeline-card` 是白底圓角卡，左側用 `::before` 做時間點圓點。
- 卡片點擊打開 modal。
- 時間拆成大字小時與分鐘，例如 `10`、`:00`。
- 卡片右上或角落可放 emoji stickers，使用 `.sticker-box`、`.sticker`、`.s-pos-*`。
- 有重點時使用 `.t-note-mini`，以 `📝` 開頭。

天氣卡：

- 每天一張 `.weather-card`，放在 day title 下、時間軸前。
- 包含高低溫、體感、天氣描述、日出日落。
- 天氣 icon 使用 emoji。

清單與叮嚀：

- 行李清單使用 `.checklist-wrapper` grid。
- 每個分類是 `.cl-category` 白卡，頂部用主題色 border。
- checklist 點擊後用 `localStorage` 記住狀態，顯示 `✅` / `⬜`。
- 叮嚀區使用 `.tips-section`，標題置中，內文每項用主題 emoji 作為 bullet。

## 背景特效與裝飾

每個旅程頁可有一種與目的地相關的輕量背景特效：

- 東京：櫻花
- 宮古島：泡泡
- 泰國：花朵
- 越南：葉子
- 北海道：雪花

規則：

- 特效容器固定全螢幕，`pointer-events: none`。
- 特效只能當背景氛圍，不要遮擋行程卡、按鈕或文字。
- 數量要節制，避免影響手機效能。

## 資料結構

旅程頁核心資料統一放在 `window.travelPageData`。每頁仍可保留自己的 `itineraryDB` 與 `checklistData`，但最後要組成共用 JS 會讀取的資料介面：

```js
window.travelPageData = {
    storageKey: "tokyo2026",
    mapRegion: "東京",
    flights: [
        {
            direction: "去程",
            date: "2026-04-03",
            flightNo: "IT216",
            depart: { airport: "TPE", terminal: "T1", time: "00:10" },
            arrive: { airport: "HND", terminal: "T3", time: "04:25" },
            note: "航廈依官方資料確認"
        }
    ],
    days: [
        {
            date: "Day 1 (04/03 五)",
            location: "羽田・藤澤・江之島",
            summary: "清晨抵達羽田，前往藤澤放行李，白天走江之島，晚上入住休息。",
            weather: { high: "17°", low: "7°", feel: "16° / 4°", icon: "☁️", desc: "陰天", sun: "05:26 / 18:04" },
            events: []
        }
    ],
    checklist: checklistData,
    tips: []
};
```

每日資料至少包含：

```js
{
    date: "Day 1 (12/19 五)",
    location: "抵達芭達雅",
    summary: "抵達曼谷後轉往芭達雅，晚上走 Terminal 21 與海灘周邊。",
    weather: {
        high: "32°",
        low: "24°",
        feel: "34°",
        icon: "☀️",
        desc: "晴朗",
        sun: "06:30 / 17:50"
    },
    events: [
        {
            time: "09:00",
            type: "move",
            title: "CI833 出發",
            desc: "台北 → 曼谷 BKK。",
            note: "可選，沒有就省略",
            stickers: ["✈️", "🇹🇭"],
            mapLink: "可選，特殊地點搜尋字串"
        }
    ]
}
```

新增航班時使用 `flights`：

```js
{
    direction: "去程",
    date: "2026-04-03",
    flightNo: "IT216",
    depart: { airport: "TPE", terminal: "T1", time: "00:10" },
    arrive: { airport: "HND", terminal: "T3", time: "04:25" },
    note: "航廈依官方資料確認"
}
```

航廈要查官方或可信來源；查不到就寫「出發前確認」，不要猜。

舊版 `itineraryDB` 事件格式仍維持：

```js
const itineraryDB = [
    {
        date: "Day 1 (12/19 五)",
        location: "抵達芭達雅",
        weather: {
            high: "32°",
            low: "24°",
            feel: "34°",
            icon: "☀️",
            desc: "晴朗",
            sun: "06:30 / 17:50"
        },
        events: [
            {
                time: "09:00",
                type: "move",
                title: "CI833 出發",
                desc: "台北 → 曼谷 BKK。",
                note: "可選，沒有就省略",
                stickers: ["✈️", "🇹🇭"],
                mapLink: "可選，特殊地點搜尋字串"
            }
        ]
    }
];
```

`checklistData` 使用物件，key 是分類標題，value 是項目陣列：

```js
const checklistData = {
    "📂 文件與簽證": ["護照", "簽證", "機票/飯店憑證"],
    "🔌 電子用品": ["手機", "行動電源", "充電器"]
};
```

新增事件時，`type` 優先使用既有五類：`food`、`spot`、`move`、`shop`、`hotel`。不要隨意新增 type，除非同時補上 CSS 分類色。

分類 icon 由 `travel-page.js` 依照 `type` 自動補：

- `food`：🍜
- `spot`：📍
- `move`：🚃；如果事件像航班，優先顯示 ✈️
- `shop`：🛍️
- `hotel`：🏨

## 共用檔案規則

所有旅程頁都要引用：

```html
<link rel="stylesheet" href="travel-style.css">
<script src="travel-page.js"></script>
```

每個旅程 HTML 只保留自己的主題色、背景特效、頁首標題、副標與 `window.travelPageData`。行程渲染、航班卡、每日折疊、天氣卡、清單、modal、Google Maps 都交給共用 JS。

每日區塊預設全部折疊。折疊狀態要看得到日期、地點、天氣簡短資訊與 `summary`；點擊 day title 或 summary 卡才展開完整天氣卡與時間軸。

## 文案規則

- 首頁摘要要像旅行明信片，短、具體、有畫面。
- 旅程頁行程描述要實用但輕鬆，例如交通方式、已預約狀態、吃什麼、要注意什麼。
- 標題可以帶 emoji，但不要每個短句都塞滿 emoji。
- 日期、航班、飯店等公開資訊要清楚保留。
- 不公開訂位代碼、定位代碼、預約單號、活動憑證號、餐廳訂位代碼。需要保留狀態時改寫成「已預約」、「憑證請看私人文件」。
- 中文標點使用全形標點；英文短語保留原本英文風格。

## 新增旅程檢查清單

新增一趟旅程時，至少要做：

1. 新增旅程 HTML 檔，檔名維持 `YYYY-Destination.html`。
2. 在首頁新增一張 `.trip-card`，設定封面漸層、emoji、年份季節、完整起訖日期、標題、摘要、天數。
3. 在旅程頁設定 `:root` 主題色與分類色。
4. 建立與目的地相關的背景特效或裝飾。
5. 填入 `itineraryDB`、每日天氣、每日 summary、每日事件。
6. 填入 `flights`，並查補航廈；查不到標成「出發前確認」。
7. 填入 `checklistData`，最後組成 `window.travelPageData`。
8. 掃描並移除公開訂位、預約、定位代碼。
9. 保留回首頁按鈕、底部導覽、modal、Google Maps 導航。
10. 用手機寬度檢查底部導覽、卡片、modal、長文字沒有互相遮擋。

## 不要偏離的方向

- 不要改成正式商務網站或一般部落格版型。
- 不要移除 emoji、貼圖、圓角、手帳陰影，這些是網站辨識度。
- 不要讓首頁變成行銷 landing page；首頁要維持旅行收藏入口。
- 不要把旅程頁拆成複雜框架，現有設計是單檔 HTML、簡單可部署到 GitHub Pages。
- 不要新增會阻礙 GitHub Pages 靜態部署的後端依賴。
