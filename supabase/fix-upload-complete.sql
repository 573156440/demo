-- 一次性修复上传问题：补字段 + Storage 策略 + documents 表策略
-- 在 Supabase SQL Editor 中执行，点 Run query

-- 1. 补全 documents 表字段（与代码一致）
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS uploader_email TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. documents 表 RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_authenticated" ON public.documents;
CREATE POLICY "documents_select_authenticated"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "documents_insert_authenticated" ON public.documents;
CREATE POLICY "documents_insert_authenticated"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "documents_update_owner" ON public.documents;
CREATE POLICY "documents_update_owner"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- 3. 确保 Storage 桶存在（私有）
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 4. Storage 对象 RLS（登录用户可上传、读取、删除自己的文件）
DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
CREATE POLICY "documents_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
CREATE POLICY "documents_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;
CREATE POLICY "documents_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
