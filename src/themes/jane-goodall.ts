import type {ThemeConfig} from './types';
export const janeGoodall:ThemeConfig={
 id:'jane-goodall',
 title:'非洲森林與黑猩猩研究站', englishTitle:'GOMBE · THE FOREST RESEARCH MISSION',
 course:'麥塊 AI 科學實驗王 2 · 3D 科學探索', mentor:'珍古德 Jane Goodall',
 primary:'#b5d982', heroText:'進入非洲森林，成為野生動物觀察員',
 intro:'1960 年，珍古德在坦尚尼亞的貢貝開始長期觀察野生黑猩猩。帶著筆記本，和我們一起發現牠們的生活、工具使用，以及保護森林的方法。',
 goals:['了解珍古德的觀察研究與紀錄方法','認識黑猩猩的行為及使用工具的能力','理解森林棲地保育與尊重野生動物的重要性'],
 zones:[
  {id:'camp',short:'01',title:'森林研究站',subtitle:'從觀察筆記開始',x:-30,z:-27,accent:'#d9b677'},
  {id:'observe',short:'02',title:'黑猩猩觀察區',subtitle:'安靜觀察群體生活',x:30,z:-27,accent:'#9ed4a7'},
  {id:'tools',short:'03',title:'工具使用研究區',subtitle:'了解樹枝取白蟻',x:30,z:27,accent:'#e2be82'},
  {id:'protect',short:'04',title:'森林保育區',subtitle:'一起修復棲地',x:-30,z:27,accent:'#a7d6a5'}
 ],
 knowledge:[
  {id:'jane',zone:'camp',icon:'01',title:'珍古德是誰？',body:'珍古德是靈長類動物研究者。她從 1960 年起在坦尚尼亞貢貝觀察野生黑猩猩，強調長期、耐心的研究。',action:'觀察動物時，先記錄你看到的事實，不急著猜測原因。'},
  {id:'gombe',zone:'camp',icon:'02',title:'貢貝研究站',body:'貢貝位於坦尚尼亞坦干伊喀湖附近。長期研究幫助科學家理解黑猩猩的行為與生活史。',action:'記錄觀察日期、地點、行為和周圍環境。'},
  {id:'groom',zone:'observe',icon:'03',title:'互相理毛',body:'黑猩猩會互相整理毛髮。這不只是清潔，也能幫助維持社會關係。',action:'遠距觀察，記錄是誰主動開始理毛。'},
  {id:'food',zone:'observe',icon:'04',title:'黑猩猩的食物',body:'黑猩猩主要吃水果、葉子、種子及昆蟲，有時也會捕食其他動物。',action:'觀察牠們在哪裡覓食，並避免餵食野生動物。'},
  {id:'termite',zone:'tools',icon:'05',title:'樹枝取白蟻',body:'珍古德觀察到黑猩猩把樹枝伸進白蟻巢，再取出附著在樹枝上的白蟻。',action:'工具能幫助動物取得不容易直接拿到的食物。'},
  {id:'toolmake',zone:'tools',icon:'06',title:'製作工具',body:'有些黑猩猩會先除去樹枝上的葉片，再拿它取食白蟻，顯示牠們能改造自然材料。',action:'比較未處理與處理過的樹枝，思考哪一種更合適。'},
  {id:'habitat',zone:'protect',icon:'07',title:'棲地破碎化',body:'當森林被道路或開發分隔，動物移動與尋找食物的空間可能減少。',action:'保護森林與棲地連結，讓動物有足夠的生存空間。'},
  {id:'respect',zone:'protect',icon:'08',title:'尊重野生動物',body:'人類與黑猩猩距離太近，可能干擾動物，也可能傳播疾病。野外研究應遵守專業規範。',action:'不要追逐、觸摸、餵食或接近野生黑猩猩。'}
 ],
 questions:[
  {id:'qtool',title:'黑猩猩如何從白蟻巢取得白蟻？',options:['用樹枝伸入白蟻巢取食','丟石頭把樹撞倒','只等待白蟻自己飛出來'],correct:0,explain:'正確！珍古德觀察到黑猩猩能使用、甚至修整樹枝來取得白蟻。'},
  {id:'qforest',title:'哪種行動最有助於保護野生黑猩猩？',options:['靠近餵食，拍更清楚的照片','保護森林棲地，保持觀察距離','把野生黑猩猩帶回家飼養'],correct:1,explain:'答對了！保護棲地、降低干擾並避免傳播疾病，是保育的重要原則。'}
 ],
 challenges:['用 MakeCode 建造森林研究站與觀察平台','設計黑猩猩棲地和相連的森林綠廊','建立樹枝工具使用的科學展示區與解說牌']
};
