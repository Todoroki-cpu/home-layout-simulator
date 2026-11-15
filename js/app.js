/**
 * メインアプリケーション (Main Application Controller)
 */
import { Canvas2D } from "./canvas2d.js";
import { Scene3D } from "./scene3d.js";
import { FURNITURE_CATALOG, INITIAL_PRESET_FURNITURE } from "./furnitureCatalog.js";
import { FLOOR_PLAN } from "./floorplanData.js";

class App {
  constructor() {
    this.canvas2d = null;
    this.scene3d = null;
    this.currentCategory = "all";

    this.init();
  }

  init() {
    // 1. 2D Canvas 初期化
    const canvasEl = document.getElementById("canvas-2d");
    this.canvas2d = new Canvas2D(canvasEl, {
      onFurnitureChange: (list, changedItem) => {
        this.scene3d.updateFurniture(list);
        this.saveToLocalStorage();
      },
      onSelect: (selectedItem) => {
        this.updatePropertyPanel(selectedItem);
      },
      onTourTeleport: (x, z) => {
        if (this.scene3d && this.scene3d.isTourMode) {
          this.scene3d.teleportTour(x, z);
        }
      }
    });

    // 2. 3D Scene 初期化
    const container3d = document.getElementById("container-3d");
    this.scene3d = new Scene3D(container3d, {
      onTourMove: (player) => {
        this.canvas2d.setTourPlayer(player);
      }
    });

    // 3. 家具カタログUIの生成
    this.renderCatalog();

    // 4. カメラプリセットUIの生成
    this.renderCameraPresets();

    // 5. ルームツアーUIの初期化
    this.initTourUI();

    // 6. スプリッター（2D/3D横幅リサイザー）初期化
    this.initSplitter();

    // 7. イベントリスナー登録
    this.bindEvents();

    // 8. 保存データの読込 (URL共有ハッシュ > localStorage > おすすめ初期配置)
    const loadedFromUrl = this.loadFromUrlHash();
    if (!loadedFromUrl) {
      const SCALE_VERSION = "scale_v2_20261115";
      const savedVersion = localStorage.getItem("home_layout_simulator_scale_version");
      const saved = localStorage.getItem("home_layout_simulator_data");

      if (saved && savedVersion === SCALE_VERSION) {
        try {
          const parsed = JSON.parse(saved);
          this.canvas2d.setFurniture(parsed);
          this.scene3d.updateFurniture(parsed);
        } catch (e) {
          this.loadPresetFurniture();
        }
      } else {
        // スケール精査後の正しい初期配置に更新
        this.loadPresetFurniture();
        localStorage.setItem("home_layout_simulator_scale_version", SCALE_VERSION);
      }
    }

    // スマホ端末検出時: 初期表示を「2Dのみ」にし、間取り図全体を画面中央に綺麗にフィット
    if (window.innerWidth <= 768) {
      this.setViewMode("2d");
      setTimeout(() => {
        this.canvas2d.fitToScreen();
      }, 150);
    }

    // ウィンドウリサイズ・画面回転時に自動フィット
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        this.canvas2d.fitToScreen();
      }
    });
  }

  /**
   * 表示モード切替 (split / 2d / 3d)
   */
  setViewMode(mode) {
    document.querySelectorAll(".btn-view-mode").forEach(b => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    const main = document.getElementById("main-workspace");
    if (main) main.className = `workspace-layout mode-${mode}`;
    this.canvas2d.resize();
    this.scene3d.resize();
    if (mode === "2d") {
      this.canvas2d.fitToScreen();
    }
  }

  /**
   * スマホ向けボトムドロワー (家具カタログ) の開閉
   */
  openMobileDrawer() {
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("drawer-backdrop");
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.remove("hidden");
  }

  closeMobileDrawer() {
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("drawer-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.add("hidden");
  }

  /**
   * トースト通知を表示
   */
  showToast(message, duration = 3500) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.remove("hidden");
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, duration);
  }

  /**
   * 現在の家具配置を圧縮し、共有URLを生成
   */
  exportShareUrl() {
    if (!window.LZString) {
      alert("圧縮ライブラリをロード中です。少々お待ちください。");
      return;
    }

    // 圧縮用ミニマム構造に変換
    const minData = this.canvas2d.furnitureList.map(f => ({
      t: f.type,
      n: f.name,
      x: Math.round(f.x * 100) / 100,
      y: Math.round(f.y * 100) / 100,
      r: f.rotation,
      w: Math.round(f.width * 100) / 100,
      d: Math.round(f.depth * 100) / 100,
      h: Math.round(f.height * 100) / 100,
      c: f.color,
      m: f.modelType
    }));

    const jsonStr = JSON.stringify(minData);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const shareUrl = `${window.location.origin}${window.location.pathname}#layout=${compressed}`;

    // クリップボードへのコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast("✅ 共有URLをクリップボードにコピーしました！<br>別のブラウザやスマホで開くとレイアウトが復元されます。");
      }).catch(() => {});
    }

    // モーダルを表示して確実に見える化
    const modal = document.getElementById("share-modal");
    const input = document.getElementById("share-url-input");
    if (modal && input) {
      input.value = shareUrl;
      modal.classList.remove("hidden");
      input.select();
    }
  }

  /**
   * URLハッシュからの家具配置復元
   */
  loadFromUrlHash() {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith("#layout=")) return false;

    if (!window.LZString) return false;

    try {
      const compressed = hash.substring(8); // "#layout="の後ろ
      const jsonStr = LZString.decompressFromEncodedURIComponent(compressed);
      if (!jsonStr) return false;

      const minData = JSON.parse(jsonStr);
      if (!Array.isArray(minData)) return false;

      // 通常の家具データ形式に復元
      const restored = minData.map((item, idx) => ({
        id: `shared_${Date.now()}_${idx}`,
        type: item.t,
        name: item.n || "家具",
        x: item.x,
        y: item.y,
        rotation: item.r || 0,
        width: item.w,
        depth: item.d,
        height: item.h,
        color: item.c || "#8d6e63",
        modelType: item.m || item.t
      }));

      this.canvas2d.setFurniture(restored);
      this.scene3d.updateFurniture(restored);
      this.saveToLocalStorage();

      this.showToast("🎉 共有URLから家具レイアウトを正常に読み込みました！", 4500);
      return true;
    } catch (err) {
      console.warn("Failed to load layout from URL hash:", err);
      return false;
    }
  }

  loadPresetFurniture() {
    this.canvas2d.setFurniture(INITIAL_PRESET_FURNITURE);
    this.scene3d.updateFurniture(INITIAL_PRESET_FURNITURE);
  }

  saveToLocalStorage() {
    localStorage.setItem(
      "home_layout_simulator_data",
      JSON.stringify(this.canvas2d.furnitureList)
    );
  }

  /**
   * 家具カタログカードのレンダリング
   */
  renderCatalog() {
    const listEl = document.getElementById("catalog-list");
    listEl.innerHTML = "";

    const items = this.currentCategory === "all"
      ? FURNITURE_CATALOG
      : FURNITURE_CATALOG.filter(item => item.category === this.currentCategory);

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "catalog-card";
      card.innerHTML = `
        <div class="catalog-icon">${item.icon}</div>
        <div class="catalog-info">
          <div class="catalog-name">${item.name}</div>
          <div class="catalog-dims">${Math.round(item.width * 1000)} × ${Math.round(item.depth * 1000)} × ${Math.round(item.height * 1000)} mm</div>
        </div>
        <button class="btn-add-item" title="2D平面図に配置">＋</button>
      `;

      card.addEventListener("click", () => {
        // キャンバスの現在ビュー中央付近に配置
        const viewCenter = this.canvas2d.pxToM(
          this.canvas2d.canvas.width * 0.25,
          this.canvas2d.canvas.height * 0.25
        );
        // LDKの中心付近をデフォルトに
        const posX = Math.max(1.0, Math.min(5.5, viewCenter.x || 3.3));
        const posY = Math.max(1.0, Math.min(11.0, viewCenter.y || 10.0));

        this.canvas2d.addFurniture({
          type: item.type,
          name: item.name,
          x: Math.round(posX * 10) / 10,
          y: Math.round(posY * 10) / 10,
          rotation: 0,
          width: item.width,
          depth: item.depth,
          height: item.height,
          color: item.color,
          modelType: item.modelType
        });

        // スマホの場合はドロワーを閉じて配置した家具が見えるように
        if (window.innerWidth <= 768) {
          this.closeMobileDrawer();
          this.showToast(`✨「${item.name}」を配置しました`);
        }
      });

      listEl.appendChild(card);
    });
  }

  /**
   * カメラプリセットボタンのレンダリング
   */
  renderCameraPresets() {
    const selectEl = document.getElementById("camera-preset-select");
    if (!selectEl) return;
    selectEl.innerHTML = "";

    FLOOR_PLAN.cameraPresets.forEach((p, idx) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      selectEl.appendChild(opt);
    });

    selectEl.addEventListener("change", (e) => {
      const preset = FLOOR_PLAN.cameraPresets.find(p => p.id === e.target.value);
      if (preset) {
        this.scene3d.applyCameraPreset(preset);
        // 実写真プレビューの表示
        if (preset.photo) {
          this.showPhotoBadge(preset.photo, preset.name);
        } else {
          this.hidePhotoBadge();
        }
      }
    });
  }

  /**
   * ルームツアー（人目線ウォークスルー）UI＆キーボード制御
   */
  initTourUI() {
    const btnToggle = document.getElementById("btn-toggle-tour");
    const btnExit = document.getElementById("btn-exit-tour");
    const overlay = document.getElementById("tour-overlay");
    const navRooms = document.getElementById("tour-rooms-nav");
    const badge3d = document.getElementById("viewport-3d-badge");

    // 部屋ジャンプボタン群の生成
    if (navRooms && FLOOR_PLAN.tourWaypoints) {
      navRooms.innerHTML = "";
      FLOOR_PLAN.tourWaypoints.forEach(wp => {
        const btn = document.createElement("button");
        btn.className = "tour-room-btn";
        btn.textContent = wp.name;
        btn.title = `${wp.name}へ人目線でテレポート`;
        btn.addEventListener("click", () => {
          if (!this.scene3d.isTourMode) {
            this.enterTour(wp.id);
          } else {
            this.scene3d.teleportTour(wp.pos[0], wp.pos[2], wp.yaw);
          }
        });
        navRooms.appendChild(btn);
      });
    }

    const enterTour = (wpId = "entrance") => {
      this.hidePhotoBadge();
      this.scene3d.startTourMode(wpId);
      if (btnToggle) {
        btnToggle.classList.add("active");
        btnToggle.querySelector(".tour-text").textContent = "ツアー終了";
      }
      if (overlay) overlay.classList.remove("hidden");
      if (badge3d) badge3d.textContent = "🚶 人目線ウォークスルー中 (ドラッグで見渡す / WASDで歩行)";
    };

    const exitTour = () => {
      this.scene3d.stopTourMode();
      if (btnToggle) {
        btnToggle.classList.remove("active");
        btnToggle.querySelector(".tour-text").textContent = "ルームツアー";
      }
      if (overlay) overlay.classList.add("hidden");
      if (badge3d) badge3d.textContent = "3D リアルタイム立体ビュー (ドラッグで回転・ズーム)";
    };

    this.enterTour = enterTour;
    this.exitTour = exitTour;

    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        if (this.scene3d.isTourMode) exitTour();
        else enterTour();
      });
    }

    if (btnExit) {
      btnExit.addEventListener("click", () => exitTour());
    }

    // キーボード（WASD / 矢印キー）イベント
    const isInputActive = () => {
      const active = document.activeElement;
      return active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT");
    };

    window.addEventListener("keydown", (e) => {
      if (!this.scene3d.isTourMode) return;
      if (isInputActive()) return;

      if (e.key === "Escape") {
        exitTour();
        return;
      }

      let handled = false;
      if (e.code === "KeyW" || e.key === "ArrowUp") {
        this.scene3d.setTourKey("forward", true);
        handled = true;
      }
      if (e.code === "KeyS" || e.key === "ArrowDown") {
        this.scene3d.setTourKey("backward", true);
        handled = true;
      }
      if (e.code === "KeyA" || e.key === "ArrowLeft") {
        this.scene3d.setTourKey("left", true);
        handled = true;
      }
      if (e.code === "KeyD" || e.key === "ArrowRight") {
        this.scene3d.setTourKey("right", true);
        handled = true;
      }

      if (handled) e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
      if (!this.scene3d.isTourMode) return;

      if (e.code === "KeyW" || e.key === "ArrowUp") this.scene3d.setTourKey("forward", false);
      if (e.code === "KeyS" || e.key === "ArrowDown") this.scene3d.setTourKey("backward", false);
      if (e.code === "KeyA" || e.key === "ArrowLeft") this.scene3d.setTourKey("left", false);
      if (e.code === "KeyD" || e.key === "ArrowRight") this.scene3d.setTourKey("right", false);
    });

    // 画面上バーチャル十字キー（スマホ/マウス用）
    const dpadBtns = document.querySelectorAll(".dpad-btn");
    dpadBtns.forEach(btn => {
      const dir = btn.dataset.dir;
      const start = (e) => {
        e.preventDefault();
        btn.classList.add("active");
        this.scene3d.setTourKey(dir, true);
      };
      const stop = (e) => {
        btn.classList.remove("active");
        this.scene3d.setTourKey(dir, false);
      };

      btn.addEventListener("pointerdown", start);
      btn.addEventListener("pointerup", stop);
      btn.addEventListener("pointercancel", stop);
      btn.addEventListener("pointerleave", stop);
    });
  }

  showPhotoBadge(src, title) {
    let badge = document.getElementById("photo-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "photo-badge";
      document.getElementById("container-3d").appendChild(badge);
    }
    badge.innerHTML = `
      <div class="photo-badge-header">
        <span>📸 ${title}</span>
        <button id="close-photo-badge">×</button>
      </div>
      <img src="${src}" alt="${title}" />
    `;
    badge.style.display = "block";
    document.getElementById("close-photo-badge").onclick = () => {
      badge.style.display = "none";
    };
  }

  hidePhotoBadge() {
    const badge = document.getElementById("photo-badge");
    if (badge) badge.style.display = "none";
  }

  /**
   * 選択中家具のプロパティパネル更新
   */
  updatePropertyPanel(selected) {
    const panel = document.getElementById("property-panel");
    if (!selected) {
      panel.classList.add("hidden");
      return;
    }
    panel.classList.remove("hidden");

    document.getElementById("prop-name").value = selected.name;
    document.getElementById("prop-width").value = Math.round(selected.width * 1000);
    document.getElementById("prop-depth").value = Math.round(selected.depth * 1000);
    document.getElementById("prop-height").value = Math.round(selected.height * 1000);
    document.getElementById("prop-rotation").value = selected.rotation;
    document.getElementById("prop-rot-val").textContent = `${selected.rotation}°`;
    document.getElementById("prop-color").value = selected.color;

    // カラーパレットプリセット
    const palEl = document.getElementById("prop-color-palette");
    palEl.innerHTML = "";
    const catalogItem = FURNITURE_CATALOG.find(c => c.type === selected.type);
    const colors = catalogItem?.colorOptions || [selected.color, "#333333", "#777777", "#ffffff", "#8d6e63"];
    colors.forEach(col => {
      const dot = document.createElement("button");
      dot.className = "color-dot";
      dot.style.backgroundColor = col;
      if (col === selected.color) dot.classList.add("active");
      dot.onclick = () => {
        document.getElementById("prop-color").value = col;
        this.canvas2d.updateSelected({ color: col });
        this.updatePropertyPanel({ ...selected, color: col });
      };
      palEl.appendChild(dot);
    });
  }

  bindEvents() {
    // カテゴリフィルタータブ
    document.querySelectorAll(".cat-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentCategory = tab.dataset.category;
        this.renderCatalog();
      });
    });

    // 画面分割切替 (2D+3D / 2Dのみ / 3Dのみ)
    document.querySelectorAll(".btn-view-mode").forEach(btn => {
      btn.addEventListener("click", () => {
        this.setViewMode(btn.dataset.mode);
      });
    });

    // 下絵透過度スライダー
    const bgSlider = document.getElementById("bg-opacity-slider");
    if (bgSlider) {
      bgSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        this.canvas2d.bgOpacity = val;
        this.canvas2d.showBgImage = val > 0;
        this.canvas2d.render();
      });
    }

    // グリッドスナップトグル
    const snapToggle = document.getElementById("snap-toggle");
    if (snapToggle) {
      snapToggle.addEventListener("change", (e) => {
        this.canvas2d.snapToGrid = e.target.checked;
      });
    }

    // プロパティ変更
    document.getElementById("prop-name").addEventListener("input", (e) => {
      this.canvas2d.updateSelected({ name: e.target.value });
    });
    document.getElementById("prop-width").addEventListener("change", (e) => {
      const val = Math.max(100, Math.min(5000, parseInt(e.target.value) || 1000));
      this.canvas2d.updateSelected({ width: val / 1000 });
    });
    document.getElementById("prop-depth").addEventListener("change", (e) => {
      const val = Math.max(100, Math.min(5000, parseInt(e.target.value) || 1000));
      this.canvas2d.updateSelected({ depth: val / 1000 });
    });
    document.getElementById("prop-height").addEventListener("change", (e) => {
      const val = Math.max(10, Math.min(3000, parseInt(e.target.value) || 800));
      this.canvas2d.updateSelected({ height: val / 1000 });
    });
    document.getElementById("prop-rotation").addEventListener("input", (e) => {
      const deg = parseInt(e.target.value);
      document.getElementById("prop-rot-val").textContent = `${deg}°`;
      this.canvas2d.updateSelected({ rotation: deg });
    });
    document.getElementById("prop-color").addEventListener("input", (e) => {
      this.canvas2d.updateSelected({ color: e.target.value });
    });

    // 90度回転ボタン
    document.getElementById("btn-rot-90").addEventListener("click", () => {
      const cur = this.canvas2d.furnitureList.find(f => f.id === this.canvas2d.selectedId);
      if (cur) {
        const newRot = (cur.rotation + 90) % 360;
        this.canvas2d.updateSelected({ rotation: newRot });
        document.getElementById("prop-rotation").value = newRot;
        document.getElementById("prop-rot-val").textContent = `${newRot}°`;
      }
    });

    // 選択家具の削除
    document.getElementById("btn-delete-item").addEventListener("click", () => {
      this.canvas2d.removeSelected();
    });

    // 選択家具の複製
    document.getElementById("btn-duplicate-item").addEventListener("click", () => {
      const cur = this.canvas2d.furnitureList.find(f => f.id === this.canvas2d.selectedId);
      if (cur) {
        this.canvas2d.addFurniture({
          ...cur,
          name: cur.name + " (コピー)",
          x: cur.x + 0.3,
          y: cur.y + 0.3
        });
      }
    });

    // おすすめ配置に戻す
    document.getElementById("btn-reset-preset").addEventListener("click", () => {
      if (confirm("家具の配置を初期おすすめ配置にリセットしますか？")) {
        this.loadPresetFurniture();
      }
    });

    // 全クリア
    document.getElementById("btn-clear-all").addEventListener("click", () => {
      if (confirm("配置されているすべての家具を削除しますか？")) {
        this.canvas2d.setFurniture([]);
        this.scene3d.updateFurniture([]);
        this.saveToLocalStorage();
      }
    });

    // JSON保存
    document.getElementById("btn-export-json").addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify(this.canvas2d.furnitureList, null, 2)
      );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "room_furniture_layout.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // JSON読込
    const fileInput = document.getElementById("file-import-json");
    document.getElementById("btn-import-json").addEventListener("click", () => {
      fileInput.click();
    });
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const list = JSON.parse(evt.target.result);
          this.canvas2d.setFurniture(list);
          this.scene3d.updateFurniture(list);
          this.saveToLocalStorage();
        } catch (err) {
          alert("JSONファイルの形式が正しくありません。");
        }
      };
      reader.readAsText(file);
    });

    // 実写真ギャラリーモーダル
    const modal = document.getElementById("photo-gallery-modal");
    document.getElementById("btn-open-gallery").addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
    document.getElementById("btn-close-gallery").addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    // 🔗 URL共有ボタン ＆ モーダル
    const btnShare = document.getElementById("btn-share-url");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        this.exportShareUrl();
      });
    }

    const shareModal = document.getElementById("share-modal");
    const btnCloseShare = document.getElementById("btn-close-share");
    if (btnCloseShare && shareModal) {
      btnCloseShare.addEventListener("click", () => {
        shareModal.classList.add("hidden");
      });
    }

    const btnCopyShare = document.getElementById("btn-copy-share-url");
    const shareInput = document.getElementById("share-url-input");
    if (btnCopyShare && shareInput) {
      btnCopyShare.addEventListener("click", () => {
        shareInput.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareInput.value).then(() => {
            this.showToast("📋 共有URLをコピーしました！");
          });
        } else {
          document.execCommand("copy");
          this.showToast("📋 共有URLをコピーしました！");
        }
      });
    }

    // ==========================================
    // スマホ専用UI イベントハンドラー
    // ==========================================

    // 1. スマホ右下「＋ 家具追加」FAB
    const btnMobileAdd = document.getElementById("btn-mobile-add");
    if (btnMobileAdd) {
      btnMobileAdd.addEventListener("click", () => {
        this.openMobileDrawer();
      });
    }

    // 2. スマホ家具ドロワー閉じるボタン ＆ 背景タップ
    const btnCloseSidebar = document.getElementById("btn-close-sidebar");
    if (btnCloseSidebar) {
      btnCloseSidebar.addEventListener("click", () => {
        this.closeMobileDrawer();
      });
    }

    const backdrop = document.getElementById("drawer-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        this.closeMobileDrawer();
      });
    }

    // 3. スマホ「📐 全体表示」ボタン ＆ PC「📐 フィット」ボタン
    const btnMobileFit = document.getElementById("btn-mobile-fit");
    if (btnMobileFit) {
      btnMobileFit.addEventListener("click", () => {
        this.canvas2d.fitToScreen();
        this.showToast("📐 間取り図全体を画面に収めました");
      });
    }

    const btnFitDesktop = document.getElementById("btn-fit-screen");
    if (btnFitDesktop) {
      btnFitDesktop.addEventListener("click", () => {
        this.canvas2d.fitToScreen();
      });
    }

    // 4. プロパティパネル閉じるボタン
    const btnCloseProp = document.getElementById("btn-close-prop");
    if (btnCloseProp) {
      btnCloseProp.addEventListener("click", () => {
        this.canvas2d.selectedId = null;
        this.canvas2d.onSelect(null);
        this.canvas2d.render();
      });
    }

    // 5. スマホ右上メニュー (⋮) トグル
    const btnMenuToggle = document.getElementById("btn-mobile-menu-toggle");
    const headerActions = document.getElementById("header-actions");
    if (btnMenuToggle && headerActions) {
      btnMenuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        headerActions.classList.toggle("open");
      });

      // 画面の他をタップしたら閉じる
      window.addEventListener("click", (e) => {
        if (!headerActions.contains(e.target) && e.target !== btnMenuToggle) {
          headerActions.classList.remove("open");
        }
      });
    }
  }

  /**
   * 2D / 3D 領域の横幅リサイザー（スプリッター）の制御
   */
  initSplitter() {
    const gutter = document.getElementById("split-gutter");
    const workspace = document.getElementById("main-workspace");
    if (!gutter || !workspace) return;

    // 前回の比率を復元（デフォルト 50%）
    const savedRatio = localStorage.getItem("home_layout_split_ratio");
    let currentRatio = savedRatio ? parseFloat(savedRatio) : 50;
    if (isNaN(currentRatio) || currentRatio < 15 || currentRatio > 85) currentRatio = 50;
    workspace.style.setProperty("--split-ratio", `${currentRatio}%`);

    let isDragging = false;

    const onPointerDown = (e) => {
      // mode-split の時のみドラッグ有効
      if (!workspace.classList.contains("mode-split")) return;
      isDragging = true;
      gutter.classList.add("dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = workspace.getBoundingClientRect();
      if (rect.width <= 0) return;

      let pct = ((clientX - rect.left) / rect.width) * 100;
      // 最小15%〜最大85%に制限
      pct = Math.max(15, Math.min(85, pct));
      currentRatio = Math.round(pct * 10) / 10;

      workspace.style.setProperty("--split-ratio", `${currentRatio}%`);
      this.canvas2d.resize();
      this.scene3d.resize();
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      gutter.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem("home_layout_split_ratio", currentRatio);
      this.canvas2d.resize();
      this.scene3d.resize();
    };

    // マウスイベント
    gutter.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    // タッチイベント (モバイル・タブレット)
    gutter.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    // ダブルクリックで 50:50 にリセット
    gutter.addEventListener("dblclick", () => {
      currentRatio = 50;
      workspace.style.setProperty("--split-ratio", "50%");
      localStorage.setItem("home_layout_split_ratio", 50);
      this.canvas2d.resize();
      this.scene3d.resize();
    });
  }
}

// アプリ起動
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
