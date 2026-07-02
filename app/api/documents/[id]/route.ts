import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: signed, error: signError } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 3600);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "无法获取文件链接" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
