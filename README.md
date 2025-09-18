# LINE Quiz Bot (Template)

一個可自行部署的 LINE 刷題機器人範例。

## 使用方式
1. 建立 LINE Bot 並取得 Channel Access Token
2. 建立 Google Sheet 並填入題庫
3. 將 config.example.js 複製為 config.js，填入自己的 Token 與 Sheet ID
4. 部署 Google Apps Script 並綁定 LINE Webhook

## 注意
- `config.js` 不要提交到 GitHub，避免洩漏金鑰。
