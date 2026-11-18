# 珍古德：非洲森林與黑猩猩研究站

《麥塊 AI 科學實驗王 2》補充單元。由提供的原型延伸開發，保留程序化森林、研究站、四區步道與原介面設計。原型 README 保存在 README.original.md，Git 第一筆提交保留原始版本。

## 啟動

建議使用 Node.js 22.12+ 或 24。

```bash
npm install
npm run typecheck
npm run dev
```

Windows 若限制 npm.ps1，請改用 npm.cmd。以瀏覽器開啟終端機的 Local 網址，手機可在同一網路開啟 Network 網址。正式建置與預覽如下。

```bash
npm run build
npm run preview
```

dist 已包含完整可部署成果，請透過 HTTP 伺服器執行。

## 操作

- 桌機使用 WASD／方向鍵移動、滑鼠拖曳轉向、Shift 加速、F 互動。雙擊場景可鎖定滑鼠，Esc 開啟設定或關閉目前視窗。
- 手機使用左搖桿、右側滑動與互動按鈕。也可用設定中的快速前往切換四區。
- 互動需接近且看向標記。觀察台維持與動物的虛擬安全距離。
- 右上圖鑑可重開八張知識卡。設定提供畫質、聲音與重新開始。
- 背景聲為輕柔的合成和聲，須先點開始探索。沒有使用人物語音。

## 四種研究任務

1. 成為研究員。記錄時間及地點，區分可直接觀察的動作與推測，再寫入野外筆記。
2. 遠距觀察。望遠鏡模式觀看理毛與覓食，每種至少四秒，選出實際動作並記錄兩種行為。
3. 工具研究。模擬桌依序選細枝、去葉、插入孔洞，觀看取食示意，再回答工具問題。中途關閉可回到上個安全步驟。
4. 森林連通。九格規劃桌選三點，連接中排兩側森林入口，顯示未來復育示意，再回答安全觀察問題。

所有錯答均可重試。重新開始會清除觀察、工具、配置、答案、樹苗與進度。觀察與動物動畫為教學示意，場景受貢貝啟發；實際野外活動應遵守保育機構規範。

## 測試

```bash
npx playwright install chromium
npm run build
npm run preview -- --port 4191
# 另開終端機
npm run test:e2e
```

也可用 CHROME 指定現有瀏覽器執行檔。PowerShell 範例為
`$env:CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'`。
URL 可指定預覽來源，SCREENSHOTS_DIR 可指定截圖輸出。測試會寫入 screenshots/results.json。
?debug=1 僅提供本機測試所需的 window.forest 存取介面。正式遊戲流程不依賴這個介面。

## GitHub Pages

將此專案目錄內的內容上傳到新儲存庫根目錄，包含 .github 隱藏目錄。
在 Settings → Pages 選 GitHub Actions。推送到 main 後，既有 workflow 會 npm ci、建置並部署。
workflow 自動依儲存庫名稱設定 VITE_BASE，無需猜測名稱。
使用自訂網域時，可在 Actions Variables 設 VITE_BASE 為 /。
本機建置預設 base 為 ./，亦可透過環境變數 VITE_BASE 指定其他前綴。
本次交付未發佈至 GitHub，儲存庫名稱可由你決定。

## 主題擴充與結構

- src/core/App.ts 負責遊戲生命週期、導航、輸入事件與共用流程。
- src/core/PlayerController.ts 負責行走、邊界與場景碰撞接口。
- src/core/MissionManager.ts 負責防重複的完成紀錄。
- src/core/InteractionRegistry.ts 將熱點 ID 對應至各主題的互動。
- src/core/SceneFactory.ts 以 sceneType 選擇世界建構器。
- src/core/types.ts 定義各世界需提供的共用生命週期與操作接口。
- src/ui/GameUI.ts 保留原版介面，從 ThemeConfig 取得內容。
- src/interactions/Research.ts 實作珍古德的四種研究操作。
- src/scene/ForestScene.ts 沿用並升級原森林建構器。
- src/scenes/forest/Chimpanzee.ts 定義無尾巴的多關節動物及行為動畫。
- src/themes/jane-goodall.ts 定義課程、歷史介紹、區域、知識卡、問答與 Minecraft 延伸活動。
- src/game/ForestGame.ts 保留原始匯入路徑，相容轉出新的 App。

新增主題時，建立 ThemeConfig，在 themes/index.ts 使用 registerTheme(config, installExperience) 註冊。
專屬操作以 app.register(actionId, callback) 加入；這個 installer 應回傳 reset 與 cancelView。
若場景種類不同，以 registerScene(sceneType, builder) 註冊實作 SceneWorld 的世界，提供自己的熱點與安全操作範圍。
共用 App 與玩家控制無需複製。現有主題參數為 ?theme=jane-goodall，無效參數會回到此主題。
目前附上一個完成的森林主題；海洋與物理實驗室需另外實作各自的世界建構器及實驗操作。
進度使用本次遊戲記憶體，不記錄兒童個資。

## 參考資料

- [Jane Goodall Institute 貢貝研究](https://janegoodall.org/programs/gombe-stream-research-center/)
- [Jane Goodall Institute 逝世公告](https://janegoodall.org/press-room-item/jane-goodall-renowned-ethologist-conservationist-and-animal-behavior-expert-passes-away-at-age-91/)
- [Abyssal Garden 視覺方向參考](https://noniv.github.io/abyssal-garden/)

所有模型、地形、字牌及介面均由程式產生。未打包第三方人物照片、聲音或模型。
