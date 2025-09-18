/* LINE Quiz Bot + Google Forms Integration (Template Version)
 * 注意：請建立 config.js 並填入自己的 Token 與 Sheet ID
 */

const CHANNEL_ACCESS_TOKEN = CONFIG.CHANNEL_ACCESS_TOKEN;
const SS_ID = CONFIG.SS_ID;

// 範例函式
function doPost(e) {
  return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
}
