import base64
import os

def img_to_base64(path):
    with open(path, "rb") as f:
        return f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"

cwd = "/Users/ethanchen/Desktop/115財管"
img1 = img_to_base64(os.path.join(cwd, "step1_search.png"))
img2 = img_to_base64(os.path.join(cwd, "step2_udn_link.png"))
img3 = img_to_base64(os.path.join(cwd, "step3_login_borrow.png"))
img4 = img_to_base64(os.path.join(cwd, "step4_reader.png"))

html = f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>《財務管理（第六版）》電子書借閱與使用教學指南</title>
<style>
  @page {{
    size: A4;
    margin: 18mm 16mm;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", sans-serif;
    color: #222;
    line-height: 1.5;
    background: #fff;
    margin: 0;
    padding: 0;
  }}
  h1 {{
    font-size: 22px;
    text-align: center;
    color: #1a365d;
    margin-bottom: 6px;
    padding-bottom: 8px;
    border-bottom: 2px solid #2b6cb0;
  }}
  .subtitle {{
    text-align: center;
    font-size: 13px;
    color: #4a5568;
    margin-top: 0;
    margin-bottom: 16px;
  }}
  .info-box {{
    background: #ebf8ff;
    border: 1px solid #bee3f8;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: 12.5px;
  }}
  .info-title {{
    font-weight: bold;
    color: #2b6cb0;
    margin-bottom: 4px;
    font-size: 13px;
  }}
  .info-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px 16px;
  }}
  .step-card {{
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 16px;
    page-break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }}
  .step-header {{
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }}
  .step-badge {{
    background: #2b6cb0;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    margin-right: 8px;
  }}
  .step-title {{
    font-size: 15px;
    font-weight: bold;
    color: #2d3748;
    margin: 0;
  }}
  .step-desc {{
    font-size: 12.5px;
    color: #4a5568;
    margin: 4px 0 10px 0;
  }}
  .step-desc ol {{
    margin: 0;
    padding-left: 20px;
  }}
  .step-desc li {{
    margin-bottom: 3px;
  }}
  .img-container {{
    text-align: center;
    margin-top: 6px;
  }}
  .img-container img {{
    max-width: 95%;
    max-height: 270px;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }}
  .notes {{
    background: #fffaf0;
    border: 1px solid #feebc8;
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 14px;
    font-size: 12px;
    page-break-inside: avoid;
  }}
  .notes-title {{
    font-weight: bold;
    color: #c05621;
    margin-bottom: 4px;
    font-size: 12.5px;
  }}
  .notes ul {{
    margin: 0;
    padding-left: 18px;
    color: #744210;
  }}
  .notes li {{
    margin-bottom: 3px;
  }}
</style>
</head>
<body>

  <h1>《財務管理（第六版）》電子書借閱與線上使用教學</h1>
  <p class="subtitle">供課程授課教師與修課同學參考 ｜ 國立中興大學圖書館館藏資源</p>

  <div class="info-box">
    <div class="info-title">書籍與館藏資訊摘要</div>
    <div class="info-grid">
      <div><b>書名：</b>財務管理（第六版，Financial Management）</div>
      <div><b>作者 / 出版：</b>李顯儀 編著 / 全華圖書（2023 年版）</div>
      <div><b>電子書平台：</b>udn 讀書館（臺灣學術電子書聯盟專館）</div>
      <div><b>館藏數量：</b>可借 100 本（目前尚有 99 本可借）</div>
      <div><b>登入身分：</b>中興大學單一簽入（SSO）帳號與密碼</div>
      <div><b>使用形式：</b>支援線上瀏覽器全書閱讀、列印與手機 APP</div>
    </div>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-badge">步驟 1</span>
      <h2 class="step-title">中興大學圖書館館藏查詢</h2>
    </div>
    <div class="step-desc">
      <ol>
        <li>進入中興大學圖書館館藏查詢系統（Primo）。</li>
        <li>於檢索欄輸入關鍵字 <code>財務管理 李顯儀</code>。</li>
        <li>找到標示為 <b>電子書</b> 的項目（2023 年版），點擊下方 <b>「目前線上可獲得」</b>。</li>
      </ol>
    </div>
    <div class="img-container">
      <img src="{img1}" alt="步驟一：館藏檢索" />
    </div>
  </div>

  <div class="step-card" style="page-break-before: always;">
    <div class="step-header">
      <span class="step-badge">步驟 2</span>
      <h2 class="step-title">點擊進入「udn讀書館」全文平台</h2>
    </div>
    <div class="step-desc">
      <ol>
        <li>在展開的詳細資訊面板「線上檢視」區塊中。</li>
        <li>點擊 <b>「udn讀書館」</b> 外部連結開啟電子書閱覽系統。</li>
        <li><em>系統說明：登入需以興大單簽帳號密碼登入，亦可下載行動 APP 使用。</em></li>
      </ol>
    </div>
    <div class="img-container">
      <img src="{img2}" alt="步驟二：電子書平台連結" />
    </div>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-badge">步驟 3</span>
      <h2 class="step-title">興大單簽登入並點選「借閱」</h2>
    </div>
    <div class="step-desc">
      <ol>
        <li><b>先登入：</b>點擊右上角 <b>人像圖示（紅框 1）</b>，使用興大單簽系統帳密登入。</li>
        <li><b>進行借閱：</b>登入後點擊中央綠色按鈕 <b>「借閱」（紅框 2）</b>，即可取得線上借閱權限。</li>
      </ol>
    </div>
    <div class="img-container">
      <img src="{img3}" alt="步驟三：登入與借閱" />
    </div>
  </div>

  <div class="step-card" style="page-break-before: always;">
    <div class="step-header">
      <span class="step-badge">步驟 4</span>
      <h2 class="step-title">開啟線上閱讀器閱讀教材</h2>
    </div>
    <div class="step-desc">
      <ol>
        <li>借閱完成後點選「線上閱讀」，即以網頁閱讀器載入全書（共 491 頁完整 PDF）。</li>
        <li>支援目錄跳轉、全螢幕縮放、書籤、劃線筆記與線上列印功能。</li>
      </ol>
    </div>
    <div class="img-container">
      <img src="{img4}" alt="步驟四：閱讀器介面" />
    </div>
  </div>

  <div class="notes">
    <div class="notes-title">📌 注意事項與使用提示</div>
    <ul>
      <li><b>校外連線：</b>在校外網路環境存取時，點擊連結會自動跳轉至興大單簽身分認證，驗證後即可直接閱讀。</li>
      <li><b>行動裝置（手機 / 平板）：</b>可由 App Store 或 Google Play 安裝「udn 讀書館」APP，選擇「國立中興大學」並以學校帳密登入，享有離線閱讀體驗。</li>
      <li><b>到期自動歸還：</b>借期屆滿後系統自動歸還，完全無逾期罰款問題；課程期間若需繼續使用，再次登入點選借閱即可。</li>
    </ul>
  </div>

</body>
</html>
"""

with open(os.path.join(cwd, "guide.html"), "w", encoding="utf-8") as f:
    f.write(html)
print("guide.html generated successfully!")
