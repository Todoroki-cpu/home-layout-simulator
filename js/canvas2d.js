/**
 * 2D平面図キャンバス & 家具配置コントローラー (2D Canvas Controller)
 * 2D画面上での家具のドラッグ移動・回転・選択・追加を司るコアモジュール
 */
import { FLOOR_PLAN } from "./floorplanData.js";

export class Canvas2D {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");

    // 家具リスト (id, type, name, x, y, rotation, width, depth, height, color, modelType)
    this.furnitureList = [];
    this.selectedId = null;

    // ビュー変換 (メートル座標 -> スクリーン座標)
    // 原点 (0,0) をキャンバスの中央上寄りに配置
    this.zoom = 42; // 1メートルあたりのピクセル数 (px/m)
    this.panX = 140;
    this.panY = 40;

    // 背景下絵画像 (floorplan.jpg)
    this.bgImage = null;
    this.bgOpacity = 0.25; // 初期透過度
    this.showBgImage = true;
    this.loadBgImage("assets/floorplan.jpg");

    // ドラッグ＆インタラクション状態
    this.isDragging = false;
    this.isRotating = false;
    this.isPanning = false;
    this.dragStart = { x: 0, y: 0 };
    this.furnitureStartPos = { x: 0, y: 0, rotation: 0 };
    this.panStart = { x: 0, y: 0 };

    // スナップ設定
    this.snapToGrid = false;
    this.gridSize = 0.05; // 50mm (5cm)

    // ルームツアー（人目線ウォークスルー）連動状態
    this.tourPlayer = null;
    this.isTourMode = false;
    this.onTourTeleport = options.onTourTeleport || (() => {});

    // コールバック
    this.onFurnitureChange = options.onFurnitureChange || (() => {});
    this.onSelect = options.onSelect || (() => {});

    this.initEvents();
    this.resize();
  }

  loadBgImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.bgImage = img;
      this.render();
    };
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  /**
   * 座標変換: メートル (m) -> キャンバスピクセル (px)
   */
  mToPx(mx, my) {
    return {
      x: mx * this.zoom + this.panX,
      y: my * this.zoom + this.panY
    };
  }

  /**
   * 座標変換: キャンバスピクセル (px) -> メートル (m)
   */
  pxToM(px, py) {
    return {
      x: (px - this.panX) / this.zoom,
      y: (py - this.panY) / this.zoom
    };
  }

  setFurniture(list) {
    this.furnitureList = list.map(item => ({ ...item }));
    this.render();
  }

  addFurniture(item) {
    const newItem = {
      ...item,
      id: "f_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
    };
    this.furnitureList.push(newItem);
    this.selectedId = newItem.id;
    this.render();
    this.onFurnitureChange(this.furnitureList, newItem);
    this.onSelect(newItem);
    return newItem;
  }

  removeSelected() {
    if (!this.selectedId) return;
    this.furnitureList = this.furnitureList.filter(f => f.id !== this.selectedId);
    this.selectedId = null;
    this.render();
    this.onFurnitureChange(this.furnitureList, null);
    this.onSelect(null);
  }

  updateSelected(props) {
    const f = this.furnitureList.find(item => item.id === this.selectedId);
    if (!f) return;
    Object.assign(f, props);
    this.render();
    this.onFurnitureChange(this.furnitureList, f);
  }

  setTourPlayer(player) {
    this.tourPlayer = player;
    this.isTourMode = !!(player && player.active);
    this.render();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // マウスダウン
    this.canvas.addEventListener("mousedown", (e) => {
      const pos = getPos(e);
      const mPos = this.pxToM(pos.x, pos.y);

      // 右クリックまたはスペースキー押下時はパン（視点移動）
      if (e.button === 2 || e.button === 1 || e.spaceKey) {
        this.isPanning = true;
        this.panStart = { x: pos.x - this.panX, y: pos.y - this.panY };
        e.preventDefault();
        return;
      }

      // ルームツアーモード中の2Dクリックで人目線テレポート
      if (this.isTourMode && e.button === 0) {
        // 部屋の内外判定（外壁内ならテレポート）
        if (mPos.x >= 0.2 && mPos.x <= 6.5 && mPos.y >= 0.2 && mPos.y <= 11.5) {
          this.onTourTeleport(mPos.x, mPos.y);
          return;
        }
      }

      // 選択中家具の回転ハンドルをクリックしたか判定
      if (this.selectedId) {
        const selected = this.furnitureList.find(f => f.id === this.selectedId);
        if (selected && this.hitTestRotateHandle(pos, selected)) {
          this.isRotating = true;
          this.dragStart = { ...pos };
          this.furnitureStartPos = { ...selected };
          return;
        }
      }

      // 家具のヒットテスト（前面から探索）
      let hit = null;
      for (let i = this.furnitureList.length - 1; i >= 0; i--) {
        const f = this.furnitureList[i];
        if (this.hitTestFurniture(mPos, f)) {
          hit = f;
          break;
        }
      }

      if (hit) {
        this.selectedId = hit.id;
        this.isDragging = true;
        this.dragStart = { ...pos };
        this.furnitureStartPos = { ...hit };
        this.onSelect(hit);
      } else {
        this.selectedId = null;
        this.onSelect(null);
      }
      this.render();
    });

    // マウス移動
    window.addEventListener("mousemove", (e) => {
      const pos = getPos(e);

      if (this.isPanning) {
        this.panX = pos.x - this.panStart.x;
        this.panY = pos.y - this.panStart.y;
        this.render();
        return;
      }

      const selected = this.furnitureList.find(f => f.id === this.selectedId);
      if (!selected) return;

      if (this.isDragging) {
        const dx = (pos.x - this.dragStart.x) / this.zoom;
        const dy = (pos.y - this.dragStart.y) / this.zoom;
        let newX = this.furnitureStartPos.x + dx;
        let newY = this.furnitureStartPos.y + dy;

        if (this.snapToGrid) {
          newX = Math.round(newX / this.gridSize) * this.gridSize;
          newY = Math.round(newY / this.gridSize) * this.gridSize;
        }

        selected.x = Math.round(newX * 1000) / 1000;
        selected.y = Math.round(newY * 1000) / 1000;
        this.render();
        this.onFurnitureChange(this.furnitureList, selected);
      } else if (this.isRotating) {
        const centerPx = this.mToPx(selected.x, selected.y);
        const rad = Math.atan2(pos.y - centerPx.y, pos.x - centerPx.x);
        let deg = (rad * 180 / Math.PI) - 90; // 上向きを0度とする
        while (deg < 0) deg += 360;
        while (deg >= 360) deg -= 360;

        // Shiftキーまたは近接で15度スナップ
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        } else {
          // 0, 45, 90, 180等に緩くスナップ
          const cardinals = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (let c of cardinals) {
            if (Math.abs(deg - c) < 4) {
              deg = c % 360;
              break;
            }
          }
        }

        selected.rotation = Math.round(deg);
        this.render();
        this.onFurnitureChange(this.furnitureList, selected);
      }
    });

    // マウスアップ
    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.isRotating = false;
      this.isPanning = false;
    });

    // ホイールズーム
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const pos = getPos(e);
      const mBefore = this.pxToM(pos.x, pos.y);

      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.max(20, Math.min(180, this.zoom * factor));

      const pAfter = this.mToPx(mBefore.x, mBefore.y);
      this.panX += pos.x - pAfter.x;
      this.panY += pos.y - pAfter.y;
      this.render();
    });

    // コンテキストメニュー抑止
    this.canvas.addEventListener("contextmenu", e => e.preventDefault());
  }

  hitTestFurniture(mPos, f) {
    // 家具のローカル座標系に変換
    const rad = (-f.rotation * Math.PI) / 180;
    const dx = mPos.x - f.x;
    const dy = mPos.y - f.y;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);

    return Math.abs(lx) <= f.width * 0.5 && Math.abs(ly) <= f.depth * 0.5;
  }

  hitTestRotateHandle(pos, f) {
    const centerPx = this.mToPx(f.x, f.y);
    const rad = (f.rotation * Math.PI) / 180;
    const handleDist = (f.depth * 0.5) * this.zoom + 28;
    const hx = centerPx.x + Math.sin(rad) * handleDist;
    const hy = centerPx.y - Math.cos(rad) * handleDist;

    const dist = Math.hypot(pos.x - hx, pos.y - hy);
    return dist <= 14;
  }

  // --- 描画ルーチン ---

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 背景下絵画像 (floorplan.jpg) を正確なスケールで描画
    if (this.showBgImage && this.bgImage) {
      ctx.save();
      ctx.globalAlpha = this.bgOpacity;
      // 画像 (x:164, y:52) がメートル (0,0) に完全一致
      const scale = 0.0255;
      const imgW = this.bgImage.width * scale * this.zoom;
      const imgH = this.bgImage.height * scale * this.zoom;
      const imgPx = this.mToPx(-164 * scale, -52 * scale);
      ctx.drawImage(this.bgImage, imgPx.x, imgPx.y, imgW, imgH);
      ctx.restore();
    }

    // グリッド線描画 (0.5m単位)
    this.drawGrid(ctx);

    // 部屋ポリゴン描画
    this.drawRooms(ctx);

    // クローゼット・物入・押入描画 (隙間解消＆折れ戸記号)
    this.drawClosets(ctx);

    // 固定設備描画 (キッチン、洗面、便器等)
    this.drawFixedFixtures(ctx);

    // ドア開口部・軌跡
    this.drawDoors(ctx);

    // 窓開口部
    this.drawWindows(ctx);

    // 構造壁
    this.drawWalls(ctx);

    // 家具描画 (下敷きラグ等を先に、通常家具を後に)
    const rugs = this.furnitureList.filter(f => f.modelType === "rug");
    const others = this.furnitureList.filter(f => f.modelType !== "rug");
    rugs.forEach(f => this.drawFurnitureItem(ctx, f));
    others.forEach(f => this.drawFurnitureItem(ctx, f));

    // 選択中家具のオーバーレイ（寸法線、回転ハンドル）
    if (this.selectedId) {
      const selected = this.furnitureList.find(f => f.id === this.selectedId);
      if (selected) {
        this.drawSelectedOverlay(ctx, selected);
      }
    }

    // ルームツアー中の人目線位置＆視野扇形描画
    this.drawTourPlayer(ctx);
  }

  drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    const step = 0.5 * this.zoom;

    const startX = this.panX % step;
    for (let x = startX; x < this.canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    const startY = this.panY % step;
    for (let y = startY; y < this.canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRooms(ctx) {
    ctx.save();
    FLOOR_PLAN.rooms.forEach(room => {
      ctx.fillStyle = room.color;
      ctx.beginPath();
      room.polygon.forEach((p, idx) => {
        const pt = this.mToPx(p[0], p[1]);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();

      // 和室（畳の部屋）の場合: 伝統的な6畳間の畳割りと縁を描画
      if (room.type === "tatami") {
        ctx.save();
        // 和室の範囲: x = 0.14〜3.62, y = 6.63〜9.18
        // 6畳の畳割り (2列 × 3枚)
        const minX = 0.14, maxX = 3.62;
        const minY = 6.63, maxY = 9.18;
        const tatamiW = (maxX - minX) / 2; // 1.74m
        const tatamiH = (maxY - minY) / 3; // 0.85m

        for (let col = 0; col < 2; col++) {
          for (let row = 0; row < 3; row++) {
            const tx = minX + col * tatamiW;
            const ty = minY + row * tatamiH;
            const tPt = this.mToPx(tx, ty);
            const twPx = tatamiW * this.zoom;
            const thPx = tatamiH * this.zoom;

            // 畳表面（若草色・い草グリーン）
            ctx.fillStyle = "#a2be88";
            ctx.fillRect(tPt.x + 1, tPt.y + 1, twPx - 2, thPx - 2);

            // 畳の縁（長辺の黒/濃緑の縁）
            ctx.fillStyle = "#273623";
            ctx.fillRect(tPt.x + 1, tPt.y + 1, twPx - 2, 2.5);
            ctx.fillRect(tPt.x + 1, tPt.y + thPx - 3.5, twPx - 2, 2.5);

            // 畳枠線
            ctx.strokeStyle = "rgba(40, 55, 35, 0.45)";
            ctx.lineWidth = 1;
            ctx.strokeRect(tPt.x + 1, tPt.y + 1, twPx - 2, thPx - 2);
          }
        }
        ctx.restore();
      }

      // 部屋名ラベル
      const lpt = this.mToPx(room.labelPos[0], room.labelPos[1]);
      ctx.fillStyle = room.type === "tatami" ? "#1e2c1a" : "rgba(50, 40, 30, 0.75)";
      ctx.font = `600 ${Math.max(10, Math.min(14, this.zoom * 0.22))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(room.name, lpt.x, lpt.y);
    });
    ctx.restore();
  }

  drawClosets(ctx) {
    if (!FLOOR_PLAN.closets) return;
    ctx.save();
    FLOOR_PLAN.closets.forEach(cl => {
      // 1. 収納床ポリゴン塗りつぶし (部屋間の隙間を綺麗にカバー)
      ctx.fillStyle = cl.color || "#e8dcce";
      ctx.strokeStyle = "#8d7b68";
      ctx.lineWidth = 1;
      ctx.beginPath();
      cl.polygon.forEach((p, idx) => {
        const pt = this.mToPx(p[0], p[1]);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. 収納名ラベル (物入 / 押入)
      const lpt = this.mToPx(cl.labelPos[0], cl.labelPos[1]);
      ctx.fillStyle = "#5d4a36";
      ctx.font = `600 ${Math.max(9, Math.min(12, this.zoom * 0.2))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cl.name, lpt.x, lpt.y);

      // 3. ドア（折れ戸・ふすま）記号の描画
      if (cl.door) {
        const d = cl.door;
        const dpt = this.mToPx(d.pos[0], d.pos[1]);
        const wPx = d.width * this.zoom;

        ctx.save();
        ctx.translate(dpt.x, dpt.y);

        if (d.facing === "S") ctx.rotate(Math.PI);
        else if (d.facing === "E") ctx.rotate(Math.PI * 0.5);
        else if (d.facing === "W") ctx.rotate(-Math.PI * 0.5);

        if (d.type === "folding") {
          // 折れ戸記号: 2連の山型（折れ戸が開く方向を示す三角形）
          ctx.strokeStyle = "#4a3b2c";
          ctx.lineWidth = 2;
          const halfW = wPx * 0.5;
          const qW = halfW * 0.5;
          const peakH = 10;

          // 左側と右側の山型
          ctx.beginPath();
          ctx.moveTo(-halfW, 0);
          ctx.lineTo(-halfW + qW, -peakH);
          ctx.lineTo(0, 0);
          ctx.lineTo(qW, -peakH);
          ctx.lineTo(halfW, 0);
          ctx.stroke();

          // 扉開閉クリアランスゾーン（点線）
          ctx.strokeStyle = "rgba(180, 100, 60, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(-halfW, -peakH * 1.5, wPx, peakH * 1.5);
          ctx.setLineDash([]);
        } else if (d.type === "fusuma") {
          // ふすま2枚引き違い線
          ctx.strokeStyle = "#4a3b2c";
          ctx.lineWidth = 2.5;
          const halfW = wPx * 0.5;
          ctx.beginPath();
          ctx.moveTo(-halfW, -3);
          ctx.lineTo(4, -3);
          ctx.moveTo(-4, 3);
          ctx.lineTo(halfW, 3);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
    ctx.restore();
  }

  drawWalls(ctx) {
    ctx.save();
    FLOOR_PLAN.walls.forEach(w => {
      const p1 = this.mToPx(w.p1[0], w.p1[1]);
      const p2 = this.mToPx(w.p2[0], w.p2[1]);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = w.type === "exterior" ? "#2b3542" : "#4a5568";
      ctx.lineWidth = (w.type === "exterior" ? 0.14 : 0.08) * this.zoom;
      ctx.lineCap = "round";
      ctx.stroke();
    });
    ctx.restore();
  }

  drawWindows(ctx) {
    ctx.save();
    FLOOR_PLAN.windows.forEach(win => {
      const pt = this.mToPx(win.pos[0], win.pos[1]);
      const wPx = win.width * this.zoom;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      if (win.direction === "W") ctx.rotate(Math.PI * 0.5);

      // 窓ガラスの水色塗りつぶし (鮮やかなガラスのアクアスカイブルー)
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.fillRect(-wPx * 0.5, -5, wPx, 10);

      // ガラスのハイライト反射光
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(-wPx * 0.45, -2, wPx * 0.9, 2);

      // サッシ二重線 (シャープなアルミサッシブルー)
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-wPx * 0.5, -5);
      ctx.lineTo(wPx * 0.5, -5);
      ctx.moveTo(-wPx * 0.5, 5);
      ctx.lineTo(wPx * 0.5, 5);
      ctx.stroke();

      ctx.restore();
    });
    ctx.restore();
  }

  drawDoors(ctx) {
    ctx.save();
    FLOOR_PLAN.doors.forEach(door => {
      const pt = this.mToPx(door.pos[0], door.pos[1]);
      const rPx = door.width * this.zoom;

      ctx.save();
      ctx.translate(pt.x, pt.y);

      if (door.type === "hinged") {
        let rot = 0;
        let arcDir = 1;

        if (door.facing === "E") {
          // 東壁外開き（玄関ドア、MB扉: 南側ヒンジ、東へ外開き）
          rot = 0;
          arcDir = door.swing === "out" ? 1 : -1;
        } else if (door.facing === "N") {
          // 南壁から北（室内）へ開く（トイレドアなど）
          rot = -Math.PI * 0.5;
          arcDir = 1;
        } else if (door.facing === "W") {
          // 東壁から西（室内）へ開く（洋室ドアなど）
          rot = Math.PI;
          arcDir = -1;
        } else if (door.facing === "S") {
          // 北壁から南（LDK内）へ開く
          rot = Math.PI * 0.5;
          arcDir = -1;
        }

        ctx.rotate(rot);

        // 開き戸の弧
        ctx.strokeStyle = "rgba(70, 80, 95, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        if (arcDir === 1) {
          ctx.arc(0, 0, rPx, 0, Math.PI * 0.5);
        } else {
          ctx.arc(0, 0, rPx, -Math.PI * 0.5, 0);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 扉線
        ctx.strokeStyle = "#4a3c31";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rPx, 0);
        ctx.stroke();
      } else if (door.type === "sliding" || door.type === "fusuma") {
        // 引き戸 / ふすま 2枚引き違い線
        ctx.strokeStyle = "#8d6e63";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-rPx * 0.5, -2);
        ctx.lineTo(4, -2);
        ctx.moveTo(-4, 2);
        ctx.lineTo(rPx * 0.5, 2);
        ctx.stroke();
      }
      ctx.restore();
    });
    ctx.restore();
  }

  drawFixedFixtures(ctx) {
    ctx.save();
    FLOOR_PLAN.fixedFixtures.forEach(fix => {
      // エアコン等の天井・壁面高所設備は2D家具配置平面図では非表示
      if (fix.id.startsWith("ac_") || (fix.pos && fix.pos[2] > 1.8)) return;

      const pt = this.mToPx(fix.pos[0], fix.pos[1]);
      const wPx = fix.size[0] * this.zoom;
      const dPx = fix.size[1] * this.zoom;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      if (fix.rotation) {
        ctx.rotate((fix.rotation * Math.PI) / 180);
      }

      if (fix.id === "shoes_box") {
        // 下駄箱 (間取り図の落ち着いたベージュトーン＆木枠)
        ctx.fillStyle = "#cfbda2";
        ctx.strokeStyle = "#7c6853";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);
        ctx.strokeRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);

        ctx.fillStyle = "#3e2723";
        ctx.font = `600 ${Math.max(10, this.zoom * 0.2)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("下駄箱", 0, 0);
      } else if (fix.id === "toilet_counter") {
        // トイレ手洗いカウンター (木目カウンター＋楕円ボウル＋水栓)
        ctx.fillStyle = "#c8b399";
        ctx.strokeStyle = "#6d5b45";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);
        ctx.strokeRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);

        // 手洗いボウル（左側・西寄り）
        const bowlX = -wPx * 0.25;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#4a5568";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(bowlX, 0, wPx * 0.16, dPx * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 水栓マーク
        ctx.fillStyle = "#718096";
        ctx.beginPath();
        ctx.arc(bowlX, -dPx * 0.25, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (fix.id === "toilet_bowl") {
        // トイレ便器 (東壁側タンク＋西向き楕円便座)
        // ロータンク (右側・東壁側)
        const tankW = wPx * 0.32;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.fillRect(wPx * 0.5 - tankW, -dPx * 0.45, tankW, dPx * 0.9);
        ctx.strokeRect(wPx * 0.5 - tankW, -dPx * 0.45, tankW, dPx * 0.9);

        // 便座 (左側・西向き)
        const bowlW = wPx * 0.65;
        ctx.beginPath();
        ctx.ellipse(-wPx * 0.5 + bowlW * 0.5, 0, bowlW * 0.5, dPx * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 便座の穴（内側）
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.ellipse(-wPx * 0.5 + bowlW * 0.48, 0, bowlW * 0.3, dPx * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (fix.id === "kitchen_system") {
        // システムキッチン (本体＋シンク＋ガスコンロ)
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);
        ctx.strokeRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);

        // シンク (水色)
        ctx.fillStyle = "#e2e8f0";
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1.2;
        const sinkH = dPx * 0.32;
        ctx.fillRect(-wPx * 0.4, -dPx * 0.35, wPx * 0.8, sinkH);
        ctx.strokeRect(-wPx * 0.4, -dPx * 0.35, wPx * 0.8, sinkH);

        // ガスコンロ 3口バーナー
        ctx.fillStyle = "#0f172a";
        const burnerY = dPx * 0.25;
        [-wPx * 0.2, 0, wPx * 0.2].forEach(bx => {
          ctx.beginPath();
          ctx.arc(bx, burnerY, Math.max(3, wPx * 0.08), 0, Math.PI * 2);
          ctx.fill();
        });

        // ラベル
        ctx.fillStyle = "#f8fafc";
        ctx.font = `600 ${Math.max(10, this.zoom * 0.18)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("キッチン", 0, -dPx * 0.05);
      } else {
        ctx.fillStyle = fix.color;
        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);
        ctx.strokeRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx);

        // ラベル
        ctx.fillStyle = "#333333";
        ctx.font = `500 ${Math.max(9, this.zoom * 0.16)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fix.name.substring(0, 4), 0, 0);
      }

      ctx.restore();
    });
    ctx.restore();
  }

  drawTourPlayer(ctx) {
    if (!this.tourPlayer || !this.tourPlayer.active) return;
    const { x, z, yaw } = this.tourPlayer;
    const pt = this.mToPx(x, z);

    ctx.save();
    ctx.translate(pt.x, pt.y);

    // Three.js の yaw (0は北 -Y, 時計回り)
    // 2D Canvasの角度: 0は東(+X), 時計回り
    // yaw=0 のとき北 (-Y) を向くように変換
    const angle = yaw - Math.PI * 0.5;

    // 1. 視野コーン (FOV 70度)
    const fov = (70 * Math.PI) / 180;
    const coneRadius = 3.5 * this.zoom; // 約3.5mの視線扇形

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coneRadius);
    grad.addColorStop(0, "rgba(2, 132, 199, 0.45)");
    grad.addColorStop(0.7, "rgba(2, 132, 199, 0.12)");
    grad.addColorStop(1, "rgba(2, 132, 199, 0.0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, coneRadius, angle - fov * 0.5, angle + fov * 0.5);
    ctx.closePath();
    ctx.fill();

    // 視野境界線
    ctx.strokeStyle = "rgba(2, 132, 199, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. プレイヤー位置アイコン
    ctx.fillStyle = "rgba(2, 132, 199, 0.25)";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // 視線方向マーカー
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    const tipX = Math.cos(angle) * 14;
    const tipY = Math.sin(angle) * 14;
    ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
    ctx.fill();

    // ラベル
    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("現在地", 0, -18);

    ctx.restore();
  }

  drawFurnitureItem(ctx, f) {
    const pt = this.mToPx(f.x, f.y);
    const wPx = f.width * this.zoom;
    const dPx = f.depth * this.zoom;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate((f.rotation * Math.PI) / 180);

    // 影
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 家具ベース四角形
    ctx.fillStyle = f.color;
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 2;

    // 角丸矩形
    const r = Math.min(6, wPx * 0.1, dPx * 0.1);
    ctx.beginPath();
    ctx.roundRect(-wPx * 0.5, -dPx * 0.5, wPx, dPx, r);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.stroke();

    // ソファやベッド、テーブル等の家具タイプ別特徴線
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    if (f.modelType === "sofa") {
      // 背もたれ線 (上部)
      ctx.beginPath();
      ctx.moveTo(-wPx * 0.5 + 4, -dPx * 0.5 + dPx * 0.28);
      ctx.lineTo(wPx * 0.5 - 4, -dPx * 0.5 + dPx * 0.28);
      ctx.stroke();
    } else if (f.modelType === "bed") {
      // 枕
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillRect(-wPx * 0.35, -dPx * 0.5 + 6, wPx * 0.7, dPx * 0.2);
    }

    // 家具向きインジケーター（前方を示す小さな三角）
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.moveTo(0, dPx * 0.5 - 2);
    ctx.lineTo(-4, dPx * 0.5 - 8);
    ctx.lineTo(4, dPx * 0.5 - 8);
    ctx.closePath();
    ctx.fill();

    // 家具名テキスト
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 3;
    ctx.font = `600 ${Math.max(9, Math.min(12, this.zoom * 0.18))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.name.substring(0, 6), 0, 0);

    ctx.restore();
  }

  drawSelectedOverlay(ctx, f) {
    const pt = this.mToPx(f.x, f.y);
    const wPx = f.width * this.zoom;
    const dPx = f.depth * this.zoom;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate((f.rotation * Math.PI) / 180);

    // 選択ハイライト枠（シアン色点線）
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-wPx * 0.5 - 4, -dPx * 0.5 - 4, wPx + 8, dPx + 8);
    ctx.setLineDash([]);

    // 4隅のノード
    ctx.fillStyle = "#00e5ff";
    [
      [-wPx*0.5-4, -dPx*0.5-4],
      [wPx*0.5+4, -dPx*0.5-4],
      [-wPx*0.5-4, dPx*0.5+4],
      [wPx*0.5+4, dPx*0.5+4]
    ].forEach(([x, y]) => {
      ctx.fillRect(x - 3, y - 3, 6, 6);
    });

    // 回転ハンドル（上部に伸びる線とノブ）
    const handleDist = dPx * 0.5 + 28;
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -dPx * 0.5 - 4);
    ctx.lineTo(0, -handleDist);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -handleDist, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 寸法テキスト表示 (W x D mm)
    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    const dimText = `${Math.round(f.width * 1000)} × ${Math.round(f.depth * 1000)} mm`;
    ctx.fillText(dimText, 0, dPx * 0.5 + 16);

    ctx.restore();
  }
}
