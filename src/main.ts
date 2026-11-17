import './styles/main.css';
import {getTheme} from './themes';
import {ForestGame} from './game/ForestGame';
const params=new URLSearchParams(window.location.search);
try{new ForestGame(getTheme(params.get('theme')));}catch(error){
 console.error('Cannot start 3D game:',error);
 const root=document.getElementById('app');
 if(root)root.innerHTML='<div class="fatal"><h1>無法啟動 3D 森林探索</h1><p>請使用最新版 Chrome、Edge 或 Safari，並確認瀏覽器已開啟硬體加速。</p><button onclick="location.reload()">重新載入</button></div>';
}
