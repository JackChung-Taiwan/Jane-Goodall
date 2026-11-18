# 驗收報告

## 範圍與還原點

已完整閱讀 CODEX_JANE_GOODALL_MASTER_SPEC.md，沿用提供的 ZIP。原始碼先建立 Git 還原提交，原 README 另外保留為 README.original.md。
交付的 source-history.bundle 包含原型與最終版本，可用 git clone source-history.bundle 還原歷史。
本次沒有修改既有海洋專案，也沒有上傳至尚未指定的 GitHub 儲存庫。

## P0 建置

- npm install 成功，產生 package-lock.json。
- npm run typecheck 通過。
- npm run build 通過，dist 已生成。
- Chrome 與 Edge 實際載入最終 dist，WebGL 正常。
- 已修復 favicon 404、望遠鏡被彈窗模糊遮擋，以及觀察台欄杆遮擋。
- 停用 WebGL 後，顯示中文錯誤提示，附 webgl-fallback.png。

## P1 任務與控制

- 桌機以鍵盤實際行走 A→B→C→D→A，均能抵達，無掉出地圖。
- 390×844 觸控模擬實際使用搖桿移動及點按通關。
- 各區任務透過相同 F／互動按鈕進入，進度從 0/4 到 4/4。
- A 測試先選推測，收到提示，再填時間／地點並選可見行為。
- B 測試未滿四秒無法記錄，兩種行為各計時並辨識後完成。
- C 測試錯誤枝條、三步操作、動畫中途關閉再開啟、問答錯答再答對。
- D 測試配置上排錯誤路線、取消後連通中排三點、保育題錯答再答對。
- 八張知識卡可開啟、關閉；兩種裝置皆通過。
- 重新開始清除任務、樹苗、觀察、工具步驟與配置。完成紀錄使用 Set，重複完成不重複計數。
- 正常測試流程 Console error 為零。任務測試用 debug 介面定位互動起點，另以鍵盤驗證完整步道路線。
- 未在實體 Android 或 iOS 測試。手機 Safari 相容性仍需實機複驗。

## P2 視覺與效能

保留原有風格化森林，補充溪谷、高低地形、湖岸、遠山、動態斑駁光紋、枝葉蕨類、樹冠陰影與中文字牌。
黑猩猩使用無尾巴、長臂的自製幾何，包含理毛者與受理毛者、緩慢行走及取食動畫。動畫屬教育示意。
工具使用發生於模擬桌，復育畫面為未來復育配置示意。

實測為 Windows Chrome headless、RTX 4060 Ti（D3D11）、1920×1080 實際繪圖緩衝區、DPR 1。
每種畫質在起點取約三秒 rAF 樣本，屬短時固定視角抽樣。P95／P99 幀時間用於呈現低幀情況。
視角改變、截圖、其他程式負載可能降低幀率，數值不代表全路線最低效能。

| 畫質 | 平均 FPS | P95 ms | P99 ms | 主幀三角形 |
| --- | ---: | ---: | ---: | ---: |
| low | 60.2 | 16.8 | 16.8 | 99,474 |
| medium | 60.3 | 16.8 | 16.8 | 156,314 |
| high | 60.2 | 16.8 | 16.9 | 203,594 |

Low／Medium／High 確實改變植被數量、解析度上限、陰影及粒子。
另附 final-checks.json 的手機模擬 Low 測量，同樣使用桌機 GPU，不能當作實體手機的 30 FPS 達標證據。
效能取樣後另修正湖岸地形與坐姿落地，最終視覺及子路徑載入重新複驗。上述平均效能為前一驗收建置的抽樣紀錄。

## P3 架構與部署

已抽離 App、PlayerController、MissionManager、InteractionRegistry、SceneWorld／SceneFactory 與 GameUI。
主題資料包含指定的教學欄位、palette、sceneType、區域、問題、結尾與 Minecraft 挑戰。
互動 installer 透過 registerTheme 註冊，專屬四任務留在 Research.ts。
場景介面允許註冊不同建構器；目前交付一個森林主題，其他主題仍需製作專屬世界與互動。
進度使用本次遊戲記憶體，沒有持久儲存與個資蒐集。

最終 dist 已透過 /classroom/goodall/ 子路徑在 Chrome 與 Edge 載入驗證。
GitHub Pages workflow 已設定 npm ci、configure-pages、upload-pages-artifact、deploy-pages，
自動依儲存庫名稱注入 VITE_BASE，可由 Actions Variable 覆寫。本次未進行遠端部署。

## 截圖

screenshots 內含首頁、研究站、望遠鏡觀察、白蟻工具桌、保育前／後、溪谷、湖岸、結尾、
手機首頁／各任務／完成，以及 WebGL 停用畫面。results.json 保存完整任務與效能結果。
final-checks.json 保存最終建置的子路徑與手機模擬檢查。

## 已知取捨

- 森林採風格化低面數模型，山谷和湖岸為程序化教學場景。
- 大範圍樹冠以批次繪製並隨畫質減量，尚未加入逐棵距離 LOD。
- 字牌使用 canvas 文字貼圖，字型由裝置的繁體中文系統字型提供。
- 動物不提供真實生物力學、疾病或棲地恢復速率模擬。
- 聲音為低音量合成和聲，未模仿珍古德聲音或引用第三方自然錄音。
