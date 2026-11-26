-- Add optional PDF attachment URL to mock tests and create a public storage
-- bucket for question paper / previous paper PDFs.
alter table public.mock_tests
  add column if not exists pdf_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mock-test-pdfs',
  'mock-test-pdfs',
  true,
  20000000,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload mock test pdfs" on storage.objects;
create policy "Admins upload mock test pdfs"
on storage.objects for insert to authenticated
with check (bucket_id = 'mock-test-pdfs' and public.is_admin());

drop policy if exists "Admins update mock test pdfs" on storage.objects;
create policy "Admins update mock test pdfs"
on storage.objects for update to authenticated
using (bucket_id = 'mock-test-pdfs' and public.is_admin())
with check (bucket_id = 'mock-test-pdfs' and public.is_admin());

drop policy if exists "Admins delete mock test pdfs" on storage.objects;
create policy "Admins delete mock test pdfs"
on storage.objects for delete to authenticated
using (bucket_id = 'mock-test-pdfs' and public.is_admin());
