/**
 * プロシージャル家具3Dモデル生成 (Procedural Furniture 3D Models)
 * 幅(w), 奥行(d), 高さ(h), 色(color) を受け取り、寸法通りのThree.js Groupを構築します。
 */
import * as THREE from "three";

export class FurnitureModelFactory {
  /**
   * 共通マテリアル生成
   */
  static getMaterial(color, roughness = 0.6, metalness = 0.1) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
      flatShading: false
    });
  }

  /**
   * ソファ (Sofa)
   */
  static createSofa(w = 1.8, d = 0.85, h = 0.75, color = "#4a5568") {
    const group = new THREE.Group();
    const mat = this.getMaterial(color, 0.85, 0.05);
    const legMat = this.getMaterial("#222222", 0.3, 0.8);

    const seatH = h * 0.45;
    const seatD = d * 0.75;
    const armW = Math.min(0.18, w * 0.12);
    const backH = h - seatH;
    const backD = d - seatD;

    // 座面ベース
    const seatGeo = new THREE.BoxGeometry(w - armW * 2, seatH * 0.7, seatD);
    const seat = new THREE.Mesh(seatGeo, mat);
    seat.position.set(0, seatH * 0.5, (d - seatD) * 0.5 - d * 0.5 + seatD * 0.5);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    // 座面クッション（左右分割感）
    const cushionCount = w > 1.5 ? 2 : 1;
    const cushionW = (w - armW * 2) / cushionCount;
    for (let i = 0; i < cushionCount; i++) {
      const cGeo = new THREE.BoxGeometry(cushionW * 0.96, seatH * 0.4, seatD * 0.95);
      const cushion = new THREE.Mesh(cGeo, mat);
      const cx = (i + 0.5) * cushionW - (w - armW * 2) * 0.5;
      cushion.position.set(cx, seatH * 0.8, seat.position.z);
      cushion.castShadow = true;
      group.add(cushion);
    }

    // 背もたれ
    const backGeo = new THREE.BoxGeometry(w - armW * 2, backH, backD);
    const back = new THREE.Mesh(backGeo, mat);
    back.position.set(0, seatH + backH * 0.5, -d * 0.5 + backD * 0.5);
    back.castShadow = true;
    group.add(back);

    // 左右アームレスト (ひじ掛け)
    const armGeo = new THREE.BoxGeometry(armW, h * 0.75, d);
    const armL = new THREE.Mesh(armGeo, mat);
    armL.position.set(-w * 0.5 + armW * 0.5, h * 0.75 * 0.5, 0);
    armL.castShadow = true;
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, mat);
    armR.position.set(w * 0.5 - armW * 0.5, h * 0.75 * 0.5, 0);
    armR.castShadow = true;
    group.add(armR);

    // 4本脚
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.08, 8);
    const legPositions = [
      [-w * 0.5 + 0.06, 0.04, -d * 0.5 + 0.06],
      [w * 0.5 - 0.06, 0.04, -d * 0.5 + 0.06],
      [-w * 0.5 + 0.06, 0.04, d * 0.5 - 0.06],
      [w * 0.5 - 0.06, 0.04, d * 0.5 - 0.06]
    ];
    legPositions.forEach(p => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...p);
      group.add(leg);
    });

    return group;
  }

  /**
   * テレビボード＋テレビ (TV Stand with TV)
   */
  static createTvBoard(w = 1.5, d = 0.4, h = 1.1, color = "#3e2723") {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(color, 0.5, 0.1);
    const tvMat = this.getMaterial("#111111", 0.2, 0.3);
    const screenMat = this.getMaterial("#1a202c", 0.1, 0.5);

    const standH = 0.42; // ボードの高さ
    // ボード本体
    const boardGeo = new THREE.BoxGeometry(w, standH, d);
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.position.set(0, standH * 0.5, 0);
    board.castShadow = true;
    group.add(board);

    // スリット/扉の溝
    const doorMat = this.getMaterial(color, 0.6, 0.1);
    const doorGeo = new THREE.BoxGeometry(w * 0.95, standH * 0.8, 0.02);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, standH * 0.5, d * 0.5 + 0.01);
    group.add(door);

    // 薄型大型テレビ
    const tvW = Math.min(w * 0.85, 1.3);
    const tvH = tvW * 0.58; // 16:9
    const tvFrameGeo = new THREE.BoxGeometry(tvW, tvH, 0.04);
    const tvFrame = new THREE.Mesh(tvFrameGeo, tvMat);
    tvFrame.position.set(0, standH + tvH * 0.5 + 0.08, 0);
    tvFrame.castShadow = true;
    group.add(tvFrame);

    // 画面
    const screenGeo = new THREE.PlaneGeometry(tvW * 0.96, tvH * 0.92);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, tvFrame.position.y, 0.021);
    group.add(screen);

    // テレビスタンド脚
    const baseGeo = new THREE.BoxGeometry(tvW * 0.4, 0.02, d * 0.6);
    const base = new THREE.Mesh(baseGeo, tvMat);
    base.position.set(0, standH + 0.01, 0);
    group.add(base);

    const poleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
    const pole = new THREE.Mesh(poleGeo, tvMat);
    pole.position.set(0, standH + 0.05, 0);
    group.add(pole);

    return group;
  }

  /**
   * ダイニングテーブル＆チェアセット (Dining Set)
   */
  static createDiningSet(w = 1.4, d = 0.8, h = 0.72, color = "#8d6e63") {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(color, 0.4, 0.05);
    const legMat = this.getMaterial("#2d3748", 0.3, 0.8);

    // テーブル天板
    const topThick = 0.035;
    const topGeo = new THREE.BoxGeometry(w, topThick, d);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.set(0, h - topThick * 0.5, 0);
    top.castShadow = true;
    group.add(top);

    // テーブル脚 4本
    const legGeo = new THREE.CylinderGeometry(0.025, 0.02, h - topThick, 8);
    const legX = w * 0.5 - 0.08;
    const legZ = d * 0.5 - 0.08;
    const legPositions = [
      [-legX, (h - topThick) * 0.5, -legZ],
      [legX, (h - topThick) * 0.5, -legZ],
      [-legX, (h - topThick) * 0.5, legZ],
      [legX, (h - topThick) * 0.5, legZ]
    ];
    legPositions.forEach(p => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...p);
      leg.castShadow = true;
      group.add(leg);
    });

    // チェア 4脚配置
    const chairW = 0.42;
    const chairD = 0.42;
    const chairSeatH = 0.43;
    const chairBackH = 0.4;
    const chairMat = this.getMaterial("#4a5568", 0.7, 0.1);

    const createChair = (x, z, rotY) => {
      const chair = new THREE.Group();
      // 座面
      const cSeatGeo = new THREE.BoxGeometry(chairW, 0.03, chairD);
      const cSeat = new THREE.Mesh(cSeatGeo, chairMat);
      cSeat.position.set(0, chairSeatH, 0);
      chair.add(cSeat);
      // 背もたれ
      const cBackGeo = new THREE.BoxGeometry(chairW, chairBackH, 0.03);
      const cBack = new THREE.Mesh(cBackGeo, chairMat);
      cBack.position.set(0, chairSeatH + chairBackH * 0.5, -chairD * 0.5 + 0.015);
      chair.add(cBack);
      // 脚
      const cLegGeo = new THREE.CylinderGeometry(0.015, 0.01, chairSeatH, 6);
      [[-chairW*0.4, -chairD*0.4], [chairW*0.4, -chairD*0.4], [-chairW*0.4, chairD*0.4], [chairW*0.4, chairD*0.4]].forEach(([lx, lz]) => {
        const cl = new THREE.Mesh(cLegGeo, legMat);
        cl.position.set(lx, chairSeatH * 0.5, lz);
        chair.add(cl);
      });

      chair.position.set(x, 0, z);
      chair.rotation.y = rotY;
      return chair;
    };

    // 北側2脚
    group.add(createChair(-w * 0.25, -d * 0.5 - 0.22, 0));
    group.add(createChair(w * 0.25, -d * 0.5 - 0.22, 0));
    // 南側2脚
    group.add(createChair(-w * 0.25, d * 0.5 + 0.22, Math.PI));
    group.add(createChair(w * 0.25, d * 0.5 + 0.22, Math.PI));

    return group;
  }

  /**
   * ローテーブル / センターテーブル (Coffee Table)
   */
  static createCoffeeTable(w = 1.0, d = 0.5, h = 0.38, color = "#a1887f") {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(color, 0.4, 0.05);
    const legMat = this.getMaterial("#333333", 0.2, 0.8);

    const topGeo = new THREE.BoxGeometry(w, 0.025, d);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.set(0, h - 0.0125, 0);
    top.castShadow = true;
    group.add(top);

    // 4本脚
    const legGeo = new THREE.CylinderGeometry(0.018, 0.012, h - 0.025, 8);
    const legX = w * 0.5 - 0.06;
    const legZ = d * 0.5 - 0.06;
    [[-legX, -legZ], [legX, -legZ], [-legX, legZ], [legX, legZ]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, (h - 0.025) * 0.5, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  /**
   * ベッド (Bed: シングル〜ダブル)
   */
  static createBed(w = 1.2, d = 2.0, h = 0.65, color = "#eceff1") {
    const group = new THREE.Group();
    const frameMat = this.getMaterial("#5d4037", 0.6, 0.1);
    const mattressMat = this.getMaterial(color, 0.9, 0.0);
    const duvetMat = this.getMaterial("#90a4ae", 0.8, 0.0);
    const pillowMat = this.getMaterial("#ffffff", 0.9, 0.0);

    const frameH = 0.22;
    const mattressH = 0.22;
    const headH = h;

    // フレーム
    const frameGeo = new THREE.BoxGeometry(w, frameH, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, frameH * 0.5, 0);
    frame.castShadow = true;
    group.add(frame);

    // ヘッドボード
    const headGeo = new THREE.BoxGeometry(w, headH, 0.08);
    const head = new THREE.Mesh(headGeo, frameMat);
    head.position.set(0, headH * 0.5, -d * 0.5 + 0.04);
    head.castShadow = true;
    group.add(head);

    // マットレス
    const matGeo = new THREE.BoxGeometry(w * 0.96, mattressH, d * 0.94);
    const mattress = new THREE.Mesh(matGeo, mattressMat);
    mattress.position.set(0, frameH + mattressH * 0.5, 0.04);
    mattress.castShadow = true;
    group.add(mattress);

    // 掛け布団 (Duvet)
    const duvetGeo = new THREE.BoxGeometry(w * 0.97, mattressH * 0.5, d * 0.65);
    const duvet = new THREE.Mesh(duvetGeo, duvetMat);
    duvet.position.set(0, frameH + mattressH + 0.03, d * 0.15);
    group.add(duvet);

    // 枕 (Pillow)
    const pillowCount = w > 1.3 ? 2 : 1;
    const pW = (w * 0.8) / pillowCount;
    for (let i = 0; i < pillowCount; i++) {
      const pGeo = new THREE.BoxGeometry(pW * 0.85, 0.1, 0.35);
      const pillow = new THREE.Mesh(pGeo, pillowMat);
      const px = (i + 0.5) * pW - (w * 0.8) * 0.5;
      pillow.position.set(px, frameH + mattressH + 0.05, -d * 0.5 + 0.3);
      group.add(pillow);
    }

    return group;
  }

  /**
   * ワークデスク＆オフィスチェア (Work Desk & Chair)
   */
  static createDesk(w = 1.2, d = 0.6, h = 0.72, color = "#616161") {
    const group = new THREE.Group();
    const topMat = this.getMaterial(color, 0.4, 0.1);
    const steelMat = this.getMaterial("#212121", 0.3, 0.7);

    // 天板
    const topGeo = new THREE.BoxGeometry(w, 0.03, d);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, h - 0.015, 0);
    top.castShadow = true;
    group.add(top);

    // スチール脚 (スクエアフレーム脚)
    const legGeo = new THREE.BoxGeometry(0.04, h - 0.03, d * 0.9);
    const legL = new THREE.Mesh(legGeo, steelMat);
    legL.position.set(-w * 0.5 + 0.04, (h - 0.03) * 0.5, 0);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, steelMat);
    legR.position.set(w * 0.5 - 0.04, (h - 0.03) * 0.5, 0);
    group.add(legR);

    // モニター
    const monGeo = new THREE.BoxGeometry(0.55, 0.35, 0.03);
    const mon = new THREE.Mesh(monGeo, steelMat);
    mon.position.set(0, h + 0.25, -d * 0.3);
    group.add(mon);

    return group;
  }

  /**
   * 冷蔵庫 (Refrigerator)
   */
  static createFridge(w = 0.68, d = 0.7, h = 1.82, color = "#f5f5f5") {
    const group = new THREE.Group();
    const bodyMat = this.getMaterial(color, 0.25, 0.2);
    const lineMat = this.getMaterial("#9e9e9e", 0.5, 0.1);

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, h * 0.5, 0);
    body.castShadow = true;
    group.add(body);

    // ドア分割スリット（冷蔵室・冷凍室・野菜室）
    const line1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.01, 0.02), lineMat);
    line1.position.set(0, h * 0.58, d * 0.5 + 0.005);
    group.add(line1);

    const line2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.01, 0.02), lineMat);
    line2.position.set(0, h * 0.35, d * 0.5 + 0.005);
    group.add(line2);

    return group;
  }

  /**
   * ドラム式洗濯機 (Washing Machine)
   */
  static createWashingMachine(w = 0.64, d = 0.64, h = 1.05, color = "#ffffff") {
    const group = new THREE.Group();
    const bodyMat = this.getMaterial(color, 0.2, 0.1);
    const doorMat = this.getMaterial("#263238", 0.1, 0.6);

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, h * 0.5, 0);
    body.castShadow = true;
    group.add(body);

    // ドラム窓 (丸いガラスタッチ)
    const doorGeo = new THREE.CylinderGeometry(w * 0.32, w * 0.32, 0.03, 24);
    doorGeo.rotateX(Math.PI * 0.5);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, h * 0.55, d * 0.5 + 0.01);
    group.add(door);

    return group;
  }

  /**
   * ラグマット (Rug)
   */
  static createRug(w = 2.0, d = 1.4, h = 0.015, color = "#cfd8dc") {
    const group = new THREE.Group();
    const rugMat = this.getMaterial(color, 0.95, 0.0);
    const geo = new THREE.BoxGeometry(w, 0.015, d);
    const rug = new THREE.Mesh(geo, rugMat);
    rug.position.set(0, 0.008, 0);
    rug.receiveShadow = true;
    group.add(rug);
    return group;
  }

  /**
   * 観葉植物 (Indoor Plant)
   */
  static createPlant(w = 0.5, d = 0.5, h = 1.2, color = "#2e7d32") {
    const group = new THREE.Group();
    const potMat = this.getMaterial("#ffffff", 0.4, 0.1);
    const plantMat = this.getMaterial(color, 0.6, 0.0);
    const trunkMat = this.getMaterial("#4e342e", 0.8, 0.0);

    // 植木鉢
    const potGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.35, 16);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(0, 0.175, 0);
    pot.castShadow = true;
    group.add(pot);

    // 幹
    const trunkGeo = new THREE.CylinderGeometry(0.02, 0.025, h * 0.6, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0, 0.35 + h * 0.3, 0);
    group.add(trunk);

    // 葉（球体・クラスター複数）
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.06, 8, 8);
      leafGeo.scale(1.2, 0.6, 1.0);
      const leaf = new THREE.Mesh(leafGeo, plantMat);
      const ang = (i / 5) * Math.PI * 2;
      leaf.position.set(
        Math.cos(ang) * 0.15,
        0.5 + h * 0.35 + (i * 0.08),
        Math.sin(ang) * 0.15
      );
      leaf.castShadow = true;
      group.add(leaf);
    }

    return group;
  }

  /**
   * 和室用座卓 (Japanese Low Table)
   */
  static createZataku(w = 1.05, d = 0.75, h = 0.34, color = "#3e2723") {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(color, 0.3, 0.1);

    const topGeo = new THREE.BoxGeometry(w, 0.035, d);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.set(0, h - 0.0175, 0);
    top.castShadow = true;
    group.add(top);

    // 4本太脚
    const legGeo = new THREE.BoxGeometry(0.06, h - 0.035, 0.06);
    const lx = w * 0.5 - 0.08;
    const lz = d * 0.5 - 0.08;
    [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, (h - 0.035) * 0.5, z);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  /**
   * 本棚 / シェルフ (Bookshelf)
   */
  static createBookshelf(w = 0.9, d = 0.35, h = 1.8, color = "#5d4037") {
    const group = new THREE.Group();
    const woodMat = this.getMaterial(color, 0.5, 0.1);

    // 外枠
    const shelfGeo = new THREE.BoxGeometry(w, h, d);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(0, h * 0.5, 0);
    shelf.castShadow = true;
    group.add(shelf);

    // 棚板の溝感（コントラストのある板）
    const shelfCount = 4;
    for (let i = 1; i <= shelfCount; i++) {
      const lineGeo = new THREE.BoxGeometry(w * 0.92, 0.02, d * 0.04);
      const line = new THREE.Mesh(lineGeo, this.getMaterial("#2d1f1c", 0.7, 0.1));
      line.position.set(0, (i / (shelfCount + 1)) * h, d * 0.5 + 0.005);
      group.add(line);
    }

    return group;
  }
}
