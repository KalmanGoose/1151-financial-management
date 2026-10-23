/**
 * 115-1 財務管理 全站交互核心邏輯 app.js
 */


 /* 導航切換邏輯 */
 function switchSection(el, targetId) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.dropdown-sub-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(e => e.classList.remove('active'));
  
  if (typeof el === 'string') el = document.getElementById(el);
  if (el) {
   el.classList.add('active');
   if (el.scrollIntoView && window.innerWidth <= 768) {
    el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
   }
  }
  const sec = document.getElementById('sec-' + targetId);
  if (sec) sec.classList.add('active');

  // 切換後自動平滑置頂
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const main = document.getElementById('main');
  if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
 }

 function toggleHwDropdown() {
  const menu = document.getElementById('hw-dropdown-menu');
  const arrow = document.getElementById('hw-arrow');
  menu.classList.toggle('show');
  arrow.classList.toggle('open');
 }

 function switchHw(hwId) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.dropdown-sub-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(e => e.classList.remove('active'));

  const subItem = document.getElementById('sub-' + hwId);
  if (subItem) {
   subItem.classList.add('active');
   if (subItem.scrollIntoView && window.innerWidth <= 768) {
    subItem.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
   }
  }
  const parent = document.getElementById('nav-hw-parent');
  if (parent) parent.classList.add('active');
  
  const sec = document.getElementById('sec-' + hwId);
  if (sec) sec.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  const main = document.getElementById('main');
  if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
 }

 function toggleHomeHw(id) {
  const el = document.getElementById(id);
  if (el) el.open = !el.open;
 }

 function switchHwMobile(hwId) {
  if(!hwId) return;
  if (hwId.startsWith('http')) {
   window.open(hwId, '_blank');
   return;
  }
  if (hwId.endsWith('.html')) {
   window.location.href = hwId;
   return;
  }
  if (hwId === 'md-viewer') {
   switchSection(document.getElementById('nav-md-viewer'), 'md-viewer');
  } else {
   switchHw(hwId);
  }
 }

 function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
 }

 function showSafariModal() {
  document.getElementById('safari-modal').style.display = 'flex';
 }
 function closeSafariModal(e) {
  document.getElementById('safari-modal').style.display = 'none';
 }

 
 /* ================= 原始 Markdown 檢視器邏輯 (極簡原生 DOM 讀取) ================= */
 let currentMdKey = "hw1_collab";

 function loadMarkdownDoc(key) {
  currentMdKey = key;
  document.querySelectorAll('[id^="btn-md-"]').forEach(b => b.classList.remove("btn-primary"));
  const btnMap = { hw1_collab: "btn-md-1", hw1_case: "btn-md-2", academic_agent: "btn-md-3", template: "btn-md-4", ethan_sub: "btn-md-5", hw2_collab: "btn-md-6", hw2_req: "btn-md-7" };
  if (btnMap[key]) {
   const activeBtn = document.getElementById(btnMap[key]);
   if (activeBtn) activeBtn.classList.add("btn-primary");
  }

  const el = document.getElementById("raw-md-" + key);
  if (el) {
   document.getElementById("md-current-title").textContent = el.getAttribute("data-title") || key;
   document.getElementById("md-raw-display").textContent = el.textContent.trim();
  }
 }

 function copyCurrentMarkdown() {
  const text = document.getElementById("md-raw-display").textContent;
  if (text) {
   navigator.clipboard.writeText(text).then(function() {
    showToast("已複製整份 Markdown 原始碼！");
   }).catch(function() {
    showToast("複製失敗，請手動選取複製");
   });
  }
 }

 /* ================= Google 試算表雲端同步 API 接口 ================= */
 const DEFAULT_SHEET_API = "https://script.google.com/macros/s/AKfycbyLcfuYO0BpeuklBvKeYP_w1ypVv8UqTjcwEQapsOnfkdP3bYcStxRlTsWs-x_C3Flr7w/exec";
 let googleSheetApiUrl = localStorage.getItem('gsheet_api_url') || DEFAULT_SHEET_API;

 function promptSheetApi() {
  const url = prompt("已內建預設 Google 試算表 Webhook。如需替換請輸入新網址：", googleSheetApiUrl);
  if (url !== null) {
   googleSheetApiUrl = url.trim() || DEFAULT_SHEET_API;
   localStorage.setItem('gsheet_api_url', googleSheetApiUrl);
   updateSyncStatus();
  }
 }

 function updateSyncStatus() {
  const el = document.getElementById('sync-status');
  if (googleSheetApiUrl) {
   el.innerHTML = `<span style="color:#15803d;"><span class="pulse-dot"></span> 已連線小組 Google 試算表（即時秒級推播）</span>`;
  } else {
   el.innerHTML = `<span>本地離線保存中</span>`;
  }
 }

 // 高速背景推播函數（非同步零等待）
 function postToSheet(payload) {
  if (!googleSheetApiUrl) return;
  try {
   // 優先使用 sendBeacon（極速無阻斷、關閉頁面也能送達），若不支援則用 fetch
   const blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=utf-8" });
   if (navigator.sendBeacon) {
    navigator.sendBeacon(googleSheetApiUrl, blob);
   } else {
    fetch(googleSheetApiUrl, {
     method: "POST",
     mode: "no-cors",
     body: blob
    });
   }
  } catch (e) {
   console.warn("Sheet sync error:", e);
  }
 }

 let lastSyncHash = "";

 // 智慧無感同步（支援背景靜默拉取）
 async function syncFromCloud(silent = true) {
  if (!silent) showToast("正在檢查雲端更新...");
  try {
   const res = await fetch(googleSheetApiUrl + "?action=read&t=" + Date.now(), { method: "GET", cache: "no-store" });
   if (res.ok) {
    const data = await res.json();
    const curHash = JSON.stringify(data);
    if (curHash !== lastSyncHash) {
     lastSyncHash = curHash;
     // 1. 完全與雲端試算表對齊認領狀態（若雲端已被刪除，本地立刻解除認領）
     const claims = (data && data.claims) ? data.claims : {};
     ["role-1", "role-2", "role-3", "role-4"].forEach(roleId => {
      if (claims[roleId]) {
       localStorage.setItem("claim_" + roleId, claims[roleId]);
      } else {
       localStorage.removeItem("claim_" + roleId);
      }
     });
     updateClaimUI();

     // 2. 完全與雲端試算表對齊留言清單（若雲端被清空，本地立刻清空動態牆）
     const thoughts = (data && data.thoughts) ? data.thoughts : [];
     localStorage.setItem("my_saved_thoughts", JSON.stringify(thoughts));
     renderThoughts();
  if (!silent) showToast(" 已同步最新小組討論進度！");
    }
   }
  } catch(e) {
   if (!silent) showToast("已切換為本地快照模式");
  }
 }

 // 智慧節能輪詢控制器 (Smart Visibility Poller)
 let pollTimer = null;
 function startSmartPolling() {
  // 立即靜默拉取一次
  syncFromCloud(true);
  // 僅在視窗活躍時，每 15 秒輕量檢查一次（只傳數百位元組，完全不耗電與效能）
  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
   if (document.visibilityState === "visible") {
    syncFromCloud(true);
   }
  }, 15000);
 }

 // 當使用者在手機鎖定螢幕或切換 App 時完全停止；切回網頁時瞬間刷新
 document.addEventListener("visibilitychange", () => {
  const indicator = document.getElementById("live-indicator");
  if (document.visibilityState === "visible") {
   if (indicator) indicator.innerHTML = '<span class="pulse-dot"></span> 即時連線中';
   syncFromCloud(true);
  } else {
   if (indicator) indicator.innerHTML = " 休眠省電中";
  }
 });

 /* 自由認領看板邏輯 */
 async function saveClaim(roleId) {
  const nameInput = document.getElementById('name-' + roleId);
  const name = nameInput.value.trim();
  if(!name) { alert("請輸入組員名字！"); return; }
  
  localStorage.setItem('claim_' + roleId, name);
  updateClaimUI();
  showToast("登記成功：" + name);

  postToSheet({ type: "claim", role: roleId, name: name, time: new Date().toLocaleString() });
 }

 function updateClaimUI() {
  let claimedCount = 0;
  ['role-1', 'role-2', 'role-3', 'role-4'].forEach(id => {
   const saved = localStorage.getItem('claim_' + id);
   const card = document.getElementById('card-' + id);
   const input = document.getElementById('name-' + id);
   const label = document.getElementById('label-' + id);
   if (saved) {
    claimedCount++;
    input.value = saved;
    if (card) card.classList.add('claimed');
    if (label) {
     label.innerText = `已由 ${saved} 認領`;
     label.style.display = 'inline-block';
    }
   } else {
    if (input) input.value = "";
    if (card) card.classList.remove('claimed');
    if (label) {
     label.innerText = "";
     label.style.display = 'none';
    }
   }
  });

  const summaryBadge = document.getElementById('claim-summary-badge');
  if (summaryBadge) {
   summaryBadge.textContent = `已認領 ${claimedCount} / 4 視角`;
   if (claimedCount === 4) {
    summaryBadge.style.background = "#dcfce7";
    summaryBadge.style.color = "#15803d";
   } else if (claimedCount > 0) {
    summaryBadge.style.background = "#e0e7ff";
    summaryBadge.style.color = "#3730a3";
   } else {
    summaryBadge.style.background = "#f1f5f9";
    summaryBadge.style.color = "#64748b";
   }
  }
 }

 /* 個人觀點留言與保存邏輯 */
 function saveMyThought() {
  const name = document.getElementById('my-name').value.trim();
  const topic = document.getElementById('my-topic').value;
  const thought = document.getElementById('my-thought').value.trim();
  if(!name || !thought) { alert("請填寫名字與觀點內容！"); return; }
  
  const record = { name, topic, thought, time: new Date().toLocaleString() };
  const list = JSON.parse(localStorage.getItem('my_saved_thoughts') || '[]');
  list.unshift(record);
  localStorage.setItem('my_saved_thoughts', JSON.stringify(list));
  renderThoughts();
  showToast("觀點草稿已保存！");

  postToSheet({ type: "thought", ...record });
 }

 function renderThoughts() {
  const list = JSON.parse(localStorage.getItem('my_saved_thoughts') || '[]');
  
  // 渲染 HW1 頁面內部清單
  const container = document.getElementById('saved-thoughts-list');
  if (container) {
   if (!list.length) {
    container.innerHTML = '<p style="font-size:13px; color:#475569;">尚無觀點紀錄，組員可在上方輸入後點擊保存！</p>';
   } else {
    container.innerHTML = '<h4 style="margin: 10px 0 6px 0;">已保存的觀點筆記：</h4>' + list.map(item => `
     <div style="background: white; border: 1px solid var(--border); border-radius: 6px; padding: 10px; margin-bottom: 8px;">
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
       <b>${item.name} (${item.topic || '觀點'})</b> <span>${item.time}</span>
      </div>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${item.thought}</p>
     </div>
    `).join('');
   }
  }

  // 渲染首頁「即時小組討論與觀點動態牆」
  const homeStream = document.getElementById('home-thoughts-stream');
  if (homeStream) {
   if (!list.length) {
    homeStream.innerHTML = '<p style="font-size:13px; color:#475569; text-align:center; padding:12px;">目前小組尚無留言，歡迎組員前往 HW1 頁面寫下心得觀點！</p>';
   } else {
    homeStream.innerHTML = list.map(item => `
     <div style="background: #f8fafc; border: 1px solid var(--border); border-left: 4px solid var(--primary-light); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom: 6px;">
       <div>
        <b style="color:var(--primary); font-size:14px;">${item.name}</b>
        <span class="badge" style="margin-left: 6px;">${item.topic || '觀點分享'}</span>
       </div>
       <span style="color:var(--text-muted);">${item.time}</span>
      </div>
      <div style="font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${item.thought}</div>
     </div>
    `).join('');
   }
  }
 }

 function copyThought() {
  const thought = document.getElementById('my-thought').value.trim();
  if(!thought) { alert("內容為空！"); return; }
  navigator.clipboard.writeText(thought).then(() => showToast("已複製草稿到剪貼簿！"));
 }

 /* ================= WebLLM 引擎：固定 Gemma 4-E2B ================= */
 async function clearLLMCache() {
  try {
   const dbs = await window.indexedDB.databases();
   for (const db of dbs) {
    if (db.name.includes("webllm") || db.name.includes("mlc")) {
     window.indexedDB.deleteDatabase(db.name);
    }
   }
   if ("caches" in window) {
    const keys = await caches.keys();
    for (const k of keys) {
     if (k.includes("webllm") || k.includes("mlc")) {
      await caches.delete(k);
     }
    }
   }
   showToast("已修復並清除快取！正在重新載入...");
   setTimeout(() => initGemma(), 500);
  } catch(e) {
   alert("請手動開啟瀏覽器無痕視窗或清除瀏覽紀錄再試！");
  }
 }

 let engine = null;
 // 手機端 (iPhone / Android Phone) 判定
 const isMobilePhone = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
 const fixedModel = "gemma-2-2b-it-q4f16_1-MLC";

 // 財管專屬 RAG 系統提示詞（System Prompt），注入繁中規範與日矽案知識庫
 const FINANCE_SYSTEM_PROMPT = `你是一位專業且極具耐心的「115-1 財務管理課程 AI 助教」。
【核心規範】：
1. 一律使用「繁體中文（台灣慣用語）」回答，語氣專業、生動、親切且易懂。
2. 你的核心任務是：把晦澀難懂的財務管理理論或商業個案資料「翻譯成大一/大二學生聽得懂的人話」，並引導學生撰寫深入的批判性作業心得。

【已內建背景知識庫 (HW1 日月光併購矽品案)】：
- 收購方：日月光（全球第1，市佔18~19%），董事長張虔生，董監持股集中。
- 目標方：矽品（全球第3，市佔9~10%），董事長林文伯，董監持股<5%，外資佔比近60%。
- 歷程：2015年日月光以每股45元(溢價34%)發動非合意收購取得24.99%；矽品反制先找鴻海換股增資被外資否決，後找紫光568億私募引發國安爭議破局；2016破冰會談；2018成立「日月光投資控股(3711.TW)」以兄弟平行控股模式各持獨立地位。
- 課本四大功能對照：
 1. 資金投資：買現成產能勝過自行重複投資高階封裝機台。
 2. 資金募集：銀行聯貸與控股換股平衡槓桿；矽品想增資被外資痛批稀釋每股價值。
 3. 資金管理：停止自殘式殺價與放寬賒帳帳期，機台互相支援改善現金流。
 4. 股利分配：矽品高配息吸引60%外資，但在敵意收購時外資以利益為先倒戈挺日月光。
- 代理問題：經理人持股過低(<5%)，為了保衛自身經營權而阻擋對股東有利的高溢價收購，損害全體股東利益。

請依據學生的提問，以繁體中文深入淺出地解答。`;

 async function initGemma() {
  const statusText = document.getElementById('llm-status');
  const loadBtn = document.getElementById('load-btn');
  const progressBg = document.getElementById('progress-bar-bg');
  const progressBar = document.getElementById('progress-bar');
  
  if (isMobilePhone) {
   alert(" 抱歉！因手機硬體限制，AI 助教大模型僅支援在電腦（Mac/PC）或 iPad 平板設備上執行！");
   return;
  }

  if (!navigator.gpu) {
   const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
   if (isSafari) {
    showSafariModal();
    statusText.innerText = " Safari 尚未開啟 WebGPU 功能，請點擊「Safari 開啟教學」或改用 Chrome。";
   } else {
    statusText.innerText = " 裝置/瀏覽器不支援 WebGPU。建議使用 Google Chrome 最新版本。";
   }
   statusText.style.color = "#dc2626";
   return;
  }

  try {
   loadBtn.disabled = true;
   loadBtn.innerText = "正在連線 AI 引擎模組...";
   progressBg.style.display = "block";
   statusText.innerText = "正在載入 WebLLM 執行環境...";

   // 動態載入 WebLLM 模組，避免競態未就緒問題
   const webllm = window.webllm || await import("https://esm.run/@mlc-ai/web-llm@0.2.82");
   window.webllm = webllm;

   loadBtn.innerText = "正在載入 Gemma 4-E2B 助教權重（首次下載寫入快取）...";

   const initProgressCallback = (report) => {
    statusText.innerText = report.text;
    const match = report.text.match(/(\d+)%/);
    if (match) progressBar.style.width = match[1] + "%";
   };

   // 使用 WebLLM 官方 0.2.82 內建精準匹配之 prebuiltAppConfig (避免 WASM 符號未定義 LinkError)
   engine = await webllm.CreateMLCEngine(fixedModel, {
    initProgressCallback: initProgressCallback
   });

   statusText.innerText = " Google Gemma 4-E2B 財管助教已成功掛載！下次秒開零流量。";
   statusText.style.color = "#15803d";
   loadBtn.style.display = "none";
   document.getElementById('user-input').disabled = false;
   document.getElementById('send-btn').disabled = false;
  } catch (err) {
   console.error(err);
   if (err.message && err.message.includes("exit(1)")) {
    statusText.innerHTML = `<span style="color:#dc2626;"> 載入異常 (exit 1)：先前的下載可能不完整中斷導致快取損壞。</span>
    <button class="btn" style="margin-top:6px; font-size:12px; padding:4px 8px;" onclick="clearLLMCache()">️ 一鍵修復：清除損壞快取並重試</button>`;
   } else {
    statusText.innerHTML = `<span style="color:#dc2626;">載入失敗：${err.message}</span>
    <div style="font-size:12px; color:#64748b; margin-top:4px;"> 若為 Hugging Face 網路暫時連線異常，請再點擊一次重試，或點擊右下方按鈕修復快取。</div>
    <button class="btn" style="margin-top:6px; font-size:12px; padding:4px 8px;" onclick="clearLLMCache()">️ 清除快取並重試</button>`;
   }
   loadBtn.disabled = false;
   loadBtn.innerText = " 重新啟動 Gemma 4-E2B 助教";
  }
 }

 function quickPrompt(text) {
  const input = document.getElementById("user-input");
  input.value = text;
  if (engine) {
   sendMessage();
  } else {
   showToast("請先點擊上方按鈕啟動 Gemma 助教！");
  }
 }

 async function sendMessage() {
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const prompt = input.value.trim();
  if (!prompt || !engine) return;

  chatBox.innerHTML += `<div class="chat-msg msg-user">${prompt}</div>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  const aiMsgDiv = document.createElement('div');
  aiMsgDiv.className = 'chat-msg msg-ai';
  aiMsgDiv.innerText = "Gemma 助教思考中...";
  chatBox.appendChild(aiMsgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
   const chunks = await engine.chat.completions.create({
    messages: [
     { role: "system", content: FINANCE_SYSTEM_PROMPT },
     { role: "user", content: prompt }
    ],
    temperature: 0.6,
    stream: true
   });

   aiMsgDiv.innerText = "";
   for await (const chunk of chunks) {
    const content = chunk.choices[0]?.delta?.content || "";
    aiMsgDiv.innerText += content;
    chatBox.scrollTop = chatBox.scrollHeight;
   }
  } catch (err) {
   aiMsgDiv.innerText = "生成錯誤：" + err.message;
  }
 }

 window.onload = function() {
  updateSyncStatus();
  updateClaimUI();
  renderThoughts();
  loadMarkdownDoc('hw1_collab');
  

  // 裝置硬體狀態判定
  if (isMobilePhone) {
   const warnCard = document.getElementById("mobile-warning-card");
   if (warnCard) warnCard.style.display = "block";
   const deskContainer = document.getElementById("desktop-ai-container");
   if (deskContainer) deskContainer.style.opacity = "0.6";
   const loadBtn = document.getElementById("load-btn");
   if (loadBtn) {
    loadBtn.disabled = true;
    loadBtn.innerText = " 手機硬體受限，請使用電腦或 iPad 開啟";
   }
   const statusEl = document.getElementById("llm-status");
   if (statusEl) statusEl.innerText = "狀態：手機端受限（請使用電腦 / iPad）";
  }
 };



 // iLearning 3.0 即時作業同步邏輯
 async function fetchIlearningHomeworks() {
  const container = document.getElementById('ilearning-hw-container');
  const timeElem = document.getElementById('ilearning-sync-time');
  if (!container) return;
  try {
   const res = await fetch('homework_status.json?t=' + Date.now());
   if (!res.ok) throw new Error('尚未產生作業資料檔');
   const data = await res.json();
   if (timeElem) timeElem.innerHTML = `最後同步時間：<b style="color:#0f172a;">${data.last_sync_time || '剛剛'}</b> ｜ 尚有 <b style="color:#dc2626;">${data.pending_count || 0}</b> 份待繳作業`;
   
   if (!data.homeworks || data.homeworks.length === 0) {
    container.innerHTML = '<div style="color:#64748b; font-size:13px;">目前無任何作業紀錄。</div>';
    return;
   }
   
   let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
   data.homeworks.forEach(hw => {
    const isPending = !hw.submitted;
    const borderStyle = isPending ? 'border: 1px solid #fecaca; background: #fef2f2;' : 'border: 1px solid #e2e8f0; background: #f8fafc;';
    const badge = isPending 
     ? '<span style="background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">️ 待繳交</span>'
     : '<span style="background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;"> 已繳交</span>';
    
    html += `
     <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 6px; ${borderStyle} flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 10px;">
       <span style="font-weight: 800; font-size: 14px; color: #475569; min-width: 24px;">#${hw.index}</span>
       <div>
        <div style="font-weight: 700; font-size: 14px; color: #1e293b;">${hw.name}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
         開放：${hw.open_date} ｜ <b>截止期限：${hw.due_date}</b>
        </div>
       </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
       ${badge}
       ${hw.url ? `<a href="${hw.url}" target="_blank" style="padding: 5px 12px; font-size: 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; color: #1e293b; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">直達作業 </a>` : ''}
      </div>
     </div>
    `;
   });
   html += '</div>';
   container.innerHTML = html;
  } catch (err) {
   if (timeElem) timeElem.innerText = '等待 Agent 巡邏產生 homework_status.json';
   container.innerHTML = `
    <div style="padding: 10px 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 13px; color: #64748b;">
      提示：在 node1 執行 <code>python3 ilearning_bot.py</code> 巡邏後，此處將自動列出最新作業與截止倒數！
    </div>
   `;
  }
 }

 document.addEventListener('DOMContentLoaded', () => {
  fetchIlearningHomeworks();
 });
