# 珍古德的黑猩猩研究站 · 3D Forest Expedition

《麥塊 AI 科學實驗王 2》互動科學探索補充單元。適用對象為國小三年級至國中。

## 內容

在程序化生成的非洲森林中，完成四個研究任務：

1. 森林研究站：閱讀珍古德在坦尚尼亞貢貝的觀察研究與筆記。
2. 黑猩猩觀察區：在遠距離觀察平台觀察理毛等群體行為。
3. 工具研究區：回答樹枝取白蟻的科學問題。
4. 棲地保育區：種植三棵樹苗、回答保育問題。

包含八張知識卡、兩道選擇題、任務進度與 Minecraft Education 延伸挑戰。**模擬場景不是貢貝的精確地圖**；黑猩猩動畫用於教學示意，不可作為動物行為研究資料。野外實際研究與參觀需要遵守保育機構的規範，切勿接近或餵食野生黑猩猩。

## 技術

- Three.js 0.180、TypeScript 5.8、Vite 7
- 原生 WebGLRenderer、程序化樹木/地形/角色
- 桌機 WASD、滑鼠拖曳視角、Shift 加速、F 互動；雙擊場景可鎖定滑鼠，Esc 解鎖
- 手機虛擬搖桿 + 右側滑動視角 + 互動按鈕
- Low/Medium/High 畫質、GitHub Pages 靜態部署

## 安裝與執行

需要 Node.js 22 或更新版本及網路安裝依賴：

```bash
npm install
npm run dev
```

依 Vite 顯示的本機網址開啟（通常是 `http://localhost:5173/`）。

```bash
npm run typecheck
npm run build
npm run preview
```

部署：將專案提交到你自己的 GitHub repository，在 **Settings → Pages → Build and deployment → GitHub Actions** 選擇 Actions；推送到 `main` 後由 `.github/workflows/deploy.yml` 建置發布。

Vite 已設定相對 `base: './'`，可部署到 `username.github.io/repository-name/`。如果另行指定站點路徑，可用 `VITE_BASE_PATH` 覆寫。

## 主題引擎與擴充

目前已提供 `jane-goodall` 主題，資料位於 `src/themes/jane-goodall.ts`。
後續新增主題：

1. 建立 `src/themes/new-theme.ts`，填入相同 `ThemeConfig` 介面。
2. 在 `src/themes/index.ts` 註冊主題。
3. 針對新主題新增專用 3D 場景建構器（目前 `ForestScene` 專屬非洲森林），並由場景工廠選擇對應建構器。
4. 共用 UI、進度、知識卡、問答與操作控制，為必要的新任務增加互動策略。

**現階段是可供擴充的單主題 MVP，不是只換主題資料就能自動生成不同 3D 科學世界的完整引擎。**

## 參考資料

- [Jane Goodall Institute · Gombe Stream Research Center](https://janegoodall.org/programs/gombe-stream-research-center/)
- [Jane Goodall Institute · Gombe at 65](https://janegoodall.org/news/gombe-stream-research-center-at-65-how-65-years-of-chimpanzee-research-changed-science-conservation-and-our-understanding-of-ourselves/)
- [Jane Goodall Institute · Wildlife Tourism Policy](https://janegoodall.global/wp-content/uploads/2024/05/JGIG-Policy-on-Wildlife-Tourism-Final-18-March-2024.pdf)
- [Abyssal Garden](https://noniv.github.io/abyssal-garden/) — 視覺品質與程式化生成思路參考，**未直接複製其程式碼或模型**。

## 實際測試限制

此版完成原始碼，產出時的執行環境無法連線至 npm registry 下載 Three.js/Vite 套件，因此尚未能完成實機 `npm run build` 和瀏覽器 WebGL 畫面驗證。請於可連線的 Windows 環境執行安裝與測試，若有錯誤提供 console 訊息進一步修復。
