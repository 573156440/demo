# demo

技术文档共享站点：**Next.js + Supabase + Vercel**。

登录后可上传、查看 HTML / PDF 文档；元数据存 PostgreSQL，文件存 Supabase Storage。

## 项目结构

```
demo/
├── app/
│   ├── page.tsx                    # 文档列表
│   ├── upload/                     # 上传文档
│   ├── api/documents/[id]/         # 鉴权后跳转文件
│   └── login/
├── lib/supabase/
├── supabase/setup-documents.sql    # Storage + RLS 配置
├── middleware.ts
└── public/                         # 旧版静态文件（可选保留）
```

## 一、Supabase 初始化

1. 创建项目，配置 `.env.local`（见 `.env.local.example`）
2. **Authentication → Users** 创建登录用户
3. **SQL Editor** 执行建表 SQL（若尚未建 `documents` 表）
4. **SQL Editor** 执行 `supabase/setup-documents.sql`：
   - 创建 Storage 桶 `documents`
   - 配置 `documents` 表与 Storage 的 RLS 策略

## 二、本地开发

```bash
cp .env.local.example .env.local
# 填入 Supabase URL 和 anon key

npm install --registry https://registry.npmjs.org
npm run dev
```

访问 `http://localhost:3000` → 登录 → 上传文档 → 列表查看。

> 国内需 VPN 才能访问 Supabase API。

## 三、功能说明

| 功能 | 说明 |
|------|------|
| 登录 | Supabase Auth，邀请制建用户 |
| 上传 | `/upload`，支持 `.html` / `.pdf` |
| 列表 | 首页表格：名称、格式、大小、上传人、时间 |
| 查看 | 点击文档名 → 鉴权 → Supabase 签名 URL |

## 四、部署到 Vercel

1. `git push` 到 GitHub
2. Vercel 环境变量配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy

## 五、documents 表字段

| 字段 | 说明 |
|------|------|
| title | 文档名称 |
| format | html / pdf |
| file_path | Storage 路径 |
| file_size_mb | 大小（MB） |
| uploaded_by | 上传人 UUID |
| uploader_email | 上传人邮箱 |
| uploaded_at | 上传时间 |

## 技术栈

- Next.js 15（App Router）
- Supabase Auth + PostgreSQL + Storage
- Vercel 部署
