-- 在 Supabase SQL Editor 中执行（若表已存在，可只执行后半部分 Storage 和 Policy）

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS uploader_email TEXT;

-- Storage 桶（私有，仅登录用户可读写）
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- documents 表 RLS 策略
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_authenticated" ON public.documents;
CREATE POLICY "documents_select_authenticated"
  ON public.documents FOR SELECT
  TO authenticated
  USING (is_published = true);

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

-- Storage 对象 RLS 策略
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
