import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContentType } from "@/lib/types/document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("file_path, format, title")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "文档不存在" }, { status: 404 });
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("documents")
    .download(doc.file_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "无法读取文件" }, { status: 500 });
  }

  const ext = doc.format === "pdf" ? "pdf" : "html";
  const filename = `${doc.title}.${ext}`;

  return new NextResponse(await fileData.arrayBuffer(), {
    headers: {
      "Content-Type": getContentType(doc.format),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
