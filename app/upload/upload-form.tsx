"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_EXTENSIONS,
  getFormatFromFilename,
} from "@/lib/types/document";

function buildStoragePath(userId: string, format: string): string {
  const ext = format === "pdf" ? ".pdf" : ".html";
  return `${userId}/${Date.now()}-${crypto.randomUUID()}${ext}`;
}

function titleFromFilename(name: string): string {
  return name.replace(/\.(html|htm|pdf)$/i, "");
}

function explainError(step: string, message: string): string {
  if (message.includes("row-level security") || message.includes("RLS")) {
    return `${step}失败：权限策略（RLS）未配置。请在 Supabase SQL Editor 执行 supabase/fix-upload-complete.sql`;
  }
  if (message.includes("Bucket not found")) {
    return `${step}失败：Storage 桶 documents 不存在，请执行 supabase/fix-upload-complete.sql`;
  }
  if (message.includes("InvalidKey") || message.includes("Invalid key")) {
    return `${step}失败：文件名含 Supabase Storage 不支持的字符，请重试（已自动改用安全路径）`;
  }
  if (message.includes("Failed to fetch") || message.includes("fetch")) {
    return `${step}失败：无法连接 Supabase，请检查网络或 VPN`;
  }
  return `${step}失败：${message}`;
}

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setError("");
    if (selected && !title) {
      setTitle(titleFromFilename(selected.name));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!file) {
      setError("请选择要上传的文件");
      return;
    }

    const format = getFormatFromFilename(file.name);
    if (!format) {
      setError(`仅支持 ${ALLOWED_EXTENSIONS.join("、")} 格式`);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("请先登录");
      return;
    }

    setLoading(true);

    const storagePath = buildStoragePath(user.id, format);
    const fileSizeMb = Math.round((file.size / 1024 / 1024) * 100) / 100;

    setStatus("正在上传文件到 Storage…");
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      setError(explainError("文件上传", uploadError.message));
      setStatus("");
      setLoading(false);
      return;
    }

    setStatus("正在保存文档信息到数据库…");
    const { error: insertError } = await supabase.from("documents").insert({
      title: title.trim() || titleFromFilename(file.name),
      format,
      file_path: storagePath,
      file_size_mb: fileSizeMb,
      uploaded_by: user.id,
      uploader_email: user.email ?? null,
      is_published: true,
    });

    if (insertError) {
      await supabase.storage.from("documents").remove([storagePath]);
      setError(explainError("保存文档信息", insertError.message));
      setStatus("");
      setLoading(false);
      return;
    }

    setStatus("上传成功，正在跳转…");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="upload-page">
      <h1>上传文档</h1>
      <p>支持 HTML、PDF。须等下方显示「上传成功」后再离开页面。</p>

      <form className="upload-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        {status && !error && <p className="status-msg">{status}</p>}

        <label htmlFor="title">文档名称</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="留空则使用文件名"
          disabled={loading}
        />

        <label htmlFor="file">选择文件</label>
        <input
          id="file"
          type="file"
          accept=".html,.htm,.pdf"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          required
          disabled={loading}
        />

        {file && (
          <p className="file-hint">
            已选：{file.name}（{(file.size / 1024 / 1024).toFixed(2)} MB）
          </p>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "上传中…" : "上传"}
          </button>
          {!loading && (
            <a href="/" className="btn-link">
              返回列表
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
