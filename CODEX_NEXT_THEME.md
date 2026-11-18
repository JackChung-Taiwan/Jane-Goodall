# 下一個主題的 Codex 提示詞

```text
新增教學主題：[主題名稱]

請在既有 AI 3D 科學教學專案中新增獨立主題，不要覆蓋或刪除珍古德的森林課程。

1. 複製 src/themes/jane-goodall.ts 的 ThemeConfig 結構，完成新主題的科學學習目標、四個探索區、至少八張知識卡、兩道互動問答、三個 Minecraft Education MakeCode 延伸挑戰。科學知識與史實必須查核。
2. 在 src/themes/index.ts 註冊新的主題 ID，支援 ?theme=主題ID。
3. 程序化建立符合新主題的獨立 3D 場景：地形、場景建築、動態物件、光影與可互動熱點。不得只是把森林改色，且不要強迫沿用森林場景。
4. 將遊戲引擎中可共用的第一人稱移動、觸控搖桿、HUD、知識卡、問答與進度管理抽離為通用模組。建立基於主題 ID 的場景工廠，以及可替換的任務流程/互動策略。
5. 首頁提供主題選單；已有主題繼續正常運作。
6. 以 npm run typecheck、npm run build、實際瀏覽器操作與手機排版測試完成驗收，未測試不得宣稱通過。
7. 適合國小中高年級至國中，全繁體中文、童趣但精緻，參考 Abyssal Garden 的沉浸式視覺和程序化場景精神。

請直接新增完整可執行的程式碼，保留既有作品。
```

 
## 本次實作的擴充接口

使用 themes/index.ts 的 registerTheme(config, installer) 註冊資料與任務互動。
installer(app) 呼叫 app.register(actionId, callback)，回傳 reset 與 cancelView。
異種場景用 core/SceneFactory.ts 的 registerScene 註冊建構器，
依 core/types.ts 實作 SceneWorld。主程式從 sceneType 選擇世界，從主題 ID 選擇互動。
畫質與碰撞由世界實作，輸入、任務計數、導航與介面繼續使用共用 App。
