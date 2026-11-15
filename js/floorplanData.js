/**
 * 間取りデータ定義 (Floor Plan Data)
 * 単位: メートル (m)
 * 基準原点 (0, 0): 洋室6.0畳の北西外壁コーナー
 * X軸: 東方向 (右)
 * Y軸: 南方向 (下 / 3Dでは+Z)
 */

export const FLOOR_PLAN = {
  // 全体バウンディングボックス
  bounds: {
    width: 5.0,     // 東西外寸
    height: 9.0,    // 南北外寸
    wallHeight: 2.45, // 天井高 (m)
    beamHeight: 2.05, // 梁下有効高 (m)
    wallThickness: 0.12, // 壁厚 (m)
  },

  // 各部屋の定義 (床ポリゴン・用途・マテリアル・ラベル)
  rooms: [
    {
      id: "ldk",
      name: "LDK",
      area畳: 14.9,
      type: "flooring", // フローリング
      // 南西が45度斜めの多角形
      polygon: [
        [0.12, 7.45],
        [3.40, 7.45],
        [3.40, 5.25],
        [4.88, 5.25],
        [4.88, 8.88],
        [4.50, 8.88], // PS柱の凹凸
        [4.50, 8.88],
        [0.85, 8.88],
        [0.12, 8.15]  // 斜め壁開始点
      ],
      labelPos: [2.8, 7.9],
      color: "#ecdcc8"
    },
    {
      id: "washitsu",
      name: "和室 (6畳)",
      area畳: 6.0,
      type: "tatami", // 畳
      polygon: [
        [0.12, 5.35],
        [2.68, 5.35],
        [2.68, 7.45],
        [0.12, 7.45]
      ],
      labelPos: [1.4, 6.4],
      color: "#dce8d2"
    },
    {
      id: "western2",
      name: "洋室 (5.8畳)",
      area畳: 5.8,
      type: "flooring",
      polygon: [
        [0.12, 2.95],
        [2.68, 2.95],
        [2.68, 4.80],
        [0.12, 4.80]
      ],
      labelPos: [1.4, 3.8],
      color: "#f0ede6"
    },
    {
      id: "western1",
      name: "洋室 (6.0畳)",
      area畳: 6.0,
      type: "flooring",
      polygon: [
        [0.12, 0.12],
        [2.68, 0.12],
        [2.68, 2.40],
        [0.12, 2.40]
      ],
      labelPos: [1.4, 1.2],
      color: "#f0ede6"
    },
    {
      id: "corridor",
      name: "廊下",
      area畳: 3.5,
      type: "flooring",
      polygon: [
        [2.68, 1.85],
        [3.40, 1.85],
        [3.40, 7.45],
        [2.68, 7.45]
      ],
      labelPos: [3.04, 4.5],
      color: "#eae3d9"
    },
    {
      id: "entrance",
      name: "玄関",
      area畳: 1.5,
      type: "tile",
      polygon: [
        [3.40, 0.12],
        [4.88, 0.12],
        [4.88, 1.85],
        [3.40, 1.85]
      ],
      labelPos: [4.14, 0.9],
      color: "#d8d4cf"
    },
    {
      id: "toilet",
      name: "トイレ",
      area畳: 1.2,
      type: "tile",
      polygon: [
        [2.68, 0.12],
        [3.40, 0.12],
        [3.40, 1.85],
        [2.68, 1.85]
      ],
      labelPos: [3.04, 0.9],
      color: "#e8eff0"
    },
    {
      id: "washroom",
      name: "洗面脱衣室",
      area畳: 2.0,
      type: "tile",
      polygon: [
        [3.40, 1.85],
        [4.88, 1.85],
        [4.88, 3.55],
        [3.40, 3.55]
      ],
      labelPos: [4.14, 2.7],
      color: "#e2ebed"
    },
    {
      id: "bathroom",
      name: "浴室",
      area畳: 2.0,
      type: "bath",
      polygon: [
        [3.40, 3.55],
        [4.88, 3.55],
        [4.88, 5.25],
        [3.40, 5.25]
      ],
      labelPos: [4.14, 4.4],
      color: "#c8dce4"
    },
    {
      id: "balcony_south",
      name: "バルコニー",
      area畳: 7.0,
      type: "balcony",
      polygon: [
        [-0.8, 5.0],
        [0.12, 5.0],
        [0.12, 8.15],
        [0.85, 8.88],
        [4.88, 8.88],
        [4.88, 10.3],
        [0.5, 10.3],
        [-0.8, 9.0]
      ],
      labelPos: [2.5, 9.5],
      color: "#e6e6e6"
    }
  ],

  // 構造壁 (Wall Segments: [x1, y1, x2, y2, isExterior, height])
  walls: [
    // 北側外壁
    { p1: [0.0, 0.0], p2: [5.0, 0.0], type: "exterior" },
    // 東側外壁
    { p1: [5.0, 0.0], p2: [5.0, 9.0], type: "exterior" },
    // 南側外壁 (LDK窓面)
    { p1: [0.85, 9.0], p2: [5.0, 9.0], type: "exterior" },
    // 南西斜め外壁
    { p1: [0.0, 8.15], p2: [0.85, 9.0], type: "exterior" },
    // 西側外壁
    { p1: [0.0, 0.0], p2: [0.0, 8.15], type: "exterior" },

    // 内部間仕切り壁
    // 西側居室群と廊下の縦壁 (x = 2.68)
    { p1: [2.68, 0.0], p2: [2.68, 1.85], type: "interior" }, // トイレ西
    { p1: [2.68, 1.85], p2: [2.68, 2.40], type: "interior" },
    { p1: [2.68, 2.95], p2: [2.68, 4.80], type: "interior" },
    { p1: [2.68, 5.35], p2: [2.68, 7.45], type: "interior" },

    // 洋室1と洋室2の境 (収納含む)
    { p1: [0.0, 2.40], p2: [2.68, 2.40], type: "interior" },
    { p1: [0.0, 2.95], p2: [2.68, 2.95], type: "interior" },

    // 洋室2と和室の境 (押入・物入含む)
    { p1: [0.0, 4.80], p2: [2.68, 4.80], type: "interior" },
    { p1: [0.0, 5.35], p2: [2.68, 5.35], type: "interior" },

    // 和室とLDKの境 (間仕切りふすま/引き戸開口部あり)
    { p1: [0.0, 7.45], p2: [0.5, 7.45], type: "interior" },
    { p1: [2.2, 7.45], p2: [2.68, 7.45], type: "interior" },

    // 廊下東壁 / 水回り西壁 (x = 3.40)
    { p1: [3.40, 0.0], p2: [3.40, 1.0], type: "interior" },
    { p1: [3.40, 1.85], p2: [3.40, 5.25], type: "interior" },

    // 玄関/トイレ/洗面脱衣/浴室の横間仕切り
    { p1: [2.68, 1.85], p2: [3.40, 1.85], type: "interior" }, // トイレ南壁
    { p1: [3.40, 1.85], p2: [5.0, 1.85], type: "interior" },  // 玄関南/洗面北壁
    { p1: [3.40, 3.55], p2: [5.0, 3.55], type: "interior" },  // 洗面南/浴室北壁
    { p1: [3.40, 5.25], p2: [5.0, 5.25], type: "interior" },  // 浴室南/キッチン北壁
  ],

  // 窓 (Windows)
  windows: [
    // LDK 南面大型掃き出し窓 1 (IMG_6293)
    {
      id: "win_ldk_1",
      pos: [1.8, 8.94],
      width: 1.8,
      height: 2.0,
      sillHeight: 0.0,
      direction: "S"
    },
    // LDK 南面大型掃き出し窓 2
    {
      id: "win_ldk_2",
      pos: [3.6, 8.94],
      width: 1.7,
      height: 2.0,
      sillHeight: 0.0,
      direction: "S"
    },
    // 和室 西面障子窓 (IMG_6291)
    {
      id: "win_washitsu",
      pos: [0.06, 6.4],
      width: 1.6,
      height: 1.4,
      sillHeight: 0.6,
      direction: "W",
      isShoji: true // 障子
    },
    // 洋室5.8 西面掃き出し窓 (IMG_6297)
    {
      id: "win_western2",
      pos: [0.06, 3.8],
      width: 1.6,
      height: 2.0,
      sillHeight: 0.0,
      direction: "W"
    },
    // 洋室6.0 西面窓 (IMG_6299)
    {
      id: "win_western1",
      pos: [0.06, 1.2],
      width: 1.6,
      height: 1.4,
      sillHeight: 0.6,
      direction: "W"
    }
  ],

  // ドア・建具 (Doors & Openings)
  doors: [
    // 玄関ドア (IMG_6303)
    {
      id: "door_entrance",
      pos: [4.4, 0.06],
      width: 0.85,
      type: "hinged",
      swing: "in",
      rotation: 0
    },
    // トイレドア
    {
      id: "door_toilet",
      pos: [3.04, 1.85],
      width: 0.65,
      type: "hinged",
      swing: "out"
    },
    // 洋室1ドア
    {
      id: "door_western1",
      pos: [2.68, 2.1],
      width: 0.75,
      type: "hinged"
    },
    // 洋室2ドア
    {
      id: "door_western2",
      pos: [2.68, 3.1],
      width: 0.75,
      type: "hinged"
    },
    // 洗面所ドア
    {
      id: "door_washroom",
      pos: [3.40, 2.3],
      width: 0.75,
      type: "sliding"
    },
    // LDK入り口ドア
    {
      id: "door_ldk",
      pos: [3.04, 7.45],
      width: 0.85,
      type: "hinged"
    },
    // 和室とLDKの引き込み戸 (全開可能)
    {
      id: "door_washitsu_ldk",
      pos: [1.35, 7.45],
      width: 1.7,
      type: "fusuma"
    }
  ],

  // 梁 (天井の出っ張り - IMG_6292, IMG_6293再現)
  beams: [
    // LDK 南面窓上梁
    { pos: [2.85, 8.6, 2.25], size: [4.0, 0.5, 0.4] },
    // LDK 和室境界上部梁
    { pos: [1.35, 7.45, 2.25], size: [2.7, 0.35, 0.4] },
    // 廊下天井の梁 (IMG_6296)
    { pos: [3.04, 4.0, 2.25], size: [0.75, 0.35, 0.4] }
  ],

  // 備え付け固定設備 (Fixed Installations)
  fixedFixtures: [
    // システムキッチン (IMG_6295: 幅2.4m, 奥行0.65m, 高さ0.85m)
    {
      id: "kitchen_system",
      name: "システムキッチン",
      pos: [4.52, 6.45, 0.425],
      size: [0.65, 2.40, 0.85],
      color: "#ece6de",
      details: {
        sinkPos: [4.52, 5.7, 0.85],
        gasStovePos: [4.52, 7.1, 0.85],
        hoodPos: [4.52, 7.1, 1.95]
      }
    },
    // シューズボックス / 下駄箱 (IMG_6303)
    {
      id: "shoes_box",
      name: "玄関収納 (下駄箱)",
      pos: [4.6, 1.1, 1.15],
      size: [0.45, 1.4, 2.3],
      color: "#4a3c31"
    },
    // 洗面化粧台 (IMG_6298)
    {
      id: "wash_stand",
      name: "洗面化粧台",
      pos: [4.5, 2.3, 0.9],
      size: [0.6, 0.8, 1.8],
      color: "#5c493c"
    },
    // ユニットバス (浴槽)
    {
      id: "bathtub",
      name: "浴槽",
      pos: [4.15, 3.9, 0.3],
      size: [1.3, 0.7, 0.6],
      color: "#f5f5f5"
    },
    // トイレ便器＋手洗いカウンター (IMG_6301)
    {
      id: "toilet_bowl",
      name: "トイレ便器・カウンター",
      pos: [3.04, 0.6, 0.4],
      size: [0.65, 0.9, 0.75],
      color: "#ffffff"
    },
    // LDKエアコン (IMG_6292: 斜め壁の上部)
    {
      id: "ac_ldk",
      name: "LDK エアコン",
      pos: [0.45, 8.4, 2.15],
      size: [0.3, 0.8, 0.3],
      rotation: 45,
      color: "#ffffff"
    }
  ],

  // 実写真アングル プリセット (Camera Presets based on actual photos)
  cameraPresets: [
    {
      id: "overview",
      name: "3D 全体俯瞰 (Bird's Eye)",
      position: [2.5, 9.5, 9.0],
      target: [2.5, 0.5, 5.0],
      fov: 50
    },
    {
      id: "photo_ldk_corner",
      name: "実写真 IMG_6292 (LDK斜め窓・エアコン)",
      position: [2.6, 1.5, 6.8],
      target: [0.5, 1.4, 8.4],
      fov: 65,
      photo: "assets/photos/IMG_6292.JPEG"
    },
    {
      id: "photo_ldk_windows",
      name: "実写真 IMG_6293 (LDK南側大開口窓)",
      position: [1.2, 1.5, 6.2],
      target: [3.2, 1.3, 8.8],
      fov: 65,
      photo: "assets/photos/IMG_6293.JPEG"
    },
    {
      id: "photo_washitsu",
      name: "実写真 IMG_6291 (LDKから見る和室)",
      position: [1.5, 1.3, 7.8],
      target: [1.35, 1.2, 6.2],
      fov: 65,
      photo: "assets/photos/IMG_6291.JPEG"
    },
    {
      id: "photo_corridor",
      name: "実写真 IMG_6296 (廊下から玄関見通し)",
      position: [3.04, 1.5, 7.0],
      target: [3.04, 1.4, 0.5],
      fov: 60,
      photo: "assets/photos/IMG_6296.JPEG"
    },
    {
      id: "photo_kitchen",
      name: "実写真 IMG_6295 (システムキッチン)",
      position: [3.6, 1.5, 7.4],
      target: [4.5, 1.1, 6.2],
      fov: 65,
      photo: "assets/photos/IMG_6295.JPEG"
    },
    {
      id: "photo_western2",
      name: "実写真 IMG_6297 (洋室5.8畳・バルコニー窓)",
      position: [2.5, 1.5, 3.2],
      target: [0.2, 1.4, 3.8],
      fov: 65,
      photo: "assets/photos/IMG_6297.JPEG"
    }
  ]
};
