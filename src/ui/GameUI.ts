import type {ThemeConfig} from '../themes/types';
const $=(id:string)=>document.getElementById(id) as HTMLElement;
export class GameUI {
 constructor(private theme:ThemeConfig){}
 render(){
  const a=$('app');
  a.innerHTML=`
    <canvas id="world" aria-label="${this.theme.title} 3D 互動場景"></canvas>
    <div class="top-gradient"></div><div class="bottom-gradient"></div>
    <header class="header">
      <div class="brand"><span class="brand-icon">${this.theme.initials}<span class="brand-dot"></span></span><div><b>${this.theme.station}</b><small>《麥塊 AI 科學實驗王 2》</small></div></div>
      <div class="header-actions"><button class="pill only-desktop" id="map-btn">探索區域</button><button class="icon-button" id="book-btn" title="開啟知識圖鑑" aria-label="知識圖鑑">▤</button><button class="icon-button" id="settings-btn" title="設定" aria-label="設定">⚙</button></div>
    </header>
    <aside class="hud-left" id="hud-left"><div class="eyebrow"><span class="dot"></span> FIELD JOURNAL / 野外筆記</div><h2>${this.theme.subtitle} <span class="progress-tag" id="progress-count">0 / ${this.theme.zones.length}</span></h2>
      <div class="progress-track"><span id="progress-fill"></span></div>
      <div class="mission-list" id="mission-list"></div>
      <div class="hud-footer"><span id="zone-label">${this.theme.zones[0].short} — ${this.theme.zones[0].title}</span><span id="coords-label">${this.theme.station}</span></div>
    </aside>
    <nav class="zone-travel" id="zone-travel" aria-label="探索地點快捷導覽">
      ${this.theme.zones.map(z=>`<button class="travel-btn" data-zone="${z.id}"><span>${z.short}</span><b>${z.title}</b></button>`).join('')}
    </nav>
    <div class="crosshair" aria-hidden="true"><span></span><span></span></div>
    <div class="bottom-ui"><div class="interaction" id="interaction" hidden><span class="keycap">F</span><span id="interaction-text">按下 F 互動</span><button id="interact-btn">開始互動</button></div>
      <div class="controls-help" id="controls-help">W A S D 移動 <i>·</i> 滑鼠拖曳轉向 <i>·</i> Shift 加速 <i>·</i> F 互動</div></div>
    <div class="mini-stats" id="stats">60 FPS</div>
    <div class="mobile-controller" id="mobile-controls"><div class="virtual-pad" id="joystick"><div class="joystick-knob" id="joystick-knob"></div></div><button id="mobile-interact">互動</button></div>
    <div class="toast" id="toast" role="status"></div>
    <section class="intro-screen" id="intro-screen"><div class="intro-panel"><div class="intro-kicker"><span></span> FOREST EXPEDITION 001 <span></span></div>
      <p class="intro-course">${this.theme.course}</p><h1>${this.theme.title}</h1><p class="english">${this.theme.englishTitle}</p>
      <div class="intro-line"></div><p class="intro-description">${this.theme.heroText}<br>從觀察開始，探索森林中的生命與科學。</p>
      <button id="start-btn" class="primary-button">開始探索 <span>→</span></button>
      <div><button id="intro-help" class="outline-button">操作方式</button> <button id="intro-settings" class="outline-button">畫質設定</button></div>
      <div class="intro-meta"><span>${this.theme.zones.length} 個探索區域</span><span>${this.theme.zones.length} 項科學任務</span><span>${this.theme.knowledge.length} 張知識卡</span></div>
      <p class="intro-tip">建議使用電腦 Chrome / Edge，手機也可操作</p></div>
      <div class="intro-index">${this.theme.station} <span>SCROLL TO EXPLORE</span></div>
    </section>
    <div class="dialog-backdrop" id="dialog-backdrop" hidden><section class="dialog" id="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"></section></div>`;

 }
}
