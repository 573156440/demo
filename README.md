# demo

静态 HTML 技术文档共享站点，部署在 Vercel。

## 本地预览

```bash
# 任选其一
python3 -m http.server 8080
npx serve .
```

浏览器打开 `http://localhost:8080`

## 部署到 Vercel（首次）

1. 将本仓库推送到 GitHub（若尚未推送）。
2. 登录 [Vercel](https://vercel.com)，用 GitHub 账号授权。
3. **Add New → Project**，选择本仓库。
4. 配置：
   - **Framework Preset**：Other
   - **Build Command**：留空
   - **Output Directory**：`.`（根目录）
   - **Install Command**：留空
5. 点击 **Deploy**。

部署完成后会得到类似 `https://demo-xxx.vercel.app` 的地址。

## 分享链接

| 页面 | 路径 |
|------|------|
| 文档目录 | `/` |
| MQTT Reboot 告警说明 | `/docs/mqtt-reboot` |

新增文档时：把 `.html` 放到仓库根目录，在 `index.html` 增加链接，并在 `vercel.json` 的 `rewrites` 里配置简短路径（可选）。

## 后续扩展

- 后端 / 数据库：Vercel Serverless Functions + Supabase
- 访问控制：Vercel Password Protection（Pro）或 Supabase Auth
