import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { DocumentList } from "@/components/document-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="user-bar">
        <span>当前用户：{user?.email}</span>
        <div className="user-actions">
          <Link href="/upload" className="btn-link">
            上传文档
          </Link>
          <LogoutButton />
        </div>
      </div>

      <h1>技术文档</h1>
      <p>登录后可查看、上传内部与客户共享的说明文档。</p>

      <DocumentList />

      <p className="meta">部署于 Vercel + Supabase · 文件存储在 Supabase Storage</p>
    </>
  );
}
