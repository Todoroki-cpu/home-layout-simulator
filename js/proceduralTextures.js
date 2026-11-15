/**
 * プロシージャル・テクスチャ生成 (Procedural Textures)
 * 実写真の色合いと質感に基づき、Canvas APIで高精細テクスチャを即座に生成します。
 */
import * as THREE from "three";

export class TextureGenerator {
  /**
   * 実写真 IMG_6292 に基づくグレイッシュオーク・フローリング
   */
  static createFlooringTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // ベース色（ややアッシュグレーがかったオーク）
    ctx.fillStyle = "#baa896";
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 64; // 板幅
    const plankRows = 1024 / plankHeight;

    for (let row = 0; row < plankRows; row++) {
      const y = row * plankHeight;
      // 行ごとに板の明度を微妙に変える
      const rowTone = (Math.random() - 0.5) * 16;

      // ランダムな板の長さ（目地）
      const seamPositions = [0];
      let curX = 0;
      while (curX < 1024) {
        curX += 200 + Math.random() * 300;
        seamPositions.push(Math.min(1024, curX));
      }

      for (let s = 0; s < seamPositions.length - 1; s++) {
        const x1 = seamPositions[s];
        const x2 = seamPositions[s + 1];
        const w = x2 - x1;

        const plankColorVariation = rowTone + (Math.random() - 0.5) * 12;
        const r = Math.min(255, Math.max(0, 186 + plankColorVariation));
        const g = Math.min(255, Math.max(0, 168 + plankColorVariation));
        const b = Math.min(255, Math.max(0, 150 + plankColorVariation));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x1, y, w, plankHeight);

        // 木目ライン
        ctx.strokeStyle = `rgba(130, 110, 95, 0.15)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const grainY = y + Math.random() * plankHeight;
          ctx.beginPath();
          ctx.moveTo(x1, grainY);
          ctx.bezierCurveTo(
            x1 + w * 0.3, grainY + (Math.random() - 0.5) * 6,
            x1 + w * 0.7, grainY + (Math.random() - 0.5) * 6,
            x2, grainY
          );
          ctx.stroke();
        }

        // 垂直目地 (板と板の継ぎ目)
        ctx.strokeStyle = "rgba(70, 60, 50, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x2, y);
        ctx.lineTo(x2, y + plankHeight);
        ctx.stroke();
      }

      // 水平目地
      ctx.strokeStyle = "rgba(70, 60, 50, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  /**
   * 実写真 IMG_6291 に基づく和室の畳 (い草＋縁)
   */
  static createTatamiTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // い草のベース色（若草色・い草グリーン）
    ctx.fillStyle = "#8a9675";
    ctx.fillRect(0, 0, 512, 1024);

    // い草の編み目ライン (水平方向の微細なスジ)
    ctx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 4) {
      const tone = (Math.sin(y * 0.5) + Math.random() * 0.5) * 10;
      ctx.strokeStyle = `rgba(${120 + tone}, ${135 + tone}, ${95 + tone}, 0.4)`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // 左右の畳縁 (縁・ヘリ: 濃いダークグリーン・幾何学模様調 - IMG_6291参照)
    const borderW = 32;
    ctx.fillStyle = "#2d3a2e";
    ctx.fillRect(0, 0, borderW, 1024);
    ctx.fillRect(512 - borderW, 0, borderW, 1024);

    // 縁の模様
    ctx.strokeStyle = "#4d5f4f";
    ctx.lineWidth = 2;
    for (let y = 0; y < 1024; y += 16) {
      ctx.strokeRect(4, y, borderW - 8, 10);
      ctx.strokeRect(512 - borderW + 4, y, borderW - 8, 10);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * 白壁クロス (和紙調・微細なテクスチャ)
   */
  static createWallTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, 256, 256);

    // 微小なノイズ
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  /**
   * タイル（水回り・玄関用）
   */
  static createTileTexture(baseColor = "#cfcac4", gridSize = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "rgba(100, 95, 90, 0.4)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }
}
