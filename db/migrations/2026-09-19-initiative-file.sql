-- Adds "ملف المبادرة": one attachment per initiative, which is either an
-- uploaded PDF/image or a pasted link. Both end up in the same column because
-- an uploaded file is served from a URL too; `file_is_upload` records which,
-- so the admin form knows whether deleting the row should also delete a blob.
--
-- Safe to re-run.

alter table initiatives
  add column if not exists file_url text,
  add column if not exists file_label text,
  add column if not exists file_is_upload boolean not null default false;
