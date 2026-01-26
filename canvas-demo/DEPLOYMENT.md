# Canvas 画板项目部署指南

## 📋 目录
1. [本地运行](#本地运行)
2. [构建生产版本](#构建生产版本)
3. [部署选项](#部署选项)
   - [方案1: GitHub Pages](#方案1-github-pages)
   - [方案2: Vercel](#方案2-vercel)
   - [方案3: Netlify](#方案3-netlify)
   - [方案4: 自己的服务器](#方案4-自己的服务器)

---

## 🚀 本地运行

### 1. 安装依赖
```bash
cd canvas-demo
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问显示的地址（通常是 http://localhost:5173）

---

## 🏗️ 构建生产版本

### 1. 构建项目
```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

### 2. 本地预览构建结果
```bash
npm run preview
```

---

## 🌐 部署选项

### 方案1: GitHub Pages

#### 步骤1：修改 vite.config.js

在 `vite.config.js` 中添加 `base` 配置：

```javascript
export default defineConfig({
  base: '/canvas-demo/',  // 替换为你的仓库名
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // ...
})
```

#### 步骤2：创建部署脚本

在 `package.json` 中添加部署脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 步骤3：安装 gh-pages

```bash
npm install -D gh-pages
```

#### 步骤4：初始化 Git 仓库（如果还没有）

```bash
git init
git add .
git commit -m "Initial commit"
```

#### 步骤5：创建 GitHub 仓库并推送

```bash
git remote add origin https://github.com/zhangwenye/canvas-demo.git
git branch -M main
git push -u origin main
```

#### 步骤6：部署

```bash
npm run deploy
```

访问：`https://zhangwenye.github.io/canvas-demo/`

---

### 方案2: Vercel（推荐 ⭐）

**最简单的部署方式，支持自动部署**

#### 方法A：使用 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署**
```bash
cd canvas-demo
vercel
```

4. **生产环境部署**
```bash
vercel --prod
```

#### 方法B：使用 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测到 Vite 项目
5. 点击 "Deploy"

**优势：**
- ✅ 零配置，自动部署
- ✅ 免费 HTTPS
- ✅ 全球 CDN
- ✅ Git 推送自动重新部署

---

### 方案3: Netlify

#### 方法A：拖拽部署

1. 构建项目：`npm run build`
2. 访问 [netlify.com](https://netlify.com)
3. 将 `dist` 文件夹拖拽到网站上

#### 方法B：使用 Netlify CLI

1. **安装 Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **登录**
```bash
netlify login
```

3. **初始化项目**
```bash
netlify init
```

4. **部署**
```bash
netlify deploy --prod
```

#### 方法C：连接 Git 仓库

1. 访问 [netlify.com](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 "Deploy site"

---

### 方案4: 自己的服务器

#### 使用 Nginx

1. **构建项目**
```bash
npm run build
```

2. **上传 dist 文件夹到服务器**
```bash
scp -r dist/* user@your-server:/var/www/html/canvas-demo/
```

3. **配置 Nginx**

创建 `/etc/nginx/sites-available/canvas-demo`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/canvas-demo;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. **启用站点并重启 Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/canvas-demo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 使用 Docker

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

构建和运行：

```bash
docker build -t canvas-demo .
docker run -d -p 8080:80 canvas-demo
```

访问：`http://localhost:8080`

---

## 📊 部署方案对比

| 方案 | 难度 | 费用 | 自动部署 | HTTPS | CDN | 推荐度 |
|------|------|------|----------|-------|-----|--------|
| **Vercel** | ⭐ | 免费 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐ | 免费 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐ | 免费 | ✅ | ✅ | ❌ | ⭐⭐⭐⭐ |
| **自己的服务器** | ⭐⭐⭐⭐ | 付费 | ❌ | 需配置 | ❌ | ⭐⭐⭐ |

---

## 💡 推荐方案

### 🥇 **最推荐：Vercel 或 Netlify**
- 零配置，开箱即用
- 免费且功能强大
- 自动部署，Git 推送即更新
- 全球 CDN，访问速度快

### 🥈 **备选：GitHub Pages**
- 适合开源项目
- 与 GitHub 深度集成
- 完全免费

### 🥉 **特殊需求：自己的服务器**
- 需要完全控制
- 有特殊网络要求
- 已有服务器资源

---

## 🔧 部署后优化建议

### 1. 启用 PWA（可选）
安装 vite-plugin-pwa：
```bash
npm install -D vite-plugin-pwa
```

### 2. 配置 CDN 加速
修改 `vite.config.js`：
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue']
        }
      }
    }
  }
})
```

### 3. 启用资源压缩
```bash
npm install -D vite-plugin-compression
```

---

## ❓ 常见问题

### 1. 刷新页面出现 404
**原因**：单页应用需要配置服务器支持 History 模式

**解决**：
- Vercel/Netlify：自动处理
- Nginx：使用 `try_files $uri $uri/ /index.html;`
- GitHub Pages：使用 hash 模式或添加 404.html

### 2. 资源加载失败
**原因**：`base` 路径配置错误

**解决**：检查 `vite.config.js` 中的 `base` 配置

### 3. 构建后文件过大
**解决**：
- 使用代码分割
- 启用 gzip 压缩
- 使用 CDN 加载第三方库

---

## 📝 快速开始（推荐 Vercel）

```bash
# 1. 全局安装 Vercel CLI
npm install -g vercel

# 2. 进入项目目录
cd canvas-demo

# 3. 登录 Vercel
vercel login

# 4. 部署
vercel

# 5. 生产环境部署
vercel --prod
```

完成！您的项目现在已经部署到互联网上了！🎉

---

**需要帮助？**
- Vercel 文档：https://vercel.com/docs
- Netlify 文档：https://docs.netlify.com
- Vite 部署指南：https://vitejs.dev/guide/static-deploy.html
