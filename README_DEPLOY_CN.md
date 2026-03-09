# 驾考刷题网站部署指南 (国内访问版)

针对国内用户，**Gitee Pages (码云)** 是最推荐的免费部署方案，访问速度快且稳定。

## 推荐方案：部署到 Gitee Pages

### 1. 准备工作
- 注册一个 [Gitee (码云)](https://gitee.com/) 账号。
- **重要**：Gitee Pages 服务现在可能需要实名认证，请确保您的账号已完成实名认证。

### 2. 创建仓库
1. 登录 Gitee，点击右上角 "+" -> "新建仓库"。
2. 仓库名称建议填写 `driving-test`。
3. 路径也填写 `driving-test`。
4. 是否开源选择 "公开" (Pages 服务通常需要公开仓库，私有仓库可能收费)。
5. 点击 "创建"。

### 3. 推送代码到 Gitee
您需要将现有的代码推送到 Gitee。在项目根目录下打开终端：

```bash
# 1. 添加 Gitee 远程仓库地址 (请将 username 替换为您的 Gitee 用户名)
git remote add gitee https://gitee.com/username/driving-test.git

# 2. 推送代码
git push -u gitee main
```

### 4. 开启 Gitee Pages 服务
1. 进入您的 Gitee 仓库页面。
2. 点击菜单栏的 "服务" -> "Gitee Pages"。
3. **部署分支** 选择 `main`。
4. **部署目录** 保持为空（默认根目录）。
5. 点击 "启动" 或 "更新"。
6. 等待部署完成后，您会获得一个类似 `https://username.gitee.io/driving-test` 的访问地址。

### 注意事项 (非常重要)

#### 1. 关于路径配置
为了兼容 Gitee Pages 的子目录部署（例如 `/driving-test`），我已经帮您做了以下修改：
- **路由模式**：已将 `src/router/index.ts` 中的路由模式修改为 `Hash` 模式（URL 会带有 `#` 号）。这是最稳妥的方式，避免了刷新页面 404 的问题，且无需配置服务器重写规则。
- **Base 路径**：已在 `vite.config.ts` 中设置 `base: './'`，确保资源文件能正确加载。

#### 2. 手动更新
Gitee Pages 免费版**不会自动更新**。每次您修改代码并 `git push` 后，都需要手动进入 Gitee Pages 页面点击 "更新" 按钮，新内容才会生效。

## 备选方案：腾讯云/阿里云对象存储 (OSS/COS)
如果您希望更加专业且拥有自己的域名：
1. 购买腾讯云 COS 或阿里云 OSS 服务。
2. 将 `npm run build` 生成的 `dist` 目录上传到存储桶。
3. 开启 "静态网站托管" 功能。
4. 这种方式通常需要少量的存储和流量费用（很便宜），但速度极快且无需手动更新（可配合 CI/CD 工具）。
