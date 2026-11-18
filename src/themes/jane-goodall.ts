import type {ThemeConfig} from './types';
export const janeGoodall:ThemeConfig={
 subtitle:'森林守護任務',palette:{accent:'#b5d982'},
 minecraftChallenges:['用 MakeCode 程式建造研究站、瞭望台、路牌與野外觀察步道','以 MakeCode 重複與迴圈生成樹木，連成森林綠廊','建造白蟻丘與細枝工具展示區，用告示牌解說改造工具'],
 completion:{title:'恭喜成為森林研究員！',summary:'你完成觀察筆記、黑猩猩行為紀錄、工具研究與棲地保育挑戰。真正的科學研究需要耐心與證據；保護野生動物要從尊重牠們的生活開始。',badge:'森林守護研究員'},
 sceneType:'forest',station:'GOMBE FIELD STATION',initials:'JG',spawn:{x:-25,z:-23,yaw:Math.PI/2},
 missions:{camp:'成為研究員',observe:'遠距觀察兩種行為',tools:'樹枝取白蟻模擬',protect:'森林連通計畫'},
 id:'jane-goodall',
 title:'珍古德：非洲森林與黑猩猩研究站', englishTitle:'GOMBE · THE FOREST RESEARCH MISSION',
 course:'《麥塊 AI 科學實驗王 2》補充單元', mentor:'研究站導覽系統',
 primary:'#b5d982', heroText:'走進貢貝森林，學習像科學家一樣觀察與記錄。',
 intro:'這是研究站的教學導覽，對話為原創教學內容。珍古德（1934–2025）於 2025 年 10 月 1 日逝世。1960 年，珍古德在坦尚尼亞的貢貝開始長期觀察野生黑猩猩。帶著筆記本，和我們一起發現牠們的生活、工具使用，以及保護森林的方法。',
 goals:['了解珍古德的觀察研究與紀錄方法','認識黑猩猩的行為及使用工具的能力','理解森林棲地保育與尊重野生動物的重要性'],
 zones:[
  {id:'camp',short:'01',title:'森林研究站',subtitle:'從觀察筆記開始',yaw:Math.PI/2,x:-30,z:-27,accent:'#d9b677'},
  {id:'observe',short:'02',title:'黑猩猩觀察區',subtitle:'安靜觀察群體生活',yaw:-Math.PI/2,x:25,z:-23,accent:'#9ed4a7'},
  {id:'tools',short:'03',title:'工具使用研究區',subtitle:'了解樹枝取白蟻',yaw:-Math.PI/2,x:26,z:26,accent:'#e2be82'},
  {id:'protect',short:'04',title:'森林保育區',subtitle:'一起修復棲地',yaw:Math.PI,x:-34,z:24,accent:'#a7d6a5'}
 ],
 knowledge:[
  {id:'jane',zone:'camp',icon:'01',title:'珍古德是誰？',body:'珍古德是靈長類動物研究者。她從 1960 年起在坦尚尼亞貢貝觀察野生黑猩猩，強調長期、耐心的研究。',action:'觀察動物時，先記錄你看到的事實，不急著猜測原因。'},
  {id:'gombe',zone:'camp',icon:'02',title:'科學觀察筆記',body:'貢貝位於坦干伊喀湖岸。研究筆記要分開記錄日期、時間、地點和看到的行為，並另外標示自己的推測。',action:'記錄觀察日期、地點、行為和周圍環境。'},
  {id:'groom',zone:'observe',icon:'03',title:'互相理毛',body:'黑猩猩會互相整理毛髮。這不只是清潔，也能幫助維持社會關係。',action:'遠距觀察，記錄是誰主動開始理毛。'},
  {id:'food',zone:'observe',icon:'04',title:'黑猩猩的食物',body:'黑猩猩主要吃水果、葉子、種子及昆蟲，有時也會捕食其他動物。',action:'觀察牠們在哪裡覓食，並避免餵食野生動物。'},
  {id:'termite',zone:'tools',icon:'05',title:'樹枝取白蟻',body:'珍古德觀察到黑猩猩把樹枝伸進白蟻巢，再取出附著在樹枝上的白蟻。',action:'工具能幫助動物取得不容易直接拿到的食物。'},
  {id:'toolmake',zone:'tools',icon:'06',title:'製作工具',body:'有些黑猩猩會先除去樹枝上的葉片，再拿它取食白蟻，顯示牠們能改造自然材料。',action:'比較未處理與處理過的樹枝，思考哪一種更合適。'},
  {id:'habitat',zone:'protect',icon:'07',title:'棲地破碎化',body:'當森林被道路或開發分隔，動物移動與尋找食物的空間可能減少。',action:'保護森林與棲地連結，讓動物有足夠的生存空間。'},
  {id:'respect',zone:'protect',icon:'08',title:'尊重野生動物',body:'人類與黑猩猩距離太近，可能干擾動物，也可能傳播疾病。野外研究應遵守專業規範。',action:'不要追逐、觸摸、餵食或接近野生黑猩猩。'}
 ],
 questions:[
 {id:'qtool',title:'黑猩猩取白蟻前，為什麼可能把樹枝上的葉片去除？',options:['讓枝條較容易伸進白蟻丘的小洞','讓樹枝變成會發光的魔法棒','讓白蟻立刻變成水果'],correct:0,explain:'正確。工具的形狀會影響用途，修整枝條是工具製作的一種例子。',hint:'觀察白蟻丘洞口與枝條的形狀，再試一次。'},
 {id:'qforest',title:'研究員應該如何觀察野生黑猩猩？',options:['走近並餵水果','保持安全距離，使用望遠鏡並遵守研究站規範','追逐黑猩猩，讓牠們跑到鏡頭前'],correct:1,explain:'正確。保持距離、不餵食與降低干擾，是尊重野生動物的重要原則。',hint:'想想人的接近可能造成什麼干擾或疾病風險。'}
 ],
 challenges:['用 MakeCode 建造森林研究站與觀察平台','設計黑猩猩棲地和相連的森林綠廊','建立樹枝工具使用的科學展示區與解說牌']
};
