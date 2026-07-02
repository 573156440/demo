"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type DocumentRecord,
  formatDate,
  formatFileSize,
} from "@/lib/types/document";

export function DocumentList() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDocs((data ?? []) as DocumentRecord[]);
      }
      setLoading(false);
    }

    loadDocuments();
  }, []);

  if (loading) {
    return <p className="empty-msg">加载文档列表中…</p>;
  }

  if (error) {
    return (
      <p className="error-msg">
        加载文档列表失败：{error}
        <br />
        请确认已在 Supabase 执行 supabase/setup-documents.sql，且 documents 表 RLS
        策略已配置。
      </p>
    );
  }

  if (docs.length === 0) {
    return (
      <p className="empty-msg">
        暂无文档，<Link href="/upload">点击上传第一份文档</Link>。
        <br />
        <span className="meta">
          若刚上传完仍为空，请到 Supabase → Table Editor → public → documents
          确认是否有记录。
        </span>
      </p>
    );
  }

  return (
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
  );
}
