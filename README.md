# 3LDK 家具配置 2D＆3D シミュレーター

実写真および間取り図に基づいて精密にモデリングされた、**2D間取り上での直感的なドラッグ配置と3Dリアルタイム連動プレビュー**が可能な家具配置シミュレーターWebアプリケーションです。

---

## 🌟 主な特徴

* **2D平面図上での自由な家具配置**:
  * カタログからクリック/ドラッグで追加
  * マウスドラッグでの直感的な移動
  * 回転ハンドルによる自由角度回転 ＆ 90度スナップ
  * 幅・奥行・高さ（mm単位）のパラメトリック変更
  * カラー・素材の変更
  * 実際の間取り図（下絵）の透過オーバーレイ表示＆5cmグリッド吸着
* **3Dリアルタイム完全同期**:
  * 2Dで動かした家具がミリ秒単位で3D上にリアルタイム反映
  * 実写真（LDK、和室、洋室、キッチン、玄関等）の床材木目・畳・壁クロスをプロシージャルテクスチャで忠実に再現
  * 南面バルコニーからの自然光ライティング＆ソフトシャドウ
  * 斜め45度カットのバルコニー壁や梁・下がり天井を立体的に再現
* **実写真アングル プリセット**:
  * 現地写真（`IMG_6291`〜`IMG_6303`）と同じ視点アングルをワンクリックで再現
* **レイアウト保存・共有**:
  * ブラウザへの自動保存（LocalStorage）
  * JSONファイルでのエクスポート＆インポート
* **完全静的Webアプリ**:
  * ビルド不要（Vanilla ES Modules + Three.js CDN）
  * GitHub Pagesにプッシュするだけで即座に世界中へ公開可能

---

## 🚀 使い方

### 1. ローカルで起動する場合
Pythonの簡易サーバーですぐに起動できます：
```bash
cd C:\work\home-layout-simulator
python -m http.server 8000
```
ブラウザで `http://localhost:8000` を開きます。

### 2. GitHub Pages での公開
GitHubリポジトリ（`Todoroki-cpu/home-layout-simulator`）の Settings > Pages にて、
- **Source**: `GitHub Actions`
を選択するだけで、`.github/workflows/deploy.yml` により自動公開されます。
公開URL: `https://todoroki-cpu.github.io/home-layout-simulator/`

---

## 📁 ディレクトリ構成

```
home-layout-simulator/
├── .github/workflows/deploy.yml   # GitHub Pages 自動デプロイ
├── assets/
│   ├── floorplan.jpg             # 元の間取り図
│   └── photos/                   # 現地内装実写真 (IMG_6291〜6303)
├── css/
│   └── style.css                 # UIスタイルシート
├── js/
│   ├── app.js                    # メインUI・イベント制御
│   ├── canvas2d.js               # 2D平面図描画＆家具ドラッグコントローラー
│   ├── scene3d.js                # Three.js 3D空間・カメラ・照明・同期
│   ├── floorplanData.js          # 間取り・壁・窓・建具・固定設備データ
│   ├── furnitureCatalog.js       # 家具プリセット・おすすめ配置データ
│   ├── proceduralModels.js       # プロシージャル3D家具モデル生成
│   └── proceduralTextures.js     # フローリング・畳・クロスの質感生成
├── index.html                    # メインHTML
└── README.md
```
