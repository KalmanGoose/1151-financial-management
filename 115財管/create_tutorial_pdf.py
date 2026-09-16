import os
import subprocess
from pypdf import PdfWriter
from pypdf.generic import (
    DictionaryObject, NameObject, NumberObject, ArrayObject,
    DecodedStreamObject, create_string_object, FloatObject
)

def get_jpeg_stream_and_dims(png_path):
    res = subprocess.check_output(["sips", "-g", "pixelWidth", "-g", "pixelHeight", png_path]).decode()
    w, h = 0, 0
    for line in res.splitlines():
        if "pixelWidth:" in line:
            w = int(line.split()[-1])
        elif "pixelHeight:" in line:
            h = int(line.split()[-1])
            
    jpg_path = png_path + ".temp.jpg"
    subprocess.check_call(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "90", png_path, "--out", jpg_path], stdout=subprocess.DEVNULL)
    with open(jpg_path, "rb") as f:
        data = f.read()
    os.remove(jpg_path)
    return w, h, data

def create_link_annotation(rect, uri):
    link = DictionaryObject({
        NameObject("/Type"): NameObject("/Annot"),
        NameObject("/Subtype"): NameObject("/Link"),
        NameObject("/Rect"): ArrayObject([
            FloatObject(rect[0]),
            FloatObject(rect[1]),
            FloatObject(rect[2]),
            FloatObject(rect[3])
        ]),
        NameObject("/Border"): ArrayObject([NumberObject(0), NumberObject(0), NumberObject(0)]),
        NameObject("/A"): DictionaryObject({
            NameObject("/Type"): NameObject("/Action"),
            NameObject("/S"): NameObject("/URI"),
            NameObject("/URI"): create_string_object(uri)
        })
    })
    return link

def build_pdf():
    writer = PdfWriter()

    # Font dictionary: MSung-Light with ETenms-B5-H (Big5 Traditional Chinese)
    font_cns = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type0"),
        NameObject("/BaseFont"): NameObject("/MSung-Light"),
        NameObject("/Encoding"): NameObject("/ETenms-B5-H"),
        NameObject("/DescendantFonts"): ArrayObject([
            DictionaryObject({
                NameObject("/Type"): NameObject("/Font"),
                NameObject("/Subtype"): NameObject("/CIDFontType0"),
                NameObject("/BaseFont"): NameObject("/MSung-Light"),
                NameObject("/CIDSystemInfo"): DictionaryObject({
                    NameObject("/Registry"): create_string_object("Adobe"),
                    NameObject("/Ordering"): create_string_object("CNS1"),
                    NameObject("/Supplement"): NumberObject(0)
                })
            })
        ])
    })
    font_ref = writer._add_object(font_cns)

    # Standard Helvetica for ASCII / Numbers
    font_helv = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica-Bold")
    })
    font_helv_ref = writer._add_object(font_helv)

    target_url = "https://nchu.primo.exlibrisgroup.com/discovery/fulldisplay?docid=alma9973925559607976&context=L&vid=886NCHU_INST:886NCHU_INST&lang=zh-tw&search_scope=MyInstitution&adaptor=Local%20Search%20Engine&isFrbr=true&tab=LibraryCatalog&query=any,contains,%E8%B2%A1%E5%8B%99%E7%AE%A1%E7%90%86%20%E6%9D%8E%E9%A1%AF%E5%84%80&sortby=date_d&facet=frbrgroupid,include,9077601334601133344&offset=0"

    pages_data = [
        {
            "badge": "步驟 1",
            "title": "國立中興大學圖書館館藏查詢",
            "steps": [
                "1. 進入中興大學圖書館館藏查詢系統（Primo 檢索平台）。",
                "2. 於首頁檢索欄位輸入「財務管理 李顯儀」並點擊搜尋。",
                "3. 找到第 1 筆標示「電子書」之項目（2023年版，李顯儀編著）。",
                "4. 點擊下方綠色連結「目前線上可獲得」進入詳細資訊。"
            ],
            "img": "/Users/ethanchen/Desktop/115財管/step1_search.png",
            "page_num": "1 / 4",
            "is_last": False
        },
        {
            "badge": "步驟 2",
            "title": "點選進入「udn 讀書館」全文服務",
            "steps": [
                "1. 在詳細資訊彈出面板之「線上檢視」區塊中，找到可得全文項目。",
                "2. 點擊「udn讀書館」外部連結跳轉至電子書閱讀平台。",
                "3. 系統說明提示：本校師生使用「興大單簽系統」帳密登入即可借閱。",
                "4. 亦支援下載行動載具「udn讀書館 APP」離線閱讀。"
            ],
            "img": "/Users/ethanchen/Desktop/115財管/step2_udn_link.png",
            "page_num": "2 / 4",
            "is_last": False
        },
        {
            "badge": "步驟 3",
            "title": "以興大單簽登入並點擊「借閱」",
            "steps": [
                "1. 【步驟 1 / 紅框 1】：先點擊畫面右上角「人像圖示」進行登入。",
                "2. 輸入國立中興大學單一簽入（SSO）帳號與密碼認證。",
                "3. 【步驟 2 / 紅框 2】：登入後點擊中央綠色按鈕「借閱」。",
                "4. 本館典藏於臺灣學術電子書聯盟專館，共提供 100 本借閱額度。"
            ],
            "img": "/Users/ethanchen/Desktop/115財管/step3_login_borrow.png",
            "page_num": "3 / 4",
            "is_last": False
        },
        {
            "badge": "步驟 4",
            "title": "進入線上閱讀器，開始閱讀教材",
            "steps": [
                "1. 點擊「線上閱讀」即可在瀏覽器直接開啟全書（491 頁完整版）。",
                "2. 左上角功能表提供完整章節目錄跳轉，可快速瀏覽課堂進度。",
                "3. 工具列支援頁面縮放、全螢幕、單雙頁切換、線上列印與劃線書籤。",
                "4. 到期由系統自動歸還無逾期罰款；若需繼續研讀隨時可再次借閱。"
            ],
            "img": "/Users/ethanchen/Desktop/115財管/step4_reader.png",
            "page_num": "4 / 4",
            "is_last": True
        }
    ]

    pw, ph = 595.28, 841.89 # A4

    for p in pages_data:
        page = writer.add_blank_page(width=pw, height=ph)
        
        # Prepare Image XObject
        w_px, h_px, img_bytes = get_jpeg_stream_and_dims(p["img"])
        img_obj = DecodedStreamObject()
        img_obj.set_data(img_bytes)
        img_obj.update({
            NameObject("/Type"): NameObject("/XObject"),
            NameObject("/Subtype"): NameObject("/Image"),
            NameObject("/Width"): NumberObject(w_px),
            NameObject("/Height"): NumberObject(h_px),
            NameObject("/ColorSpace"): NameObject("/DeviceRGB"),
            NameObject("/BitsPerComponent"): NumberObject(8),
            NameObject("/Filter"): NameObject("/DCTDecode")
        })
        img_ref = writer._add_object(img_obj)

        # Image size & placement
        margin_x = 40.0
        disp_w = pw - 2 * margin_x # 515.28
        disp_h = disp_w * (h_px / w_px)

        if not p["is_last"]:
            max_h = 380.0
            if disp_h > max_h:
                disp_h = max_h
                disp_w = max_h * (w_px / h_px)
            img_x = margin_x + ( (pw - 2 * margin_x) - disp_w ) / 2.0
            img_y = 55.0
        else:
            # On last page, allocate space at the bottom for Link & AI disclosure boxes
            max_h = 280.0
            if disp_h > max_h:
                disp_h = max_h
                disp_w = max_h * (w_px / h_px)
            img_x = margin_x + ( (pw - 2 * margin_x) - disp_w ) / 2.0
            img_y = 190.0

        stream = []

        # 1. Top Header Bar
        stream.append("0.08 0.22 0.40 rg") # Navy blue
        stream.append(f"0 805 {pw} 37 re f")

        # Top Bar Title (Chinese)
        title_top = "國立中興大學《財務管理（第六版）》李顯儀編著 — 電子書借閱與使用指南"
        encoded_top = title_top.encode("big5", errors="ignore").hex()
        stream.append("1 1 1 rg") # white text
        stream.append("BT")
        stream.append("/F1 12 Tf")
        stream.append(f"30 818 Td <{encoded_top}> Tj ET")

        # Page Number
        stream.append("BT")
        stream.append("/F2 10 Tf")
        stream.append(f"540 818 Td ({p['page_num']}) Tj ET")

        # 2. Step Badge
        stream.append("0.16 0.48 0.76 rg") # Sky blue badge
        stream.append("35 755 80 28 re f")

        badge_enc = p["badge"].encode("big5", errors="ignore").hex()
        stream.append("1 1 1 rg")
        stream.append("BT")
        stream.append("/F1 15 Tf")
        stream.append(f"47 763 Td <{badge_enc}> Tj ET")

        # Step Title
        stream.append("0.1 0.15 0.25 rg")
        title_enc = p["title"].encode("big5", errors="ignore").hex()
        stream.append("BT")
        stream.append("/F1 17 Tf")
        stream.append(f"125 762 Td <{title_enc}> Tj ET")

        # Divider line
        stream.append("0.85 0.88 0.92 RG 1 w")
        stream.append(f"35 744 {pw - 70} 0 m l S")

        # 3. Step Instructions Box
        stream.append("0.96 0.97 0.99 rg")
        stream.append(f"35 630 {pw - 70} 105 re f")
        stream.append("0.82 0.87 0.93 RG 1 w")
        stream.append(f"35 630 {pw - 70} 105 re S")

        # Instruction lines
        cur_y = 712
        for s in p["steps"]:
            s_enc = s.encode("big5", errors="ignore").hex()
            stream.append("0.15 0.20 0.28 rg")
            stream.append("BT")
            stream.append("/F1 11 Tf")
            stream.append(f"48 {cur_y} Td <{s_enc}> Tj ET")
            cur_y -= 22

        # 4. Screenshot Area
        stream.append("0.90 0.92 0.95 RG 1.5 w")
        stream.append(f"{img_x - 1} {img_y - 1} {disp_w + 2} {disp_h + 2} re S")
        stream.append("0.2 0.2 0.2 rg")
        stream.append(f"q {disp_w:.2f} 0 0 {disp_h:.2f} {img_x:.2f} {img_y:.2f} cm /Img Do Q")

        # 5. Footer & Extra Boxes
        if not p["is_last"]:
            stream.append("0.55 0.60 0.65 rg")
            footer_text = "中興大學圖書館雲端自動化系統 ｜ udn 讀書館 臺灣學術電子書聯盟 ｜ 支援校外單簽連線與 APP 離線閱讀"
            footer_enc = footer_text.encode("big5", errors="ignore").hex()
            stream.append("BT")
            stream.append("/F1 9 Tf")
            stream.append(f"65 32 Td <{footer_enc}> Tj ET")
        else:
            # === Box A: Direct Library Resource Link Box ===
            # Y: 112 to 174 (height 62)
            stream.append("0.93 0.97 1.0 rg") # light blue tint
            stream.append(f"35 112 {pw - 70} 62 re f")
            stream.append("0.20 0.50 0.85 RG 1 w")
            stream.append(f"35 112 {pw - 70} 62 re S")

            # Link Title
            link_header = "【本課本圖書館館藏直達連結（點擊下方文字或連結即可前往）】"
            link_header_enc = link_header.encode("big5", errors="ignore").hex()
            stream.append("0.10 0.35 0.70 rg")
            stream.append("BT")
            stream.append("/F1 10.5 Tf")
            stream.append(f"45 156 Td <{link_header_enc}> Tj ET")

            # Link text display (split nicely in two lines or clickable line)
            url_line1 = "https://nchu.primo.exlibrisgroup.com/discovery/fulldisplay?docid=alma9973925559607976"
            url_line2 = "&context=L&vid=886NCHU_INST:886NCHU_INST&lang=zh-tw&query=財務管理 李顯儀"
            url_line2_enc = url_line2.encode("big5", errors="ignore").hex()
            
            stream.append("0.05 0.35 0.80 rg") # hyperlink blue
            stream.append("BT")
            stream.append("/F2 9.5 Tf")
            stream.append(f"45 140 Td ({url_line1}) Tj ET")
            
            stream.append("BT")
            stream.append("/F1 9 Tf")
            stream.append(f"45 124 Td <{url_line2_enc}> Tj ET")

            # === Box B: AI Disclosure Box ===
            # Y: 42 to 102 (height 60)
            stream.append("0.98 0.98 0.98 rg") # subtle light gray
            stream.append(f"35 42 {pw - 70} 60 re f")
            stream.append("0.80 0.82 0.86 RG 1 w")
            stream.append(f"35 42 {pw - 70} 60 re S")

            disc_title = "🤖【AI 自主揭露與製作說明 / AI Assistance Disclosure】"
            disc_title_enc = disc_title.encode("big5", errors="ignore").hex()
            stream.append("0.30 0.35 0.40 rg")
            stream.append("BT")
            stream.append("/F1 10 Tf")
            stream.append(f"45 87 Td <{disc_title_enc}> Tj ET")

            disc_desc1 = "• 本份《財務管理（第六版）》電子書使用教學手冊由課程助教與 AI Agent 協同對話生成。"
            disc_desc1_enc = disc_desc1.encode("big5", errors="ignore").hex()
            stream.append("0.40 0.45 0.50 rg")
            stream.append("BT")
            stream.append("/F1 9 Tf")
            stream.append(f"45 70 Td <{disc_desc1_enc}> Tj ET")

            disc_desc2 = "• 內容經實際檢索興大圖書館與 udn 讀書館畫面進行截圖定位與圖文教學排版，供課堂教學公益參考。"
            disc_desc2_enc = disc_desc2.encode("big5", errors="ignore").hex()
            stream.append("BT")
            stream.append("/F1 9 Tf")
            stream.append(f"45 54 Td <{disc_desc2_enc}> Tj ET")

            # Add Link Annotation to the entire link box
            link_rect = (35, 112, pw - 35, 174)
            link_annot = create_link_annotation(link_rect, target_url)
            link_annot_ref = writer._add_object(link_annot)
            page[NameObject("/Annots")] = ArrayObject([link_annot_ref])

        # Stream assembly
        stream_bytes = "\n".join(stream).encode("latin1")
        contents = DecodedStreamObject()
        contents.set_data(stream_bytes)
        contents_ref = writer._add_object(contents)

        page[NameObject("/Contents")] = contents_ref
        page[NameObject("/Resources")] = DictionaryObject({
            NameObject("/Font"): DictionaryObject({
                NameObject("/F1"): font_ref,
                NameObject("/F2"): font_helv_ref
            }),
            NameObject("/XObject"): DictionaryObject({
                NameObject("/Img"): img_ref
            })
        })

    out_path = "/Users/ethanchen/Desktop/115財管/財務管理電子書借閱與使用教學指南.pdf"
    with open(out_path, "wb") as f:
        writer.write(f)
    print(f"PDF successfully updated at: {out_path}")

build_pdf()
