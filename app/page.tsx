import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import {
  type DocumentRecord,
  formatDate,
  formatFileSize,
} from "@/lib/types/document";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      "id, title, format, file_path, file_size_mb, uploaded_at, uploaded_by, uploader_email"
    )
    .eq("is_published", true)
    .order("uploaded_at", { ascending: false });

  const docs = (documents ?? []) as DocumentRecord[];

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

      {error && (
        <p className="error-msg">
          加载文档列表失败：{error.message}（请确认已在 Supabase 执行
          supabase/setup-documents.sql）
        </p>
      )}

      {!error && docs.length === 0 && (
        <p className="empty-msg">
          暂无文档，{" "}
          <Link href="/upload">点击上传第一份文档</Link>。
        </p>
      )}

      {docs.length > 0 && (
        <div className="table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>文档名称</th>
                <th>格式</th>
                <th>大小</th>
                <th>上传人</th>
                <th>上传时间</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <a href={`/api/documents/${doc.id}`}>{doc.title}</a>
                  </td>
                  <td>{doc.format.toUpperCase()}</td>
                  <td>{formatFileSize(doc.file_size_mb)}</td>
                  <td>{doc.uploader_email ?? "—"}</td>
                  <td>{formatDate(doc.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="meta">部署于 Vercel + Supabase · 文件存储在 Supabase Storage</p>
    </>
  );
}
