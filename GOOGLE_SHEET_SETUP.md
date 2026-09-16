# Google 試算表雲端同步設定指南（只要 2 分鐘！）

如果你希望四位組員在網頁上**「登記認領題目」**或**「保存觀點草稿」**時，所有內容能即時同步存入你的 Google 試算表，請照著這份超簡單步驟做：

---

### 第一步：在 Google Drive 建立一張試算表
1. 打開你的 Google Drive，新增一張空白的 **Google 試算表**（例如命名為：`1151財務管理小組資料收集`）。
2. 在第一列（Row 1）填入標題：
   - A1: `時間`
   - B1: `組員姓名`
   - C1: `操作類型 / 認領項目`
   - D1: `觀點草稿與內容`

---

### 第二步：貼上接收資料的小程式 (Apps Script)
1. 在該試算表上方選單點：**擴充功能 (Extensions)** -> **Apps Script**。
2. 把裡面的程式碼全部刪除，**完整貼上以下代碼**：

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var time = data.time || new Date().toLocaleString();
    var name = data.name || "";
    var topic = data.type === 'claim' ? ('認領：' + data.role) : (data.topic || '觀點分享');
    var content = data.thought || data.role || "";
    
    // 寫入試算表新的一列
    sheet.appendRow([time, name, topic, content]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "error": err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### 第三步：發布為網頁應用程式 (取得 Webhook 網址)
1. 點右上角藍色的 **部署 (Deploy)** -> **新增部署 (New deployment)**。
2. 左邊齒輪選 **網頁應用程式 (Web app)**：
   - 說明：`1151-sync`
   - 執行身分：**我 (Me)**
   - 誰可以存取：**所有人 (Anyone)** *(重要！這樣組員才能免登入直接傳送資料)*
3. 點擊 **部署**，如果跳出授權視窗，點選你的 Google 帳號並允許存取。
4. 部署完成後，會拿到一串 **網頁應用程式網址**（以 `https://script.google.com/macros/s/.../exec` 開頭）。

---

### 第四步：貼到我們的小組網頁就大功告成！
1. 打開你的小組網站：https://kalmangoose.github.io/1151-financial-management/
2. 在首頁上方綠色區塊點：**「⚙️ 設定 Google 試算表 Webhook」**。
3. 把剛剛複製的那串網址貼進去，按確定！
4. 狀態會立刻變成 **「🟢 已連接 Google 試算表 (即時雲端同步)」**！
5. 以後任何人在網頁登記或保存觀點，你的 Google 試算表就會「叮！」一聲即時新增一列！
