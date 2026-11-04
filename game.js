'use strict';
// ไร่สุขใจ 2 (V.2): vegetables, animals and fish, sell at the market, spend the money on 10 upgrades. Mobile portrait only.
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('en-US');
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------------- data ----------------
// every price you PAY is 20 % lower, then a further 3x lower (seeds, animals, fish, feed, upgrades, decorations); the market pays 3x what the same thing costs to buy
const SELL_X = 3;
const FEED_PRICE = 3;
const M = c => Math.round(c * SELL_X * 10) / 10;
// xp is still earned as before the price change (sale prices are now 3x the cost, so xp is scaled back by this)
const XPF = 1.07 / (SELL_X * 0.8 / 3);
// crops: id, name, icon, seed price, seconds to grow, level, colour, kind (veg / fruit), model shape, leaf colour. Sale price is always 3x the seed price.
const CROP_ROWS = [
  ['carrot', 'แครอท', '🥕', 3, 30, 1, 0xf08a24, 'veg'], ['cabbage', 'กะหล่ำปลี', '🥬', 5, 50, 1, 0x8fd16a, 'veg'],
  ['lettuce', 'ผักกาดหอม', '🥗', 4, 40, 2, 0x9be36a, 'veg', 'head', 0x6ec44f], ['basil', 'โหระพา', '🌿', 6, 55, 2, 0x2f9e44, 'veg', 'herb', 0x2f9e44], ['tomato', 'มะเขือเทศ', '🍅', 9, 80, 2, 0xe0443a, 'veg'],
  ['cucumber', 'แตงกวา', '🥒', 11, 90, 3, 0x3f8f3a, 'veg', 'vine', 0x3c8a34], ['chili', 'พริก', '🌶️', 15, 120, 3, 0xe03a2f, 'veg', 'bush', 0x3f8f3a], ['corn', 'ข้าวโพด', '🌽', 13, 120, 3, 0xf2c12e, 'veg'],
  ['onion', 'หอมหัวใหญ่', '🧅', 18, 130, 4, 0xd9a3c9, 'veg', 'root', 0x6fb14f], ['garlic', 'กระเทียม', '🧄', 20, 140, 4, 0xf3efe2, 'veg', 'root', 0x7fc15a],
  ['potato', 'มันฝรั่ง', '🥔', 26, 170, 5, 0xc9a36b, 'veg', 'root', 0x4f9a4a], ['mushroom', 'เห็ดฟาง', '🍄', 30, 180, 5, 0xb5651d, 'veg', 'mush', 0xf1e6cf], ['strawberry', 'สตรอว์เบอร์รี', '🍓', 21, 180, 5, 0xe8466a, 'fruit'],
  ['eggplant', 'มะเขือม่วง', '🍆', 36, 240, 6, 0x5b2a86, 'veg', 'bush', 0x3f8f3a], ['broccoli', 'บรอกโคลี', '🥦', 38, 230, 6, 0x2e8b3c, 'veg', 'head', 0x2d7a35],
  ['sweetpotato', 'มันเทศ', '🍠', 42, 260, 7, 0xc0603a, 'veg', 'root', 0x5aa650], ['pumpkin', 'ฟักทอง', '🎃', 32, 240, 7, 0xe8761e, 'veg'],
  ['banana', 'กล้วย', '🍌', 52, 320, 8, 0xf5d63c, 'fruit', 'palm', 0x5aa63f], ['orange', 'ส้ม', '🍊', 58, 340, 8, 0xff8c1a, 'fruit', 'tree', 0x3f8f3a],
  ['watermelon', 'แตงโม', '🍉', 48, 300, 9, 0x3f9a4a, 'fruit'], ['lemon', 'มะนาว', '🍋', 62, 360, 9, 0xf4e04d, 'fruit', 'tree', 0x4a9a3a],
  ['pineapple', 'สับปะรด', '🍍', 75, 420, 10, 0xf2b822, 'fruit', 'pine', 0x4f9a3a], ['melon', 'เมลอน', '🍈', 80, 430, 10, 0xe9c46a, 'fruit', 'gourd', 0x4a9a3a],
  ['mango', 'มะม่วง', '🥭', 90, 480, 11, 0xf5a623, 'fruit', 'tree', 0x2f7d32], ['grape', 'องุ่น', '🍇', 105, 540, 12, 0x6a2c91, 'fruit', 'grape', 0x3f8f3a],
  ['apple', 'แอปเปิล', '🍎', 68, 400, 13, 0xd62828, 'fruit', 'tree', 0x3f8f3a], ['coconut', 'มะพร้าว', '🥥', 125, 600, 14, 0x7a5a3a, 'fruit', 'palm', 0x3f8f3a],
];
// 90 more vegetables and 90 more fruits (crops_more.js): level, grow time and price follow the place in the list (later = higher level, longer, dearer)
if (typeof MORE_VEG_DATA !== 'undefined') {
  MORE_VEG_DATA.forEach((r, i) => { const sec = Math.round(40 + i * 7 + (i % 5) * 6), seed = Math.max(3, Math.round(sec * (0.1 + 0.1 * i / 89))); CROP_ROWS.push([r[0], r[1], r[2], seed, sec, 2 + Math.floor(i * 1.1), r[4], 'veg', r[3], r[5]]); });
  MORE_FRUIT_DATA.forEach((r, i) => { const sec = Math.round(200 + i * 9 + (i % 4) * 8), seed = Math.max(8, Math.round(sec * (0.12 + 0.1 * i / 89))); CROP_ROWS.push([r[0], r[1], r[2], seed, sec, 4 + Math.floor(i * 1.3), r[4], 'fruit', r[3], r[5]]); });
}
const CROPS = {};
for (const r of CROP_ROWS.slice().sort((a, b) => a[5] - b[5])) CROPS[r[0]] = { n: r[1], i: r[2], seed: r[3], sec: r[4], sell: M(r[3]), lv: r[5], col: r[6], k: r[7], sh: r[8], lf: r[9] };
// an animal eats `bags` feed bags per round and gives one product worth 3x that feed
const ANIMALS = {
  chicken: { n: 'ไก่', i: '🐔', price: 16, prod: 'egg', sec: 60, bags: 1, lv: 1 },
  duck: { n: 'เป็ด', i: '🦆', price: 24, prod: 'duckegg', sec: 70, bags: 1, lv: 2 },
  sheep: { n: 'แกะ', i: '🐑', price: 40, prod: 'wool', sec: 140, bags: 2, lv: 4 },
  pig: { n: 'หมู', i: '🐖', price: 59, prod: 'pork', sec: 190, bags: 3, lv: 6 },
  cow: { n: 'วัว', i: '🐄', price: 88, prod: 'milk', sec: 170, bags: 3, lv: 8 },
};
// 20 more animals that give a product: id, name, icon, price, seconds per product, feed bags per round, level, product id, product name, product icon, 3D body (shape, main colour, second colour, size)
const ANIMAL_ROWS = [
  ['quail', 'นกกระทา', '🐦', 18, 55, 1, 10, 'quailegg', 'ไข่นกกระทา', '🥚', 'bird', 0xb08a5a, 0x6d4c2a, 0.62],
  ['goose', 'ห่าน', '🪿', 44, 120, 2, 10, 'gooseegg', 'ไข่ห่าน', '🥚', 'long', 0xffffff, 0xf08a24, 1.0],
  ['guineafowl', 'ไก่ฟ้า', '🐔', 26, 80, 1, 11, 'guineaegg', 'ไข่ไก่ฟ้า', '🥚', 'bird', 0x6f7a86, 0xf2f2f2, 0.9],
  ['pigeon', 'นกพิราบ', '🕊️', 24, 75, 1, 12, 'pigeonegg', 'ไข่นกพิราบ', '🪺', 'bird', 0xb7bcc4, 0x7a8896, 0.7],
  ['rabbit', 'กระต่าย', '🐇', 46, 130, 2, 13, 'rabbitfur', 'ขนกระต่าย', '🧵', 'rabbit', 0xf4efe6, 0xf2a8b8, 0.8],
  ['goat', 'แพะ', '🐐', 50, 150, 2, 14, 'goatmilk', 'นมแพะ', '🥛', 'quad', 0xd9d2c3, 0x5a4a3a, 0.85],
  ['turkey', 'ไก่งวง', '🦃', 72, 180, 3, 16, 'turkeyegg', 'ไข่ไก่งวง', '🥚', 'bird', 0x7a4a2a, 0xd23a2a, 1.15],
  ['bee', 'ผึ้ง', '🐝', 28, 90, 1, 17, 'honey', 'น้ำผึ้ง', '🍯', 'bee', 0xffc928, 0x2b2b2b, 1.0],
  ['peacock', 'นกยูง', '🦚', 80, 200, 3, 19, 'peafeather', 'ขนนกยูง', '🪶', 'long', 0x1f7fb5, 0x2fa86a, 1.1],
  ['swan', 'หงส์', '🦢', 84, 210, 3, 21, 'swanfeather', 'ขนหงส์', '🪶', 'long', 0xffffff, 0x2b2b2b, 1.1],
  ['silkworm', 'หนอนไหม', '🐛', 56, 160, 2, 22, 'silk', 'ไหมดิบ', '🧵', 'worm', 0xf6f0dc, 0xd9cfa8, 1.0],
  ['cricket', 'จิ้งหรีด', '🦗', 22, 65, 1, 24, 'cricketfood', 'จิ้งหรีดสด', '🦗', 'bee', 0x7a5a2a, 0x3a2a14, 0.9],
  ['alpaca', 'อัลปาคา', '🦙', 110, 230, 4, 26, 'alpacawool', 'ขนอัลปาคา', '🧶', 'llama', 0xe9d9bd, 0xb89a72, 1.0],
  ['horse', 'ม้า', '🐴', 118, 240, 4, 29, 'horsemilk', 'นมม้า', '🥛', 'quad', 0x8a5a32, 0x2b2b2b, 1.2],
  ['buffalo', 'ควาย', '🐃', 125, 250, 4, 32, 'buffalomilk', 'นมควาย', '🥛', 'quad', 0x4a4a4e, 0x2b2b2b, 1.3],
  ['boar', 'หมูป่า', '🐗', 130, 260, 4, 35, 'boarmeat', 'เนื้อหมูป่า', '🥩', 'quad', 0x5a4636, 0x2b2b2b, 0.9],
  ['deer', 'กวาง', '🦌', 165, 280, 5, 39, 'antler', 'กำมะหยี่เขากวาง', '🦴', 'deer', 0xb7803f, 0xf2e6d0, 1.1],
  ['snail', 'หอยทาก', '🐌', 58, 150, 2, 42, 'snailmucin', 'เมือกหอยทาก', '💧', 'snail', 0xd9c9a0, 0x9a6a3a, 1.0],
  ['camel', 'อูฐ', '🐪', 175, 300, 5, 46, 'camelmilk', 'นมอูฐ', '🥛', 'camel', 0xc99a5a, 0x8a6a3a, 1.2],
  ['ostrich', 'นกกระจอกเทศ', '🦤', 210, 320, 6, 50, 'ostrichegg', 'ไข่นกกระจอกเทศ', '🥚', 'long', 0x2b2b2b, 0xf2f2f2, 1.3],
];
const ANIMAL_SHAPE = {};   // 3D look of the new animals
const ANI_LV = lv => lv <= 14 ? lv : Math.round(14 + (lv - 14) * (120 - 14) / (50 - 14));   // the 20 newer animals unlock between Lv.10 and Lv.120 instead of Lv.50
for (const r of ANIMAL_ROWS) { ANIMALS[r[0]] = { n: r[1], i: r[2], price: r[3], prod: r[7], sec: r[4], bags: r[5], lv: ANI_LV(r[6]) }; ANIMAL_SHAPE[r[0]] = { k: r[10], c1: r[11], c2: r[12], s: r[13] }; }
// fish and seafood: id, name, icon, fry price, seconds to grow, level, colour, body (fish / eel / crab / shell / squid / frog / shrimp). Sale price is 3x the fry price.
const FISH_ROWS = [
  ['tilapia', 'ปลานิล', '🐟', 5, 100, 1, 0xf0a24a, 'fish'], ['carp', 'ปลาคาร์ป', '🐠', 11, 160, 3, 0xe0443a, 'fish'], ['catfish', 'ปลาดุก', '🐡', 19, 220, 5, 0x6d5c4c, 'fish'], ['shrimp', 'กุ้งก้ามกราม', '🦐', 29, 320, 8, 0xf08a6a, 'shrimp'],
  ['barb', 'ปลาตะเพียน', '🐟', 8, 110, 2, 0xc9d0d6, 'fish'], ['pangas', 'ปลาสวาย', '🐟', 10, 130, 2, 0x9aa3ab, 'fish'], ['goldfish', 'ปลาทอง', '🐠', 13, 150, 3, 0xffa51f, 'fish'],
  ['snakehead', 'ปลาช่อน', '🐟', 16, 170, 4, 0x6b5b3e, 'fish'], ['gourami', 'ปลาสลิด', '🐟', 19, 185, 4, 0xb7b27a, 'fish'], ['climbing', 'ปลาหมอ', '🐟', 22, 200, 5, 0x7d6b48, 'fish'],
  ['frog', 'กบนา', '🐸', 25, 215, 5, 0x5aa63f, 'frog'], ['eel', 'ปลาไหลนา', '🐍', 27, 225, 6, 0x4a4f3a, 'eel'], ['crab', 'ปูนา', '🦀', 31, 250, 6, 0xc0503a, 'crab'],
  ['cockle', 'หอยแครง', '🐚', 34, 260, 7, 0xd9cbb0, 'shell'], ['seabass', 'ปลากะพงขาว', '🐟', 40, 290, 7, 0xc7ccd1, 'fish'], ['ruby', 'ปลาทับทิม', '🐠', 44, 300, 8, 0xff5a4f, 'fish'],
  ['trout', 'ปลาเทราต์', '🐟', 52, 330, 9, 0x8fb7c7, 'fish'], ['squid', 'ปลาหมึก', '🦑', 60, 360, 10, 0xe8b0b8, 'squid'], ['featherback', 'ปลากราย', '🐟', 66, 380, 10, 0x9a9a8a, 'fish'],
  ['lobster', 'กุ้งมังกร', '🦞', 85, 430, 11, 0xd84a32, 'shrimp'], ['salmon', 'ปลาแซลมอน', '🐟', 95, 450, 12, 0xff8f7a, 'fish'], ['oyster', 'หอยนางรม', '🦪', 110, 500, 14, 0xb9b3a6, 'shell'],
];
const FISH = {};
const FISH_LV = lv => lv <= 5 ? lv : Math.round(5 + (lv - 5) * (100 - 5) / (14 - 5));   // fish and seafood unlock between Lv.1 and Lv.100 instead of Lv.14
for (const r of FISH_ROWS.slice().sort((a, b) => a[5] - b[5])) FISH[r[0]] = { n: r[1], i: r[2], price: r[3], sec: r[4], sell: M(r[3]), lv: FISH_LV(r[5]), col: r[6], body: r[7] };
// every sellable thing: n name, i icon, base price
const ITEMS = {};
for (const k in CROPS) ITEMS[k] = { n: CROPS[k].n, i: CROPS[k].i, base: CROPS[k].sell };
const fe = n => M(n * FEED_PRICE);
Object.assign(ITEMS, {
  egg: { n: 'ไข่ไก่', i: '🥚', base: fe(1) }, duckegg: { n: 'ไข่เป็ด', i: '🪺', base: fe(1) }, wool: { n: 'ขนแกะ', i: '🧶', base: fe(2) },
  pork: { n: 'เนื้อหมู', i: '🥩', base: fe(3) }, milk: { n: 'นมสด', i: '🥛', base: fe(3) },
});
for (const r of ANIMAL_ROWS) ITEMS[r[7]] = { n: r[8], i: r[9], base: fe(r[5]) };
for (const k in FISH) ITEMS[k] = { n: FISH[k].n, i: FISH[k].i, base: FISH[k].sell };
const RECIPES = [
  { id: 'soup', in: { tomato: 3 }, sec: 60 }, { id: 'popcorn', in: { corn: 3 }, sec: 90 }, { id: 'jam', in: { strawberry: 3 }, sec: 120 },
  { id: 'pie', in: { pumpkin: 2 }, sec: 150 }, { id: 'cheese', in: { milk: 2 }, sec: 90 }, { id: 'cake', in: { egg: 6 }, sec: 80 }, { id: 'fishball', in: { tilapia: 2 }, sec: 70 },
];
// a processed good is worth its ingredients plus ~8 %
const PROC = { soup: ['🥫', 'ซุปมะเขือเทศ'], jam: ['🍯', 'แยมสตรอว์เบอร์รี'], popcorn: ['🍿', 'ป๊อปคอร์น'], pie: ['🥧', 'พายฟักทอง'], cheese: ['🧀', 'ชีส'], cake: ['🍰', 'เค้กไข่'], fishball: ['🍢', 'ลูกชิ้นปลา'] };
// 20 more things to make in the workshop (simple: a few crops in, one finished good out, worth the ingredients plus ~8 %)
RECIPES.push(
  { id: 'somtam', in: { greenpapaya: 2, bigchili: 1, cherrytomato: 1 }, sec: 70 }, { id: 'tomyum', in: { lemongrass: 2, galangal: 1, kaffir: 1, oystermushroom: 2 }, sec: 100 }, { id: 'kaprao', in: { holybasil: 3, bigchili: 1 }, sec: 80 },
  { id: 'greencurry', in: { thaieggplant: 3, lemonbasil: 1, peaeggplant: 1 }, sec: 110 }, { id: 'pumpkinsoup', in: { pumpkin: 2, onion: 1 }, sec: 70 }, { id: 'friedveg', in: { bokchoy: 2, kale: 2, carrot: 1 }, sec: 60 },
  { id: 'salad', in: { lettuce: 2, cherrytomato: 2, cucumber: 1 }, sec: 50 }, { id: 'pickles', in: { cucumber: 3 }, sec: 80 }, { id: 'kimchi', in: { napa: 3, radish: 1, bigchili: 1 }, sec: 120 },
  { id: 'mangorice', in: { namdokmai: 2 }, sec: 90 }, { id: 'fruitmix', in: { hom: 1, papaya: 1, watermelon: 1 }, sec: 60 }, { id: 'smoothie', in: { blueberry: 2, hom: 1 }, sec: 50 },
  { id: 'orangejuice', in: { orange: 3 }, sec: 60 }, { id: 'lemonade', in: { lime: 3 }, sec: 50 }, { id: 'coconutice', in: { youngcoconut: 2 }, sec: 80 },
  { id: 'bananafry', in: { namwa: 3 }, sec: 70 }, { id: 'pinejam', in: { pineapple: 2 }, sec: 100 }, { id: 'wine', in: { grape: 4 }, sec: 200 },
  { id: 'driedmango', in: { okrong: 3 }, sec: 120 }, { id: 'chilidip', in: { birdchili: 3, shallot: 2, garlic: 1 }, sec: 90 },
);
Object.assign(PROC, {
  somtam: ['🥗', 'ส้มตำ'], tomyum: ['🍲', 'ต้มยำเห็ด'], kaprao: ['🍛', 'ผัดกะเพรา'], greencurry: ['🍛', 'แกงเขียวหวานมะเขือ'], pumpkinsoup: ['🥣', 'ซุปฟักทอง'], friedveg: ['🥦', 'ผัดผักรวม'],
  salad: ['🥗', 'สลัดผัก'], pickles: ['🥒', 'แตงกวาดอง'], kimchi: ['🥬', 'กิมจิ'], mangorice: ['🥭', 'ข้าวเหนียวมะม่วง'], fruitmix: ['🍓', 'ผลไม้รวมจานใหญ่'], smoothie: ['🥤', 'สมูทตี้เบอร์รี'],
  orangejuice: ['🧃', 'น้ำส้มคั้น'], lemonade: ['🍹', 'น้ำมะนาวโซดา'], coconutice: ['🍨', 'ไอศกรีมกะทิ'], bananafry: ['🍌', 'กล้วยทอด'], pinejam: ['🍯', 'แยมสับปะรด'], wine: ['🍷', 'ไวน์องุ่น'],
  driedmango: ['🥭', 'มะม่วงอบแห้ง'], chilidip: ['🌶️', 'น้ำพริกสด'],
});
for (const r of RECIPES) ITEMS[r.id] = { n: PROC[r.id][1], i: PROC[r.id][0], base: Math.round(Object.keys(r.in).reduce((t, k) => t + ITEMS[k].base * r.in[k], 0) * 1.08 * 10) / 10 };
const PLOTS = [8, 10, 12, 14, 16], PENS = [6, 10, 15, 20, 26, 33, 41, 50, 60, 72], PONDS = [3, 5, 7, 9, 12], BARNS = [60, 120, 200, 320, 500];
// vegetable beds are bought one at a time now (up to 40), each dearer than the last but never steep, and each can be placed anywhere
const PLOT_MAX = 3000, PLOT_SOFT = 40, PLOT_START = 8;   // no fixed limit: beds can be bought until the farm has no free spot (3000 is only a safety stop)
const plotPrice = n => n <= 40 ? Math.round(20 + 2.5 * (n - PLOT_START)) : Math.min(160, Math.round(100 + (n - 40) * 0.4));   // the next bed when you own n: 20 ฿ for the 9th, 97 ฿ for the 40th, then it rises slowly from 100 ฿ and stops at 160 ฿
// the farm is bigger than before: the old farm in the middle, a new field area to the south
const BOUND = { x0: -85, x1: 85, z0: -13.5, z1: 160 };   // about ten times the old farm (it was x -27..27, z -13.5..40)
const DECOS = [
  { id: 'tree', n: 'ต้นไม้ผลไม้', i: '🌳', price: 53 }, { id: 'flower', n: 'แปลงดอกไม้', i: '🌻', price: 107 }, { id: 'gazebo', n: 'ศาลาพักผ่อน', i: '🛖', price: 320 },
  { id: 'fountain', n: 'น้ำพุกลางฟาร์ม', i: '⛲', price: 800 }, { id: 'windmill', n: 'กังหันลม', i: '🌬️', price: 1600 },
];
// things worth having in the house (kept to four so it stays simple); each does one clear thing
const HOME_ITEMS = [
  { k: 'bed', n: 'เตียงนุ่ม', i: '🛏️', price: 90, d: 'นอนสบายขึ้น เหนื่อยช้าลง 30% ตลอดวัน', why: 'ควรมีเป็นอย่างแรก' },
  { k: 'cafe', n: 'มุมกาแฟและชา', i: '☕', price: 110, d: 'ชงเครื่องดื่มกู้แรงได้ทุกเวลา แก้วละ 5 ฿ ได้ +25 พลังงาน', why: 'เหมาะช่วงงานเยอะ' },
  { k: 'store', n: 'ตู้เก็บของ', i: '🗄️', price: 140, d: 'ยุ้งฉางจุของได้เพิ่ม +30 ชิ้น', why: 'เมื่อยุ้งเริ่มแน่น' },
  { k: 'vase', n: 'แจกันดอกไม้และพรม', i: '🌻', price: 70, d: 'ชื่อเสียงเพิ่ม ราคาขายทุกอย่าง +0.4%', why: 'ตกแต่งให้บ้านน่าอยู่' },
];
const DAY = 300; // the old fixed day length, only used to convert older saves
// how long a farm day lasts in real time. A day runs 09:00 to 09:00 in game time.
const TM = { fast: { n: 'เร็ว', len: 600, d: '1 วันในเกม = 10 นาทีจริง' }, normal: { n: 'ปกติ', len: 1200, d: '1 วันในเกม = 20 นาทีจริง' } };
const dayLen = () => (TM[S && S.tm] || TM.normal).len;

// ---------------- state ----------------
const API = (window.FARM2_API || '').replace(/\/$/, '');
let S = null, slot = 0, online = false;
let DEV = (() => { try { let d = localStorage.getItem('raisukjai2-dev'); if (!d) { d = 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); localStorage.setItem('raisukjai2-dev', d); } return d; } catch (e) { return 'p' + Math.random().toString(36).slice(2, 12); } })();
const fresh = name => ({ v: 1, name: name || 'ชาวไร่', money: 300, xp: 0, lvl: 1, t: 0, last: Date.now(), tip: 0, sel: 'carrot', px: 0, pz: 10.5, plots: Array.from({ length: PLOTS[0] }, () => ({ c: null, p: 0, w: 0, f: 0 })),
  pen: [{ a: 'chicken', st: 'idle', t: 0 }], pond: [], inv: {}, feed: 6, feed2: 0, fert: 0, seeds: {}, autoFert: 1, led: null, hist: [], pv: 3, u: { plot: 0, pen: 0, pond: 0, barn: 0, sprinkler: 0, feeder: 0, work: 0, truck: 0 }, bank: 0, bankDay: 1, dayN: 1, dayT: 0, tm: 'normal', en: 100, home: {}, deco: {}, job: null, stats: { earned: 0 } });
// A save lives in the browser twice (localStorage + IndexedDB) so one being wiped does not lose the farm. The key no longer depends on the
// player code; the old key (with the code) is still read so earlier saves keep working. The server copy uses the player code.
const LKEY = n => `raisukjai2-slot${n}`, LKEY_OLD = n => `raisukjai2-${DEV}-s${n}`, sid = n => `${DEV}_${n}`;
const lsGet = k => { try { const j = JSON.parse(localStorage.getItem(k)); return j && j.v === 1 ? j : null; } catch (e) { return null; } };
let idbP = null, storageOK = true;
const idb = () => idbP || (idbP = new Promise(res => { try { const r = indexedDB.open('raisukjai2', 1); r.onupgradeneeded = () => r.result.createObjectStore('s'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null); } catch (e) { res(null); } }));
const idbGet = async k => { const db = await idb(); if (!db) return null; return new Promise(res => { try { const q = db.transaction('s').objectStore('s').get(k); q.onsuccess = () => res(q.result && q.result.v === 1 ? q.result : null); q.onerror = () => res(null); } catch (e) { res(null); } }); };
const idbPut = async (k, v) => { const db = await idb(); if (!db) return; try { db.transaction('s', 'readwrite').objectStore('s').put(v, k); } catch (e) { } };
const idbDel = async k => { const db = await idb(); if (!db) return; try { db.transaction('s', 'readwrite').objectStore('s').delete(k); } catch (e) { } };
const newer = (a, b) => (a && b ? (b.last > a.last ? b : a) : (a || b));
const readLocal = async n => newer(newer(lsGet(LKEY(n)), await idbGet(LKEY(n))), lsGet(LKEY_OLD(n)));
function writeSlot(n, data) { let ok = false; try { localStorage.setItem(LKEY(n), JSON.stringify(data)); ok = true; } catch (e) { } idbPut(LKEY(n), data); return ok; }
function wipeSlot(n) { try { localStorage.removeItem(LKEY(n)); localStorage.removeItem(LKEY_OLD(n)); } catch (e) { } idbDel(LKEY(n)); }
try { localStorage.setItem('raisukjai2-test', '1'); localStorage.removeItem('raisukjai2-test'); } catch (e) { storageOK = false; }
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
const encodeSave = d => 'FARM2:' + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
const decodeSave = t => { try { const j = JSON.parse(decodeURIComponent(escape(atob(String(t).trim().replace(/^FARM2:/, ''))))); return j && j.v === 1 && Array.isArray(j.plots) ? j : null; } catch (e) { return null; } };
async function api(path, opt) { const r = await fetch(API + path, Object.assign({ cache: 'no-store' }, opt)); if (!r.ok) throw new Error(r.status); return r.json(); }
async function ping() { try { const j = await Promise.race([api('/api/ping'), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 2500))]); online = !!(j && j.ok); } catch (e) { online = false; } return online; }
// a slot is the newest of the browser copies and the server copy
async function readSlot(n) {
  const a = await readLocal(n); let b = null;
  if (online) { try { const j = await api(`/api/save?id=${sid(n)}`); b = j.save && j.save.v === 1 ? j.save : null; } catch (e) { } }
  return newer(a, b);
}
let pushing = false, pushAgain = false;
async function pushServer() {
  if (!S || !slot) return;
  if (pushing) { pushAgain = true; return; } pushing = true;
  try { await api('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sid(slot), save: S }) }); online = true; } catch (e) { online = false; }
  pushing = false; setSrv(); if (pushAgain) { pushAgain = false; if (S && slot) pushServer(); }   // the id and save are read again here, so a slot switch never writes to the wrong slot
}
function save() { if (!S || !slot) return; S.last = Date.now(); S.px = P.x; S.pz = P.z; storageOK = writeSlot(slot, S) || storageOK; if (online) pushServer(); }
let saveQ = 0; const queueSave = () => { if (!saveQ) saveQ = setTimeout(() => { saveQ = 0; save(); }, 500); };
function setSrv() { const e = $('srv'); if (e) e.innerHTML = (online ? '☁️ <b class="ok">เชื่อมต่อเซิร์ฟเวอร์แล้ว</b> เซฟถูกสำรองบนเซิร์ฟเวอร์อัตโนมัติ' : '📴 <b class="off">ไม่พบเซิร์ฟเวอร์</b> เซฟเก็บในเครื่องนี้ (2 ที่ในเบราว์เซอร์)') + (storageOK ? '' : '<br>⚠️ <b class="off">เบราว์เซอร์นี้บันทึกข้อมูลไม่ได้</b> (โหมดส่วนตัวหรือเบราว์เซอร์ในแอป) เปิดลิงก์ด้วย Chrome/Safari ปกติ หรือใช้ปุ่ม "คัดลอกรหัสเซฟ" เก็บไว้'); }
const day = () => S.dayN;
// levels go up to 300: a little slower per level than before, and from level 150 every next level takes steadily longer (x2.5 at the end)
const MAXLV = 300, xpNeed = l => Math.round(55 * Math.pow(l, 1.5) * (l > 150 ? 1 + (l - 150) / 100 : 1));
const cap = () => BARNS[S.u.barn] + (S.home && S.home.store ? 30 : 0), used = () => Object.values(S.inv).reduce((a, b) => a + b, 0), room = () => cap() - used();
const prestige = () => Object.keys(S.deco).length * 0.3 + (S.deco.fountain ? 0.5 : 0) + (S.home && S.home.vase ? 0.4 : 0);
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
// the market price moves in slow waves: a 12-24 day swing and a 31-53 day swing per item, so a price rises for days, peaks, then eases back (never a sudden jump).
// It is always between 1.0x and 1.3x of the base, and the base is 3x the buying price, so everything sells for at least 3x what it cost
const factor = (id, d) => { const h1 = hash(id + ':a'), h2 = hash(id + ':b'), P1 = 12 + h1 % 13, P2 = 31 + h2 % 23, f1 = (h1 >>> 8) % 628 / 100, f2 = (h2 >>> 8) % 628 / 100; return 1 + 0.3 * (0.5 + 0.5 * (0.65 * Math.sin(2 * Math.PI * d / P1 + f1) + 0.35 * Math.sin(2 * Math.PI * d / P2 + f2))); };
const bonus = () => 1 + [0, 0.04, 0.08][S.u.truck] + prestige() / 100;
const price = id => Math.round(ITEMS[id].base * factor(id, day()) * bonus() * 10) / 10;
const trend = id => factor(id, day()) - factor(id, day() - 1);
// ---------------- shop: seed stock, supplies, bulk discounts, daily deals ----------------
const SUPPLY = {   // things that are not seeds: base price per unit, what each does
  feed: { n: 'อาหารสัตว์', i: '🌾', price: FEED_PRICE, d: 'อาหารธรรมดา สัตว์กิน 1-3 ถุงต่อรอบผลิต' },
  feed2: { n: 'อาหารเร่งผลผลิต', i: '⚡', price: FEED_PRICE * 3, d: 'สัตว์ที่ได้กินจะผลิตเร็วขึ้น 30% (ใช้ก่อนอาหารธรรมดา)', lv: 3 },
  fert: { n: 'ปุ๋ย', i: '🧪', price: 4, d: 'ใส่ตอนปลูก ผักโตเร็วขึ้น 35% (ใช้ร่วมกับการรดน้ำได้)' },
};
const bulkF = n => (n >= 20 ? 0.9 : n >= 5 ? 0.95 : 1);
const dealOf = d => {   // three deals a farm day: two seeds and one supply, the same for everyone on that day
  const h = hash('deal' + d), ids = Object.keys(CROPS), a = ids[h % ids.length]; let b = ids[(h >>> 7) % ids.length]; if (b === a) b = ids[(ids.indexOf(a) + 7) % ids.length];
  return [{ t: 'seed', id: a, off: 0.25 }, { t: 'seed', id: b, off: 0.15 }, { t: ['feed', 'feed2', 'fert'][(h >>> 13) % 3], id: ['feed', 'feed2', 'fert'][(h >>> 13) % 3], off: 0.2 }];
};
const dealFor = (t, id) => (dealOf(day()).find(x => x.t === t && x.id === id) || { off: 0 }).off;
const seedUnit = id => Math.max(1, Math.round(CROPS[id].seed * (1 - dealFor('seed', id))));
const supplyUnit = k => Math.max(1, Math.round(SUPPLY[k].price * (1 - dealFor(k, k))));
// ---- promotions: every buyable thing has a timed offer counted in farm days; when it ends the normal price is back ----
const promoWin = (period, len, off, d) => { const r = (((d - 1 + off) % period) + period) % period; if (r < len) return { on: true, from: d - r, to: d - r + len - 1 }; const from = d + (period - r); return { on: false, from, to: from + len - 1 }; };
const PLOT_PROMO = { cycle: 10, len: 4, packs: [[3, 0.2], [5, 0.25]] };   // buy 3 beds: 20 % off the pack, buy 5: 25 % off, in days 1-4 of every 10
const plotWin = d => promoWin(PLOT_PROMO.cycle, PLOT_PROMO.len, 0, d);
const PROMO_BASE = (kind, id) => kind === 'seed' ? CROPS[id].seed : kind === 'animal' ? ANIMALS[id].price : kind === 'fish' ? FISH[id].price : SUPPLY[id].price;
const itemPromo = (kind, id) => {   // buy N, get D baht off, in a window that repeats every 7-11 days for 3-4 days; the same for everyone
  const h = hash('promo:' + kind + ':' + id), N = kind === 'seed' ? [5, 10, 20][h % 3] : kind === 'animal' ? 3 : kind === 'fish' ? 5 : id === 'feed2' ? 10 : [10, 50][h % 2];
  const pct = 0.12 + ((h >>> 4) % 11) / 100, D = Math.max(1, Math.round(PROMO_BASE(kind, id) * N * pct)), period = 7 + ((h >>> 8) % 5), len = 3 + ((h >>> 12) % 2), off = (h >>> 16) % period;
  return { N, D, win: promoWin(period, len, off, day()) };
};
const promoCut = (kind, id, n) => { const p = itemPromo(kind, id); return p.win.on ? Math.floor(n / p.N) * p.D : 0; };
const promoTag = (kind, id, unit) => { const p = itemPromo(kind, id), w = p.win; return w.on ? `<br><b class="up">🎁 โปร: ซื้อ ${p.N} ${unit} ลด ${p.D} ฿ · วันที่ ${w.from}–${w.to} (เหลือ ${w.to - day() + 1} วัน)</b>` : `<br><small>🎁 โปรรอบหน้า: ซื้อ ${p.N} ${unit} ลด ${p.D} ฿ · วันที่ ${w.from}–${w.to} (หมดโปรแล้วราคาปกติ)</small>`; };
const seedCost = (id, n) => Math.max(1, Math.round(seedUnit(id) * n * bulkF(n)) - promoCut('seed', id, n));
const supplyCost = (k, n) => Math.max(1, Math.round(supplyUnit(k) * n * bulkF(n)) - promoCut(k, k, n));
function buySeeds(id, n) { const c = CROPS[id]; if (c.lv > S.lvl) { toast(`ต้องเลเวล ${c.lv}`); return; } const have = S.seeds[id] || 0; n = Math.min(n, 99 - have); if (n <= 0) { toast('เมล็ดพันธุ์ชนิดนี้เต็มคลังแล้ว (99)'); return; } if (!spend(seedCost(id, n))) return; S.seeds[id] = have + n; sfx(540); }
function buySupply(k, n) { if (SUPPLY[k].lv && S.lvl < SUPPLY[k].lv) { toast(`ต้องเลเวล ${SUPPLY[k].lv}`); return; } if (!spend(supplyCost(k, n))) return; S[k] = (S[k] || 0) + n; sfx(500); }
const canPlant = id => (S.seeds[id] || 0) > 0 || S.money >= seedUnit(id);
// the market ledger: today's takings and the last few days
function ledAdd(g, n) {
  const d = day(); if (!S.led || S.led.d !== d) { if (S.led && S.led.v > 0) { S.hist.unshift({ d: S.led.d, v: S.led.v }); S.hist.length = Math.min(S.hist.length, 6); } S.led = { d, v: 0, n: 0 }; }
  S.led.v += g; S.led.n += n;
}
const catOf = id => (CROPS[id] ? (CROPS[id].k === 'fruit' ? 'ผลไม้' : 'ผัก') : FISH[id] ? 'ปลาและอาหารทะเล' : RECIPES.some(r => r.id === id) ? 'แปรรูป' : 'ผลผลิตสัตว์');
const CATS = [['ผัก', '🥕'], ['ผลไม้', '🍎'], ['ผลผลิตสัตว์', '🥚'], ['ปลาและอาหารทะเล', '🐟'], ['แปรรูป', '🥫']];
const isGood = id => factor(id, day()) >= 1.2;
function toast(t) { const d = document.createElement('div'); d.className = 't'; d.textContent = t; $('toast').appendChild(d); while ($('toast').children.length > 3) $('toast').firstChild.remove(); setTimeout(() => d.classList.add('out'), 2200); setTimeout(() => d.remove(), 2700); }
// energy: it drains slowly while you work; tired (< 25) means slower walking and 20 % less xp, rested (>= 80) gives 10 % more xp. Sleeping or a nap at home restores it
const TIRED = 25;
const energyRate = () => 0.055 * (S.home && S.home.bed ? 0.7 : 1);
function gainXp(n) { n *= S.en < TIRED ? 0.8 : S.en >= 80 ? 1.1 : 1; S.xp += n; while (S.lvl < MAXLV && S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; const un = [].concat(Object.values(CROPS).filter(c => c.lv === S.lvl).map(c => c.n), Object.values(ANIMALS).filter(a => a.lv === S.lvl).map(a => a.n), Object.values(FISH).filter(f => f.lv === S.lvl).map(f => f.n)); toast(`🎉 เลเวล ${S.lvl}!` + (S.lvl >= MAXLV ? ' ถึงเลเวลสูงสุดแล้ว 👑' : un.length ? ' ปลดล็อก ' + un.join(' · ') : '')); } if (S.lvl >= MAXLV) S.xp = 0; }
function spend(n) { if (S.money < n) { toast('เงินไม่พอ'); return false; } S.money -= n; return true; }
function addItem(id, n) { const k = Math.min(n, room()); if (k <= 0) { toast('ยุ้งฉางเต็ม! ไปขายที่ตลาดหรืออัปเกรดยุ้งฉาง'); return 0; } S.inv[id] = (S.inv[id] || 0) + k; return k; }

// ---------------- simulation ----------------
function update(dt) {
  if (!update.nd) { S.en = Math.max(0, S.en - dt * energyRate()); if (S.en < TIRED && !S.tiredWarn) { S.tiredWarn = 1; toast('😮‍💨 เริ่มเหนื่อยแล้ว กลับไปพักที่บ้านได้นะ'); } else if (S.en >= TIRED + 10) S.tiredWarn = 0; }
  S.t += dt; S.dayT += dt; { const L = dayLen(); while (S.dayT >= L) { S.dayT -= L; S.dayN++; } }
  const sp = S.u.sprinkler ? 1.5 : 1;
  for (const p of S.plots) if (p.c) { if (S.u.sprinkler) p.w = 1; p.p = Math.min(CROPS[p.c].sec, p.p + dt * (p.w ? 1.5 : 1) * (p.f ? 1.35 : 1)); }
  for (const a of S.pen) {
    let left = dt;
    while (left > 0 && a.st !== 'ready') {
      if (a.st === 'idle') {
        const bg = ANIMALS[a.a].bags || 1;
        if ((S.feed2 || 0) < bg && S.feed < bg && S.u.feeder && S.money >= FEED_PRICE * 5) { S.money -= FEED_PRICE * 5; S.feed += 5; }
        if ((S.feed2 || 0) >= bg) { S.feed2 -= bg; a.st = 'prod'; a.t = 0; a.pf = 1; } else if (S.feed >= bg) { S.feed -= bg; a.st = 'prod'; a.t = 0; a.pf = 0; } else break;
      }
      const secN = ANIMALS[a.a].sec * (a.pf ? 0.7 : 1), need = secN - a.t;
      if (left >= need) { left -= need; a.st = 'ready'; a.t = secN; } else { a.t += left; left = 0; }
    }
  }
  for (const f of S.pond) if (f.f) f.p = Math.min(FISH[f.f].sec, f.p + dt);
  if (S.job) { S.job.t += dt; }
  // a new farm day: the bank pays 1 % interest
  while (S.bankDay < day()) { S.bankDay++; S.bank = Math.min(200000, Math.round(S.bank * 1.01)); }
}
const cropReady = p => p.c && p.p >= CROPS[p.c].sec;
const fishReady = f => f.f && f.p >= FISH[f.f].sec;
const jobReady = () => S.job && S.job.t >= RECIPES.find(r => r.id === S.job.id).sec;
function readyCount() { return S.plots.filter(cropReady).length + S.pen.filter(a => a.st === 'ready').length + S.pond.filter(fishReady).length; }

// ---------------- actions ----------------
function plant(i) {
  const p = S.plots[i], c = CROPS[S.sel]; if (!p || p.c) return;
  if (c.lv > S.lvl) { toast(`ต้องเลเวล ${c.lv} ถึงปลูก${c.n}ได้`); return; }
  if ((S.seeds[S.sel] || 0) > 0) S.seeds[S.sel]--; else if (!spend(seedUnit(S.sel))) return;
  p.c = S.sel; p.p = 0; p.w = S.u.sprinkler ? 1 : 0; p.f = 0; if (S.autoFert && (S.fert || 0) > 0) { S.fert--; p.f = 1; } sfx(520);
}
function harvestPlot(i) {
  const p = S.plots[i]; if (!cropReady(p)) return false;
  if (!addItem(p.c, 1)) return false; gainXp(Math.max(2, Math.round(CROPS[p.c].sell * XPF / 4))); p.c = null; p.p = 0; p.w = 0; p.f = 0; sfx(700); return true;
}
function collectAnimal(i) { const a = S.pen[i]; if (a.st !== 'ready') return false; const pr = ANIMALS[a.a].prod; if (!addItem(pr, 1)) return false; gainXp(Math.max(2, Math.round(ITEMS[pr].base * XPF / 6))); a.st = 'idle'; a.t = 0; sfx(640); return true; }
function harvestFish(i) { const f = S.pond[i]; if (!fishReady(f)) return false; if (!addItem(f.f, 1)) return false; gainXp(Math.max(2, Math.round(FISH[f.f].sell * XPF / 4))); S.pond.splice(i, 1); sfx(600); return true; }
function sell(id, n) { n = Math.min(n, S.inv[id] || 0); if (n <= 0) return 0; const g = Math.round(price(id) * n); S.inv[id] -= n; if (!S.inv[id]) delete S.inv[id]; S.money += g; S.stats.earned += g; ledAdd(g, n); gainXp(Math.ceil(g * XPF / 40)); sfx(880); return g; }
function sfx(f) { try { const A = sfx.ctx || (sfx.ctx = new (window.AudioContext || window.webkitAudioContext)()), o = A.createOscillator(), g = A.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.value = 0.05; o.connect(g); g.connect(A.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + 0.14); o.stop(A.currentTime + 0.15); } catch (e) { } }

// upgrades: the 10 things money is for (1-4 are the core buys: seeds, animals, fish, feed)
const UPS = [
  { k: 'pen', n: 'ขยายคอกสัตว์', i: '🐔', max: 9, cost: [107, 300, 600, 1100, 1700, 2400, 3300, 4400, 5600], desc: l => `คอกกว้างขึ้น จุสัตว์ ${PENS[l]} → ${PENS[l + 1]} ตัว` },
  { k: 'pond', n: 'ขยายบ่อปลา', i: '🐟', max: 4, cost: [93, 267, 693, 1600], desc: l => `ปล่อยปลาได้ ${PONDS[l]} → ${PONDS[l + 1]} ตัว` },
  { k: 'barn', n: 'ขยายยุ้งฉาง', i: '🏚️', max: 4, cost: [53, 160, 427, 1067], desc: l => `เก็บของได้ ${BARNS[l]} → ${BARNS[l + 1]} ชิ้น` },
  { k: 'sprinkler', n: 'ระบบสปริงเกอร์อัตโนมัติ', i: '💦', max: 1, cost: [320], desc: () => 'รดน้ำทุกแปลงให้เอง ผักโตเร็วขึ้น 1.5 เท่า' },
  { k: 'feeder', n: 'เครื่องให้อาหารอัตโนมัติ', i: '⚙️', max: 1, cost: [400], desc: () => 'อาหารสัตว์หมดแล้วซื้อเติมให้เอง ไม่ต้องกลับมาเช็ค' },
  { k: 'work', n: 'โรงงานแปรรูป', i: '🏭', max: 1, cost: [400], lv: 4, desc: () => 'ทำซุป แยม ชีส พาย ขายได้มากกว่าวัตถุดิบ ~8%' },
  { k: 'truck', n: 'รถกระบะส่งของ', i: '🚚', max: 2, cost: [933, 2400], lv: 6, desc: l => `ราคาขายทุกอย่าง +${l ? 8 : 4}%` },
];
const penGroups = () => { const m = {}; S.pen.forEach(a => { (m[a.a] = m[a.a] || []).push(a); }); return Object.keys(ANIMALS).filter(k => m[k]).map(k => [k, m[k]]); };
function penUpCard() {
  const l = S.u.pen, u = UPS.find(x => x.k === 'pen'); if (l >= u.max) return `<div class="card" style="grid-template-columns:46px 1fr"><div class="ci">🏡</div><div><h4>คอกใหญ่สุดแล้ว</h4><p>จุสัตว์ได้ ${PENS[l]} ตัว</p></div></div>`;
  return `<div class="card"><div class="ci">🏡</div><div><h4>ขยายคอกสัตว์ (ระดับ ${l + 1}/${u.max + 1})</h4><p>คอกกว้างขึ้น จุสัตว์ ${PENS[l]} → ${PENS[l + 1]} ตัว</p></div><button class="btn" data-a="up" data-v="pen" ${S.money >= u.cost[l] ? '' : 'disabled'}>${fmt(u.cost[l])} ฿</button></div>`;
}
function buyUp(k) {
  const u = UPS.find(x => x.k === k), l = S.u[k]; if (l >= u.max) return; if (u.lv && S.lvl < u.lv) { toast(`ต้องเลเวล ${u.lv}`); return; }
  if (k === 'pen') { const n = penDims(l + 1); if (S.plots.some((p, i) => { const q = plotPos(i); return q.x > n.x0 - 1.9 && q.x < n.x1 + 1.9 && q.z > n.z0 - 1.9 && q.z < n.z1 + 1.9; })) { toast('มีแปลงผักอยู่ในพื้นที่ขยายคอก ย้ายแปลงออกก่อนนะ'); return; } }
  if (!spend(u.cost[l])) return; S.u[k]++; sfx(900); toast(`${u.i} ${u.n} สำเร็จ!`);
  build3d();
}
function buyDeco(id) { const d = DECOS.find(x => x.id === id); if (S.deco[id]) return; if (!spend(d.price)) return; S.deco[id] = 1; sfx(900); toast(`${d.i} ${d.n} ตกแต่งฟาร์มแล้ว ชื่อเสียง +0.3%`); build3d(); }
const hhmm = h => { const m = Math.floor(h * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
// lights out: the screen fades, the farm keeps running for the hours you sleep (crops grow, animals produce), then it is morning
function doSleep(kind) {
  const h = hourNow(); let hrs = 1;
  if (kind === 'night') { if (!(h >= 19 || h < 5)) { toast('ยังไม่ง่วง นอนข้ามคืนได้ตั้งแต่ 19:00 (งีบ 1 ชั่วโมงได้ทุกเวลา)'); return; } hrs = (6.5 - h + 24) % 24; }
  closeSheet();
  let ov = $('sleepov'); if (!ov) { ov = document.createElement('div'); ov.id = 'sleepov'; ov.style.cssText = 'position:absolute;inset:0;z-index:60;background:#02030a;color:#cfd8ff;display:flex;align-items:center;justify-content:center;font-size:26px;opacity:0;pointer-events:none;transition:opacity .9s;text-align:center;padding:20px'; $('app').appendChild(ov); }
  ov.textContent = kind === 'night' ? '💤 กำลังนอนหลับ...' : '😴 งีบหลับ...'; ov.style.pointerEvents = 'auto'; ov.style.opacity = '1';
  setTimeout(() => {
    const before = readyCount(); update.nd = 1; update(hrs / 24 * dayLen()); update.nd = 0; S.en = kind === 'night' ? 100 : Math.min(100, S.en + 25); LT.key = ''; save();
    const nw = readyCount() - before; toast(kind === 'night' ? `☀️ ตื่นแล้ว สดชื่นเต็มที่ (${hhmm(hourNow())})` : `😴 งีบเสร็จ พลังงาน +25 (${hhmm(hourNow())})`); if (nw > 0) setTimeout(() => toast(`ระหว่างพัก มีผลผลิตพร้อมเก็บ ${nw} อย่าง`), 900);
    ov.style.opacity = '0'; setTimeout(() => { ov.style.pointerEvents = 'none'; }, 950); hud();
  }, 1300);
}
function deposit(n) { n = Math.min(n, S.money); if (n <= 0) return; S.money -= n; S.bank += n; sfx(500); }
function withdraw(n) { n = Math.min(n, S.bank); if (n <= 0) return; S.bank -= n; S.money += n; sfx(500); }

// ---------------- vegetable beds: buy up to 40, place them anywhere ----------------
const OLDPOS = j => ({ x: LAY.plotX[j % 4], z: j < 16 ? LAY.plotZ - Math.floor(j / 4) * LAY.plotDz : 17 + Math.floor((j - 16) / 4) * LAY.plotDz });
let _grid = null;
const slotGrid = () => { if (_grid) return _grid; _grid = []; for (let x = BOUND.x0 + 3; x <= BOUND.x1 - 3; x += 2.2) for (let z = 14; z <= BOUND.z1 - 3; z += 2.2) _grid.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 }); _grid.sort((a, b) => Math.hypot(a.x, a.z - 26) - Math.hypot(b.x, b.z - 26)); return _grid; };
const DEFPOS = j => j < PLOT_SOFT ? OLDPOS(j) : (slotGrid()[j - PLOT_SOFT] || OLDPOS(j));   // the first 40 beds sit exactly where they always did   // the tidy default rows (the first 16 are where they always were)
const plotPos = i => { const p = S && S.plots[i]; return p && typeof p.x === 'number' && typeof p.z === 'number' ? { x: p.x, z: p.z } : DEFPOS(i); };
const overlapPlot = (x, z, ign) => S.plots.some((p, i) => { if (i === ign) return false; const q = plotPos(i); return Math.abs(q.x - x) < 2.15 && Math.abs(q.z - z) < 2.15; });
function nextSlot() {
  for (let j = 0; j < PLOT_SOFT; j++) { const d = OLDPOS(j); if (!overlapPlot(d.x, d.z, -1) && !plotSpotErr(d.x, d.z, -1)) return d; }
  for (const d of slotGrid()) if (!overlapPlot(d.x, d.z, -1) && !plotSpotErr(d.x, d.z, -1)) return d;
  return null;
}
function plotPackCost(n) { let sum = 0; for (let k = 0; k < n; k++) sum += plotPrice(S.plots.length + k); const w = plotWin(day()), pk = PLOT_PROMO.packs.find(x => x[0] === n), cut = w.on && pk ? Math.round(sum * pk[1]) : 0; return { sum, cut, pay: sum - cut }; }
function buyPlots(n, manual) {
  if (PLC) { toast('วางแปลงที่ซื้อไว้ให้เสร็จก่อน'); return; }
  if (S.plots.length + n > PLOT_MAX) { toast(`แปลงเต็มแล้ว (${PLOT_MAX} แปลง)`); return; }
  const c = plotPackCost(n); if (S.money < c.pay) { toast('เงินไม่พอ'); return; }
  const slots = []; for (let k = 0; k < n; k++) { const d = nextSlot(); if (!d && !manual) { NOSLOT = true; toast('ไม่มีที่ว่างให้วางแปลงอัตโนมัติแล้ว ฟาร์มเต็ม (ลอง ➕ ซื้อ 1 แปลง แล้ววางเอง ในจุดที่ยังว่าง)'); return; } slots.push(d || DEFPOS(S.plots.length)); S.plots.push({ c: null, p: 0, w: S.u.sprinkler ? 1 : 0, f: 0, x: slots[k].x, z: slots[k].z }); }
  S.money -= c.pay; sfx(900);
  if (manual) { const i = S.plots.length - 1; S.plots[i].un = 1; S.plots[i].paid = c.pay; build3d(); closeSheet(); startPlace(i, 'new'); return; }
  toast(`🌱 ได้แปลงเพิ่ม ${n} แปลง${c.cut ? ' (โปรลด ' + fmt(c.cut) + ' ฿)' : ''} · รวม ${S.plots.length} แปลง`); build3d();
}
// can a bed stand here? (inside the farm, off the roads, clear of buildings, the pen, the pond, trees and other beds)
function plotSpotErr(x, z, ign) {
  if (x < BOUND.x0 + 1.4 || x > BOUND.x1 - 1.4 || z < BOUND.z0 + 1.4 || z > BOUND.z1 - 1.4) return 'อยู่นอกพื้นที่ฟาร์ม';
  if (overlapPlot(x, z, ign)) return 'ชนแปลงอื่น';
  for (const [dx, dz] of [[0, 0], [1.05, 0], [-1.05, 0], [0, 1.05], [0, -1.05], [1.05, 1.05], [-1.05, 1.05], [1.05, -1.05], [-1.05, -1.05]]) {
    const px = x + dx, pz = z + dz;
    if (nearRoad(px, pz, 1.3)) return 'ติดถนน';
    if (!baseFree(px, pz)) return 'ทับอาคาร คอก บ่อ หรือบ้าน';
    for (const c of COL) { if (c.t === 'c') { if (Math.hypot(px - c.x, pz - c.z) < c.r + 0.1) return 'ชนสิ่งก่อสร้างหรือต้นไม้'; } else if (px > c.x - c.hw - 0.1 && px < c.x + c.hw + 0.1 && pz > c.z - c.hd - 0.1 && pz < c.z + c.hd + 0.1) return 'ชนสิ่งก่อสร้างหรือรั้ว'; }
  }
  return '';
}
let PLC = null, PICK = false, plcBar = null, plcOv = null, NOSLOT = false;
const snap5 = v => Math.round(v * 2) / 2;
function plcUI() {
  if (plcBar) return plcBar;
  plcBar = document.createElement('div'); plcBar.id = 'plcbar'; plcBar.className = 'panel'; plcBar.hidden = true;
  plcBar.innerHTML = '<div id="plctxt"></div><div class="row"><button class="btn" data-a="plcok" id="plcok">✅ วางที่นี่ (E)</button><button class="btn ghost" data-a="plcno">ยกเลิก</button></div>';
  $('app').appendChild(plcBar); return plcBar;
}
function startPlace(i, mode) {
  const o = plotObjs[i]; if (!o) return; PICK = false; const q = plotPos(i);
  PLC = { i, mode, old: { x: q.x, z: q.z }, x: q.x, z: q.z, err: '' };
  if (!plcOv) { plcOv = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ color: 0x44ff66, transparent: true, opacity: 0.4, depthWrite: false })); plcOv.rotation.x = -Math.PI / 2; plcOv.position.y = 0.34; }
  o.g.add(plcOv); plcUI(); toast(mode === 'new' ? 'เดินไปยังจุดที่ต้องการ แปลงจะตามอยู่ข้างหน้า สีเขียว = วางได้' : `ย้ายแปลง ${i + 1}: เดินไปยังจุดใหม่ แล้วกด วางที่นี่`);
}
function placeStep() {
  const bar = plcUI(); bar.hidden = !(PLC || PICK) || !!tab;
  if (!PLC) { if (PICK) $('plctxt').textContent = '✋ โหมดย้ายแปลง: เดินไปใกล้แปลงที่ต้องการ แล้วกดปุ่มกลมเพื่อหยิบ'; $('plcok').style.display = 'none'; return; }
  $('plcok').style.display = '';
  PLC.x = snap5(Math.max(BOUND.x0 + 1.4, Math.min(BOUND.x1 - 1.4, P.x + Math.sin(P.rot) * 2.8))); PLC.z = snap5(Math.max(BOUND.z0 + 1.4, Math.min(BOUND.z1 - 1.4, P.z + Math.cos(P.rot) * 2.8)));
  if (PLC.x !== PLC.lx || PLC.z !== PLC.lz) { PLC.lx = PLC.x; PLC.lz = PLC.z; PLC.err = plotSpotErr(PLC.x, PLC.z, PLC.i); }
  const o = plotObjs[PLC.i]; if (!o) { PLC = null; return; }
  if (plcOv.parent !== o.g) o.g.add(plcOv);
  o.g.position.set(PLC.x, 0, PLC.z); plcOv.material.color.set(PLC.err ? 0xff4444 : 0x44ff66);
  $('plctxt').textContent = PLC.err ? '⛔ วางตรงนี้ไม่ได้: ' + PLC.err : `✅ วางแปลง ${PLC.i + 1} ตรงนี้ได้ · เดินเพื่อเลื่อน`;
}
function plcEnd() { if (plcOv && plcOv.parent) plcOv.parent.remove(plcOv); PLC = null; PICK = false; if (plcBar) plcBar.hidden = true; }
// ---------------- sheets ----------------
let tab = null;
const A = {};
Object.assign(A, {
  buyplots: d => buyPlots(+d.n || 1, false), buyplotm: () => buyPlots(1, true),
  pickmode: () => { if (PLC) return; PICK = true; closeSheet(); toast('✋ โหมดย้ายแปลง: เดินไปใกล้แปลงที่ต้องการ แล้วกดปุ่มกลม'); },
  plcok: () => {
    if (!PLC) { PICK = false; return; }
    PLC.err = plotSpotErr(PLC.x, PLC.z, PLC.i); if (PLC.err) { toast('วางตรงนี้ไม่ได้: ' + PLC.err); return; }
    const p = S.plots[PLC.i], mode = PLC.mode; p.x = PLC.x; p.z = PLC.z; delete p.un; delete p.paid; plcEnd(); sfx(700); toast(mode === 'new' ? '🌱 วางแปลงใหม่แล้ว' : '✅ ย้ายแปลงแล้ว'); save();
  },
  plcno: () => {
    if (!PLC) { PICK = false; plcEnd(); return; }
    const i = PLC.i, p = S.plots[i], mode = PLC.mode, old = PLC.old; plcEnd();
    if (mode === 'new') { S.money += p.paid || 0; S.plots.splice(i, 1); toast('ยกเลิก คืนเงินแล้ว'); build3d(); } else { const o = plotObjs[i]; if (o) o.g.position.set(old.x, 0, old.z); }
  },
  plotreset: () => { if (PLC) return; if (!confirm('จัดแปลงทั้งหมดกลับเป็นแถวมาตรฐาน?')) return; S.plots.forEach(p => { p.x = 9999; p.z = 9999; delete p.un; delete p.paid; }); S.plots.forEach(p => { const d = nextSlot(); if (d) { p.x = d.x; p.z = d.z; } }); S.plots.forEach(p => { if (p.x === 9999) { delete p.x; delete p.z; } }); NOSLOT = false; build3d(); toast('จัดแปลงเป็นแถวมาตรฐานแล้ว'); },
});

function openTab(t) { tab = t; $('sheet').hidden = false; document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === t)); render(); }
function closeSheet() { tab = null; $('sheet').hidden = true; document.querySelectorAll('#nav button').forEach(b => b.classList.remove('on')); }
const lock = lv => (lv > S.lvl ? ' lock' : '');
// ---------------- seed list, market (sell / buy / price board) ----------------
let farmF = 'all', shopF = 'all', mktTab = 'sell';
const NOTE = 'style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim);line-height:1.45"';
const growT = sec => (sec >= 60 ? Math.round(sec / 60 * 10) / 10 + ' นาที' : sec + ' วิ');
const chip = (act, v, label, on) => `<button class="btn${on ? '' : ' ghost'}" style="flex:1;min-width:0;padding:7px 6px;font-size:13px" data-a="${act}" data-v="${v}">${label}</button>`;
const cropList = f => Object.keys(CROPS).filter(k => f === 'veg' ? CROPS[k].k === 'veg' : f === 'fruit' ? CROPS[k].k === 'fruit' : f === 'stock' ? (S.seeds[k] || 0) > 0 : true).sort((a, b) => (CROPS[a].lv > S.lvl) - (CROPS[b].lv > S.lvl));
const FILT = [['all', 'ทั้งหมด'], ['veg', '🥕 ผัก'], ['fruit', '🍎 ผลไม้'], ['stock', '🎒 มีในคลัง']];
function farmHTML() {
  const empty = S.plots.filter(p => !p.c).length, rd = S.plots.filter(cropReady).length, list = cropList(farmF);
  const w = plotWin(day()), n0 = S.plots.length, full = n0 >= PLOT_MAX, pk = PLOT_PROMO.packs;
  const packBtn = n => { const c = plotPackCost(n), ok = !full && n0 + n <= PLOT_MAX && S.money >= c.pay; return `<button class="btn${n === 1 ? ' ghost' : ''}" style="min-width:0;padding:8px 4px" data-a="buyplots" data-n="${n}" ${ok ? '' : 'disabled'}>ซื้อ ${n} แปลง<br><small>${c.cut ? `<s>${fmt(c.sum)}</s> ` : ''}${fmt(c.pay)} ฿${c.cut ? ` · ลด ${fmt(c.cut)}` : ''}</small></button>`; };
  const promoTxt = w.on ? `<b class="up">🎁 โปรแปลงผัก: ซื้อ 3 แปลง ลด ${fmt(plotPackCost(3).cut)} ฿ · ซื้อ 5 แปลง ลด ${fmt(plotPackCost(5).cut)} ฿ · วันที่ ${w.from}–${w.to} (เหลือ ${w.to - day() + 1} วัน)</b><br>หมดโปรแล้วกลับเป็นราคาปกติ` : `<small>🎁 โปรรอบหน้า: ซื้อ 3 แปลง ลด ${Math.round(pk[0][1] * 100)}% · ซื้อ 5 แปลง ลด ${Math.round(pk[1][1] * 100)}% · วันที่ ${w.from}–${w.to} (ตอนนี้ราคาปกติ)</small>`;
  let h = `<h5>🧱 แปลงของคุณ ${n0} แปลง${full ? ' · เต็มแล้ว' : NOSLOT ? ` · ฟาร์มเต็ม วางเองได้เฉพาะจุดว่าง · แปลงถัดไป ${fmt(plotPrice(n0))} ฿` : ` · แปลงถัดไป ${fmt(plotPrice(n0))} ฿`}</h5>
  <div class="card" style="grid-template-columns:46px 1fr"><div class="ci">🎁</div><div><p>${promoTxt}<br>ราคาแปลงเพิ่มทีละนิด ตั้งแต่ ${plotPrice(PLOT_START)} ฿ (แปลงที่ 40 ราคา ${plotPrice(40)} ฿) ราคาขึ้นช้าๆ และหยุดที่ 160 ฿ ซื้อได้ไม่จำกัดจนกว่าฟาร์มจะเต็ม · ปลูกได้ทั้งผักและผลไม้ทุกชนิด</p></div></div>
  <div class="row">${packBtn(1)}${packBtn(3)}${packBtn(5)}</div>
  <div class="row"><button class="btn ghost" data-a="buyplotm" ${!full && S.money >= plotPrice(n0) ? '' : 'disabled'}>➕ ซื้อ 1 แปลง แล้ววางเอง</button><button class="btn ghost" data-a="pickmode">✋ ย้ายแปลง</button><button class="btn ghost" data-a="plotreset">↺ จัดแถวมาตรฐาน</button></div>
  <h5>🌱 ปลูก</h5><div class="row"><button class="btn" data-a="plantall" ${empty && canPlant(S.sel) ? '' : 'disabled'}>ปลูกทั้งหมด (${empty} แปลงว่าง)</button><button class="btn ghost" data-a="harvall" ${rd ? '' : 'disabled'}>เก็บเกี่ยวทั้งหมด (${rd})</button></div>
  <div class="row"><button class="btn ghost" data-a="autofert">🧪 ใส่ปุ๋ยตอนปลูก: ${S.autoFert ? 'เปิด' : 'ปิด'} · มี ${S.fert || 0} กระสอบ</button><button class="btn ghost" data-a="tab" data-v="market" data-m="buy">🛒 ซื้อเมล็ด/ปุ๋ย</button></div>
  <p ${NOTE}>เลือกเมล็ดพันธุ์ แล้วแตะแปลงเพื่อปลูก (แตะแปลงที่กำลังโตเพื่อรดน้ำ) · เมล็ดที่ซื้อเก็บไว้ในคลังปลูกได้ฟรี ถ้าไม่มีจะหักเงินตอนปลูก</p><div class="row">${FILT.map(([k, t]) => chip('farmf', k, t, farmF === k)).join('')}</div>`;
  h += list.map(k => {
    const c = CROPS[k], sel = S.sel === k, st = S.seeds[k] || 0, off = dealFor('seed', k), u = seedUnit(k);
    return `<div class="card${lock(c.lv)}"><div class="ci">${c.i}</div><div><h4>${c.n}${sel ? '<span class="pill">เลือกอยู่</span>' : ''}${st ? `<span class="pill">🎒 ×${st}</span>` : ''}</h4><p>เมล็ด ${u} ฿${off ? ` <b class="up">🔥 −${Math.round(off * 100)}%</b>` : ''} · โต ${growT(c.sec)} · ขาย ~${price(k)} ฿ <span class="${trend(k) >= 0 ? 'up' : 'down'}">${trend(k) >= 0 ? '▲' : '▼'}</span></p></div>${c.lv > S.lvl ? `<span class="pill">🔒 Lv.${c.lv}</span>` : `<button class="btn${sel ? ' ghost' : ''}" data-a="sel" data-v="${k}">${sel ? '✓' : 'เลือก'}</button>`}</div>`;
  }).join('') || '<p style="color:var(--ink-dim)">ยังไม่มีเมล็ดในคลัง ซื้อได้ที่ 🏪 ตลาด แท็บ 🛒 ซื้อ</p>';
  return h;
}
function sellHTML() {
  const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0), val = ids.reduce((a, k) => a + price(k) * S.inv[k], 0), goodIds = ids.filter(isGood), goodVal = goodIds.reduce((a, k) => a + price(k) * S.inv[k], 0);
  const led = S.led && S.led.d === day() ? S.led : { v: 0, n: 0 };
  let h = `<p ${NOTE}>ราคาเปลี่ยนทุกวันของฟาร์ม (วันที่ ${day()}) · โบนัสรถกระบะ/ชื่อเสียง ${Math.round((bonus() - 1) * 1000) / 10}% · ยุ้งฉาง ${used()}/${cap()}</p>
  <div class="card" style="grid-template-columns:46px 1fr"><div class="ci">📊</div><div><h4>วันนี้ขายได้ ${fmt(led.v)} ฿ <span class="pill">${led.n} ชิ้น</span></h4><p>${S.hist.length ? 'ย้อนหลัง: ' + S.hist.slice(0, 4).map(x => `วันที่ ${x.d} · ${fmt(x.v)} ฿`).join(' | ') : 'ยังไม่มีประวัติย้อนหลัง'}<br>ขายไปทั้งหมด ${fmt(S.stats.earned)} ฿</p></div></div>
  <div class="row"><button class="btn" data-a="sellall" ${ids.length ? '' : 'disabled'}>ขายทั้งหมด ≈ ${fmt(val)} ฿</button><button class="btn ghost" data-a="sellgood" ${goodIds.length ? '' : 'disabled'}>🔥 ขายเฉพาะราคาดี ≈ ${fmt(goodVal)} ฿</button></div>`;
  if (!ids.length) return h + '<p style="color:var(--ink-dim)">ยุ้งฉางว่าง ไปเก็บเกี่ยวผลผลิตก่อนนะ</p>';
  for (const [cat, ic] of CATS) {
    const items = ids.filter(k => catOf(k) === cat); if (!items.length) continue;
    const sub = items.reduce((a, k) => a + price(k) * S.inv[k], 0), n = items.reduce((a, k) => a + S.inv[k], 0);
    h += `<h5>${ic} ${cat} · ${n} ชิ้น ≈ ${fmt(sub)} ฿</h5><div class="row"><button class="btn ghost" data-a="sellcat" data-v="${cat}">ขายทั้งหมวด ${cat}</button></div>`;
    h += items.map(k => {
      const it = ITEMS[k], f = factor(k, day()), pc = Math.round((f - 1) * 100), tag = f >= 1.2 ? '<b class="up">🔥 ราคาดี</b>' : f < 1.08 ? '<b class="down">⏳ ราคาต่ำ</b>' : 'ราคาปกติ', t = trend(k);
      return `<div class="card"><div class="ci">${it.i}</div><div><h4>${it.n} ×${S.inv[k]}</h4><p>${price(k)} ฿/ชิ้น · ${tag} <span class="${t >= 0 ? 'up' : 'down'}">${t >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(t * 100))}%</span><br>รวม ≈ ${fmt(price(k) * S.inv[k])} ฿</p></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="sell" data-v="${k}" data-n="all">ขายหมด</button>${S.inv[k] > 10 ? `<button class="btn ghost" data-a="sell" data-v="${k}" data-n="10">ขาย 10</button>` : ''}${S.inv[k] > 1 ? `<button class="btn ghost" data-a="sell" data-v="${k}" data-n="1">ขาย 1</button>` : ''}</div></div>`;
    }).join('');
  }
  return h;
}
function shopHTML() {
  const deals = dealOf(day()), list = cropList(shopF);
  let h = `<p ${NOTE}>ซื้อเมล็ดและของใช้เก็บไว้ในคลังได้ · ซื้อ ×5 ลด 5% · ×20 ขึ้นไปลด 10% · โปรโมชั่นเปลี่ยนทุกวันของฟาร์ม</p><h5>🔥 โปรวันนี้ (วันที่ ${day()})</h5>`;
  h += deals.map(d => {
    if (d.t === 'seed') { const c = CROPS[d.id], lk = c.lv > S.lvl; return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${c.i}</div><div><h4>เมล็ด${c.n} <span class="pill">−${Math.round(d.off * 100)}%</span></h4><p>${seedUnit(d.id)} ฿/ถุง (ปกติ ${c.seed}) · มีในคลัง ${S.seeds[d.id] || 0}</p></div>${lk ? `<span class="pill">🔒 Lv.${c.lv}</span>` : `<button class="btn" data-a="buyseed" data-v="${d.id}" data-n="5" ${S.money >= seedCost(d.id, 5) ? '' : 'disabled'}>×5 · ${fmt(seedCost(d.id, 5))} ฿</button>`}</div>`; }
    const s = SUPPLY[d.id], lk = s.lv && s.lv > S.lvl; return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${s.i}</div><div><h4>${s.n} <span class="pill">−${Math.round(d.off * 100)}%</span></h4><p>${supplyUnit(d.id)} ฿ (ปกติ ${s.price}) · มีในคลัง ${S[d.id] || 0}</p></div>${lk ? `<span class="pill">🔒 Lv.${s.lv}</span>` : `<button class="btn" data-a="buysup" data-v="${d.id}" data-n="10" ${S.money >= supplyCost(d.id, 10) ? '' : 'disabled'}>×10 · ${fmt(supplyCost(d.id, 10))} ฿</button>`}</div>`;
  }).join('');
  h += '<h5>🧰 ของใช้ในฟาร์ม</h5>' + Object.keys(SUPPLY).map(k => {
    const s = SUPPLY[k], lk = s.lv && s.lv > S.lvl, off = dealFor(k, k);
    return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${s.i}</div><div><h4>${s.n}<span class="pill">มี ${S[k] || 0}</span></h4><p>${supplyUnit(k)} ฿/ชิ้น${off ? ` <b class="up">🔥 −${Math.round(off * 100)}%</b>` : ''} · ${s.d}${promoTag(k, k, 'ชิ้น')}</p></div>${lk ? `<span class="pill">🔒 Lv.${s.lv}</span>` : `<div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="buysup" data-v="${k}" data-n="10" ${S.money >= supplyCost(k, 10) ? '' : 'disabled'}>×10 · ${fmt(supplyCost(k, 10))} ฿</button><button class="btn ghost" data-a="buysup" data-v="${k}" data-n="50" ${S.money >= supplyCost(k, 50) ? '' : 'disabled'}>×50 · ${fmt(supplyCost(k, 50))} ฿</button></div>`}</div>`;
  }).join('');
  h += `<h5>🌱 เมล็ดพันธุ์ ${Object.keys(CROPS).length} ชนิด</h5><div class="row">${FILT.map(([k, t]) => chip('shopf', k, t, shopF === k)).join('')}</div>`;
  h += list.map(k => {
    const c = CROPS[k], lk = c.lv > S.lvl, off = dealFor('seed', k), st = S.seeds[k] || 0;
    return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${c.i}</div><div><h4>${c.n}${st ? `<span class="pill">🎒 ×${st}</span>` : ''}</h4><p>${seedUnit(k)} ฿/ถุง${off ? ` <b class="up">🔥 −${Math.round(off * 100)}%</b>` : ''} · โต ${growT(c.sec)} · ขาย ~${price(k)} ฿${promoTag('seed', k, 'ถุง')}</p></div>${lk ? `<span class="pill">🔒 Lv.${c.lv}</span>` : `<div style="display:flex;flex-direction:column;gap:4px">${[5, 10, 20].map(q => `<button class="btn${q === 5 ? '' : ' ghost'}" data-a="buyseed" data-v="${k}" data-n="${q}" ${S.money >= seedCost(k, q) ? '' : 'disabled'}>×${q} · ${fmt(seedCost(k, q))} ฿</button>`).join('')}</div>`}</div>`;
  }).join('') || '<p style="color:var(--ink-dim)">ไม่มีรายการ</p>';
  return h;
}
// price board: today's price of everything with how much a crop or fish earns per minute of growing
function boardHTML() {
  let h = `<p ${NOTE}>ราคารับซื้อวันนี้ของทุกอย่าง (วันที่ ${day()}) · "กำไร/นาที" = (ราคาขาย − ราคาเมล็ด/ลูกปลา) ÷ เวลาที่ใช้โต ใช้เลือกว่าปลูกอะไรคุ้ม</p>`;
  for (const [cat, ic] of CATS) {
    const ids = Object.keys(ITEMS).filter(k => catOf(k) === cat); if (!ids.length) continue;
    h += `<h5>${ic} ${cat}</h5>` + ids.map(k => {
      const it = ITEMS[k], c = CROPS[k] || FISH[k], t = trend(k), cost = c ? (c.seed || c.price) : 0, ppm = c ? Math.round((price(k) - cost) / (c.sec / 60) * 10) / 10 : 0, lk = c && c.lv > S.lvl;
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--line);font-size:13.5px;${lk ? 'opacity:.55' : ''}"><span style="font-size:20px;width:26px;text-align:center">${it.i}</span><span style="flex:1;min-width:0">${it.n}${lk ? ` <small>🔒 Lv.${c.lv}</small>` : ''}${c ? `<br><small style="color:var(--ink-dim)">กำไร ~${ppm} ฿/นาที</small>` : ''}</span><b>${price(k)} ฿</b><span class="${t >= 0 ? 'up' : 'down'}" style="width:48px;text-align:right">${t >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(t * 100))}%</span></div>`;
    }).join('');
  }
  return h;
}
function render() {
  if (!tab) return;
  const R = {
    farm() {
      $('stitle').textContent = '🌱 แปลงผัก';
      return farmHTML();
    },
    pen() {
      $('stitle').textContent = '🐔 สัตว์เลี้ยง';
      const rd = S.pen.filter(a => a.st === 'ready').length;
      return `<div class="row"><button class="btn" data-a="collall" ${rd ? '' : 'disabled'}>เก็บผลผลิตทั้งหมด (${rd})</button><button class="btn ghost" data-a="feed">ซื้ออาหาร ×10 (${supplyCost('feed', 10)} ฿)</button><button class="btn ghost" data-a="buysup" data-v="feed2" data-n="10" ${S.lvl >= SUPPLY.feed2.lv ? '' : 'disabled'}>⚡ อาหารเร่ง ×10 (${supplyCost('feed2', 10)} ฿)</button></div>
      <p class="dim" style="margin:0 2px 6px;font-size:12.5px;color:var(--ink-dim)">🌾 อาหารสัตว์ในคลัง ${S.feed} ถุง · ⚡ อาหารเร่ง ${S.feed2 || 0} ถุง (ผลิตเร็วขึ้น 30%) · สัตว์แต่ละตัวใช้อาหาร 1–3 ถุงต่อรอบผลิต ${S.u.feeder ? '· เครื่องให้อาหารอัตโนมัติทำงานอยู่' : ''}</p>
      <h5>สัตว์ในคอก ${S.pen.length}/${PENS[S.u.pen]} · ที่ว่าง ${PENS[S.u.pen] - S.pen.length}</h5>` + penUpCard() +
        (penGroups().map(([id, g]) => { const d = ANIMALS[id], rdy = g.filter(x => x.st === 'ready').length, hun = g.filter(x => x.st === 'idle').length; return `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n} ×${g.length}</h4><p>${rdy ? `<b class="up">พร้อมเก็บ ${rdy} ${ITEMS[d.prod].i}</b>` : hun === g.length ? '<b class="down">หิว! ไม่มีอาหาร</b>' : 'กำลังผลิต'}${hun && hun < g.length ? ` · <b class="down">หิว ${hun}</b>` : ''} · ${ITEMS[d.prod].n} ~${price(d.prod)} ฿</p></div><div style="display:flex;flex-direction:column;gap:4px">${rdy ? `<button class="btn" data-a="collsp" data-v="${id}">เก็บ ${rdy}</button>` : ''}<button class="btn ghost" data-a="sellsp" data-v="${id}">ขาย 1 ตัว</button></div></div>`; }).join('') || '<p>ยังไม่มีสัตว์</p>') +
        `<h5>ซื้อสัตว์ใหม่ (ซื้อได้เรื่อยๆ จนกว่าคอกจะเต็ม)</h5>` + Object.keys(ANIMALS).map(k => { const d = ANIMALS[k], room = PENS[S.u.pen] - S.pen.length; return `<div class="card${lock(d.lv)}"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>${d.price} ฿ · ใช้อาหาร ${d.bags} ถุง/รอบ · ${ITEMS[d.prod].i} ${ITEMS[d.prod].n} ทุก ${d.sec >= 60 ? Math.round(d.sec / 60 * 10) / 10 + ' นาที' : d.sec + ' วิ'}${promoTag('animal', k, 'ตัว')}</p></div>${d.lv > S.lvl ? `<span class="pill">🔒 Lv.${d.lv}</span>` : `<div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="buyan" data-v="${k}" ${room < 1 ? 'disabled' : ''}>ซื้อ 1 · ${d.price} ฿</button><button class="btn ghost" data-a="buyann" data-v="${k}" data-n="3" ${room < 3 ? 'disabled' : ''}>ซื้อ 3 · ${d.price * 3 - promoCut('animal', k, 3)} ฿</button><button class="btn ghost" data-a="buyann" data-v="${k}" data-n="10" ${room < 10 ? 'disabled' : ''}>ซื้อ 10 · ${d.price * 10 - promoCut('animal', k, 10)} ฿</button></div>`}</div>`; }).join('');
    },
    pond() {
      $('stitle').textContent = '🐟 บ่อปลา';
      const rd = S.pond.filter(fishReady).length;
      return `<div class="row"><button class="btn" data-a="fishall" ${rd ? '' : 'disabled'}>จับปลาทั้งหมด (${rd})</button></div><h5>ในบ่อ ${S.pond.length}/${PONDS[S.u.pond]}</h5>` +
        (S.pond.map((f, i) => { const d = FISH[f.f]; const left = Math.max(0, Math.ceil(d.sec - f.p)); return `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>${fishReady(f) ? '<b class="up">พร้อมจับ</b>' : `โตอีก ${left >= 60 ? Math.ceil(left / 60) + ' นาที' : left + ' วิ'}`} · ขาย ~${price(f.f)} ฿</p></div>${fishReady(f) ? `<button class="btn" data-a="fish" data-v="${i}">จับ</button>` : ''}</div>`; }).join('') || '<p style="color:var(--ink-dim)">บ่อยังว่าง ปล่อยลูกปลาด้านล่างได้เลย</p>') +
        `<h5>ปล่อยลูกปลา (เต็มบ่อเท่าที่เงินพอ แตะ 1 ครั้ง = 1 ตัว)</h5>` + Object.keys(FISH).map(k => { const d = FISH[k]; return `<div class="card${lock(d.lv)}"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>ลูกปลา ${d.price} ฿ · โต ${Math.round(d.sec / 60 * 10) / 10} นาที · ขาย ~${price(k)} ฿${promoTag('fish', k, 'ตัว')}</p></div>${d.lv > S.lvl ? `<span class="pill">🔒 Lv.${d.lv}</span>` : `<div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="buyfish" data-v="${k}">ปล่อย 1 · ${d.price} ฿</button><button class="btn ghost" data-a="buyfishn" data-v="${k}" data-n="5">ปล่อย 5 · ${d.price * 5 - promoCut('fish', k, 5)} ฿</button></div>`}</div>`; }).join('');
    },
    market() {
      $('stitle').textContent = '🏪 ตลาด';
      const tabs = [['sell', '💰 ขาย'], ['buy', '🛒 ซื้อ'], ['board', '📈 ราคา']].map(([k, t]) => chip('mkt', k, t, mktTab === k)).join('');
      return `<div class="row">${tabs}</div>` + (mktTab === 'buy' ? shopHTML() : mktTab === 'board' ? boardHTML() : sellHTML());
    },
    up() {
      $('stitle').textContent = '⭐ เอาเงินไปทำอะไรดี';
      const ups = UPS.map(u => { const l = S.u[u.k], done = l >= u.max, lk = u.lv && S.lvl < u.lv; return `<div class="card${lk ? ' lock' : ''}"><div class="ci">${u.i}</div><div><h4>${u.n}${l ? `<span class="pill">ระดับ ${l}</span>` : ''}</h4><p>${done ? 'สูงสุดแล้ว' : u.desc(l)}${lk ? ` · ต้องเลเวล ${u.lv}` : ''}</p></div>${done ? '<span class="pill">✓</span>' : lk ? `<span class="pill">🔒 Lv.${u.lv}</span>` : `<button class="btn" data-a="up" data-v="${u.k}" ${S.money >= u.cost[l] ? '' : 'disabled'}>${fmt(u.cost[l])} ฿</button>`}</div>`; }).join('');
      const decos = DECOS.map(d => `<div class="card"><div class="ci">${d.i}</div><div><h4>${d.n}</h4><p>ตกแต่งฟาร์ม · ชื่อเสียง +0.3% ราคาขาย${d.id === 'fountain' ? ' (+0.8%)' : ''}</p></div>${S.deco[d.id] ? '<span class="pill">✓ มีแล้ว</span>' : `<button class="btn" data-a="deco" data-v="${d.id}" ${S.money >= d.price ? '' : 'disabled'}>${fmt(d.price)} ฿</button>`}</div>`).join('');
      const tmc = `<div class="card"><div class="ci">🏠</div><div><h4>บ้านของคุณ</h4><p>พลังงาน ⚡ ${Math.round(S.en)} · นอนและพักผ่อนได้ที่นี่</p></div><button class="btn" data-a="tab" data-v="home">เปิด</button></div><h5>⏱️ ความเร็วเวลาในเกม</h5><div class="row">${Object.keys(TM).map(k => `<button class="btn${S.tm === k ? '' : ' ghost'}" data-a="tmode" data-v="${k}">${TM[k].n}<br><small>${TM[k].d}</small></button>`).join('')}</div><p style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim)">เวลากลางคืนมีดวงจันทร์และดาว ลากกล้องลงต่ำ ๆ จะเห็นท้องฟ้า · ผักและสัตว์โตตามเวลาจริงเหมือนเดิม ความเร็วนี้เปลี่ยนแค่ความยาวของ 1 วัน (ราคา ดอกเบี้ย โปรประจำวัน)</p>`;
      return tmc + `<p style="margin:0 2px 6px;font-size:12.5px;color:var(--ink-dim)">นอกจากซื้อเมล็ด สัตว์ ลูกปลา และอาหารสัตว์ เงินยังใช้ทำสิ่งเหล่านี้ได้</p><h5>อัปเกรดฟาร์ม</h5>${ups}<h5>🏦 ธนาคารสุขใจ (ดอกเบี้ย 1% ต่อวันของฟาร์ม)</h5>
      <div class="card"><div class="ci">🏦</div><div><h4>เงินฝาก ${fmt(S.bank)} ฿</h4><p>ฝากได้ไม่เกิน 200,000 ฿ ถอนได้ทุกเมื่อ</p></div></div>
      <div class="row"><button class="btn ghost" data-a="dep" data-v="1000" ${S.money >= 1 ? '' : 'disabled'}>ฝาก 1,000</button><button class="btn ghost" data-a="dep" data-v="all">ฝากทั้งหมด</button><button class="btn ghost" data-a="wd" data-v="all" ${S.bank ? '' : 'disabled'}>ถอนทั้งหมด</button></div>
      <h5>ตกแต่งฟาร์ม</h5>${decos}<h5>เซฟ · ช่อง ${slot}</h5><div class="row"><button class="btn ghost" data-a="copycode" data-v="${slot}">📋 คัดลอกรหัสเซฟ (สำรองไว้)</button></div><p style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim)">${online ? '☁️ เชื่อมต่อเซิร์ฟเวอร์ เซฟสำรองอัตโนมัติทุก 5 วินาที' : '📴 ไม่พบเซิร์ฟเวอร์ เซฟเก็บในเครื่องนี้'} · รหัสผู้เล่น: ${DEV}</p><div class="row"><button class="btn" data-a="savenow">💾 เซฟตอนนี้</button><button class="btn ghost" data-a="title">↩ เลือกช่องเซฟ</button></div>`;
    },
    work() {
      $('stitle').textContent = '🏭 โรงงานแปรรูป';
      if (!S.u.work) return '<p>ยังไม่มีโรงงาน ซื้อได้ที่แท็บ ⭐ อัปเกรด (เลเวล 4)</p>';
      const j = S.job, r = j && RECIPES.find(x => x.id === j.id);
      const cur = j ? `<div class="card"><div class="ci">${ITEMS[j.id].i}</div><div><h4>กำลังทำ ${ITEMS[j.id].n}</h4><p>${jobReady() ? '<b class="up">เสร็จแล้ว</b>' : `อีก ${Math.ceil(r.sec - j.t)} วิ`}</p></div>${jobReady() ? '<button class="btn" data-a="jobget">รับ</button>' : ''}</div>` : '';
      return cur + '<h5>สูตร (ทำได้ทีละอย่าง)</h5>' + RECIPES.map(r => { const ok = !S.job && Object.keys(r.in).every(k => (S.inv[k] || 0) >= r.in[k]); const cost = Object.keys(r.in).reduce((a, k) => a + ITEMS[k].base * r.in[k], 0); return `<div class="card"><div class="ci">${ITEMS[r.id].i}</div><div><h4>${ITEMS[r.id].n} <span class="pill">ขาย ~${price(r.id)} ฿</span></h4><p>ใช้ ${Object.keys(r.in).map(k => `${ITEMS[k].i}${ITEMS[k].n} ×${r.in[k]} (มี ${S.inv[k] || 0})`).join(' + ')} · ${r.sec} วิ · วัตถุดิบขายสด ~${fmt(cost)} ฿</p></div><button class="btn" data-a="mk" data-v="${r.id}" ${ok ? '' : 'disabled'}>ทำ</button></div>`; }).join('');
    },
    home() {
      $('stitle').textContent = '🏠 บ้านของคุณ';
      const e = Math.round(S.en), st = e >= 80 ? ['สดชื่น', '#7ccf5a', 'ได้ XP เพิ่ม 10%'] : e >= TIRED ? ['ปกติ', '#ffcf3f', 'พักเมื่อเริ่มล้าได้'] : ['อ่อนล้า', '#ff7a6a', 'เดินช้าลงและได้ XP น้อยลง 20% ควรพักเลย'];
      const h = hourNow(), canNight = h >= 19 || h < 5, ratio = used() / cap(), order = ['bed', ratio > 0.6 ? 'store' : 'cafe', ratio > 0.6 ? 'cafe' : 'store', 'vase'], rec = order.find(k => !S.home[k]);
      let o = `<p ${NOTE}>บ้านไว้พักผ่อน พลังงาน ⚡ ลดลงเรื่อย ๆ ตอนทำงาน ถ้าเหนื่อยจะเดินช้าลงและได้ XP น้อยลง กลับมานอนหรืองีบที่นี่เพื่อฟื้นพลังงาน ผักและสัตว์ยังโตระหว่างที่นอน</p>
      <div class="card" style="grid-template-columns:46px 1fr"><div class="ci">⚡</div><div><h4>พลังงาน ${e}/100 <span class="pill" style="color:${st[1]}">${st[0]}</span></h4><div class="bar" style="margin-top:6px"><i style="width:${e}%;background:${st[1]}"></i></div><p>${st[2]} · ตอนนี้ ${hhmm(h)}</p></div></div>
      <div class="row"><button class="btn" data-a="nap">😴 งีบ 1 ชั่วโมง (+25)</button><button class="btn${canNight ? '' : ' ghost'}" data-a="sleep">💤 นอนข้ามคืน</button></div>
      <p ${NOTE}>${canNight ? 'นอนข้ามคืนแล้วตื่น 06:30 พลังงานเต็ม' : 'นอนข้ามคืนได้ตั้งแต่ 19:00 ถึงตี 5 · งีบได้ทุกเวลา'}</p>
      <h5>🧰 ของในบ้านที่ควรมี (มีแค่ 4 อย่าง ซื้อเมื่อพร้อม)</h5>`;
      o += HOME_ITEMS.map(it => `<div class="card"><div class="ci">${it.i}</div><div><h4>${it.n}${rec === it.k ? '<span class="pill">✨ แนะนำ</span>' : ''}</h4><p>${it.d}${S.home[it.k] ? '' : ` · ${it.why}`}</p></div>${S.home[it.k] ? '<span class="pill">✓ มีแล้ว</span>' : `<button class="btn" data-a="homebuy" data-v="${it.k}" ${S.money >= it.price ? '' : 'disabled'}>${fmt(it.price)} ฿</button>`}</div>`).join('');
      if (S.home.cafe) o += `<div class="row"><button class="btn ghost" data-a="sip" ${S.en >= 95 ? 'disabled' : ''}>☕ ชงเครื่องดื่ม (5 ฿ · +25 พลังงาน)</button></div>`;
      return o;
    },
    barn() {
      $('stitle').textContent = '🏚️ ยุ้งฉาง';
      const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0), u = used(), c = cap(), pct = Math.round(u / c * 100), lvl = S.u.barn, val = ids.reduce((a, k) => a + price(k) * S.inv[k], 0);
      const col = pct >= 90 ? '#ff7a6a' : pct >= 70 ? '#ffcf3f' : '#7ccf5a', perRound = S.pen.reduce((a, x) => a + (ANIMALS[x.a].bags || 1), 0), rounds = perRound ? Math.floor(S.feed / perRound) : 0, upc = UPS.find(x => x.k === 'barn');
      const note = 'style="margin:0 2px 8px;font-size:12.5px;color:var(--ink-dim);line-height:1.45"';
      let h = `<p ${note}>ยุ้งฉางคือคลังของฟาร์ม ผักที่เก็บเกี่ยว ไข่ นม ปลา และของแปรรูปจะเข้ามาพักที่นี่ก่อนนำไปขาย ถ้าเต็มจะเก็บเกี่ยวเพิ่มไม่ได้ ราคาตลาดขึ้นลงทุกวัน เก็บไว้รอขายวันที่ราคาดีได้ อาหารสัตว์ก็เก็บที่นี่</p>
      <div class="card" style="grid-template-columns:46px 1fr"><div class="ci">🏚️</div><div><h4>ความจุ ${u}/${c} ชิ้น <span class="pill">ระดับ ${lvl + 1}</span></h4><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100, pct)}%;background:${col}"></i></div><p>${pct >= 90 ? '⚠️ เกือบเต็มแล้ว รีบขายหรืออัปเกรด' : pct >= 70 ? 'เริ่มแน่นแล้ว' : 'ยังมีที่ว่าง'} · ของในยุ้งมูลค่า ≈ ${fmt(val)} ฿</p></div></div>`;
      h += lvl < upc.max ? `<div class="card"><div class="ci">📦</div><div><h4>ขยายยุ้งฉาง</h4><p>${BARNS[lvl]} → ${BARNS[lvl + 1]} ชิ้น</p></div><button class="btn" data-a="up" data-v="barn" ${S.money >= upc.cost[lvl] ? '' : 'disabled'}>${fmt(upc.cost[lvl])} ฿</button></div>` : `<div class="card" style="grid-template-columns:46px 1fr"><div class="ci">📦</div><div><h4>ยุ้งฉางใหญ่สุดแล้ว</h4><p>เก็บของได้ ${c} ชิ้น</p></div></div>`;
      h += `<h5>🌾 อาหารสัตว์และของใช้ในยุ้ง</h5><p ${note}>⚡ อาหารเร่ง ${S.feed2 || 0} ถุง · 🧪 ปุ๋ย ${S.fert || 0} กระสอบ · 🎒 เมล็ดพันธุ์ ${Object.values(S.seeds || {}).reduce((a, b) => a + b, 0)} ถุง (ซื้อเพิ่มที่ตลาด)</p><div class="card"><div class="ci">🌾</div><div><h4>${S.feed} ถุง</h4><p>${S.pen.length ? `สัตว์ใช้ ${perRound} ถุงต่อรอบ · พอสำหรับ ≈ ${rounds} รอบ${S.u.feeder ? ' · เครื่องให้อาหารเติมให้เอง' : ''}` : 'ยังไม่มีสัตว์ในคอก'}</p></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="feed" ${S.money >= supplyCost('feed', 10) ? '' : 'disabled'}>×10 · ${supplyCost('feed', 10)} ฿</button><button class="btn ghost" data-a="feed50" ${S.money >= supplyCost('feed', 50) ? '' : 'disabled'}>×50 · ${supplyCost('feed', 50)} ฿</button></div></div>`;
      h += `<h5>📦 ผลผลิตในยุ้ง</h5>`;
      if (ids.length) {
        h += `<div class="row"><button class="btn" data-a="sellall">ขายทั้งหมด ≈ ${fmt(val)} ฿</button><button class="btn ghost" data-a="tab" data-v="market">🏪 ไปตลาด</button></div>`;
        h += ids.map(k => { const it = ITEMS[k], f = factor(k, day()), tip = f > 1.2 ? '<b class="up">🔥 ราคาดี ควรขาย</b>' : f < 1.08 ? '<b class="down">⏳ ราคาต่ำ รอก่อนได้</b>' : 'ราคาปกติ', rc = S.u.work ? RECIPES.filter(r => r.in[k]).map(r => `${ITEMS[r.id].i}${ITEMS[r.id].n} ได้ ${Math.floor(S.inv[k] / r.in[k])} ชุด`).filter(x => !/ 0 ชุด$/.test(x)).join(' · ') : '';
          return `<div class="card"><div class="ci">${it.i}</div><div><h4>${it.n} ×${S.inv[k]}</h4><p>${price(k)} ฿/ชิ้น · ${tip}${rc ? `<br>🏭 แปรรูปได้: ${rc}` : ''}</p></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn" data-a="sell" data-v="${k}" data-n="all">ขายหมด</button>${S.inv[k] > 1 ? `<button class="btn ghost" data-a="sell" data-v="${k}" data-n="1">ขาย 1</button>` : ''}</div></div>`; }).join('');
      } else h += '<p style="color:var(--ink-dim)">ยุ้งฉางว่างอยู่ ไปเก็บเกี่ยวผลผลิตจากแปลง คอก หรือบ่อปลาก่อนนะ</p>';
      return h;
    },
  };
  if (!R[tab]) return;
  const html = R[tab](); const b = $('sbody'), st = b.scrollTop; b.innerHTML = html; b.scrollTop = st;
}
Object.assign(A, {
  tab: d => { if (d.m) mktTab = d.m; openTab(d.v); }, close: closeSheet,
  nap: () => doSleep('nap'), sleep: () => doSleep('night'),
  sip: () => { if (S.en >= 95) { toast('ยังสดชื่นอยู่ ไว้ค่อยดื่มนะ'); return; } if (spend(5)) { S.en = Math.min(100, S.en + 25); sfx(660); toast('☕ ชื่นใจ พลังงาน +25'); } },
  homebuy: d => { const it = HOME_ITEMS.find(x => x.k === d.v); if (!it || S.home[it.k]) return; if (!spend(it.price)) return; S.home[it.k] = 1; sfx(900); toast(`${it.i} ${it.n} มาอยู่ในบ้านแล้ว`); build3d(); },
  tmode: d => { if (!TM[d.v] || d.v === S.tm) return; const fr = S.dayT / dayLen(); S.tm = d.v; S.dayT = fr * dayLen(); LT.key = ''; toast(`⏱️ เวลาในเกม: ${TM[d.v].n} (${TM[d.v].d})`); }, tipok: () => { $('tip').hidden = true; if (S) { S.tip = 1; save(); } },
  sel: d => { S.sel = d.v; toast(`เลือก ${CROPS[d.v].n} แตะแปลงว่างเพื่อปลูก`); },
  plantall: () => { let n = 0; S.plots.forEach((p, i) => { if (!p.c && canPlant(S.sel) && CROPS[S.sel].lv <= S.lvl) { plant(i); n++; } }); if (!n) toast('ปลูกไม่ได้ (เงินไม่พอหรือยังไม่ปลดล็อก)'); },
  harvall: () => { let n = 0; S.plots.forEach((p, i) => { if (harvestPlot(i)) n++; }); if (n) toast(`เก็บเกี่ยว ${n} แปลง`); },
  feed: () => buySupply('feed', 10), feed50: () => buySupply('feed', 50),
  buysup: d => buySupply(d.v, +d.n || 10), buyseed: d => buySeeds(d.v, +d.n || 5),
  mkt: d => { mktTab = d.v; }, farmf: d => { farmF = d.v; }, shopf: d => { shopF = d.v; }, autofert: () => { S.autoFert = S.autoFert ? 0 : 1; },
  sellcat: d => { let g = 0; for (const k of Object.keys(S.inv)) if (catOf(k) === d.v) g += sell(k, 1e9); if (g) toast(`ขาย${d.v} ได้ ${fmt(g)} ฿`); },
  sellgood: () => { let g = 0; for (const k of Object.keys(S.inv)) if (isGood(k)) g += sell(k, 1e9); if (g) toast(`ขายของราคาดี ได้ ${fmt(g)} ฿`); },
  buyan: d => { const a = ANIMALS[d.v]; if (S.pen.length >= PENS[S.u.pen]) { toast('คอกเต็ม ขยายคอกที่แท็บ ⭐'); return; } if (!spend(a.price)) return; S.pen.push({ a: d.v, st: 'idle', t: 0 }); sfx(600); build3d(); },
  buyann: d => { const n = +d.n || 3, a = ANIMALS[d.v]; if (S.pen.length + n > PENS[S.u.pen]) { toast(`คอกมีที่ไม่พอสำหรับ ${n} ตัว ขยายคอกที่แท็บ ⭐`); return; } if (!spend(a.price * n - promoCut('animal', d.v, n))) return; for (let k = 0; k < n; k++) S.pen.push({ a: d.v, st: 'idle', t: 0 }); sfx(600); build3d(); },
  buyfishn: d => { const n = +d.n || 5, f = FISH[d.v]; if (S.pond.length + n > PONDS[S.u.pond]) { toast(`บ่อมีที่ไม่พอสำหรับ ${n} ตัว ขยายบ่อที่แท็บ ⭐`); return; } if (!spend(f.price * n - promoCut('fish', d.v, n))) return; for (let k = 0; k < n; k++) S.pond.push({ f: d.v, p: 0 }); sfx(560); build3d(); },
  collsp: d => { let n = 0; S.pen.forEach((a, i) => { if (a.a === d.v && collectAnimal(i)) n++; }); if (n) toast(`เก็บผลผลิต ${n} ชิ้น`); },
  sellsp: d => { let j = -1; S.pen.forEach((a, i) => { if (a.a === d.v && a.st !== 'ready' && (j < 0 || S.pen[j].st !== 'idle' && a.st === 'idle')) j = i; }); if (j < 0) j = S.pen.findIndex(a => a.a === d.v); if (j >= 0) A.sellan({ v: j }); },
  sellan: d => { const a = S.pen[+d.v], g = Math.round(ANIMALS[a.a].price * 0.8); S.pen.splice(+d.v, 1); S.money += g; toast(`ขายสัตว์ได้ ${fmt(g)} ฿`); build3d(); },
  coll: d => { collectAnimal(+d.v); },
  collall: () => { let n = 0; S.pen.forEach((a, i) => { if (collectAnimal(i)) n++; }); if (n) toast(`เก็บผลผลิต ${n} ชิ้น`); },
  buyfish: d => { if (S.pond.length >= PONDS[S.u.pond]) { toast('บ่อเต็ม ขยายบ่อที่แท็บ ⭐'); return; } if (!spend(FISH[d.v].price)) return; S.pond.push({ f: d.v, p: 0 }); sfx(560); build3d(); },
  fish: d => { harvestFish(+d.v); build3d(); },
  fishall: () => { let n = 0; for (let i = S.pond.length - 1; i >= 0; i--) if (harvestFish(i)) n++; if (n) toast(`จับปลา ${n} ตัว`); build3d(); },
  sell: d => { const g = sell(d.v, d.n === 'all' ? 1e9 : (+d.n || 1)); if (g) toast(`ขายได้ ${fmt(g)} ฿`); },
  sellall: () => { let g = 0; for (const k of Object.keys(S.inv)) g += sell(k, 1e9); if (g) toast(`ขายทั้งหมด ได้ ${fmt(g)} ฿`); },
  up: d => buyUp(d.v), deco: d => buyDeco(d.v),
  dep: d => deposit(d.v === 'all' ? S.money : +d.v), wd: d => withdraw(d.v === 'all' ? S.bank : +d.v),
  mk: d => { const r = RECIPES.find(x => x.id === d.v); if (S.job || !Object.keys(r.in).every(k => (S.inv[k] || 0) >= r.in[k])) return; for (const k in r.in) { S.inv[k] -= r.in[k]; if (!S.inv[k]) delete S.inv[k]; } S.job = { id: r.id, t: 0 }; sfx(500); },
  jobget: () => { if (jobReady() && addItem(S.job.id, 1)) { gainXp(Math.round(ITEMS[S.job.id].base / 10)); S.job = null; sfx(800); } },
  savenow: () => { save(); toast(online ? '💾 เซฟแล้ว (เครื่อง + เซิร์ฟเวอร์)' : '💾 เซฟแล้ว (ในเครื่อง)'); },
  title: () => { save(); closeSheet(); showTitle(); },
  play: d => startGame(+d.v), del: d => { if (confirm(`ลบเซฟช่อง ${d.v}? ลบแล้วกู้คืนไม่ได้`)) { wipeSlot(+d.v); if (online) api('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: sid(+d.v), save: null }) }).catch(() => { }); renderTitle(); } },
  newgame: d => { const nm = (($('nm' + d.v) || {}).value || '').trim().slice(0, 14) || 'ชาวไร่'; startGame(+d.v, nm); },
  copycode: async d => { const n = +d.v || slot, data = S && slot === n ? S : await readSlot(n); if (!data) return; const t = encodeSave(data); try { await navigator.clipboard.writeText(t); toast('📋 คัดลอกรหัสเซฟแล้ว เก็บไว้ที่ไลน์/โน้ต ใช้นำเข้าเมื่อไหร่ก็ได้'); } catch (e) { prompt('คัดลอกรหัสเซฟนี้เก็บไว้ (กดค้างแล้วเลือกคัดลอก)', t); } },
  importcode: d => { const t = prompt('วางรหัสเซฟที่คัดลอกไว้ (ขึ้นต้นด้วย FARM2:)'); if (!t) return; const j = decodeSave(t); if (!j) { alert('รหัสเซฟไม่ถูกต้อง'); return; } writeSlot(+d.v, j); renderTitle(); },
  code: () => { const c = prompt('รหัสผู้เล่นของคุณ (จดไว้ใช้ย้ายเครื่อง) ใส่รหัสจากเครื่องเก่าเพื่อโหลดเซฟเดิม:', DEV); if (c && /^[A-Za-z0-9_-]{4,40}$/.test(c) && c !== DEV) { DEV = c; try { localStorage.setItem('raisukjai2-dev', c); } catch (e) { } renderTitle(); } },
});
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const f = A[b.dataset.a]; if (f) { f(b.dataset); if (S) { render(); hud(); queueSave(); } } });

// ---------------- HUD ----------------
function hud() {
  if (!S) return;
  $('money').textContent = fmt(S.money) + ' ฿'; $('lv').textContent = `${S.name} · Lv.${S.lvl} · ${S.en < TIRED ? '😮‍💨' : '⚡'}${Math.round(S.en)}`; $('xp').style.width = (S.lvl >= MAXLV ? 100 : S.xp / xpNeed(S.lvl) * 100) + '%';
  const m = Math.floor(hourNow() * 60), hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
  $('day').textContent = `วันที่ ${day()} · ${hh}:${mm}`; $('barn').textContent = `🏚️ ${used()}/${cap()} ›`;
  const c = CROPS[S.sel]; $('seedchip').textContent = `${c.i} ${c.n} ${(S.seeds[S.sel] || 0) > 0 ? '🎒×' + S.seeds[S.sel] : seedUnit(S.sel) + '฿'} ▾`;
  const n = readyCount(); $('harvest').hidden = !n; $('harvest').textContent = `🧺 เก็บทั้งหมด (${n})`;
  const rd = [S.plots.filter(cropReady).length, S.pen.filter(a => a.st === 'ready').length, S.pond.filter(fishReady).length];
  document.querySelectorAll('#nav button').forEach(b => { const k = { farm: 0, pen: 1, pond: 2 }[b.dataset.v]; let i = b.querySelector('i'); if (k != null && rd[k]) { if (!i) { i = document.createElement('i'); b.appendChild(i); } i.textContent = rd[k]; } else if (i) i.remove(); });
}
$('barn').style.cursor = 'pointer'; $('barn').onclick = () => openTab('barn');
$('harvest').onclick = () => { A.harvall(); A.collall(); A.fishall(); render(); hud(); };

// ---------------- 3D (same look as V.1: soft sky, warm sun, rounded low-poly) ----------------
let PENR = null, renderer, scene, camera, ray, root, plotObjs = [], penObjs = [], pondObjs = [], clickables = [], fishM = [], animM = [];
const COL = [];
const lin = c => new THREE.Color(c).convertSRGBToLinear();     // hex colours are what you see on screen (sRGB); the renderer works in linear light
const mats = {}, mat = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: 0.85, metalness: 0 }, o))); };
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep, rep); t.anisotropy = 4; return t; }
const TEX = {};
const grassTex = () => TEX.grass || (TEX.grass = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#3f7d26'; g.fillRect(0, 0, w, h);
  const cols = ['#4e9a32', '#3a7524', '#5cab3a', '#336b20', '#6cbf44'];
  for (let i = 0; i < 700; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.22 + Math.random() * 0.25; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, 7); g.fill(); }
  g.globalAlpha = 0.5; for (let i = 0; i < 900; i++) { g.strokeStyle = cols[(i * 3) % cols.length]; g.lineWidth = 1; const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 3 - 1.5, y - 3 - Math.random() * 5); g.stroke(); }
}, 26));
const soilTex = wet => TEX['soil' + wet] || (TEX['soil' + wet] = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = wet ? '#46301f' : '#7d5634'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = wet ? '#33221a' : '#5f3f24'; g.fillRect(0, y, w, 6); g.fillStyle = wet ? '#5d432c' : '#9a7345'; g.fillRect(0, y + 8, w, 3); }
  for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}, 1));
const soilMat = wet => mats['soilM' + wet] || (mats['soilM' + wet] = new THREE.MeshStandardMaterial({ map: soilTex(wet), roughness: 1 }));
const dirtTex = () => TEX.dirt || (TEX.dirt = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#a98f64'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = ['#8f7650', '#bba173', '#9c8259'][i % 3]; g.globalAlpha = 0.4; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 2 + Math.random() * 3); } }, 1));
const sph = new THREE.SphereGeometry(1, 16, 12), box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(1, 1, 1, 14), cone = new THREE.ConeGeometry(1, 1, 12);
function mk(parent, geo, m, p = [0, 0, 0], s = [1, 1, 1], r) { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); if (r) o.rotation.set(...r); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
function bubble(emoji) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.font = '68px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, 64, 68); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(0.95, 0.95, 1); sp.renderOrder = 10; return sp; }
const bubbles = {};
const bub = e => { const b = bubbles[e] || (bubbles[e] = bubble(e)); return b.clone(); };

// models for the newer crops (the first seven keep their own hand-made shapes above)
function shapedCrop(g, c) {
  const leaf = mat(c.lf || 0x4f9a4a), col = mat(c.col), trunk = mat(0x7a5638);
  switch (c.sh) {
    case 'root': for (let i = 0; i < 4; i++) mk(g, cone, leaf, [Math.cos(i * 1.6) * 0.14, 0.42, Math.sin(i * 1.6) * 0.14], [0.08, 0.8, 0.08], [Math.sin(i * 1.6) * 0.5, 0, -Math.cos(i * 1.6) * 0.5]); mk(g, sph, col, [0, 0.1, 0], [0.26, 0.2, 0.26]); break;
    case 'head': mk(g, sph, leaf, [0, 0.32, 0], [0.5, 0.4, 0.5]); mk(g, sph, col, [0, 0.45, 0], [0.4, 0.34, 0.4]); for (let i = 0; i < 5; i++) mk(g, sph, col, [Math.cos(i * 1.26) * 0.28, 0.5, Math.sin(i * 1.26) * 0.28], 0.18); break;
    case 'herb': for (let i = 0; i < 7; i++) mk(g, sph, leaf, [Math.cos(i * 0.9) * 0.22 * (i % 2 + 1), 0.3 + (i % 3) * 0.1, Math.sin(i * 0.9) * 0.22 * (i % 2 + 1)], [0.2, 0.26, 0.2]); break;
    case 'bush': mk(g, sph, leaf, [0, 0.45, 0], [0.5, 0.45, 0.5]); for (let i = 0; i < 6; i++) mk(g, sph, col, [Math.cos(i * 1.05) * 0.4, 0.32 + (i % 2) * 0.22, Math.sin(i * 1.05) * 0.4], [0.1, 0.2, 0.1]); break;
    case 'vine': for (let i = 0; i < 3; i++) mk(g, cyl, col, [Math.cos(i * 2.1) * 0.35, 0.14, Math.sin(i * 2.1) * 0.35], [0.1, 0.5, 0.1], [0, 0, Math.PI / 2 + i * 0.4]); for (let i = 0; i < 4; i++) mk(g, cyl, leaf, [Math.cos(i * 1.6) * 0.3, 0.07, Math.sin(i * 1.6) * 0.3], [0.28, 0.02, 0.28]); break;
    case 'mush': for (let i = 0; i < 4; i++) { const x = Math.cos(i * 1.6) * 0.28, z = Math.sin(i * 1.6) * 0.28, h = 0.22 + (i % 2) * 0.12; mk(g, cyl, leaf, [x, h / 2, z], [0.07, h, 0.07]); mk(g, sph, col, [x, h + 0.02, z], [0.2, 0.11, 0.2]); } break;
    case 'tree': mk(g, cyl, trunk, [0, 0.4, 0], [0.07, 0.8, 0.07]); mk(g, sph, leaf, [0, 0.95, 0], [0.5, 0.42, 0.5]); for (let i = 0; i < 6; i++) mk(g, sph, col, [Math.cos(i * 1.05) * 0.44, 0.85 + (i % 2) * 0.22, Math.sin(i * 1.05) * 0.44], 0.1); break;
    case 'palm': mk(g, cyl, trunk, [0, 0.65, 0], [0.07, 1.3, 0.07], [0.08, 0, 0.05]); for (let i = 0; i < 5; i++) mk(g, cone, leaf, [Math.cos(i * 1.26) * 0.3, 1.3, Math.sin(i * 1.26) * 0.3], [0.09, 0.8, 0.09], [Math.sin(i * 1.26) * 1.2, 0, -Math.cos(i * 1.26) * 1.2]); for (let i = 0; i < 4; i++) mk(g, sph, col, [Math.cos(i * 1.6) * 0.1, 1.15, Math.sin(i * 1.6) * 0.1], [0.1, 0.16, 0.1]); break;
    case 'pine': for (let i = 0; i < 7; i++) mk(g, cone, leaf, [Math.cos(i * 0.9) * 0.2, 0.3, Math.sin(i * 0.9) * 0.2], [0.07, 0.6, 0.07], [Math.sin(i * 0.9) * 0.6, 0, -Math.cos(i * 0.9) * 0.6]); mk(g, sph, col, [0, 0.3, 0], [0.22, 0.32, 0.22]); mk(g, cone, leaf, [0, 0.66, 0], [0.12, 0.3, 0.12]); break;
    case 'gourd': mk(g, sph, col, [0, 0.28, 0], [0.42, 0.34, 0.42]); mk(g, cyl, leaf, [0, 0.62, 0], [0.04, 0.16, 0.04]); for (let i = 0; i < 3; i++) mk(g, cyl, leaf, [Math.cos(i * 2.1) * 0.45, 0.04, Math.sin(i * 2.1) * 0.45], [0.26, 0.02, 0.26]); break;
    case 'grape': mk(g, sph, leaf, [0, 0.5, 0], [0.5, 0.42, 0.5]); for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) mk(g, sph, col, [Math.cos(i * 2.1) * 0.38 + (k % 2) * 0.05, 0.4 - k * 0.07, Math.sin(i * 2.1) * 0.38], 0.08); break;
    default: mk(g, sph, col, [0, 0.35, 0], [0.7, 0.45, 0.5]); mk(g, sph, leaf, [0, 0.5, 0], [0.5, 0.3, 0.35]);
  }
}
// a fish, an eel, a crab, a shell, a squid, a frog or a shrimp swimming in the pond
function fishMesh(id) {
  const d = FISH[id] || FISH.tilapia, m = new THREE.Group(), col = mat(d.col), dk = mat(0x2b2b2b), wh = mat(0xf5f5f0);
  switch (d.body) {
    case 'eel': mk(m, sph, col, [0, 0, 0], [0.55, 0.07, 0.07]); mk(m, sph, col, [0.45, 0, 0], [0.12, 0.08, 0.08]); mk(m, sph, mat(0xd8d2a0), [0, -0.03, 0], [0.5, 0.04, 0.05]); break;
    case 'crab': mk(m, sph, col, [0, 0.02, 0], [0.22, 0.1, 0.18]); for (const s of [-1, 1]) { mk(m, sph, col, [0.2, 0.04, s * 0.2], [0.09, 0.06, 0.07]); mk(m, sph, wh, [0.04, 0.12, s * 0.07], 0.03); for (const k of [0, 1, 2]) mk(m, cyl, col, [-0.05 + k * 0.1, 0, s * 0.22], [0.012, 0.16, 0.012], [Math.PI / 2, 0, 0]); } break;
    case 'shell': mk(m, sph, col, [0, 0.02, 0], [0.22, 0.1, 0.18]); for (let i = -2; i <= 2; i++) mk(m, box, mat(0x9a917f), [i * 0.06, 0.1, 0], [0.012, 0.025, 0.3]); break;
    case 'squid': mk(m, sph, col, [0.05, 0, 0], [0.3, 0.1, 0.1]); mk(m, cone, col, [0.36, 0, 0], [0.1, 0.18, 0.1], [0, 0, -Math.PI / 2]); for (let i = 0; i < 4; i++) mk(m, cone, col, [-0.28, 0, (i - 1.5) * 0.04], [0.025, 0.2, 0.025], [0, 0, Math.PI / 2]); mk(m, sph, dk, [0.16, 0.05, 0.07], 0.025); mk(m, sph, dk, [0.16, 0.05, -0.07], 0.025); break;
    case 'frog': mk(m, sph, col, [0, 0.03, 0], [0.2, 0.12, 0.16]); mk(m, sph, wh, [0.14, 0.12, 0.06], 0.045); mk(m, sph, wh, [0.14, 0.12, -0.06], 0.045); mk(m, sph, dk, [0.17, 0.12, 0.06], 0.02); mk(m, sph, dk, [0.17, 0.12, -0.06], 0.02); for (const s of [-1, 1]) mk(m, sph, col, [-0.14, 0.01, s * 0.17], [0.12, 0.04, 0.05]); break;
    case 'shrimp': mk(m, sph, col, [0, 0, 0], [0.3, 0.12, 0.12]); mk(m, sph, col, [-0.26, -0.02, 0], [0.14, 0.1, 0.1]); mk(m, cone, col, [-0.42, -0.04, 0], [0.1, 0.16, 0.05], [0, 0, Math.PI / 2]); mk(m, cyl, col, [0.36, 0.06, 0.04], [0.012, 0.3, 0.012], [0, 0, -1.2]); mk(m, cyl, col, [0.36, 0.06, -0.04], [0.012, 0.3, 0.012], [0, 0, -1.2]); break;
    default: { const big = ['salmon', 'seabass', 'trout', 'featherback'].includes(id) ? 1.18 : 1; mk(m, sph, col, [0, 0, 0], [0.32 * big, 0.14 * big, 0.14]); mk(m, cone, col, [-0.36 * big, 0, 0], [0.12, 0.2, 0.05], [0, 0, Math.PI / 2]); mk(m, sph, wh, [0.2 * big, 0.04, 0.09], 0.03); mk(m, sph, dk, [0.22 * big, 0.04, 0.09], 0.015); if (id === 'goldfish' || id === 'ruby') mk(m, cone, col, [0, 0.14, 0], [0.1, 0.16, 0.04]); }
  }
  return m;
}
function cropMesh(id) {
  const g = new THREE.Group(), c = CROPS[id], leaf = mat(0x4f9a4a), col = mat(c.col);
  if (c.sh) shapedCrop(g, c);
  else if (id === 'carrot') { for (let i = 0; i < 3; i++) { mk(g, cone, leaf, [(i - 1) * 0.28, 0.5, 0], [0.12, 0.7, 0.12], [0, 0, (i - 1) * 0.4]); mk(g, cone, col, [(i - 1) * 0.28, 0.12, 0], [0.12, 0.3, 0.12], [Math.PI, 0, 0]); } }
  else if (id === 'cabbage') { mk(g, sph, mat(0x8fd16a), [0, 0.35, 0], [0.55, 0.45, 0.55]); mk(g, sph, mat(0xb6e88a), [0, 0.5, 0], [0.38, 0.3, 0.38]); }
  else if (id === 'tomato') { mk(g, sph, leaf, [0, 0.45, 0], [0.5, 0.45, 0.5]); for (let i = 0; i < 5; i++) mk(g, sph, col, [Math.cos(i * 1.3) * 0.38, 0.4 + (i % 2) * 0.25, Math.sin(i * 1.3) * 0.38], 0.13); }
  else if (id === 'corn') { for (let i = 0; i < 3; i++) { mk(g, cyl, leaf, [(i - 1) * 0.35, 0.8, (i % 2) * 0.2], [0.07, 1.6, 0.07]); mk(g, sph, col, [(i - 1) * 0.35, 0.95, 0.1], [0.1, 0.28, 0.1]); } }
  else if (id === 'strawberry') { mk(g, sph, leaf, [0, 0.28, 0], [0.55, 0.3, 0.55]); for (let i = 0; i < 6; i++) mk(g, sph, col, [Math.cos(i * 1.05) * 0.4, 0.22, Math.sin(i * 1.05) * 0.4], 0.11); }
  else if (id === 'pumpkin') { mk(g, sph, col, [0, 0.3, 0], [0.55, 0.38, 0.55]); mk(g, cyl, leaf, [0, 0.7, 0], [0.06, 0.2, 0.06]); mk(g, sph, leaf, [0.4, 0.25, 0.3], [0.3, 0.06, 0.3]); }
  else { mk(g, sph, col, [0, 0.35, 0], [0.7, 0.45, 0.5]); mk(g, sph, mat(0x1f6a30), [0, 0.5, 0], [0.5, 0.3, 0.35]); }
  return g;
}
function newAnimal(sh) {
  const g = new THREE.Group(), A = mat(sh.c1), B = mat(sh.c2), dk = mat(0x2b2b2b), k = sh.k;
  const legs = (xs, zs, h, c, r = 0.07) => { for (const x of xs) for (const z of zs) mk(g, cyl, c, [x, h / 2, z], [r, h, r]); };
  if (k === 'bird') { mk(g, sph, A, [0, 0.32, 0], [0.3, 0.26, 0.36]); mk(g, sph, A, [0, 0.6, 0.26], 0.16); mk(g, cone, B, [0, 0.58, 0.45], [0.06, 0.14, 0.06], [Math.PI / 2, 0, 0]); mk(g, cone, B, [0, 0.42, -0.4], [0.1, 0.25, 0.08], [-1.9, 0, 0]); }
  else if (k === 'long') { mk(g, sph, A, [0, 0.42, 0], [0.3, 0.26, 0.4]); mk(g, cyl, A, [0, 0.8, 0.28], [0.07, 0.6, 0.07], [0.25, 0, 0]); mk(g, sph, A, [0, 1.12, 0.36], 0.13); mk(g, cone, B, [0, 1.1, 0.52], [0.05, 0.16, 0.05], [Math.PI / 2, 0, 0]); mk(g, cone, B, [0, 0.55, -0.45], [0.2, 0.55, 0.06], [-2.0, 0, 0]); legs([-0.1, 0.1], [0], 0.25, B, 0.03); }
  else if (k === 'rabbit') { mk(g, sph, A, [0, 0.3, 0], [0.28, 0.26, 0.4]); mk(g, sph, A, [0, 0.5, 0.3], 0.17); for (const x of [-0.07, 0.07]) mk(g, sph, B, [x, 0.82, 0.28], [0.045, 0.22, 0.04]); mk(g, sph, mat(0xffffff), [0, 0.3, -0.42], 0.1); }
  else if (k === 'bee') { mk(g, sph, A, [0, 0.4, 0], [0.18, 0.16, 0.26]); mk(g, box, B, [0, 0.4, -0.05], [0.2, 0.18, 0.06]); mk(g, box, B, [0, 0.4, 0.1], [0.2, 0.18, 0.06]); mk(g, sph, dk, [0, 0.42, 0.26], 0.1); for (const x of [-0.16, 0.16]) mk(g, sph, mat(0xdff3ff), [x, 0.58, 0], [0.12, 0.02, 0.2]); mk(g, box, mat(0xd9a441), [0.6, 0.15, 0], [0.5, 0.3, 0.45]); }
  else if (k === 'worm') { for (let i = 0; i < 5; i++) mk(g, sph, i ? A : B, [0, 0.12, -0.3 + i * 0.16], [0.13, 0.12, 0.12]); mk(g, sph, dk, [0.04, 0.16, 0.5], 0.03); mk(g, sph, dk, [-0.04, 0.16, 0.5], 0.03); mk(g, cyl, mat(0x5aa63f), [0.5, 0.04, 0], [0.4, 0.03, 0.3]); }
  else if (k === 'snail') { mk(g, sph, A, [0, 0.1, 0], [0.12, 0.1, 0.4]); mk(g, sph, B, [0, 0.3, -0.1], 0.22); mk(g, sph, A, [0, 0.2, 0.36], 0.09); for (const x of [-0.05, 0.05]) mk(g, cyl, A, [x, 0.32, 0.4], [0.015, 0.2, 0.015]); }
  else {   // four legged: quad, llama, camel, deer
    const big = k === 'camel' ? 1.15 : 1, tall = k === 'llama' || k === 'camel';
    mk(g, sph, A, [0, 0.6 * big, 0], [0.4, 0.34 * big, 0.7]);
    if (tall) { mk(g, cyl, A, [0, 1.0 * big, 0.55], [0.1, 0.6, 0.1], [0.35, 0, 0]); mk(g, sph, A, [0, 1.4 * big, 0.72], [0.14, 0.15, 0.2]); }
    else mk(g, sph, A, [0, 0.82, 0.62], [0.22, 0.22, 0.3]);
    if (k === 'camel') { mk(g, sph, A, [0, 1.05, -0.1], [0.22, 0.3, 0.26]); mk(g, sph, A, [0, 1.0, 0.25], [0.2, 0.28, 0.24]); }
    const hz = tall ? 0.78 : 0.88, hy = tall ? 1.55 * big : 0.98;
    if (k === 'deer') { for (const x of [-0.1, 0.1]) { mk(g, cyl, B, [x, 1.18, 0.62], [0.025, 0.4, 0.025], [0, 0, x > 0 ? -0.5 : 0.5]); mk(g, cyl, B, [x * 2, 1.34, 0.62], [0.02, 0.25, 0.02], [0, 0, x > 0 ? -0.9 : 0.9]); } }
    else if (k === 'quad' && sh.c1 === 0x4a4a4e) { for (const x of [-0.22, 0.22]) mk(g, cone, mat(0xe9e0cc), [x, hy, hz - 0.2], [0.05, 0.3, 0.05], [0, 0, x > 0 ? -1.2 : 1.2]); }
    else if (k === 'quad' && sh.c1 === 0xd9d2c3) { for (const x of [-0.1, 0.1]) mk(g, cone, B, [x, hy + 0.1, hz - 0.2], [0.04, 0.22, 0.04], [-0.3, 0, 0]); }
    else if (k === 'llama') { for (const x of [-0.07, 0.07]) mk(g, cone, A, [x, hy, 0.82], [0.04, 0.18, 0.04]); }
    legs([-0.25, 0.25], [-0.4, 0.4], 0.4 * big + (k === 'camel' ? 0.2 : 0), B, 0.07);
  }
  g.scale.setScalar(sh.s * 0.9); return g;
}
function animalMesh(id) {
  if (ANIMAL_SHAPE[id]) return newAnimal(ANIMAL_SHAPE[id]);
  const g = new THREE.Group(), W = mat(0xf5f5f0), ye = mat(0xffd34d), or = mat(0xf08a24), dk = mat(0x2b2b2b);
  if (id === 'chicken') { mk(g, sph, W, [0, 0.32, 0], [0.3, 0.26, 0.36]); mk(g, sph, W, [0, 0.6, 0.26], 0.16); mk(g, box, mat(0xe0443a), [0, 0.78, 0.26], [0.04, 0.1, 0.12]); mk(g, cone, or, [0, 0.58, 0.45], [0.06, 0.14, 0.06], [Math.PI / 2, 0, 0]); mk(g, cone, mat(0xdddddd), [0, 0.42, -0.4], [0.1, 0.25, 0.08], [-1.9, 0, 0]); }
  else if (id === 'duck') { mk(g, sph, ye, [0, 0.3, 0], [0.3, 0.24, 0.38]); mk(g, sph, ye, [0, 0.6, 0.28], 0.16); mk(g, box, or, [0, 0.56, 0.46], [0.14, 0.05, 0.14]); }
  else if (id === 'sheep') { mk(g, sph, W, [0, 0.55, 0], [0.55, 0.45, 0.6]); mk(g, sph, dk, [0, 0.7, 0.55], [0.2, 0.22, 0.22]); for (const x of [-0.25, 0.25]) for (const z of [-0.3, 0.3]) mk(g, cyl, dk, [x, 0.15, z], [0.07, 0.3, 0.07]); }
  else if (id === 'pig') { mk(g, sph, mat(0xf5a3b5), [0, 0.5, 0], [0.5, 0.4, 0.7]); mk(g, sph, mat(0xf5a3b5), [0, 0.6, 0.65], 0.3); mk(g, cyl, mat(0xe8809a), [0, 0.55, 0.92], [0.12, 0.08, 0.12], [Math.PI / 2, 0, 0]); for (const x of [-0.22, 0.22]) for (const z of [-0.35, 0.35]) mk(g, cyl, mat(0xe8809a), [x, 0.12, z], [0.08, 0.24, 0.08]); }
  else { mk(g, sph, W, [0, 0.75, 0], [0.55, 0.5, 0.95]); mk(g, sph, dk, [0.3, 0.9, 0.1], [0.22, 0.2, 0.3]); mk(g, sph, dk, [-0.25, 0.7, -0.3], [0.22, 0.2, 0.26]); mk(g, sph, W, [0, 0.95, 0.95], [0.3, 0.3, 0.32]); mk(g, cone, ye, [-0.2, 1.25, 0.95], [0.06, 0.25, 0.06]); mk(g, cone, ye, [0.2, 1.25, 0.95], [0.06, 0.25, 0.06]); for (const x of [-0.3, 0.3]) for (const z of [-0.6, 0.6]) mk(g, cyl, dk, [x, 0.22, z], [0.09, 0.45, 0.09]); }
  const s = { chicken: 0.9, duck: 0.9, sheep: 0.95, pig: 0.95, cow: 0.85 }[id]; g.scale.setScalar(s); return g;
}
// ---------------- farm layout: one tidy map, every place joined by a road ----------------
//   north row : barn (west) · market stall (middle) · workshop (east), all facing a gravel plaza
//   middle    : animal pen (west) and fish pond (east), each reached by its own curved branch road
//   south     : two blocks of vegetable beds either side of the main road, which curves gently up from the farm gate
const LAY = {
  plotX: [-3.4, 3.4, -5.6, 5.6], plotZ: 10.2, plotDz: 2.2,
  barn: { x: -7.5, z: -10.5 }, stall: { x: 0, z: -10 }, work: { x: 7.5, z: -10.5 }, plaza: { x: 0, z: -6.6 },
  pen: { x: -8.6, z: -2.8 }, pond: { x: 9.2, z: -3.6 }, truck: { x: 5.2, z: 12.9 }, fountain: { x: 8.8, z: 12.3 }, house: { x: -10.2, z: 11.2 },
};
// the animal pen grows with each expansion: the gate and the south fence stay put, the pen spreads west and north (more room, up to 72 animals)
const PEN_GATE_X = -8.6, PEN_Z1 = -0.2;
function penDims(L) {
  L = Math.max(0, Math.min(9, L == null ? (S ? S.u.pen : 0) : L));
  const W = 6.6 + L * 1.45, D = 5.2 + L * 0.16, xe = -5.3 + Math.min(1.5, L * 0.5), x0 = xe - W, z1 = PEN_Z1, z0 = z1 - D;
  return { W, D, x0, x1: xe, z0, z1, cx: (x0 + xe) / 2, cz: (z0 + z1) / 2 };
}
const ROAD_LINES = [
  { w: 2.3, pts: [[0.1, 13.8], [0.5, 10.5], [-0.5, 6.5], [0.4, 2.4], [0, -1.4], [0, -4.2], [0, -6.6]] },      // farm gate -> plaza: the main road, a gentle S between the two plot blocks
  { w: 1.8, pts: [[0, -1.4], [-2.6, -0.5], [-5.4, 0.5], [-8.6, 0.7]] },                                         // -> pen gate
  { w: 1.8, pts: [[0, -1.4], [2.6, -0.9], [5.0, -0.1], [7.4, -0.3]] },                                          // -> pond dock
  { w: 1.8, pts: [[-1.8, -7.2], [-4, -8.2], [-6, -8.5], [-7.5, -8.1]] },                                        // plaza -> barn
  { w: 1.8, pts: [[1.8, -7.2], [4, -8.2], [6, -8.5], [7.5, -8.1]] },                                            // plaza -> workshop
  { w: 1.6, pts: [[0.3, 12.3], [2.4, 12.6], [4.2, 12.4]] },                                                     // spur to the truck bay
  { w: 1.7, pts: [[-0.1, 12.6], [-2.8, 13.0], [-5.4, 12.9], [-7.5, 12.4]] },                                    // to the front door of the house
  { w: 2.3, pts: [[0.1, 13.8], [0.3, 17.5], [-0.3, 23], [0.3, 29.5], [0, 35.5], [-0.4, 52], [0.3, 72], [0, 92], [-0.3, 112], [0.2, 132], [0, 154]] },                                // the main road carries on south through the new field area
];
const ROADPTS = [];   // sampled road centre points, so grass, flowers and trees keep off the roads
function roadMesh(pts, w, y, material, uvScale) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5), len = curve.getLength(), n = Math.max(10, Math.round(len * 3));
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPoint(t), tg = curve.getTangent(t), nx = -tg.z, nz = tg.x, m = Math.hypot(nx, nz) || 1;
    pos.push(p.x + nx / m * w / 2, y, p.z + nz / m * w / 2, p.x - nx / m * w / 2, y, p.z - nz / m * w / 2); uv.push(0, t * len / uvScale, 1, t * len / uvScale);
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, material); m.receiveShadow = true; return m;
}
const roadMats = {};
let bedB = null, bedP = null;   // merged bed frame shapes, built once
// ground where nothing but a bed may stand: not the pen, the pond, the plaza, the market row, the truck bay or the house
function baseFree(x, z) {
  const pd = penDims(), penR = { x0: pd.x0 - 1.1, x1: pd.x1 + 1.1, z0: pd.z0 - 1.0, z1: pd.z1 + 0.9 };
  return !(x > penR.x0 && x < penR.x1 && z > penR.z0 && z < penR.z1) && !(Math.hypot((x - LAY.pond.x) / 4.6, (z - LAY.pond.z) / 3.7) < 1) && !(z < -8 && z > -13.6 && Math.abs(x) < 10.5) && !(Math.hypot(x - LAY.plaza.x, z - LAY.plaza.z) < 3.2) && !(Math.hypot(x - LAY.truck.x, z - LAY.truck.z) < 2.2) && !(x > -12.9 && x < -7.2 && z > 9.2 && z < 13.8);
}
const nearRoad = (x, z, r) => { for (const p of ROADPTS) if (Math.hypot(p[0] - x, p[1] - z) < r) return true; return false; };
// a vegetable bed is a field of four plants, not one
function cropField(id, stage) {
  const g = new THREE.Group(), s = 0.7 * (0.3 + 0.22 * stage);
  [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z], k) => { const c = cropMesh(id); c.position.set(x, 0, z); c.scale.setScalar(s); c.rotation.y = k * 1.7; g.add(c); });
  return g;
}
// the barn: a red gable barn with big doors, hay bales, and (as it is upgraded) a wider body and a silo. Crates and sacks pile up outside as it fills
function buildBarn(parent) {
  const L = S.u.barn, g = new THREE.Group(); g.position.set(LAY.barn.x, 0, LAY.barn.z); parent.add(g);
  const red = mat(0xb8322a), dark = mat(0x7a231c), white = mat(0xf5f1e6), wood = mat(0x7a5638), roofM = mat(0x5b4a44), hay = mat(0xe3c46a), W = 3.8 + L * 0.45, D = 3.2, ang = 0.6, hh = D / 2 * Math.tan(ang);
  mk(g, box, red, [0, 1.35, 0], [W, 2.7, D]); mk(g, box, dark, [0, 0.12, 0], [W + 0.1, 0.24, D + 0.1]);
  const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, hh); const gab = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), red); gab.rotation.y = -Math.PI / 2; gab.position.set(W / 2, 2.7, 0); gab.castShadow = true; g.add(gab);
  for (const s of [-1, 1]) mk(g, box, roofM, [0, 2.7 + hh / 2 + 0.06, s * D / 4], [W + 0.6, 0.14, D / 2 / Math.cos(ang) + 0.4], [s * ang, 0, 0]);
  mk(g, box, white, [0, 0.9, D / 2 + 0.03], [1.7, 1.8, 0.08]); mk(g, box, wood, [0, 0.9, D / 2 + 0.06], [1.5, 1.65, 0.06]);
  for (const s of [-1, 1]) mk(g, box, white, [0, 0.9, D / 2 + 0.1], [1.9, 0.07, 0.04], [0, 0, s * 0.74]);
  mk(g, box, white, [0, 0.9, D / 2 + 0.1], [0.05, 1.65, 0.04]);
  const winM = new THREE.MeshStandardMaterial({ color: lin(0x39434d), emissive: lin(0xffc860), emissiveIntensity: 0, roughness: 0.5 }); NIGHT.wins.length = 0; NIGHT.wins.push(winM);
  mk(g, box, white, [0, 2.95, D / 2 + 0.03], [0.62, 0.62, 0.06]); mk(g, box, winM, [0, 2.95, D / 2 + 0.07], [0.46, 0.46, 0.04]);
  for (const sx of [-1, 1]) { mk(g, box, white, [sx * (W / 2 + 0.02), 1.5, 0], [0.06, 0.7, 0.7]); mk(g, box, winM, [sx * (W / 2 + 0.05), 1.5, 0], [0.04, 0.5, 0.5]); }
  for (const [x, z, r] of [[W / 2 + 0.85, 0.7, 0.4], [W / 2 + 0.85, -0.2, 0.4], [W / 2 + 0.6, 0.25, 0.4]]) mk(g, cyl, hay, [x, r + (z === 0.25 ? 0.75 : 0), z], [r, 0.7, r], [Math.PI / 2, 0, 0]);
  if (L >= 2) { mk(g, cyl, mat(0xd5dde0), [-W / 2 - 1.1, 1.8, -0.4], [0.85, 3.6, 0.85]); mk(g, sph, mat(0xb8322a), [-W / 2 - 1.1, 3.6, -0.4], [0.85, 0.55, 0.85]); for (const y of [0.8, 1.8, 2.8]) mk(g, cyl, mat(0x9aa7ad), [-W / 2 - 1.1, y, -0.4], [0.88, 0.07, 0.88]); }
  const fill = new THREE.Group(); g.add(fill); g.userData.fill = fill; g.userData.tier = -1; g.userData.W = W; g.userData.D = D;
  const bk = bub('🏚️'); bk.position.set(0, 4.7, 0); g.add(bk);
  COL.push({ t: 'b', x: LAY.barn.x, z: LAY.barn.z, hw: W / 2 + 0.15, hd: D / 2 + 0.15 });
  return g;
}
function fillBarn(g, tier) {
  const f = g.userData.fill; while (f.children.length) f.remove(f.children[0]); g.userData.tier = tier;
  const W = g.userData.W, D = g.userData.D, crate = mat(0xb08650), crate2 = mat(0x8c6a3c), sack = mat(0xe6d7b0), box_ = (x, z, y = 0) => { mk(f, box, crate, [x, 0.27 + y, z], [0.62, 0.5, 0.62]); mk(f, box, crate2, [x, 0.27 + y, z], [0.66, 0.08, 0.66]); mk(f, box, crate2, [x, 0.47 + y, z], [0.66, 0.06, 0.66]); };
  const zf = D / 2 + 0.7, x0 = -W / 2 + 0.5;
  if (tier >= 1) box_(x0, zf);
  if (tier >= 2) { box_(x0 + 0.75, zf); box_(x0 + 0.3, zf + 0.1, 0.5); }
  if (tier >= 3) { for (const [x, z] of [[-0.9, zf + 0.5], [-0.35, zf + 0.6]]) mk(f, sph, sack, [x, 0.26, z], [0.34, 0.3, 0.3]); box_(x0 + 1.5, zf); }
  if (tier >= 4) { box_(x0 + 2.25, zf); box_(x0 + 1.5, zf, 0.5); for (const [x, z] of [[0.3, zf + 0.6], [0.85, zf + 0.5], [0.55, zf + 0.5]]) mk(f, sph, sack, [x, 0.26, z], [0.34, 0.3, 0.3]); mk(f, sph, sack, [0.55, 0.62, zf + 0.5], [0.32, 0.28, 0.28]); }
}
// the house: a small cottage west of the gate. Its door faces the road; what you buy for it shows outside (flower boxes, a coffee table, a storage cabinet)
function buildHouse(parent, click) {
  const H = S.home, g = new THREE.Group(); g.position.set(LAY.house.x, 0, LAY.house.z); g.rotation.y = Math.PI / 2; parent.add(g);
  const wall = mat(0xf2e4c4), base = mat(0x8b6b4a), roofM = mat(0xb4472f), wood = mat(0x7a5638), white = mat(0xf5f1e6), W = 4.0, D = 3.4, ang = 0.62, hh = D / 2 * Math.tan(ang);
  mk(g, box, wall, [0, 1.15, 0], [W, 2.3, D]); mk(g, box, base, [0, 0.14, 0], [W + 0.12, 0.28, D + 0.12]);
  const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, hh); const gab = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), wall); gab.rotation.y = -Math.PI / 2; gab.position.set(W / 2, 2.3, 0); gab.castShadow = true; g.add(gab);
  for (const sg of [-1, 1]) mk(g, box, roofM, [0, 2.3 + hh / 2 + 0.07, sg * D / 4], [W + 0.7, 0.14, D / 2 / Math.cos(ang) + 0.45], [sg * ang, 0, 0]);
  mk(g, box, mat(0x9c4b3a), [1.25, 3.0, -0.5], [0.4, 1.1, 0.4]); mk(g, box, mat(0x6b2f25), [1.25, 3.58, -0.5], [0.5, 0.08, 0.5]);
  mk(g, box, white, [-1.1, 0.95, D / 2 + 0.03], [0.95, 1.7, 0.08]); mk(g, box, wood, [-1.1, 0.92, D / 2 + 0.07], [0.8, 1.6, 0.06]); mk(g, sph, mat(0xf2c94c), [-0.82, 0.9, D / 2 + 0.13], 0.045);
  mk(g, box, mat(0x9e9a90), [-1.1, 0.06, D / 2 + 0.38], [1.1, 0.12, 0.6]);
  const winM = new THREE.MeshStandardMaterial({ color: lin(0x39434d), emissive: lin(0xffc860), emissiveIntensity: 0, roughness: 0.5 }); NIGHT.wins.push(winM);
  mk(g, box, white, [0.95, 1.2, D / 2 + 0.03], [1.05, 0.95, 0.08]); mk(g, box, winM, [0.95, 1.2, D / 2 + 0.07], [0.9, 0.8, 0.05]); mk(g, box, white, [0.95, 1.2, D / 2 + 0.1], [0.05, 0.85, 0.03]);
  for (const sg of [-1, 1]) { mk(g, box, white, [sg * (W / 2 + 0.03), 1.3, 0.1], [0.08, 0.8, 0.8]); mk(g, box, winM, [sg * (W / 2 + 0.07), 1.3, 0.1], [0.05, 0.64, 0.64]); }
  if (H.vase) for (const x of [0.95]) { mk(g, box, wood, [x, 0.62, D / 2 + 0.2], [1.1, 0.16, 0.2]); for (let i = 0; i < 6; i++) { mk(g, sph, mat([0xf08aa0, 0xffcf3f, 0xf5f5f0, 0xb69be0, 0xff8a65, 0xf08aa0][i]), [x - 0.4 + i * 0.16, 0.78 + (i % 2) * 0.05, D / 2 + 0.2], 0.075); } mk(g, box, mat(0xd9534f), [-1.1, 0.14, D / 2 + 0.95], [0.7, 0.03, 0.4]); }
  if (H.cafe) { const tx = 1.1, tz = D / 2 + 0.85; mk(g, cyl, wood, [tx, 0.55, tz], [0.05, 1.1, 0.05]); mk(g, cyl, white, [tx, 1.1, tz], [0.42, 0.05, 0.42]); mk(g, cyl, mat(0x5d4037), [tx - 0.1, 1.17, tz], [0.07, 0.1, 0.07]); mk(g, cyl, mat(0x5d4037), [tx + 0.12, 1.17, tz + 0.05], [0.07, 0.1, 0.07]); for (const dx of [-0.65, 0.65]) { mk(g, cyl, wood, [tx + dx, 0.3, tz], [0.04, 0.6, 0.04]); mk(g, cyl, mat(0xb08968), [tx + dx, 0.62, tz], [0.22, 0.05, 0.22]); } }
  if (H.store) { mk(g, box, wood, [1.75, 0.55, D / 2 + 0.3], [0.8, 1.1, 0.45]); mk(g, box, mat(0xa57a4c), [1.75, 0.55, D / 2 + 0.54], [0.74, 0.5, 0.04]); mk(g, box, mat(0xa57a4c), [1.75, 0.95, D / 2 + 0.54], [0.74, 0.3, 0.04]); }
  const bl = bub('🏠'); bl.position.set(0, 4.5, 0); g.add(bl);
  // the porch lamp
  if (NIGHT.gtex) { const bm = new THREE.MeshBasicMaterial({ color: 0xa99f80, toneMapped: false }), bu = new THREE.Mesh(sph, bm); bu.scale.setScalar(0.1); bu.position.set(-0.45, 1.9, D / 2 + 0.12); g.add(bu); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: NIGHT.gtex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })); gl.scale.set(1.7, 1.7, 1); gl.position.copy(bu.position); gl.visible = false; g.add(gl); NIGHT.lamps.push({ bulb: bm, glow: gl }); }
  click(g, 'home', 0); COL.push({ t: 'b', x: LAY.house.x, z: LAY.house.z, hw: D / 2 + 0.15, hd: W / 2 + 0.15 });
  return g;
}
function build3d() {
  if (!scene) return;
  if (root) scene.remove(root);
  NOSLOT = false; root = new THREE.Group(); scene.add(root); COL.length = 0; plotObjs = []; penObjs = []; pondObjs = []; clickables = []; fishM = []; animM = []; ROADPTS.length = 0;
  const click = (o, kind, i) => { o.traverse(m => { m.userData.k = kind; m.userData.i = i; }); clickables.push(o); };
  // roads first, so everything else can keep off them
  for (const R of ROAD_LINES) { const c = new THREE.CatmullRomCurve3(R.pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5); for (let i = 0; i <= 40; i++) { const p = c.getPoint(i / 40); ROADPTS.push([p.x, p.z]); } }
  { const px = LAY.plaza; for (let a = 0; a < 12; a++) ROADPTS.push([px.x + Math.cos(a / 12 * 6.283) * 2, px.z + Math.sin(a / 12 * 6.283) * 2]); ROADPTS.push([px.x, px.z]); }
  const pcell = new Map(); S.plots.forEach((p, i) => { const q = plotPos(i), key = Math.floor(q.x / 3) + ',' + Math.floor(q.z / 3); let a = pcell.get(key); if (!a) pcell.set(key, a = []); a.push(q); });
  const plotNear = (x, z) => { const cx = Math.floor(x / 3), cz = Math.floor(z / 3); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = pcell.get((cx + a) + ',' + (cz + b)); if (l) for (const q of l) if (Math.abs(x - q.x) < 1.5 && Math.abs(z - q.z) < 1.5) return true; } return false; };
  const free = (x, z) => !nearRoad(x, z, 2.1) && baseFree(x, z) && !plotNear(x, z);
  // ground
  const gt = grassTex().clone(); gt.repeat.set(86, 86); gt.needsUpdate = true; mk(root, new THREE.PlaneGeometry(480, 480), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }), [0, 0, 70], 1, [-Math.PI / 2, 0, 0]).castShadow = false;   // same grass tile size as before, over the bigger farm
  // roads: a darker gravel edge, then the dirt surface, and a stone plaza where they meet
  { const dt = dirtTex(); roadMats.edge = roadMats.edge || new THREE.MeshStandardMaterial({ color: lin(0x8c7a55), roughness: 1, side: THREE.DoubleSide }); roadMats.top = roadMats.top || new THREE.MeshStandardMaterial({ map: dt, roughness: 1, side: THREE.DoubleSide });
    for (const R of ROAD_LINES) { root.add(roadMesh(R.pts, R.w + 0.5, 0.022, roadMats.edge, 3)); root.add(roadMesh(R.pts, R.w, 0.03, roadMats.top, 2.4)); }
    const pl = LAY.plaza; mk(root, cyl, mat(0x8c7a55), [pl.x, 0.02, pl.z], [2.75, 0.03, 2.75]).castShadow = false; const pt = mk(root, cyl, new THREE.MeshStandardMaterial({ map: dt, roughness: 1 }), [pl.x, 0.04, pl.z], [2.5, 0.03, 2.5]); pt.castShadow = false;
    for (let a = 0; a < 18; a++) { const an = a / 18 * 6.283; mk(root, sph, mat(a % 2 ? 0x9e9e9e : 0xb3aea2), [pl.x + Math.cos(an) * 2.62, 0.07, pl.z + Math.sin(an) * 2.62], [0.2, 0.12, 0.2]); } }
  // grass tufts and wild flowers, only where nothing stands
  { const blade = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), 5200), dm = new THREE.Object3D(), gc = [0x6aa84a, 0x5a9a3e, 0x7bb656, 0x4f8a37];
    let n = 0; for (let k = 0; k < 40000 && n < 5200; k++) { const x = rnd(BOUND.x0 + 1, BOUND.x1 - 1), z = rnd(BOUND.z0 + 1, BOUND.z1 - 1); if (!free(x, z)) continue; dm.position.set(x, 0.25, z); dm.rotation.set(rnd(-0.25, 0.25), rnd(0, 6), rnd(-0.25, 0.25)); dm.scale.setScalar(rnd(0.7, 1.5)); dm.updateMatrix(); blade.setMatrixAt(n, dm.matrix); blade.setColorAt(n, lin(gc[n % 4])); n++; }
    blade.count = n; blade.instanceMatrix.needsUpdate = true; if (blade.instanceColor) blade.instanceColor.needsUpdate = true; root.add(blade);
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), 900), fc = [0xf2f2ea, 0xffd23f, 0xf08aa0, 0xb69be0, 0xff8a65]; let m2 = 0;
    for (let k = 0; k < 14000 && m2 < 900; k++) { const x = rnd(BOUND.x0 + 1, BOUND.x1 - 1), z = rnd(BOUND.z0 + 1, BOUND.z1 - 1); if (!free(x, z)) continue; dm.position.set(x, 0.32, z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(rnd(0.8, 1.3)); dm.updateMatrix(); fl.setMatrixAt(m2, dm.matrix); fl.setColorAt(m2, lin(fc[m2 % 5])); m2++; }
    fl.count = m2; fl.instanceMatrix.needsUpdate = true; if (fl.instanceColor) fl.instanceColor.needsUpdate = true; root.add(fl); }
  [[-14, -26, 9, 0x6fae5a], [0, -30, 11, 0x5e9e50], [15, -27, 8, 0x6fae5a], [-26, -20, 7, 0x5e9e50], [27, -18, 7, 0x6fae5a]].forEach(([x, z, r, c]) => mk(root, sph, mat(c), [x, 0, z], [r * 1.3, r * 0.7, r]));
  // vegetable beds: raised timber frames
  const mergeBoxes = list => { const pos = [], nor = [], idx = []; let base = 0; for (const [x, y, z, w, h, d] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); const P = g.attributes.position.array, N = g.attributes.normal.array; for (let i = 0; i < P.length; i++) { pos.push(P[i]); nor.push(N[i]); } for (const k of g.index.array) idx.push(k + base); base += P.length / 3; g.dispose(); } const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); m.setIndex(idx); return m; };
  const bedBoards = () => bedB || (bedB = mergeBoxes([[0, 0.2, -0.95, 2.0, 0.28, 0.1], [0, 0.2, 0.95, 2.0, 0.28, 0.1], [-0.95, 0.2, 0, 0.1, 0.28, 1.8], [0.95, 0.2, 0, 0.1, 0.28, 1.8]]));
  const bedPosts = () => bedP || (bedP = mergeBoxes([[-0.95, 0.25, -0.95, 0.15, 0.36, 0.15], [0.95, 0.25, -0.95, 0.15, 0.36, 0.15], [-0.95, 0.25, 0.95, 0.15, 0.36, 0.15], [0.95, 0.25, 0.95, 0.15, 0.36, 0.15]]));
  const wood = mat(0xa57a4c), wood2 = mat(0x7d5a36);
  S.plots.forEach((p, i) => {
    const pp = plotPos(i), g = new THREE.Group(); g.position.set(pp.x, 0, pp.z); root.add(g);
    mk(g, box, soilMat(p.w ? 1 : 0), [0, 0.12, 0], [1.84, 0.2, 1.84]);
    { const b = new THREE.Mesh(bedBoards(), wood), q = new THREE.Mesh(bedPosts(), wood2); for (const o of [b, q]) { o.castShadow = o.receiveShadow = true; g.add(o); } }   // the frame is two merged shapes, not eight boxes: hundreds of beds stay smooth
    g.userData.soil = g.children[0]; plotObjs.push({ g, c: null, st: -1 }); click(g, 'plot', i);
  });
  // barn, market stall, workshop: a row along the north edge, all facing the plaza
  root.userData.barn = buildBarn(root); click(root.userData.barn, 'barn', 0);
  const stall = new THREE.Group(); stall.position.set(LAY.stall.x, 0, LAY.stall.z); root.add(stall); mk(stall, box, mat(0xb08968), [0, 0.6, 0], [3, 1.2, 1.4]);
  for (let i = 0; i < 6; i++) mk(stall, box, mat(i % 2 ? 0xf5f5f0 : 0xe0443a), [-1.25 + i * 0.5, 2.2, 0.2], [0.5, 0.1, 1.9], [0.3, 0, 0]);
  for (const x of [-1.4, 1.4]) mk(stall, cyl, mat(0x6d4c41), [x, 1.1, 0.8], [0.06, 2.2, 0.06]); mk(stall, box, mat(0xffcf3f), [0, 2.7, 0.8], [1.6, 0.4, 0.06]); click(stall, 'market', 0); COL.push({ t: 'b', x: LAY.stall.x, z: LAY.stall.z, hw: 1.7, hd: 0.9 });
  const bk = bub('🏪'); bk.position.set(LAY.stall.x, 3.6, LAY.stall.z); root.add(bk);
  if (S.u.work) { const w = new THREE.Group(); w.position.set(LAY.work.x, 0, LAY.work.z); root.add(w); mk(w, box, mat(0x90a4ae), [0, 1.2, 0], [2.8, 2.4, 2.4]); mk(w, box, mat(0x546e7a), [0, 2.55, 0], [3, 0.3, 2.6]); mk(w, cyl, mat(0xcfd8dc), [0.8, 3.3, 0], [0.28, 1.6, 0.28]); mk(w, box, mat(0x4fc3f7), [-0.5, 1.4, 1.22], [1, 0.8, 0.04]); click(w, 'work', 0); COL.push({ t: 'c', x: LAY.work.x, z: LAY.work.z, r: 2 }); const wb = bub('🏭'); wb.position.set(LAY.work.x, 4.4, LAY.work.z); root.add(wb); }
  if (S.u.truck) { const t = new THREE.Group(); t.position.set(LAY.truck.x, 0, LAY.truck.z); t.rotation.y = -1.45; root.add(t); COL.push({ t: 'c', x: LAY.truck.x, z: LAY.truck.z, r: 1.4 }); mk(t, box, mat(S.u.truck > 1 ? 0xe0443a : 0x3e7cc8), [0, 0.7, 0], [1.2, 0.7, 2.4]); mk(t, box, mat(0xf5f5f0), [0, 1.2, 0.7], [1.1, 0.6, 0.9]); for (const x of [-0.6, 0.6]) for (const z of [-0.8, 0.8]) mk(t, cyl, mat(0x222222), [x, 0.3, z], [0.3, 0.2, 0.3], [0, 0, Math.PI / 2]); }
  // pen with fence (the gate faces the road)
  const PD = penDims(), pen = new THREE.Group(); root.add(pen); PENR = PD;
  const fw = mat(0xb08968), GX = PEN_GATE_X, GH = 1.25;
  // rails: north wall, west wall, east wall, and the south wall with a gate gap
  const rails = [[PD.cx, PD.z0, PD.W, 0.08], [PD.x0, PD.cz, 0.08, PD.D], [PD.x1, PD.cz, 0.08, PD.D], [(PD.x0 + GX - GH) / 2, PD.z1, GX - GH - PD.x0, 0.08], [(PD.x1 + GX + GH) / 2, PD.z1, PD.x1 - GX - GH, 0.08]];
  for (const [x, z, w, d] of rails) { mk(pen, box, fw, [x, 0.55, z], [w, 0.1, d]); mk(pen, box, fw, [x, 0.3, z], [w, 0.1, d]); COL.push({ t: 'b', x, z, hw: w / 2 + 0.1, hd: d / 2 + 0.1 }); }
  const post = (x, z) => mk(pen, box, fw, [x, 0.4, z], [0.12, 0.8, 0.12]);
  for (let x = PD.x0; x <= PD.x1 + 0.01; x += 1.1) { post(x, PD.z0); if (x < GX - GH - 0.2 || x > GX + GH + 0.2) post(x, PD.z1); }
  for (let z = PD.z0; z <= PD.z1 + 0.01; z += 1.1) { post(PD.x0, z); post(PD.x1, z); }
  mk(pen, box, mat(0xa88b57), [PD.cx, 0.02, PD.cz], [PD.W - 0.2, 0.04, PD.D - 0.2], undefined).castShadow = false;
  for (const x of [GX - GH, GX + GH]) mk(pen, box, mat(0x6d4c41), [x, 0.7, PD.z1], [0.16, 1.4, 0.16]);       // gate posts
  const pc = new THREE.Mesh(new THREE.PlaneGeometry(PD.W - 0.2, PD.D - 0.2), new THREE.MeshBasicMaterial({ visible: false })); pc.rotation.x = -Math.PI / 2; pc.position.set(PD.cx, 0.05, PD.cz); pen.add(pc); click(pc, 'pen', -1);
  S.pen.forEach((a, i) => { const m = animalMesh(a.a); m.position.set(rnd(PD.x0 + 0.7, PD.x1 - 0.7), 0, rnd(PD.z0 + 0.7, PD.z1 - 0.7)); m.userData.pn = { tx: m.position.x, tz: m.position.z, w: rnd(0, 3) }; pen.add(m); const b = bub(ITEMS[ANIMALS[a.a].prod].i); b.visible = false; b.position.y = 1.7; m.add(b); m.userData.b = b; click(m, 'animal', i); animM.push(m); });
  // pond: an oval with a sandy shore, rocks, reeds, lily pads and a little jetty at the end of its own road
  const QX = LAY.pond.x, QZ = LAY.pond.z, pond = new THREE.Group(); pond.position.set(QX, 0, QZ); root.add(pond);
  mk(pond, cyl, mat(0xd9c9a2), [0, 0.035, 0], [4.0, 0.08, 3.1]).castShadow = false; mk(pond, cyl, mat(0x6f5d3f), [0, 0.06, 0], [3.65, 0.06, 2.8]).castShadow = false;
  mk(pond, cyl, mat(0x1f6f8f), [0, 0.09, 0], [3.45, 0.05, 2.6]).castShadow = false; mk(pond, cyl, mat(0x3a9bb8, { roughness: 0.06, metalness: 0.25, transparent: true, opacity: 0.82 }), [0, 0.14, 0], [3.45, 0.05, 2.6]).castShadow = false;
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rx = Math.cos(a) * 3.7, rz = Math.sin(a) * 2.85; if (Math.hypot(rx + 1.6, rz - 2.7) < 1.0) continue; mk(pond, sph, mat(i % 2 ? 0x9e9e9e : 0x8a8a8a), [rx, 0.14, rz], [0.3, 0.2, 0.3]); }
  for (const a of [-0.5, 0.15, 0.7, 2.6, 3.4, 4.1, 5.6]) { const cx = Math.cos(a) * 3.85, cz = Math.sin(a) * 2.95; for (let k = 0; k < 5; k++) { const dx = cx + Math.cos(k * 2.1) * 0.2, dz = cz + Math.sin(k * 2.1) * 0.2, h = 0.9 + (k % 3) * 0.25; mk(pond, cyl, mat(0x5e9a3c), [dx, h / 2, dz], [0.025, h, 0.025]); mk(pond, cyl, mat(0x6b3f23), [dx, h, dz], [0.06, 0.28, 0.06]); } }
  for (const [x, z] of [[-1.2, -0.8], [0.9, 0.6], [1.8, -1.0], [-0.3, 1.1], [2.2, 0.5]]) { mk(pond, cyl, mat(0x4f9a4a), [x, 0.17, z], [0.3, 0.015, 0.3]).castShadow = false; if ((x * 10 | 0) % 2 === 0) mk(pond, sph, mat(0xf08aa0), [x, 0.2, z], 0.07); }
  mk(pond, box, mat(0xa57a4c), [-1.6, 0.17, 2.3], [0.95, 0.08, 2.3]); for (const [x, z] of [[-2.0, 3.3], [-1.2, 3.3], [-2.0, 1.4], [-1.2, 1.4]]) mk(pond, cyl, mat(0x6d4c41), [x, 0.12, z], [0.06, 0.5, 0.06]);
  const pcl = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.3, 16), new THREE.MeshBasicMaterial({ visible: false })); pcl.scale.set(1.12, 1, 0.86); pcl.position.y = 0.15; pond.add(pcl); click(pcl, 'pond', -1);
  for (const [dx, r] of [[0, 2.45], [-1.5, 1.9], [1.7, 2.1]]) COL.push({ t: 'c', x: QX + dx, z: QZ, r });
  S.pond.forEach((f, i) => { const m = fishMesh(f.f); m.userData.fs = { a: rnd(0, 6.28), r: rnd(0.6, 2.2), sp: rnd(0.4, 0.9) * (i % 2 ? 1 : -1) }; const b = bub('🧺'); b.visible = false; b.position.y = 0.9; m.add(b); m.userData.b = b; pond.add(m); fishM.push(m); click(m, 'pond', i); });
  // decorations (each beside a road or a bed block, never on one)
  const D = S.deco;
  const tree = (x, z, s = 1) => { const hh = hash(x + ',' + z), gs = [0x3d7a3a, 0x4a8a41, 0x56984b, 0x3a6f35]; mk(root, cyl, mat(0x5a4030, { roughness: 1 }), [x, 0.9 * s, z], [0.17 * s, 1.8 * s, 0.17 * s]); [[0, 2.3, 0, 1.15], [0.55, 1.9, 0.25, 0.8], [-0.5, 2.0, -0.2, 0.85], [0.1, 2.95, 0.1, 0.7], [-0.2, 1.8, 0.5, 0.7]].forEach(([dx, dy, dz, r], i) => mk(root, sph, mat(gs[(hh + i) % 4], { roughness: 1 }), [x + dx * s, dy * s, z + dz * s], [r * s, r * 0.88 * s, r * s])); };
  [[-10.2, 5], [11.4, 2.2], [-12.2, -7.5], [12.2, -8.4], [11.6, 10.2], [-3.6, -12.4]].forEach(([x, z], i) => { tree(x, z, 1 + (i % 3) * 0.12); COL.push({ t: 'c', x, z, r: 0.4 }); });
  // a ring of trees marks the edge of the bigger farm
  for (let k = 0; k < 120; k++) { const t = k / 120, x = t < 0.28 ? BOUND.x0 + 0.5 : t < 0.56 ? BOUND.x1 - 0.5 : BOUND.x0 + 3 + (BOUND.x1 - BOUND.x0 - 6) * ((t - 0.56) / 0.44), z = t < 0.56 ? BOUND.z0 + 2 + (BOUND.z1 - BOUND.z0 - 3) * ((t % 0.28) / 0.28) : (k % 2 ? BOUND.z1 - 0.5 : BOUND.z0 + 0.4); if (!free(x, z) || nearRoad(x, z, 2.6)) continue; tree(x, z, 1 + (k % 3) * 0.15); COL.push({ t: 'c', x, z, r: 0.4 }); }
  if (D.tree) { mk(root, cyl, mat(0x6d4c41), [-12.2, 0.8, 7.6], [0.2, 1.6, 0.2]); mk(root, sph, mat(0x4f9a4a), [-12.2, 2.1, 7.6], 1.1); for (let i = 0; i < 5; i++) mk(root, sph, mat(0xe0443a), [-12.2 + Math.cos(i * 1.3) * 0.9, 2 + (i % 2) * 0.4, 7.6 + Math.sin(i * 1.3) * 0.9], 0.14); COL.push({ t: 'c', x: -12.2, z: 7.6, r: 0.4 }); }
  if (D.flower) for (let i = 0; i < 12; i++) { const x = 8.6 + (i % 4) * 0.5, z = 6 + Math.floor(i / 4) * 0.5; mk(root, cyl, mat(0x4f9a4a), [x, 0.15, z], [0.02, 0.3, 0.02]); mk(root, sph, mat([0xf08aa0, 0xffcf3f, 0xf5f5f0, 0x8e44ad][i % 4]), [x, 0.35, z], 0.12); }
  if (D.gazebo) { const g = new THREE.Group(); g.position.set(-10, 0, 6.8); root.add(g); for (const x of [-1, 1]) for (const z of [-1, 1]) mk(g, cyl, mat(0xf5f5f0), [x, 1, z], [0.08, 2, 0.08]); mk(g, cone, mat(0xb8322a), [0, 2.5, 0], [1.9, 1, 1.9], [0, Math.PI / 4, 0]); mk(g, cyl, mat(0xb08968), [0, 0.06, 0], [1.4, 0.1, 1.4]); }
  if (D.fountain) { const F = LAY.fountain; COL.push({ t: 'c', x: F.x, z: F.z, r: 1.3 }); const g = new THREE.Group(); g.position.set(F.x, 0, F.z); root.add(g); mk(g, cyl, mat(0xcfd8dc), [0, 0.2, 0], [1.3, 0.4, 1.3]); mk(g, cyl, mat(0x4fb3e8), [0, 0.42, 0], [1.1, 0.05, 1.1]); mk(g, cyl, mat(0xcfd8dc), [0, 0.8, 0], [0.18, 1, 0.18]); mk(g, sph, mat(0x8ad4f5), [0, 1.4, 0], 0.3); }
  if (D.windmill) { COL.push({ t: 'c', x: 11.6, z: 6.5, r: 1 }); const g = new THREE.Group(); g.position.set(11.6, 0, 6.5); root.add(g); mk(g, cone, mat(0xf5f5f0), [0, 1.8, 0], [1, 3.6, 1]); const bl = new THREE.Group(); bl.position.set(0, 3.2, 0.9); g.add(bl); for (let i = 0; i < 4; i++) { const a = new THREE.Group(); a.rotation.z = i * Math.PI / 2; bl.add(a); mk(a, box, mat(0xb08968), [0, 1, 0], [0.16, 2, 0.04]); } bl.userData.spin = 1; root.userData.wm = bl; }
  // lamp posts along the roads: warm glow at night
  NIGHT.lamps.length = 0; NIGHT.glint = null;
  { const gc = document.createElement('canvas'); gc.width = gc.height = 64; const gx = gc.getContext('2d'), gg = gx.createRadialGradient(32, 32, 2, 32, 32, 32); gg.addColorStop(0, 'rgba(255,230,160,0.95)'); gg.addColorStop(0.35, 'rgba(255,200,110,0.35)'); gg.addColorStop(1, 'rgba(255,190,90,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64); const gt2 = new THREE.CanvasTexture(gc); NIGHT.gtex = gt2;
    const lamp = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); mk(g, cyl, mat(0x3b3b3b), [0, 1.1, 0], [0.05, 2.2, 0.05]); mk(g, box, mat(0x3b3b3b), [0.12, 2.2, 0], [0.3, 0.05, 0.05]); const bm = new THREE.MeshBasicMaterial({ color: 0xa99f80, toneMapped: false }); const bulb = new THREE.Mesh(sph, bm); bulb.scale.setScalar(0.13); bulb.position.set(0.24, 2.12, 0); g.add(bulb);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })); gl.scale.set(1.9, 1.9, 1); gl.position.set(0.24, 2.12, 0); gl.visible = false; g.add(gl); NIGHT.lamps.push({ bulb: bm, glow: gl }); COL.push({ t: 'c', x, z, r: 0.14 }); };
    [[-2.05, 11.6], [2.05, 8.2], [-2.05, 4.6], [2.05, 1.8], [-2.9, -4.3], [2.9, -4.3], [-2.9, -9.5], [2.9, -9.5], [-6.6, 1.9], [6.4, 1.2], [-4.4, -9.9], [4.4, -9.9], [3.2, 13.3]].forEach(([x, z]) => lamp(x, z)); }
  { const gm = new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }); const gl = new THREE.Mesh(new THREE.CircleGeometry(1, 24), gm); gl.rotation.x = -Math.PI / 2; gl.scale.set(1.5, 0.45, 1); gl.position.set(LAY.pond.x, 0.17, LAY.pond.z + 0.2); gl.visible = false; root.add(gl); NIGHT.glint = gl; }
  buildHouse(root, click);
  LT.key = '';
  // bubbles for ready crops live on the plot objects
  plotObjs.forEach(o => { const b = bub('🧺'); b.position.set(0, 1.9, 0); b.visible = false; o.g.add(b); o.b = b; });
}
function syncPlots() {
  plotObjs.forEach((o, i) => {
    const p = S.plots[i]; if (!p) return;
    const stage = p.c ? Math.min(3, Math.floor(p.p / CROPS[p.c].sec * 3.999)) : -1, key = (p.c || '') + stage + (p.w ? 'w' : '');
    if (o.key !== key) {
      o.key = key; if (o.crop) { o.g.remove(o.crop); o.crop = null; }
      o.g.children[0].material = soilMat(p.w ? 1 : 0);
      if (p.c) { o.crop = cropField(p.c, stage); o.crop.position.y = 0.2; o.g.add(o.crop); }
    }
    o.b.visible = !!(p.c && cropReady(p)); if (o.b.visible) o.b.position.y = 1.9 + Math.sin(performance.now() / 250 + i) * 0.12;
  });
}
function anim(dt) {
  const t = performance.now() / 1000;
  if (NIGHT.moon && NIGHT.moon.visible) { NIGHT.moon.lookAt(camera.position); }
  const bg = root && root.userData.barn; if (bg) { const tr = used() <= 0 ? 0 : Math.min(4, Math.ceil(used() / cap() * 4)); if (tr !== bg.userData.tier) fillBarn(bg, tr); }
  animM.forEach((m, i) => { const a = S.pen[i]; if (!a) return; const n = m.userData.pn; n.w -= dt;
    if (a.st === 'ready' || n.w > 0) { m.position.y = a.st === 'ready' ? Math.abs(Math.sin(t * 4 + i)) * 0.12 : 0; } else { if (Math.hypot(n.tx - m.position.x, n.tz - m.position.z) < 0.15) { n.tx = rnd(PENR.x0 + 0.7, PENR.x1 - 0.7); n.tz = rnd(PENR.z0 + 0.7, PENR.z1 - 0.7); n.w = rnd(1, 4); } const dx = n.tx - m.position.x, dz = n.tz - m.position.z, d = Math.hypot(dx, dz) || 1; m.position.x += dx / d * dt * 0.7; m.position.z += dz / d * dt * 0.7; m.rotation.y = Math.atan2(dx, dz); m.position.y = Math.abs(Math.sin(t * 8 + i)) * 0.05; }
    m.userData.b.visible = a.st === 'ready'; });
  fishM.forEach((m, i) => { const f = S.pond[i]; if (!f) return; const s = m.userData.fs; s.a += dt * s.sp; m.position.set(Math.cos(s.a) * s.r * 1.35, 0.17, Math.sin(s.a) * s.r); m.rotation.y = -s.a + (s.sp > 0 ? -Math.PI / 2 : Math.PI / 2); const sc = 0.55 + 0.45 * Math.min(1, f.p / FISH[f.f].sec); m.userData.b.visible = fishReady(f); m.scale.setScalar(sc * 1.4); });
  if (root && root.userData.wm) root.userData.wm.rotation.z += dt * 1.2;
}
const KF = [   // hour, sky top, horizon, light colour, light power, ambient. After ~19:30 the light is the moon's, before ~06:30 too
  [0, 0x0b1533, 0x2c4272, 0xb4ccff, 1.0, 0.95], [5, 0x0b1533, 0x2c4272, 0xb4ccff, 1.0, 0.95], [6.5, 0x4a78b8, 0xf2a86a, 0xffb878, 1.1, 0.75], [8.5, 0x3f86d6, 0xbfdcf0, 0xfff2dc, 1.8, 0.95],
  [12, 0x3a82d8, 0xc4e0f4, 0xfff6e8, 2.0, 1.0], [16, 0x3f86d6, 0xbfdcf0, 0xfff2dc, 1.8, 0.95], [18, 0x4a5f9c, 0xf08a5a, 0xff9a5a, 1.15, 0.75], [19.5, 0x1b2658, 0x4a5b94, 0xc4d6ff, 1.0, 0.9], [21, 0x0b1533, 0x2c4272, 0xb4ccff, 1.0, 0.95], [24, 0x0b1533, 0x2c4272, 0xb4ccff, 1.0, 0.95],
];
const LT = { ld: new THREE.Vector3(0, 30, 12), top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), tmp: new THREE.Color(), key: '', night: 0 };
const hourNow = () => (9 + (S ? S.dayT / dayLen() * 24 : 0)) % 24;
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const NIGHT = { fill: null, toast: 0, moon: null, halo: null, stars: [], lamps: [], wins: [], glint: null, lampL: null, mv: new THREE.Vector3() };
function applyLight() {
  const cv = $('c'), h = hourNow(); let i = 0; while (i < KF.length - 2 && h >= KF[i + 1][0]) i++;
  const a = KF[i], b = KF[i + 1], k = Math.max(0, Math.min(1, (h - a[0]) / (b[0] - a[0])));
  LT.top.setHex(a[1]).lerp(LT.tmp.setHex(b[1]), k); LT.hor.setHex(a[2]).lerp(LT.tmp.setHex(b[2]), k); LT.sun.setHex(a[3]).lerp(LT.tmp.setHex(b[3]), k);
  const key = h.toFixed(2); if (key === LT.key) return; LT.key = key;
  const night = h >= 12 ? sstep(18.3, 19.8, h) : 1 - sstep(5.3, 6.8, h); LT.night = night;
  skyU.top.value.copy(LT.top); skyU.hor.value.copy(LT.hor);
  scene.fog.color.copy(LT.hor).convertSRGBToLinear();
  sunL.color.copy(LT.sun).convertSRGBToLinear(); sunL.intensity = (a[4] + (b[4] - a[4]) * k) * (1.18 - 0.3 * night); hemiL.intensity = (a[5] + (b[5] - a[5]) * k) * (0.62 + 0.4 * night);   // V.1 look by day; at night a soft blue sky light fills the shadows so the farm stays readable
  hemiL.color.copy(LT.top).lerp(LT.hor, 0.5 + 0.3 * night).convertSRGBToLinear(); hemiL.groundColor.setHex(night > 0.5 ? 0x26402f : 0x4d6a35).lerp(LT.tmp.setHex(0x26402f), night * 0.5).convertSRGBToLinear();
  renderer.toneMappingExposure = 0.82 + 0.3 * night;
  // the sun crosses the sky by day, the moon by night: one shadow-casting light that follows whichever is up
  const az = (h - 6) / 14 * Math.PI, el = (8 + 62 * Math.sin(Math.max(0, Math.min(1, (h - 6) / 13.5)) * Math.PI)) * Math.PI / 180;
  const hm = h < 12 ? h + 24 : h, um = Math.max(0, Math.min(1, (hm - 18) / 12)), azm = um * Math.PI, elm = (14 + 20 * Math.sin(um * Math.PI)) * Math.PI / 180;
  const mx = -Math.cos(azm) * 30, my = Math.sin(elm) * 30 + 3, mz = -8 - 8 * Math.sin(azm), sx = -Math.cos(az) * 26, sy = Math.max(6, Math.sin(el) * 30), sz = 12 + Math.sin(az) * 4;
  LT.ld.set(sx + (mx - sx) * night, sy + (my - sy) * night, sz + (mz - sz) * night);
  NIGHT.mv.set(mx, my, mz);
  if (NIGHT.moon) {
    const hl = Math.hypot(mx, mz - 10), esk = (7 + 13 * Math.sin(um * Math.PI)) * Math.PI / 180, up = night > 0.02 && um > 0 && um < 1, d = new THREE.Vector3(mx / hl * Math.cos(esk), Math.sin(esk), (mz - 10) / hl * Math.cos(esk)).multiplyScalar(175), fade = Math.min(1, night * 1.4) * Math.min(1, Math.sin(um * Math.PI) * 4 + 0.15);
    NIGHT.moon.visible = NIGHT.halo.visible = up; NIGHT.moon.position.copy(d); NIGHT.halo.position.copy(d); NIGHT.moon.material.opacity = fade; NIGHT.halo.material.opacity = fade * 0.75;
    NIGHT.stars.forEach(st => { st.material.opacity = night * 0.95; st.visible = night > 0.02; });
    for (const l of NIGHT.lamps) { l.glow.material.opacity = night * 0.8; l.glow.visible = night > 0.02; l.bulb.color.setHex(night > 0.3 ? 0xfff0b8 : 0xa99f80); }
    for (const w of NIGHT.wins) w.emissiveIntensity = night * 1.25;
    if (NIGHT.lampL) NIGHT.lampL.intensity = night * 1.8;
    if (NIGHT.fill) NIGHT.fill.intensity = night * 0.4;
    cv.style.filter = `saturate(${(1.15 - 0.25 * night).toFixed(2)}) contrast(1.06)`;
    if (night > 0.9 && up && NIGHT.toast !== S.dayN) { NIGHT.toast = S.dayN; toast('🌙 ดวงจันทร์ขึ้นแล้ว ลากกล้องลงต่ำ ๆ เพื่อดูท้องฟ้า'); }
    if (NIGHT.glint) { NIGHT.glint.visible = up && NIGHT.mv.y > 0; NIGHT.glint.material.opacity = fade * 0.55; NIGHT.glint.position.x = LAY.pond.x - mx * 0.04; NIGHT.glint.position.z = LAY.pond.z + 0.2; }
  }
}
let sunL, hemiL, skyU;
function resize() { const w = $('app').clientWidth, h = $('app').clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
function init3d() {
  const cv = $('c'); renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.82;   // lower than before: 1.2 washed the colours out (V.1 renders at 1.0 with a stronger sun)
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfdcf0, 40, 105);
  camera = new THREE.PerspectiveCamera(55, 0.5, 0.5, 260);
  skyU = { top: { value: new THREE.Color(0x3f86d6) }, hor: { value: new THREE.Color(0xbfdcf0) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 24, 12), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying float h; void main(){ float k = smoothstep(-0.05, 0.55, h); gl_FragColor = vec4(mix(hor, top, k), 1.0); }' }));
  sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky); scene.userData.sky = sky;
  hemiL = new THREE.HemisphereLight(0xdcefff, 0x4d6a35, 0.65); scene.add(hemiL);
  sunL = new THREE.DirectionalLight(0xfff2dc, 1.1); sunL.castShadow = true; sunL.shadow.mapSize.set(1024, 1024); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  const sc = sunL.shadow.camera; sc.left = -17; sc.right = 17; sc.top = 21; sc.bottom = -21; sc.near = 1; sc.far = 80; scene.add(sunL); scene.add(sunL.target);
  // the night sky: stars, a moon with craters and a soft halo, and a warm lamp light over the plaza
  { const rnd2 = (() => { let x = 12345; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();
    for (const [n, size] of [[420, 1.8], [90, 3.0]]) { const pos = []; for (let q = 0; q < n; q++) { const u = rnd2() * 6.283, v = 0.06 + rnd2() * 0.94, r = Math.sqrt(1 - v * v); pos.push(Math.cos(u) * r * 185, v * 185, Math.sin(u) * r * 185); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const st = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff6e0, size, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false })); st.frustumCulled = false; st.renderOrder = -1; scene.add(st); NIGHT.stars.push(st); }
    const mc = document.createElement('canvas'); mc.width = mc.height = 128; const g2 = mc.getContext('2d'), gr = g2.createRadialGradient(56, 54, 6, 64, 64, 62); gr.addColorStop(0, '#fffbe8'); gr.addColorStop(0.8, '#f3ebc8'); gr.addColorStop(1, '#e2d6a8'); g2.fillStyle = gr; g2.beginPath(); g2.arc(64, 64, 62, 0, 7); g2.fill();
    for (const [x, y, r, al] of [[44, 48, 11, 0.16], [78, 40, 8, 0.13], [82, 78, 14, 0.14], [50, 86, 7, 0.12], [64, 62, 5, 0.1], [98, 60, 6, 0.1], [34, 70, 6, 0.1]]) { g2.fillStyle = `rgba(150,138,100,${al})`; g2.beginPath(); g2.arc(x, y, r, 0, 7); g2.fill(); }
    const mt = new THREE.CanvasTexture(mc); mt.encoding = THREE.sRGBEncoding; NIGHT.moon = new THREE.Mesh(new THREE.CircleGeometry(10, 40), new THREE.MeshBasicMaterial({ map: mt, transparent: true, depthWrite: false, fog: false, toneMapped: false })); NIGHT.moon.renderOrder = 0; NIGHT.moon.frustumCulled = false; scene.add(NIGHT.moon);
    const hc = document.createElement('canvas'); hc.width = hc.height = 128; const g3 = hc.getContext('2d'), hg = g3.createRadialGradient(64, 64, 4, 64, 64, 64); hg.addColorStop(0, 'rgba(255,248,215,0.9)'); hg.addColorStop(0.3, 'rgba(210,225,255,0.32)'); hg.addColorStop(1, 'rgba(160,190,255,0)'); g3.fillStyle = hg; g3.fillRect(0, 0, 128, 128);
    NIGHT.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); NIGHT.halo.scale.set(80, 80, 1); NIGHT.halo.renderOrder = -0.5; scene.add(NIGHT.halo);
    NIGHT.fill = new THREE.DirectionalLight(0x9fb8ff, 0); NIGHT.fill.position.set(0, 9, 30); scene.add(NIGHT.fill);
    NIGHT.lampL = new THREE.PointLight(0xffc27a, 0, 16, 2); NIGHT.lampL.position.set(LAY.plaza.x, 2.8, LAY.plaza.z + 1.5); scene.add(NIGHT.lampL); }
  ray = new THREE.Raycaster(); build3d(); resize(); addEventListener('resize', resize); try { new ResizeObserver(resize).observe($('app')); } catch (e) { }
  bindInput();
}
// ---------------- the walking farmer (same view as V.1: third person, orbit by dragging, joystick + action button) ----------------
const P = { x: 0, z: 10.5, rot: Math.PI, ph: 0 }, CAM = { yaw: 0, pitch: 0.62, dist: 10.2 }, JOY = { x: 0, y: 0, id: null }, KEYS = {};
let playerG = null, legs = [], arms = [], curT = null;
function makePlayer() {
  const g = new THREE.Group(), skin = mat(0xe3b08a), shirt = mat(0xc8433a), pants = mat(0x3e6aa8), shoe = mat(0x5a3a22), hair = mat(0x2b1a10), straw = mat(0xe8c36a);
  mk(g, sph, shirt, [0, 1.15, 0], [0.3, 0.4, 0.2]); mk(g, sph, skin, [0, 1.7, 0], [0.2, 0.22, 0.2]); mk(g, sph, hair, [0, 1.76, -0.04], [0.21, 0.2, 0.2]);
  mk(g, cyl, straw, [0, 1.88, 0], [0.5, 0.03, 0.5]); mk(g, cyl, straw, [0, 1.96, 0], [0.22, 0.14, 0.22]); mk(g, cyl, mat(0xb8322a), [0, 1.92, 0], [0.225, 0.04, 0.225]);
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.36, 1.45, 0); g.add(a); mk(a, cyl, shirt, [0, -0.22, 0], [0.09, 0.45, 0.09]); mk(a, sph, skin, [0, -0.5, 0], 0.09); arms.push(a);
    const l = new THREE.Group(); l.position.set(s * 0.15, 0.85, 0); g.add(l); mk(l, cyl, pants, [0, -0.35, 0], [0.12, 0.7, 0.12]); mk(l, sph, shoe, [0, -0.78, 0.07], [0.13, 0.09, 0.2]); legs.push(l);
  }
  return g;
}
function resolve(x, z, r) {
  for (const c of COL) {
    if (c.t === 'c') { const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = r + c.r; if (d < m && d > 1e-5) { x = c.x + dx / d * m; z = c.z + dz / d * m; } }
    else { const cx = Math.max(c.x - c.hw, Math.min(c.x + c.hw, x)), cz = Math.max(c.z - c.hd, Math.min(c.z + c.hd, z)), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d > 1e-5) { x = cx + dx / d * r; z = cz + dz / d * r; } else { z = c.z + (z > c.z ? c.hd + r : -c.hd - r); } } }
  }
  return [Math.max(BOUND.x0 + 0.6, Math.min(BOUND.x1 - 0.6, x)), Math.max(BOUND.z0 + 0.6, Math.min(BOUND.z1 - 0.6, z))];
}
const V = { x: 0, z: 0 }, CF = { x: 0, z: 0, yaw: 0, pitch: 0.62, init: 0 };
function stepPlayer(dt) {
  let jx = JOY.x, jy = JOY.y;
  if (KEYS.a || KEYS.arrowleft) jx -= 1; if (KEYS.d || KEYS.arrowright) jx += 1; if (KEYS.w || KEYS.arrowup) jy += 1; if (KEYS.s || KEYS.arrowdown) jy -= 1;
  let m = Math.hypot(jx, jy); if (m > 1) { jx /= m; jy /= m; m = 1; }
  const idle = tab || $('title').hidden === false || m < 0.1;
  if (!idle) { const e = Math.pow((m - 0.1) / 0.9, 1.15); jx = jx / m * e; jy = jy / m * e; m = e; }
  // the wanted velocity follows the stick; the real velocity eases towards it (frame-rate independent), so starts and stops are soft
  if (!tab) { if (KEYS.q) CAM.yaw += 1.8 * dt; if (KEYS.r) CAM.yaw -= 1.8 * dt; }
  const spd = S.en < TIRED ? 3.7 : 4.6, tx = idle ? 0 : (-Math.sin(CAM.yaw) * jy + Math.cos(CAM.yaw) * jx) * spd, tz = idle ? 0 : (-Math.cos(CAM.yaw) * jy - Math.sin(CAM.yaw) * jx) * spd, k = 1 - Math.exp(-dt * (idle ? 13 : 9));
  V.x += (tx - V.x) * k; V.z += (tz - V.z) * k;
  const sp = Math.hypot(V.x, V.z);
  if (sp > 0.03) {
    [P.x, P.z] = resolve(P.x + V.x * dt, P.z + V.z * dt, 0.42);
    let da = Math.atan2(V.x, V.z) - P.rot; da = Math.atan2(Math.sin(da), Math.cos(da)); P.rot += da * (1 - Math.exp(-dt * 11));
    P.ph += sp * dt * 2.3;
  } else { V.x = V.z = 0; }
  const amp = Math.min(1, sp / 3.2) * 0.75, sw = Math.sin(P.ph) * amp, kk = 1 - Math.exp(-dt * 14);
  legs[0].rotation.x += (sw - legs[0].rotation.x) * kk; legs[1].rotation.x += (-sw - legs[1].rotation.x) * kk; arms[0].rotation.x += (-sw * 0.8 - arms[0].rotation.x) * kk; arms[1].rotation.x += (sw * 0.8 - arms[1].rotation.x) * kk;
  playerG.position.y = Math.abs(Math.sin(P.ph)) * 0.04 * Math.min(1, sp / 3);
}
function followCam(dt) {
  if (!CF.init) { CF.x = P.x; CF.z = P.z; CF.yaw = CAM.yaw; CF.pitch = CAM.pitch; CF.init = 1; }
  const kp = 1 - Math.exp(-dt * 10), kc = 1 - Math.exp(-dt * 14);
  CF.x += (P.x - CF.x) * kp; CF.z += (P.z - CF.z) * kp; CF.yaw += (CAM.yaw - CF.yaw) * kc; CF.pitch += (CAM.pitch - CF.pitch) * kc;
  playerG.position.x = P.x; playerG.position.z = P.z; playerG.rotation.y = P.rot;
  const cp = Math.cos(CF.pitch);
  camera.position.set(CF.x + Math.sin(CF.yaw) * cp * CAM.dist, 1.3 + Math.sin(CF.pitch) * CAM.dist, CF.z + Math.cos(CF.yaw) * cp * CAM.dist); camera.lookAt(CF.x, 1.1, CF.z);
  sunL.target.position.set(CF.x, 0, CF.z); sunL.position.set(CF.x + LT.ld.x, LT.ld.y, CF.z + LT.ld.z);   // the shadow area follows you around the bigger farm
}
function water(i) { const p = S.plots[i]; if (p.c && !p.w) { p.w = 1; sfx(420); toast('💧 รดน้ำแล้ว โตเร็วขึ้น 1.5 เท่า'); } }
function targets() {
  if (PLC) return { d: 0, icon: '✅', label: PLC.err ? 'วางตรงนี้ไม่ได้' : 'วางแปลงที่นี่', fn: () => A.plcok() };
  if (PICK) { let best = null; S.plots.forEach((p, i) => { const o = plotPos(i), d = Math.hypot(P.x - o.x, P.z - o.z); if (d < 2.2 && (!best || d < best.d)) best = { d, i }; }); return best ? { d: best.d, icon: '✋', label: `หยิบแปลง ${best.i + 1} เพื่อย้าย`, fn: () => startPlace(best.i, 'move') } : null; }
  const c = [], add = (d, icon, label, fn) => c.push({ d, icon, label, fn }), at = (x, z) => Math.hypot(P.x - x, P.z - z);
  S.plots.forEach((p, i) => {
    const o = plotPos(i), d = at(o.x, o.z); if (d > 1.5) return;
    if (!p.c) add(d, '🌱', `ปลูก${CROPS[S.sel].n} ${(S.seeds[S.sel] || 0) > 0 ? '(เมล็ดในคลัง ×' + S.seeds[S.sel] + ')' : seedUnit(S.sel) + '฿'}`, () => plant(i));
    else if (cropReady(p)) add(d, '🧺', `เก็บ${CROPS[p.c].n}`, () => harvestPlot(i));
    else if (!p.w) add(d, '💧', `รดน้ำ ${CROPS[p.c].n}`, () => water(i));
    else add(d + 0.8, CROPS[p.c].i, `${CROPS[p.c].n} กำลังโต`, () => { const left = Math.ceil((CROPS[p.c].sec - p.p) / 1.5); toast(`${CROPS[p.c].i} อีก ${left >= 60 ? Math.ceil(left / 60) + ' นาที' : left + ' วิ'}`); });
  });
  { const pd = penDims(); if (P.x > pd.x0 - 0.6 && P.x < pd.x1 + 0.6 && P.z > pd.z0 - 0.6 && P.z < pd.z1 + 0.9) {
    const rd = S.pen.filter(a => a.st === 'ready').length;
    if (rd) add(0.4, '🧺', `เก็บผลผลิตสัตว์ (${rd})`, () => A.collall()); else add(1.2, '🐾', 'ดูคอกสัตว์', () => openTab('pen'));
  } }
  if (at(LAY.pond.x - 1.6, LAY.pond.z + 1.2) < 4.6) { const rd = S.pond.filter(fishReady).length; if (rd) add(0.4, '🎣', `จับปลา (${rd})`, () => { A.fishall(); build3d(); }); else add(1.2, '🐟', 'ดูบ่อปลา', () => openTab('pond')); }
  if (at(-7.7, 12.3) < 3.0) add(at(-7.7, 12.3), S.en < TIRED ? '😮‍💨' : '🏠', S.en < TIRED ? 'บ้าน (พักผ่อน)' : 'บ้านของฉัน', () => openTab('home'));
  if (at(0, -9) < 3.2) add(at(0, -9), '🏪', 'ตลาด', () => openTab('market'));
  if (at(LAY.barn.x, LAY.barn.z + 1.4) < 3.4) add(at(LAY.barn.x, LAY.barn.z + 1.4), '🏚️', 'ยุ้งฉาง', () => openTab('barn'));
  if (S.u.work && at(LAY.work.x, LAY.work.z + 1.4) < 3.2) add(at(LAY.work.x, LAY.work.z + 1.4), '🏭', 'โรงงานแปรรูป', () => openTab('work'));
  return c.sort((a, b) => a.d - b.d)[0] || null;
}
function doAct() { if (curT) { curT.fn(); render(); hud(); queueSave(); } }
function bindInput() {
  const joy = $('joy'), knob = $('knob');
  const jset = e => { const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = Math.round(r.width * 0.34); if (m > R) { dx = dx / m * R; dy = dy / m * R; } JOY.x = dx / R; JOY.y = -dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joy.addEventListener('pointerdown', e => { JOY.id = e.pointerId; joy.setPointerCapture(e.pointerId); jset(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) jset(e); });
  const jend = e => { if (e.pointerId === JOY.id) { JOY.id = null; JOY.x = JOY.y = 0; knob.style.transform = ''; } };
  joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
  const cv = $('c'); let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; CAM.yaw -= (e.clientX - drag.x) * 0.008; CAM.pitch = Math.max(0.12, Math.min(1.15, CAM.pitch + (e.clientY - drag.y) * 0.005)); drag.x = e.clientX; drag.y = e.clientY; });
  const dend = e => { if (drag && e.pointerId === drag.id) drag = null; }; cv.addEventListener('pointerup', dend); cv.addEventListener('pointercancel', dend);
  $('act').addEventListener('click', doAct);
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase(), playing = S && $('title').hidden && $('tip').hidden;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === 'e' || k === ' ' || k === 'enter') { if (!tab && $('title').hidden && $('tip').hidden) { e.preventDefault(); doAct(); } return; }
    if (playing) {
      if (k === 'escape') { if (PLC || PICK) A.plcno(); else if (tab) closeSheet(); return; }
      const tabs = ['farm', 'pen', 'pond', 'market', 'up'], i = '12345'.indexOf(k);
      if (i >= 0 && k.length === 1) { e.preventDefault(); if (PLC) return; if (tab === tabs[i]) closeSheet(); else openTab(tabs[i]); return; }
      if (k === 'h' && !tab) { e.preventDefault(); const b = $('harvest'); if (b && !b.hidden) b.click(); return; }
      if (k === '+' || k === '=') { CAM.dist = Math.max(5, CAM.dist - 1); return; }
      if (k === '-' || k === '_') { CAM.dist = Math.min(24, CAM.dist + 1); return; }
      if (k.startsWith('arrow') || k === ' ') e.preventDefault();
    }
    KEYS[k] = 1;
  });
  // mouse wheel zooms, a right-click does not open the browser menu over the farm
  cv.addEventListener('wheel', e => { e.preventDefault(); CAM.dist = Math.max(5, Math.min(24, CAM.dist * (1 + Math.sign(e.deltaY) * 0.08))); }, { passive: false });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('blur', () => { for (const k in KEYS) delete KEYS[k]; });
  addEventListener('keyup', e => { delete KEYS[e.key.toLowerCase()]; });
}

// ---------------- title: two save slots ----------------
const ago = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? 'เมื่อสักครู่' : m < 60 ? `${m} นาทีที่แล้ว` : m < 1440 ? `${Math.round(m / 60)} ชม.ที่แล้ว` : `${Math.round(m / 1440)} วันที่แล้ว`; };
async function renderTitle() {
  $('slots').innerHTML = '<p style="text-align:center;color:var(--ink-dim)">กำลังโหลดเซฟ…</p>';
  await ping(); setSrv();
  const out = [];
  for (const n of [1, 2]) {
    const d = await readSlot(n);
    out.push(d ? `<div class="slot panel"><h4>💾 ช่อง ${n} · ${d.name || 'ชาวไร่'}</h4><p>Lv.${d.lvl} · ${fmt(d.money)} ฿ · วันที่ ${d.dayN || Math.floor(d.t / DAY) + 1} · เล่นล่าสุด ${ago(d.last)}</p><div class="row"><button class="btn big" data-a="play" data-v="${n}">▶ เล่นต่อ</button><button class="btn ghost" data-a="copycode" data-v="${n}">📋</button><button class="btn ghost" data-a="del" data-v="${n}">ลบ</button></div></div>`
      : `<div class="slot panel"><h4>💾 ช่อง ${n} · ว่าง</h4><p>เริ่มฟาร์มใหม่ในช่องนี้</p><input id="nm${n}" maxlength="14" placeholder="ชื่อของคุณ เช่น สมใจ"><div class="row"><button class="btn big" data-a="newgame" data-v="${n}">🌱 เริ่มฟาร์มใหม่</button><button class="btn ghost" data-a="importcode" data-v="${n}">📥 นำเข้ารหัสเซฟ</button></div></div>`);
  }
  $('slots').innerHTML = out.join('');
}
function showTitle() { if (S) save(); S = null; slot = 0; $('title').hidden = false; $('tip').hidden = true; renderTitle(); }
let loopOn = false, lastT = 0, acc = 0, saveT = 0;
// A save from ANY earlier version (or one played a long way, or damaged) is brought up to date here, so it always opens in the latest version:
// missing fields get defaults, numbers are repaired, things that no longer exist are dropped, and the counts that changed meaning are converted.
function sanitize(S, raw) {
  const num = (v, d, a = -Infinity, b = Infinity) => (typeof v === 'number' && isFinite(v) ? Math.min(b, Math.max(a, v)) : d);
  const F = fresh(S.name);
  if ((raw.pv || 0) < 2) { S.pv = 2; S.u = Object.assign({}, S.u); S.u.plot = Math.max(0, PLOTS.findIndex(x => x >= (Array.isArray(S.plots) ? S.plots.length : 0))); if (S.u.plot < 0) S.u.plot = PLOTS.length - 1; }   // old saves counted plots 6/8/12/16: keep the beds you had
  S.name = typeof S.name === 'string' && S.name ? S.name.slice(0, 14) : 'ชาวไร่';
  for (const k of ['money', 'xp', 't', 'dayT', 'bank']) S[k] = num(S[k], F[k], 0);
  S.lvl = Math.min(300, Math.floor(num(S.lvl, 1, 1))); S.dayN = Math.floor(num(S.dayN, 1, 1)); S.bankDay = Math.floor(num(S.bankDay, S.dayN, 1)); S.en = num(S.en, 100, 0, 100);
  for (const k of ['feed', 'feed2', 'fert']) S[k] = Math.floor(num(S[k], k === 'feed' ? F.feed : 0, 0));
  if (!TM[S.tm]) S.tm = 'normal'; if (S.dayT >= dayLen()) S.dayT = 0;
  S.u = Object.assign({}, F.u, S.u && typeof S.u === 'object' ? S.u : {}); for (const u of UPS) S.u[u.k] = Math.floor(num(S.u[u.k], 0, 0, u.max));
  S.u.plot = Math.floor(num(S.u.plot, 0, 0, PLOTS.length - 1)); S.pv = 3;
  if (!Array.isArray(S.plots)) S.plots = [];
  // a bed that was bought but never placed (the game was closed while placing it) is refunded; a saved position outside the farm is dropped (the bed goes back to its row)
  let refund = 0; S.plots = S.plots.filter(p => { if (p && p.un) { refund += num(p.paid, 0, 0); return false; } return true; }); S.money += refund;
  S.plots = S.plots.slice(0, PLOT_MAX).map(p => { const o = p && typeof p === 'object' ? p : {}; const c = CROPS[o.c] ? o.c : null; const r = { c, p: c ? num(o.p, 0, 0, CROPS[c].sec) : 0, w: o.w ? 1 : 0, f: o.f ? 1 : 0 };
    if (typeof o.x === 'number' && typeof o.z === 'number' && isFinite(o.x) && isFinite(o.z) && o.x > BOUND.x0 && o.x < BOUND.x1 && o.z > BOUND.z0 && o.z < BOUND.z1) { r.x = o.x; r.z = o.z; } return r; });
  S.pen = (Array.isArray(S.pen) ? S.pen : []).filter(a => a && ANIMALS[a.a]).map(a => ({ a: a.a, st: ['idle', 'prod', 'ready'].includes(a.st) ? a.st : 'idle', t: num(a.t, 0, 0), pf: a.pf ? 1 : 0 }));
  S.pond = (Array.isArray(S.pond) ? S.pond : []).filter(f => f && FISH[f.f]).map(f => ({ f: f.f, p: num(f.p, 0, 0, FISH[f.f].sec) }));
  const inv = {}; for (const k in (S.inv && typeof S.inv === 'object' ? S.inv : {})) { const v = Math.floor(num(S.inv[k], 0, 0)); if (v > 0 && ITEMS[k]) inv[k] = v; } S.inv = inv;
  const sd = {}; for (const k in (S.seeds && typeof S.seeds === 'object' ? S.seeds : {})) { const v = Math.floor(num(S.seeds[k], 0, 0, 99)); if (v > 0 && CROPS[k]) sd[k] = v; } S.seeds = sd;
  if (!CROPS[S.sel] || CROPS[S.sel].lv > S.lvl) S.sel = 'carrot';
  for (const k of ['deco', 'home']) { const o = {}; for (const id in (S[k] && typeof S[k] === 'object' ? S[k] : {})) if (S[k][id]) o[id] = 1; S[k] = o; }
  if (S.job && !(RECIPES.some(r => r.id === S.job.id))) S.job = null; else if (S.job) S.job.t = num(S.job.t, 0, 0);
  if (!Array.isArray(S.hist)) S.hist = []; if (!S.led || typeof S.led !== 'object') S.led = null;
  if (!S.stats || typeof S.stats !== 'object') S.stats = { earned: 0 }; S.stats.earned = num(S.stats.earned, 0, 0);
  { const n = penDims(S.u.pen); S.plots.forEach((p, i) => { if (typeof p.x === 'number' && p.x > n.x0 - 1.9 && p.x < n.x1 + 1.9 && p.z > n.z0 - 1.9 && p.z < n.z1 + 1.9) { delete p.x; delete p.z; } }); }   // a bed standing where the bigger pen now is goes back to its standard slot
  S.px = num(S.px, 0, BOUND.x0, BOUND.x1); S.pz = num(S.pz, 10.5, BOUND.z0, BOUND.z1); S.last = num(S.last, Date.now(), 0, Date.now());
}
async function startGame(n, name) {
  let data = typeof name === 'string' ? null : await readSlot(n);
  S = Object.assign(fresh(typeof name === 'string' ? name : ''), data || {}); slot = n;
  if (!S.seeds) S.seeds = {}; if (!S.hist) S.hist = []; if (!S.home) S.home = {}; if (S.en == null) S.en = 100;
  if (data && data.dayN == null) { S.dayN = Math.floor(S.t / DAY) + 1; S.dayT = (S.t % DAY) / DAY * dayLen(); }      // older saves: keep the day number and the time of day
  if (data) sanitize(S, data);
  while (S.plots.length < PLOTS[S.u.plot]) S.plots.push({ c: null, p: 0, w: S.u.sprinkler ? 1 : 0, f: 0 });
  // offline progress: the farm kept growing while the game was closed (max 12 hours)
  const off = Math.min(12 * 3600, Math.max(0, (Date.now() - S.last) / 1000)); if (data && off > 5) { const before = readyCount(); update.nd = 1; update(off); update.nd = 0; if (readyCount() > before) setTimeout(() => toast(`ระหว่างที่ไม่อยู่ มีผลผลิตพร้อมเก็บ ${readyCount()} อย่าง`), 900); }
  P.x = S.px || 0; P.z = S.pz || 10.5; P.rot = Math.PI; CAM.yaw = 0; CF.init = 0; V.x = V.z = 0; LT.key = '';
  if (!renderer) { init3d(); playerG = makePlayer(); scene.add(playerG); } else build3d();
  $('title').hidden = true; hud(); save(); if (!S.tip) $('tip').hidden = false;
  if (!loopOn) { loopOn = true; lastT = performance.now(); requestAnimationFrame(loop); }
}
function loop(now) {
  const dt = Math.min(0.25, (now - lastT) / 1000); lastT = now;
  if (S) {
    const dm = Math.min(dt, 0.05); update(dt); syncPlots(); anim(dm); stepPlayer(dm); placeStep(); followCam(dm); applyLight();
    const t = tab || !$('tip').hidden ? null : targets(); curT = t;
    const lbl = $('actlbl'), b = $('act'), key = t ? t.icon + t.label : '';
    if (loop.k !== key) { loop.k = key; b.textContent = t ? t.icon : '✋'; b.classList.toggle('idle', !t); lbl.hidden = !t; lbl.textContent = t ? t.label : ''; }
    renderer.render(scene, camera);
    acc += dt; if (acc > 0.5) { acc = 0; hud(); if (tab && (tab === 'pen' || tab === 'pond' || tab === 'work' || tab === 'farm' || tab === 'barn' || tab === 'home')) render(); } saveT += dt; if (saveT > 3) { saveT = 0; save(); }
  }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { if (!S) return; if (document.hidden) save(); else { const off = Math.min(12 * 3600, (Date.now() - S.last) / 1000); if (off > 3) { update.nd = 1; update(off); update.nd = 0; } lastT = performance.now(); } });
addEventListener('pagehide', () => { if (S) save(); }); addEventListener('beforeunload', () => { if (S) save(); });
showTitle();
window.Farm2 = { get S() { return S; }, update, build3d, openTab, plant, price, P, CAM, startGame, get online() { return online; } };
