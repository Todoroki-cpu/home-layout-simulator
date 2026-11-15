/**
 * 間取りデータ定義 (Floor Plan Data) - 実写真および規格寸法に基づく厳密精査版
 * 単位: メートル (m)
 * スケール: 1px ≒ 0.0255m (間取り図の和室6畳 3.6m×2.55m および システムキッチン長 2.55m に基づく実寸)
 * 基準原点 (0, 0): 洋室6.0畳の北西外壁コーナー (画像ピクセル x: 164, y: 52)
 * X軸: 東方向 (右)
 * Y軸: 南方向 (下 / 3Dでは+Z)
 * 専有面積: 約 76.5 ㎡ (バルコニー除く)
 */

export const FLOOR_PLAN = {
  // 全体バウンディングボックス (実寸)
  bounds: {
    width: 6.63,      // 東西外寸 (m)
    height: 11.73,    // 南北外寸 (m)
    wallHeight: 2.45, // 天井高 (m)
    beamHeight: 2.05, // 梁下有効高 (m)
    wallThickness: 0.14, // 壁厚 (m)
  },

  // 各部屋の定義 (床ポリゴン・用途・マテリアル・ラベル)
  rooms: [
    {
      id: "ldk",
      name: "LDK (約14.9畳)",
      area畳: 14.9,
      type: "flooring",
      // 南西が45度斜めカットされたLDKポリゴン (実寸)
      polygon: [
        [0.14, 9.18],  // 和室南西角
        [4.54, 9.18],  // 廊下南端
        [4.54, 6.32],  // キッチン北壁
        [6.50, 6.32],  // キッチン北東角
        [6.50, 11.60], // LDK南東角
        [6.05, 11.60], // PS柱
        [6.05, 11.60],
        [1.05, 11.60], // 斜め壁南端
        [0.14, 10.70]  // 斜め壁北端
      ],
      labelPos: [3.6, 10.4],
      color: "#ecdcc8"
    },
    {
      id: "washitsu",
      name: "和室 (6畳)",
      area畳: 6.0,
      type: "tatami",
      polygon: [
        [0.14, 6.63],
        [3.62, 6.63],
        [3.62, 9.18],
        [0.14, 9.18]
      ],
      labelPos: [1.88, 7.9],
      color: "#dce8d2"
    },
    {
      id: "western2",
      name: "洋室 (5.8畳)",
      area畳: 5.8,
      type: "flooring",
      polygon: [
        [0.14, 3.52],
        [3.62, 3.52],
        [3.62, 5.84],
        [0.14, 5.84]
      ],
      labelPos: [1.88, 4.68],
      color: "#f0ede6"
    },
    {
      id: "western1",
      name: "洋室 (6.0畳)",
      area畳: 6.0,
      type: "flooring",
      polygon: [
        [0.14, 0.14],
        [3.62, 0.14],
        [3.62, 2.63],
        [0.14, 2.63]
      ],
      labelPos: [1.88, 1.38],
      color: "#f0ede6"
    },
    {
      id: "corridor",
      name: "廊下・ホール",
      area畳: 5.5,
      type: "flooring",
      polygon: [
        [3.62, 1.70],
        [5.86, 1.70],
        [5.86, 2.63],
        [4.54, 2.63],
        [4.54, 9.18],
        [3.62, 9.18]
      ],
      labelPos: [4.08, 5.9],
      color: "#eae3d9"
    },
    {
      id: "entrance",
      name: "玄関",
      area畳: 1.2,
      type: "tile",
      polygon: [
        [5.86, 1.70],
        [6.63, 1.70],
        [6.63, 2.63],
        [5.86, 2.63]
      ],
      labelPos: [6.24, 2.15],
      color: "#b0aba4"
    },
    {
      id: "toilet",
      name: "トイレ",
      area畳: 2.2,
      type: "tile",
      polygon: [
        [3.62, 0.14],
        [5.86, 0.14],
        [5.86, 1.70],
        [3.62, 1.70]
      ],
      labelPos: [4.74, 0.92],
      color: "#e8eff0"
    },
    {
      id: "mb",
      name: "MB",
      area畳: 0.8,
      type: "tile",
      polygon: [
        [5.86, 0.14],
        [6.63, 0.14],
        [6.63, 1.15],
        [5.86, 1.15]
      ],
      labelPos: [6.24, 0.65],
      color: "#d0d4d8"
    },
    {
      id: "washroom",
      name: "洗面脱衣室",
      area畳: 2.5,
      type: "tile",
      polygon: [
        [4.54, 2.63],
        [6.50, 2.63],
        [6.50, 4.80],
        [4.54, 4.80]
      ],
      labelPos: [5.52, 3.7],
      color: "#e2ebed"
    },
    {
      id: "bathroom",
      name: "浴室",
      area畳: 2.2,
      type: "bath",
      polygon: [
        [4.54, 4.80],
        [6.50, 4.80],
        [6.50, 6.32],
        [4.54, 6.32]
      ],
      labelPos: [5.52, 5.56],
      color: "#c8dce4"
    },
    {
      id: "balcony_south",
      name: "バルコニー",
      area畳: 8.5,
      type: "balcony",
      polygon: [
        [-1.2, 6.0],
        [0.14, 6.0],
        [0.14, 10.70],
        [1.05, 11.60],
        [6.50, 11.60],
        [6.50, 13.20],
        [0.7, 13.20],
        [-1.2, 11.30]
      ],
      labelPos: [3.3, 12.4],
      color: "#e6e6e6"
    }
  ],

  // クローゼット・物入・押入 (Closets & Storage - 部屋間の隙間を完全再現)
  closets: [
    // 1. 洋室6.0の物入 (西側: ハンガーパイプ＆枕棚 IMG_6300再現)
    {
      id: "closet_w1",
      name: "物入",
      room: "洋室6.0畳",
      polygon: [
        [0.80, 2.63],
        [2.20, 2.63],
        [2.20, 3.25],
        [0.80, 3.25]
      ],
      labelPos: [1.50, 2.94],
      door: { pos: [1.50, 2.63], width: 1.4, facing: "N", type: "folding" },
      color: "#e8dcce"
    },
    // 2. 洋室5.8の北側物入 (東側: 洋室5.8用クローゼット)
    {
      id: "closet_w2_north",
      name: "物入",
      room: "洋室5.8畳",
      polygon: [
        [2.20, 2.90],
        [3.62, 2.90],
        [3.62, 3.52],
        [2.20, 3.52]
      ],
      labelPos: [2.91, 3.21],
      door: { pos: [2.91, 3.52], width: 1.4, facing: "S", type: "folding" },
      color: "#e8dcce"
    },
    // 3. 和室の押入 (西側: 布団収納ふすま2枚引き違い IMG_6291再現)
    {
      id: "closet_washitsu",
      name: "押入",
      room: "和室6畳",
      polygon: [
        [0.14, 5.84],
        [1.90, 5.84],
        [1.90, 6.63],
        [0.14, 6.63]
      ],
      labelPos: [1.02, 6.24],
      door: { pos: [1.02, 6.63], width: 1.76, facing: "S", type: "fusuma" },
      color: "#dfcdb8"
    },
    // 4. 洋室5.8の南側物入 (東側: 洋室5.8用クローゼット)
    {
      id: "closet_w2_south",
      name: "物入",
      room: "洋室5.8畳",
      polygon: [
        [1.90, 5.84],
        [3.62, 5.84],
        [3.62, 6.45],
        [1.90, 6.45]
      ],
      labelPos: [2.76, 6.14],
      door: { pos: [2.76, 5.84], width: 1.7, facing: "N", type: "folding" },
      color: "#e8dcce"
    },
    // 5. 廊下収納 (洗面所北側: 可動棚収納 IMG_6302再現)
    {
      id: "closet_corridor",
      name: "物入",
      room: "廊下",
      polygon: [
        [3.62, 2.63],
        [4.54, 2.63],
        [4.54, 3.52],
        [3.62, 3.52]
      ],
      labelPos: [4.08, 3.08],
      door: { pos: [4.08, 2.63], width: 0.85, facing: "N", type: "folding" },
      color: "#e8dcce"
    }
  ],

  // 構造壁 (Wall Segments)
  walls: [
    // 北側外壁
    { p1: [0.0, 0.0], p2: [6.63, 0.0], type: "exterior" },
    // 東側外壁
    { p1: [6.63, 0.0], p2: [6.63, 11.73], type: "exterior" },
    // 南側外壁 (LDK窓面)
    { p1: [1.05, 11.73], p2: [6.63, 11.73], type: "exterior" },
    // 南西斜め外壁 (LDKコーナー)
    { p1: [0.0, 10.70], p2: [1.05, 11.73], type: "exterior" },
    // 西側外壁
    { p1: [0.0, 0.0], p2: [0.0, 10.70], type: "exterior" },

    // 内部間仕切り壁
    // 西側居室群と廊下の縦壁 (x = 3.62: 玄関前から和室南端まで完全閉塞)
    { p1: [3.62, 0.0], p2: [3.62, 2.63], type: "interior" },
    { p1: [3.62, 2.63], p2: [3.62, 3.52], type: "interior" }, // クローゼット1東側壁（廊下面）
    { p1: [3.62, 3.52], p2: [3.62, 5.84], type: "interior" },
    { p1: [3.62, 5.84], p2: [3.62, 6.63], type: "interior" }, // クローゼット2・押入東側壁（廊下面）
    { p1: [3.62, 6.63], p2: [3.62, 9.18], type: "interior" },

    // 洋室1と洋室2の境 (収納仕切り・背面壁含む y = 2.63〜3.52)
    { p1: [0.0, 2.63], p2: [0.8, 2.63], type: "interior" },
    { p1: [2.2, 2.63], p2: [3.62, 2.63], type: "interior" },
    { p1: [0.0, 3.52], p2: [2.2, 3.52], type: "interior" },
    { p1: [0.80, 3.25], p2: [2.20, 3.25], type: "interior" }, // 洋室6物入の南背面壁
    { p1: [2.20, 2.90], p2: [3.62, 2.90], type: "interior" }, // 洋室5.8物入の北背面壁
    { p1: [2.20, 2.63], p2: [2.20, 3.52], type: "interior" }, // クローゼット間仕切り
    { p1: [0.80, 2.63], p2: [0.80, 3.52], type: "interior" }, // 西柱型仕切り

    // 洋室2と和室の境 (押入・物入仕切り・背面壁含む y = 5.84〜6.63)
    { p1: [0.0, 5.84], p2: [1.9, 5.84], type: "interior" },
    { p1: [1.90, 6.45], p2: [3.62, 6.45], type: "interior" }, // 洋室5.8物入の南背面壁
    { p1: [1.90, 5.84], p2: [1.90, 6.63], type: "interior" }, // 押入と物入の間仕切り
    { p1: [1.90, 6.63], p2: [3.62, 6.63], type: "interior" }, // 和室側壁（板畳境）

    // 和室とLDKの境 (間仕切りふすま/引き戸開口部あり y = 9.18)
    { p1: [0.0, 9.18], p2: [0.6, 9.18], type: "interior" },
    { p1: [3.0, 9.18], p2: [3.62, 9.18], type: "interior" },

    // 廊下東壁 / 水回り西壁 (x = 4.54: 玄関からLDK入り口まで完全閉塞)
    { p1: [4.54, 0.0], p2: [4.54, 1.4], type: "interior" },
    { p1: [4.54, 1.4], p2: [4.54, 2.63], type: "interior" },
    { p1: [4.54, 2.63], p2: [4.54, 6.32], type: "interior" },
    { p1: [4.54, 6.32], p2: [4.54, 9.18], type: "interior" }, // キッチン西壁（廊下面）

    // トイレ・MB・下駄箱・玄関周りの間仕切り壁
    { p1: [3.62, 1.70], p2: [5.86, 1.70], type: "interior" }, // トイレ南壁（廊下境界）
    { p1: [5.86, 0.0], p2: [5.86, 1.70], type: "interior" },  // トイレ東壁 / MB・下駄箱西壁
    { p1: [5.86, 1.15], p2: [6.63, 1.15], type: "interior" }, // MB南壁 / 下駄箱北壁
    { p1: [5.86, 1.70], p2: [6.63, 1.70], type: "interior" }, // 下駄箱南壁 / 玄関土間北壁
    { p1: [4.54, 2.63], p2: [6.63, 2.63], type: "interior" }, // 玄関・ホール南壁 / 洗面所北壁
    { p1: [4.54, 4.80], p2: [6.63, 4.80], type: "interior" }, // 洗面南/浴室北壁
    { p1: [4.54, 6.32], p2: [6.63, 6.32], type: "interior" }, // 浴室南/キッチン北壁
  ],

  // 窓 (Windows - 実寸サッシ規格 1800mm/1650mm)
  windows: [
    // LDK 南面大型掃き出し窓 1 (IMG_6293: 1間サッシ 1.8m)
    {
      id: "win_ldk_1",
      pos: [2.3, 11.66],
      width: 1.8,
      height: 2.0,
      sillHeight: 0.0,
      direction: "S"
    },
    // LDK 南面大型掃き出し窓 2 (IMG_6293: 1間サッシ 1.8m)
    {
      id: "win_ldk_2",
      pos: [4.8, 11.66],
      width: 1.8,
      height: 2.0,
      sillHeight: 0.0,
      direction: "S"
    },
    // 和室 西面障子窓 (IMG_6291: 障子4枚建てサッシ 1.8m)
    {
      id: "win_washitsu",
      pos: [0.07, 7.9],
      width: 1.8,
      height: 1.4,
      sillHeight: 0.6,
      direction: "W",
      isShoji: true
    },
    // 洋室5.8 西面掃き出し窓 (IMG_6297: 1.65m)
    {
      id: "win_western2",
      pos: [0.07, 4.68],
      width: 1.65,
      height: 2.0,
      sillHeight: 0.0,
      direction: "W"
    },
    // 洋室6.0 西面窓 (IMG_6299: 1.65m)
    {
      id: "win_western1",
      pos: [0.07, 1.38],
      width: 1.65,
      height: 1.4,
      sillHeight: 0.6,
      direction: "W"
    }
  ],

  // ドア・建具 (Doors & Openings)
  doors: [
    // 玄関ドア (東外壁 x=6.63, y=2.15, 外開き IMG_6303再現)
    {
      id: "door_entrance",
      name: "玄関ドア",
      pos: [6.63, 2.15],
      width: 0.85,
      type: "hinged",
      swing: "out",
      facing: "E"
    },
    // MB扉 (東外壁 x=6.63, y=0.65, 外開き)
    {
      id: "door_mb",
      name: "MB扉",
      pos: [6.63, 0.65],
      width: 0.65,
      type: "hinged",
      swing: "out",
      facing: "E"
    },
    // トイレドア (南壁 y=1.70, x=4.10, トイレ内開き)
    {
      id: "door_toilet",
      name: "トイレドア",
      pos: [4.10, 1.70],
      width: 0.65,
      type: "hinged",
      swing: "in",
      facing: "N"
    },
    // 洋室1ドア (x=3.62, y=2.15, 室内開き)
    {
      id: "door_western1",
      name: "洋室1ドア",
      pos: [3.62, 2.15],
      width: 0.75,
      type: "hinged",
      swing: "in",
      facing: "W"
    },
    // 洋室2ドア (x=3.62, y=4.0, 室内開き)
    {
      id: "door_western2",
      name: "洋室2ドア",
      pos: [3.62, 4.0],
      width: 0.75,
      type: "hinged",
      swing: "in",
      facing: "W"
    },
    // 洗面所ドア (x=4.54, y=3.2, 引き戸)
    {
      id: "door_washroom",
      name: "洗面所ドア",
      pos: [4.54, 3.2],
      width: 0.75,
      type: "sliding",
      facing: "E"
    },
    // LDK入り口ドア (y=9.18, x=4.08, LDK内開き)
    {
      id: "door_ldk",
      name: "LDKドア",
      pos: [4.08, 9.18],
      width: 0.85,
      type: "hinged",
      swing: "in",
      facing: "S"
    },
    // 和室とLDKの引き込み戸 (ふすま全開可能 幅2.4m)
    {
      id: "door_washitsu_ldk",
      name: "和室・LDK間仕切りふすま",
      pos: [1.8, 9.18],
      width: 2.4,
      type: "fusuma"
    }
  ],

  // 梁 (下がり天井 - IMG_6292, IMG_6293, IMG_6296再現)
  beams: [
    // LDK 南面窓上梁
    { pos: [3.8, 11.2, 2.25], size: [5.4, 0.5, 0.4] },
    // LDK 和室境界上部梁
    { pos: [1.88, 9.18, 2.25], size: [3.6, 0.35, 0.4] },
    // 廊下天井の梁
    { pos: [4.08, 5.0, 2.25], size: [0.92, 0.35, 0.4] }
  ],

  // 備え付け固定設備 (実写真IMG_6295の日本規格2550mmシステムキッチン等)
  fixedFixtures: [
    // システムキッチン (IMG_6295: 幅2.55m, 奥行0.65m, 高さ0.85m)
    {
      id: "kitchen_system",
      name: "システムキッチン",
      pos: [6.15, 7.8, 0.425],
      size: [0.65, 2.55, 0.85],
      color: "#ece6de",
      details: {
        sinkPos: [6.15, 7.0, 0.85],
        gasStovePos: [6.15, 8.6, 0.85],
        hoodPos: [6.15, 8.6, 1.95]
      }
    },
    // シューズボックス / 下駄箱 (IMG_6303: 玄関土間の北側)
    {
      id: "shoes_box",
      name: "玄関収納 (下駄箱)",
      pos: [6.24, 1.42, 1.15],
      size: [0.77, 0.55, 2.3],
      color: "#4a3c31"
    },
    // 洗面化粧台 (IMG_6298)
    {
      id: "wash_stand",
      name: "洗面化粧台",
      pos: [6.1, 3.2, 0.9],
      size: [0.6, 0.9, 1.8],
      color: "#5c493c"
    },
    // ユニットバス (浴槽 1618サイズ)
    {
      id: "bathtub",
      name: "浴槽 (1618)",
      pos: [5.6, 5.3, 0.3],
      size: [1.6, 0.8, 0.6],
      color: "#f5f5f5"
    },
    // トイレ手洗いカウンター (IMG_6301: 北壁沿いカウンター収納＆ボウル)
    {
      id: "toilet_counter",
      name: "手洗いカウンター",
      pos: [4.40, 0.34, 0.425],
      size: [1.35, 0.36, 0.85],
      color: "#4a3c31"
    },
    // トイレ便器 (IMG_6301: ロータンクトイレ・東壁付け西向き)
    {
      id: "toilet_bowl",
      name: "トイレ便器",
      pos: [5.35, 1.05, 0.38],
      size: [0.70, 0.45, 0.75],
      rotation: 90,
      color: "#ffffff"
    },
    // LDKエアコン (IMG_6292: 斜め壁の上部 - 3Dのみ壁面表示)
    {
      id: "ac_ldk",
      name: "エアコン",
      pos: [0.72, 11.02, 2.15],
      size: [0.26, 0.82, 0.28],
      rotation: 45,
      color: "#ffffff"
    }
  ],

  // ルームツアー用 部屋別視点定義 (人目線ウォークスルー)
  tourWaypoints: [
    { id: "entrance", name: "玄関", pos: [5.4, 1.55, 2.15], yaw: Math.PI * 0.5 },
    { id: "corridor", name: "廊下", pos: [4.08, 1.55, 3.8], yaw: Math.PI },
    { id: "toilet", name: "トイレ", pos: [4.5, 1.55, 1.1], yaw: -Math.PI * 0.25 },
    { id: "ldk", name: "LDK", pos: [3.3, 1.55, 9.8], yaw: Math.PI },
    { id: "kitchen", name: "キッチン", pos: [5.2, 1.55, 8.0], yaw: -Math.PI * 0.5 },
    { id: "washitsu", name: "和室6畳", pos: [1.88, 1.55, 8.5], yaw: Math.PI * 0.5 },
    { id: "western1", name: "洋室6.0畳", pos: [1.88, 1.55, 1.4], yaw: Math.PI * 0.5 },
    { id: "western2", name: "洋室5.8畳", pos: [1.88, 1.55, 4.6], yaw: 0 },
    { id: "washroom", name: "洗面脱衣室", pos: [5.4, 1.55, 3.7], yaw: 0 }
  ],

  // 実写真アングル プリセット (正しい広角パースペクティブ)
  cameraPresets: [
    {
      id: "overview",
      name: "3D 全体俯瞰 (Bird's Eye)",
      position: [3.3, 14.0, 12.0],
      target: [3.3, 0.5, 6.5],
      fov: 50
    },
    {
      id: "photo_ldk_corner",
      name: "実写真 IMG_6292 (LDK斜め窓・エアコン)",
      position: [4.5, 1.5, 8.8],
      target: [0.65, 1.4, 11.1],
      fov: 65,
      photo: "assets/photos/IMG_6292.JPEG"
    },
    {
      id: "photo_ldk_windows",
      name: "実写真 IMG_6293 (LDK南側大開口窓)",
      position: [1.8, 1.5, 8.2],
      target: [4.5, 1.3, 11.6],
      fov: 65,
      photo: "assets/photos/IMG_6293.JPEG"
    },
    {
      id: "photo_washitsu",
      name: "実写真 IMG_6291 (LDKから見る和室6畳)",
      position: [2.0, 1.3, 10.2],
      target: [1.88, 1.2, 7.8],
      fov: 65,
      photo: "assets/photos/IMG_6291.JPEG"
    },
    {
      id: "photo_corridor",
      name: "実写真 IMG_6296 (廊下から玄関見通し)",
      position: [4.08, 1.5, 9.0],
      target: [4.08, 1.4, 0.5],
      fov: 60,
      photo: "assets/photos/IMG_6296.JPEG"
    },
    {
      id: "photo_kitchen",
      name: "実写真 IMG_6295 (システムキッチン)",
      position: [4.8, 1.5, 9.5],
      target: [6.15, 1.1, 7.8],
      fov: 65,
      photo: "assets/photos/IMG_6295.JPEG"
    },
    {
      id: "photo_western2",
      name: "実写真 IMG_6297 (洋室5.8畳・バルコニー窓)",
      position: [3.2, 1.5, 3.8],
      target: [0.2, 1.4, 4.68],
      fov: 65,
      photo: "assets/photos/IMG_6297.JPEG"
    }
  ]
};
