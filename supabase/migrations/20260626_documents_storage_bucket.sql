-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Documents storage bucket                                            ║
-- ║                                                                       ║
-- ║  Stores uploaded certificate/document files (e.g. admin-uploaded     ║
-- ║  certificates recorded in public.documents). Public-by-URL with      ║
-- ║  unguessable (document_id-based) paths, matching the chat-images     ║
-- ║  pattern. Writes/deletes happen via the service-role key in the      ║
-- ║  /api/certificates/upload route, so policies stay conservative.      ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- Idempotent bucket creation.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (files are served by unguessable, document_id-based paths).
DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
CREATE POLICY "documents_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Admins may upload directly (the API route uses the service role and bypasses
-- RLS, but this allows authenticated admin uploads too if ever needed).
DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
CREATE POLICY "documents_storage_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;
CREATE POLICY "documents_storage_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

NOTIFY pgrst, 'reload schema';
