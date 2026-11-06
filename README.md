# Membranous Nephropathy — 臨床診療決策導航

**公開網站：** https://yht5582-source.github.io/Membranous-Nephropathy/

**目前網站版本：v1.8.2（2026-11-06）**

本網站為膜性腎病變（Membranous Nephropathy, MN）的繁體中文互動式醫學教育及臨床決策輔助工具。

## 功能

- 診斷及原發性／相關病因鑑別，包括 anti-PLA2R、THSD7A 與腎切片判讀。
- KDIGO 2021 風險分層（Figure 30，含 6 個月支持治療後蛋白尿下降條件）、血栓預防提示（Figure 38），可一鍵帶入治療選擇（Figure 31）。
- 動脈血栓事件（ATE）風險估算（KDIGO Figure 38／Hofstra & Wetzels 2016）：Framingham general CVD 基線 × 腎病症候群 HR 2.1（Lee 2016），標示為近似估算、非經驗證模型。
- **個人化處方導引**：依檢驗與病人條件（HBV、生育、懷孕、既往 cyclophosphamide 累積量、感染等）排序 KDIGO 2021 藥物組合（Fig 31／34／35），依體重計算劑量（Fig 32），提供減藥／停藥規則、治療前檢查（Fig 14）與追蹤時程，可列印。
- 蛋白尿、血清白蛋白、腎功能及免疫學反應追蹤；依初始治療顯示 KDIGO Figure 33 的 6 個月 anti-PLA2R 處置，並提示 Figure 34（resistant vs relapse）與 Figure 35（次發性 FSGS）。
- 台灣健保：依 115/10/22 版給付規定全文查核，MN 未列給付適應症（rituximab 8.2.7／9.20、cyclosporin 8.2.1、tacrolimus 8.2.2）；處方前仍須核對當期公告。
- **9 例互動臨床模擬病例**，附作答與詳細解說。
- **住院醫師 10 題、主治醫師 10 題**，支援評分及解析。
- **可展開／收合的六主題心智圖**，操作時停留在心智圖，不切換頁籤。

## 如何查看新版

GitHub Pages 的網站來源是 `main` 分支的 `/(root)` 資料夾。若網站仍顯示較舊版本，請查看儲存庫 **Actions → pages build and deployment**，確認最新提交是否完成部署，然後重新載入或使用無痕瀏覽視窗開啟網站。

首頁頂端顯示 `v1.8.2 · 9 CASES`，即可辨識本次更新。

## 測試

決策邏輯集中於 `index.html` 的 `/*ENGINE-START*/ … /*ENGINE-END*/`（`MNE`），執行 `node tests.cjs` 檢查。頁籤可用網址直接開啟，例如 `#risk`、`#cases`、`#quiz`、`#map`。

## 臨床使用聲明

本工具僅供醫師教學與臨床決策輔助，不能取代個別病人的醫療判斷；治療選擇需參考最新指引、完整病況、院內用藥規範及當期台灣健保署公告。所有示範病例均為虛構教學病例。
