/**
 * 3Dシーン管理 & Three.jsレンダラー (3D Scene Controller)
 * 2D家具配置と完全にリアルタイム同期し、実写真の内装を忠実に再現します。
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FLOOR_PLAN } from "./floorplanData.js";
import { TextureGenerator } from "./proceduralTextures.js";
import { FurnitureModelFactory } from "./proceduralModels.js";

export class Scene3D {
  constructor(containerElement) {
    this.container = containerElement;

    // Three.js 基本オブジェクト
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#e8edf2"); // 明るい空色

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // コントロール (OrbitControls)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.49; // 床下には潜らない
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 25;

    // 初期カメラ位置 (全体俯瞰)
    this.applyCameraPreset(FLOOR_PLAN.cameraPresets[0]);

    // 家具メッシュ保持用マップ (id -> THREE.Group)
    this.furnitureMeshMap = new Map();
    this.furnitureRoot = new THREE.Group();
    this.scene.add(this.furnitureRoot);

    // テクスチャ初期化
    this.textures = {
      flooring: TextureGenerator.createFlooringTexture(),
      tatami: TextureGenerator.createTatamiTexture(),
      wall: TextureGenerator.createWallTexture(),
      tile: TextureGenerator.createTileTexture("#ded8d0", 48),
      bathTile: TextureGenerator.createTileTexture("#bdd2db", 64)
    };

    // マテリアル
    this.materials = {
      flooring: new THREE.MeshStandardMaterial({
        map: this.textures.flooring,
        roughness: 0.4,
        metalness: 0.05
      }),
      tatami: new THREE.MeshStandardMaterial({
        map: this.textures.tatami,
        roughness: 0.7,
        metalness: 0.0
      }),
      tile: new THREE.MeshStandardMaterial({
        map: this.textures.tile,
        roughness: 0.3,
        metalness: 0.1
      }),
      bath: new THREE.MeshStandardMaterial({
        map: this.textures.bathTile,
        roughness: 0.2,
        metalness: 0.1
      }),
      wall: new THREE.MeshStandardMaterial({
        map: this.textures.wall,
        roughness: 0.85,
        metalness: 0.0
      }),
      wallTop: new THREE.MeshStandardMaterial({
        color: "#d0d7de",
        roughness: 0.5
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        transmission: 0.9,
        ior: 1.5
      }),
      frame: new THREE.MeshStandardMaterial({
        color: "#374151",
        roughness: 0.4,
        metalness: 0.5
      }),
      balconyFloor: new THREE.MeshStandardMaterial({
        color: "#9ca3af",
        roughness: 0.8
      })
    };

    // 空間構築
    this.setupLighting();
    this.buildArchitecture();
    this.buildFixedFixtures();

    // アニメーションループ開始
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // リサイズ監視
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setupLighting() {
    // 半球光（空からの青白さと地面からの反射）
    const hemiLight = new THREE.HemisphereLight("#ffffff", "#f0ece1", 0.65);
    hemiLight.position.set(3.3, 12, 6.0);
    this.scene.add(hemiLight);

    // 環境光
    const ambLight = new THREE.AmbientLight("#ffffff", 0.45);
    this.scene.add(ambLight);

    // 南窓からの太陽光 (DirectionalLight)
    const sunLight = new THREE.DirectionalLight("#fff9e6", 1.25);
    sunLight.position.set(3.5, 10.0, 18.0); // 南側上空から室内へ射し込む
    sunLight.target.position.set(3.5, 0.5, 9.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);
    this.scene.add(sunLight.target);

    // 廊下・キッチンのダウンライト補助光
    const kitchenLight = new THREE.PointLight("#fffaed", 0.8, 5.5);
    kitchenLight.position.set(5.5, 2.3, 7.8);
    this.scene.add(kitchenLight);

    const corridorLight = new THREE.PointLight("#fffaed", 0.6, 6.0);
    corridorLight.position.set(4.08, 2.3, 5.0);
    this.scene.add(corridorLight);
  }

  /**
   * 建築構造（床・壁・窓・梁）の生成
   */
  buildArchitecture() {
    const archGroup = new THREE.Group();

    // 1. 各部屋の床メッシュ (Polygons)
    FLOOR_PLAN.rooms.forEach(room => {
      const shape = new THREE.Shape();
      room.polygon.forEach((p, idx) => {
        // 2Dの (x, y) を 3Dの (X, Z) にマッピング
        if (idx === 0) shape.moveTo(p[0], p[1]);
        else shape.lineTo(p[0], p[1]);
      });
      const geo = new THREE.ShapeGeometry(shape);
      geo.rotateX(Math.PI * 0.5); // X-Z平面に倒す

      let mat = this.materials.flooring;
      if (room.type === "tatami") mat = this.materials.tatami;
      else if (room.type === "tile") mat = this.materials.tile;
      else if (room.type === "bath") mat = this.materials.bath;
      else if (room.type === "balcony") mat = this.materials.balconyFloor;

      const floorMesh = new THREE.Mesh(geo, mat);
      floorMesh.position.y = room.type === "balcony" ? -0.08 : 0.0;
      floorMesh.receiveShadow = true;
      archGroup.add(floorMesh);
    });

    // 1-2. クローゼット・物入の床メッシュ (隙間を完全に閉塞)
    if (FLOOR_PLAN.closets) {
      const closetFloorMat = new THREE.MeshStandardMaterial({
        color: "#c8bcae",
        roughness: 0.6
      });
      FLOOR_PLAN.closets.forEach(cl => {
        const shape = new THREE.Shape();
        cl.polygon.forEach((p, idx) => {
          if (idx === 0) shape.moveTo(p[0], p[1]);
          else shape.lineTo(p[0], p[1]);
        });
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(Math.PI * 0.5);
        const mesh = new THREE.Mesh(geo, closetFloorMat);
        mesh.receiveShadow = true;
        archGroup.add(mesh);
      });
    }

    // 2. 構造壁の押し出し生成
    // 俯瞰で見やすいよう、間仕切り壁は高さ1.6m、外壁は2.4mまたは断面表示可能
    const wallH = 2.4;
    const wallThick = 0.12;

    FLOOR_PLAN.walls.forEach(w => {
      const dx = w.p2[0] - w.p1[0];
      const dz = w.p2[1] - w.p1[1];
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      // 壁ボックス
      const h = w.type === "exterior" ? wallH : 2.2;
      const wallGeo = new THREE.BoxGeometry(length, h, wallThick);
      const wallMesh = new THREE.Mesh(wallGeo, this.materials.wall);

      // 壁の中心位置
      const cx = (w.p1[0] + w.p2[0]) * 0.5;
      const cz = (w.p1[1] + w.p2[1]) * 0.5;

      wallMesh.position.set(cx, h * 0.5, cz);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      archGroup.add(wallMesh);
    });

    // 3. 窓サッシとガラス
    FLOOR_PLAN.windows.forEach(win => {
      const winGroup = new THREE.Group();
      const frameW = win.width;
      const frameH = win.height;

      // ガラス
      const glassGeo = new THREE.BoxGeometry(frameW * 0.95, frameH * 0.95, 0.02);
      const glass = new THREE.Mesh(glassGeo, this.materials.glass);
      glass.position.set(0, win.sillHeight + frameH * 0.5, 0);
      winGroup.add(glass);

      // サッシ枠
      const frameGeo = new THREE.BoxGeometry(frameW, frameH, 0.06);
      const wireGeo = new THREE.EdgesGeometry(frameGeo);
      const frameLines = new THREE.LineSegments(
        wireGeo,
        new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 2 })
      );
      frameLines.position.set(0, win.sillHeight + frameH * 0.5, 0);
      winGroup.add(frameLines);

      // 障子格子の表現 (IMG_6291再現)
      if (win.isShoji) {
        const shojiMat = new THREE.MeshStandardMaterial({
          color: "#f5f5f0",
          roughness: 0.9,
          transparent: true,
          opacity: 0.85
        });
        const shojiMesh = new THREE.Mesh(
          new THREE.BoxGeometry(frameW * 0.94, frameH * 0.94, 0.015),
          shojiMat
        );
        shojiMesh.position.set(0, win.sillHeight + frameH * 0.5, 0);
        winGroup.add(shojiMesh);
      }

      winGroup.position.set(win.pos[0], 0, win.pos[1]);
      if (win.direction === "W") winGroup.rotation.y = Math.PI * 0.5;
      archGroup.add(winGroup);
    });

    // 4. バルコニー手すり (南側＆西側)
    const railingGeo = new THREE.BoxGeometry(6.0, 1.1, 0.06);
    const railingMat = new THREE.MeshStandardMaterial({ color: "#e5e7eb", roughness: 0.4 });
    const railingSouth = new THREE.Mesh(railingGeo, railingMat);
    railingSouth.position.set(3.6, 0.55, 13.2);
    archGroup.add(railingSouth);

    // 5. 梁の配置 (下がり天井 - IMG_6292再現)
    FLOOR_PLAN.beams.forEach(b => {
      const beamGeo = new THREE.BoxGeometry(b.size[0], b.size[2], b.size[1]);
      const beamMesh = new THREE.Mesh(beamGeo, this.materials.wall);
      beamMesh.position.set(b.pos[0], b.pos[2], b.pos[1]);
      beamMesh.castShadow = true;
      archGroup.add(beamMesh);
    });

    // 6. クローゼット・押入扉の3D生成 (実写真 IMG_6300の木目折れ戸 & IMG_6291のふすま)
    if (FLOOR_PLAN.closets) {
      const darkDoorMat = new THREE.MeshStandardMaterial({
        color: "#3b2d24",
        roughness: 0.5,
        metalness: 0.05
      });
      const fusumaMat = new THREE.MeshStandardMaterial({
        color: "#f4f1e6",
        roughness: 0.85
      });
      const woodTrimMat = new THREE.MeshStandardMaterial({
        color: "#4a3525",
        roughness: 0.6
      });
      const handleMat = new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 0.7,
        roughness: 0.3
      });

      const doorH = 2.1; // 扉の高さ

      FLOOR_PLAN.closets.forEach(cl => {
        if (!cl.door) return;
        const d = cl.door;
        const dGroup = new THREE.Group();

        if (d.type === "folding") {
          // 折れ戸 (クローゼット用木目扉 4枚連動調)
          const panelCount = 4;
          const pW = d.width / panelCount;
          for (let i = 0; i < panelCount; i++) {
            const pMesh = new THREE.Mesh(
              new THREE.BoxGeometry(pW * 0.98, doorH, 0.035),
              darkDoorMat
            );
            const px = (i + 0.5) * pW - d.width * 0.5;
            pMesh.position.set(px, doorH * 0.5, 0);
            pMesh.castShadow = true;
            dGroup.add(pMesh);
          }
          // 取っ手
          const hL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.03), darkDoorMat);
          hL.position.set(-d.width * 0.15, doorH * 0.45, 0.025);
          dGroup.add(hL);
          const hR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.03), darkDoorMat);
          hR.position.set(d.width * 0.15, doorH * 0.45, 0.025);
          dGroup.add(hR);
        } else if (d.type === "fusuma") {
          // 和室押入ふすま (2枚引き違いふすま IMG_6291再現)
          const fW = d.width * 0.52;
          // 左ふすま
          const fLeft = new THREE.Mesh(
            new THREE.BoxGeometry(fW, doorH, 0.03),
            fusumaMat
          );
          fLeft.position.set(-d.width * 0.25, doorH * 0.5, -0.015);
          fLeft.castShadow = true;
          dGroup.add(fLeft);

          // 右ふすま
          const fRight = new THREE.Mesh(
            new THREE.BoxGeometry(fW, doorH, 0.03),
            fusumaMat
          );
          fRight.position.set(d.width * 0.25, doorH * 0.5, 0.015);
          fRight.castShadow = true;
          dGroup.add(fRight);

          // ふすま丸引手
          const pullGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.005, 16);
          pullGeo.rotateX(Math.PI * 0.5);
          const pullL = new THREE.Mesh(pullGeo, handleMat);
          pullL.position.set(-d.width * 0.06, doorH * 0.45, 0.002);
          dGroup.add(pullL);

          const pullR = new THREE.Mesh(pullGeo, handleMat);
          pullR.position.set(d.width * 0.06, doorH * 0.45, 0.032);
          dGroup.add(pullR);
        }

        // 配置と回転
        dGroup.position.set(d.pos[0], 0, d.pos[1]);
        if (d.facing === "S") dGroup.rotation.y = Math.PI;
        else if (d.facing === "E") dGroup.rotation.y = Math.PI * 0.5;
        else if (d.facing === "W") dGroup.rotation.y = -Math.PI * 0.5;

        archGroup.add(dGroup);
      });
    }

    this.scene.add(archGroup);
  }

  /**
   * 固定設備（システムキッチン、洗面台、トイレ便器、エアコン等）
   */
  buildFixedFixtures() {
    const fixtureGroup = new THREE.Group();

    FLOOR_PLAN.fixedFixtures.forEach(fix => {
      let mesh;
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(fix.color),
        roughness: 0.4,
        metalness: 0.1
      });

      if (fix.id === "kitchen_system") {
        // システムキッチン (本体＋シンク＋ガスコンロ＋レンジフード)
        mesh = new THREE.Group();
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(fix.size[0], fix.size[2], fix.size[1]),
          mat
        );
        base.position.set(0, fix.size[2] * 0.5, 0);
        base.castShadow = true;
        mesh.add(base);

        // 人造大理石天板
        const top = new THREE.Mesh(
          new THREE.BoxGeometry(fix.size[0] * 1.02, 0.04, fix.size[1] * 1.01),
          new THREE.MeshStandardMaterial({ color: "#f8f9fa", roughness: 0.2 })
        );
        top.position.set(0, fix.size[2] + 0.02, 0);
        mesh.add(top);

        // レンジフード (上部)
        const hood = new THREE.Mesh(
          new THREE.BoxGeometry(fix.size[0] * 0.9, 0.45, 0.75),
          new THREE.MeshStandardMaterial({ color: "#475569", metalness: 0.6, roughness: 0.3 })
        );
        hood.position.set(0, 1.95, fix.size[1] * 0.25);
        mesh.add(hood);
      } else {
        const geo = new THREE.BoxGeometry(fix.size[0], fix.size[2], fix.size[1]);
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = fix.pos[2];
        mesh.castShadow = true;
      }

      mesh.position.x = fix.pos[0];
      mesh.position.z = fix.pos[1];
      if (fix.rotation) mesh.rotation.y = (fix.rotation * Math.PI) / 180;
      fixtureGroup.add(mesh);
    });

    this.scene.add(fixtureGroup);
  }

  /**
   * 2D画面からの家具変更通知を受け取り、3Dメッシュをリアルタイム同期更新
   */
  updateFurniture(furnitureList) {
    const currentIds = new Set(furnitureList.map(f => f.id));

    // 削除された家具メッシュをクリーンアップ
    for (const [id, group] of this.furnitureMeshMap.entries()) {
      if (!currentIds.has(id)) {
        this.furnitureRoot.remove(group);
        this.disposeGroup(group);
        this.furnitureMeshMap.delete(id);
      }
    }

    // 各家具の配置・回転・寸法・色を更新
    furnitureList.forEach(f => {
      let group = this.furnitureMeshMap.get(f.id);

      // まだ存在しない、またはモデル形状・寸法・色が変わった場合は再構築
      if (
        !group ||
        group.userData.width !== f.width ||
        group.userData.depth !== f.depth ||
        group.userData.height !== f.height ||
        group.userData.color !== f.color ||
        group.userData.modelType !== f.modelType
      ) {
        if (group) {
          this.furnitureRoot.remove(group);
          this.disposeGroup(group);
        }

        group = this.createFurniture3DModel(f);
        group.userData = {
          width: f.width,
          depth: f.depth,
          height: f.height,
          color: f.color,
          modelType: f.modelType
        };
        this.furnitureMeshMap.set(f.id, group);
        this.furnitureRoot.add(group);
      }

      // 位置と回転（リアルタイム同期）
      // 2Dの (x, y) -> 3Dの (X, 0, Z)
      group.position.x = f.x;
      group.position.z = f.y;
      // 2Dの時計回り角度(deg) -> 3DのY軸回転 (反時計回りrad)
      group.rotation.y = -(f.rotation * Math.PI) / 180;
    });
  }

  createFurniture3DModel(f) {
    const w = f.width;
    const d = f.depth;
    const h = f.height;
    const color = f.color;

    switch (f.modelType) {
      case "sofa":
        return FurnitureModelFactory.createSofa(w, d, h, color);
      case "tvBoard":
        return FurnitureModelFactory.createTvBoard(w, d, h, color);
      case "diningSet":
        return FurnitureModelFactory.createDiningSet(w, d, h, color);
      case "coffeeTable":
        return FurnitureModelFactory.createCoffeeTable(w, d, h, color);
      case "bed":
        return FurnitureModelFactory.createBed(w, d, h, color);
      case "desk":
        return FurnitureModelFactory.createDesk(w, d, h, color);
      case "fridge":
        return FurnitureModelFactory.createFridge(w, d, h, color);
      case "washer":
        return FurnitureModelFactory.createWashingMachine(w, d, h, color);
      case "rug":
        return FurnitureModelFactory.createRug(w, d, h, color);
      case "plant":
        return FurnitureModelFactory.createPlant(w, d, h, color);
      case "zataku":
        return FurnitureModelFactory.createZataku(w, d, h, color);
      case "bookshelf":
        return FurnitureModelFactory.createBookshelf(w, d, h, color);
      case "poleTv":
        return FurnitureModelFactory.createPoleTv(w, d, h, color);
      case "sideboard":
        return FurnitureModelFactory.createSideboard(w, d, h, color);
      default: {
        // フォールバック: 正確な寸法の角丸ボックス
        const grp = new THREE.Group();
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.5
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = h * 0.5;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        grp.add(mesh);
        return grp;
      }
    }
  }

  disposeGroup(group) {
    group.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * カメラプリセット（実写真アングル等）への切り替え
   */
  applyCameraPreset(preset) {
    this.camera.position.set(...preset.position);
    this.controls.target.set(...preset.target);
    this.camera.fov = preset.fov || 50;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
