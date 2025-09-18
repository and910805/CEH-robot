# 🤖 CEH-robot：LINE Quiz Bot (GAS + Google Sheet + Google Form)

<p align="left">
  <!-- 技術標籤 -->
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white&style=for-the-badge">
  <img src="https://img.shields.io/badge/LINE%20Bot-00C300?logo=line&logoColor=white&style=for-the-badge">
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?logo=googlesheets&logoColor=white&style=for-the-badge">
  <img src="https://img.shields.io/badge/Google%20Forms-673AB7?logo=googleforms&logoColor=white&style=for-the-badge">
  <!-- 授權 -->
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
</p>

這是一個範例專案，示範如何透過 **Google Apps Script (GAS)** 建立一個簡單的 LINE Quiz Bot。  
Bot 可以從 Google Sheet 題庫中出題、判斷答案，甚至自動建立 Google Form 測驗卷。  

> ⚠️ 注意：LINE Bot 平台（Messaging API）常常會有改版，建議你部署前先看 [LINE 官方文件](https://developers.line.biz/en/docs/messaging-api/) 以確保最新設定流程。

---

## 📂 專案結構

```text
line-quiz-bot/
├─ src/
│  ├─ main.gs             # Apps Script 主程式（Bot 主要邏輯）
│  └─ appsscript.json     # Apps Script 專案設定（授權 scope、時區等）
├─ config.example.js       # 範例設定檔（需自行複製為 config.js）
├─ .gitignore              # 忽略 config.js，避免洩漏金鑰
└─ README.md               # 專案說明文件
```

---

## 🔑 檔案用途

* **`src/main.gs`**
  Google Apps Script 的主要程式碼，包含：

  * 處理 LINE Webhook 事件
  * 出題與檢查答案
  * 建立 Google Form
  * 翻譯題目功能（使用 Google 內建翻譯）

* **`src/appsscript.json`**
  GAS 專案的設定檔，定義：

  * 所需的 OAuth 權限（spreadsheets、forms、drive、urlfetch…）
  * 專案執行的時區與環境版本

* **`config.example.js`**
  提供範例設定格式，請複製為 `config.js` 並填入：

  ```js
  const CONFIG = {
    CHANNEL_ACCESS_TOKEN: "<YOUR_LINE_CHANNEL_ACCESS_TOKEN>",
    SS_ID: "<YOUR_GOOGLE_SHEET_ID>"
  };
  ```

* **`.gitignore`**
  保護 `config.js` 不會被推上 GitHub，避免金鑰洩漏。

* **`README.md`**
  目前這份文件，說明專案用途與使用方式。

---

## 🚀 使用方式

1. **建立 LINE Bot**

   * 到 [LINE Developers Console](https://developers.line.biz/console/) 建立 Messaging API Channel
   * 取得 `Channel Access Token` 並填入 `config.js`

2. **建立 Google Sheet**

   * 新增試算表 → 工作表命名為 `Sheet1`

   * 欄位格式如下：

     | 題號 | 題目  | 選項A | 選項B | 選項C | 選項D | 正解 |
     | -- | --- | --- | --- | --- | --- | -- |
     | 1  | ... | ... | ... | ... | ... | A  |
     
    >如下面範例圖
    ><img width="1054" height="102" alt="image" src="https://github.com/user-attachments/assets/9f5f88fd-a9e8-4fea-a109-be46c3404519" />

   * 取得試算表 ID（網址 `/d/` 和 `/edit` 之間那段）

   * 填入 `config.js`

3. **部署 Apps Script**

   * 建立專案 → 貼上 `src/main.gs` 內容
   * 建立 `config.js` 並填入 Token & Sheet ID
   * 上傳 `appsscript.json`（或用 [clasp](https://github.com/google/clasp) 同步）
   * 執行一次，授權存取 Google Sheet、Form、Drive

4. **部署 Web App**

   * 選單：部署 → 新部署 → 類型「網頁應用程式」
   * 存取權限：任何擁有連結的人
   * 取得 URL，貼到 LINE Bot 的 Webhook

5. **開始使用**

   * 在 LINE 聊天視窗輸入：

     * `開始` → 開始測驗
     * `A/B/C/D` → 作答
     * `下一題` → 跳到下一題
     * `翻譯` → 題目翻譯成中文
     * `回顧錯題` → 查看錯題
     * `結束` → 統計答題數
     * `form` → 自動產生 Google Form（預設 50 題）
     * `build` → 輸入數字自訂題數的 Google Form

---

## ⚠️ 注意事項

* `config.js` 請勿提交到 GitHub
* Google Form 會越建越多，建議定期清理 Drive
* Google 翻譯 (`LanguageApp.translate`) 有流量限制
* LINE 平台功能可能隨時更新，**請以官方文件為準**

---

## 🤝 貢獻 (Contributing)

歡迎大家 fork 這個 repo，提交 Pull Request，一起改進功能或補充教學 🙌

* 如果發現 bug，請開 Issue
* 如果有新功能或優化，請直接發 PR

---

## 📄 授權

MIT License


