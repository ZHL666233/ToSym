# 💕 我们的专属表白网站

> 一个为你和最爱的人打造的浪漫专属网站

## ✨ 功能特色

- 💌 **信封开场动画** - 第一次进入时展示精美信封，打开后是一封情书
- ⏰ **恋爱计时器** - 精确到秒地记录你们在一起的时间
- 💬 **30条情话轮播** - 自动播放 + 手动切换 + 随机模式
- 📸 **合照相册** - 照片墙 + 灯箱大图预览
- ⏳ **美好瞬间时间线** - 记录你们的重要时刻
- 🎵 **BGM背景音乐** - 支持播放/暂停控制
- ✨ **粒子动画** - 粉色粒子连线背景
- 🌸 **飘落花瓣** - 持续飘落的浪漫元素
- 💗 **点击爱心** - 任何地方点击都会飘出爱心
- 📱 **响应式设计** - 手机/平板/电脑完美适配

## 🚀 使用方法

### 1. 修改情书内容
打开 `index.html`，找到 `<div class="letter-content">` 部分，修改里面的文字。

### 2. 设置在一起的日期
两种方式：
- **方式一**：打开 `script.js`，修改 `CONFIG.TOGETHER_DATE = '2024-01-01'`
- **方式二**：直接在网站上通过日期选择器设置（会自动保存到浏览器）

### 3. 放你们的合照
将照片（jpg/png格式）重命名为 `1.jpg` ~ `6.jpg`，放入 `photos/` 文件夹。

### 4. 添加背景音乐
将一首浪漫的BGM音乐文件命名为 `bgm.mp3`（或 `bgm.ogg`），放到网站根目录。

推荐BGM（需要自己下载）：
- 《小幸运》钢琴版
- 《Perfect》- Ed Sheeran
- 《月亮代表我的心》
- 《A Thousand Years》- Christina Perri
- 《Just The Way You Are》- Bruno Mars

### 5. 修改时间线内容
打开 `index.html`，找到 `<!-- 美好瞬间 / 时间线 -->` 部分，修改里面的重要时刻。

### 6. 修改页脚署名
在 `index.html` 底部的 `<footer>` 中修改 `你的名字`。

## 🎨 自定义颜色

打开 `style.css`，修改顶部的 CSS 变量：

```css
:root {
    --color-pink-500: #ec4899;  /* 主色调 */
    --color-pink-600: #db2777;  /* 深色 */
    --color-rose-400: #fb7185;  /* 玫瑰色 */
    --color-purple-400: #c084fc; /* 紫色 */
}
```

## 🌐 部署方式

### 方式一：本地直接打开
双击 `index.html` 即可在浏览器中打开。

### 方式二：部署到免费网站
推荐使用以下免费服务部署，获得一个在线链接发给女朋友：

- **GitHub Pages**：推送到 GitHub 仓库 → Settings → Pages
- **Vercel**：连接 GitHub 仓库，一键部署
- **Netlify**：拖拽文件夹即可部署
- **Cloudflare Pages**：连接 GitHub 仓库

### 方式三：手机本地查看
用手机浏览器直接打开 `index.html` 文件。

## 📂 文件结构

```
├── index.html        # 主页面
├── style.css         # 样式文件
├── script.js         # 交互逻辑
├── bgm.mp3          # 背景音乐（需自己添加）
├── photos/          # 合照文件夹
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
└── README.md        # 说明文档
```

## 💡 温馨提示

- 网站使用了 `localStorage` 记录访问状态，第二次进入会跳过信封动画
- 如果想重新查看信封动画，在浏览器控制台输入：`localStorage.removeItem('love_site_visited')` 然后刷新
- 需要添加更多照片，修改 `script.js` 中的 `photoFiles` 数组即可
- 建议使用 Chrome 或 Safari 浏览器获得最佳体验
