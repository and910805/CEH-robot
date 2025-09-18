/* LINE Quiz Bot + Google Forms Integration (Template Version)
 * 注意：請建立 config.js 並填入自己的 Token 與 Sheet ID
 *
 * config.js 範例：
 * const CONFIG = {
 *   CHANNEL_ACCESS_TOKEN: "<YOUR_LINE_CHANNEL_ACCESS_TOKEN>",
 *   SS_ID: "<YOUR_GOOGLE_SHEET_ID>"
 * };
 */

// ====== 設定 ======
const CHANNEL_ACCESS_TOKEN = CONFIG.CHANNEL_ACCESS_TOKEN;
const SS_ID = CONFIG.SS_ID;
const LETTERS = ['A', 'B', 'C', 'D'];

// ====== Webhook POST ======
function doPost(e) {
  const events = JSON.parse(e.postData.contents).events;
  events.forEach(handleEvent);
  return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
}

// ====== 事件分發 ======
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;
  const txt = event.message.text.trim();
  const token = event.replyToken;
  const props = PropertiesService.getUserProperties();
  const buildMode = props.getProperty('BUILD_MODE') === '1';
  const userId = event.source.userId;

  switch (txt) {
    case '開始':
      props.setProperty('QUIZ_IDX', '1');
      props.deleteProperty('WRONGS');
      replyQuestion(token);
      break;

    case '下一題': {
      const currIdx = parseInt(props.getProperty('QUIZ_IDX') || '1', 10);
      props.setProperty('QUIZ_IDX', String(currIdx + 1));
      replyQuestion(token);
      break;
    }

    case '翻譯':
      replyTranslation(token);
      break;

    case '結束': {
      const idx = parseInt(props.getProperty('QUIZ_IDX') || '1', 10);
      const total = idx > 1 ? idx - 1 : 0;
      const wrongs = JSON.parse(props.getProperty('WRONGS') || '[]');
      props.deleteProperty('QUIZ_IDX');
      props.deleteProperty('WRONGS');
      replyText(token, `✅ 測驗結束！共答了 ${total} 題，錯了 ${wrongs.length} 題`);
      break;
    }

    case '回顧錯題': {
      const list = JSON.parse(props.getProperty('WRONGS') || '[]');
      if (!list.length) {
        replyText(token, '👍 沒有答錯過的題目！');
      } else {
        let msg = '❌ 以下為答錯題號與正解：\n';
        list.forEach(w => msg += `${w.qnum}：${w.correct}\n`);
        replyText(token, msg);
      }
      break;
    }

    case 'form':
    case 'test':
      props.setProperty('QUIZ_COUNT', '50');
      replyText(token, '📤 開始建立預設問卷（50 題）...');
      createAndSendForm(userId);
      break;

    case 'build':
      props.setProperty('BUILD_MODE', '1');
      replyText(token, '🔧 請輸入要建立的題數，例如 10、25、50');
      break;

    case '功能':
      replyText(token,
        '📘 功能選單：👇\n\n' +
        '🔹 開始：開始測驗\n' +
        '🔹 A / B / C / D：作答選項\n' +
        '🔹 下一題：跳到下一題\n' +
        '🔹 build：建立問卷（輸入題數）\n' +
        '🔹 form：預設 50 題問卷\n' +
        '🔹 回顧錯題：列出錯題與正解\n' +
        '🔹 結束：結束測驗，統計作答結果\n' +
        '🔹 翻譯：將題目翻譯為中文');
      break;

    default:
      if (/^[A-D]$/.test(txt)) {
        const res = checkAnswer(txt);
        replyText(token, res);
        replyQuestion(token);
      } else if (buildMode && /^\d+$/.test(txt)) {
        const count = parseInt(txt, 10);
        if (count < 1 || count > 100) {
          replyText(token, '⚠️ 請輸入 1 到 100 之間的數字');
          return;
        }
        props.setProperty('QUIZ_COUNT', count);
        props.deleteProperty('BUILD_MODE');
        replyText(token, `📤 開始建立問卷（${count} 題）...\n請稍候 ⏳`);
        createAndSendForm(userId);
      } else {
        replyText(token, '請輸入「開始」、「下一題」或 A/B/C/D 回答，輸入「功能」看指令列表');
      }
  }
}

// ====== 出題 ======
function replyQuestion(replyToken) {
  const idx = parseInt(PropertiesService.getUserProperties().getProperty('QUIZ_IDX') || '1', 10);
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('Sheet1');
  const row = sheet.getRange(idx + 1, 1, 1, 7).getValues()[0];
  const [qnum, question, c1, c2, c3, c4] = row;

  let text = `【${qnum}】\n${question}\n\n`;
  [c1, c2, c3, c4].forEach((c, i) => {
    if (c) text += `${LETTERS[i]}. ${c}\n`;
  });
  text += `\n💡 「翻譯」翻中文，「下一題」跳題，「功能」看指令`;

  const quick = LETTERS.map(L => ({
    type: 'action',
    action: { type: 'message', label: L, text: L }
  }));

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text, quickReply: { items: quick } }]
    })
  });
}

// ====== 檢查答案 ======
function checkAnswer(ans) {
  const props = PropertiesService.getUserProperties();
  const idx = parseInt(props.getProperty('QUIZ_IDX') || '1', 10) - 1;
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('Sheet1');
  const correct = sheet.getRange(idx + 2, 7).getValue().toString().trim().toUpperCase();
  const qnum = sheet.getRange(idx + 2, 1).getValue();

  if (ans !== correct) {
    const wrongs = JSON.parse(props.getProperty('WRONGS') || '[]');
    wrongs.push({ qnum, correct });
    props.setProperty('WRONGS', JSON.stringify(wrongs));
  }

  return ans === correct ? '✅ 回對了！' : `❌ 錯誤！正確答案：${correct}`;
}

// ====== 建立 Google Form ======
function createAndSendForm(userId) {
  try {
    const count = parseInt(PropertiesService.getUserProperties().getProperty('QUIZ_COUNT') || '50', 10);
    const all = SpreadsheetApp.openById(SS_ID).getSheetByName('Sheet1').getDataRange().getValues().slice(1);
    const valid = all.filter(r => {
      const cl = (r[6] || '').toString().trim().toUpperCase();
      return LETTERS.includes(cl) && r[1];
    });
    shuffleArray(valid);
    const pick = valid.slice(0, count);

    const form = FormApp.create(`LINE Quiz ${count} 題 - ${new Date().toISOString()}`);
    form.setDescription('LINE Bot 自動生成於 ' + new Date().toLocaleString());
    form.setIsQuiz(true);
    form.setShowLinkToRespondAgain(false);
    form.setPublishingSummary(true);

    form.setCollectEmail(false);
    form.setAllowResponseEdits(false);
    form.setShuffleQuestions(false);

    pick.forEach(r => {
      const [, q, c1, c2, c3, c4, raw] = r;
      const correct = raw.toString().trim().toUpperCase();
      const opts = [c1, c2, c3, c4].map(x => x.toString().trim()).filter(x => x);

      const item = form.addMultipleChoiceItem().setTitle(q).setRequired(true);
      const choices = opts.map((t, i) => item.createChoice(t, LETTERS[i] === correct));
      item.setChoices(shuffleArray(choices));
      item.setPoints(1);

      item.setFeedbackForCorrect(FormApp.createFeedback().setText('🎉 答對了！').build());
      item.setFeedbackForIncorrect(FormApp.createFeedback().setText(`❗ 錯誤！正確答案是：${correct}`).build());
    });

    const fillUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    pushText(userId, `📝 問卷已生成：\n填答連結：${fillUrl}\n編輯連結（自己用）：${editUrl}`);
  } catch (err) {
    Logger.log('製作問卷失敗：' + err);
    pushText(userId, `❌ 問卷生成失敗，請稍後再試\n\n錯誤訊息：${err}`);
  }
}

// ====== 洗牌 ======
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ====== 翻譯 ======
function replyTranslation(replyToken) {
  const idx = parseInt(PropertiesService.getUserProperties().getProperty('QUIZ_IDX') || '1', 10);
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('Sheet1');
  const row = sheet.getRange(idx + 1, 1, 1, 7).getValues()[0];
  const [qnum, question, c1, c2, c3, c4] = row;

  const translatedQ = LanguageApp.translate(question, 'en', 'zh-TW');
  const translatedChoices = [c1, c2, c3, c4].map(c => LanguageApp.translate(c, 'en', 'zh-TW'));

  let text = `📘 翻譯：\n【${qnum}】${translatedQ}\n\n`;
  translatedChoices.forEach((tc, i) => {
    text += `${LETTERS[i]}. ${tc}\n`;
  });
  text += `\n👉「下一題」繼續作答，「功能」查看全部指令`;

  replyText(replyToken, text);
}

// ====== LINE API 回覆 ======
function replyText(replyToken, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
    muteHttpExceptions: true
  });
}

function pushText(userId, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
    muteHttpExceptions: true
  });
}
