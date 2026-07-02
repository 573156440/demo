export type DocumentRecord = {
  id: string;
  title: string;
  format: string;
  file_path: string;
  file_size_mb: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
  uploader_email: string | null;
};

export const ALLOWED_EXTENSIONS = [".html", ".htm", ".pdf"] as const;

export function getFormatFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  return null;
}

export function getContentType(format: string): string {
  if (format === "pdf") return "application/pdf";
  return "text/html; charset=utf-8";
}

export function formatFileSize(mb: number | null): string {
  if (mb == null) return "—";
  if (mb < 0.01) return "< 0.01 MB";
  return `${mb.toFixed(2)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
