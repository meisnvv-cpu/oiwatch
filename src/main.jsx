import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowLeft, ArrowRight, ChevronRight, Clock3, Globe2, Instagram, Menu, MessageCircle, Minus, Play, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import './styles.css';
import { deleteAdminProduct, getAdminSession, getPublishedProduct, getSiteSettings, listAdminCustomers, listAdminOrders, listAdminProducts, listPublishedBrands, listPublishedProducts, listPublishedProductsPage, saveAdminProduct, saveSiteSettings, signInAdmin, signOutAdmin, uploadAdminMedia } from './supabase.js';

const watches = [
  {
    id: 'aurelia',
    collection: 'SIGNATURE 01',
    name: 'Aurelia Perpetual',
    subtitle: '铂金 · 自动机械',
    image: '/images/watch-aurelia-web.jpg',
    tone: 'light',
    description: '将建筑般的轮廓与极致纤薄的机械结构凝于腕间。冰霜纹理表盘随光线流转，呈现克制而罕见的光泽。',
    specs: [['表径', '40 MM'], ['动力储存', '72 小时'], ['材质', '950 铂金'], ['防水', '100 米']],
  },
  {
    id: 'celeste',
    collection: 'COMPLICATION 02',
    name: 'Céleste Moonphase',
    subtitle: '玫瑰金 · 月相',
    image: '/images/watch-celeste-web.jpg',
    tone: 'wine',
    description: '以微缩星空描绘月之周期。午夜蓝表盘与手工抛光玫瑰金相映，致敬高级制表最诗意的复杂功能。',
    specs: [['表径', '39 MM'], ['动力储存', '65 小时'], ['材质', '18K 玫瑰金'], ['表带', '鳄鱼皮']],
  },
  {
    id: 'monolith',
    collection: 'SPORT 03',
    name: 'Monolith Chronograph',
    subtitle: '黑色陶瓷 · 计时',
    image: '/images/watch-monolith-web.jpg',
    tone: 'dark',
    description: '专为当代收藏家打造的高性能计时杰作。哑光陶瓷表壳、导柱轮结构与垂直离合系统融为一体。',
    specs: [['表径', '42 MM'], ['动力储存', '80 小时'], ['材质', '高科技陶瓷'], ['防水', '150 米']],
  },
];


const demoProductSeed = [
  ['demo-rolex-submariner','Rolex','劳力士','潜航者型 Date 黑盘','Submariner Date Black',13800,190819,6837062,'经典黑色潜水表设计，配备旋转外圈、夜光时标和坚固精钢表带，适合日常与商务佩戴。','A classic black dive-watch design with rotating bezel, luminous markers and a robust steel bracelet.'],
  ['demo-rolex-daytona','Rolex','劳力士','宇宙计型迪通拿熊猫盘','Cosmograph Daytona Panda',16800,277390,4824611,'黑白熊猫盘搭配测速外圈，三眼计时布局清晰醒目，运动气息与高级质感兼具。','A high-contrast panda dial with tachymeter bezel and a balanced three-register chronograph layout.'],
  ['demo-patek-nautilus','Patek Philippe','百达翡丽','鹦鹉螺蓝盘钢带款','Nautilus Blue Dial',18800,280250,12976044,'横纹蓝色表盘与圆角八边形表壳相结合，纤薄轮廓带来舒适贴腕的佩戴体验。','A horizontally embossed blue dial meets a softly octagonal case in an elegant, slim sports-watch profile.'],
  ['demo-patek-aquanaut','Patek Philippe','百达翡丽','手雷橡胶带运动款','Aquanaut Sport',17800,1697214,36808264,'现代几何表盘搭配一体式橡胶表带，兼具轻盈感、运动感和鲜明辨识度。','Modern dial geometry and an integrated rubber strap create a light, distinctive sports-luxury look.'],
  ['demo-ap-royal-oak','Audemars Piguet','爱彼','皇家橡树蓝盘','Royal Oak Blue Dial',15800,364822,10728498,'八角形表圈、外露螺丝和格纹表盘构成标志性设计，拉丝与抛光细节层次丰富。','The signature octagonal bezel, exposed screws and textured dial combine brushed and polished finishing.'],
  ['demo-ap-offshore','Audemars Piguet','爱彼','皇家橡树离岸型计时','Royal Oak Offshore Chronograph',16900,125779,6184308,'更具力量感的表壳比例搭配计时功能和橡胶表带，呈现大胆的现代运动风格。','Bold case proportions, chronograph displays and a rubber strap deliver a powerful modern profile.'],
  ['demo-richard-rm11','Richard Mille','理查德米勒','RM 11-03 自动飞返计时','RM 11-03 Flyback Chronograph',21800,437037,1034067,'酒桶形表壳与镂空机械结构相互呼应，多层表盘展示复杂计时功能与未来感设计。','A tonneau case and openworked mechanics reveal a layered flyback chronograph with futuristic character.'],
  ['demo-richard-rm35','Richard Mille','理查德米勒','RM 35-02 碳纤维款','RM 35-02 Carbon',20800,956129,1034068,'轻量化碳纤维纹理表壳配合镂空表盘，强调运动性能和立体机械视觉。','A lightweight carbon-pattern case and skeleton dial emphasize athletic performance and mechanical depth.'],
  ['demo-vacheron-overseas','Vacheron Constantin','江诗丹顿','纵横四海蓝盘','Overseas Blue Dial',17200,47856,12560215,'深蓝漆面表盘配合一体式精钢表链，设计从容优雅，并带有鲜明旅行腕表气质。','A deep blue lacquered dial and integrated steel bracelet create a refined travel-watch presence.'],
  ['demo-cartier-santos','Cartier','卡地亚','山度士大号精钢款','Santos Large Steel',12800,998113,4809089,'方形表壳与外露螺丝形成经典建筑感，罗马数字表盘兼具优雅和日常实用性。','A square case, visible screws and Roman numerals form an architectural classic suited to daily wear.'],
  ['demo-omega-speedmaster','Omega','欧米茄','超霸月球表计时款','Speedmaster Moonwatch',11800,5344004,12560234,'黑色阶梯表盘、测速刻度和三眼计时布局延续经典工具腕表风格。','A black stepped dial, tachymeter scale and three-register layout continue an iconic tool-watch aesthetic.'],
  ['demo-omega-seamaster','Omega','欧米茄','海马潜水300米蓝盘','Seamaster Diver 300M',10800,9561404,8532972,'蓝色波纹表盘搭配陶瓷潜水外圈，夜光指针和排氦阀强化专业潜水风格。','A blue wave dial, ceramic dive bezel, luminous hands and helium valve give a professional marine look.'],
  ['demo-iwc-portugieser','IWC Schaffhausen','万国表','葡萄牙系列计时蓝针','Portugieser Chronograph',11600,32025019,8528416,'对称双眼计时盘、纤细阿拉伯数字与蓝钢指针，展现简洁而经典的正装气质。','Twin chronograph registers, slender numerals and blued hands create a clean, classical dress-watch style.'],
  ['demo-lange-one','A. Lange & Söhne','朗格','Lange 1 偏心大日历','Lange 1 Grand Date',19600,34069484,12221373,'偏心时间显示、大日历和动力储存构成黄金比例布局，德式机械美学清晰鲜明。','An off-centre time display, grand date and power reserve form a distinctive German design composition.'],
  ['demo-jaeger-reverso','Jaeger-LeCoultre','积家','Reverso 翻转系列','Reverso Classic',13200,34182730,6328383,'可翻转长方形表壳源自装饰艺术风格，线条利落，适合正装和个性化展示。','A reversible rectangular case rooted in Art Deco design offers clean lines and a distinctive presence.'],
  ['demo-breguet-classique','Breguet','宝玑','Classique 经典系列','Classique Automatic',14800,2113994,4431068,'玑镂表盘、宝玑指针和硬币纹表壳侧面共同呈现传统高级制表细节。','A guilloché dial, Breguet hands and coin-edge case display traditional fine-watchmaking codes.'],
  ['demo-blancpain-fifty','Blancpain','宝珀','五十噚深潜器','Fifty Fathoms Bathyscaphe',14300,404181,29280252,'宽阔夜光时标、单向旋转外圈和简洁潜水表布局，强调清晰读时与可靠感。','Broad luminous markers, a unidirectional bezel and a clean dive layout prioritize legibility.'],
  ['demo-hublot-bigbang','Hublot','宇舶表','Big Bang 黑色陶瓷','Big Bang Black Ceramic',13900,277319,8217166,'多层结构表壳、外露螺丝与橡胶表带结合，带来强烈现代工业视觉。','A layered ceramic case, exposed screws and rubber strap create a bold industrial visual identity.'],
  ['demo-panerai-luminor','Panerai','沛纳海','Luminor Marina 经典护桥','Luminor Marina',10900,380782,8322201,'大尺寸枕形表壳和标志性表冠护桥辨识度极高，三明治表盘读时清楚。','A cushion-shaped case, signature crown guard and sandwich dial deliver unmistakable character.'],
  ['demo-zenith-chrono','Zenith','真力时','Chronomaster Sport 白盘','Chronomaster Sport',12600,128619,8134891,'三色计时小盘与陶瓷测速外圈组合，呈现高频计时机芯的运动美学。','Tricolour chronograph counters and a ceramic scale bezel express a high-frequency sporting aesthetic.'],
];

const demoProducts = demoProductSeed.map(([id,brandEn,brandZh,nameZh,nameEn,price,imageId,videoId,descriptionZh,descriptionEn], index) => ({
  id, brandEn, brandZh, nameZh, nameEn, price:Math.round(price / 7.8), stock:1 + index % 4, descriptionZh, descriptionEn,
  updatedAt:`2026-07-${String(25 - index).padStart(2,'0')}T08:00:00Z`,
  media:[
    { id:`${id}-photo`, type:'image/jpeg', url:`https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=1200` },
    { id:`${id}-video`, type:'video/mp4', url:`https://www.pexels.com/download/video/${videoId}/` },
  ],
}));

const brandCatalog = [
  { en: 'Rolex', zh: '劳力士', enLines: ['Cosmograph Daytona', 'Submariner', 'Datejust', 'GMT-Master II'], zhLines: ['宇宙计型迪通拿', '潜航者型', '日志型', '格林尼治型 II'] },
  { en: 'Patek Philippe', zh: '百达翡丽', enLines: ['Nautilus', 'Aquanaut', 'Calatrava', 'Grand Complications'], zhLines: ['鹦鹉螺', '海底探险家', '卡拉卓华', '超级复杂功能'] },
  { en: 'Audemars Piguet', zh: '爱彼', enLines: ['Royal Oak', 'Royal Oak Offshore', 'Code 11.59', 'Concept'], zhLines: ['皇家橡树', '皇家橡树离岸型', '系列 11.59', '皇家橡树概念'] },
  { en: 'Vacheron Constantin', zh: '江诗丹顿', enLines: ['Overseas', 'Patrimony', 'Traditionnelle', 'Historiques'], zhLines: ['纵横四海', '传承', '经典', '历史名作'] },
  { en: 'Richard Mille', zh: '理查米尔', enLines: ['Racing Machines', 'Sports Collection', 'Tourbillons', 'Ladies’ Collection'], zhLines: ['赛车机械', '运动系列', '陀飞轮系列', '女士系列'] },
  { en: 'Cartier', zh: '卡地亚', enLines: ['Santos', 'Tank', 'Ballon Bleu', 'Panthère'], zhLines: ['山度士', '坦克', '蓝气球', '猎豹'] },
  { en: 'Omega', zh: '欧米茄', enLines: ['Speedmaster', 'Seamaster', 'Constellation', 'De Ville'], zhLines: ['超霸', '海马', '星座', '碟飞'] },
  { en: 'IWC Schaffhausen', zh: '万国表', enLines: ['Pilot’s Watches', 'Portugieser', 'Ingenieur', 'Portofino'], zhLines: ['飞行员', '葡萄牙', '工程师', '柏涛菲诺'] },
  { en: 'A. Lange & Söhne', zh: '朗格', enLines: ['Lange 1', 'Saxonia', 'Odysseus', 'Zeitwerk'], zhLines: ['朗格一号', '萨克森', '奥德修斯', '时间机械'] },
  { en: 'Jaeger-LeCoultre', zh: '积家', enLines: ['Reverso', 'Master Control', 'Polaris', 'Rendez-Vous'], zhLines: ['翻转', '大师', '北宸', '约会'] },
  { en: 'Breguet', zh: '宝玑', enLines: ['Classique', 'Tradition', 'Marine', 'Type XX'], zhLines: ['经典', '传世', '航海', '二十号'] },
  { en: 'Blancpain', zh: '宝珀', enLines: ['Fifty Fathoms', 'Villeret', 'Air Command', 'Ladybird'], zhLines: ['五十噚', '经典', '空军司令', '贵妇鸟'] },
  { en: 'Hublot', zh: '宇舶表', enLines: ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang', 'Square Bang'], zhLines: ['大爆炸', '经典融合', '灵魂大爆炸', '方形大爆炸'] },
  { en: 'Panerai', zh: '沛纳海', enLines: ['Luminor', 'Submersible', 'Radiomir', 'Luminor Due'], zhLines: ['庐米诺', '潜行', '镭得米尔', '庐米诺杜尔'] },
  { en: 'Piaget', zh: '伯爵', enLines: ['Polo', 'Altiplano', 'Limelight Gala', 'Possession'], zhLines: ['伯爵马球', '至臻超薄', '璀璨之旅', '时来运转'] },
  { en: 'Chopard', zh: '萧邦', enLines: ['Alpine Eagle', 'L.U.C', 'Mille Miglia', 'Happy Sport'], zhLines: ['雪山傲翼', '高级制表', '经典赛车', '快乐钻石'] },
  { en: 'Girard-Perregaux', zh: '芝柏表', enLines: ['Laureato', 'Bridges', '1966', 'Cat’s Eye'], zhLines: ['桂冠', '金桥', '一九六六', '猫眼'] },
  { en: 'Ulysse Nardin', zh: '雅典表', enLines: ['Diver', 'Freak', 'Marine', 'Blast'], zhLines: ['潜水', '奇想', '航海', '鎏金'] },
  { en: 'Zenith', zh: '真力时', enLines: ['Chronomaster', 'Defy', 'Pilot', 'Elite'], zhLines: ['旗舰', '巅峰', '飞行员', '菁英'] },
  { en: 'Breitling', zh: '百年灵', enLines: ['Navitimer', 'Superocean', 'Chronomat', 'Premier'], zhLines: ['航空计时', '超级海洋', '机械计时', '璞雅'] },
  { en: 'Tudor', zh: '帝舵表', enLines: ['Black Bay', 'Pelagos', 'Ranger', 'Royal'], zhLines: ['碧湾', '领潜', '游侠', '皇家'] },
  { en: 'TAG Heuer', zh: '泰格豪雅', enLines: ['Carrera', 'Monaco', 'Aquaracer', 'Formula 1'], zhLines: ['卡莱拉', '摩纳哥', '竞潜', '一级方程式'] },
  { en: 'Grand Seiko', zh: '冠蓝狮', enLines: ['Heritage', 'Evolution 9', 'Sport', 'Elegance'], zhLines: ['传承', '进化九型', '运动', '优雅'] },
  { en: 'Glashütte Original', zh: '格拉苏蒂原创', enLines: ['Pano', 'Senator', 'SeaQ', 'Vintage'], zhLines: ['偏心', '议员', '开拓', '复古'] },
  { en: 'Parmigiani Fleurier', zh: '帕玛强尼', enLines: ['Tonda PF', 'Toric', 'Kalpa', 'Fleurier'], zhLines: ['通达', '托里克', '卡帕', '弗勒里耶'] },
  { en: 'H. Moser & Cie.', zh: '亨利慕时', enLines: ['Streamliner', 'Endeavour', 'Pioneer', 'Heritage'], zhLines: ['疾速者', '勇创者', '开拓者', '传承者'] },
  { en: 'F.P. Journe', zh: '弗朗索瓦保罗儒纳', enLines: ['Chronomètre Souverain', 'Octa', 'Automatique', 'Élégante'], zhLines: ['卓越精密计时', '八日动力', '自动系列', '优雅系列'] },
  { en: 'Roger Dubuis', zh: '罗杰杜彼', enLines: ['Excalibur', 'Knights of the Round Table', 'Velvet', 'Hyper Horology'], zhLines: ['王者', '圆桌骑士', '名伶', '超卓复杂'] },
  { en: 'Jacob & Co.', zh: '杰克宝', enLines: ['Astronomia', 'Epic X', 'Bugatti', 'Opera'], zhLines: ['天体运行', '史诗', '布加迪', '歌剧'] },
  { en: 'Bovet', zh: '播威', enLines: ['Récital', 'Virtuoso', 'Miss Audrey', 'Orbis Mundi'], zhLines: ['播威十八', '典藏家', '奥黛丽小姐', '世界时'] },
  { en: 'Bell & Ross', zh: '柏莱士', enLines: ['BR 03', 'BR 05', 'BR-X5', 'Vintage'], zhLines: ['方形仪表', '都市', '先锋', '复古'] },
  { en: 'Hermès', zh: '爱马仕', enLines: ['H08', 'Arceau', 'Cape Cod', 'Cut'], zhLines: ['漫游时光', '阿尔索', '开普敦', '爱马仕剪影'] },
  { en: 'Bulgari', zh: '宝格丽', enLines: ['Octo', 'Serpenti', 'Aluminium', 'Divas’ Dream'], zhLines: ['八角', '灵蛇', '铝金属', '璀璨之梦'] },
  { en: 'Montblanc', zh: '万宝龙', enLines: ['1858', 'Star Legacy', 'Bohème', 'Heritage'], zhLines: ['一八五八', '明星传承', '宝曦', '传承'] },
  { en: 'Baume & Mercier', zh: '名士表', enLines: ['Riviera', 'Clifton', 'Hampton', 'Classima'], zhLines: ['利维拉', '克里顿', '汉伯顿', '克莱斯麦'] },
  { en: 'Longines', zh: '浪琴表', enLines: ['Spirit', 'Master Collection', 'Conquest', 'DolceVita'], zhLines: ['先行者', '名匠', '康卡斯', '黛绰维纳'] },
  { en: 'Oris', zh: '豪利时', enLines: ['Aquis', 'Divers', 'Big Crown', 'ProPilot'], zhLines: ['潜水', '复刻潜水', '大表冠', '航空'] },
  { en: 'NOMOS Glashütte', zh: '诺莫斯', enLines: ['Tangente', 'Club', 'Metro', 'Ludwig'], zhLines: ['切线', '俱乐部', '都市', '路德维希'] },
  { en: 'Frederique Constant', zh: '康斯登', enLines: ['Manufacture', 'Highlife', 'Classics', 'Slimline'], zhLines: ['自家机芯', '百年典雅', '经典', '超薄'] },
  { en: 'Carl F. Bucherer', zh: '宝齐莱', enLines: ['Manero', 'Patravi', 'Heritage', 'Adamavi'], zhLines: ['马利龙', '柏拉维', '传承', '爱德玛尔'] },
];

const watchContent = {
  aurelia: {
    zh: { collection: '典藏系列 一', name: '曦光万年历', subtitle: '铂金 · 自动机械', description: '将建筑般的轮廓与极致纤薄的机械结构凝于腕间。冰霜纹理表盘随光线流转，呈现克制而罕见的光泽。', specs: [['表径', '40 毫米'], ['动力储存', '72 小时'], ['材质', '950 铂金'], ['防水', '100 米']] },
    en: { collection: 'SIGNATURE 01', name: 'Aurelia Perpetual', subtitle: 'Platinum · Automatic', description: 'Architectural lines meet an exceptionally slim mechanical calibre. Its frost-textured dial shifts gently with the light.', specs: [['Diameter', '40 MM'], ['Power reserve', '72 HOURS'], ['Material', '950 PLATINUM'], ['Water resistance', '100 M']] },
  },
  celeste: {
    zh: { collection: '复杂功能 二', name: '星穹月相', subtitle: '玫瑰金 · 月相', description: '以微缩星空描绘月之周期。午夜蓝表盘与手工抛光玫瑰金相映，致敬高级制表最诗意的复杂功能。', specs: [['表径', '39 毫米'], ['动力储存', '65 小时'], ['材质', '18K 玫瑰金'], ['表带', '鳄鱼皮']] },
    en: { collection: 'COMPLICATION 02', name: 'Céleste Moonphase', subtitle: 'Rose gold · Moonphase', description: 'A miniature night sky traces the lunar cycle. A midnight-blue dial meets hand-polished rose gold.', specs: [['Diameter', '39 MM'], ['Power reserve', '65 HOURS'], ['Material', '18K ROSE GOLD'], ['Strap', 'ALLIGATOR']] },
  },
  monolith: {
    zh: { collection: '运动系列 三', name: '玄石计时码表', subtitle: '黑色陶瓷 · 计时', description: '专为当代收藏家打造的高性能计时杰作。哑光陶瓷表壳、导柱轮结构与垂直离合系统融为一体。', specs: [['表径', '42 毫米'], ['动力储存', '80 小时'], ['材质', '高科技陶瓷'], ['防水', '150 米']] },
    en: { collection: 'SPORT 03', name: 'Monolith Chronograph', subtitle: 'Black ceramic · Chronograph', description: 'A high-performance chronograph for the contemporary collector, uniting matte ceramic with a column-wheel calibre.', specs: [['Diameter', '42 MM'], ['Power reserve', '80 HOURS'], ['Material', 'CERAMIC'], ['Water resistance', '150 M']] },
  },
};

const extraWatchContent = {
  ja: [
    ['シグネチャー 01', 'アウレリア・パーペチュアル', 'プラチナ · 自動巻き', '建築的な造形と薄型機械式ムーブメントを融合した、静謐なプラチナ製タイムピース。'],
    ['コンプリケーション 02', 'セレステ・ムーンフェイズ', 'ローズゴールド · ムーンフェイズ', '真夜中の青い文字盤に月の周期を描いた、詩的な複雑時計。'],
    ['スポーツ 03', 'モノリス・クロノグラフ', 'ブラックセラミック · クロノグラフ', 'マットセラミックと高性能クロノグラフ機構を組み合わせた現代的な一本。'],
  ],
  ko: [
    ['시그니처 01', '아우렐리아 퍼페추얼', '플래티넘 · 오토매틱', '건축적인 선과 얇은 기계식 무브먼트가 조화를 이루는 절제된 플래티넘 타임피스.'],
    ['컴플리케이션 02', '셀레스트 문페이즈', '로즈 골드 · 문페이즈', '한밤의 푸른 다이얼 위에 달의 주기를 표현한 시적인 컴플리케이션.'],
    ['스포츠 03', '모놀리스 크로노그래프', '블랙 세라믹 · 크로노그래프', '매트 세라믹과 고성능 크로노그래프 메커니즘을 결합한 현대적인 시계.'],
  ],
  fr: [
    ['SIGNATURE 01', 'Aurelia Perpetual', 'Platine · Automatique', 'Des lignes architecturales associées à un mouvement mécanique extra-plat dans une pièce en platine d’une grande sobriété.'],
    ['COMPLICATION 02', 'Céleste Moonphase', 'Or rose · Phase de lune', 'Un cadran bleu nuit représente le cycle lunaire dans une complication horlogère poétique.'],
    ['SPORT 03', 'Monolith Chronograph', 'Céramique noire · Chronographe', 'La céramique mate rencontre un mécanisme chronographe haute performance résolument contemporain.'],
  ],
  de: [
    ['SIGNATUR 01', 'Aurelia Perpetual', 'Platin · Automatik', 'Architektonische Linien und ein besonders flaches mechanisches Werk vereinen sich in einer zurückhaltenden Platinuhr.'],
    ['KOMPLIKATION 02', 'Céleste Moonphase', 'Roségold · Mondphase', 'Ein nachtblaues Zifferblatt zeichnet den Mondzyklus in einer poetischen Komplikation nach.'],
    ['SPORT 03', 'Monolith Chronograph', 'Schwarze Keramik · Chronograph', 'Matte Keramik trifft auf einen leistungsstarken Chronographenmechanismus für moderne Sammler.'],
  ],
  es: [
    ['FIRMA 01', 'Aurelia Perpetual', 'Platino · Automático', 'Líneas arquitectónicas y un movimiento mecánico ultrafino se unen en una sobria pieza de platino.'],
    ['COMPLICACIÓN 02', 'Céleste Moonphase', 'Oro rosa · Fase lunar', 'Una esfera azul medianoche representa el ciclo lunar mediante una complicación poética.'],
    ['DEPORTE 03', 'Monolith Chronograph', 'Cerámica negra · Cronógrafo', 'Cerámica mate y un mecanismo cronográfico de alto rendimiento para el coleccionista contemporáneo.'],
  ],
};

const languageOptions = [
  ['zh', '中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'],
  ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'],
];
const ISO_COUNTRY_CODES = 'AF,AX,AL,DZ,AS,AD,AO,AI,AQ,AG,AR,AM,AW,AU,AT,AZ,BS,BH,BD,BB,BY,BE,BZ,BJ,BM,BT,BO,BQ,BA,BW,BV,BR,IO,BN,BG,BF,BI,CV,KH,CM,CA,KY,CF,TD,CL,CN,CX,CC,CO,KM,CG,CD,CK,CR,CI,HR,CU,CW,CY,CZ,DK,DJ,DM,DO,EC,EG,SV,GQ,ER,EE,SZ,ET,FK,FO,FJ,FI,FR,GF,PF,TF,GA,GM,GE,DE,GH,GI,GR,GL,GD,GP,GU,GT,GG,GN,GW,GY,HT,HM,VA,HN,HK,HU,IS,IN,ID,IR,IQ,IE,IM,IL,IT,JM,JP,JE,JO,KZ,KE,KI,KP,KR,KW,KG,LA,LV,LB,LS,LR,LY,LI,LT,LU,MO,MG,MW,MY,MV,ML,MT,MH,MQ,MR,MU,YT,MX,FM,MD,MC,MN,ME,MS,MA,MZ,MM,NA,NR,NP,NL,NC,NZ,NI,NE,NG,NU,NF,MK,MP,NO,OM,PK,PW,PS,PA,PG,PY,PE,PH,PN,PL,PT,PR,QA,RE,RO,RU,RW,BL,SH,KN,LC,MF,PM,VC,WS,SM,ST,SA,SN,RS,SC,SL,SG,SX,SK,SI,SB,SO,ZA,GS,SS,ES,LK,SD,SR,SJ,SE,CH,SY,TW,TJ,TZ,TH,TL,TG,TK,TO,TT,TN,TR,TM,TC,TV,UG,UA,AE,GB,US,UM,UY,UZ,VU,VE,VN,VG,VI,WF,EH,YE,ZM,ZW'.split(',');

const brandDomainCatalog = [
  'rolex.com','patek.com','audemarspiguet.com','vacheron-constantin.com','richardmille.com',
  'cartier.com','omegawatches.com','iwc.com','alange-soehne.com','jaeger-lecoultre.com',
  'breguet.com','blancpain.com','hublot.com','panerai.com','piaget.com',
  'chopard.com','girard-perregaux.com','ulysse-nardin.com','zenith-watches.com','breitling.com',
  'tudorwatch.com','tagheuer.com','grand-seiko.com','glashuette-original.com','parmigiani.com',
  'h-moser.com','fpjourne.com','rogerdubuis.com','jacobandco.com','bovet.com',
  'bellross.com','hermes.com','bulgari.com','montblanc.com','baume-et-mercier.com',
  'longines.com','oris.ch','nomos-glashuette.com','frederiqueconstant.com','carl-f-bucherer.com',
];

const jacobBrand = brandCatalog.find(brand => brand.en === 'Jacob & Co.');
const leadingBrands = brandCatalog.filter(brand => ['Rolex', 'Patek Philippe', 'Audemars Piguet'].includes(brand.en));
const brands = [
  ...leadingBrands,
  { ...jacobBrand, zh: '捷克豹' },
  ...brandCatalog.filter(brand => !['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Jacob & Co.', 'Oris'].includes(brand.en)),
];
const brandDomainByName = Object.fromEntries(brandCatalog.map((brand, index) => [brand.en, brandDomainCatalog[index]]));
const brandDomains = brands.map(brand => brandDomainByName[brand.en]);

const brandLogoOverrides = {
  'Richard Mille': 'https://commons.wikimedia.org/wiki/Special:FilePath/Richard_Mille_Logo.svg',
  'A. Lange & Söhne': 'https://commons.wikimedia.org/wiki/Special:FilePath/Alange_soehne_logo.svg',
};

function SiteLogo({ className = '', ...props }) {
  return <a href="/" className={`site-logo ${className}`.trim()} {...props}>
    <img src="/images/oiwatch-logo-web.png" alt="OiWatch"/>
  </a>;
}

const factoryTagPattern = /\b(CLEAN(?:\s+FACTORY)?|VSF|VS\s+FACTORY|APSF|APS|PPF|ZF|BTF|QF|THBF?|BVF|JBF|AF|GMF|ARF|CF|3KF?|EWF|GSF|MKS|N6F|OMF|ORF|TWF?|V9F|YLF|YSF|VRF|WWF)\b/i;
const modelTagPattern = /\b(RM\s?\d{2,3}(?:[- ]\d{1,3})?|PAM\s?\d{3,4}|IW\s?\d{5,8}|BR\s?\d{2}(?:[- ]?[A-Z0-9]+)?|[A-Z]{0,3}\d{4,6}[A-Z]{0,3})\b/i;

function deriveProductTags(product) {
  const title = `${product.nameZh || ''} ${product.nameEn || ''}`;
  return [...new Set([
    ...(product.tags || []),
    product.brandEn,
    product.brandZh,
    title.match(modelTagPattern)?.[1],
    title.match(factoryTagPattern)?.[1],
  ].map(tag => String(tag || '').trim()).filter(Boolean))];
}

function getWatchContent(id, lang) {
  if (lang === 'zh' || lang === 'en') return watchContent[id][lang];
  const index = ['aurelia', 'celeste', 'monolith'].indexOf(id);
  const [collection, name, subtitle, description] = extraWatchContent[lang][index];
  const labels = {
    ja: ['ケース径', 'パワーリザーブ', '素材', '防水性能'],
    ko: ['직경', '파워 리저브', '소재', '방수'],
    fr: ['Diamètre', 'Réserve de marche', 'Matière', 'Étanchéité'],
    de: ['Durchmesser', 'Gangreserve', 'Material', 'Wasserdichtheit'],
    es: ['Diámetro', 'Reserva de marcha', 'Material', 'Hermeticidad'],
  }[lang];
  const values = index === 0 ? ['40 mm', '72 h', lang === 'ja' ? 'プラチナ' : lang === 'ko' ? '플래티넘' : lang === 'fr' ? 'Platine' : lang === 'de' ? 'Platin' : 'Platino', '100 m']
    : index === 1 ? ['39 mm', '65 h', lang === 'ja' ? 'ローズゴールド' : lang === 'ko' ? '로즈 골드' : lang === 'fr' ? 'Or rose' : lang === 'de' ? 'Roségold' : 'Oro rosa', '50 m']
    : ['42 mm', '80 h', lang === 'ja' ? 'セラミック' : lang === 'ko' ? '세라믹' : lang === 'fr' ? 'Céramique' : lang === 'de' ? 'Keramik' : 'Cerámica', '150 m'];
  return { collection, name, subtitle, description, specs: labels.map((label, i) => [label, values[i]]) };
}

const EDIT_STORE = 'oiwatch-visual-edits';
const openMediaDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('oiwatch-media', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('files');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const saveMedia = async file => {
  const db = await openMediaDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    transaction.objectStore('files').put(file, id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  return id;
};
const loadMedia = async id => {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction('files').objectStore('files').get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

function VisualEditor() {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const editsRef = useRef(JSON.parse(localStorage.getItem(EDIT_STORE) || '{}'));

  useEffect(() => {
    const assignKeys = () => {
      document.querySelectorAll('main h1,main h2,main h3,main p,main span,main button,footer p,footer span,img').forEach((element, index) => {
        if (!element.closest('.visual-editor') && !element.dataset.editKey) element.dataset.editKey = `${element.tagName.toLowerCase()}-${index}`;
      });
    };
    const applyEdits = async () => {
      assignKeys();
      for (const [key, edit] of Object.entries(editsRef.current)) {
        const element = document.querySelector(`[data-edit-key="${key}"]`);
        if (!element) continue;
        if (edit.html && !element.matches('img,video') && element.innerHTML !== edit.html) element.innerHTML = edit.html;
        if (edit.style) Object.assign(element.style, edit.style);
        if (edit.mediaId) {
          const blob = await loadMedia(edit.mediaId).catch(() => null);
          if (!blob) continue;
          const url = URL.createObjectURL(blob);
          if (edit.mediaType.startsWith('video')) {
            if (element.tagName !== 'VIDEO') {
              const video = document.createElement('video');
              video.dataset.editKey = key;
              video.controls = true; video.loop = true; video.muted = true; video.playsInline = true;
              video.className = element.className; video.src = url;
              element.replaceWith(video);
            } else element.src = url;
          } else if (element.tagName === 'IMG') element.src = url;
        }
      }
    };
    applyEdits();
    const observer = new MutationObserver(() => window.setTimeout(applyEdits, 30));
    observer.observe(document.getElementById('root'), { childList:true, subtree:true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editing) return;
    document.body.classList.add('visual-editing');
    const handleClick = event => {
      const element = event.target.closest('[data-edit-key]');
      if (!element || element.closest('.visual-editor')) return;
      event.preventDefault(); event.stopPropagation();
      setSelected(element);
      document.querySelectorAll('.editor-selected').forEach(node => node.classList.remove('editor-selected'));
      element.classList.add('editor-selected');
      if (element.matches('img,video')) return;
      element.contentEditable = 'true';
      element.focus();
      element.addEventListener('blur', () => {
        element.contentEditable = 'false';
        editsRef.current[element.dataset.editKey] = { ...(editsRef.current[element.dataset.editKey] || {}), html:element.innerHTML };
        localStorage.setItem(EDIT_STORE, JSON.stringify(editsRef.current));
        setStatus('已保存');
      }, { once:true });
    };
    document.addEventListener('click', handleClick, true);
    return () => { document.removeEventListener('click', handleClick, true); document.body.classList.remove('visual-editing'); };
  }, [editing]);

  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file || !selected) return;
    const id = await saveMedia(file);
    editsRef.current[selected.dataset.editKey] = { ...(editsRef.current[selected.dataset.editKey] || {}), mediaId:id, mediaType:file.type };
    localStorage.setItem(EDIT_STORE, JSON.stringify(editsRef.current));
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.dataset.editKey = selected.dataset.editKey; video.controls = true; video.loop = true; video.muted = true; video.playsInline = true;
      video.className = selected.className; video.src = url; selected.replaceWith(video); setSelected(video);
    } else selected.src = url;
    setStatus('媒体已保存');
  };

  const updateStyle = (property, value) => {
    if (!selected) return;
    selected.style[property] = value;
    editsRef.current[selected.dataset.editKey] = { ...(editsRef.current[selected.dataset.editKey] || {}), style:{ ...(editsRef.current[selected.dataset.editKey]?.style || {}), [property]:value } };
    localStorage.setItem(EDIT_STORE, JSON.stringify(editsRef.current));
  };

  const exportEdits = () => {
    const blob = new Blob([JSON.stringify(editsRef.current, null, 2)], { type:'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'oiwatch-page-edits.json'; link.click();
  };

  return <div className="visual-editor">
    <button className="editor-toggle" onClick={() => { setEditing(value => !value); setSelected(null); }}>{editing ? '退出编辑' : '编辑网站'}</button>
    {editing && <aside className="editor-panel">
      <h3>可视化编辑器</h3><p>点击页面中的文字、按钮或图片进行修改。</p>
      <label className="upload-control">上传图片或视频<input type="file" accept="image/*,video/*" onChange={upload}/></label>
      <label>文字颜色<input type="color" onChange={event => updateStyle('color',event.target.value)}/></label>
      <label>背景颜色<input type="color" onChange={event => updateStyle('backgroundColor',event.target.value)}/></label>
      <label>字体大小<input type="range" min="8" max="120" onChange={event => updateStyle('fontSize',`${event.target.value}px`)}/></label>
      <label>内边距<input type="range" min="0" max="100" onChange={event => updateStyle('padding',`${event.target.value}px`)}/></label>
      <button onClick={exportEdits}>导出页面设置</button>
      <button className="editor-reset" onClick={() => { if (confirm('确定恢复所有页面内容和样式吗？')) { localStorage.removeItem(EDIT_STORE); location.reload(); } }}>恢复默认页面</button>
      <small>{status || (selected ? `正在编辑：${selected.tagName}` : '尚未选择元素')}</small>
    </aside>}
  </div>;
}

function AdminDashboard({ products, setProducts, onClose, session }) {
  const emptyForm = { id:null, nameZh:'', nameEn:'', descriptionZh:'', translations:{}, brandEn:brands[0].en, price:'', stock:'1', status:'published', media:[], tags:[] };
  const [form, setForm] = useState(emptyForm);
  const [translating, setTranslating] = useState(false);
  const [view, setView] = useState('products');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [siteSettings, setSiteSettings] = useState(() => JSON.parse(localStorage.getItem('oiwatch-site-settings') || '{"storeName":"OiWatch","whatsapp":"+852 6651 0124","defaultCurrency":"USD","eurRate":0.92}'));
  const [settingsSaved, setSettingsSaved] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]:value }));
  const uploadFiles = async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadStatus(`正在上传 0 / ${files.length}`);
    const productId = form.id || `draft-${Date.now()}`;
    try {
      const media = [];
      for (const [index, file] of files.entries()) {
        media.push(await uploadAdminMedia(session, file, productId));
        setUploadStatus(`正在上传 ${index + 1} / ${files.length}`);
      }
      setForm(current => ({ ...current, media:[...current.media, ...media] }));
      setUploadStatus(`已上传 ${files.length} 个文件到云端`);
    } catch (error) {
      setUploadStatus(error.message || '上传失败，请稍后重试');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  const saveProduct = async event => {
    event.preventDefault();
    const brand = brands.find(item => item.en === form.brandEn);
    const productBase = { ...form, id:form.id || `product-${Date.now()}`, brandZh:brand.zh, price:Number(form.price), stock:Number(form.stock), updatedAt:new Date().toISOString() };
    const product = { ...productBase, tags:deriveProductTags(productBase) };
    setSaving(true);
    setSaveError('');
    try {
      const saved = await saveAdminProduct(session, product);
      setProducts(items => form.id ? items.map(item => item.id === form.id ? saved : item) : [saved, ...items]);
      setForm(emptyForm);
      setView('products');
    } catch (error) {
      setSaveError(error.message || '商品保存失败，请稍后重试。');
    } finally {
      setSaving(false);
    }
  };
  const removeProduct = async productId => {
    if (!confirm('确定删除这个商品吗？')) return;
    try {
      await deleteAdminProduct(session, productId);
      setProducts(items => items.filter(item => item.id !== productId));
    } catch (error) {
      alert(error.message || '删除失败，请稍后重试。');
    }
  };
  const editProduct = product => { setForm(product); setView('editor'); };
  const autoTranslate = async () => {
    if (!form.nameZh || !form.descriptionZh) return alert('请先填写中文商品名称和中文商品简介。');
    setTranslating(true);
    const targets = { en:'en', ja:'ja', ko:'ko', fr:'fr', de:'de', es:'es' };
    try {
      const entries = await Promise.all(Object.entries(targets).map(async ([key,target]) => {
        const translate = async text => {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-CN|${target}`);
          if (!response.ok) throw new Error('translation failed');
          const data = await response.json();
          return data.responseData.translatedText;
        };
        return [key, { name:await translate(form.nameZh), description:await translate(form.descriptionZh) }];
      }));
      const translations = Object.fromEntries(entries);
      setForm(current => ({ ...current, nameEn:translations.en.name, translations }));
    } catch {
      alert('自动翻译服务暂时无法连接，请检查网络后重试。中文原稿不会丢失。');
    } finally { setTranslating(false); }
  };
  const visible = products.filter(product => `${product.nameZh} ${product.nameEn} ${product.brandEn} ${product.brandZh} ${(product.tags || []).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  useEffect(() => {
    Promise.all([listAdminOrders(session), listAdminCustomers(session), getSiteSettings()])
      .then(([cloudOrders, cloudCustomers, cloudSettings]) => {
        setOrders(cloudOrders);
        setCustomers(cloudCustomers);
        setSiteSettings(cloudSettings);
      })
      .catch(error => setSaveError(error.message));
  }, [session]);
  const saveSettings = async event => {
    event.preventDefault();
    try {
      const saved = await saveSiteSettings(session, siteSettings);
      setSiteSettings(saved);
      localStorage.setItem('oiwatch-site-settings', JSON.stringify(saved));
      setSettingsSaved(true);
      window.setTimeout(() => setSettingsSaved(false), 1800);
    } catch (error) {
      setSaveError(error.message);
    }
  };

  return <div className="admin-dashboard">
    <aside className="admin-sidebar">
      <SiteLogo/>
      <nav><button className={view==='products'?'active':''} onClick={()=>setView('products')}>商品管理</button><button className={view==='editor'?'active':''} onClick={()=>{setForm(emptyForm);setView('editor')}}>添加商品</button><button className={view==='orders'?'active':''} onClick={()=>setView('orders')}>订单</button><button className={view==='customers'?'active':''} onClick={()=>setView('customers')}>客户</button><button className={view==='settings'?'active':''} onClick={()=>setView('settings')}>网站设置</button></nav>
      <button className="admin-exit" onClick={onClose}>返回店铺</button>
    </aside>
    <main className="admin-main">
      {view === 'orders' ? <>
        <header className="admin-title"><div><p>销售</p><h1>订单管理</h1></div><span>{orders.length} 个订单</span></header>
        <div className="admin-panel">
          {orders.length === 0 ? <div className="admin-empty"><ShoppingBag/><h2>暂无订单</h2><p>客户完成结算后，订单会显示在这里。</p></div> :
            <div className="simple-admin-table"><div><strong>订单号</strong><strong>客户</strong><strong>金额</strong><strong>状态</strong></div>{orders.map(order=><div key={order.id}><span>{order.id}</span><span>{order.name}</span><span>{order.currency} {order.total}</span><span>{order.status || '待处理'}</span></div>)}</div>}
        </div>
      </> : view === 'customers' ? <>
        <header className="admin-title"><div><p>关系管理</p><h1>客户</h1></div><span>{customers.length} 位客户</span></header>
        <div className="admin-panel">
          {customers.length === 0 ? <div className="admin-empty"><Globe2/><h2>暂无客户资料</h2><p>产生订单后，客户联系方式会自动汇总到这里。</p></div> :
            <div className="simple-admin-table"><div><strong>姓名</strong><strong>邮箱</strong><strong>电话</strong><strong>订单数</strong></div>{customers.map(customer=><div key={customer.email}><span>{customer.name}</span><span>{customer.email}</span><span>{customer.phone}</span><span>{customer.orders}</span></div>)}</div>}
        </div>
      </> : view === 'settings' ? <>
        <header className="admin-title"><div><p>店铺</p><h1>网站设置</h1></div></header>
        <form className="admin-settings" onSubmit={saveSettings}>
          <section><h2>基本设置</h2><label>店铺名称<input value={siteSettings.storeName} onChange={event=>setSiteSettings({...siteSettings,storeName:event.target.value})}/></label><label>WhatsApp 客服号码<input value={siteSettings.whatsapp} onChange={event=>setSiteSettings({...siteSettings,whatsapp:event.target.value})}/></label></section>
          <section><h2>货币设置</h2><p className="section-help">全站商品统一使用美元（USD）计价与结算。</p></section>
          <button type="submit">{settingsSaved ? '已保存' : '保存网站设置'}</button>
        </form>
      </> : view === 'products' ? <>
        <header className="admin-title"><div><p>商品</p><h1>商品管理</h1></div><button onClick={()=>{setForm(emptyForm);setView('editor')}}>＋ 添加商品</button></header>
        <div className="admin-toolbar"><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="搜索商品或品牌"/><span>{products.length} 件商品</span></div>
        <div className="product-table">
          <div className="table-head"><span>商品</span><span>状态</span><span>库存</span><span>价格</span><span>操作</span></div>
          {visible.length === 0 ? <div className="admin-empty"><ShoppingBag/><h2>尚未添加商品</h2><p>添加您的第一件腕表商品。</p><button onClick={()=>setView('editor')}>添加商品</button></div> : visible.map(product => <article key={product.id}>
            <div className="admin-product-name">{product.media?.[0]?.url ? <img src={product.media[0].url} alt=""/> : <div/>}<span><strong>{product.nameZh || product.nameEn}</strong><small>{product.brandZh} · {product.nameEn}</small></span></div>
            <span className={`status ${product.status}`}>{product.status === 'published' ? '已发布' : '草稿'}</span><span>{product.stock}</span><span>US$ {Number(product.price).toLocaleString()}</span><div className="table-actions"><button onClick={()=>editProduct(product)}>编辑</button><button onClick={()=>removeProduct(product.id)}>删除</button></div>
          </article>)}
        </div>
      </> : <form className="product-editor" onSubmit={saveProduct}>
        <header className="admin-title"><div><p>{form.id?'编辑':'新建'}商品</p><h1>{form.id?'编辑商品':'添加商品'}</h1>{saveError && <span className="admin-save-error">{saveError}</span>}</div><div><button type="button" className="secondary" onClick={()=>setView('products')}>取消</button><button type="submit" disabled={saving || uploading}>{saving ? '正在保存…' : '保存商品'}</button></div></header>
        <div className="editor-columns"><div>
          <section><h2>基本资料</h2><label>中文商品名称<input required value={form.nameZh} onChange={event=>update('nameZh',event.target.value)} placeholder="例如：劳力士潜航者型"/></label><label>中文商品简介<textarea required rows="5" value={form.descriptionZh} onChange={event=>update('descriptionZh',event.target.value)} placeholder="填写材质、尺寸、年份、成色及商品特点"/></label><label>品牌<select value={form.brandEn} onChange={event=>update('brandEn',event.target.value)}>{brands.map(brand=><option key={brand.en}>{brand.en}</option>)}</select></label><button type="button" className="translate-button" onClick={autoTranslate} disabled={translating}>{translating?'正在生成六种语言…':'自动翻译为其他六种语言'}</button></section>
          {Object.keys(form.translations || {}).length > 0 && <section><h2>多语言译文</h2><p className="section-help">自动译文可以逐项修改，中文原稿始终保留。</p>{[['en','英语'],['ja','日语'],['ko','韩语'],['fr','法语'],['de','德语'],['es','西班牙语']].map(([code,label])=><div className="translation-block" key={code}><strong>{label}</strong><input value={form.translations[code]?.name||''} onChange={event=>setForm(current=>({...current,translations:{...current.translations,[code]:{...current.translations[code],name:event.target.value}}}))}/><textarea rows="3" value={form.translations[code]?.description||''} onChange={event=>setForm(current=>({...current,translations:{...current.translations,[code]:{...current.translations[code],description:event.target.value}}}))}/></div>)}</section>}
          <section><h2>图片与视频</h2><label className={`media-drop ${uploading ? 'is-uploading' : ''}`}>＋ {uploading ? '正在上传…' : '上传图片或视频'}<input multiple disabled={uploading} type="file" accept="image/*,video/*" onChange={uploadFiles}/><span>支持多选，文件将安全上传到云端</span></label>{uploadStatus && <p className="media-upload-status">{uploadStatus}</p>}<div className="media-grid">{form.media.map((media,index)=><div key={media.id}>{media.type.startsWith('video')?<video src={media.url} controls/>:<img src={media.url} alt=""/>}<button type="button" onClick={()=>setForm(current=>({...current,media:current.media.filter((_,i)=>i!==index)}))}>×</button>{index===0&&<span>封面</span>}</div>)}</div>
          </section>
        </div><div>
          <section><h2>销售资料</h2><label>价格（美元 USD）<input required min="0" step="0.01" type="number" value={form.price} onChange={event=>update('price',event.target.value)}/></label><label>库存数量<input required min="0" type="number" value={form.stock} onChange={event=>update('stock',event.target.value)}/></label><label>商品状态<select value={form.status} onChange={event=>update('status',event.target.value)}><option value="published">立即发布</option><option value="draft">保存草稿</option></select></label></section>
          <section className="publish-note"><ShieldCheck/><div><strong>云端保存模式</strong><p>商品资料、库存和云端媒体将在所有设备之间同步。</p></div></section>
        </div></div>
      </form>}
    </main>
  </div>;
}

const microcopy = {
  zh: { language:'语言', cart:'购物车', enquire:'联系 WhatsApp 客服', swipe:'左右滑动浏览', brands:'探索世界名表', byBrand:'按品牌探索', authenticated:'独立鉴证', expertise:'年专业经验', partners:'全球合作伙伴', add:'加入购物车', empty:'购物车目前为空', continue:'继续浏览', selected:'所选数量', checkout:'提交购买咨询', other:'其他 / 尚未确定', received:'已收到，我们将尽快联系您', consultation:'珍贵腕表价格及库存将由专属顾问确认。' },
  en: { language:'Language', cart:'Shopping bag', enquire:'Contact WhatsApp support', swipe:'Swipe to explore', brands:'EXPLORE THE MAISONS', byBrand:'Discover by maison', authenticated:'Authenticated', expertise:'Years expertise', partners:'Global partners', add:'Add to bag', empty:'Your shopping bag is empty', continue:'Continue browsing', selected:'Selected pieces', checkout:'Request purchase consultation', other:'Other / Not decided', received:'Received — we will be in touch', consultation:'Availability and pricing will be confirmed by your private advisor.' },
  ja: { language:'言語', cart:'ショッピングバッグ', enquire:'WhatsAppサポートへ連絡', swipe:'左右にスワイプ', brands:'世界のメゾン', byBrand:'ブランドから探す', authenticated:'独立鑑定', expertise:'年の専門経験', partners:'世界の提携先', add:'バッグに追加', empty:'バッグは空です', continue:'閲覧を続ける', selected:'選択数', checkout:'購入相談を依頼', other:'その他 / 未定', received:'承りました。追ってご連絡します', consultation:'在庫と価格は専任アドバイザーが確認します。' },
  ko: { language:'언어', cart:'쇼핑백', enquire:'WhatsApp 고객센터 문의', swipe:'좌우로 밀어 보기', brands:'세계적인 메종', byBrand:'브랜드별 보기', authenticated:'독립 감정', expertise:'년 전문 경력', partners:'글로벌 파트너', add:'쇼핑백에 담기', empty:'쇼핑백이 비어 있습니다', continue:'계속 둘러보기', selected:'선택 수량', checkout:'구매 상담 요청', other:'기타 / 미정', received:'접수되었습니다. 곧 연락드리겠습니다', consultation:'재고와 가격은 전담 어드바이저가 확인합니다.' },
  fr: { language:'Langue', cart:'Panier', enquire:'Contacter le support WhatsApp', swipe:'Faire défiler latéralement', brands:'MAISONS HORLOGÈRES', byBrand:'Découvrir par maison', authenticated:'Authentifié', expertise:'Ans d’expertise', partners:'Partenaires mondiaux', add:'Ajouter au panier', empty:'Votre panier est vide', continue:'Continuer', selected:'Pièces choisies', checkout:'Demander une consultation', other:'Autre / Indécis', received:'Demande reçue, nous vous contacterons', consultation:'Disponibilité et prix seront confirmés par votre conseiller.' },
  de: { language:'Sprache', cart:'Warenkorb', enquire:'WhatsApp-Support kontaktieren', swipe:'Seitlich wischen', brands:'UHRENMARKEN ENTDECKEN', byBrand:'Nach Marke entdecken', authenticated:'Authentifiziert', expertise:'Jahre Erfahrung', partners:'Globale Partner', add:'In den Warenkorb', empty:'Ihr Warenkorb ist leer', continue:'Weiter entdecken', selected:'Ausgewählte Uhren', checkout:'Kaufberatung anfragen', other:'Andere / Unentschieden', received:'Anfrage erhalten, wir melden uns', consultation:'Verfügbarkeit und Preis bestätigt Ihr persönlicher Berater.' },
  es: { language:'Idioma', cart:'Carrito', enquire:'Contactar soporte por WhatsApp', swipe:'Deslizar lateralmente', brands:'MARCAS DE RELOJERÍA', byBrand:'Explorar por marca', authenticated:'Autentificado', expertise:'Años de experiencia', partners:'Socios mundiales', add:'Añadir al carrito', empty:'El carrito está vacío', continue:'Seguir explorando', selected:'Piezas seleccionadas', checkout:'Solicitar consulta de compra', other:'Otro / Sin decidir', received:'Solicitud recibida, nos pondremos en contacto', consultation:'Su asesor confirmará disponibilidad y precio.' },
};

const copy = {
  zh: {
    nav: ['典藏', '品牌', '我们的故事', '联系 WhatsApp 客服'],
    eyebrow: '独立高级腕表典藏',
    hero: <>时间，<br/><em>以非凡之名</em></>,
    intro: '为真正的收藏家，严选跨越世代的机械杰作。每一枚时计，皆经我们的专家独立鉴证。',
    explore: '探索典藏', appointment: '预约私人鉴赏',
    featured: '最新上架', sectionTitle: <>新品腕表，<em>抢先鉴赏</em></>,
    sectionText: '浏览最新抵达的珍贵腕表。每一款均经过独立鉴证，并提供安全配送与私人选购服务。',
    view: '查看详情', all: '浏览全部典藏',
    storyKicker: 'OiWatch · 顶级复刻工艺',
    storyTitle: <>超级克隆 1:1，<br/><em>只做最好的品质</em></>,
    storyBody: '我们专注于高品质 1:1 腕表，以严谨选材、精细打磨和对原版细节的高度还原为标准。从外观比例到佩戴质感，每一处都追求更接近原作的体验。',
    learn: '了解我们的故事',
    serviceTitle: '一对一私人鉴赏', serviceText: '告诉我们您所寻找的时计，专属顾问将在 24 小时内与您联系。',
    formName: '您的称呼', formContact: '邮箱或手机', formInterest: '感兴趣的腕表', formMessage: '您的需求或想寻找的型号', submit: '提交私人询价',
    privacy: '您的信息将被严格保密，仅用于本次咨询。',
  },
  en: {
    nav: ['Collection', 'Maisons', 'Our Story', 'WhatsApp Support'],
    eyebrow: 'INDEPENDENT HAUTE HORLOGERIE',
    hero: <>Time,<br/><em>made exceptional</em></>,
    intro: 'Mechanical masterpieces selected for true collectors. Every timepiece is independently authenticated by our specialists.',
    explore: 'Explore collection', appointment: 'Private appointment',
    featured: 'NEW ARRIVALS', sectionTitle: <>Newly arrived, <em>ready to discover</em></>,
    sectionText: 'Explore our latest arrivals. Every piece is independently authenticated and available with secure delivery.',
    view: 'Discover', all: 'View complete collection',
    storyKicker: 'OIWATCH · PREMIUM REPLICA CRAFT',
    storyTitle: <>Super Clone 1:1<br/><em>Only the finest quality</em></>,
    storyBody: 'We focus on premium 1:1 timepieces, defined by carefully selected materials, meticulous finishing and faithful attention to original details. Every element is refined for a remarkably authentic look and feel.',
    learn: 'Our story',
    serviceTitle: 'A private consultation', serviceText: 'Tell us what you seek. Your dedicated advisor will respond within 24 hours.',
    formName: 'Your name', formContact: 'Email or phone', formInterest: 'Timepiece of interest', formMessage: 'What are you looking for?', submit: 'Send private enquiry',
    privacy: 'Your information remains strictly confidential.',
  },
  ja: {
    nav: ['コレクション', 'ブランド', '私たちの物語', 'WhatsAppサポート'],
    eyebrow: '独立系高級時計コレクション',
    hero: <>時を、<br/><em>特別な存在へ</em></>,
    intro: '真のコレクターのために選び抜かれた機械式時計。すべての時計は専門家が独立して鑑定します。',
    explore: 'コレクションを見る', appointment: '個別鑑賞を予約',
    featured: '新着商品', sectionTitle: <>新しい時計を、<em>いち早く</em></>,
    sectionText: '新たに入荷した希少な時計をご覧ください。すべて独立鑑定と安全な配送に対応します。',
    view: '詳細を見る', all: 'すべてのコレクション',
    storyKicker: 'OiWatch · 最高級レプリカ技術',
    storyTitle: <>スーパーコピー 1:1<br/><em>最高品質だけを追求</em></>,
    storyBody: '厳選素材、精密な仕上げ、オリジナルの細部まで忠実に再現した高品質な1:1タイムピースをお届けします。',
    learn: '私たちの物語', serviceTitle: '個別コンサルテーション', serviceText: 'お探しの時計をお知らせください。専任アドバイザーが24時間以内にご連絡します。',
    formName: 'お名前', formContact: 'メールまたは電話番号', formInterest: 'ご興味のある時計', formMessage: 'ご希望のモデルや条件', submit: 'お問い合わせを送信', privacy: 'お客様の情報は厳重に管理されます。',
  },
  ko: {
    nav: ['컬렉션', '브랜드', '우리의 이야기', 'WhatsApp 고객센터'],
    eyebrow: '독립 하이엔드 시계 컬렉션',
    hero: <>시간을,<br/><em>특별함으로</em></>,
    intro: '진정한 컬렉터를 위해 엄선한 기계식 걸작. 모든 시계는 전문가의 독립 감정을 거칩니다.',
    explore: '컬렉션 보기', appointment: '프라이빗 감상 예약',
    featured: '신상품', sectionTitle: <>새롭게 입고된, <em>특별한 시계</em></>,
    sectionText: '새롭게 도착한 희귀 시계를 만나보세요. 모든 제품은 독립 감정과 안전 배송을 제공합니다.',
    view: '상세 보기', all: '전체 컬렉션',
    storyKicker: 'OiWatch · 프리미엄 레플리카 공예',
    storyTitle: <>슈퍼 클론 1:1<br/><em>최고의 품질만을 추구합니다</em></>,
    storyBody: '엄선한 소재와 정교한 마감, 원본의 디테일까지 충실하게 구현한 프리미엄 1:1 타임피스를 선보입니다.',
    learn: '우리의 이야기', serviceTitle: '일대일 프라이빗 상담', serviceText: '찾으시는 시계를 알려주시면 전담 어드바이저가 24시간 이내에 연락드립니다.',
    formName: '성함', formContact: '이메일 또는 전화번호', formInterest: '관심 시계', formMessage: '찾으시는 모델이나 조건', submit: '상담 요청 보내기', privacy: '고객 정보는 철저히 보호됩니다.',
  },
  fr: {
    nav: ['Collection', 'Maisons', 'Notre histoire', 'Support WhatsApp'],
    eyebrow: 'SÉLECTION INDÉPENDANTE DE HAUTE HORLOGERIE',
    hero: <>Le temps,<br/><em>rendu exceptionnel</em></>,
    intro: 'Des chefs-d’œuvre mécaniques choisis pour les véritables collectionneurs. Chaque pièce est authentifiée par nos experts.',
    explore: 'Découvrir la collection', appointment: 'Rendez-vous privé',
    featured: 'NOUVEAUTÉS', sectionTitle: <>Nouvelles arrivées, <em>à découvrir</em></>,
    sectionText: 'Découvrez nos dernières pièces, toutes authentifiées indépendamment et proposées avec livraison sécurisée.',
    view: 'Découvrir', all: 'Voir toute la collection',
    storyKicker: 'OiWatch · RÉPLIQUE HAUT DE GAMME',
    storyTitle: <>Super Clone 1:1<br/><em>La meilleure qualité</em></>,
    storyBody: 'Nous proposons des montres 1:1 haut de gamme, réalisées avec des matériaux sélectionnés, des finitions méticuleuses et une reproduction fidèle des détails originaux.',
    learn: 'Notre histoire', serviceTitle: 'Une consultation privée', serviceText: 'Confiez-nous votre recherche. Votre conseiller dédié vous répondra sous 24 heures.',
    formName: 'Votre nom', formContact: 'E-mail ou téléphone', formInterest: 'Pièce recherchée', formMessage: 'Votre modèle ou vos critères', submit: 'Envoyer la demande', privacy: 'Vos informations restent strictement confidentielles.',
  },
  de: {
    nav: ['Kollektion', 'Marken', 'Unsere Geschichte', 'WhatsApp-Support'],
    eyebrow: 'UNABHÄNGIGE AUSWAHL HOHER UHRMACHERKUNST',
    hero: <>Zeit,<br/><em>außergewöhnlich gemacht</em></>,
    intro: 'Mechanische Meisterwerke für echte Sammler. Jede Uhr wird von unseren Spezialisten unabhängig authentifiziert.',
    explore: 'Kollektion entdecken', appointment: 'Privattermin vereinbaren',
    featured: 'NEU EINGETROFFEN', sectionTitle: <>Neu eingetroffen, <em>jetzt entdecken</em></>,
    sectionText: 'Entdecken Sie unsere neuesten Uhren – unabhängig authentifiziert und sicher geliefert.',
    view: 'Details ansehen', all: 'Gesamte Kollektion',
    storyKicker: 'OiWatch · PREMIUM-REPLIKA-HANDWERK',
    storyTitle: <>Super Clone 1:1<br/><em>Nur höchste Qualität</em></>,
    storyBody: 'Wir bieten hochwertige 1:1-Zeitmesser mit ausgewählten Materialien, sorgfältiger Verarbeitung und originalgetreu wiedergegebenen Details.',
    learn: 'Unsere Geschichte', serviceTitle: 'Persönliche Beratung', serviceText: 'Teilen Sie uns Ihre Wünsche mit. Ihr persönlicher Berater antwortet innerhalb von 24 Stunden.',
    formName: 'Ihr Name', formContact: 'E-Mail oder Telefon', formInterest: 'Gewünschte Uhr', formMessage: 'Modell oder Anforderungen', submit: 'Anfrage senden', privacy: 'Ihre Angaben werden streng vertraulich behandelt.',
  },
  es: {
    nav: ['Colección', 'Marcas', 'Nuestra historia', 'Soporte WhatsApp'],
    eyebrow: 'SELECCIÓN INDEPENDIENTE DE ALTA RELOJERÍA',
    hero: <>El tiempo,<br/><em>hecho excepcional</em></>,
    intro: 'Obras maestras mecánicas seleccionadas para auténticos coleccionistas. Cada pieza es autentificada por nuestros especialistas.',
    explore: 'Explorar la colección', appointment: 'Cita privada',
    featured: 'NOVEDADES', sectionTitle: <>Recién llegados, <em>listos para descubrir</em></>,
    sectionText: 'Descubra nuestras últimas piezas, autentificadas de forma independiente y con entrega segura.',
    view: 'Ver detalles', all: 'Ver toda la colección',
    storyKicker: 'OiWatch · RÉPLICA DE ALTA GAMA',
    storyTitle: <>Super Clone 1:1<br/><em>Solo la mejor calidad</em></>,
    storyBody: 'Ofrecemos relojes 1:1 de alta calidad, elaborados con materiales seleccionados, acabados meticulosos y una reproducción fiel de los detalles originales.',
    learn: 'Nuestra historia', serviceTitle: 'Consulta privada', serviceText: 'Cuéntenos qué busca. Su asesor personal responderá en un plazo de 24 horas.',
    formName: 'Su nombre', formContact: 'Correo o teléfono', formInterest: 'Reloj de interés', formMessage: 'Modelo o requisitos', submit: 'Enviar consulta', privacy: 'Sus datos se mantendrán estrictamente confidenciales.',
  }
};

const qualityCopy = {
  zh:{nav:'品质说明',back:'返回首页',kicker:'OIWATCH 品质标准',title:'超级克隆 1:1，与普通 AAA 有何不同？',intro:'两者看似都叫复刻，实际在材质、结构、细节和佩戴体验上有明显差距。OiWatch 只选择更高标准的超级克隆腕表。',super:'OiWatch 超级克隆 1:1',aaa:'普通 AAA 腕表',best:'高阶品质之选',cheap:'廉价入门级',superPoints:['按原版比例开发，表壳、表盘与字面细节高度还原','选用更高规格材质，重量、光泽和触感更接近原作','机芯结构与功能表现更完整，装配和调校要求更高','细节经近距离检查，适合日常佩戴与长期收藏'],aaaPoints:['以低成本和快速生产为主，外形通常只有大致相似','材质轻薄，刻度、字体、颜色和打磨容易失真','机芯以基础走时为主，功能和结构还原有限','更像短期体验的玩具级产品，因此售价较低'],note:'“AAA”“超级克隆”等名称并非全球统一的官方等级；OiWatch 以实际材质、做工和交付检查作为品质标准。'},
  en:{nav:'Our Quality',back:'Back to home',kicker:'THE OIWATCH STANDARD',title:'Super Clone 1:1 vs ordinary AAA watches',intro:'Both may be described as replicas, but their materials, construction, detailing and wrist feel are very different. OiWatch selects only higher-standard Super Clone pieces.',super:'OiWatch Super Clone 1:1',aaa:'Ordinary AAA Watches',best:'Premium choice',cheap:'Low-cost entry level',superPoints:['Developed to original proportions with highly faithful case, dial and typography details','Higher-grade materials deliver weight, lustre and tactility closer to the original','More complete movement architecture and functions, with stricter assembly and regulation','Close-range detail inspection for confident daily wear and long-term enjoyment'],aaaPoints:['Built around low cost and fast production, with only a broadly similar appearance','Lightweight materials and visibly weaker printing, colour and finishing','Basic timekeeping movements with limited functional or structural resemblance','A toy-like, short-term experience that explains the lower price'],note:'Terms such as “AAA” and “Super Clone” are not globally standardised official grades; OiWatch judges quality by actual materials, workmanship and pre-delivery inspection.'},
  ja:{nav:'品質について',back:'ホームへ戻る',kicker:'OIWATCH 品質基準',title:'スーパーコピー1:1と一般的なAAAの違い',intro:'素材、構造、細部、装着感には大きな差があります。OiWatchは高水準のスーパーコピーのみを選びます。',super:'OiWatch スーパーコピー 1:1',aaa:'一般的なAAA時計',best:'上質な選択',cheap:'低価格入門品',superPoints:['オリジナルの比率に基づき、ケースや文字盤を忠実に再現','上質な素材による重量感、光沢、手触り','より完全なムーブメント構造と機能、厳格な組立調整','近距離で細部を検品し、日常使用にも適した品質'],aaaPoints:['低コストと大量生産が中心で、外観は大まかな類似に留まる','軽い素材で、印刷、色、仕上げが粗い','基本的な時刻表示のみで構造や機能の再現が限定的','価格相応の玩具に近い短期的な体験'],note:'AAAやスーパーコピーは世界共通の公式等級ではありません。OiWatchは実際の素材、仕上げ、出荷前検品で品質を判断します。'},
  ko:{nav:'품질 안내',back:'홈으로',kicker:'OIWATCH 품질 기준',title:'슈퍼 클론 1:1과 일반 AAA의 차이',intro:'소재, 구조, 디테일과 착용감에는 큰 차이가 있습니다. OiWatch는 높은 기준의 슈퍼 클론만을 선택합니다.',super:'OiWatch 슈퍼 클론 1:1',aaa:'일반 AAA 시계',best:'프리미엄 선택',cheap:'저가 입문형',superPoints:['원본 비율을 기준으로 케이스와 다이얼 디테일을 충실히 구현','고급 소재로 원본에 가까운 무게와 광택, 촉감 제공','더 완전한 무브먼트 구조와 기능, 엄격한 조립과 조정','근거리 디테일 검사로 일상 착용과 장기 사용에 적합'],aaaPoints:['낮은 원가와 빠른 생산 중심으로 외형만 대략 유사','가벼운 소재와 낮은 인쇄, 색상, 마감 품질','기본 시간 표시 위주로 구조와 기능 재현이 제한적','가격이 저렴한 장난감 수준의 단기 체험 제품'],note:'AAA와 슈퍼 클론은 세계 공통 공식 등급이 아닙니다. OiWatch는 실제 소재, 마감과 출고 검수로 품질을 평가합니다.'},
  fr:{nav:'Notre qualité',back:'Retour',kicker:'LA NORME OIWATCH',title:'Super Clone 1:1 ou montre AAA ordinaire',intro:'Les matériaux, la construction, les détails et le confort sont très différents. OiWatch ne sélectionne que des Super Clones de niveau supérieur.',super:'OiWatch Super Clone 1:1',aaa:'Montres AAA ordinaires',best:'Choix premium',cheap:'Entrée de gamme économique',superPoints:['Proportions originales et détails du boîtier et du cadran fidèlement reproduits','Matériaux supérieurs, poids, éclat et toucher proches de l’original','Architecture et fonctions du mouvement plus complètes, assemblage plus strict','Inspection rapprochée des détails pour un usage quotidien durable'],aaaPoints:['Conçues pour un coût minimal et une production rapide, avec une ressemblance approximative','Matériaux légers, impression, couleurs et finitions visiblement inférieures','Mouvement basique avec peu de fonctions ou de similitude structurelle','Une expérience proche du jouet qui explique le prix réduit'],note:'AAA et Super Clone ne sont pas des grades officiels universels. OiWatch évalue les matériaux, la finition et le contrôle avant livraison.'},
  de:{nav:'Unsere Qualität',back:'Zurück',kicker:'DER OIWATCH-STANDARD',title:'Super Clone 1:1 oder gewöhnliche AAA-Uhr',intro:'Materialien, Konstruktion, Details und Tragegefühl unterscheiden sich deutlich. OiWatch wählt nur Super Clones mit höherem Standard.',super:'OiWatch Super Clone 1:1',aaa:'Gewöhnliche AAA-Uhren',best:'Premium-Auswahl',cheap:'Günstige Einstiegsklasse',superPoints:['Nach Originalproportionen mit detailgetreuem Gehäuse und Zifferblatt entwickelt','Hochwertigere Materialien für originalnahes Gewicht, Glanz und Gefühl','Vollständigere Werkarchitektur und Funktionen, strengere Montage und Regulierung','Detailprüfung aus nächster Nähe für dauerhaftes tägliches Tragen'],aaaPoints:['Auf niedrige Kosten und schnelle Fertigung ausgelegt, nur grob ähnliche Optik','Leichte Materialien und sichtbar schwächere Druck-, Farb- und Finishqualität','Einfaches Uhrwerk mit begrenzter funktionaler und struktureller Ähnlichkeit','Spielzeugartige Kurzzeiterfahrung zum entsprechend niedrigen Preis'],note:'AAA und Super Clone sind keine weltweit einheitlichen offiziellen Qualitätsstufen. OiWatch bewertet Material, Verarbeitung und Auslieferungskontrolle.'},
  es:{nav:'Nuestra calidad',back:'Volver',kicker:'EL ESTÁNDAR OIWATCH',title:'Super Clone 1:1 frente a un AAA corriente',intro:'Los materiales, la construcción, los detalles y la sensación en la muñeca son muy diferentes. OiWatch selecciona únicamente Super Clones de nivel superior.',super:'OiWatch Super Clone 1:1',aaa:'Relojes AAA corrientes',best:'Elección prémium',cheap:'Gama económica',superPoints:['Proporciones originales y detalles de caja y esfera fielmente reproducidos','Materiales superiores con peso, brillo y tacto más cercanos al original','Arquitectura y funciones del movimiento más completas, con montaje más estricto','Inspección detallada para el uso diario y el disfrute a largo plazo'],aaaPoints:['Fabricación rápida y de bajo coste, con una apariencia solo aproximada','Materiales ligeros y menor calidad de impresión, color y acabado','Movimiento básico con escasa semejanza funcional o estructural','Experiencia similar a un juguete que explica su precio reducido'],note:'AAA y Super Clone no son grados oficiales estandarizados mundialmente. OiWatch valora materiales, acabado e inspección previa a la entrega.'}
};

function optimizedImage(url, width = 640, quality = 72) {
  if (!url || url.startsWith('blob:') || url.startsWith('data:') || !url.startsWith('http')) return url;
  if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|192\.168\.)/.test(window.location.hostname)) return url;
  return `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&fit=contain`;
}

function catalogDisplayProduct(product, lang) {
  return {
    ...product,
    tags:deriveProductTags(product),
    sortDate:product.updatedAt || new Date().toISOString(),
    displayName:lang === 'zh' ? product.nameZh : product.translations?.[lang]?.name || product.nameEn || product.translations?.en?.name || 'Selected timepiece',
    displayBrand:lang === 'zh' ? product.brandZh : product.brandEn || 'OiWatch',
    description:lang === 'zh' ? product.descriptionZh : product.translations?.[lang]?.description || product.descriptionEn || product.translations?.en?.description || 'Product information is being prepared.',
    mediaUrls:product.media?.map(media => {
      const type = media.contentType || media.type || (/\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(media.url || '') ? 'video' : 'image');
      return { url:media.url, type };
    }) || [],
    cartItem:{ ...product, image:product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', customManaged:true },
  };
}

const descriptionSections = [
  ['Size', /尺寸/i],
  ['Movement', /機芯|机芯/i],
  ['Functions', /功能/i],
  ['Case', /表\s*殼|錶殼|表壳/i],
  ['Dial', /錶盤|表盘/i],
  ['Crystal', /表鏡|表镜/i],
  ['Bezel', /表圈/i],
  ['Strap', /表帶|表带/i],
  ['Clasp', /錶扣|表扣/i],
  ['Water Resistance', /防水/i],
];

function cleanDescriptionText(value = '') {
  return String(value)
    .replace(/(?:WhatsApp|What'sApp|E-?mail|Email|Website|Web\s*site|Contact\s*us)\s*[:：]?\s*[^\r\n]*/gi, ' ')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, ' ')
    .replace(/\b[a-z0-9.-]+\.(?:com|net|cc|co|org|cn|hk)\b\S*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function descriptionList(value, lang = 'en') {
  const source = cleanDescriptionText(value);
  const sections = descriptionSections.map(([label, chineseMarker]) => {
    const startMatch = new RegExp(`\\b${label.replace(' ', '\\s+')}\\b`, 'i').exec(source);
    if (!startMatch) return null;
    const valueStart = startMatch.index + startMatch[0].length;
    const tail = source.slice(valueStart);
    const markerMatch = chineseMarker.exec(tail);
    const nextLabel = descriptionSections
      .map(([next]) => new RegExp(`\\b${next.replace(' ', '\\s+')}\\b`, 'i').exec(tail)?.index)
      .filter(index => Number.isFinite(index) && index > 0)
      .sort((a, b) => a - b)[0];
    const end = markerMatch ? markerMatch.index : (Number.isFinite(nextLabel) ? nextLabel : tail.length);
    const detail = tail.slice(0, end).replace(/\s+/g, ' ').trim();
    return detail ? { label, detail, order:startMatch.index } : null;
  }).filter(Boolean).sort((a, b) => a.order - b.order);

  if (sections.length) return sections;
  return source ? [{ label:lang === 'zh' ? '商品详情' : 'Details', detail:source, order:0 }] : [];
}

function ShopPage({ products, initialBrand = 'all', lang, money, cartCount, cartPulse, onBack, onCart, onProduct, onAdd }) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState(initialBrand);
  const [catalog, setCatalog] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 24;
  const labels = lang === 'zh'
    ? { back:'首页', title:'全部商品', subtitle:'新品、热销与精选腕表', search:'搜索品牌、型号或工厂', all:'全部', newest:'最新上架', pieces:'件商品', add:'加入购物车', video:'视频', more:'加载更多', loading:'正在加载…' }
    : { back:'Home', title:'Shop All', subtitle:'New arrivals, bestsellers and selected watches', search:'Search brand, model or factory', all:'All', newest:'Newest first', pieces:'pieces', add:'Add to bag', video:'Video', more:'Load more', loading:'Loading…' };

  useEffect(() => {
    listPublishedBrands().then(setBrandOptions).catch(() => setBrandOptions([]));
  }, []);

  useEffect(() => {
    setBrand(initialBrand || 'all');
  }, [initialBrand]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await listPublishedProductsPage({ page:0, pageSize, query, brand:brand === 'all' ? '' : brand });
        setCatalog(result.products);
        setTotal(result.total);
        setPage(0);
        setPageInput('1');
      } catch (error) {
        console.warn('Paged catalogue unavailable.', error);
        setCatalog(products.slice(0, pageSize));
        setTotal(products.length);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, brand]);

  const loadMore = async () => {
    if (loading || catalog.length >= total) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await listPublishedProductsPage({ page:nextPage, pageSize, query, brand:brand === 'all' ? '' : brand });
      setCatalog(items => [...items, ...result.products]);
      setTotal(result.total);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = async () => {
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const requested = Math.min(lastPage, Math.max(1, Number.parseInt(pageInput, 10) || 1));
    setPageInput(String(requested));
    setLoading(true);
    try {
      const result = await listPublishedProductsPage({ page:requested - 1, pageSize, query, brand:brand === 'all' ? '' : brand });
      setCatalog(result.products);
      setTotal(result.total);
      setPage(requested - 1);
      window.scrollTo({ top:0, behavior:'smooth' });
    } finally { setLoading(false); }
  };

  const displayed = catalog.map(product => catalogDisplayProduct(product, lang));
  const brandNames = brandOptions
    .map(item => {
      const value = item.brand_en || item.brand_zh;
      const rawLabel = lang === 'zh' ? item.brand_zh || value : item.brand_en || value;
      const label = lang === 'zh'
        ? rawLabel.match(/[\u3400-\u9fff].*$/)?.[0] || rawLabel
        : rawLabel.replace(/[\u3400-\u9fff].*$/, '').trim();
      return { value, label };
    })
    .filter(item => item.value);

  return <div className="shop-page">
    <header className="shop-header">
      <button onClick={onBack}><ArrowLeft size={18}/><span>{labels.back}</span></button>
      <SiteLogo/>
      <button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={onCart}><ShoppingBag size={19}/><span>{cartCount}</span></button>
    </header>
    <main className="shop-content">
      <section className="shop-intro">
        <p>{labels.newest}</p>
        <h1>{labels.title}</h1>
        <span>{labels.subtitle}</span>
      </section>
      <div className="shop-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder={labels.search}/></div>
      <div className="shop-filters">
        <button className={brand === 'all' ? 'active' : ''} onClick={() => setBrand('all')}>{labels.all}</button>
        {brandNames.map(item => <button className={brand === item.value ? 'active' : ''} onClick={() => setBrand(item.value)} key={item.value}>{item.label}</button>)}
      </div>
      <div className="shop-result-count">{total} {labels.pieces}</div>
      <div className="shop-grid">
        {displayed.map((product, index) => {
          const media = product.mediaUrls?.length ? product.mediaUrls : [{ url:'/images/watch-aurelia-web.jpg', type:'image/jpeg' }];
          const cover = media[0];
          return <article className="shop-card" key={product.id}>
            <button className="shop-card-media" onClick={() => onProduct(product)}>
              {cover.type?.startsWith('video')
                ? <video src={cover.url} muted playsInline preload="metadata"/>
                : <img
                    src={optimizedImage(cover.url, 520)}
                    srcSet={`${optimizedImage(cover.url, 320)} 320w, ${optimizedImage(cover.url, 520)} 520w, ${optimizedImage(cover.url, 760)} 760w`}
                    sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    alt={product.displayName}
                    loading={index > 3 ? 'lazy' : 'eager'}
                    decoding="async"
                    width="520"
                    height="520"
                  />}
              {media.some(item => item.type?.startsWith('video')) && <span className="video-badge"><Play size={11}/>{labels.video}</span>}
              {(product.mediaCount || media.length) > 1 && <span className="media-count">1/{product.mediaCount || media.length}</span>}
            </button>
            <button className="shop-card-copy" onClick={() => onProduct(product)}>
              <span>{product.displayBrand}</span>
              <h2>{product.displayName}</h2>
              <p>{product.description || (lang === 'zh' ? '精选高级腕表，支持查看完整图片、视频及商品资料。' : 'Selected timepiece with full images, video and product information.')}</p>
            </button>
            <div className="shop-card-bottom">
              <strong>{money(product.price)}</strong>
              <button onClick={() => onAdd(product.cartItem)} aria-label={labels.add}><ShoppingBag size={17}/></button>
            </div>
          </article>;
        })}
      </div>
      {(catalog.length < total || loading) && <div className="shop-pagination">
        <button onClick={loadMore} disabled={loading}>{loading ? labels.loading : labels.more}</button>
        <span>{page + 1} / {Math.max(1, Math.ceil(total / pageSize))}</span>
        <label>{lang === 'zh' ? '页码' : 'Page'}<input type="number" min="1" max={Math.max(1, Math.ceil(total / pageSize))} value={pageInput} onChange={event => setPageInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') goToPage(); }}/></label>
        <button onClick={goToPage} disabled={loading}>{lang === 'zh' ? '跳转' : 'Go'}</button>
      </div>}
    </main>
  </div>;
}

function ShopProductPage({ product, products, lang, money, cartCount, cartPulse, onBack, onCart, onAdd, onProduct }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const media = product.mediaUrls?.length ? product.mediaUrls : [{ url:'/images/watch-aurelia-web.jpg', type:'image/jpeg' }];
  const descriptionItems = useMemo(() => descriptionList(product.description, lang), [product.description, lang]);
  const labels = lang === 'zh'
    ? { back:'返回商品', details:'商品详情', condition:'商品状态', conditionValue:'全新 / 未佩戴', delivery:'配送', deliveryValue:'全球安全配送', stock:'库存', add:'加入购物车', note:'商品说明', swipe:'左右滑动查看图片和视频' }
    : { back:'Back to shop', details:'Product details', condition:'Condition', conditionValue:'New / Unworn', delivery:'Delivery', deliveryValue:'Secure worldwide delivery', stock:'Stock', add:'Add to bag', note:'Description', swipe:'Swipe through images and video' };
  const recommendations = useMemo(() => {
    const candidates = products.filter(item => item.id !== product.id);
    const seed = [...String(product.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return candidates
      .map((item, index) => ({ item, score:(seed * (index + 17) * 9301 + index * 49297) % 233280 }))
      .sort((a,b) => a.score - b.score)
      .slice(0, 3)
      .map(entry => entry.item);
  }, [product.id, products]);

  return <div className="shop-product-page">
    <header className="shop-header">
      <button onClick={onBack}><ArrowLeft size={18}/><span>{labels.back}</span></button>
      <SiteLogo/>
      <button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={onCart}><ShoppingBag size={19}/><span>{cartCount}</span></button>
    </header>
    <main className="shop-product-layout">
      <section className="product-media-stage">
        <div className="product-media-rail" onScroll={event => setMediaIndex(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}>
          {media.map((item, index) => item.type === 'embed'
            ? <iframe key={index} src={item.url} title={`${product.displayName} video ${index + 1}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy"/>
            : item.type?.startsWith('video')
              ? <video key={index} src={item.url} controls playsInline preload="metadata"/>
              : <img key={index} src={optimizedImage(item.url, 1400, 80)} alt={`${product.displayName} ${index + 1}`} loading={index ? 'lazy' : 'eager'} decoding="async"/>)}
        </div>
        <div className="product-media-meta"><span>{mediaIndex + 1} / {media.length}</span><small>{labels.swipe}</small></div>
        <div className="product-thumbnails">{media.map((item, index) => <button className={mediaIndex === index ? 'active' : ''} onClick={() => document.querySelector('.product-media-rail')?.scrollTo({ left:index * document.querySelector('.product-media-rail').clientWidth, behavior:'smooth' })} key={index}>{item.type === 'embed' ? <><span className="embed-thumb"/><Play size={14}/></> : item.type?.startsWith('video') ? <><video src={item.url} preload="none"/><Play size={14}/></> : <img src={optimizedImage(item.url, 160, 65)} loading="lazy" decoding="async" alt=""/>}</button>)}</div>
      </section>
      <section className="product-purchase">
        <p className="product-brand">{product.displayBrand}</p>
        <h1>{product.displayName}</h1>
        <strong className="product-price">{money(product.price)}</strong>
        <div className="product-service-tags"><span><ShieldCheck size={16}/>{lang === 'zh' ? '品质检查' : 'Quality checked'}</span><span>{lang === 'zh' ? '全球送货' : 'Worldwide delivery'}</span></div>
        <div className="product-facts">
          <div><span>{labels.condition}</span><strong>{labels.conditionValue}</strong></div>
          <div><span>{labels.delivery}</span><strong>{labels.deliveryValue}</strong></div>
          <div><span>{labels.stock}</span><strong>{product.stock > 0 ? (lang === 'zh' ? '现货' : 'In stock') : (lang === 'zh' ? '请询价' : 'Enquire')}</strong></div>
        </div>
        <div className="product-description">
          <h2>{labels.note}</h2>
          <ul>
            {(descriptionItems.length ? descriptionItems : [{ label:'Details', detail:'An OiWatch selected timepiece.', order:0 }]).map(item => (
              <li key={`${item.label}-${item.order}`}><strong>{item.label}</strong><span>{item.detail}</span></li>
            ))}
          </ul>
        </div>
        <button className="product-add-button" onClick={() => onAdd(product.cartItem)}><ShoppingBag size={18}/>{labels.add}<strong>{money(product.price)}</strong></button>
      </section>
      <aside className="product-recommendations">
        <p>{lang === 'zh' ? '猜你喜欢' : 'You may also like'}</p>
        <h2>{lang === 'zh' ? '随机推荐' : 'Selected for you'}</h2>
        <div>
          {recommendations.map(item => {
            const cover = item.mediaUrls?.[0];
            return <button key={item.id} onClick={() => onProduct(item)}>
              {cover?.type?.startsWith('video') ? <video src={cover.url} muted playsInline preload="none"/> : <img src={optimizedImage(cover?.url || '/images/watch-aurelia-web.jpg', 240, 68)} loading="lazy" decoding="async" alt={item.displayName}/>}
              <span><small>{item.displayBrand}</small><strong>{item.displayName}</strong><em>{money(item.price)}</em></span>
            </button>;
          })}
        </div>
      </aside>
    </main>
  </div>;
}

function PaymentGuide({ lang, activeTab, setActiveTab, onClose }) {
  const chinese = lang === 'zh';
  const content = {
    why: chinese ? { title:'为什么提供两种付款方式', body:'我们保留加密货币与货到付款两种清晰的结算路径，方便不同地区的客户按自己的习惯选择。每笔订单都会生成订单编号、配送记录与状态更新，便于核对和追踪。' } : { title:'Why we offer two payment methods', body:'We keep two clear checkout paths, crypto and cash on delivery, so customers in different regions can choose what fits them. Every order has an order number, delivery record and status updates for straightforward tracking.' },
    crypto: chinese ? { title:'加密货币付款', body:'确认订单后，选择币种并使用页面显示的钱包地址付款。提交交易哈希后可打开区块浏览器查看确认进度。请务必核对网络、币种、金额和订单号；链上交易一旦确认通常无法撤回。' } : { title:'Paying with crypto', body:'After confirming the order, choose an asset and pay to the wallet shown on the page. Submit the transaction hash, then open the block explorer to follow confirmations. Always check the network, asset, amount and order number; confirmed on-chain transactions are generally irreversible.' },
    cod: chinese ? { title:'货到付款', body:'在支持的地区，订单会先完成地址与配送可行性确认，再安排可追踪发货。请在收货时按承运商及当地规定完成付款。货到付款是否可用会随目的地、订单金额和物流服务而变化。' } : { title:'Cash on delivery', body:'Where available, we confirm the delivery address and serviceability before arranging tracked dispatch. Payment is completed on delivery according to the carrier and local requirements. Availability varies by destination, order value and shipping service.' },
    paypal: chinese ? { title:'为什么暂不提供 PayPal', body:'为了让付款、物流与售后记录保持一致，我们目前只提供能与订单和配送流程直接核对的结算方式。这样可以减少地址、付款人与收件信息不一致带来的延误，并让客户更容易查看自己的订单进度。' } : { title:'Why PayPal is not currently offered', body:'To keep payment, shipment and support records aligned, we currently use checkout methods that can be matched directly to the order and delivery flow. This helps reduce delays caused by mismatched payer, address and recipient information, while keeping order progress clear for customers.' },
  }[activeTab];
  const enhanced = {
    crypto: chinese ? { title:'加密货币付款', body:'下单后选择币种与网络，复制付款地址或保存二维码，在你的钱包应用内发起转账。付款后提交交易哈希；页面会提供区块浏览器链接以查看确认进度。务必核对网络、币种、金额和订单号，链上确认后的交易通常无法撤回。', notes:['使用步骤：选择币种；在钱包内粘贴地址或扫描二维码；核对网络与金额；提交交易哈希；等待链上确认。','应用选择仅作一般信息：北美和欧洲常见 Coinbase、Kraken、Crypto.com；Binance 在许多国际地区可用；亚洲地区请选择当地合规可用的钱包或交易平台。请先确认当地法规、平台资格和资产支持情况。'] } : { title:'Paying with crypto', body:'Choose an asset and network, copy the payment address or save the QR code, then send from your own wallet app. Submit the transaction hash after payment; the order page links to a block explorer for confirmations. Always check network, asset, amount and order number. Confirmed on-chain transfers are generally irreversible.', notes:['How to pay: choose an asset; paste the address or scan the QR code in your wallet; check network and amount; submit the transaction hash; wait for on-chain confirmation.','App guidance is general information only: Coinbase, Kraken and Crypto.com are commonly used in North America and Europe; Binance is widely used internationally; in Asia, choose a locally compliant wallet or exchange. Check local rules, eligibility and supported assets first.'] },
    cod: chinese ? { title:'货到付款', body:'货到付款仅在支持的目的地开放。该方式的订单总额比加密货币付款高 10%，并且需先支付运费；余额在签收时按承运商及当地规定支付。我们会先确认地址、物流服务能力和运费，再安排可追踪发货。' } : { title:'Cash on delivery', body:'Cash on delivery is available only for supported destinations. The total is 10% higher than crypto payment, and shipping must be paid in advance; the remaining balance is paid on delivery according to carrier and local requirements. We confirm the address, serviceability and shipping charge before tracked dispatch.' },
    tracking: chinese ? { title:'货物追踪', body:'发货后会提供承运商和追踪号码。可使用以下官方追踪页面查询最新状态。' } : { title:'Shipment tracking', body:'After dispatch, you will receive the carrier name and tracking number. Use the official tracking pages below for current delivery status.' },
  };
  const guide = enhanced[activeTab] || content;
  const tabs = [['why', chinese ? '付款方式' : 'Payment options'], ['crypto', chinese ? '加密货币' : 'Crypto'], ['cod', chinese ? '货到付款' : 'Cash on delivery'], ['tracking', chinese ? '物流追踪' : 'Tracking'], ['paypal', chinese ? 'PayPal 说明' : 'PayPal']];
  return <div className="payment-guide-page">
    <header className="payment-guide-header"><button onClick={onClose}><ArrowLeft size={17}/>{chinese ? '返回首页' : 'Back to home'}</button><SiteLogo/><span>{chinese ? '付款说明' : 'PAYMENT GUIDE'}</span></header>
    <main className="payment-guide-content">
      <section className="payment-guide-intro"><p className="kicker">{chinese ? '透明 · 可追踪 · 清晰' : 'CLEAR · TRACEABLE · SIMPLE'}</p><h1>{chinese ? '付款说明' : 'Payment guide'}</h1><p>{chinese ? '选择适合你的付款方式。以下说明帮助你在下单前了解每一步。' : 'Choose the checkout path that suits you. These notes explain what to expect before you place an order.'}</p></section>
      <div className="payment-video-placeholders" aria-label={chinese ? '授权视频位置' : 'Licensed video placeholders'}><article><Play size={22}/><span>{chinese ? '诚信与安全故事视频位 01' : 'Trust & safety story 01'}</span></article><article><Play size={22}/><span>{chinese ? '诚信与安全故事视频位 02' : 'Trust & safety story 02'}</span></article></div>
      <section className="payment-guide-layout"><nav>{tabs.map(([id,label]) => <button key={id} className={id === activeTab ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}<ChevronRight size={16}/></button>)}</nav><article><p className="kicker">{chinese ? '订单支持' : 'ORDER SUPPORT'}</p><h2>{guide.title}</h2><p>{guide.body}</p>{guide.notes?.map(note => <p className="payment-guide-note" key={note}>{note}</p>)}{activeTab === 'tracking' && <div className="tracking-links">{[['DHL','https://www.dhl.com/global-en/home/tracking.html'],['FedEx','https://www.fedex.com/fedextrack/'],['UPS','https://www.ups.com/track'],['EMS','https://www.ems.post/en/global-network/tracking'],['SF Express','https://www.sf-international.com/us/en/dynamic_function/waybill/#search/bill-number/'],['Hongkong Post','https://webapp.hongkongpost.hk/en/mail_tracking/index.html'],['Aramex','https://www.aramex.com/us/en/track/shipments']].map(([name,url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}<ArrowRight size={15}/></a>)}</div>}</article></section>
    </main>
  </div>;
}

function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminGateOpen, setAdminGateOpen] = useState(() => window.location.pathname === '/admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginBusy, setAdminLoginBusy] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [managedProducts, setManagedProducts] = useState(() => JSON.parse(localStorage.getItem('oiwatch-products') || '[]').slice(0, 24));
  const [siteSettings, setPublicSiteSettings] = useState(() => JSON.parse(localStorage.getItem('oiwatch-site-settings') || '{"storeName":"OiWatch","whatsapp":"+852 6651 0124","defaultCurrency":"USD","eurRate":0.92}'));
  const [lang, setLang] = useState(() => localStorage.getItem('oiwatch-language') || 'en');
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [brandPage, setBrandPage] = useState(null);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [allProductsOpen, setAllProductsOpen] = useState(() => window.location.pathname.startsWith('/shop'));
  const [shopProductId, setShopProductId] = useState(() => {
    const match = window.location.pathname.match(/^\/shop\/product\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [shopBrand, setShopBrand] = useState('all');
  const [remoteShopProduct, setRemoteShopProduct] = useState(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [paymentGuideOpen, setPaymentGuideOpen] = useState(false);
  const [paymentGuideTab, setPaymentGuideTab] = useState('why');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentAsset, setPaymentAsset] = useState('USDT');
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentProofStatus, setPaymentProofStatus] = useState('');
  const [paymentTxid, setPaymentTxid] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const watchRail = useRef(null);
  const t = copy[lang];
  const m = microcopy[lang];
  const q = qualityCopy[lang];
  const countryOptions = useMemo(() => {
    try {
      const names = new Intl.DisplayNames(['en'], { type:'region' });
      return ISO_COUNTRY_CODES.map(code => ({ code, name:names.of(code) })).filter(item => item.name).sort((a,b) => a.name.localeCompare(b.name, 'en'));
    } catch { return []; }
  }, []);

  useEffect(() => {
    document.documentElement.lang = { zh:'zh-CN', en:'en', ja:'ja', ko:'ko', fr:'fr', de:'de', es:'es' }[lang];
    localStorage.setItem('oiwatch-language', lang);
    document.body.style.overflow = selected || menu || cartOpen || brandPage || checkoutOpen || allProductsOpen || qualityOpen || paymentGuideOpen || adminGateOpen ? 'hidden' : '';
  }, [lang, selected, menu, cartOpen, brandPage, checkoutOpen, allProductsOpen, qualityOpen, paymentGuideOpen, adminGateOpen]);

  useEffect(() => {
    localStorage.setItem('oiwatch-products', JSON.stringify(managedProducts.slice(0, 24)));
  }, [managedProducts]);

  useEffect(() => {
    listPublishedProducts()
      .then(setManagedProducts)
      .catch(error => console.warn('Cloud catalogue unavailable; using the local cache.', error));
    getSiteSettings()
      .then(settings => {
        setPublicSiteSettings(settings);
        localStorage.setItem('oiwatch-site-settings', JSON.stringify(settings));
      })
      .catch(error => console.warn('Cloud settings unavailable; using the local cache.', error));
  }, []);

  useEffect(() => {
    Promise.all(managedProducts.map(async product => ({
      ...product,
      media:await Promise.all(product.media.map(async media => {
        if (media.url) return media;
        const blob = await loadMedia(media.id).catch(() => null);
        return { ...media, url:blob ? URL.createObjectURL(blob) : '' };
      })),
    }))).then(hydrated => {
      if (hydrated.some((product,index) => product.media.some((media,mediaIndex) => media.url !== managedProducts[index]?.media[mediaIndex]?.url))) setManagedProducts(hydrated);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex(index => (index + 1) % watches.length);
      setReviewIndex(index => (index + 1) % 3);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncShopRoute = () => {
      const match = window.location.pathname.match(/^\/shop\/product\/(.+)$/);
      setAllProductsOpen(window.location.pathname.startsWith('/shop'));
      setShopProductId(match ? decodeURIComponent(match[1]) : null);
    };
    window.addEventListener('popstate', syncShopRoute);
    return () => window.removeEventListener('popstate', syncShopRoute);
  }, []);

  useEffect(() => {
    let active = true;
    setRemoteShopProduct(null);
    if (!shopProductId) return () => { active = false; };
    getPublishedProduct(shopProductId)
      .then(product => {
        if (active && product) setRemoteShopProduct(catalogDisplayProduct(product, lang));
      })
      .catch(error => console.warn('Unable to load the full product details.', error));
    return () => { active = false; };
  }, [shopProductId, lang]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenu(false);
  };

  const moveRail = (direction) => {
    watchRail.current?.scrollBy({ left: direction * watchRail.current.clientWidth * .78, behavior: 'smooth' });
  };

  const addToCart = (watch) => {
    setCart(items => {
      const existing = items.find(item => item.id === watch.id);
      return existing
        ? items.map(item => item.id === watch.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...watch, quantity: 1 }];
    });
    setCartPulse(false);
    window.requestAnimationFrame(() => setCartPulse(true));
    window.setTimeout(() => setCartPulse(false), 900);
  };

  const addBrandProduct = (brand, model, index, visual) => {
    addToCart({
      id: `${brand.en}-${model}-${index}`,
      image: visual.image,
      customMeta: { brand, lineIndex: index % brand.enLines.length, rare: index >= 4 },
    });
  };

  const changeQuantity = (id, amount) => {
    setCart(items => items
      .map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter(item => item.quantity > 0));
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const itemPrice = (item) => item.price || (item.customMeta ? 1650 + item.customMeta.lineIndex * 350 + (item.customMeta.rare ? 900 : 0) : ({ aurelia: 3200, celeste: 4200, monolith: 2600 }[item.id] || 2200));
  const cartTotal = cart.reduce((total, item) => total + itemPrice(item) * item.quantity, 0);
  const money = value => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
  const allStoreProducts = [
    ...managedProducts.filter(product => product.status === 'published').map(product => ({ ...product, tags:deriveProductTags(product), sortDate:product.updatedAt || new Date().toISOString(), displayName:lang === 'zh' ? product.nameZh : product.translations?.[lang]?.name || product.nameEn || product.translations?.en?.name || 'Selected timepiece', displayBrand:lang === 'zh' ? product.brandZh : product.brandEn || 'OiWatch', description:lang === 'zh' ? product.descriptionZh : product.translations?.[lang]?.description || product.descriptionEn || product.translations?.en?.description || 'Product information is being prepared.', mediaUrls:product.media?.map(media => ({ url:media.url, type:media.type })) || [], cartItem:{ ...product, image:product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', customManaged:true } })),
  ].sort((a,b) => new Date(b.sortDate)-new Date(a.sortDate));
  const submitOrder = async event => {
    event.preventDefault();
    setOrderSubmitting(true);
    setOrderError('');
    if (!checkoutDetails) return;
    try {
      const orderNumber = `OI-${Date.now().toString(36).toUpperCase()}`;
      const items = cart.map(item => ({
          id:item.id,
          quantity:item.quantity,
          unitPrice:itemPrice(item),
          name:item.nameEn || item.nameZh || item.id,
        }));
      const orderTotal = paymentMethod === 'cod' ? Math.round(cartTotal * 1.1 * 100) / 100 : cartTotal;
      const paymentResponse = await fetch('/.netlify/functions/create-crypto-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderNumber, amountUsd: paymentMethod === 'cod' ? 40 : cartTotal, orderTotal, asset: paymentAsset, customer:{ name:checkoutDetails.customerName, email:checkoutDetails.email, phone:checkoutDetails.phone, address:checkoutDetails.streetAddress, postalCode:checkoutDetails.postalCode, country:checkoutDetails.country }, items, paymentMethod }),
      });
      const payment = await paymentResponse.json().catch(() => null);
      if (!paymentResponse.ok) throw new Error(payment?.error || 'Unable to create a crypto payment.');
      setPaymentInvoice(payment);
      setOrderPlaced(true);
    } catch (error) {
      setOrderError(error.message || 'Unable to submit the order.');
    } finally {
      setOrderSubmitting(false);
    }
  };
  const confirmDeliveryDetails = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (['customerName','email','phone','country','streetAddress','postalCode'].some(key => !String(data.get(key) || '').trim())) { setOrderError('Please complete every contact and delivery field.'); return; }
    setCheckoutDetails(Object.fromEntries(data.entries()));
    setCheckoutStep(2);
    setOrderError('');
  };
  const submitPaymentProof = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const screenshot = form.get('screenshot');
    const txid = String(form.get('txid') || '').trim();
    if (!txid && !(screenshot instanceof File && screenshot.size)) {
      setPaymentProofStatus('Add a transaction hash or payment screenshot.');
      return;
    }
    setPaymentProofStatus('Submitting proof...');
    let screenshotData = null;
    if (screenshot instanceof File && screenshot.size) {
      if (!screenshot.type.startsWith('image/') || screenshot.size > 5 * 1024 * 1024) {
        setPaymentProofStatus('Screenshot must be an image no larger than 5 MB.');
        return;
      }
      screenshotData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(screenshot); });
    }
    try {
      const response = await fetch('/.netlify/functions/submit-crypto-proof', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ orderId:paymentInvoice.orderId, asset:paymentInvoice.asset, txid, screenshotData, screenshotName:screenshot instanceof File ? screenshot.name : '' }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Unable to submit proof.');
      setPaymentTxid(txid);
      setPaymentProofStatus('Checking payment on-chain...');
      const verificationResponse = await fetch('/.netlify/functions/verify-crypto-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ orderId:paymentInvoice.orderId, asset:paymentInvoice.asset, txid }) });
      const verification = await verificationResponse.json().catch(() => null);
      if (!verificationResponse.ok) throw new Error(verification?.error || 'Unable to verify payment.');
      setPaymentTxid(verification.txid || txid);
      setPaymentProofStatus(verification.status === 'completed' ? 'Payment completed.' : 'Payment submitted. Waiting for blockchain confirmation.');
      event.currentTarget.reset();
    } catch (error) { setPaymentProofStatus(error.message || 'Unable to submit proof.'); }
  };
  const paymentExplorerUrl = paymentTxid ? ({ BTC:`https://mempool.space/tx/${paymentTxid}`, ETH:`https://etherscan.io/tx/${paymentTxid}`, USDC:`https://etherscan.io/tx/${paymentTxid}`, USDT:`https://tronscan.org/#/transaction/${paymentTxid}`, SOL:`https://solscan.io/tx/${paymentTxid}` }[paymentInvoice?.asset] || null) : null;
  const navigateShop = (path) => {
    window.history.pushState({}, '', path);
    setAllProductsOpen(path.startsWith('/shop'));
    const match = path.match(/^\/shop\/product\/(.+)$/);
    setShopProductId(match ? decodeURIComponent(match[1]) : null);
    window.scrollTo(0, 0);
  };
  const openShop = () => {
    setShopBrand('all');
    navigateShop('/shop');
  };
  const openShopBrand = brand => {
    setShopBrand(lang === 'zh' ? brand.zh : brand.en);
    navigateShop('/shop');
  };
  const closeShop = () => navigateShop('/');
  const openShopProduct = product => navigateShop(`/shop/product/${encodeURIComponent(product.id)}`);
  const shopProduct = remoteShopProduct || allStoreProducts.find(product => String(product.id) === String(shopProductId));
  const openWhatsApp = () => {
    const text = encodeURIComponent(lang === 'zh' ? '您好，我想咨询 OiWatch 的私人腕表服务。' : 'Hello, I would like to enquire about OiWatch private watch services.');
    const whatsappNumber = String(siteSettings.whatsapp || '+852 6651 0124').replace(/\D/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };
  const openAdminGate = async () => {
    setMenu(false);
    setAdminLoginError('');
    setAdminLoginBusy(true);
    const session = await getAdminSession();
    setAdminLoginBusy(false);
    if (session) {
      setAdminSession(session);
      listAdminProducts(session).then(setManagedProducts).catch(() => {});
      setAdminOpen(true);
      return;
    }
    setAdminEmail('');
    setAdminPassword('');
    setAdminGateOpen(true);
  };
  const verifyAdminLogin = async event => {
    event.preventDefault();
    setAdminLoginBusy(true);
    setAdminLoginError('');
    try {
      const session = await signInAdmin(adminEmail.trim(), adminPassword);
      setAdminSession(session);
      const cloudProducts = await listAdminProducts(session);
      setManagedProducts(cloudProducts);
      setAdminGateOpen(false);
      setAdminPassword('');
      setAdminOpen(true);
    } catch (error) {
      setAdminLoginError(error.message);
    } finally {
      setAdminLoginBusy(false);
    }
  };
  const closeAdmin = async () => {
    await signOutAdmin(adminSession);
    setPublicSiteSettings(JSON.parse(localStorage.getItem('oiwatch-site-settings') || '{"storeName":"OiWatch","whatsapp":"+852 6651 0124","defaultCurrency":"USD","eurRate":0.92}'));
    setAdminSession(null);
    setAdminOpen(false);
  };

  if (adminOpen) return <AdminDashboard products={managedProducts} setProducts={setManagedProducts} onClose={closeAdmin} session={adminSession}/>;

  return (
    <>
      <header className="nav">
        <button className="menu-btn" onClick={() => setMenu(true)} aria-label="菜单"><Menu size={21}/></button>
        <SiteLogo onClick={() => scrollTo('home')}/>
        <nav><button onClick={openShop}>{lang === 'zh' ? '全部商品' : 'All watches'}</button><button onClick={() => scrollTo('brands')}>{lang === 'zh' ? '品牌' : 'Maisons'}</button><button onClick={() => scrollTo('story')}>{lang === 'zh' ? '我们的故事' : 'Our story'}</button><button onClick={() => setPaymentGuideOpen(true)}>{lang === 'zh' ? '付款说明' : 'Payment guide'}</button></nav>
        <div className="nav-actions">
          <label className="language-picker"><Globe2 size={15}/><select value={lang} onChange={event => setLang(event.target.value)} aria-label={m.language}>{languageOptions.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <button className={`cart-trigger cart-prominent ${cartPulse ? 'cart-pulse' : ''}`} onClick={() => setCartOpen(true)} aria-label={m.cart}><ShoppingBag size={21}/><b>{lang === 'zh' ? '购物车' : 'Bag'}</b><span>{cartCount}</span></button>
          <button className="enquire" onClick={openWhatsApp}>{m.enquire}</button>
        </div>
      </header>

      <main>
        <section className="commerce-hero legacy-hero" id="home">
          <div className="bestseller-slider">
            {watches.map((watch, index) => {
              const content = getWatchContent(watch.id, lang);
              return <article className={heroIndex === index ? 'active' : ''} key={watch.id}>
                <img src={watch.image} alt={content.name}/>
                <div className="slide-shade"/>
                <div className="slide-content">
                  <p>{lang === 'zh' ? '热销商品' : 'BESTSELLERS'}</p>
                  <h1>{content.name}</h1>
                  <span>{content.subtitle}</span>
                  <div><button className="primary" onClick={() => openShopProduct(allStoreProducts.find(product => product.id === watch.id))}>{t.view}<ArrowRight size={17}/></button><button className="text-link" onClick={() => addToCart(watch)}>{m.add}</button></div>
                </div>
              </article>;
            })}
            <div className="slider-dots">{watches.map((watch,index)=><button className={heroIndex===index?'active':''} onClick={()=>setHeroIndex(index)} key={watch.id}/>)}</div>
          </div>
          <div className="review-slider">
            {[
              { image:'/images/watch-aurelia-web.jpg', zh:'从咨询到交付，每一个细节都令人安心。', en:'Every detail, from consultation to delivery, inspired confidence.' },
              { image:'/images/watch-celeste-web.jpg', zh:'专属顾问非常专业，帮我找到期待已久的款式。', en:'My advisor found the piece I had been seeking for years.' },
              { image:'/images/watch-monolith-web.jpg', zh:'鉴证透明、沟通迅速，是值得长期信赖的伙伴。', en:'Transparent authentication and responsive service — a trusted partner.' },
            ].map((review,index)=><article className={reviewIndex===index?'active':''} key={index}><img src={review.image} alt=""/><div className="review-shade"/><div><p>{lang==='zh'?'客户评价':'CLIENT STORIES'}</p><blockquote>“{lang==='zh'?review.zh:review.en}”</blockquote><span>OiWatch {lang==='zh'?'私人客户':'PRIVATE CLIENT'}</span></div></article>)}
            <div className="review-count">0{reviewIndex+1} / 03</div>
          </div>
        </section>

        <section className="collection section immersive-collection" id="collection" onMouseMove={event => { const box = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - box.left) / box.width) * 100}%`); event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - box.top) / box.height) * 100}%`); }}>
          <div className="section-heading">
            <div><p className="kicker">{t.featured}</p><h2>{t.sectionTitle}</h2></div>
            <p>{t.sectionText}</p>
          </div>
          <div className="rail-controls">
            <span>{m.swipe}</span>
          </div>
          <div className="watch-grid" ref={watchRail}>
            {managedProducts.filter(product => product.status === 'published').slice(0, 8).map((product, i) => (
              <article className="watch-card managed-card" key={product.id} role="button" tabIndex="0" onClick={() => openShopProduct(catalogDisplayProduct(product, lang))} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openShopProduct(catalogDisplayProduct(product, lang)); } }}>
                <div className="card-index">{lang === 'zh' ? '新品' : 'NEW'}</div>
                {product.media?.[0]?.type?.startsWith('video') ? <video src={product.media[0].url} muted loop autoPlay playsInline preload="metadata"/> : <img src={optimizedImage(product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', 760)} loading={i > 2 ? 'lazy' : 'eager'} decoding="async" alt={lang === 'zh' ? product.nameZh : product.translations?.[lang]?.name || product.nameEn || product.translations?.en?.name || 'Selected timepiece'}/>} 
                <div className="card-info"><p>{lang === 'zh' ? product.brandZh : product.brandEn || 'OiWatch'}</p><h3>{lang === 'zh' ? product.nameZh : product.translations?.[lang]?.name || product.nameEn || product.translations?.en?.name || 'Selected timepiece'}</h3><span>{money(product.price)}</span><div className="card-actions"><button onClick={() => openShopProduct(catalogDisplayProduct(product, lang))}>{t.view}<ArrowRight size={15}/></button><button className="add-cart" onClick={() => addToCart({ ...product, image:product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', customManaged:true })}><ShoppingBag size={14}/>{m.add}</button></div></div>
              </article>
            ))}
            {false && watches.map((watch, i) => {
              const content = getWatchContent(watch.id, lang);
              return (
              <article className={`watch-card ${watch.tone}`} key={watch.id}>
                <div className="card-index">0{i+1}</div>
                <img src={watch.image} alt={content.name} loading={i ? 'lazy' : 'eager'}/>
                <div className="card-info">
                  <p>{content.collection}</p>
                  <h3>{content.name}</h3>
                  <span>{content.subtitle}</span>
                  <div className="card-actions">
                    <button onClick={() => openShopProduct(allStoreProducts.find(product => product.id === watch.id))}>{t.view}<ArrowRight size={15}/></button>
                    <button className="add-cart" onClick={() => addToCart(watch)}><ShoppingBag size={14}/>{m.add}</button>
                  </div>
                </div>
              </article>
            )})}
          </div>
          <button className="outline" onClick={openShop}>{t.all}<ChevronRight size={17}/></button>
        </section>

        <section className="brands-section" id="brands">
          <div className="brands-heading">
            <p className="kicker">{m.brands}</p>
            <h2>{m.byBrand}</h2>
          </div>
          <div className="brand-rail" aria-label={lang === 'zh' ? '腕表品牌' : 'Watch brands'}>
            {brands.map((brand, index) => (
              <button className="brand-tile" key={brand.en} onClick={() => openShopBrand(brand)}>
                <span className="brand-logo">
                  <img
                    src={brandLogoOverrides[brand.en] || `https://logos.hunter.io/${brandDomains[index]}`}
                    alt={`${lang === 'zh' ? brand.zh : brand.en} Logo`}
                    loading="lazy"
                    onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid'; }}
                  />
                  <span className="brand-logo-fallback">{lang === 'zh' ? brand.zh : brand.en}</span>
                </span>
                <strong>{lang === 'zh' ? brand.zh : brand.en}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="story" id="story">
          <div className="story-image" aria-hidden="true"><div className="seal"><Clock3/><span>SUPER CLONE<br/>1:1</span></div></div>
          <div className="story-content">
            <p className="kicker">{t.storyKicker}</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.storyBody}</p>
            <div className="credentials">
              <div><ShieldCheck/><strong>1:1</strong><span>{q.best}</span></div>
              <div><Sparkles/><strong>TOP</strong><span>{lang === 'zh' ? '顶级细节' : lang === 'ja' ? '最高級の細部' : lang === 'ko' ? '최상급 디테일' : lang === 'fr' ? 'Détails premium' : lang === 'de' ? 'Premium-Details' : lang === 'es' ? 'Detalles prémium' : 'Premium details'}</span></div>
              <div><Globe2/><strong>QC</strong><span>{lang === 'zh' ? '交付前检查' : lang === 'ja' ? '出荷前検品' : lang === 'ko' ? '출고 전 검사' : lang === 'fr' ? 'Contrôle final' : lang === 'de' ? 'Endkontrolle' : lang === 'es' ? 'Control final' : 'Final inspection'}</span></div>
            </div>
            <button className="text-link dark-link">{t.learn}<ArrowRight size={15}/></button>
          </div>
        </section>

      </main>

      <section className="shipping-partners" aria-label={lang === 'zh' ? '全球配送伙伴' : 'Worldwide delivery partners'}>
        <div className="shipping-copy">
          <p>{lang === 'zh' ? '全球配送伙伴' : 'WORLDWIDE DELIVERY PARTNERS'}</p>
          <span>{lang === 'zh' ? '安全包装 · 全程追踪 · 全球送达' : 'Secure packing · End-to-end tracking · Worldwide delivery'}</span>
        </div>
        <div className="shipping-logos">
          <span className="courier-logo dhl" aria-label="DHL">DHL</span>
          <span className="courier-logo fedex" aria-label="FedEx"><b>Fed</b><i>Ex</i></span>
          <span className="courier-logo ups" aria-label="UPS">UPS</span>
          <span className="courier-logo sf" aria-label="SF Express"><b>SF</b><i>EXPRESS</i></span>
          <span className="courier-logo ems" aria-label="EMS">EMS</span>
          <span className="courier-logo hkpost" aria-label="Hongkong Post">HONGKONG POST</span>
          <span className="courier-logo tnt" aria-label="TNT">TNT</span>
          <span className="courier-logo aramex" aria-label="Aramex">aramex</span>
        </div>
      </section>

      <footer>
        <SiteLogo/>
        <p>{lang === 'zh' ? 'OiWatch 全球送货' : 'OIWATCH WORLDWIDE DELIVERY'}</p>
        <span>© 2026 OIWATCH</span>
      </footer>

      {menu && <div className="mobile-menu"><button className="close" onClick={() => setMenu(false)}><X/></button><SiteLogo/><button onClick={() => { setMenu(false); openShop(); }}>{lang === 'zh' ? '全部商品' : 'All watches'}</button><button onClick={() => scrollTo('brands')}>{lang === 'zh' ? '品牌' : 'Maisons'}</button><button onClick={() => scrollTo('story')}>{lang === 'zh' ? '我们的故事' : 'Our story'}</button><button onClick={() => { setMenu(false); setPaymentGuideOpen(true); }}>{lang === 'zh' ? '付款说明' : 'Payment guide'}</button><label className="language-picker"><Globe2/><select value={lang} onChange={event => setLang(event.target.value)}>{languageOptions.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label></div>}

      {paymentGuideOpen && <PaymentGuide lang={lang} activeTab={paymentGuideTab} setActiveTab={setPaymentGuideTab} onClose={() => setPaymentGuideOpen(false)}/>} 

      {adminGateOpen && <div className="admin-gate-backdrop" onClick={() => setAdminGateOpen(false)}>
        <form className="admin-gate" onSubmit={verifyAdminLogin} onClick={event => event.stopPropagation()}>
          <button type="button" className="close" onClick={() => setAdminGateOpen(false)}><X/></button>
          <SiteLogo/>
          <p>{lang === 'zh' ? '仅限授权人员' : 'AUTHORIZED ACCESS ONLY'}</p>
          <h2>{lang === 'zh' ? '进入管理后台' : 'Admin access'}</h2>
          <label>{lang === 'zh' ? '管理员邮箱' : 'Administrator email'}<input autoFocus required type="email" value={adminEmail} onChange={event => { setAdminEmail(event.target.value); setAdminLoginError(''); }} autoComplete="username"/></label>
          <label>{lang === 'zh' ? '管理员密码' : 'Administrator password'}<input required type="password" value={adminPassword} onChange={event => { setAdminPassword(event.target.value); setAdminLoginError(''); }} autoComplete="current-password"/></label>
          {adminLoginError && <span>{lang === 'zh' ? '登录失败，请检查邮箱、密码和管理员权限。' : adminLoginError}</span>}
          <button className="primary" type="submit" disabled={adminLoginBusy}>{adminLoginBusy ? (lang === 'zh' ? '正在验证…' : 'Checking…') : (lang === 'zh' ? '安全登录' : 'Secure sign in')}</button>
        </form>
      </div>}

      {qualityOpen && <div className="quality-page">
        <header className="quality-header"><button onClick={() => setQualityOpen(false)}><ArrowLeft size={17}/>{q.back}</button><SiteLogo/><span>SUPER CLONE 1:1</span></header>
        <div className="quality-hero"><p className="kicker">{q.kicker}</p><h1>{q.title}</h1><p>{q.intro}</p></div>
        <div className="quality-comparison">
          {[{title:q.super,badge:q.best,points:q.superPoints,premium:true},{title:q.aaa,badge:q.cheap,points:q.aaaPoints}].map(group=><article className={group.premium?'premium':''} key={group.title}><span>{group.badge}</span><h2>{group.title}</h2><ul>{group.points.map(point=><li key={point}><ShieldCheck size={17}/><p>{point}</p></li>)}</ul></article>)}
        </div>
        <p className="quality-note">{q.note}</p>
      </div>}

      {allProductsOpen && (shopProduct
        ? <ShopProductPage product={shopProduct} products={allStoreProducts} lang={lang} money={money} cartCount={cartCount} cartPulse={cartPulse} onBack={() => navigateShop('/shop')} onCart={() => setCartOpen(true)} onAdd={addToCart} onProduct={openShopProduct}/>
        : <ShopPage products={allStoreProducts} initialBrand={shopBrand} lang={lang} money={money} cartCount={cartCount} cartPulse={cartPulse} onBack={closeShop} onCart={() => setCartOpen(true)} onProduct={openShopProduct} onAdd={addToCart}/>)}

      {false && <div className="all-products-page">
        <header className="all-products-header">
          <button onClick={() => setAllProductsOpen(false)}><ArrowLeft size={17}/>{lang === 'zh' ? '返回首页' : 'Back to home'}</button>
          <SiteLogo/>
          <button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={() => setCartOpen(true)} aria-label={m.cart}><ShoppingBag size={17}/><span>{cartCount}</span></button>
        </header>
        <div className="all-products-content">
          <div className="all-products-title">
            <div><p className="kicker">{lang === 'zh' ? '全部在售时计' : 'ALL AVAILABLE PIECES'}</p><h1>{lang === 'zh' ? '最新上架' : 'New Arrivals'}</h1></div>
            <span>{lang === 'zh' ? `共 ${allStoreProducts.length} 件商品 · 按上架时间由新到旧` : `${allStoreProducts.length} pieces · Newest first`}</span>
          </div>
          <div className="all-products-grid">
            {allStoreProducts.map((product, index) => <article key={product.id}>
              <div className="all-product-media">
                {(product.mediaUrls.length ? product.mediaUrls : [{ url:'/images/watch-aurelia-web.jpg', type:'image/jpeg' }]).map((media, mediaIndex) =>
                  media.type?.startsWith('video')
                    ? <video key={mediaIndex} src={media.url} controls playsInline/>
                    : <img key={mediaIndex} src={media.url} alt={product.displayName} loading={index > 2 ? 'lazy' : 'eager'}/>
                )}
              </div>
              <div className="all-product-info">
                <p>{product.displayBrand}</p>
                <h2>{product.displayName}</h2>
                <small>{new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', { year:'numeric', month:'short', day:'numeric' }).format(new Date(product.sortDate))}</small>
                <div><strong>{money(product.price)}</strong><button onClick={() => addToCart(product.cartItem)}><ShoppingBag size={15}/>{m.add}</button></div>
              </div>
            </article>)}
          </div>
        </div>
      </div>}

      {selected && <div className="drawer-backdrop" onClick={() => setSelected(null)}>
        <aside className="drawer" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setSelected(null)}><X/></button>
          <div className={`drawer-image ${selected.tone}`}><img src={selected.image} alt={getWatchContent(selected.id, lang).name}/></div>
          <div className="drawer-content">
            <p className="kicker">{getWatchContent(selected.id, lang).collection}</p><h2>{getWatchContent(selected.id, lang).name}</h2><p>{getWatchContent(selected.id, lang).description}</p>
            <div className="specs">{getWatchContent(selected.id, lang).specs.map(s => <div key={s[0]}><span>{s[0]}</span><strong>{s[1]}</strong></div>)}</div>
            <button className="cart-detail-button" onClick={() => { addToCart(selected); setSelected(null); }}><ShoppingBag size={17}/>{m.add}</button>
          </div>
        </aside>
      </div>}

      {brandPage && <div className="brand-page">
        <header className="brand-page-header">
          <button onClick={() => setBrandPage(null)}><ArrowLeft size={17}/>{lang === 'zh' ? '返回品牌总览' : 'Back to brands'}</button>
          <SiteLogo/>
          <div className="brand-header-actions"><button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={() => setCartOpen(true)}><ShoppingBag size={17}/><span>{cartCount}</span></button><button onClick={openWhatsApp}><MessageCircle size={17}/>{m.enquire}</button></div>
        </header>
        <div className="brand-page-hero">
          <img src={brandLogoOverrides[brandPage.en] || `https://logos.hunter.io/${brandDomains[brandPage.index]}`} alt={`${lang === 'zh' ? brandPage.zh : brandPage.en} Logo`}/>
          <p>{lang === 'zh' ? '品牌腕表目录' : 'MAISON CATALOGUE'}</p>
          <h1>{lang === 'zh' ? brandPage.zh : brandPage.en}</h1>
          <span>{lang === 'zh' ? '精选在售与全球寻表服务' : 'Curated availability and worldwide sourcing'}</span>
        </div>
        <div className="brand-watch-grid">
          {Array.from({ length: 5 }, (_, index) => {
            const lines = lang === 'zh' ? brandPage.zhLines : brandPage.enLines;
            const model = lines[index % lines.length];
            const visual = watches[index % watches.length];
            const officialModel = brandPage.enLines[index % brandPage.enLines.length];
            const productImage = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(`${brandPage.en} ${officialModel} official watch`)}&w=900&h=900&c=7&rs=1&p=0`;
            const product = { brand: brandPage, model, officialModel, index, visual, productImage };
            return <article key={`${model}-${index}`}>
              <button className="brand-watch-image" onClick={() => setCatalogProduct(product)}><img src={productImage} alt={model} onError={event => { event.currentTarget.src = visual.image; }}/><span>0{index + 1}</span></button>
              <p>{lang === 'zh' ? brandPage.zh : brandPage.en}</p>
              <h3>{model}</h3>
              <small>{lang === 'zh' ? (index < 4 ? '经典精选' : '珍罕配置') : (index < 4 ? 'Signature selection' : 'Rare configuration')}</small>
              <div className="brand-product-actions">
                <button onClick={() => addBrandProduct(brandPage, model, index, visual)}><ShoppingBag size={14}/>{m.add}</button>
              </div>
            </article>;
          })}
        </div>
      </div>}

      {catalogProduct && <div className="catalog-backdrop" onClick={() => setCatalogProduct(null)}>
        <section className="catalog-detail" onClick={event => event.stopPropagation()}>
          <button className="close" onClick={() => setCatalogProduct(null)}><X/></button>
          <div className="catalog-gallery">
            <img src={catalogProduct.productImage} alt={catalogProduct.model} onError={event => { event.currentTarget.src = catalogProduct.visual.image; }}/>
            <div>{[1,2,3].map(number => <button key={number}><img src={catalogProduct.productImage} alt=""/></button>)}</div>
          </div>
          <div className="catalog-info">
            <p>{lang === 'zh' ? catalogProduct.brand.zh : catalogProduct.brand.en}</p>
            <h2>{catalogProduct.model}</h2>
            <div className="catalog-badges"><span>{lang === 'zh' ? '专业鉴证' : 'Authenticated'}</span><span>{lang === 'zh' ? '全球寻表' : 'Worldwide sourcing'}</span></div>
            <div className="catalog-spec-list">
              <div><span>{lang === 'zh' ? '商品状态' : 'Condition'}</span><strong>{lang === 'zh' ? '全新 / 未佩戴' : 'New / Unworn'}</strong></div>
              <div><span>{lang === 'zh' ? '随附物品' : 'Included'}</span><strong>{lang === 'zh' ? '原装表盒及证书' : 'Original box and papers'}</strong></div>
              <div><span>{lang === 'zh' ? '交付方式' : 'Delivery'}</span><strong>{lang === 'zh' ? '全球安全配送' : 'Secure worldwide delivery'}</strong></div>
            </div>
            <p className="catalog-note">{lang === 'zh' ? '具体年份、配置、价格与库存由专属顾问确认。所有腕表在交付前均经过独立鉴证。' : 'Year, configuration, pricing and availability are confirmed by your private advisor. Every piece is independently authenticated before delivery.'}</p>
            <button className="primary" onClick={() => { addBrandProduct(catalogProduct.brand, catalogProduct.model, catalogProduct.index, catalogProduct.visual); setCatalogProduct(null); }}><ShoppingBag size={17}/>{m.add}</button>
          </div>
        </section>
      </div>}

      {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}>
        <aside className="cart-panel" onClick={event => event.stopPropagation()}>
          <div className="cart-header">
            <div><span>{lang === 'zh' ? '私人选购' : 'PRIVATE SELECTION'}</span><h2>{lang === 'zh' ? '购物车' : 'Shopping bag'}</h2></div>
            <button className="close" onClick={() => setCartOpen(false)}><X/></button>
          </div>
          <div className="cart-items">
            {cart.length === 0
              ? <div className="empty-cart"><ShoppingBag/><p>{lang === 'zh' ? '购物车目前为空' : 'Your shopping bag is empty'}</p><button onClick={() => setCartOpen(false)}>{lang === 'zh' ? '继续浏览' : 'Continue browsing'}</button></div>
              : cart.map(item => {
                const content = item.customManaged ? { collection:lang === 'zh' ? item.brandZh : item.brandEn || 'OiWatch', name:lang === 'zh' ? item.nameZh : item.translations?.[lang]?.name || item.nameEn || item.translations?.en?.name || 'Selected timepiece', subtitle:money(item.price) } : item.customMeta ? {
                  collection: lang === 'zh' ? item.customMeta.brand.zh : item.customMeta.brand.en,
                  name: (lang === 'zh' ? item.customMeta.brand.zhLines : item.customMeta.brand.enLines)[item.customMeta.lineIndex],
                  subtitle: lang === 'zh' ? (item.customMeta.rare ? '珍罕配置' : '经典精选') : (item.customMeta.rare ? 'Rare configuration' : 'Signature selection'),
                } : getWatchContent(item.id, lang);
                return <article className="cart-item" key={item.id}>
                  <img src={item.image} alt={content.name}/>
                  <div><span>{content.collection}</span><h3>{content.name}</h3><p>{content.subtitle}</p><b className="cart-price">{money(itemPrice(item))}</b>
                    <div className="quantity">
                      <button onClick={() => changeQuantity(item.id, -1)}><Minus size={13}/></button>
                      <strong>{item.quantity}</strong>
                      <button onClick={() => changeQuantity(item.id, 1)}><Plus size={13}/></button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => setCart(items => items.filter(entry => entry.id !== item.id))} aria-label={lang === 'zh' ? '删除' : 'Remove'}><Trash2 size={16}/></button>
                </article>;
              })}
          </div>
          {cart.length > 0 && <div className="cart-footer">
            <p><span>{lang === 'zh' ? '所选数量' : 'Selected pieces'}</span><strong>{cartCount}</strong></p>
            <p className="cart-total"><span>{lang === 'zh' ? '合计' : 'Total'}</span><strong>{money(cartTotal)}</strong></p>
            <button className="primary" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>{lang === 'zh' ? '提交订单咨询' : 'Submit order request'}<ArrowRight size={17}/></button>
            <small>{lang === 'zh' ? '商品统一以美元计价，已包含安全配送服务。' : 'Products are priced in USD and include secure delivery.'}</small>
          </div>}
        </aside>
      </div>}

      {checkoutOpen && <div className="checkout-page">
        <header className="checkout-header"><SiteLogo/><button onClick={() => setCheckoutOpen(false)}><X size={18}/>{lang === 'zh' ? '返回购物车' : 'Return to bag'}</button></header>
        {orderPlaced && paymentInvoice && <div className="order-success crypto-payment">
          <ShieldCheck/><p>{paymentMethod === 'cod' ? 'COD SHIPPING PAYMENT' : 'CRYPTO PAYMENT'}</p><h2>{paymentMethod === 'cod' ? 'Pay $40 shipping to confirm COD' : 'Scan to complete payment'}</h2>
          <span>{paymentMethod === 'cod' ? `Order ${paymentInvoice.orderId}. This payment covers shipping only; the remaining balance is due on delivery.` : `Order ${paymentInvoice.orderId}. Pay using ${paymentInvoice.asset} only.`}</span>
          {paymentInvoice.qrCode ? <><img className="payment-qr" src={paymentInvoice.qrCode} alt="Payment QR code"/><a className="payment-copy" href={paymentInvoice.qrCode} download={`oiwatch-${paymentInvoice.orderId}-${paymentInvoice.asset}-qr.png`}>Save QR code</a></> : <div className="payment-qr-placeholder">QR code unavailable</div>}
          <strong className="payment-due">{paymentInvoice.amountCoin ? `${paymentInvoice.amountCoin} ${paymentInvoice.asset}` : paymentInvoice.asset}</strong>
          <code className="payment-address">{paymentInvoice.address}</code>
          <button type="button" className="payment-copy" onClick={() => navigator.clipboard?.writeText(paymentInvoice.address)}>Copy address</button>
          <small>Use only the selected asset and network. Payment stays pending until verified on-chain.</small>
          <form className="payment-proof" onSubmit={submitPaymentProof}>
            <label>Transaction hash<input name="txid" placeholder="Paste transaction hash" autoComplete="off"/></label>
            <label>Payment screenshot<input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp"/></label>
            <button type="submit" className="payment-copy">Submit payment proof</button>
          </form>
          {paymentProofStatus && <p className="payment-proof-status">{paymentProofStatus}</p>}
          {paymentExplorerUrl && <a className="payment-copy" href={paymentExplorerUrl} target="_blank" rel="noreferrer">View transaction on-chain</a>}
          <button className="primary" onClick={() => { setOrderPlaced(false); setPaymentInvoice(null); setCheckoutOpen(false); setCart([]); }}>Done</button>
        </div>}        {orderPlaced && !paymentInvoice ? <div className="order-success"><ShieldCheck/><p>{lang === 'zh' ? '订单已提交' : 'ORDER SUBMITTED'}</p><h2>{lang === 'zh' ? '感谢您的选购' : 'Thank you for your order'}</h2><span>{lang === 'zh' ? '专属顾问将通过 WhatsApp 或电子邮件确认库存、配送和付款安排。网站不会收集银行卡资料。' : 'Your advisor will confirm availability, delivery and payment arrangements by WhatsApp or email. This website does not collect card details.'}</span><button className="primary" onClick={() => { setOrderPlaced(false); setCheckoutOpen(false); setCart([]); }}>{lang === 'zh' ? '返回首页' : 'Return home'}</button></div>
        : <div className="checkout-layout">
          {checkoutStep === 1 ? <form className="payment-form delivery-form" noValidate onSubmit={confirmDeliveryDetails}>
            <p>{lang === 'zh' ? '第 1 步 / 配送地址' : 'STEP 1 / DELIVERY ADDRESS'}</p><h1>{lang === 'zh' ? '先确认配送地址' : 'Confirm your delivery address'}</h1>
            <fieldset><legend>{lang === 'zh' ? '联系资料' : 'Contact details'}</legend><div className="form-row"><input name="customerName" required placeholder={lang === 'zh' ? '姓名' : 'Full name'}/><input name="email" required type="email" placeholder={lang === 'zh' ? '电子邮箱' : 'Email address'}/></div><input name="phone" required placeholder={lang === 'zh' ? '联系电话' : 'Phone number'}/></fieldset>
            <fieldset><legend>{lang === 'zh' ? '配送地址' : 'Delivery address'}</legend><select className="checkout-country" name="country" required defaultValue=""><option value="" disabled>{lang === 'zh' ? '选择国家或地区' : 'Select country or region'}</option>{countryOptions.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</select><textarea name="streetAddress" required rows="6" placeholder={lang === 'zh' ? '详细地址：街道、门牌号、公寓/楼层等' : 'Full address: street, building number, apartment or floor'}/><input name="postalCode" required placeholder={lang === 'zh' ? '邮政编码' : 'Postal code'}/></fieldset>
            {orderError && <p className="admin-save-error">{orderError}</p>}<button className="primary" type="submit"><ArrowRight size={17}/>{lang === 'zh' ? '确认地址，下一步' : 'Confirm address & continue'}</button>
          </form> : <form className="payment-form" onSubmit={submitOrder}>
            <p>{lang === 'zh' ? '第 2 步 / 付款方式' : 'STEP 2 / PAYMENT METHOD'}</p><h1>{lang === 'zh' ? '选择付款方式' : 'Choose payment method'}</h1>
            <fieldset><legend>{lang === 'zh' ? '付款方式' : 'Payment method'}</legend><div className="payment-method-options"><label><input type="radio" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')}/><span><strong>{lang === 'zh' ? '加密货币' : 'Cryptocurrency'}</strong><small>{lang === 'zh' ? '按链上金额付款' : 'Pay the order amount on-chain'}</small></span></label><label><input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')}/><span><strong>{lang === 'zh' ? '货到付款' : 'Cash on delivery'}</strong><small>{lang === 'zh' ? '总额加 10%，先付 $40 运费' : '10% service fee; $40 shipping paid first'}</small></span></label></div></fieldset>{paymentMethod === 'crypto' ? <fieldset><legend>{lang === 'zh' ? '加密货币' : 'Cryptocurrency'}</legend><div className="crypto-options">{[['USDT','TRC20'],['USDC','ERC20'],['BTC','Bitcoin'],['ETH','Ethereum'],['SOL','Solana']].map(([asset, network]) => <label key={asset}><input type="radio" name="paymentAsset" value={asset} checked={paymentAsset === asset} onChange={() => setPaymentAsset(asset)}/><span><strong>{asset}</strong><small>{network}</small></span></label>)}</div></fieldset> : <div className="cod-summary"><strong>{lang === 'zh' ? '货到付款结算' : 'Cash-on-delivery breakdown'}</strong><span>{lang === 'zh' ? `订单总额（含 10% 服务费）：${money(cartTotal * 1.1)}` : `Order total with 10% service fee: ${money(cartTotal * 1.1)}`}</span><span>{lang === 'zh' ? '现在需支付运费：$40' : 'Shipping due now: $40'}</span><span>{lang === 'zh' ? `签收时支付余额：${money(Math.max(0, cartTotal * 1.1 - 40))}` : `Balance due on delivery: ${money(Math.max(0, cartTotal * 1.1 - 40))}`}</span></div>}{orderError && <p className="admin-save-error">{orderError}</p>}<button className="primary" type="submit" disabled={orderSubmitting}><ShieldCheck size={17}/>{orderSubmitting ? (lang === 'zh' ? '正在创建付款…' : 'Creating payment…') : paymentMethod === 'cod' ? (lang === 'zh' ? '支付 $40 运费并确认货到付款' : 'Pay $40 shipping & confirm COD') : (lang === 'zh' ? `确认并创建付款 ${money(cartTotal)}` : `Confirm & create payment ${money(cartTotal)}`)}</button><button type="button" className="checkout-back" onClick={() => setCheckoutStep(1)}>{lang === 'zh' ? '返回修改地址' : 'Back to address'}</button>
          </form>}
          <aside className="order-summary"><h2>{lang === 'zh' ? '订单摘要' : 'Order summary'}</h2>{cart.map(item => { const content = item.customManaged ? { name:lang==='zh'?item.nameZh:item.translations?.[lang]?.name||item.nameEn||item.translations?.en?.name||'Selected timepiece', collection:lang==='zh'?item.brandZh:item.brandEn||'OiWatch' } : item.customMeta ? { name:(lang==='zh'?item.customMeta.brand.zhLines:item.customMeta.brand.enLines)[item.customMeta.lineIndex], collection:lang==='zh'?item.customMeta.brand.zh:item.customMeta.brand.en } : getWatchContent(item.id,lang); return <article key={item.id}><img src={item.image} alt={content.name}/><div><span>{content.collection}</span><h3>{content.name}</h3><p>{lang==='zh'?'数量':'Quantity'}：{item.quantity}</p></div><strong>{money(itemPrice(item)*item.quantity)}</strong></article>})}<div className="summary-total"><span>{lang==='zh'?'订单合计':'Order total'}</span><strong>{money(cartTotal)}</strong></div></aside>
        </div>}
      </div>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
