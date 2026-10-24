/**
 * 115-1 財務管理 全站交互核心邏輯 app.js
 */

/* ================= 雙主題切換引擎 (Dual Theme Engine) ================= */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtnUI(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtnUI(next);
  showToast(next === 'dark' ? '已切換為：彭博終端深色模式' : '已切換為：經典商務淺色模式');
}

function updateThemeBtnUI(theme) {
  const btns = document.querySelectorAll('.theme-toggle-btn');
  btns.forEach(btn => {
    if (btn.classList.contains('mobile-icon-btn')) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    } else {
      btn.innerHTML = theme === 'dark' ? '☀️ 淺色模式' : '🌙 深色模式';
    }
  });
}

/* ================= 頂欄動態麵包屑導航 ================= */
const SECTION_TITLES = {
  'home': '首頁與協同看板',
  'hw1': 'HW1 日矽案史料庫',
  'hw2': 'HW2 財務比率分析 (成功公司20題)',
  'hw3': 'HW3 作業專區',
  'gemma-lab': 'AI 助教實驗室 (Gemma 4-E2B)',
  'md-viewer': '原始 Markdown 檢視器'
};

function updateBreadcrumbs(targetId) {
  const el = document.getElementById('topbar-breadcrumb-current');
  if (el && SECTION_TITLES[targetId]) {
    el.textContent = SECTION_TITLES[targetId];
  }
}

/* ================= 行動端專屬交互邏輯 ================= */
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function switchSectionFromDrawer(targetId) {
  closeMobileDrawer();
  const navEl = document.getElementById('nav-' + (targetId === 'gemma-lab' ? 'ai' : targetId));
  switchSection(navEl, targetId);
}

function switchHwFromDrawer(hwId) {
  closeMobileDrawer();
  switchHw(hwId);
}

function switchSectionMobileNav(el, targetId) {
  const navEl = document.getElementById('nav-' + (targetId === 'gemma-lab' ? 'ai' : targetId));
  switchSection(navEl, targetId);
}

function switchHwMobileNav(el, hwId) {
  switchHw(hwId);
}

function updateMobileNavState(id) {
  document.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.mobile-drawer .nav-item').forEach(item => item.classList.remove('active'));
  const mobItem = document.getElementById('mob-nav-' + id);
  if (mobItem) mobItem.classList.add('active');
  const drawerItem = document.getElementById('mob-drawer-' + id);
  if (drawerItem) drawerItem.classList.add('active');
}

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

  updateBreadcrumbs(targetId);
  updateMobileNavState(targetId);

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

  updateBreadcrumbs(hwId);
  updateMobileNavState(hwId);

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
  const topbarPill = document.getElementById('topbar-sync-pill');
  if (googleSheetApiUrl) {
   if (el) el.innerHTML = `<span style="color:var(--positive); font-weight:600;"><span class="pulse-dot"></span> 已連線小組 Google 試算表（即時秒級推播）</span>`;
   if (topbarPill) topbarPill.innerHTML = `<span class="pulse-dot"></span> 雲端連線中`;
  } else {
   if (el) el.innerHTML = `<span>本地離線保存中</span>`;
   if (topbarPill) topbarPill.innerHTML = `本地離線`;
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
  const progressBar = document.getElementById('claim-progress-bar');
  if (summaryBadge) {
   summaryBadge.textContent = `已認領 ${claimedCount} / 4 視角`;
   if (claimedCount === 4) {
    summaryBadge.style.background = "var(--positive-bg)";
    summaryBadge.style.color = "var(--positive-text)";
    summaryBadge.style.borderColor = "var(--positive-border)";
   } else if (claimedCount > 0) {
    summaryBadge.style.background = "var(--primary-light)";
    summaryBadge.style.color = "var(--primary)";
    summaryBadge.style.borderColor = "var(--primary-border)";
   } else {
    summaryBadge.style.background = "var(--surface-raised)";
    summaryBadge.style.color = "var(--text-muted)";
    summaryBadge.style.borderColor = "var(--border)";
   }
  }
  if (progressBar) {
   progressBar.style.width = (claimedCount / 4 * 100) + '%';
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
    container.innerHTML = '<p style="font-size:13px; color:var(--text-muted);">尚無觀點紀錄，組員可在上方輸入後點擊保存！</p>';
   } else {
    container.innerHTML = '<h4 style="margin: 12px 0 8px 0; color:var(--text);">已保存的觀點筆記：</h4>' + list.map(item => `
     <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 12px 14px; margin-bottom: 8px; box-shadow: var(--shadow-xs);">
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:4px;">
       <b style="color:var(--text);">${item.name} <span class="badge" style="margin-left:4px;">${item.topic || '觀點'}</span></b> <span>${item.time}</span>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; line-height:1.6;">${item.thought}</p>
     </div>
    `).join('');
   }
  }

  // 渲染首頁「即時小組討論與觀點動態牆」
  const homeStream = document.getElementById('home-thoughts-stream');
  if (homeStream) {
   if (!list.length) {
    homeStream.innerHTML = '<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:16px;">目前小組尚無留言，歡迎組員前往 HW1 頁面寫下心得觀點！</p>';
   } else {
    homeStream.innerHTML = list.map(item => `
     <div style="background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--primary); border-radius: var(--radius-control); padding: 14px 16px; margin-bottom: 12px; box-shadow: var(--shadow-xs);">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom: 8px; flex-wrap:wrap; gap:6px;">
       <div style="display:flex; align-items:center; gap:8px;">
        <b style="color:var(--text); font-size:14px;">${item.name}</b>
        <span class="badge badge-ai">${item.topic || '觀點分享'}</span>
       </div>
       <span style="color:var(--text-muted); font-size:11.5px; font-family:'Geist Mono', monospace;">${item.time}</span>
      </div>
      <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">${item.thought}</div>
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

/* ================= HW2 20大財務比率分類篩選 ================= */
function filterRatioCategory(cat, btn) {
  document.querySelectorAll('.ratio-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const rows = document.querySelectorAll('.ratio-row');
  rows.forEach(row => {
    if (cat === 'all' || row.getAttribute('data-cat') === cat) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

 window.onload = function() {
  initTheme();
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

 /* ================= 動態後端 CMS 渲染引擎 (Dynamic CMS Engine) ================= */
 let globalSiteConfig = null;

 async function initDynamicCms() {
  try {
   const local = localStorage.getItem('site_config_override');
   if (local) {
    globalSiteConfig = JSON.parse(local);
    console.log("已載入本地自訂設定 (site_config_override)");
   } else {
    const res = await fetch('data/site_config.json?t=' + Date.now());
    if (res.ok) {
     globalSiteConfig = await res.json();
    }
   }
  } catch (err) {
   console.warn("載入 site_config.json 失敗，保持原有靜態排版", err);
  }

  if (globalSiteConfig && globalSiteConfig.assignments) {
   renderDynamicAssignments();
  }
 }

 function renderDynamicAssignments() {
  const assignments = globalSiteConfig.assignments || [];
  const dropdownMenu = document.getElementById('hw-dropdown-menu');
  const drawerNav = document.querySelector('.mobile-drawer-nav');

  assignments.forEach(hw => {
   // 1. 更新麵包屑對照表
   SECTION_TITLES[hw.id] = hw.title;

   // 2. 更新或建立側邊欄下拉選單
   let subItem = document.getElementById('sub-' + hw.id);
   if (!subItem && dropdownMenu) {
    subItem = document.createElement('a');
    subItem.className = 'dropdown-sub-item';
    subItem.id = 'sub-' + hw.id;
    subItem.onclick = () => switchHw(hw.id);
    dropdownMenu.appendChild(subItem);
   }
   if (subItem) {
    subItem.innerHTML = `▸ ${hw.id.toUpperCase()} ${hw.chapter || ''} <span class="badge" style="font-size:10px; margin-left:auto;">${hw.badge || ''}</span>`;
   }

   // 3. 更新或建立手機抽屜作業項目
   let drawerItem = document.getElementById('mob-drawer-' + hw.id);
   if (!drawerItem && drawerNav) {
    drawerItem = document.createElement('a');
    drawerItem.className = 'nav-item';
    drawerItem.id = 'mob-drawer-' + hw.id;
    drawerItem.onclick = () => switchHwFromDrawer(hw.id);
    drawerNav.appendChild(drawerItem);
   }
   if (drawerItem) {
    drawerItem.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span>${hw.title.length > 18 ? hw.title.substring(0, 18) + '...' : hw.title}</span>
      <span class="badge" style="font-size:10px; margin-left:auto;">${hw.badge || ''}</span>
    `;
   }

   // 4. 更新首頁折疊抽屜
   let homeDetails = document.getElementById(`home-${hw.id}-details`);
   if (homeDetails && !hw.isStatic) {
    if (hw.status === 'active') homeDetails.setAttribute('open', '');
    homeDetails.innerHTML = `
      <summary style="font-size: 14px; font-weight: 600; color: var(--text); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
        <span>📁 ${hw.title}</span>
        <span class="badge ${hw.status === 'active' ? 'badge-primary' : ''}">${hw.badge || ''}</span>
      </summary>
      <div style="padding-top: 12px; font-size: 13px; color: var(--text); line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><b>題目來源：</b>${hw.source || '授課教材與習題'}</p>
        <p style="margin: 0 0 10px 0;"><b>核心任務：</b>${hw.summary || ''}</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="switchHw('${hw.id}')">前往 ${hw.id.toUpperCase()} 完整專區</button>
        </div>
      </div>
    `;
   }

   // 5. 若非手刻靜態頁面（例如 HW3 或後台新建立的作業），動態渲染整頁 Section
   if (!hw.isStatic) {
    let sec = document.getElementById('sec-' + hw.id);
    if (!sec) {
     sec = document.createElement('section');
     sec.id = 'sec-' + hw.id;
     sec.className = 'content-section';
     const wrapper = document.querySelector('.content-wrapper');
     if (wrapper) wrapper.appendChild(sec);
    }
    renderDynamicSectionContent(sec, hw);
   }
  });

  // 更新首頁 Hero 數據
  const statHwCount = document.getElementById('hero-kpi-hw-count');
  if (statHwCount) {
   statHwCount.innerText = `${assignments.length} 週`;
  }
 }

 function renderDynamicSectionContent(container, hw) {
  const modules = hw.modules || [];
  let html = `
    <div class="page-header">
      <div class="page-header-meta">
        <span class="meta-chip">${hw.id.toUpperCase()} ASSIGNMENT</span>
        <span class="meta-chip">${hw.chapter || ''}</span>
        <span class="meta-chip">截止：${hw.dueDate || '未定'}</span>
      </div>
      <h1 class="page-title">${hw.title}</h1>
      <p class="page-desc">${hw.summary || ''}</p>
    </div>
  `;

  modules.forEach(mod => {
   if (mod.type === 'banner') {
    html += `
      <div class="card" style="background: var(--positive-bg); border-color: var(--positive-border); padding: 12px 18px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="font-size: 13.5px; color: var(--success);">
          <b>${mod.title}：</b>${mod.content}
        </div>
        ${mod.linkUrl ? `<a href="${mod.linkUrl}" target="_blank" class="btn" style="font-size: 12px; padding: 5px 12px; background: var(--surface); color: var(--success); border-color: var(--positive-border); font-weight: 600; text-decoration: none;">${mod.linkText || '前往連結 ↗'}</a>` : ''}
      </div>
    `;
   }

   if (mod.type === 'claims') {
    html += `
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="font-size: 17px; margin-top: 0; display:flex; align-items:center; gap:8px;">
          <span>👥</span> ${mod.title || '小組分工與解題認領'}
        </h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">${mod.description || '請組員登記負責題目或草稿撰寫：'}</p>

        <div class="perspective-grid">
    `;

    (mod.roles || []).forEach(r => {
     const saved = localStorage.getItem('claim_' + r.id) || '';
     const isClaimed = !!saved;
     html += `
       <div class="perspective-card ${isClaimed ? 'claimed' : ''}" id="card-${r.id}">
         <div class="perspective-title">${r.name}</div>
         <div class="perspective-desc">${r.desc}</div>
         <div class="claim-status" id="label-${r.id}" style="${isClaimed ? 'display:inline-block;' : 'display:none;'}">
           ${isClaimed ? `已由 ${saved} 認領` : ''}
         </div>
         <div class="claim-input-box" style="margin-top:10px;">
           <input type="text" id="name-${r.id}" class="claim-user-input" placeholder="輸入姓名認領" value="${saved}">
           <button class="btn btn-primary" onclick="saveDynamicClaim('${r.id}')">登記</button>
         </div>
       </div>
     `;
    });

    html += `
        </div>
      </div>
    `;
   }

   if (mod.type === 'cards_grid') {
    html += `
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="font-size: 17px; margin-top: 0;">${mod.title || '核心公式與重點指引'}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 14px;">
    `;

    (mod.cards || []).forEach(c => {
     html += `
       <div style="background: var(--surface-raised); border: 1px solid var(--border); border-left: 4px solid var(--primary); border-radius: 8px; padding: 14px;">
         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
           <b style="font-size: 15px; color: var(--primary);">${c.title}</b>
           ${c.tag ? `<span class="badge">${c.tag}</span>` : ''}
         </div>
         <div style="font-size: 13px; color: var(--text); line-height: 1.6;">
           ${c.content}
         </div>
       </div>
     `;
    });

    html += `
        </div>
      </div>
    `;
   }

   if (mod.type === 'markdown') {
    html += `
      <div class="card" style="margin-bottom: 20px;">
        <h2 style="font-size: 17px; margin-top: 0;">${mod.title || '研討指引與題目詳解'}</h2>
        <div style="background: var(--surface-raised); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-size: 13.5px; line-height: 1.7; color: var(--text); white-space: pre-wrap;">${mod.content}</div>
      </div>
    `;
   }
  });

  container.innerHTML = html;
 }

 function saveDynamicClaim(roleId) {
  const input = document.getElementById('name-' + roleId);
  const name = input ? input.value.trim() : '';
  if (!name) {
   alert("請輸入組員姓名！");
   return;
  }

  localStorage.setItem('claim_' + roleId, name);
  updateDynamicClaimUI(roleId, name);
  showToast("登記成功：" + name);

  postToSheet({
   type: "claim",
   role: roleId,
   name: name,
   time: new Date().toLocaleString()
  });
 }

 function updateDynamicClaimUI(roleId, name) {
  const card = document.getElementById('card-' + roleId);
  const label = document.getElementById('label-' + roleId);
  if (card) card.classList.add('claimed');
  if (label) {
   label.innerText = `已由 ${name} 認領`;
   label.style.display = 'inline-block';
  }
 }

 document.addEventListener('DOMContentLoaded', () => {
  fetchIlearningHomeworks();
  initDynamicCms();
 });
