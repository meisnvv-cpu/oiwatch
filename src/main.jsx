import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, ChevronRight, Clock3, CreditCard, ExternalLink, Globe2, Instagram, Menu, MessageCircle, Minus, PackageCheck, Play, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import './styles.css';
import { deleteAdminProduct, getAdminSession, getPublishedProduct, getSiteSettings, listAdminCustomers, listAdminOrders, listAdminProducts, listPublishedBrands, listPublishedProducts, listPublishedProductsPage, saveAdminProduct, saveSiteSettings, signInAdmin, signOutAdmin, uploadAdminMedia } from './supabase.js';
import { getCommerceCopy } from './commerce-copy.js';

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
  { en: 'Oris', zh: '豪利时', enLines: ['Aquis', 'Divers Sixty-Five', 'Big Crown', 'ProPilot'], zhLines: ['Aquis 潜水系列', 'Divers Sixty-Five 潜水复古系列', '大表冠', '航空'] },
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

const HERO_BACKGROUND_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4';
const COLLECTION_BACKGROUND_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4';

function FadingHeroVideo({ src = HERO_BACKGROUND_VIDEO, className = 'hero-reference-video' }) {
  const videoRef = useRef(null);
  const frameRef = useRef(0);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const fadeTo = (target, duration = 500) => {
      cancelAnimationFrame(frameRef.current);
      const start = performance.now();
      const initial = Number.parseFloat(video.style.opacity || '0');
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        video.style.opacity = String(initial + (target - initial) * progress);
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    };
    const startPlayback = () => {
      video.style.opacity = '0';
      video.play().then(() => fadeTo(1)).catch(() => {});
    };
    const fadeBeforeEnd = () => {
      if (!fadingOutRef.current && video.duration && video.duration - video.currentTime <= 0.55) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };
    const replay = () => {
      video.style.opacity = '0';
      window.setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        video.play().then(() => fadeTo(1)).catch(() => {});
      }, 100);
    };

    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('timeupdate', fadeBeforeEnd);
    video.addEventListener('ended', replay);
    if (video.readyState >= 2) startPlayback();
    return () => {
      cancelAnimationFrame(frameRef.current);
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('timeupdate', fadeBeforeEnd);
      video.removeEventListener('ended', replay);
    };
  }, []);

  return <video ref={videoRef} className={className} src={src} muted playsInline preload="auto" aria-hidden="true" tabIndex="-1" />;
}

const modelTagPattern = /\b(RM\s?\d{2,3}(?:[- ]\d{1,3})?|PAM\s?\d{3,4}|IW\s?\d{5,8}|BR\s?\d{2}(?:[- ]?[A-Z0-9]+)?|[A-Z]{0,3}\d{4,6}[A-Z]{0,3})\b/i;
const CART_STORAGE_KEY = 'oiwatch-cart-v3';
const CHECKOUT_STORAGE_KEY = 'oiwatch-checkout-details-v1';
const CHECKOUT_FLOW_STORAGE_KEY = 'oiwatch-checkout-flow-v1';
const cjkPattern = /[\u3400-\u9fff]+/g;
const prohibitedCatalogueTermsPattern = /(?:replica|super\s*clone|clone|aaa|vsf|apsf?|ppf|clean|zf|qf|twf|factory|复刻|仿表|克隆|工厂|厂新品)/i;
const anyCjkPattern = /[\u3400-\u9fff]/;
const japaneseKanaPattern = /[\u3040-\u30ff]/;

function formatCopy(value, variables = {}) {
  return Object.entries(variables).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)),
    String(value || ''),
  );
}

function readStoredCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && item.id && Number(item.quantity || 0) > 0) : [];
  } catch {
    return [];
  }
}

function readStoredCheckoutDetails() {
  try {
    const value = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) || 'null');
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function readStoredCheckoutFlow() {
  try {
    const value = JSON.parse(localStorage.getItem(CHECKOUT_FLOW_STORAGE_KEY) || 'null');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function cleanLocalizedText(value, lang) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (lang === 'zh') return text;
  if (lang === 'ja') {
    if (!anyCjkPattern.test(text) || japaneseKanaPattern.test(text)) return text;
    // A Japanese translation may combine kana and kanji. Pure Han text in
    // this field is usually an untranslated Chinese import; retain only the
    // model code or Latin brand text instead of exposing the wrong language.
    return text
      .replace(cjkPattern, ' ')
      .replace(/[（(]\s*[)）]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  // Imported records often repeat Chinese after an English model name. Keep a
  // single readable language rather than exposing a mixed-language title.
  return text
    .replace(cjkPattern, ' ')
    .replace(/[（(]\s*[)）]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
}

function localizedProductValue(product, lang, field) {
  const candidate = lang === 'zh'
    ? (field === 'name' ? product.nameZh : product.descriptionZh)
    : lang === 'en'
      ? product.translations?.en?.[field] || (field === 'name' ? product.nameEn : product.descriptionEn)
      : product.translations?.[lang]?.[field];
  const english = product.translations?.en?.[field] || (field === 'name' ? product.nameEn : product.descriptionEn);
  const source = lang !== 'zh' && lang !== 'en'
    && String(candidate || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase()
      === String(english || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase()
    ? ''
    : candidate;
  const fallbacks = {
    zh:{ name:'精选腕表', description:'商品资料正在整理中。' },
    en:{ name:'Selected timepiece', description:'Product information is being prepared.' },
    ja:{ name:'厳選腕時計', description:'商品情報を準備しています。' },
    ko:{ name:'엄선된 시계', description:'상품 정보를 준비하고 있습니다.' },
    fr:{ name:'Montre sélectionnée', description:'Les informations produit sont en cours de préparation.' },
    de:{ name:'Ausgewählte Uhr', description:'Die Produktinformationen werden vorbereitet.' },
    es:{ name:'Reloj seleccionado', description:'La información del producto se está preparando.' },
  };
  const brand = cleanLocalizedText(lang === 'zh' ? product.brandZh : product.brandEn, lang) || 'OiWatch';
  const modelSource = [product.nameEn, ...(product.tags || [])]
    .map(value => cleanLocalizedText(value, lang))
    .find(value => value && /[A-Za-z0-9]/.test(value) && !prohibitedCatalogueTermsPattern.test(value));
  const model = modelSource || '';
  const generated = {
    zh:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''} 商品资料；具体配置、状态、包装与随附文件以单件商品及订单确认为准。` },
    en:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}. The exact configuration, condition, packaging, and included documents are confirmed for the individual item and order.` },
    ja:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}。正確な仕様、状態、包装、付属書類は商品ごと・注文ごとに確認されます。` },
    ko:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}. 정확한 사양, 상태, 포장 및 동봉 서류는 상품과 주문별로 확인됩니다.` },
    fr:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}. La configuration, l'etat, l'emballage et les documents inclus sont confirmes pour chaque article et commande.` },
    de:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}. Konfiguration, Zustand, Verpackung und Unterlagen werden fur jeden Artikel und Auftrag bestatigt.` },
    es:{ name:[brand, model].filter(Boolean).join(' '), description:`${brand}${model ? ` ${model}` : ''}. La configuracion, el estado, el embalaje y los documentos se confirman para cada articulo y pedido.` },
  };
  const generatedValue = generated[lang]?.[field];
  return cleanLocalizedText(source, lang) || generatedValue || fallbacks[lang]?.[field] || fallbacks.en[field];
}

function deriveProductTags(product) {
  const title = `${product.nameZh || ''} ${product.nameEn || ''} ${product.descriptionZh || ''} ${product.descriptionEn || ''}`;
  const modelMatches = [...title.matchAll(new RegExp(modelTagPattern.source, 'gi'))].map(match => match[1]);
  return [...new Set([
    ...(product.tags || []),
    product.brandEn,
    product.brandZh,
    ...modelMatches,
  ].map(tag => String(tag || '').trim()).filter(Boolean))];
}

function isVerifiedStoreProduct(product) {
  if (product.sourceVerified === true) return true;
  if (product.sourceVerified === false) return false;
  return !String(product.id || '').startsWith('watclub-')
    && !prohibitedCatalogueTermsPattern.test([
      product.nameZh,
      product.nameEn,
      product.descriptionZh,
      product.descriptionEn,
      product.brandEn,
      product.brandZh,
      JSON.stringify(product.translations || {}),
      ...(product.tags || []),
    ].join(' '));
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
  const emptyForm = { id:null, nameZh:'', nameEn:'', descriptionZh:'', translations:{}, brandEn:brands[0].en, price:'', stock:'1', status:'draft', media:[], tags:[], sourceVerified:false, sourceEvidenceNote:'' };
  const [form, setForm] = useState(emptyForm);
  const [translating, setTranslating] = useState(false);
  const [view, setView] = useState('products');
  const [search, setSearch] = useState('');
  const [productPage, setProductPage] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchTargetStatus, setBatchTargetStatus] = useState('draft');
  const [batchApplySource, setBatchApplySource] = useState(false);
  const [batchSourceVerified, setBatchSourceVerified] = useState(false);
  const [batchSourceEvidenceNote, setBatchSourceEvidenceNote] = useState('');
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
    setSaveError('');
    if (!String(form.nameZh || '').trim() || !String(form.descriptionZh || '').trim()) {
      setSaveError('Please enter the Chinese product name and description before saving.');
      return;
    }
    if (form.status === 'published' && (!form.sourceVerified || !form.sourceEvidenceNote.trim())) {
      setSaveError('发布前必须确认来源已核验，并填写不含敏感信息的供货依据摘要。');
      return;
    }
    const brand = brands.find(item => item.en === form.brandEn);
    const productBase = { ...form, id:form.id || `product-${Date.now()}`, brandZh:brand.zh, price:Number(form.price), stock:Number(form.stock), sourceVerified:Boolean(form.sourceVerified), sourceEvidenceNote:form.sourceEvidenceNote.trim(), updatedAt:new Date().toISOString() };
    const product = { ...productBase, tags:deriveProductTags(productBase) };
    setSaving(true);
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
  const productsPerPage = 50;
  const productPageCount = Math.max(1, Math.ceil(visible.length / productsPerPage));
  const activeProductPage = Math.min(productPage, productPageCount - 1);
  const paginatedVisible = visible.slice(activeProductPage * productsPerPage, (activeProductPage + 1) * productsPerPage);
  const visibleIds = visible.map(product => product.id);
  const pageIds = paginatedVisible.map(product => product.id);
  const selectedVisibleIds = visibleIds.filter(id => selectedProductIds.includes(id));
  const selectedPageIds = pageIds.filter(id => selectedProductIds.includes(id));
  const toggleProductSelection = productId => setSelectedProductIds(ids => ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId]);
  const toggleVisibleSelection = () => setSelectedProductIds(ids => selectedVisibleIds.length === visibleIds.length ? ids.filter(id => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])]);
  const togglePageSelection = () => setSelectedProductIds(ids => selectedPageIds.length === pageIds.length ? ids.filter(id => !pageIds.includes(id)) : [...new Set([...ids, ...pageIds])]);
  const applyBulkChanges = async () => {
    const selected = products.filter(product => selectedProductIds.includes(product.id));
    if (!selected.length || batchSaving) return;
    const evidence = batchSourceEvidenceNote.trim();
    const targets = selected.map(product => ({
      ...product,
      status: batchTargetStatus,
      sourceVerified: batchApplySource ? batchSourceVerified : product.sourceVerified,
      sourceEvidenceNote: batchApplySource ? evidence : product.sourceEvidenceNote,
      updatedAt:new Date().toISOString(),
    }));
    const publishable = targets.filter(product => product.sourceVerified && String(product.sourceEvidenceNote || '').trim());
    if (batchTargetStatus === 'published' && publishable.length !== targets.length) return setBatchStatus('发布前，每件所选商品都必须完成来源核验并填写供货依据。');
    if (batchApplySource && batchSourceVerified && !evidence) return setBatchStatus('请填写供货依据摘要，或不要将来源核验应用到所选商品。');
    const action = batchTargetStatus === 'published' ? '发布' : '设为草稿';
    if (!confirm(`确定更新 ${targets.length} 件所选商品并${action}吗？`)) return;
    setBatchSaving(true);
    setBatchStatus('正在更新所选商品…');
    try {
      const saved = [];
      for (const product of targets) saved.push(await saveAdminProduct(session, product));
      const savedById = new Map(saved.map(product => [product.id, product]));
      setProducts(items => items.map(product => savedById.get(product.id) || product));
      setSelectedProductIds(ids => ids.filter(id => !savedById.has(id)));
      setBatchStatus(`已更新 ${saved.length} 件商品。`);
    } catch (error) {
      setBatchStatus(error.message || '批量更新失败，请稍后重试。');
    } finally {
      setBatchSaving(false);
    }
  };
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
        <div className="admin-toolbar"><input value={search} onChange={event=>{setSearch(event.target.value);setProductPage(0)}} placeholder="搜索商品或品牌"/><span>{products.length} 件商品</span></div>
        <div className="bulk-product-actions">
          <span>{selectedProductIds.length} 件已选</span>
          <button type="button" className="secondary" disabled={!visibleIds.length || batchSaving} onClick={toggleVisibleSelection}>{selectedVisibleIds.length === visibleIds.length ? '取消全选搜索结果' : `全选搜索结果 (${visibleIds.length})`}</button>
          <select value={batchTargetStatus} disabled={!selectedProductIds.length || batchSaving} onChange={event=>setBatchTargetStatus(event.target.value)}><option value="draft">设为草稿</option><option value="published">发布</option></select>
          <label className="batch-source-toggle"><input type="checkbox" checked={batchApplySource} disabled={!selectedProductIds.length || batchSaving} onChange={event=>setBatchApplySource(event.target.checked)}/>更新来源核验</label>
          {batchApplySource && <><label className="batch-source-toggle"><input type="checkbox" checked={batchSourceVerified} disabled={batchSaving} onChange={event=>setBatchSourceVerified(event.target.checked)}/>来源已核验</label><input className="batch-source-note" value={batchSourceEvidenceNote} disabled={batchSaving} onChange={event=>setBatchSourceEvidenceNote(event.target.value)} placeholder="供货依据摘要（应用到所选商品）"/></>}
          <button type="button" className="bulk-save-button" disabled={!selectedProductIds.length || batchSaving} onClick={applyBulkChanges}>{batchSaving ? '正在保存所选商品…' : `保存所选商品${selectedProductIds.length ? ` (${selectedProductIds.length})` : ''}`}</button>
          {batchStatus && <small>{batchStatus}</small>}
        </div>
        <div className="product-table">
          <div className="table-head"><label className="product-select"><input type="checkbox" checked={pageIds.length > 0 && selectedPageIds.length === pageIds.length} onChange={togglePageSelection} aria-label="全选当前页商品"/></label><span>商品</span><span>状态</span><span>库存</span><span>价格</span><span>操作</span></div>
          {visible.length === 0 ? <div className="admin-empty"><ShoppingBag/><h2>尚未添加商品</h2><p>添加您的第一件腕表商品。</p><button onClick={()=>setView('editor')}>添加商品</button></div> : paginatedVisible.map(product => <article key={product.id}>
            <label className="product-select"><input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleProductSelection(product.id)} aria-label={`选择 ${product.nameZh || product.nameEn}`}/></label>
            <div className="admin-product-name">{product.media?.[0]?.url ? <img src={product.media[0].url} alt=""/> : <div/>}<span><strong>{product.nameZh || product.nameEn}</strong><small>{product.brandZh} · {product.nameEn}</small></span></div>
            <span className={`status ${product.status}`}>{product.status === 'published' && product.sourceVerified ? '已发布 · 来源已核验' : '待核验草稿'}</span><span>{product.stock}</span><span>US$ {Number(product.price).toLocaleString()}</span><div className="table-actions"><button onClick={()=>editProduct(product)}>编辑</button><button onClick={()=>removeProduct(product.id)}>删除</button></div>
          </article>)}
        </div>
        {visible.length > productsPerPage && <div className="admin-pagination"><button disabled={activeProductPage === 0} onClick={() => setProductPage(page => Math.max(0, page - 1))}>上一页</button><span>第 {activeProductPage + 1} / {productPageCount} 页 · 每页 50 件</span><button disabled={activeProductPage >= productPageCount - 1} onClick={() => setProductPage(page => Math.min(productPageCount - 1, page + 1))}>下一页</button></div>}
      </> : <form className="product-editor" onSubmit={saveProduct}>
        <header className="admin-title"><div><p>{form.id?'编辑':'新建'}商品</p><h1>{form.id?'编辑商品':'添加商品'}</h1>{saveError && <span className="admin-save-error">{saveError}</span>}</div><div><button type="button" className="secondary" onClick={()=>setView('products')}>取消</button><button type="submit" disabled={saving || uploading}>{saving ? '正在保存…' : '保存商品'}</button></div></header>
        <div className="editor-columns"><div>
          <section><h2>基本资料</h2><label>中文商品名称<input required value={form.nameZh} onChange={event=>update('nameZh',event.target.value)} placeholder="例如：劳力士潜航者型"/></label><label>中文商品简介<textarea required rows="5" value={form.descriptionZh} onChange={event=>update('descriptionZh',event.target.value)} placeholder="填写材质、尺寸、年份、成色及商品特点"/></label><label>品牌<select value={form.brandEn} onChange={event=>update('brandEn',event.target.value)}>{brands.map(brand=><option key={brand.en}>{brand.en}</option>)}</select></label><button type="button" className="translate-button" onClick={autoTranslate} disabled={translating}>{translating?'正在生成六种语言…':'自动翻译为其他六种语言'}</button></section>
          {Object.keys(form.translations || {}).length > 0 && <section><h2>多语言译文</h2><p className="section-help">自动译文可以逐项修改，中文原稿始终保留。</p>{[['en','英语'],['ja','日语'],['ko','韩语'],['fr','法语'],['de','德语'],['es','西班牙语']].map(([code,label])=><div className="translation-block" key={code}><strong>{label}</strong><input value={form.translations[code]?.name||''} onChange={event=>setForm(current=>({...current,translations:{...current.translations,[code]:{...current.translations[code],name:event.target.value}}}))}/><textarea rows="3" value={form.translations[code]?.description||''} onChange={event=>setForm(current=>({...current,translations:{...current.translations,[code]:{...current.translations[code],description:event.target.value}}}))}/></div>)}</section>}
          <section><h2>图片与视频</h2><label className={`media-drop ${uploading ? 'is-uploading' : ''}`}>＋ {uploading ? '正在上传…' : '上传图片或视频'}<input multiple disabled={uploading} type="file" accept="image/*,video/*" onChange={uploadFiles}/><span>支持多选，文件将安全上传到云端</span></label>{uploadStatus && <p className="media-upload-status">{uploadStatus}</p>}<div className="media-grid">{form.media.map((media,index)=><div key={media.id}>{media.type.startsWith('video')?<video src={media.url} controls/>:<img src={media.url} alt=""/>}<button type="button" onClick={()=>setForm(current=>({...current,media:current.media.filter((_,i)=>i!==index)}))}>×</button>{index===0&&<span>封面</span>}</div>)}</div>
          </section>
        </div><div>
          <section><h2>销售资料</h2><label>价格（美元 USD）<input required min="0" step="0.01" type="number" value={form.price} onChange={event=>update('price',event.target.value)}/></label><label>库存数量<input required min="0" type="number" value={form.stock} onChange={event=>update('stock',event.target.value)}/></label><label>商品状态<select value={form.status} onChange={event=>update('status',event.target.value)}><option value="draft">保存为待核验草稿</option><option value="published" disabled={!form.sourceVerified || !form.sourceEvidenceNote.trim()}>发布已核验商品</option></select></label></section>
          <section className="source-verification-panel"><h2>授权经销与采购来源</h2><label className="source-verification-check"><input type="checkbox" checked={Boolean(form.sourceVerified)} onChange={event=>setForm(current=>({ ...current, sourceVerified:event.target.checked, status:event.target.checked ? current.status : 'draft' }))}/><span><strong>此商品的供货依据已逐件核验</strong><small>只在已经核对经销商、采购记录或相应供货文件时勾选；这不等于品牌直接授权 OiWatch。</small></span></label><label>供货依据摘要<textarea rows="4" value={form.sourceEvidenceNote || ''} onChange={event=>update('sourceEvidenceNote',event.target.value)} placeholder="例如：已核对授权经销商采购记录及本批次随货文件。请勿填写密码、密钥、完整证件号或其他敏感信息。"/></label><p className="section-help">只有勾选来源已核验并填写摘要后，才能选择发布。具体品牌保修、盒卡和授权文件仍以单件商品页及实际随货内容为准。</p></section>
          <section className="publish-note"><ShieldCheck/><div><strong>授权经销商品发布门槛</strong><p>未核验商品会保留在云端草稿中，不会出现在公开目录或结算流程。</p></div></section>
        </div></div>
      </form>}
    </main>
  </div>;
}

const microcopy = {
  zh: { language:'语言', cart:'购物车', enquire:'联系 WhatsApp 客服', swipe:'左右滑动浏览', brands:'探索世界名表', byBrand:'按品牌探索', authenticated:'来源与实物核验', expertise:'年专业经验', partners:'全球合作伙伴', add:'加入购物车', empty:'购物车目前为空', continue:'继续浏览', selected:'所选数量', checkout:'提交购买咨询', other:'其他 / 尚未确定', received:'已收到，我们将尽快联系您', consultation:'珍贵腕表价格及库存将由专属顾问确认。', allProducts:'全部商品', maisons:'品牌', story:'我们的故事', paymentGuide:'付款说明', packaging:'包装', bagShort:'购物车', bestsellers:'热销商品', clientStories:'客户评价', privateClient:'私人客户', newItem:'新品', watchBrands:'腕表品牌', shippingPartners:'全球配送伙伴', shippingTagline:'安全包装 · 全程追踪 · 全球送达', worldwideDelivery:'OiWatch 全球送货', cartKicker:'私人选购', remove:'删除', total:'合计', checkoutNow:'继续结算', cartPricing:'商品统一以美元计价；配送、包装及随货文件以单件订单确认为准。', brandBack:'返回品牌总览', brandCatalogue:'品牌腕表目录', brandIntro:'精选在售与全球寻表服务', collectionReference:'品牌系列参考 · 非实时库存', orderReviewed:'订单信息核对', worldwideSourcing:'全球寻表', condition:'商品状态', confirmedBeforePayment:'付款前确认', included:'随附物品', confirmedPerOrder:'以订单确认清单为准', delivery:'交付方式', secureWorldwide:'全球安全配送', catalogueNote:'此处为品牌系列参考，不代表实时在售库存。具体年份、配置、状态、价格、库存、授权或供货依据及随附文件由顾问在付款前按单件商品确认。' },
  en: { language:'Language', cart:'Shopping bag', enquire:'Contact WhatsApp support', swipe:'Swipe to explore', brands:'EXPLORE THE MAISONS', byBrand:'Discover by maison', authenticated:'Source & item checked', expertise:'Years expertise', partners:'Global partners', add:'Add to bag', empty:'Your shopping bag is empty', continue:'Continue browsing', selected:'Selected pieces', checkout:'Request purchase consultation', other:'Other / Not decided', received:'Received — we will be in touch', consultation:'Availability and pricing will be confirmed by your private advisor.', allProducts:'All watches', maisons:'Maisons', story:'Our story', paymentGuide:'Payment guide', packaging:'Packaging', bagShort:'Bag', bestsellers:'BESTSELLERS', clientStories:'CLIENT STORIES', privateClient:'PRIVATE CLIENT', newItem:'NEW', watchBrands:'Watch brands', shippingPartners:'WORLDWIDE DELIVERY PARTNERS', shippingTagline:'Secure packing · End-to-end tracking · Worldwide delivery', worldwideDelivery:'OIWATCH WORLDWIDE DELIVERY', cartKicker:'PRIVATE SELECTION', remove:'Remove', total:'Total', checkoutNow:'Continue to checkout', cartPricing:'Products are priced in USD. Delivery, packaging, and accompanying documents are confirmed per order.', brandBack:'Back to brands', brandCatalogue:'MAISON CATALOGUE', brandIntro:'Curated availability and worldwide sourcing', collectionReference:'Collection reference · not live inventory', orderReviewed:'Order details reviewed', worldwideSourcing:'Worldwide sourcing', condition:'Condition', confirmedBeforePayment:'Confirmed before payment', included:'Included materials', confirmedPerOrder:'Confirmed per order checklist', delivery:'Delivery', secureWorldwide:'Secure worldwide delivery', catalogueNote:'This is a collection reference, not live inventory. Your advisor confirms the exact year, configuration, condition, price, availability, authorisation or supply basis, and included documents for the individual item before payment.' },
  ja: { language:'言語', cart:'ショッピングバッグ', enquire:'WhatsAppサポートへ連絡', swipe:'左右にスワイプ', brands:'世界のメゾン', byBrand:'ブランドから探す', authenticated:'仕入れ先・商品確認', expertise:'年の専門経験', partners:'世界の提携先', add:'バッグに追加', empty:'バッグは空です', continue:'閲覧を続ける', selected:'選択数', checkout:'購入相談を依頼', other:'その他 / 未定', received:'承りました。追ってご連絡します', consultation:'在庫と価格は専任アドバイザーが確認します。', allProducts:'すべての商品', maisons:'ブランド', story:'私たちについて', paymentGuide:'お支払いガイド', packaging:'包装', bagShort:'バッグ', bestsellers:'人気商品', clientStories:'お客様の声', privateClient:'プライベート顧客', newItem:'新着', watchBrands:'腕時計ブランド', shippingPartners:'世界の配送パートナー', shippingTagline:'安全な梱包 · 追跡対応 · 世界配送', worldwideDelivery:'OIWATCH 世界配送', cartKicker:'プライベートセレクション', remove:'削除', total:'合計', checkoutNow:'決済へ進む', cartPricing:'商品は米ドル表示です。配送、包装、同梱書類は注文ごとに確認されます。', brandBack:'ブランド一覧へ戻る', brandCatalogue:'ブランドカタログ', brandIntro:'厳選在庫と世界規模の探索サービス', collectionReference:'コレクション参考 · リアルタイム在庫ではありません', orderReviewed:'注文情報を確認', worldwideSourcing:'世界規模で探索', condition:'商品状態', confirmedBeforePayment:'支払い前に確認', included:'付属品', confirmedPerOrder:'注文確認リストが基準', delivery:'配送', secureWorldwide:'安全な世界配送', catalogueNote:'これはブランドコレクションの参考情報であり、リアルタイム在庫ではありません。年式、仕様、状態、価格、在庫、正規取扱または供給根拠、付属書類は、支払い前に商品ごとに確認します。' },
  ko: { language:'언어', cart:'쇼핑백', enquire:'WhatsApp 고객센터 문의', swipe:'좌우로 밀어 보기', brands:'세계적인 메종', byBrand:'브랜드별 보기', authenticated:'공급처 및 상품 확인', expertise:'년 전문 경력', partners:'글로벌 파트너', add:'쇼핑백에 담기', empty:'쇼핑백이 비어 있습니다', continue:'계속 둘러보기', selected:'선택 수량', checkout:'구매 상담 요청', other:'기타 / 미정', received:'접수되었습니다. 곧 연락드리겠습니다', consultation:'재고와 가격은 전담 어드바이저가 확인합니다.', allProducts:'전체 상품', maisons:'브랜드', story:'브랜드 이야기', paymentGuide:'결제 안내', packaging:'포장', bagShort:'쇼핑백', bestsellers:'인기 상품', clientStories:'고객 후기', privateClient:'개인 고객', newItem:'신상품', watchBrands:'시계 브랜드', shippingPartners:'글로벌 배송 파트너', shippingTagline:'안전 포장 · 전 과정 추적 · 전 세계 배송', worldwideDelivery:'OIWATCH 전 세계 배송', cartKicker:'프라이빗 셀렉션', remove:'삭제', total:'합계', checkoutNow:'결제 계속하기', cartPricing:'상품 가격은 미화 기준입니다. 배송, 포장, 동봉 서류는 주문별로 확인됩니다.', brandBack:'브랜드 목록으로 돌아가기', brandCatalogue:'브랜드 카탈로그', brandIntro:'엄선한 재고 및 전 세계 상품 탐색', collectionReference:'컬렉션 참고 · 실시간 재고 아님', orderReviewed:'주문 정보 확인', worldwideSourcing:'전 세계 상품 탐색', condition:'상품 상태', confirmedBeforePayment:'결제 전 확인', included:'동봉 품목', confirmedPerOrder:'주문 확인 목록 기준', delivery:'배송', secureWorldwide:'안전한 전 세계 배송', catalogueNote:'브랜드 컬렉션 참고 정보이며 실시간 재고가 아닙니다. 정확한 연식, 구성, 상태, 가격, 재고, 공인 판매 또는 공급 근거, 동봉 서류는 결제 전에 상품별로 확인합니다.' },
  fr: { language:'Langue', cart:'Panier', enquire:'Contacter le support WhatsApp', swipe:'Faire défiler latéralement', brands:'MAISONS HORLOGÈRES', byBrand:'Découvrir par maison', authenticated:'Source et article vérifiés', expertise:'Ans d’expertise', partners:'Partenaires mondiaux', add:'Ajouter au panier', empty:'Votre panier est vide', continue:'Continuer', selected:'Pièces choisies', checkout:'Demander une consultation', other:'Autre / Indécis', received:'Demande reçue, nous vous contacterons', consultation:'Disponibilité et prix seront confirmés par votre conseiller.', allProducts:'Toutes les montres', maisons:'Maisons', story:'Notre histoire', paymentGuide:'Guide de paiement', packaging:'Emballage', bagShort:'Panier', bestsellers:'MEILLEURES VENTES', clientStories:'TÉMOIGNAGES CLIENTS', privateClient:'CLIENT PRIVÉ', newItem:'NOUVEAU', watchBrands:'Marques horlogères', shippingPartners:'PARTENAIRES DE LIVRAISON MONDIAUX', shippingTagline:'Emballage sécurisé · Suivi complet · Livraison mondiale', worldwideDelivery:'LIVRAISON MONDIALE OIWATCH', cartKicker:'SÉLECTION PRIVÉE', remove:'Supprimer', total:'Total', checkoutNow:'Continuer vers le paiement', cartPricing:'Les prix sont en USD. Livraison, emballage et documents sont confirmés pour chaque commande.', brandBack:'Retour aux marques', brandCatalogue:'CATALOGUE DE LA MAISON', brandIntro:'Sélection disponible et recherche mondiale', collectionReference:'Référence de collection · stock non actualisé', orderReviewed:'Informations de commande vérifiées', worldwideSourcing:'Recherche mondiale', condition:'État', confirmedBeforePayment:'Confirmé avant paiement', included:'Éléments inclus', confirmedPerOrder:'Selon la liste de commande', delivery:'Livraison', secureWorldwide:'Livraison mondiale sécurisée', catalogueNote:'Cette page présente une référence de collection, et non un stock en temps réel. Année, configuration, état, prix, disponibilité, fondement d’autorisation ou de fourniture et documents sont confirmés pour chaque article avant paiement.' },
  de: { language:'Sprache', cart:'Warenkorb', enquire:'WhatsApp-Support kontaktieren', swipe:'Seitlich wischen', brands:'UHRENMARKEN ENTDECKEN', byBrand:'Nach Marke entdecken', authenticated:'Herkunft und Ware geprüft', expertise:'Jahre Erfahrung', partners:'Globale Partner', add:'In den Warenkorb', empty:'Ihr Warenkorb ist leer', continue:'Weiter entdecken', selected:'Ausgewählte Uhren', checkout:'Kaufberatung anfragen', other:'Andere / Unentschieden', received:'Anfrage erhalten, wir melden uns', consultation:'Verfügbarkeit und Preis bestätigt Ihr persönlicher Berater.', allProducts:'Alle Uhren', maisons:'Marken', story:'Unsere Geschichte', paymentGuide:'Zahlungshinweise', packaging:'Verpackung', bagShort:'Warenkorb', bestsellers:'BESTSELLER', clientStories:'KUNDENSTIMMEN', privateClient:'PRIVATKUNDE', newItem:'NEU', watchBrands:'Uhrenmarken', shippingPartners:'WELTWEITE VERSANDPARTNER', shippingTagline:'Sichere Verpackung · Durchgehendes Tracking · Weltweite Lieferung', worldwideDelivery:'OIWATCH WELTWEITE LIEFERUNG', cartKicker:'PRIVATE AUSWAHL', remove:'Entfernen', total:'Gesamt', checkoutNow:'Weiter zum Checkout', cartPricing:'Die Preise sind in USD angegeben. Lieferung, Verpackung und Begleitunterlagen werden je Bestellung bestätigt.', brandBack:'Zurück zu den Marken', brandCatalogue:'MARKENKATALOG', brandIntro:'Ausgewählte Verfügbarkeit und weltweite Beschaffung', collectionReference:'Kollektionsreferenz · kein Live-Bestand', orderReviewed:'Bestelldaten geprüft', worldwideSourcing:'Weltweite Beschaffung', condition:'Zustand', confirmedBeforePayment:'Vor Zahlung bestätigt', included:'Lieferumfang', confirmedPerOrder:'Gemäß Auftragsliste', delivery:'Lieferung', secureWorldwide:'Sichere weltweite Lieferung', catalogueNote:'Dies ist eine Kollektionsreferenz, kein Live-Bestand. Jahr, Konfiguration, Zustand, Preis, Verfügbarkeit, Autorisierungs- oder Liefergrundlage und Begleitunterlagen werden vor Zahlung je Artikel bestätigt.' },
  es: { language:'Idioma', cart:'Carrito', enquire:'Contactar soporte por WhatsApp', swipe:'Deslizar lateralmente', brands:'MARCAS DE RELOJERÍA', byBrand:'Explorar por marca', authenticated:'Origen y artículo verificados', expertise:'Años de experiencia', partners:'Socios mundiales', add:'Añadir al carrito', empty:'El carrito está vacío', continue:'Seguir explorando', selected:'Piezas seleccionadas', checkout:'Solicitar consulta de compra', other:'Otro / Sin decidir', received:'Solicitud recibida, nos pondremos en contacto', consultation:'Su asesor confirmará disponibilidad y precio.', allProducts:'Todos los relojes', maisons:'Marcas', story:'Nuestra historia', paymentGuide:'Guía de pago', packaging:'Embalaje', bagShort:'Carrito', bestsellers:'MÁS VENDIDOS', clientStories:'HISTORIAS DE CLIENTES', privateClient:'CLIENTE PRIVADO', newItem:'NUEVO', watchBrands:'Marcas de relojería', shippingPartners:'SOCIOS DE ENTREGA MUNDIAL', shippingTagline:'Embalaje seguro · Seguimiento integral · Entrega mundial', worldwideDelivery:'ENTREGA MUNDIAL OIWATCH', cartKicker:'SELECCIÓN PRIVADA', remove:'Eliminar', total:'Total', checkoutNow:'Continuar al pago', cartPricing:'Los precios se muestran en USD. La entrega, el embalaje y los documentos se confirman para cada pedido.', brandBack:'Volver a las marcas', brandCatalogue:'CATÁLOGO DE LA MARCA', brandIntro:'Disponibilidad seleccionada y búsqueda mundial', collectionReference:'Referencia de colección · no es stock en tiempo real', orderReviewed:'Datos del pedido revisados', worldwideSourcing:'Búsqueda mundial', condition:'Estado', confirmedBeforePayment:'Confirmado antes del pago', included:'Elementos incluidos', confirmedPerOrder:'Según la lista del pedido', delivery:'Entrega', secureWorldwide:'Entrega mundial segura', catalogueNote:'Esta es una referencia de colección, no un inventario en tiempo real. El año, configuración, estado, precio, disponibilidad, base de autorización o suministro y documentos se confirman para cada artículo antes del pago.' },
};

const whatsappEnquiryCopy = {
  zh:'您好，我想咨询 OiWatch 经由授权经销及正规可追溯渠道采购的腕表商品与交付服务。',
  en:'Hello, I would like to enquire about OiWatch watches sourced through authorised reseller and documented traceable channels, and about delivery services.',
  ja:'OiWatchが正規取扱・追跡可能な仕入れルートから調達する腕時計と配送サービスについて相談したいです。',
  ko:'OiWatch가 공인 판매 및 추적 가능한 정식 조달 경로를 통해 공급하는 시계 상품과 배송 서비스에 대해 문의하고 싶습니다.',
  fr:'Bonjour, je souhaite me renseigner sur les montres qu’OiWatch se procure auprès de revendeurs autorisés et de circuits réguliers traçables, ainsi que sur le service de livraison.',
  de:'Hallo, ich möchte mich über Uhren informieren, die OiWatch über autorisierte Händler und reguläre, nachvollziehbare Beschaffungskanäle bezieht, sowie über den Lieferservice.',
  es:'Hola, quisiera consultar los relojes que OiWatch obtiene mediante distribuidores autorizados y canales de suministro regulares y trazables, así como el servicio de entrega.',
};

const selectionTierCopy = {
  zh:{ rare:'珍罕配置', signature:'经典精选' },
  en:{ rare:'Rare configuration', signature:'Signature selection' },
  ja:{ rare:'希少仕様', signature:'定番セレクション' },
  ko:{ rare:'희소 구성', signature:'시그니처 셀렉션' },
  fr:{ rare:'Configuration rare', signature:'Sélection signature' },
  de:{ rare:'Seltene Konfiguration', signature:'Signaturauswahl' },
  es:{ rare:'Configuración poco común', signature:'Selección emblemática' },
};

const copy = {
  zh: {
    nav: ['典藏', '品牌', '我们的故事', '联系 WhatsApp 客服'],
    eyebrow: '独立高级腕表典藏',
    hero: <>时间，<br/><em>以非凡之名</em></>,
    intro: '为真正的收藏家，严选经由授权经销及正规可追溯采购渠道取得的机械时计。每一件商品在交付前都会核对来源信息、实物状态与随货内容。',
    explore: '探索典藏', appointment: '预约私人鉴赏',
    featured: '最新上架', sectionTitle: <>新品腕表，<em>抢先鉴赏</em></>,
    sectionText: '浏览最新抵达的珍贵腕表。每一款均经过来源信息与实物状态核验，并提供安全配送与私人选购服务。',
    view: '查看详情', all: '浏览全部典藏',
    storyKicker: 'OiWatch · 授权经销商品 · 可追溯采购',
    storyTitle: <>可靠来源，<br/><em>清晰交付</em></>,
    storyBody: '我们从具备供货依据的授权经销商及正规可追溯采购渠道取得商品，并在交付前核对型号、外观状态、功能与随货内容。授权或保修文件因品牌、型号和批次而异，具体以商品页及实际随货文件为准；除非单件商品页明确说明并提供对应证明，不表示品牌直接授权 OiWatch，也不笼统声称 OiWatch 获得所有品牌授权。',
    learn: '了解我们的故事',
    serviceTitle: '一对一私人鉴赏', serviceText: '告诉我们您所寻找的时计，专属顾问将在 24 小时内与您联系。',
    formName: '您的称呼', formContact: '邮箱或手机', formInterest: '感兴趣的腕表', formMessage: '您的需求或想寻找的型号', submit: '提交私人询价',
    privacy: '您的信息将被严格保密，仅用于本次咨询。',
  },
  en: {
    nav: ['Collection', 'Maisons', 'Our Story', 'WhatsApp Support'],
    eyebrow: 'INDEPENDENT HAUTE HORLOGERIE',
    hero: <>Time,<br/><em>made exceptional</em></>,
    intro: 'Mechanical timepieces selected for collectors through authorised reseller and documented, traceable procurement channels. Source information, item condition and included materials are checked before delivery.',
    explore: 'Explore collection', appointment: 'Private appointment',
    featured: 'NEW ARRIVALS', sectionTitle: <>Newly arrived, <em>ready to discover</em></>,
    sectionText: 'Explore our latest arrivals. Source information and item condition are checked, with secure delivery and private assistance.',
    view: 'Discover', all: 'View complete collection',
    storyKicker: 'OIWATCH · AUTHORISED RESELLER GOODS · TRACEABLE SOURCING',
    storyTitle: <>Reliable sourcing,<br/><em>clear delivery</em></>,
    storyBody: 'We source through authorised resellers and documented, traceable procurement channels with a basis to supply the goods, then check the model, condition, functions and included materials before delivery. Authorisation and warranty documents vary by brand, model and batch and are limited to what the product page and parcel specifically include. Unless expressly stated for an individual item and supported by corresponding evidence, this does not mean a brand directly authorises OiWatch, and OiWatch does not claim blanket authorisation from every brand.',
    learn: 'Our story',
    serviceTitle: 'A private consultation', serviceText: 'Tell us what you seek. Your dedicated advisor will respond within 24 hours.',
    formName: 'Your name', formContact: 'Email or phone', formInterest: 'Timepiece of interest', formMessage: 'What are you looking for?', submit: 'Send private enquiry',
    privacy: 'Your information remains strictly confidential.',
  },
  ja: {
    nav: ['コレクション', 'ブランド', '私たちの物語', 'WhatsAppサポート'],
    eyebrow: '独立系高級時計コレクション',
    hero: <>時を、<br/><em>特別な存在へ</em></>,
    intro: '正規取扱販売店および正規で追跡可能な仕入れルートから、コレクターのために機械式時計を厳選。お届け前に仕入れ情報、商品の状態、付属内容を確認します。',
    explore: 'コレクションを見る', appointment: '個別鑑賞を予約',
    featured: '新着商品', sectionTitle: <>新しい時計を、<em>いち早く</em></>,
    sectionText: '新着時計をご覧ください。仕入れ情報と商品の状態を確認し、安全な配送と個別サポートを提供します。',
    view: '詳細を見る', all: 'すべてのコレクション',
    storyKicker: 'OiWatch · 正規取扱商品 · 追跡可能な仕入れ',
    storyTitle: <>信頼できる仕入れ、<br/><em>明確な納品</em></>,
    storyBody: '供給根拠のある正規取扱販売店および追跡可能な仕入れルートから商品を調達し、お届け前にモデル、状態、機能、付属内容を確認します。認定書や保証書の有無はブランド、モデル、入荷ロットによって異なり、商品ページと実際の同梱物が基準です。個別商品について根拠を添えて明記しない限り、各ブランドがOiWatchを直接認定していることを意味せず、すべてのブランドから一括認定を受けているとは表示しません。',
    learn: '私たちの物語', serviceTitle: '個別コンサルテーション', serviceText: 'お探しの時計をお知らせください。専任アドバイザーが24時間以内にご連絡します。',
    formName: 'お名前', formContact: 'メールまたは電話番号', formInterest: 'ご興味のある時計', formMessage: 'ご希望のモデルや条件', submit: 'お問い合わせを送信', privacy: 'お客様の情報は厳重に管理されます。',
  },
  ko: {
    nav: ['컬렉션', '브랜드', '우리의 이야기', 'WhatsApp 고객센터'],
    eyebrow: '독립 하이엔드 시계 컬렉션',
    hero: <>시간을,<br/><em>특별함으로</em></>,
    intro: '공인 판매처와 정식·추적 가능한 조달 경로를 통해 컬렉터를 위한 기계식 시계를 엄선합니다. 배송 전 공급 정보, 상품 상태와 구성품을 확인합니다.',
    explore: '컬렉션 보기', appointment: '프라이빗 감상 예약',
    featured: '신상품', sectionTitle: <>새롭게 입고된, <em>특별한 시계</em></>,
    sectionText: '새로 입고된 시계를 만나보세요. 공급 정보와 상품 상태를 확인하며 안전 배송과 개별 상담을 제공합니다.',
    view: '상세 보기', all: '전체 컬렉션',
    storyKicker: 'OiWatch · 공인 판매 채널 상품 · 추적 가능한 조달',
    storyTitle: <>신뢰할 수 있는 공급,<br/><em>명확한 인도</em></>,
    storyBody: '공급 근거가 있는 공인 판매처와 정식·추적 가능한 조달 경로를 통해 상품을 조달하고 배송 전 모델, 상태, 기능 및 구성품을 확인합니다. 인증서와 보증 문서는 브랜드, 모델 및 입고분에 따라 다르며 상품 페이지와 실제 동봉물이 기준입니다. 개별 상품에 대해 근거와 함께 명시하지 않는 한 브랜드가 OiWatch를 직접 공인했다는 의미가 아니며, OiWatch는 모든 브랜드의 포괄적 공인을 받았다고 주장하지 않습니다.',
    learn: '우리의 이야기', serviceTitle: '일대일 프라이빗 상담', serviceText: '찾으시는 시계를 알려주시면 전담 어드바이저가 24시간 이내에 연락드립니다.',
    formName: '성함', formContact: '이메일 또는 전화번호', formInterest: '관심 시계', formMessage: '찾으시는 모델이나 조건', submit: '상담 요청 보내기', privacy: '고객 정보는 철저히 보호됩니다.',
  },
  fr: {
    nav: ['Collection', 'Maisons', 'Notre histoire', 'Support WhatsApp'],
    eyebrow: 'SÉLECTION INDÉPENDANTE DE HAUTE HORLOGERIE',
    hero: <>Le temps,<br/><em>rendu exceptionnel</em></>,
    intro: 'Des montres mécaniques sélectionnées pour les collectionneurs auprès de revendeurs autorisés et de circuits d’approvisionnement réguliers, documentés et traçables. La provenance, l’état et les éléments inclus sont contrôlés avant livraison.',
    explore: 'Découvrir la collection', appointment: 'Rendez-vous privé',
    featured: 'NOUVEAUTÉS', sectionTitle: <>Nouvelles arrivées, <em>à découvrir</em></>,
    sectionText: 'Découvrez nos dernières pièces. Leur provenance et leur état sont vérifiés, avec livraison sécurisée et accompagnement privé.',
    view: 'Découvrir', all: 'Voir toute la collection',
    storyKicker: 'OiWatch · ARTICLES DE REVENDEURS AUTORISÉS · APPROVISIONNEMENT TRAÇABLE',
    storyTitle: <>Une provenance fiable,<br/><em>une livraison claire</em></>,
    storyBody: 'Nous nous approvisionnons auprès de revendeurs autorisés et de circuits réguliers, documentés et traçables disposant d’un fondement pour fournir les articles, puis contrôlons le modèle, l’état, les fonctions et les éléments inclus. Les documents d’autorisation ou de garantie varient selon la marque, le modèle et le lot et se limitent à ce qui est indiqué sur la fiche produit et réellement fourni. Sauf mention explicite pour un article précis, étayée par une preuve correspondante, cela ne signifie pas qu’une marque autorise directement OiWatch, qui ne revendique aucune autorisation générale de toutes les marques.',
    learn: 'Notre histoire', serviceTitle: 'Une consultation privée', serviceText: 'Confiez-nous votre recherche. Votre conseiller dédié vous répondra sous 24 heures.',
    formName: 'Votre nom', formContact: 'E-mail ou téléphone', formInterest: 'Pièce recherchée', formMessage: 'Votre modèle ou vos critères', submit: 'Envoyer la demande', privacy: 'Vos informations restent strictement confidentielles.',
  },
  de: {
    nav: ['Kollektion', 'Marken', 'Unsere Geschichte', 'WhatsApp-Support'],
    eyebrow: 'UNABHÄNGIGE AUSWAHL HOHER UHRMACHERKUNST',
    hero: <>Zeit,<br/><em>außergewöhnlich gemacht</em></>,
    intro: 'Mechanische Uhren für Sammler, ausgewählt über autorisierte Händler sowie reguläre, dokumentierte und nachvollziehbare Beschaffungskanäle. Herkunftsangaben, Warenzustand und Lieferumfang werden vor der Übergabe geprüft.',
    explore: 'Kollektion entdecken', appointment: 'Privattermin vereinbaren',
    featured: 'NEU EINGETROFFEN', sectionTitle: <>Neu eingetroffen, <em>jetzt entdecken</em></>,
    sectionText: 'Entdecken Sie unsere neuesten Uhren. Herkunftsangaben und Warenzustand werden geprüft; sichere Lieferung und persönliche Betreuung sind inklusive.',
    view: 'Details ansehen', all: 'Gesamte Kollektion',
    storyKicker: 'OiWatch · AUTORISIERTE HÄNDLERWARE · NACHVOLLZIEHBARE BESCHAFFUNG',
    storyTitle: <>Verlässliche Herkunft,<br/><em>klare Übergabe</em></>,
    storyBody: 'Wir beziehen Waren über autorisierte Händler sowie reguläre, dokumentierte und nachvollziehbare Beschaffungskanäle mit einer Liefergrundlage und prüfen vor der Übergabe Modell, Zustand, Funktionen und Lieferumfang. Autorisierungs- und Garantiedokumente unterscheiden sich je nach Marke, Modell und Charge; maßgeblich sind die Produktseite und die tatsächlich beiliegenden Unterlagen. Sofern dies nicht für einen einzelnen Artikel ausdrücklich mit entsprechendem Nachweis angegeben ist, bedeutet es keine direkte Autorisierung von OiWatch durch die jeweilige Marke; OiWatch beansprucht keine pauschale Autorisierung durch alle Marken.',
    learn: 'Unsere Geschichte', serviceTitle: 'Persönliche Beratung', serviceText: 'Teilen Sie uns Ihre Wünsche mit. Ihr persönlicher Berater antwortet innerhalb von 24 Stunden.',
    formName: 'Ihr Name', formContact: 'E-Mail oder Telefon', formInterest: 'Gewünschte Uhr', formMessage: 'Modell oder Anforderungen', submit: 'Anfrage senden', privacy: 'Ihre Angaben werden streng vertraulich behandelt.',
  },
  es: {
    nav: ['Colección', 'Marcas', 'Nuestra historia', 'Soporte WhatsApp'],
    eyebrow: 'SELECCIÓN INDEPENDIENTE DE ALTA RELOJERÍA',
    hero: <>El tiempo,<br/><em>hecho excepcional</em></>,
    intro: 'Relojes mecánicos seleccionados para coleccionistas mediante distribuidores autorizados y canales de suministro regulares, documentados y trazables. Antes de la entrega comprobamos la procedencia, el estado y los elementos incluidos.',
    explore: 'Explorar la colección', appointment: 'Cita privada',
    featured: 'NOVEDADES', sectionTitle: <>Recién llegados, <em>listos para descubrir</em></>,
    sectionText: 'Descubra nuestras últimas piezas. Verificamos la procedencia y el estado del artículo, con entrega segura y atención privada.',
    view: 'Ver detalles', all: 'Ver toda la colección',
    storyKicker: 'OiWatch · ARTÍCULOS DE DISTRIBUIDORES AUTORIZADOS · SUMINISTRO TRAZABLE',
    storyTitle: <>Procedencia fiable,<br/><em>entrega clara</em></>,
    storyBody: 'Nos abastecemos mediante distribuidores autorizados y canales regulares, documentados y trazables con base para suministrar los artículos, y antes de la entrega comprobamos el modelo, el estado, las funciones y los elementos incluidos. Los documentos de autorización o garantía varían según la marca, el modelo y el lote y se limitan a lo indicado en la ficha del producto y a lo realmente incluido. Salvo indicación expresa para un artículo concreto respaldada por la prueba correspondiente, esto no significa que una marca autorice directamente a OiWatch, que no afirma contar con una autorización general de todas las marcas.',
    learn: 'Nuestra historia', serviceTitle: 'Consulta privada', serviceText: 'Cuéntenos qué busca. Su asesor personal responderá en un plazo de 24 horas.',
    formName: 'Su nombre', formContact: 'Correo o teléfono', formInterest: 'Reloj de interés', formMessage: 'Modelo o requisitos', submit: 'Enviar consulta', privacy: 'Sus datos se mantendrán estrictamente confidenciales.',
  }
};

const qualityCopy = {
  zh:{nav:'品质与来源',back:'返回首页',kicker:'OIWATCH 交付标准',title:'我们如何核验商品来源与交付内容',intro:'商品通过具有供货依据的授权经销商及正规可追溯采购渠道取得。每件商品均按实际信息检查，不用笼统宣传代替具体证明。',super:'采购与来源核验',aaa:'实物与文件核验',best:'授权经销与可追溯采购',cheap:'交付信息透明',superPoints:['记录供应渠道、经销商和采购批次等可用来源信息','核对品牌、系列、型号及订单所列配置','根据商品情况核对经销商票据、保修资料或其他随货文件','发现来源或商品信息无法对应时，在交付前暂停处理'],aaaPoints:['交付前检查外观状态、基础功能及订单配置','清点包装、卡片、说明书和配件，并按实际内容交付','商品页未明确列出的文件、品牌保修或配件不作默认承诺','客户可在付款前向顾问确认该件商品的具体随货内容'],note:'“授权经销与可追溯采购”是指供应渠道或经销商具备相应供货依据，不等于品牌直接授权 OiWatch，也不表示 OiWatch 获得所有品牌的笼统授权。只有单件商品页明确注明且具备对应证明时，才表示该件商品附有特定授权或保修文件。'},
  en:{nav:'Quality & Source',back:'Back to home',kicker:'THE OIWATCH DELIVERY STANDARD',title:'How we check source and delivery contents',intro:'Products are sourced through authorised resellers and documented, traceable procurement channels with a basis to supply the goods. Each item is checked against specific information rather than relying on broad marketing claims.',super:'Sourcing and provenance checks',aaa:'Item and document checks',best:'Authorised reseller & traceable sourcing',cheap:'Transparent delivery',superPoints:['Record available source details such as supply channel, dealer and procurement batch','Match the brand, collection, model and listed configuration to the order','Check dealer receipts, warranty materials or other accompanying documents where applicable','Pause fulfilment before delivery if source or item information cannot be reconciled'],aaaPoints:['Inspect condition, basic functions and order configuration before delivery','Inventory packaging, cards, manuals and accessories and deliver only what is actually included','Do not imply documents, brand warranty or accessories that are not expressly listed','Allow customers to confirm the exact included materials with an advisor before payment'],note:'“Authorised reseller and traceable sourcing” means the supply channel or dealer has an applicable basis to supply the goods. It does not mean a brand directly authorises OiWatch, and OiWatch does not claim blanket authorisation from every brand. A specific authorisation or warranty document is included only when the individual product page expressly says so and corresponding evidence is available.'},
  ja:{nav:'品質と仕入れ',back:'ホームへ戻る',kicker:'OIWATCH 納品基準',title:'仕入れ先と納品内容の確認方法',intro:'商品は、供給根拠のある正規取扱販売店および正規で追跡可能な仕入れルートから調達します。包括的な宣伝表現ではなく、各商品を具体的な情報に基づいて確認します。',super:'仕入れ先・流通経路の確認',aaa:'商品・書類の確認',best:'正規取扱・追跡可能な仕入れ',cheap:'透明な納品情報',superPoints:['仕入れルート、販売店、入荷ロットなど確認可能な情報を記録','ブランド、コレクション、モデル、注文内容を照合','該当する場合は販売店の書類、保証資料、その他の付属書類を確認','仕入れ情報と商品情報が一致しない場合は納品前に処理を保留'],aaaPoints:['納品前に外観状態、基本機能、注文内容を確認','箱、カード、説明書、付属品を実物に基づいて確認','商品ページに明記のない書類、ブランド保証、付属品は約束しない','支払い前に専任担当者へ具体的な付属内容を確認可能'],note:'「正規取扱・追跡可能な仕入れ」は、仕入れ先または販売店に該当商品の供給根拠があることを示し、ブランドがOiWatchを直接認定していることや、すべてのブランドから一括認定を受けていることを意味しません。特定の認定書や保証書は、個別の商品ページに明記され対応する証拠がある場合に限り付属します。'},
  ko:{nav:'품질 및 공급',back:'홈으로',kicker:'OIWATCH 인도 기준',title:'공급 경로와 인도 구성 확인 방법',intro:'상품은 공급 근거가 있는 공인 판매처와 정식·추적 가능한 조달 경로를 통해 조달합니다. 포괄적인 광고 문구가 아니라 각 상품의 구체적인 정보를 기준으로 확인합니다.',super:'공급처 및 출처 확인',aaa:'상품 및 문서 확인',best:'공인 판매 및 추적 가능한 조달',cheap:'투명한 인도 정보',superPoints:['공급 경로, 딜러, 조달 배치 등 확인 가능한 출처 정보 기록','브랜드, 컬렉션, 모델 및 주문에 기재된 사양 대조','해당되는 경우 딜러 서류, 보증 자료 또는 기타 동봉 문서 확인','출처와 상품 정보가 일치하지 않으면 배송 전에 처리 보류'],aaaPoints:['배송 전 외관 상태, 기본 기능과 주문 사양 확인','포장, 카드, 설명서 및 액세서리를 실제 구성 기준으로 점검','상품 페이지에 명시하지 않은 문서, 브랜드 보증 또는 구성품은 약속하지 않음','결제 전 담당자에게 해당 상품의 정확한 구성품 확인 가능'],note:'“공인 판매 및 추적 가능한 조달”은 공급 채널이나 판매처에 해당 상품을 공급할 근거가 있다는 뜻이며, 브랜드가 OiWatch를 직접 공인했거나 모든 브랜드가 OiWatch를 포괄적으로 공인했다는 의미가 아닙니다. 특정 인증서나 보증 문서는 개별 상품 페이지에 명시되고 해당 근거가 있는 경우에만 포함됩니다.'},
  fr:{nav:'Qualité et provenance',back:'Retour',kicker:'LA NORME DE LIVRAISON OIWATCH',title:'Comment nous vérifions la provenance et le contenu livré',intro:'Les produits proviennent de revendeurs autorisés et de circuits d’approvisionnement réguliers, documentés et traçables disposant d’un fondement pour les fournir. Chaque article est contrôlé selon des informations précises, sans remplacer les preuves par des affirmations générales.',super:'Contrôle de l’approvisionnement',aaa:'Contrôle de l’article et des documents',best:'Revendeurs autorisés et approvisionnement traçable',cheap:'Livraison transparente',superPoints:['Consigner les informations disponibles sur le circuit, le revendeur et le lot','Faire correspondre la marque, la collection, le modèle et la configuration de la commande','Vérifier, le cas échéant, les justificatifs du revendeur, documents de garantie ou autres pièces jointes','Suspendre la livraison si la provenance et les informations de l’article ne concordent pas'],aaaPoints:['Contrôler l’état, les fonctions de base et la configuration avant livraison','Inventorier l’écrin, les cartes, les notices et les accessoires réellement inclus','Ne pas promettre de document, garantie de marque ou accessoire non expressément indiqué','Permettre au client de confirmer le contenu exact avec un conseiller avant paiement'],note:'« Revendeurs autorisés et approvisionnement traçable » signifie que le circuit ou le revendeur dispose d’un fondement pour fournir les produits. Cela ne signifie pas qu’une marque autorise directement OiWatch, qui ne revendique aucune autorisation générale de toutes les marques. Un document d’autorisation ou de garantie précis n’est inclus que si la fiche de l’article l’indique expressément et qu’un justificatif correspondant est disponible.'},
  de:{nav:'Qualität und Herkunft',back:'Zurück',kicker:'DER OIWATCH-LIEFERSTANDARD',title:'So prüfen wir Herkunft und Lieferumfang',intro:'Die Waren stammen von autorisierten Händlern und aus regulären, dokumentierten und nachvollziehbaren Beschaffungskanälen mit einer Liefergrundlage. Jeder Artikel wird anhand konkreter Angaben geprüft; allgemeine Werbeaussagen ersetzen keine Nachweise.',super:'Beschaffungs- und Herkunftsprüfung',aaa:'Waren- und Dokumentenprüfung',best:'Autorisierte Händler & nachvollziehbare Beschaffung',cheap:'Transparente Lieferung',superPoints:['Verfügbare Angaben zu Lieferkanal, Händler und Beschaffungscharge dokumentieren','Marke, Kollektion, Modell und bestellte Konfiguration abgleichen','Falls zutreffend Händlerbelege, Garantieunterlagen oder weitere Begleitdokumente prüfen','Die Lieferung aussetzen, wenn Herkunft und Warenangaben nicht zusammenpassen'],aaaPoints:['Zustand, Grundfunktionen und Bestellkonfiguration vor Übergabe prüfen','Verpackung, Karten, Anleitungen und Zubehör nach tatsächlichem Umfang erfassen','Nicht ausdrücklich aufgeführte Dokumente, Markengarantie oder Zubehör nicht versprechen','Den genauen Lieferumfang vor Zahlung durch einen Berater bestätigen lassen'],note:'„Autorisierte Händler und nachvollziehbare Beschaffung“ bedeutet, dass der Lieferkanal oder Händler eine Grundlage zur Lieferung der Waren hat. Dies bedeutet keine direkte Autorisierung von OiWatch durch eine Marke; OiWatch beansprucht keine pauschale Autorisierung durch alle Marken. Bestimmte Autorisierungs- oder Garantieunterlagen sind nur enthalten, wenn die einzelne Produktseite dies ausdrücklich nennt und ein entsprechender Nachweis vorliegt.'},
  es:{nav:'Calidad y procedencia',back:'Volver',kicker:'EL ESTÁNDAR DE ENTREGA OIWATCH',title:'Cómo verificamos la procedencia y el contenido de entrega',intro:'Los productos se obtienen mediante distribuidores autorizados y canales de suministro regulares, documentados y trazables con base para suministrarlos. Cada artículo se comprueba con información concreta, sin sustituir las pruebas por afirmaciones generales.',super:'Control de suministro y procedencia',aaa:'Control del artículo y documentos',best:'Distribuidores autorizados y suministro trazable',cheap:'Entrega transparente',superPoints:['Registrar la información disponible del canal, distribuidor y lote de compra','Cotejar la marca, colección, modelo y configuración indicada en el pedido','Cuando corresponda, comprobar justificantes del distribuidor, garantía u otros documentos','Detener la entrega si la procedencia y los datos del artículo no coinciden'],aaaPoints:['Revisar el estado, las funciones básicas y la configuración antes de la entrega','Inventariar embalaje, tarjetas, manuales y accesorios realmente incluidos','No prometer documentos, garantía de marca o accesorios que no estén expresamente indicados','Permitir que el cliente confirme el contenido exacto con un asesor antes de pagar'],note:'“Distribuidores autorizados y suministro trazable” significa que el canal o distribuidor tiene una base aplicable para suministrar los productos. No significa que una marca autorice directamente a OiWatch, que no afirma contar con una autorización general de todas las marcas. Un documento específico de autorización o garantía solo se incluye cuando la ficha del artículo lo indica expresamente y existe la prueba correspondiente.'}
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
    displayName:localizedProductValue(product, lang, 'name'),
    displayBrand:cleanLocalizedText(lang === 'zh' ? product.brandZh : product.brandEn, lang) || 'OiWatch',
    description:localizedProductValue(product, lang, 'description'),
    mediaUrls:product.media?.map(media => {
      const type = media.contentType || media.type || (/\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(media.url || '') ? 'video' : 'image');
      return { url:media.url, type };
    }) || [],
    cartItem:{ ...product, image:product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', customManaged:true },
  };
}

const descriptionSections = [
  ['size', 'Size', /尺寸/i],
  ['movement', 'Movement', /機芯|机芯/i],
  ['functions', 'Functions', /功能/i],
  ['case', 'Case', /表\s*殼|錶殼|表壳/i],
  ['dial', 'Dial', /錶盤|表盘/i],
  ['crystal', 'Crystal', /表鏡|表镜/i],
  ['bezel', 'Bezel', /表圈/i],
  ['strap', 'Strap', /表帶|表带/i],
  ['clasp', 'Clasp', /錶扣|表扣/i],
  ['waterResistance', 'Water Resistance', /防水/i],
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

function descriptionList(value, lang = 'en', labels = {}) {
  const source = cleanLocalizedText(cleanDescriptionText(value), lang);
  const sections = descriptionSections.map(([id, sourceLabel, chineseMarker]) => {
    const startMatch = new RegExp(`\\b${sourceLabel.replace(' ', '\\s+')}\\b`, 'i').exec(source);
    if (!startMatch) return null;
    const valueStart = startMatch.index + startMatch[0].length;
    const tail = source.slice(valueStart);
    const markerMatch = chineseMarker.exec(tail);
    const nextLabel = descriptionSections
      .map(([, next]) => new RegExp(`\\b${next.replace(' ', '\\s+')}\\b`, 'i').exec(tail)?.index)
      .filter(index => Number.isFinite(index) && index > 0)
      .sort((a, b) => a - b)[0];
    const end = markerMatch ? markerMatch.index : (Number.isFinite(nextLabel) ? nextLabel : tail.length);
    const detail = tail.slice(0, end).replace(/\s+/g, ' ').trim();
    return detail ? { label:labels.detailLabels?.[id] || sourceLabel, detail, order:startMatch.index } : null;
  }).filter(Boolean).sort((a, b) => a.order - b.order);

  if (sections.length) return sections;
  return source ? [{ label:labels.fallbackSection || (lang === 'zh' ? '商品详情' : 'Details'), detail:source, order:0 }] : [];
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
  const labels = getCommerceCopy(lang).shopPage;

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

  const goToPageNumber = async targetPage => {
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const requested = Math.min(lastPage, Math.max(1, Number.parseInt(targetPage, 10) || 1));
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

  const goToPage = () => goToPageNumber(pageInput);
  const goRelativePage = delta => goToPageNumber(page + 1 + delta);

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
      <div className="shop-result-count">{formatCopy(labels.resultCount || `{count} ${labels.pieces}`, { count:total })}</div>
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
              <p>{product.description || labels.fallbackDescription}</p>
            </button>
            <div className="shop-card-bottom">
              <strong>{money(product.price)}</strong>
              <button onClick={() => onAdd(product.cartItem)} aria-label={labels.add}><ShoppingBag size={17}/></button>
            </div>
          </article>;
        })}
      </div>
      {!loading && displayed.length === 0 && <div className="shop-empty"><Search size={25}/><h2>{labels.empty}</h2><p>{labels.emptyHint}</p><button onClick={() => { setQuery(''); setBrand('all'); }}>{labels.clearFilters}</button></div>}
      {(catalog.length < total || page > 0 || loading) && <div className="shop-pagination">
        <button onClick={() => goRelativePage(-1)} disabled={loading || page === 0}>{labels.previous}</button>
        <span>{page + 1} / {Math.max(1, Math.ceil(total / pageSize))}</span>
        <label>{labels.page}<input type="number" min="1" max={Math.max(1, Math.ceil(total / pageSize))} value={pageInput} onChange={event => setPageInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') goToPage(); }}/></label>
        <button onClick={goToPage} disabled={loading}>{labels.go}</button>
        <button onClick={() => goRelativePage(1)} disabled={loading || page >= Math.max(0, Math.ceil(total / pageSize) - 1)}>{labels.next}</button>
        {catalog.length < total && <button className="shop-pagination-more" onClick={loadMore} disabled={loading}>{loading ? labels.loading : labels.loadMore}</button>}
      </div>}
    </main>
  </div>;
}

function ShopProductPage({ product, products, lang, money, cartCount, cartPulse, onBack, onCart, onAdd, onCheckout, onProduct }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const pageRef = useRef(null);
  const railRef = useRef(null);
  const media = product.mediaUrls?.length ? product.mediaUrls : [{ url:'/images/watch-aurelia-web.jpg', type:'image/jpeg' }];
  const labels = getCommerceCopy(lang).shopProduct;
  const descriptionItems = useMemo(() => descriptionList(product.description, lang, labels), [product.description, lang, labels]);
  const [videoErrors, setVideoErrors] = useState({});
  useEffect(() => {
    setMediaIndex(0);
    setLightboxIndex(null);
    setLightboxScale(1);
    setVideoErrors({});
    window.requestAnimationFrame(() => {
      pageRef.current?.scrollTo({ top:0, behavior:'auto' });
      window.scrollTo({ top:0, behavior:'auto' });
    });
  }, [product.id]);
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [lightboxIndex]);
  const goToMedia = index => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left:index * rail.clientWidth, behavior:'smooth' });
    setMediaIndex(index);
  };
  const openImage = index => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
      setLightboxScale(1);
      setLightboxIndex(index);
    }
  };
  const openImageDesktop = index => {
    if (typeof window === 'undefined' || !window.matchMedia?.('(pointer: coarse)').matches) {
      setLightboxScale(1);
      setLightboxIndex(index);
    }
  };
  const recommendations = useMemo(() => {
    const candidates = products.filter(item => item.id !== product.id);
    const seed = [...String(product.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return candidates
      .map((item, index) => ({ item, score:(seed * (index + 17) * 9301 + index * 49297) % 233280 }))
      .sort((a,b) => a.score - b.score)
      .slice(0, 3)
      .map(entry => entry.item);
  }, [product.id, products]);

  const activeLightboxItem = lightboxIndex === null ? null : media[lightboxIndex];

  return <div className="shop-product-page" ref={pageRef}>
    <header className="shop-header">
      <button onClick={onBack}><ArrowLeft size={18}/><span>{labels.back}</span></button>
      <SiteLogo/>
      <button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={onCart}><ShoppingBag size={19}/><span>{cartCount}</span></button>
    </header>
    <main className="shop-product-layout">
      <section className="product-media-stage">
        <div className="product-media-rail" ref={railRef} onScroll={event => setMediaIndex(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}>
          {media.map((item, index) => item.type?.includes('embed')
            ? <iframe key={index} src={item.url} title={`${product.displayName} video ${index + 1}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy"/>
            : item.type?.startsWith('video')
              ? <div className="product-video-frame" key={index}><video src={item.url} controls playsInline preload="metadata" onError={() => setVideoErrors(errors => ({ ...errors, [index]:true }))}/>{videoErrors[index] && <div className="product-video-fallback"><Play size={24}/><strong>{labels.videoUnavailable}</strong></div>}</div>
              : <img key={index} src={optimizedImage(item.url, 1400, 80)} alt={`${product.displayName} ${index + 1}`} loading={index ? 'lazy' : 'eager'} decoding="async" onClick={() => openImage(index)} onDoubleClick={() => openImageDesktop(index)}/>)}
        </div>
        <div className="product-media-meta"><span>{mediaIndex + 1} / {media.length}</span><small>{labels.swipe}</small></div>
        <div className="product-thumbnails">{media.map((item, index) => <button className={mediaIndex === index ? 'active' : ''} onClick={() => goToMedia(index)} key={index}>{item.type?.includes('embed') ? <><span className="embed-thumb"/><Play size={14}/></> : item.type?.startsWith('video') ? <><span className="video-thumb"/><Play size={14}/></> : <img src={optimizedImage(item.url, 160, 65)} loading="lazy" decoding="async" alt=""/>}</button>)}</div>
      </section>
      <section className="product-purchase">
        <p className="product-brand">{product.displayBrand}</p>
        <h1>{product.displayName}</h1>
        <strong className="product-price">{money(product.price)}</strong>
        <div className="product-service-tags"><span><ShieldCheck size={16}/>{labels.qualityChecked}</span><span>{labels.worldwideDelivery}</span></div>
        <div className="product-facts">
          <div><span>{labels.condition}</span><strong>{labels.conditionValue}</strong></div>
          <div><span>{labels.delivery}</span><strong>{labels.deliveryValue}</strong></div>
          <div><span>{labels.stock}</span><strong>{product.stock > 0 ? labels.inStock : labels.enquire}</strong></div>
          <div><span>{labels.documents}</span><strong>{labels.documentsValue}</strong></div>
        </div>
        <div className="product-description">
          <h2>{labels.note}</h2>
          <ul>
            {(descriptionItems.length ? descriptionItems : [{ label:labels.fallbackSection, detail:labels.fallbackDescription, order:0 }]).map(item => (
              <li key={`${item.label}-${item.order}`}><strong>{item.label}</strong><span>{item.detail}</span></li>
            ))}
          </ul>
        </div>
        <button className="product-add-button" onClick={() => onAdd(product.cartItem)}><ShoppingBag size={18}/>{labels.add}<strong>{money(product.price)}</strong></button>
        <button className="product-buy-button" onClick={() => onCheckout(product.cartItem)}><CreditCard size={18}/>{labels.buy}<ArrowRight size={17}/></button>
      </section>
      <aside className="product-recommendations">
        <p>{labels.recommendationsEyebrow}</p>
        <h2>{labels.recommendationsTitle}</h2>
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
      {activeLightboxItem && !activeLightboxItem.type?.startsWith('video') && !activeLightboxItem.type?.includes('embed') && <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={labels.closeZoom}>
        <button className="product-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label={labels.closeZoom}><X size={20}/></button>
        <div className="product-lightbox-tools">
          <button onClick={() => setLightboxScale(scale => Math.max(1, scale - .25))} aria-label={labels.zoomOut}><ZoomOut size={18}/></button>
          <button onClick={() => setLightboxScale(scale => Math.min(3, scale + .25))} aria-label={labels.zoomIn}><ZoomIn size={18}/></button>
        </div>
        <div className="product-lightbox-stage" onClick={() => setLightboxIndex(null)}>
          <img src={optimizedImage(activeLightboxItem.url, 1800, 88)} alt={`${product.displayName} ${lightboxIndex + 1}`} style={{ transform:`scale(${lightboxScale})` }} onClick={event => { event.stopPropagation(); if (lightboxScale === 1) setLightboxIndex(null); }}/>
        </div>
      </div>}
    </main>
  </div>;
}

function PaymentGuide({ lang, activeTab, setActiveTab, onClose }) {
  const guideLocale = getCommerceCopy(lang).paymentGuide;
  const [paymentReference, setPaymentReference] = useState('');
  const [referenceCopied, setReferenceCopied] = useState(false);
  const openPaymentTracker = () => {
    const trackerWindow = window.open(guideLocale.tracker.officialUrl, '_blank', 'noopener,noreferrer');
    trackerWindow?.focus?.();
  };
  const copyPaymentReference = async () => {
    if (!paymentReference.trim()) return;
    try { await navigator.clipboard?.writeText(paymentReference.trim()); setReferenceCopied(true); window.setTimeout(() => setReferenceCopied(false), 1600); } catch { setReferenceCopied(false); }
  };
  const guide = guideLocale.sections[activeTab];
  const tabs = Object.entries(guideLocale.tabs);
  return <div className="payment-guide-page">
    <header className="payment-guide-header"><button onClick={onClose}><ArrowLeft size={17}/>{guideLocale.back}</button><SiteLogo/><span>{guideLocale.label}</span></header>
    <main className="payment-guide-content">
      <section className="payment-guide-intro"><p className="kicker">{guideLocale.eyebrow}</p><h1>{guideLocale.title}</h1><p>{guideLocale.intro}</p></section>
      <section className="payment-guide-layout"><nav>{tabs.map(([id,label]) => <button key={id} className={id === activeTab ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}<ChevronRight size={16}/></button>)}</nav><article><p className="kicker">{guideLocale.support}</p><h2>{guide.title}</h2><p>{guide.body}</p>{guide.notes?.map(note => <p className="payment-guide-note" key={note}>{note}</p>)}{activeTab === 'protection' && <div className="protection-video-phones" aria-label={guideLocale.tabs.protection}>{guide.videoFallbacks.map(video => <article key={video.id}>{video.src ? <video src={video.src} controls playsInline preload="metadata" poster={video.poster || undefined}/> : <div className="protection-video-poster"><Play size={22}/><span>{video.title}</span></div>}<small>{video.status}</small><p>{video.body}</p></article>)}</div>}{activeTab === 'paymentStatus' && <div className="paygate-tracker"><div><ExternalLink size={18}/><strong>{guideLocale.tracker.title}</strong></div><label>{guideLocale.tracker.label}<input value={paymentReference} onChange={event => { setPaymentReference(event.target.value); setReferenceCopied(false); }} placeholder={guideLocale.tracker.placeholder} autoComplete="off" spellCheck="false"/></label><div className="tracker-actions"><button type="button" onClick={copyPaymentReference} disabled={!paymentReference.trim()}>{referenceCopied ? guideLocale.tracker.copied : guideLocale.tracker.copy}</button><button type="button" onClick={openPaymentTracker}>{guideLocale.tracker.open}<ExternalLink size={16}/></button></div><small>{guideLocale.tracker.note}</small><small>{guideLocale.tracker.privacy}</small></div>}{activeTab === 'tracking' && <div className="tracking-links">{guide.carriers.map(({name,url}) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}<ArrowRight size={15}/></a>)}</div>}</article></section>
    </main>
  </div>;
}

function PackagingGuide({ lang, brands: brandList, onClose }) {
  const labels = getCommerceCopy(lang).packagingGuide;
  const items = Object.values(labels.items);
  return <div className="packaging-page">
    <header className="packaging-header"><button onClick={onClose}><ArrowLeft size={17}/>{labels.back}</button><SiteLogo/><span>{labels.eyebrow}</span></header>
    <main className="packaging-content"><section className="packaging-intro"><p>{labels.eyebrow}</p><h1>{labels.title}</h1><span>{labels.intro}</span></section><div className="packaging-grid">{brandList.map((brand, index) => <article key={brand.en}><div className="packaging-visual"><Box size={28}/><span>{String(index + 1).padStart(2,'0')}</span></div><p>{lang === 'zh' ? brand.zh : brand.en}</p><h2>{formatCopy(labels.brandSet, { brand:brand.en })}</h2><ul>{items.map(item => <li key={item}><PackageCheck size={15}/>{item}</li>)}</ul><small>{labels.included}</small></article>)}</div><p className="packaging-note">{labels.note}</p><p className="packaging-note">{labels.sourceNote}</p><p className="packaging-note">{labels.confirmAction}</p></main>
  </div>;
}

function App() {
  const storedCheckoutFlow = useMemo(readStoredCheckoutFlow, []);
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
  const [cart, setCart] = useState(readStoredCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [brandPage, setBrandPage] = useState(null);
  const [catalogProduct, setCatalogProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(() => Math.min(3, Math.max(1, Number(storedCheckoutFlow.step) || 1)));
  const [checkoutDetails, setCheckoutDetails] = useState(readStoredCheckoutDetails);
  const [allProductsOpen, setAllProductsOpen] = useState(() => window.location.pathname.startsWith('/shop'));
  const [shopProductId, setShopProductId] = useState(() => {
    const match = window.location.pathname.match(/^\/shop\/product\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [shopBrand, setShopBrand] = useState('all');
  const [remoteShopProduct, setRemoteShopProduct] = useState(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [paymentGuideOpen, setPaymentGuideOpen] = useState(false);
  const [paymentGuideTab, setPaymentGuideTab] = useState('protection');
  const [packagingOpen, setPackagingOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentAsset, setPaymentAsset] = useState(() => ['USDT','USDC','BTC','ETH','SOL'].includes(storedCheckoutFlow.asset) ? storedCheckoutFlow.asset : 'USDT');
  const [paymentMethod, setPaymentMethod] = useState(() => storedCheckoutFlow.method === 'cod' ? 'cod' : 'crypto');
  const [paymentChannel, setPaymentChannel] = useState(() => storedCheckoutFlow.channel === 'direct' ? 'direct' : 'gateway');
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [hostedPaymentUrl, setHostedPaymentUrl] = useState('');
  const [hostedPopupBlocked, setHostedPopupBlocked] = useState(false);
  const [paymentProofStatus, setPaymentProofStatus] = useState('');
  const [paymentTxid, setPaymentTxid] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const watchRail = useRef(null);
  const t = copy[lang];
  const m = microcopy[lang];
  const q = qualityCopy[lang];
  const commerce = getCommerceCopy(lang);
  const checkoutCopy = commerce.checkout;
  const countryOptions = useMemo(() => {
    try {
      const names = new Intl.DisplayNames(['en'], { type:'region' });
      return ISO_COUNTRY_CODES.map(code => ({ code, name:names.of(code) })).filter(item => item.name).sort((a,b) => a.name.localeCompare(b.name, 'en'));
    } catch { return []; }
  }, []);

  useEffect(() => {
    document.documentElement.lang = { zh:'zh-CN', en:'en', ja:'ja', ko:'ko', fr:'fr', de:'de', es:'es' }[lang];
    localStorage.setItem('oiwatch-language', lang);
    document.body.style.overflow = selected || menu || cartOpen || brandPage || checkoutOpen || allProductsOpen || qualityOpen || paymentGuideOpen || packagingOpen || adminGateOpen ? 'hidden' : '';
  }, [lang, selected, menu, cartOpen, brandPage, checkoutOpen, allProductsOpen, qualityOpen, paymentGuideOpen, packagingOpen, adminGateOpen]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (checkoutDetails) localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutDetails));
  }, [checkoutDetails]);

  useEffect(() => {
    localStorage.setItem(CHECKOUT_FLOW_STORAGE_KEY, JSON.stringify({
      step:checkoutStep,
      method:paymentMethod,
      channel:paymentChannel,
      asset:paymentAsset,
    }));
  }, [checkoutStep, paymentMethod, paymentChannel, paymentAsset]);

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

  const buyNow = watch => {
    addToCart(watch);
    setCartOpen(false);
    setCheckoutStep(checkoutDetails ? 2 : 1);
    setCheckoutOpen(true);
  };

  const changeQuantity = (id, amount) => {
    setCart(items => items
      .map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter(item => item.quantity > 0));
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const itemPrice = (item) => item.price || (item.customMeta ? 1650 + item.customMeta.lineIndex * 350 + (item.customMeta.rare ? 900 : 0) : ({ aurelia: 3200, celeste: 4200, monolith: 2600 }[item.id] || 2200));
  const cartTotal = cart.reduce((total, item) => total + itemPrice(item) * item.quantity, 0);
  const locale = { zh:'zh-CN', en:'en-US', ja:'ja-JP', ko:'ko-KR', fr:'fr-FR', de:'de-DE', es:'es-ES' }[lang] || 'en-US';
  const money = value => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
  const allStoreProducts = managedProducts
    .filter(product => product.status === 'published' && isVerifiedStoreProduct(product))
    .map(product => catalogDisplayProduct(product, lang))
    .sort((a,b) => new Date(b.sortDate) - new Date(a.sortDate));
  const cryptoChoices = [['USDT','TRC20'],['USDC','Polygon'],['BTC','Bitcoin'],['ETH','Ethereum'],['SOL','Solana']];
  const selectedNetwork = cryptoChoices.find(([asset]) => asset === paymentAsset)?.[1] || '';
  const settlementAsset = paymentChannel === 'gateway' ? 'USDC' : paymentAsset;
  const settlementNetwork = paymentChannel === 'gateway' ? 'Polygon' : selectedNetwork;
  const submitOrder = async event => {
    event?.preventDefault?.();
    if (checkoutStep === 2) {
      setCheckoutStep(3);
      setOrderError('');
      return;
    }
    setOrderError('');
    if (!checkoutDetails) {
      setCheckoutStep(1);
      setOrderError(checkoutCopy.errors.requiredFields);
      return;
    }
    setHostedPaymentUrl('');
    setHostedPopupBlocked(false);
    const hostedWindow = paymentChannel === 'gateway' ? window.open('', '_blank') : null;
    if (hostedWindow) {
      hostedWindow.opener = null;
      hostedWindow.document.title = checkoutCopy.channels.hosted.title;
      hostedWindow.document.body.textContent = checkoutCopy.channels.hosted.opening;
    }
    setOrderSubmitting(true);
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
        body: JSON.stringify({ orderId: orderNumber, amountUsd: paymentMethod === 'cod' ? 40 : cartTotal, orderTotal, asset:settlementAsset, customer:{ name:checkoutDetails.customerName, email:checkoutDetails.email, phone:checkoutDetails.phone, address:checkoutDetails.streetAddress, postalCode:checkoutDetails.postalCode, country:checkoutDetails.country }, items, paymentMethod, paymentChannel }),
      });
      const payment = await paymentResponse.json().catch(() => null);
      if (!paymentResponse.ok) throw new Error(payment?.error || `Payment request failed (${paymentResponse.status})`);
      if (payment.paymentUrl) {
        setHostedPaymentUrl(payment.paymentUrl);
        if (hostedWindow) hostedWindow.location.replace(payment.paymentUrl);
        else setHostedPopupBlocked(true);
        return;
      }
      hostedWindow?.close();
      setPaymentInvoice(payment);
      setOrderPlaced(true);
    } catch (error) {
      hostedWindow?.close();
      console.warn('Payment creation failed.', error);
      setOrderError(checkoutCopy.errors.paymentCreateFailed);
    } finally {
      setOrderSubmitting(false);
    }
  };
  const confirmDeliveryDetails = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (['customerName','email','phone','country','streetAddress','postalCode'].some(key => !String(data.get(key) || '').trim())) { setOrderError(checkoutCopy.errors.requiredFields); return; }
    setCheckoutDetails(Object.fromEntries(data.entries()));
    setCheckoutStep(2);
    setOrderError('');
  };
  const confirmPaymentMethod = event => {
    event.preventDefault();
    if (paymentMethod === 'cod' && paymentChannel === 'gateway') setPaymentAsset('USDC');
    setCheckoutStep(3);
    setOrderError('');
  };
  const submitPaymentProof = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const screenshot = form.get('screenshot');
    const txid = String(form.get('txid') || '').trim();
    if (!txid && !(screenshot instanceof File && screenshot.size)) {
      setPaymentProofStatus('required');
      return;
    }
    setPaymentProofStatus('submitting');
    let screenshotData = null;
    if (screenshot instanceof File && screenshot.size) {
      if (!screenshot.type.startsWith('image/') || screenshot.size > 5 * 1024 * 1024) {
        setPaymentProofStatus('screenshotInvalid');
        return;
      }
      screenshotData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(screenshot); });
    }
    try {
      const response = await fetch('/.netlify/functions/submit-crypto-proof', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ orderId:paymentInvoice.orderId, asset:paymentInvoice.asset, txid, screenshotData, screenshotName:screenshot instanceof File ? screenshot.name : '' }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `Proof request failed (${response.status})`);
      setPaymentTxid(txid);
      if (!txid) {
        setPaymentProofStatus('pending');
        event.currentTarget.reset();
        return;
      }
      setPaymentProofStatus('checking');
      const verificationResponse = await fetch('/.netlify/functions/verify-crypto-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ orderId:paymentInvoice.orderId, asset:paymentInvoice.asset, txid }) });
      const verification = await verificationResponse.json().catch(() => null);
      if (!verificationResponse.ok) throw new Error(verification?.error || `Verification request failed (${verificationResponse.status})`);
      setPaymentTxid(verification.txid || txid);
      setPaymentProofStatus(verification.status === 'completed' ? 'completed' : 'pending');
      event.currentTarget.reset();
    } catch (error) {
      console.warn('Payment evidence submission failed.', error);
      setPaymentProofStatus('failed');
    }
  };
  const paymentExplorerUrl = paymentTxid ? ({ BTC:`https://mempool.space/tx/${paymentTxid}`, ETH:`https://etherscan.io/tx/${paymentTxid}`, USDC:`https://polygonscan.com/tx/${paymentTxid}`, USDT:`https://tronscan.org/#/transaction/${paymentTxid}`, SOL:`https://solscan.io/tx/${paymentTxid}` }[paymentInvoice?.asset] || null) : null;
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
    setShopBrand(brand.en);
    navigateShop('/shop');
  };
  const closeShop = () => navigateShop('/');
  const openShopProduct = product => navigateShop(`/shop/product/${encodeURIComponent(product.id)}`);
  const shopProduct = remoteShopProduct || allStoreProducts.find(product => String(product.id) === String(shopProductId));
  const openWhatsApp = () => {
    const text = encodeURIComponent(whatsappEnquiryCopy[lang] || whatsappEnquiryCopy.en);
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
        <nav><button onClick={openShop}>{m.allProducts}</button><button onClick={() => scrollTo('brands')}>{m.maisons}</button><button onClick={() => scrollTo('story')}>{m.story}</button><button onClick={() => setPaymentGuideOpen(true)}>{m.paymentGuide}</button><button onClick={() => setPackagingOpen(true)}>{m.packaging}</button></nav>
        <div className="nav-actions">
          <label className="language-picker"><Globe2 size={15}/><select value={lang} onChange={event => setLang(event.target.value)} aria-label={m.language}>{languageOptions.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <button className={`cart-trigger cart-prominent ${cartPulse ? 'cart-pulse' : ''}`} onClick={() => setCartOpen(true)} aria-label={m.cart}><ShoppingBag size={21}/><b>{m.bagShort}</b><span>{cartCount}</span></button>
          <button className="enquire" onClick={openWhatsApp}>{m.enquire}</button>
        </div>
      </header>

      <main>
        <section className="cinematic-hero" id="home">
          <div className="hero-watch-layer" aria-hidden="true">
            <FadingHeroVideo/>
          </div>
        </section>

        <section className="collection section immersive-collection" id="collection">
          <div className="section-heading">
            <div><p className="kicker">{t.featured}</p><h2>{t.sectionTitle}</h2></div>
            <p>{t.sectionText}</p>
          </div>
          <div className="rail-controls">
            <span>{m.swipe}</span>
          </div>
          <div className="watch-grid" ref={watchRail}>
            {managedProducts.filter(product => product.status === 'published' && isVerifiedStoreProduct(product)).slice(0, 8).map((product, i) => (
              <article className="watch-card managed-card" key={product.id} role="button" tabIndex="0" onClick={() => openShopProduct(catalogDisplayProduct(product, lang))} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openShopProduct(catalogDisplayProduct(product, lang)); } }}>
                <div className="card-index">{m.newItem}</div>
                {product.media?.[0]?.type?.startsWith('video') ? <video src={product.media[0].url} muted loop autoPlay playsInline preload="metadata"/> : <img src={optimizedImage(product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', 760)} loading={i > 2 ? 'lazy' : 'eager'} decoding="async" alt={localizedProductValue(product, lang, 'name')}/>}
                <div className="card-info"><p>{cleanLocalizedText(lang === 'zh' ? product.brandZh : product.brandEn, lang) || 'OiWatch'}</p><h3>{localizedProductValue(product, lang, 'name')}</h3><span>{money(product.price)}</span><div className="card-actions"><button onClick={() => openShopProduct(catalogDisplayProduct(product, lang))}>{t.view}<ArrowRight size={15}/></button><button className="add-cart" onClick={() => addToCart({ ...product, image:product.media?.[0]?.url || '/images/watch-aurelia-web.jpg', customManaged:true })}><ShoppingBag size={14}/>{m.add}</button></div></div>
              </article>
            ))}
          </div>
          <button className="outline" onClick={openShop}>{t.all}<ChevronRight size={17}/></button>
        </section>

        <section className="brands-section" id="brands">
          <div className="brand-reference-layer" aria-hidden="true"><FadingHeroVideo src={COLLECTION_BACKGROUND_VIDEO} className="brand-reference-video"/></div>
          <div className="brands-heading">
            <p className="kicker">{m.brands}</p>
            <h2>{m.byBrand}</h2>
          </div>
          <div className="brand-rail" aria-label={m.watchBrands}>
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
          <div className="story-image" aria-hidden="true"><div className="seal"><Clock3/><span>SOURCE<br/>CHECKED</span></div></div>
          <div className="story-content">
            <p className="kicker">{t.storyKicker}</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.storyBody}</p>
            <div className="credentials">
              <div><ShieldCheck/><strong>SRC</strong><span>{q.best}</span></div>
              <div><Sparkles/><strong>ITEM</strong><span>{lang === 'zh' ? '实物核验' : lang === 'ja' ? '商品確認' : lang === 'ko' ? '상품 확인' : lang === 'fr' ? 'Article vérifié' : lang === 'de' ? 'Ware geprüft' : lang === 'es' ? 'Artículo verificado' : 'Item checked'}</span></div>
              <div><Globe2/><strong>QC</strong><span>{lang === 'zh' ? '交付前检查' : lang === 'ja' ? '出荷前検品' : lang === 'ko' ? '출고 전 검사' : lang === 'fr' ? 'Contrôle final' : lang === 'de' ? 'Endkontrolle' : lang === 'es' ? 'Control final' : 'Final inspection'}</span></div>
            </div>
            <button className="text-link dark-link">{t.learn}<ArrowRight size={15}/></button>
          </div>
        </section>

      </main>

      <section className="shipping-partners" aria-label={m.shippingPartners}>
        <div className="shipping-copy">
          <p>{m.shippingPartners}</p>
          <span>{m.shippingTagline}</span>
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
        <p>{m.worldwideDelivery}</p>
        <span>© 2026 OIWATCH</span>
      </footer>

      {menu && <div className="mobile-menu"><button className="close" onClick={() => setMenu(false)}><X/></button><SiteLogo/><button onClick={() => { setMenu(false); openShop(); }}>{m.allProducts}</button><button onClick={() => scrollTo('brands')}>{m.maisons}</button><button onClick={() => scrollTo('story')}>{m.story}</button><button onClick={() => { setMenu(false); setPaymentGuideOpen(true); }}>{m.paymentGuide}</button><button onClick={() => { setMenu(false); setPackagingOpen(true); }}>{m.packaging}</button><label className="language-picker"><Globe2/><select value={lang} onChange={event => setLang(event.target.value)}>{languageOptions.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label></div>}

      {paymentGuideOpen && <PaymentGuide lang={lang} activeTab={paymentGuideTab} setActiveTab={setPaymentGuideTab} onClose={() => setPaymentGuideOpen(false)}/>} 
      {packagingOpen && <PackagingGuide lang={lang} brands={brands} onClose={() => setPackagingOpen(false)}/>}

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
        <header className="quality-header"><button onClick={() => setQualityOpen(false)}><ArrowLeft size={17}/>{q.back}</button><SiteLogo/><span>SOURCE &amp; DELIVERY</span></header>
        <div className="quality-hero"><p className="kicker">{q.kicker}</p><h1>{q.title}</h1><p>{q.intro}</p></div>
        <div className="quality-comparison">
          {[{title:q.super,badge:q.best,points:q.superPoints,premium:true},{title:q.aaa,badge:q.cheap,points:q.aaaPoints}].map(group=><article className={group.premium?'premium':''} key={group.title}><span>{group.badge}</span><h2>{group.title}</h2><ul>{group.points.map(point=><li key={point}><ShieldCheck size={17}/><p>{point}</p></li>)}</ul></article>)}
        </div>
        <p className="quality-note">{q.note}</p>
      </div>}

      {allProductsOpen && (shopProduct
        ? <ShopProductPage product={shopProduct} products={allStoreProducts} lang={lang} money={money} cartCount={cartCount} cartPulse={cartPulse} onBack={() => navigateShop('/shop')} onCart={() => setCartOpen(true)} onAdd={addToCart} onCheckout={buyNow} onProduct={openShopProduct}/>
        : <ShopPage products={allStoreProducts} initialBrand={shopBrand} lang={lang} money={money} cartCount={cartCount} cartPulse={cartPulse} onBack={closeShop} onCart={() => setCartOpen(true)} onProduct={openShopProduct} onAdd={addToCart}/>)}

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
          <button onClick={() => setBrandPage(null)}><ArrowLeft size={17}/>{m.brandBack}</button>
          <SiteLogo/>
          <div className="brand-header-actions"><button className={`cart-trigger ${cartPulse ? 'cart-pulse' : ''}`} onClick={() => setCartOpen(true)}><ShoppingBag size={17}/><span>{cartCount}</span></button><button onClick={openWhatsApp}><MessageCircle size={17}/>{m.enquire}</button></div>
        </header>
        <div className="brand-page-hero">
          <img src={brandLogoOverrides[brandPage.en] || `https://logos.hunter.io/${brandDomains[brandPage.index]}`} alt={`${lang === 'zh' ? brandPage.zh : brandPage.en} Logo`}/>
          <p>{m.brandCatalogue}</p>
          <h1>{lang === 'zh' ? brandPage.zh : brandPage.en}</h1>
          <span>{m.brandIntro}</span>
        </div>
        <div className="brand-watch-grid">
          {Array.from({ length: 5 }, (_, index) => {
            const lines = lang === 'zh' ? brandPage.zhLines : brandPage.enLines;
            const model = lines[index % lines.length];
            const visual = watches[index % watches.length];
            const officialModel = brandPage.enLines[index % brandPage.enLines.length];
            const productImage = visual.image;
            const product = { brand: brandPage, model, officialModel, index, visual, productImage };
            return <article key={`${model}-${index}`}>
              <button className="brand-watch-image" onClick={() => setCatalogProduct(product)}><img src={productImage} alt={model} onError={event => { event.currentTarget.src = visual.image; }}/><span>0{index + 1}</span></button>
              <p>{lang === 'zh' ? brandPage.zh : brandPage.en}</p>
              <h3>{model}</h3>
              <small>{m.collectionReference}</small>
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
            <div className="catalog-badges"><span>{m.orderReviewed}</span><span>{m.worldwideSourcing}</span></div>
            <div className="catalog-spec-list">
              <div><span>{m.condition}</span><strong>{m.confirmedBeforePayment}</strong></div>
              <div><span>{m.included}</span><strong>{m.confirmedPerOrder}</strong></div>
              <div><span>{m.delivery}</span><strong>{m.secureWorldwide}</strong></div>
            </div>
            <p className="catalog-note">{m.catalogueNote}</p>
          </div>
        </section>
      </div>}

      {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}>
        <aside className="cart-panel" onClick={event => event.stopPropagation()}>
          <div className="cart-header">
            <div><span>{m.cartKicker}</span><h2>{m.cart}</h2></div>
            <button className="close" onClick={() => setCartOpen(false)}><X/></button>
          </div>
          <div className="cart-items">
            {cart.length === 0
              ? <div className="empty-cart"><ShoppingBag/><p>{m.empty}</p><button onClick={() => setCartOpen(false)}>{m.continue}</button></div>
              : cart.map(item => {
                const content = item.customManaged ? { collection:cleanLocalizedText(lang === 'zh' ? item.brandZh : item.brandEn, lang) || 'OiWatch', name:localizedProductValue(item, lang, 'name'), subtitle:money(item.price) } : item.customMeta ? {
                  collection: lang === 'zh' ? item.customMeta.brand.zh : item.customMeta.brand.en,
                  name: (lang === 'zh' ? item.customMeta.brand.zhLines : item.customMeta.brand.enLines)[item.customMeta.lineIndex],
                  subtitle: item.customMeta.rare ? selectionTierCopy[lang].rare : selectionTierCopy[lang].signature,
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
                  <button className="remove-item" onClick={() => setCart(items => items.filter(entry => entry.id !== item.id))} aria-label={m.remove}><Trash2 size={16}/></button>
                </article>;
              })}
          </div>
          {cart.length > 0 && <div className="cart-footer">
            <p><span>{m.selected}</span><strong>{cartCount}</strong></p>
            <p className="cart-total"><span>{m.total}</span><strong>{money(cartTotal)}</strong></p>
            <button className="primary" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>{m.checkoutNow}<ArrowRight size={17}/></button>
            <small>{m.cartPricing}</small>
          </div>}
        </aside>
      </div>}

      {checkoutOpen && <div className="checkout-page">
        <header className="checkout-header"><SiteLogo/><button onClick={() => setCheckoutOpen(false)}><X size={18}/>{checkoutCopy.backToBag}</button></header>
        {orderPlaced && paymentInvoice && <div className="order-success crypto-payment direct-wallet-checkout">
          <ShieldCheck/><p>{paymentMethod === 'cod' ? checkoutCopy.result.codEyebrow : checkoutCopy.result.walletEyebrow}</p><h2>{paymentMethod === 'cod' ? checkoutCopy.result.codTitle : checkoutCopy.result.walletTitle}</h2>
          <span>{formatCopy(paymentMethod === 'cod' ? checkoutCopy.result.codSummary : checkoutCopy.result.walletSummary, { orderId:paymentInvoice.orderId, asset:paymentInvoice.asset, network:cryptoChoices.find(([asset]) => asset === paymentInvoice.asset)?.[1] || settlementNetwork })}</span>
          {paymentInvoice.qrCode ? <><img className="payment-qr" src={paymentInvoice.qrCode} alt={checkoutCopy.result.qrAlt}/><a className="payment-copy" href={paymentInvoice.qrCode} download={`oiwatch-${paymentInvoice.orderId}-${paymentInvoice.asset}-qr.png`}>{checkoutCopy.result.saveQr}</a></> : <div className="payment-qr-placeholder">{checkoutCopy.result.qrUnavailable}</div>}
          <strong className="payment-due">{paymentInvoice.amountCoin ? `${paymentInvoice.amountCoin} ${paymentInvoice.asset}` : paymentInvoice.asset}</strong>
          {paymentChannel === 'direct' && <><code className="payment-address">{paymentInvoice.address}</code><button type="button" className="payment-copy" onClick={() => navigator.clipboard?.writeText(paymentInvoice.address)}>{checkoutCopy.result.copyAddress}</button></>}
          <small>{formatCopy(checkoutCopy.network.warning, { asset:paymentInvoice.asset, network:cryptoChoices.find(([asset]) => asset === paymentInvoice.asset)?.[1] || settlementNetwork })}</small>
          <form className="payment-proof" onSubmit={submitPaymentProof}>
            <label>{checkoutCopy.proof.hashLabel}<input name="txid" placeholder={checkoutCopy.proof.hashPlaceholder} autoComplete="off"/></label>
            <label>{checkoutCopy.proof.screenshotLabel}<input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp"/><small>{checkoutCopy.proof.screenshotHint}</small></label>
            <button type="submit" className="payment-copy">{checkoutCopy.proof.submit}</button>
          </form>
          {paymentProofStatus && <p className="payment-proof-status">{checkoutCopy.proof.statuses[paymentProofStatus] || checkoutCopy.proof.statuses.failed}</p>}
          {paymentExplorerUrl && <a className="payment-copy" href={paymentExplorerUrl} target="_blank" rel="noreferrer">{checkoutCopy.proof.viewOnChain}</a>}
          <button className="primary" onClick={() => { setOrderPlaced(false); setPaymentInvoice(null); setCheckoutOpen(false); setCart([]); }}>{checkoutCopy.result.complete}</button>
        </div>}        {orderPlaced && !paymentInvoice ? <div className="order-success"><ShieldCheck/><p>{checkoutCopy.result.submittedEyebrow}</p><h2>{checkoutCopy.result.submittedTitle}</h2><span>{checkoutCopy.result.submittedBody}</span><button className="primary" onClick={() => { setOrderPlaced(false); setCheckoutOpen(false); setCart([]); }}>{checkoutCopy.result.returnHome}</button></div>
        : <div className="checkout-layout">
          {checkoutStep === 1 && <form className="payment-form delivery-form" noValidate onSubmit={confirmDeliveryDetails}>
            <p>{checkoutCopy.steps.address.eyebrow}</p><h1>{checkoutCopy.steps.address.title}</h1>
            <fieldset><legend>{checkoutCopy.address.contactLegend}</legend><div className="form-row"><input name="customerName" required defaultValue={checkoutDetails?.customerName || ''} placeholder={checkoutCopy.address.fullName}/><input name="email" required type="email" defaultValue={checkoutDetails?.email || ''} placeholder={checkoutCopy.address.email}/></div><input name="phone" required defaultValue={checkoutDetails?.phone || ''} placeholder={checkoutCopy.address.phone}/></fieldset>
            <fieldset><legend>{checkoutCopy.address.deliveryLegend}</legend><select className="checkout-country" name="country" required defaultValue={checkoutDetails?.country || ''}><option value="" disabled>{checkoutCopy.address.country}</option>{countryOptions.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</select><textarea name="streetAddress" required rows="6" defaultValue={checkoutDetails?.streetAddress || ''} placeholder={checkoutCopy.address.streetAddress}/><input name="postalCode" required defaultValue={checkoutDetails?.postalCode || ''} placeholder={checkoutCopy.address.postalCode}/></fieldset>
            <small>{checkoutCopy.address.savedNotice}</small>
            {orderError && <p className="admin-save-error">{orderError}</p>}<button className="primary" type="submit"><ArrowRight size={17}/>{checkoutCopy.address.confirm}</button>
          </form>}
          {checkoutStep === 2 && <form className="payment-form" onSubmit={confirmPaymentMethod}>
            <p>{checkoutCopy.steps.method.eyebrow}</p><h1>{checkoutCopy.steps.method.title}</h1>
            <fieldset><legend>{checkoutCopy.methods.legend}</legend><div className="payment-method-options"><label><input type="radio" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')}/><span><strong>{checkoutCopy.methods.crypto.title}</strong><small>{checkoutCopy.methods.crypto.description}</small></span></label><label><input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')}/><span><strong>{checkoutCopy.methods.cod.title}</strong><small>{checkoutCopy.methods.cod.description}</small></span></label></div></fieldset>
            <fieldset><legend>{paymentMethod === 'cod' ? checkoutCopy.methods.codAssetLegend : checkoutCopy.methods.assetLegend}</legend><div className="crypto-options">{cryptoChoices.map(([asset, network]) => <label key={asset}><input type="radio" name="paymentAsset" value={asset} checked={paymentAsset === asset} onChange={() => setPaymentAsset(asset)}/><span><strong>{asset}</strong><small>{network}</small></span></label>)}</div><small className="network-warning"><ShieldCheck size={14}/>{formatCopy(checkoutCopy.network.warning, { asset:paymentAsset, network:selectedNetwork })}</small></fieldset>
            {paymentMethod === 'cod' && <div className="cod-summary"><strong>{checkoutCopy.cod.title}</strong><span>{formatCopy(checkoutCopy.cod.totalWithFee, { amount:money(cartTotal * 1.1) })}</span><span>{checkoutCopy.cod.shippingDueNow}</span><span>{formatCopy(checkoutCopy.cod.balanceOnDelivery, { amount:money(Math.max(0, cartTotal * 1.1 - 40)) })}</span><small>{checkoutCopy.cod.shippingPurpose}</small><small>{checkoutCopy.cod.eligibility}</small></div>}{orderError && <p className="admin-save-error">{orderError}</p>}<button className="primary" type="submit"><ArrowRight size={17}/>{checkoutCopy.methods.continue}</button><button type="button" className="checkout-back" onClick={() => setCheckoutStep(1)}>{checkoutCopy.methods.back}</button>
          </form>}
          {checkoutStep === 3 && <section className="payment-channel-step"><p>{checkoutCopy.steps.channel.eyebrow}</p><h2>{checkoutCopy.steps.channel.title}</h2><div className="payment-method-options"><label><input type="radio" name="paymentChannel" checked={paymentChannel === 'gateway'} onChange={() => setPaymentChannel('gateway')}/><span><strong>{checkoutCopy.channels.hosted.title}</strong><small>{checkoutCopy.channels.hosted.description}</small></span></label><label><input type="radio" name="paymentChannel" checked={paymentChannel === 'direct'} onChange={() => setPaymentChannel('direct')}/><span><strong>{checkoutCopy.channels.wallet.title}</strong><small>{checkoutCopy.channels.wallet.description}</small></span></label></div>{paymentChannel === 'gateway' && <><div className="checkout-payment-logos" aria-label={checkoutCopy.channels.hosted.availability}><span className="visa-mark">VISA</span><span className="mastercard-mark">Mastercard</span><span className="applepay-mark">Apple Pay</span><span className="googlepay-mark">G Pay</span><span className="wallet-mark">USDC</span></div><small className="hosted-availability">{checkoutCopy.channels.hosted.availability}</small></>}{paymentChannel === 'direct' && <label className="direct-asset-select">{checkoutCopy.channels.wallet.assetLabel}<select value={paymentAsset} onChange={event => setPaymentAsset(event.target.value)}>{cryptoChoices.map(([asset, network]) => <option key={asset} value={asset}>{asset} · {network}</option>)}</select></label>}<small className="network-warning"><ShieldCheck size={14}/>{formatCopy(checkoutCopy.network.selected, { asset:settlementAsset, network:settlementNetwork })}</small>{hostedPopupBlocked && hostedPaymentUrl && <div className="popup-fallback"><strong>{checkoutCopy.channels.popupBlocked.title}</strong><span>{checkoutCopy.channels.popupBlocked.body}</span><a href={hostedPaymentUrl} target="_blank" rel="noreferrer">{checkoutCopy.channels.popupBlocked.action}<ExternalLink size={15}/></a><small>{checkoutCopy.channels.popupBlocked.note}</small></div>}{orderError && <p className="admin-save-error">{orderError}</p>}<button className="primary" type="button" disabled={orderSubmitting} onClick={submitOrder}>{paymentChannel === 'gateway' ? <ExternalLink size={17}/> : <ShieldCheck size={17}/>} {orderSubmitting ? (paymentChannel === 'gateway' ? checkoutCopy.channels.hosted.opening : checkoutCopy.channels.wallet.opening) : paymentChannel === 'gateway' ? checkoutCopy.channels.hosted.action : checkoutCopy.channels.wallet.action}</button><button type="button" className="checkout-back" onClick={() => setCheckoutStep(2)}>{checkoutCopy.channels.back}</button></section>}
          <aside className="order-summary"><h2>{checkoutCopy.summary.title}</h2>{cart.map(item => { const content = item.customManaged ? { name:localizedProductValue(item, lang, 'name'), collection:cleanLocalizedText(lang === 'zh' ? item.brandZh : item.brandEn, lang) || 'OiWatch' } : item.customMeta ? { name:(lang==='zh'?item.customMeta.brand.zhLines:item.customMeta.brand.enLines)[item.customMeta.lineIndex], collection:lang==='zh'?item.customMeta.brand.zh:item.customMeta.brand.en } : getWatchContent(item.id,lang); return <article key={item.id}><img src={item.image} alt={content.name}/><div><span>{content.collection}</span><h3>{content.name}</h3><p>{checkoutCopy.summary.quantity}：{item.quantity}</p></div><strong>{money(itemPrice(item)*item.quantity)}</strong></article>})}<div className="summary-total"><span>{checkoutCopy.summary.total}</span><strong>{money(cartTotal)}</strong></div></aside>
        </div>}
      </div>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
