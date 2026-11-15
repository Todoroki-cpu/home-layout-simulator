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
      }
    });

    // 2. 3D Scene 初期化
    const container3d = document.getElementById("container-3d");
    this.scene3d = new Scene3D(container3d);

    // 3. 家具カタログUIの生成
    this.renderCatalog();

    // 4. カメラプリセットUIの生成
    this.renderCameraPresets();

    // 5. イベントリスナー登録
    this.bindEvents();

    // 6. 保存データの読込、または初期おすすめ配置の適用
    const saved = localStorage.getItem("home_layout_simulator_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.canvas2d.setFurniture(parsed);
        this.scene3d.updateFurniture(parsed);
      } catch (e) {
        this.loadPresetFurniture();
      }
    } else {
      this.loadPresetFurniture();
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
        const posX = Math.max(0.5, Math.min(4.2, viewCenter.x || 2.5));
        const posY = Math.max(0.5, Math.min(8.2, viewCenter.y || 7.5));

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
        document.querySelectorAll(".btn-view-mode").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.dataset.mode;
        const main = document.getElementById("main-workspace");
        main.className = `workspace-layout mode-${mode}`;
        this.canvas2d.resize();
        this.scene3d.resize();
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
  }
}

// アプリ起動
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
