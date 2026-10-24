/**
 * 115-1 財務管理｜線上後端管理系統 (Admin Studio)
 * 管理週次作業、頁面佈局、導航選單與 GitHub / 雲端發布連動
 */

// 預設密碼與全域設定狀態
const DEFAULT_PASS = "admin1151";
let siteConfig = null;
let editingHwId = null;

// 初始化執行
document.addEventListener("DOMContentLoaded", () => {
  initAdminTheme();
  checkAuth();
  loadConfig();
});

/* ==========================================================================
   主題切換與初始化
   ========================================================================== */
function initAdminTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeBtn(saved);
}

function toggleAdminTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById("admin-theme-btn");
  if (btn) btn.innerHTML = theme === "dark" ? "☀️ 亮色" : "🌙 深色";
}

/* ==========================================================================
   安全認證與 Session
   ========================================================================== */
function checkAuth() {
  const isAuth = sessionStorage.getItem("admin_auth") === "true";
  const overlay = document.getElementById("admin-auth-overlay");
  if (!isAuth) {
    overlay.style.display = "flex";
  } else {
    overlay.style.display = "none";
  }
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("admin-pass-input");
  const errorMsg = document.getElementById("admin-auth-error");
  const targetPass = (siteConfig && siteConfig.meta && siteConfig.meta.adminPass) || DEFAULT_PASS;

  if (input.value.trim() === targetPass) {
    sessionStorage.setItem("admin_auth", "true");
    document.getElementById("admin-auth-overlay").style.display = "none";
    showToast("✅ 管理員驗證成功，歡迎使用管理後台！");
  } else {
    errorMsg.style.display = "block";
    input.focus();
  }
}

function handleLogout() {
  if (confirm("確定要登出管理後台嗎？")) {
    sessionStorage.removeItem("admin_auth");
    window.location.reload();
  }
}

/* ==========================================================================
   設定讀取與同步
   ========================================================================== */
async function loadConfig() {
  try {
    // 優先讀取本機快取覆蓋設定
    const localOverride = localStorage.getItem("site_config_override");
    if (localOverride) {
      siteConfig = JSON.parse(localOverride);
      console.log("已載入本機自訂設定 site_config_override");
    } else {
      const res = await fetch("data/site_config.json?t=" + Date.now());
      if (res.ok) {
        siteConfig = await res.json();
      } else {
        throw new Error("無法讀取 data/site_config.json");
      }
    }
  } catch (err) {
    console.warn("載入遠端設定失敗，啟用備用基礎設定：", err);
    siteConfig = getFallbackConfig();
  }

  // 渲染儀表板
  renderStats();
  renderAssignmentList();
  renderNavigationList();
  renderSettings();
}

function getFallbackConfig() {
  return {
    meta: {
      siteName: "115-1 財務管理｜小組知識庫與協同平台",
      semester: "115-1",
      course: "財務管理",
      lastUpdated: new Date().toISOString(),
      githubRepo: "KalmanGoose/1151-financial-management",
      adminPass: "admin1151"
    },
    navigation: [
      { id: "home", title: "首頁即時進度", icon: "home", showInSidebar: true, showInMobileDock: true, badge: "" },
      { id: "hw1", title: "HW1 日矽案史料庫", icon: "file-text", showInSidebar: true, showInMobileDock: true, badge: "已發布" },
      { id: "hw2", title: "HW2 財務比率分析", icon: "bar-chart-2", showInSidebar: true, showInMobileDock: true, badge: "進行中" },
      { id: "hw3", title: "HW3 貨幣時間價值", icon: "folder", showInSidebar: true, showInMobileDock: false, badge: "待發布" },
      { id: "ai-lab", title: "AI 助教", icon: "cpu", showInSidebar: true, showInMobileDock: true, badge: "" }
    ],
    assignments: []
  };
}

/* ==========================================================================
   分頁頁籤切換
   ========================================================================== */
function switchAdminTab(tabId) {
  document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.remove("active"));

  const targetBtn = document.getElementById("tab-btn-" + tabId);
  const targetPanel = document.getElementById("panel-" + tabId);

  if (targetBtn) targetBtn.classList.add("active");
  if (targetPanel) targetPanel.classList.add("active");
}

/* ==========================================================================
   Tab 1: 數據與作業管理看板
   ========================================================================== */
function renderStats() {
  const hwList = siteConfig.assignments || [];
  const activeCount = hwList.filter(h => h.status === "active").length;
  const upcomingCount = hwList.filter(h => h.status === "upcoming").length;
  const completedCount = hwList.filter(h => h.status === "completed").length;

  document.getElementById("stat-total-hw").innerText = hwList.length;
  document.getElementById("stat-active-hw").innerText = activeCount;
  document.getElementById("stat-upcoming-hw").innerText = upcomingCount;
  document.getElementById("stat-completed-hw").innerText = completedCount;
}

function renderAssignmentList() {
  const container = document.getElementById("assignment-list-container");
  if (!container) return;

  const hwList = siteConfig.assignments || [];
  if (hwList.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; padding: 40px;">目前尚無週次作業，點擊上方「＋ 新增週次作業」開始佈局！</div>`;
    return;
  }

  container.innerHTML = hwList.map(hw => {
    const isActive = hw.status === "active";
    const statusBadges = {
      active: `<span class="badge badge-primary">進行中</span>`,
      upcoming: `<span class="badge">待發布</span>`,
      completed: `<span class="badge badge-success">已完成</span>`,
      hidden: `<span class="badge" style="background:#475569; color:#fff;">隱藏</span>`
    };

    const modulesCount = (hw.modules || []).length;
    const isStatic = hw.isStatic === true;

    return `
      <div class="hw-admin-card ${isActive ? 'active-hw' : ''}" id="hw-card-${hw.id}">
        <div>
          <div class="hw-card-header">
            <div>
              <span class="badge" style="margin-bottom: 6px; font-weight:700;">${hw.chapter || hw.id.toUpperCase()}</span>
              <h3 class="hw-card-title">${hw.title}</h3>
              <div class="hw-card-meta">截止日期：${hw.dueDate || "未指定"} ｜ ${isStatic ? '手刻精裝頁面' : '動態佈局'}</div>
            </div>
            <div>${statusBadges[hw.status] || `<span class="badge">${hw.badge || hw.status}</span>`}</div>
          </div>
          <p class="hw-card-desc">${hw.summary || "暫無摘要說明"}</p>
          <div class="hw-card-modules-tag">
            <span class="badge" style="font-size:11px;">📦 ${modulesCount} 個內容模組</span>
            ${hw.modules && hw.modules.some(m => m.type === 'claims') ? '<span class="badge" style="font-size:11px; background:var(--primary-light); color:var(--primary);">👥 4角色認領</span>' : ''}
            ${hw.modules && hw.modules.some(m => m.type === 'data_table') ? '<span class="badge" style="font-size:11px; background:var(--surface-raised);">📊 數據表格</span>' : ''}
          </div>
        </div>

        <div class="hw-card-actions">
          <div style="display:flex; align-items:center; gap:6px;">
            <select class="form-select" style="padding:4px 8px; font-size:12px; width:auto;" onchange="changeHwStatus('${hw.id}', this.value)">
              <option value="active" ${hw.status === 'active' ? 'selected' : ''}>設為進行中</option>
              <option value="upcoming" ${hw.status === 'upcoming' ? 'selected' : ''}>設為待發布</option>
              <option value="completed" ${hw.status === 'completed' ? 'selected' : ''}>設為已完成</option>
              <option value="hidden" ${hw.status === 'hidden' ? 'selected' : ''}>隱藏不顯示</option>
            </select>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-primary" style="font-size:12px; padding:5px 10px;" onclick="openLayoutEditor('${hw.id}')">✏️ 編輯佈局</button>
            ${!isStatic ? `<button class="btn" style="font-size:12px; padding:5px 8px; color:var(--danger);" onclick="deleteAssignment('${hw.id}')" title="刪除">🗑️</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function changeHwStatus(hwId, newStatus) {
  const hw = siteConfig.assignments.find(h => h.id === hwId);
  if (!hw) return;
  hw.status = newStatus;
  const statusBadgeText = {
    active: "進行中",
    upcoming: "待發布",
    completed: "已發布",
    hidden: "隱藏"
  };
  hw.badge = statusBadgeText[newStatus] || newStatus;

  // 聯動更新導航選單中對應的 badge
  const navItem = (siteConfig.navigation || []).find(n => n.id === hwId);
  if (navItem) {
    navItem.badge = hw.badge;
  }

  saveLocalConfig();
  renderStats();
  renderAssignmentList();
  showToast(`已將 ${hw.id.toUpperCase()} 狀態更新為【${hw.badge}】！`);
}

function deleteAssignment(hwId) {
  if (confirm(`確定要刪除作業【${hwId.toUpperCase()}】嗎？刪除後請記得點擊發布更新。`)) {
    siteConfig.assignments = siteConfig.assignments.filter(h => h.id !== hwId);
    siteConfig.navigation = siteConfig.navigation.filter(n => n.id !== hwId);
    saveLocalConfig();
    renderStats();
    renderAssignmentList();
    renderNavigationList();
    showToast(`已刪除作業 ${hwId.toUpperCase()}`);
  }
}

/* ==========================================================================
   Tab 2: 模組化佈局工作室 (Layout & Assignment Studio)
   ========================================================================== */
function openNewAssignmentModal() {
  const nextNum = (siteConfig.assignments || []).length + 1;
  const newId = "hw" + nextNum;

  editingHwId = newId;
  document.getElementById("editor-title").innerText = `➕ 建立新週次作業 (HW${nextNum})`;
  document.getElementById("hw-edit-id").value = newId;
  document.getElementById("hw-edit-title").value = `HW${nextNum}：第 ${nextNum} 週作業專區`;
  document.getElementById("hw-edit-chapter").value = `第 ${nextNum} 章`;
  document.getElementById("hw-edit-status").value = "upcoming";
  document.getElementById("hw-edit-due").value = "2026-11-14 23:59";
  document.getElementById("hw-edit-source").value = `《財務管理》（第六版，李顯儀 著）第 ${nextNum} 章習題`;
  document.getElementById("hw-edit-summary").value = `本週作業重點探討內容...`;

  // 預設啟用 Banner + 4 角色 Claims + 核心公式卡片 + Markdown 題目引導
  document.getElementById("mod-banner-toggle").checked = true;
  document.getElementById("mod-claims-toggle").checked = true;
  document.getElementById("mod-cards-toggle").checked = true;
  document.getElementById("mod-table-toggle").checked = false;
  document.getElementById("mod-md-toggle").checked = true;

  // 填入預設角色資料
  document.getElementById("claim-role1-name").value = `理論架構與核心公式推導 (第 1 題組)`;
  document.getElementById("claim-role1-desc").value = `負責梳理課本核心觀念與推導過程。`;
  document.getElementById("claim-role2-name").value = `實例計算與情境分析 (第 2 題組)`;
  document.getElementById("claim-role2-desc").value = `負責數值代入計算與案例情境解讀。`;
  document.getElementById("claim-role3-name").value = `敏感度分析與延伸研討 (第 3 題組)`;
  document.getElementById("claim-role3-desc").value = `負責各項變數變動對結論之影響評估。`;
  document.getElementById("claim-role4-name").value = `Excel 防呆驗算與總結 (第 4 題組)`;
  document.getElementById("claim-role4-desc").value = `負責建立驗算模型與核對小組產出。`;

  document.getElementById("mod-md-content").value = `### HW${nextNum} 研討指引與題目說明\n\n1. 請參閱教科書第 ${nextNum} 章課後習題。\n2. 各組員登記認領題組後，將個人反思草稿儲存於網頁中。\n3. 本週預計於週日前彙整為定稿繳交至 iLearning！`;

  switchAdminTab("editor");
}

function openLayoutEditor(hwId) {
  const hw = siteConfig.assignments.find(h => h.id === hwId);
  if (!hw) return;

  editingHwId = hwId;
  document.getElementById("editor-title").innerText = `✏️ 編輯作業與頁面佈局：${hw.title}`;
  document.getElementById("hw-edit-id").value = hw.id;
  document.getElementById("hw-edit-title").value = hw.title;
  document.getElementById("hw-edit-chapter").value = hw.chapter || "";
  document.getElementById("hw-edit-status").value = hw.status || "upcoming";
  document.getElementById("hw-edit-due").value = hw.dueDate || "";
  document.getElementById("hw-edit-source").value = hw.source || "";
  document.getElementById("hw-edit-summary").value = hw.summary || "";

  // 檢查啟用模組
  const modules = hw.modules || [];
  const bannerMod = modules.find(m => m.type === "banner");
  const claimsMod = modules.find(m => m.type === "claims");
  const cardsMod = modules.find(m => m.type === "cards_grid");
  const tableMod = modules.find(m => m.type === "data_table");
  const mdMod = modules.find(m => m.type === "markdown");

  document.getElementById("mod-banner-toggle").checked = !!bannerMod;
  if (bannerMod) {
    document.getElementById("mod-banner-title").value = bannerMod.title || "";
    document.getElementById("mod-banner-content").value = bannerMod.content || "";
    document.getElementById("mod-banner-link-text").value = bannerMod.linkText || "";
    document.getElementById("mod-banner-link-url").value = bannerMod.linkUrl || "";
  }

  document.getElementById("mod-claims-toggle").checked = !!claimsMod;
  if (claimsMod && claimsMod.roles) {
    claimsMod.roles.forEach((r, idx) => {
      const nElem = document.getElementById(`claim-role${idx+1}-name`);
      const dElem = document.getElementById(`claim-role${idx+1}-desc`);
      if (nElem) nElem.value = r.name || "";
      if (dElem) dElem.value = r.desc || "";
    });
  }

  document.getElementById("mod-cards-toggle").checked = !!cardsMod;
  document.getElementById("mod-table-toggle").checked = !!tableMod;

  document.getElementById("mod-md-toggle").checked = !!mdMod;
  if (mdMod) {
    document.getElementById("mod-md-content").value = mdMod.content || "";
  }

  switchAdminTab("editor");
}

function saveAssignmentLayout() {
  const id = document.getElementById("hw-edit-id").value.trim().toLowerCase();
  const title = document.getElementById("hw-edit-title").value.trim();
  const chapter = document.getElementById("hw-edit-chapter").value.trim();
  const status = document.getElementById("hw-edit-status").value;
  const dueDate = document.getElementById("hw-edit-due").value.trim();
  const source = document.getElementById("hw-edit-source").value.trim();
  const summary = document.getElementById("hw-edit-summary").value.trim();

  if (!id || !title) {
    alert("請至少填寫作業代號（如 hw4）與作業全名！");
    return;
  }

  // 組合模組陣列
  const modules = [];

  // 1. Banner
  if (document.getElementById("mod-banner-toggle").checked) {
    modules.push({
      type: "banner",
      title: document.getElementById("mod-banner-title").value.trim() || "作業參照教材",
      content: document.getElementById("mod-banner-content").value.trim() || source,
      linkText: document.getElementById("mod-banner-link-text").value.trim() || "前往興大圖書館電子書 ↗",
      linkUrl: document.getElementById("mod-banner-link-url").value.trim() || "https://nchu.primo.exlibrisgroup.com/discovery/fulldisplay/alma9973925559607976/886NCHU_INST:886NCHU_INST"
    });
  }

  // 2. Claims 模組
  if (document.getElementById("mod-claims-toggle").checked) {
    const roles = [];
    for (let i = 1; i <= 4; i++) {
      roles.push({
        id: `${id}_role${i}`,
        name: document.getElementById(`claim-role${i}-name`).value.trim() || `題組 ${i}`,
        desc: document.getElementById(`claim-role${i}-desc`).value.trim() || `負責題組 ${i} 研討推導。`
      });
    }
    modules.push({
      type: "claims",
      title: `${chapter || id.toUpperCase()} 小組分工與題組認領`,
      description: "組員可登記認領負責題組或撰寫題目白話推導與 Excel 試算表驗證：",
      roles: roles
    });
  }

  // 3. Cards Grid 模組
  if (document.getElementById("mod-cards-toggle").checked) {
    modules.push({
      type: "cards_grid",
      title: `${chapter || id.toUpperCase()} 核心公式與解題關鍵指引`,
      cards: [
        {
          title: "核心理論公式 (一)",
          tag: "Theory 1",
          content: "請於後台自訂此公式或重點解讀內容。"
        },
        {
          title: "核心理論公式 (二)",
          tag: "Theory 2",
          content: "請於後台自訂此公式或重點解讀內容。"
        }
      ]
    });
  }

  // 4. Markdown 指引模組
  if (document.getElementById("mod-md-toggle").checked) {
    modules.push({
      type: "markdown",
      title: "助教解題思路與注意事項",
      content: document.getElementById("mod-md-content").value.trim()
    });
  }

  let existing = siteConfig.assignments.find(h => h.id === id);
  const statusBadgeText = {
    active: "進行中",
    upcoming: "待發布",
    completed: "已發布",
    hidden: "隱藏"
  };

  const assignmentObj = {
    id: id,
    title: title,
    chapter: chapter,
    status: status,
    badge: statusBadgeText[status] || status,
    isStatic: existing ? existing.isStatic : false,
    dueDate: dueDate,
    source: source,
    summary: summary,
    modules: modules
  };

  if (existing) {
    // 更新
    const idx = siteConfig.assignments.findIndex(h => h.id === id);
    siteConfig.assignments[idx] = assignmentObj;
  } else {
    // 新增
    siteConfig.assignments.push(assignmentObj);
    // 自動在導航欄加入該作業
    siteConfig.navigation.push({
      id: id,
      title: `${id.toUpperCase()} ${chapter}`,
      icon: "folder",
      type: "assignment",
      showInSidebar: true,
      showInMobileDock: false,
      badge: assignmentObj.badge
    });
  }

  saveLocalConfig();
  renderStats();
  renderAssignmentList();
  renderNavigationList();
  switchAdminTab("assignments");
  showToast(`🎉 作業【${title}】佈局已成功儲存！`);
}

/* ==========================================================================
   Tab 3: 導航選單與分頁管理
   ========================================================================== */
function renderNavigationList() {
  const container = document.getElementById("nav-list-container");
  if (!container) return;

  const navs = siteConfig.navigation || [];
  container.innerHTML = navs.map((nav, index) => {
    return `
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-card); padding:14px 18px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-weight:700; color:var(--text-muted); font-size:13px;">#${index+1}</span>
          <div>
            <div style="font-weight:700; color:var(--text); font-size:14px;">${nav.title} <code style="font-size:11px; color:var(--primary);">#sec-${nav.id}</code></div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">類型：${nav.type || '自訂分頁'}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:16px;">
          <label style="font-size:12.5px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" ${nav.showInSidebar ? 'checked' : ''} onchange="toggleNavVisibility('${nav.id}', 'showInSidebar', this.checked)">
            桌面側邊欄
          </label>
          <label style="font-size:12.5px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" ${nav.showInMobileDock ? 'checked' : ''} onchange="toggleNavVisibility('${nav.id}', 'showInMobileDock', this.checked)">
            手機底部 Dock
          </label>
          <input type="text" value="${nav.badge || ''}" placeholder="自訂標籤 (如: HOT)" style="width:110px; padding:4px 8px; font-size:12px; background:var(--surface-raised); border:1px solid var(--border); border-radius:4px; color:var(--text);" onchange="updateNavBadge('${nav.id}', this.value)">
        </div>
      </div>
    `;
  }).join("");
}

function toggleNavVisibility(navId, field, isChecked) {
  const nav = (siteConfig.navigation || []).find(n => n.id === navId);
  if (nav) {
    nav[field] = isChecked;
    saveLocalConfig();
    showToast(`導航項目 ${nav.title} 顯示設定已更新`);
  }
}

function updateNavBadge(navId, newBadge) {
  const nav = (siteConfig.navigation || []).find(n => n.id === navId);
  if (nav) {
    nav.badge = newBadge.trim();
    saveLocalConfig();
    showToast(`導航標籤已更新`);
  }
}

function addNewCustomPage() {
  const pageId = prompt("請輸入新分頁代號（英文，例如 exam-prep 或 cheatsheet）：");
  if (!pageId) return;
  const cleanId = pageId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!cleanId) return;

  const pageTitle = prompt("請輸入新分頁顯示名稱（例如：期中考重點衝刺）：", "新分頁");
  if (!pageTitle) return;

  siteConfig.navigation.push({
    id: cleanId,
    title: pageTitle.trim(),
    icon: "book",
    type: "custom",
    showInSidebar: true,
    showInMobileDock: false,
    badge: "NEW"
  });

  saveLocalConfig();
  renderNavigationList();
  showToast(`已成功新增分頁【${pageTitle}】！`);
}

/* ==========================================================================
   Tab 4: 雲端發布中樞 (GitHub REST API & 備份)
   ========================================================================== */
function renderSettings() {
  const tokenInput = document.getElementById("github-pat-input");
  if (tokenInput) {
    tokenInput.value = localStorage.getItem("github_pat") || "";
  }
}

async function publishToGitHub() {
  const tokenInput = document.getElementById("github-pat-input");
  const token = (tokenInput ? tokenInput.value.trim() : "") || localStorage.getItem("github_pat");

  if (!token) {
    alert("請先輸入具有 Contents 讀寫權限的 GitHub Personal Access Token (PAT)！\n\n這樣管理系統才能直接在線上 commit 更新 data/site_config.json 至 GitHub 倉庫，全組即可立即連動！");
    if (tokenInput) tokenInput.focus();
    return;
  }

  // 儲存 token 到本機供下次方便使用
  localStorage.setItem("github_pat", token);

  const statusElem = document.getElementById("github-publish-status");
  statusElem.style.display = "block";
  statusElem.className = "publish-alert publish-alert-info";
  statusElem.innerHTML = `⏳ 正在連接 GitHub API，讀取目前的 <code>data/site_config.json</code>...`;

  const repo = (siteConfig.meta && siteConfig.meta.githubRepo) || "KalmanGoose/1151-financial-management";
  const path = "data/site_config.json";
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    // 1. 取得檔案現有 SHA
    let sha = null;
    const getRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    // 2. 更新時間戳
    siteConfig.meta.lastUpdated = new Date().toISOString();

    // 3. Base64 編碼
    const jsonStr = JSON.stringify(siteConfig, null, 2);
    // 支援 UTF-8 中文轉 Base64
    const encodedContent = btoa(unescape(encodeURIComponent(jsonStr)));

    statusElem.innerHTML = `🚀 正在推送最新設定至 GitHub main 分支...`;

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `feat(cms): update assignments & site layout via admin studio [${new Date().toLocaleDateString()}]`,
        content: encodedContent,
        sha: sha || undefined
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || "GitHub API 回傳錯誤");
    }

    const putJson = await putRes.json();
    statusElem.className = "publish-alert publish-alert-success";
    statusElem.innerHTML = `
      <div>
        <b>🎉 發布成功！GitHub 倉庫已即時更新</b>
        <div style="font-size:12.5px; margin-top:4px;">
          Commit SHA: <code>${putJson.commit.sha.substring(0, 7)}</code> ｜ 
          GitHub Pages 將在 30 秒內自動發布，全組同學開啟網頁即可即時連動最新作業與頁面佈局！
        </div>
      </div>
    `;

    // 同步儲存至本地快取
    saveLocalConfig();

  } catch (err) {
    statusElem.className = "publish-alert publish-alert-warning";
    statusElem.innerHTML = `❌ 發布失敗：${err.message}。<br><span style="font-size:12px;">請確認 GitHub Token 具備 repo (Contents) 權限，或直接使用下方的「下載 site_config.json」手動覆蓋。</span>`;
  }
}

function saveLocalConfig() {
  if (siteConfig) {
    siteConfig.meta.lastUpdated = new Date().toISOString();
    localStorage.setItem("site_config_override", JSON.stringify(siteConfig));
  }
}

function previewInFrontend() {
  saveLocalConfig();
  window.open("index.html", "_blank");
}

function copyConfigJson() {
  saveLocalConfig();
  const text = JSON.stringify(siteConfig, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 已將全站設定 JSON 完整複製到剪貼簿！");
  });
}

function downloadConfigFile() {
  saveLocalConfig();
  const blob = new Blob([JSON.stringify(siteConfig, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "site_config.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("💾 已下載 site_config.json，放入專案 data/ 資料夾即可生效！");
}

function resetToDefaultConfig() {
  if (confirm("確定要重設並清空本機快取的修改嗎？這將重新從遠端 data/site_config.json 載入原始設定。")) {
    localStorage.removeItem("site_config_override");
    window.location.reload();
  }
}

/* ==========================================================================
   輕量微提示 (Toast)
   ========================================================================== */
function showToast(msg) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
      padding: 12px 20px;
      border-radius: var(--radius-control);
      font-size: 13.5px;
      font-weight: 600;
      z-index: 9999;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = msg;
  toast.style.transform = "translateY(0)";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.transform = "translateY(20px)";
    toast.style.opacity = "0";
  }, 3200);
}
