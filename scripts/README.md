# OiWatch authorized product migration

`watclub-import.mjs` reads the public WordPress API of the authorized source,
normalizes product metadata, discovers original images and embedded/direct video,
and creates an idempotent manifest using the source post ID.

Test discovery only:

```powershell
node scripts/watclub-import.mjs --limit 3
```

Download original images into the local staging folder:

```powershell
node scripts/watclub-import.mjs --limit 3 --download
```

Download the complete authorized catalogue with resumable media downloads:

```powershell
node scripts/watclub-import.mjs --all --download --output work/imports/watclub-full
```

Generated files are placed under `work/imports/watclub-test`. The script does
not contain or request R2/Supabase secrets. Upload and database writes will be
handled by a server-side migration step after credentials are stored in secure
environment variables.
