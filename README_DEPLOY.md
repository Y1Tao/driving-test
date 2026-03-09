# 驾考刷题网站部署指南

本项目是一个基于 Vue 3 + Vite 的单页应用 (SPA)。虽然开发环境中使用了本地文件读写 (`userData.json`) 来模拟后端存储，但在生产环境部署时，应用会自动切换为使用浏览器 `localStorage` 进行数据存储。这意味着您可以将本项目作为**纯静态网站**免费部署到各大托管平台。

## 推荐部署方案

### 方案一：部署到 Vercel (推荐)
Vercel 是部署 Vue/Vite 应用最简单、最快的方式。

1. **准备工作**：
   - 确保您的代码已上传到 GitHub、GitLab 或 Bitbucket。
   - 注册一个 [Vercel 账号](https://vercel.com/)。

2. **开始部署**：
   - 登录 Vercel 控制台，点击 "Add New..." -> "Project"。
   - 导入您的 Git 仓库。
   - Vercel 会自动识别这是 Vite 项目。
   - **Build Command** 保持默认：`npm run build` (或 `vite build`)
   - **Output Directory** 保持默认：`dist`
   - 点击 **Deploy**。

3. **配置路由**：
   - 项目根目录已为您添加了 `vercel.json` 文件，用于处理单页应用的路由重定向（防止刷新页面 404）。Vercel 会自动读取此配置。

### 方案二：部署到 Netlify
Netlify 也是非常优秀的静态托管服务。

1. 注册并登录 [Netlify](https://www.netlify.com/)。
2. 点击 "Add new site" -> "Import an existing project"。
3. 连接您的 Git 提供商。
4. **Build command**: `npm run build`
5. **Publish directory**: `dist`
6. 点击 **Deploy site**。
7. **解决刷新 404 问题**：
   - 在项目 `public` 目录下创建一个名为 `_redirects` 的文件，内容如下：
     ```
     /*  /index.html  200
     ```

### 方案三：部署到 GitHub Pages
如果您希望部署在 GitHub Pages 上。

1. 在 `vite.config.ts` 中设置 `base` 路径：
   ```typescript
   export default defineConfig({
     base: '/您的仓库名称/', // 例如 '/driving-test/'
     // ...其他配置
   })
   ```
2. 构建项目：`npm run build`
3. 将 `dist` 目录下的所有文件推送到仓库的 `gh-pages` 分支。
   - 或者使用 `gh-pages` npm 包自动部署。

## 关于数据存储的说明

- **开发环境** (`npm run dev`)：错题和进度会保存到项目根目录的 `userData.json` 文件中。
- **生产环境** (部署后)：错题和进度会自动保存到您浏览器的 `localStorage` 中。
  - **注意**：如果用户清除浏览器缓存或更换设备，做题进度将会丢失。

## 构建预览

在部署前，您可以在本地测试生产构建版本：

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```
