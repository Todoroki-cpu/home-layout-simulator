/**
 * 家具カタログ定義 (Furniture Catalog)
 * 寸法はすべてメートル (m)
 */

export const FURNITURE_CATALOG = [
  // --- リビング ---
  {
    type: "sofa_3p",
    name: "3人掛けソファ",
    category: "living",
    width: 1.9,
    depth: 0.88,
    height: 0.78,
    color: "#4a5568",
    colorOptions: ["#4a5568", "#718096", "#a0aec0", "#795548", "#2d3748"],
    modelType: "sofa",
    icon: "🛋️"
  },
  {
    type: "sofa_2p",
    name: "2人掛けソファ",
    category: "living",
    width: 1.45,
    depth: 0.85,
    height: 0.78,
    color: "#718096",
    colorOptions: ["#718096", "#4a5568", "#a0aec0", "#6d4c41"],
    modelType: "sofa",
    icon: "🛋️"
  },
  {
    type: "tv_board_55",
    name: "テレビボード (55型TV付)",
    category: "living",
    width: 1.6,
    depth: 0.42,
    height: 1.15,
    color: "#3e2723",
    colorOptions: ["#3e2723", "#5d4037", "#212121", "#d7ccc8"],
    modelType: "tvBoard",
    icon: "📺"
  },
  {
    type: "coffee_table",
    name: "リビングテーブル",
    category: "living",
    width: 1.05,
    depth: 0.55,
    height: 0.38,
    color: "#8d6e63",
    colorOptions: ["#8d6e63", "#4e342e", "#212121", "#e0e0e0"],
    modelType: "coffeeTable",
    icon: "🪑"
  },
  {
    type: "living_rug",
    name: "リビングラグ (大)",
    category: "living",
    width: 2.0,
    depth: 1.5,
    height: 0.02,
    color: "#b0bec5",
    colorOptions: ["#b0bec5", "#eceff1", "#cfd8dc", "#8d6e63"],
    modelType: "rug",
    icon: "🔲"
  },
  {
    type: "indoor_plant",
    name: "観葉植物 (パキラ調)",
    category: "living",
    width: 0.5,
    depth: 0.5,
    height: 1.35,
    color: "#2e7d32",
    colorOptions: ["#2e7d32", "#1b5e20", "#388e3c"],
    modelType: "plant",
    icon: "🪴"
  },

  // --- ダイニング ---
  {
    type: "dining_set_4p",
    name: "ダイニングセット (4人用)",
    category: "dining",
    width: 1.4,
    depth: 0.85,
    height: 0.72,
    color: "#6d4c41",
    colorOptions: ["#6d4c41", "#8d6e63", "#3e2723", "#f5f5f5"],
    modelType: "diningSet",
    icon: "🍽️"
  },
  {
    type: "dining_set_6p",
    name: "ダイニングセット (6人用)",
    category: "dining",
    width: 1.8,
    depth: 0.9,
    height: 0.72,
    color: "#5d4037",
    colorOptions: ["#5d4037", "#795548", "#212121"],
    modelType: "diningSet",
    icon: "🍽️"
  },

  // --- ベッドルーム / ワーク ---
  {
    type: "bed_single",
    name: "シングルベッド",
    category: "bedroom",
    width: 1.0,
    depth: 2.05,
    height: 0.7,
    color: "#eceff1",
    colorOptions: ["#eceff1", "#cfd8dc", "#37474f", "#5d4037"],
    modelType: "bed",
    icon: "🛏️"
  },
  {
    type: "bed_semi_double",
    name: "セミダブルベッド",
    category: "bedroom",
    width: 1.25,
    depth: 2.05,
    height: 0.7,
    color: "#e0e0e0",
    colorOptions: ["#e0e0e0", "#b0bec5", "#455a64"],
    modelType: "bed",
    icon: "🛏️"
  },
  {
    type: "bed_double",
    name: "ダブルベッド",
    category: "bedroom",
    width: 1.45,
    depth: 2.05,
    height: 0.7,
    color: "#eceff1",
    colorOptions: ["#eceff1", "#cfd8dc", "#37474f"],
    modelType: "bed",
    icon: "🛏️"
  },
  {
    type: "work_desk",
    name: "ワークデスク＆チェア",
    category: "bedroom",
    width: 1.2,
    depth: 0.6,
    height: 0.72,
    color: "#546e7a",
    colorOptions: ["#546e7a", "#37474f", "#8d6e63", "#eeeeee"],
    modelType: "desk",
    icon: "🖥️"
  },
  {
    type: "bookshelf",
    name: "本棚 / シェルフ",
    category: "bedroom",
    width: 0.9,
    depth: 0.35,
    height: 1.8,
    color: "#4e342e",
    colorOptions: ["#4e342e", "#6d4c41", "#212121", "#fafafa"],
    modelType: "bookshelf",
    icon: "📚"
  },

  // --- 和室 ---
  {
    type: "zataku",
    name: "座卓 (和風ローテーブル)",
    category: "washitsu",
    width: 1.1,
    depth: 0.75,
    height: 0.35,
    color: "#3e2723",
    colorOptions: ["#3e2723", "#4e342e", "#212121"],
    modelType: "zataku",
    icon: "🍵"
  },

  // --- 家電・設備 ---
  {
    type: "fridge",
    name: "大型冷蔵庫 (500L)",
    category: "appliance",
    width: 0.68,
    depth: 0.72,
    height: 1.83,
    color: "#f5f5f5",
    colorOptions: ["#f5f5f5", "#37474f", "#cfd8dc", "#b0bec5"],
    modelType: "fridge",
    icon: "🧊"
  },
  {
    type: "washer",
    name: "ドラム式洗濯機",
    category: "appliance",
    width: 0.64,
    depth: 0.68,
    height: 1.05,
    color: "#ffffff",
    colorOptions: ["#ffffff", "#cfd8dc", "#263238"],
    modelType: "washer",
    icon: "🧺"
  }
];

/**
 * 初期配置（おすすめプリセットレイアウト）
 * 実寸精査された広々とした空間に、スムーズな生活動線を考慮した配置
 */
export const INITIAL_PRESET_FURNITURE = [
  // LDK: ダイニングセット (キッチンカウンターの脇・配膳しやすい位置)
  {
    id: "f_dining_1",
    type: "dining_set_4p",
    name: "ダイニングセット",
    x: 4.2,
    y: 10.2,
    rotation: 90,
    width: 1.4,
    depth: 0.85,
    height: 0.72,
    color: "#6d4c41",
    modelType: "diningSet"
  },
  // LDK: 3人掛けソファ (リビング中央、和室や斜め窓への視界を妨げない配置)
  {
    id: "f_sofa_1",
    type: "sofa_3p",
    name: "3人掛けソファ",
    x: 2.4,
    y: 10.2,
    rotation: 0,
    width: 1.9,
    depth: 0.88,
    height: 0.78,
    color: "#4a5568",
    modelType: "sofa"
  },
  // LDK: リビングラグ
  {
    id: "f_rug_1",
    type: "living_rug",
    name: "リビングラグ",
    x: 2.4,
    y: 10.9,
    rotation: 0,
    width: 2.0,
    depth: 1.4,
    height: 0.02,
    color: "#b0bec5",
    modelType: "rug"
  },
  // LDK: ローテーブル
  {
    id: "f_table_1",
    type: "coffee_table",
    name: "リビングテーブル",
    x: 2.4,
    y: 10.9,
    rotation: 0,
    width: 1.05,
    depth: 0.55,
    height: 0.38,
    color: "#8d6e63",
    modelType: "coffeeTable"
  },
  // LDK: テレビボード (東側壁沿い、ソファ正面)
  {
    id: "f_tv_1",
    type: "tv_board_55",
    name: "テレビボード (55型TV付)",
    x: 0.6,
    y: 10.0,
    rotation: 90,
    width: 1.6,
    depth: 0.42,
    height: 1.15,
    color: "#3e2723",
    modelType: "tvBoard"
  },
  // LDK: 冷蔵庫 (キッチン北奥の冷蔵庫置場スペース)
  {
    id: "f_fridge_1",
    type: "fridge",
    name: "大型冷蔵庫",
    x: 5.0,
    y: 6.8,
    rotation: 0,
    width: 0.68,
    depth: 0.72,
    height: 1.83,
    color: "#f5f5f5",
    modelType: "fridge"
  },
  // LDK: 観葉植物 (南西の斜め窓コーナー脇・日当たり良好)
  {
    id: "f_plant_1",
    type: "indoor_plant",
    name: "観葉植物",
    x: 1.1,
    y: 11.2,
    rotation: 0,
    width: 0.5,
    depth: 0.5,
    height: 1.35,
    color: "#2e7d32",
    modelType: "plant"
  },

  // 和室: 座卓 (和室6畳の中央)
  {
    id: "f_zataku_1",
    type: "zataku",
    name: "座卓",
    x: 1.88,
    y: 7.9,
    rotation: 0,
    width: 1.1,
    depth: 0.75,
    height: 0.35,
    color: "#3e2723",
    modelType: "zataku"
  },

  // 洋室5.8畳: セミダブルベッド
  {
    id: "f_bed_1",
    type: "bed_semi_double",
    name: "セミダブルベッド",
    x: 1.88,
    y: 4.68,
    rotation: 90,
    width: 1.25,
    depth: 2.05,
    height: 0.7,
    color: "#e0e0e0",
    modelType: "bed"
  },

  // 洗面脱衣室: 洗濯機 (洗濯機パン置場)
  {
    id: "f_washer_1",
    type: "washer",
    name: "ドラム式洗濯機",
    x: 5.1,
    y: 3.2,
    rotation: 0,
    width: 0.64,
    depth: 0.68,
    height: 1.05,
    color: "#ffffff",
    modelType: "washer"
  }
];
