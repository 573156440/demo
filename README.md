# demo

技术文档共享站点：**Next.js + Supabase Auth + Vercel**。

登录后才能访问 HTML / PDF 文档；用户由管理员在 Supabase 后台邀请创建（邀请制）。

## 项目结构

```
demo/
├── app/
│   ├── page.tsx              # 文档目录（需登录）
│   ├── login/                # 登录页
│   └── auth/callback/        # Supabase 回调
├── components/
├── lib/supabase/             # Supabase 客户端
├── middleware.ts             # 鉴权拦截（核心）
├── public/                   # HTML、PDF 静态文件
└── next.config.ts            # 文档短链 rewrite
```

## 一、创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) 注册并 **New Project**
2. 进入 **Project Settings → API**，记下：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 进入 **Authentication → Providers → Email**，保持 Email 开启
4. （推荐）**Authentication → Settings**：
   - 关闭 **Enable email confirmations**（内测阶段方便）
   - 关闭 **Enable sign ups**（邀请制，禁止公开注册）

## 二、创建用户（邀请制）

Supabase Dashboard → **Authentication → Users → Add user → Create new user**

填写邮箱和密码，发给同事或客户即可。

## 三、本地开发

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入 Supabase URL 和 anon key

npm install
npm run dev
```

浏览器打开 `http://localhost:3000`，未登录会跳转 `/login`。

## 四、部署到 Vercel

1. 推送代码到 GitHub
2. Vercel 导入仓库（Framework 会自动识别为 **Next.js**）
3. **Settings → Environment Variables** 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 重新 Deploy

> Vercel 上若之前是静态项目，改框架后会自动用 `next build`，无需再设 Output Directory。

## 五、分享链接

| 页面 | 路径 |
|------|------|
| 文档目录 | `/` |
| 登录 | `/login` |
| MQTT 告警说明 | `/docs/mqtt-reboot` |
| 2300plus 安装指南 | `/docs/2300plus-install` |

未登录访问任意文档路径 → 自动跳转登录页，登录后回到原页面。

## 六、新增文档

1. 将 `.html` 或 `.pdf` 放入 `public/`
2. 在 `app/page.tsx` 的 `DOCS` 数组增加一条
3. 在 `next.config.ts` 的 `rewrites` 增加短链（可选）
4. `git push` 自动部署

## 七、国内访问说明

Vercel 与 Supabase API 在国内可能不稳定，海外用户优先用 Vercel 地址；国内用户建议同步部署到 Gitee Pages 或云 OSS（需单独处理登录）。

## 技术栈

- Next.js 15（App Router）
- Supabase Auth（邮箱 + 密码）
- Vercel 部署
