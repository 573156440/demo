"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_EXTENSIONS,
  getFormatFromFilename,
} from "@/lib/types/document";

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-()\u4e00-\u9fff]/g, "_");
}

function titleFromFilename(name: string): string {
  return name.replace(/\.(html|htm|pdf)$/i, "");
}

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
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

    const storagePath = `${user.id}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const fileSizeMb = Math.round((file.size / 1024 / 1024) * 100) / 100;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      setError(`文件上传失败：${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("documents").insert({
      title: title.trim() || titleFromFilename(file.name),
      format,
      file_path: storagePath,
      file_size_mb: fileSizeMb,
      uploaded_by: user.id,
      uploader_email: user.email,
    });

    if (insertError) {
      await supabase.storage.from("documents").remove([storagePath]);
      setError(`保存文档信息失败：${insertError.message}`);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="upload-page">
      <h1>上传文档</h1>
      <p>支持 HTML、PDF，上传后可在文档列表中查看。</p>

      <form className="upload-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}

        <label htmlFor="title">文档名称</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="留空则使用文件名"
        />

        <label htmlFor="file">选择文件</label>
        <input
          id="file"
          type="file"
          accept=".html,.htm,.pdf"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          required
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
          <a href="/" className="btn-link">
            返回列表
          </a>
        </div>
      </form>
    </div>
  );
}
