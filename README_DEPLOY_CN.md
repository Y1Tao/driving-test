# 驾考刷题网站部署指南 (国内访问优化版)

> **重要提示**：由于 Gitee Pages 服务目前已暂停对个人用户开放（或入口已隐藏），原定的 Gitee 部署方案已不可用。
> 
> 以下为您推荐目前国内访问体验较好的替代方案。

## 方案一：Cloudflare Pages (推荐)
Cloudflare Pages 是与 Vercel 类似的免费托管服务，但其提供的 `*.pages.dev` 域名在国内的访问成功率通常高于 Vercel。

1. **准备工作**：
   - 拥有一个 [GitHub 账号](https://github.com/)。
   - 注册一个 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)。

2. **开始部署**：
   - 登录 Cloudflare 控制台，点击左侧菜单的 **Workers & Pages**。
   - 点击 **Create application** -> **Pages** -> **Connect to Git**。
   - 连接您的 GitHub 账号，选择 `driving-test` 仓库。
   - **Build settings**（构建设置）：
     - **Framework preset**: 选择 `Vite`。
     - **Build command**: `npm run build`。
     - **Build output directory**: `dist`。
   - 点击 **Save and Deploy**。

3. **访问网站**：
   - 部署完成后，您会获得一个 `https://driving-test-xxx.pages.dev` 的网址。
   - 请尝试在不开启代理的情况下访问该网址。如果能访问，这是最简单且免费的方案。

## 方案二：GitHub Pages (无需 VPN，但速度较慢)
虽然 GitHub 官网偶尔访问不稳定，但 GitHub Pages (`username.github.io`) 托管的静态网站通常是可以直连访问的，只是速度可能较慢。

1. **修改配置**：
   - 确保 `vite.config.ts` 中的 `base` 设置为 `'/driving-test/'` (注意前后斜杠)。
   - 确保 `src/router/index.ts` 使用 `createWebHashHistory()`。

2. **推送代码**：
   - 将代码推送到 GitHub 仓库。

3. **开启 Pages**：
   - 进入 GitHub 仓库 -> **Settings** -> **Pages**。
   - **Source**: 选择 `Deploy from a branch`。
   - **Branch**: 选择 `main` 分支，文件夹选择 `/ (root)`。
   - 点击 **Save**。
   - 等待几分钟，刷新页面，顶部会显示访问地址。

## 方案三：腾讯云/阿里云对象存储 (香港节点) - 最稳定
如果您愿意支付少量费用（每月几块钱），这是无需备案且国内访问速度极快的方案。

1. **购买服务**：
   - 开通腾讯云 COS 或阿里云 OSS。
   - 创建存储桶时，**地域**一定要选择 **中国香港** (Hong Kong)。
     - *原因：香港节点无需域名备案，国内访问速度也很快。*
   - **访问权限**选择 "公有读私有写"。

2. **开启静态网站**：
   - 在存储桶设置中找到 "静态网站托管"，点击开启。
   - 索引文档填 `index.html`。

3. **上传文件**：
   - 在本地运行 `npm run build`。
   - 将 `dist` 目录下的**所有文件**上传到存储桶根目录。

4. **访问**：
   - 使用存储桶提供的 "访问节点" 链接即可访问（例如 `http://bucket-name.cos-website.ap-hongkong.myqcloud.com`）。

## 附录：关于 Vercel 的国内访问
Vercel 其实在国内是可以使用的，只是默认分配的 `*.vercel.app` 域名被 DNS 污染了。
如果您拥有**自己的域名**（如 `example.com`），将其绑定到 Vercel 项目，即可在不使用 VPN 的情况下完美访问，速度非常快。

