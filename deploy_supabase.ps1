#!/usr/bin/env powershell

# 1. Login to Supabase (this will open your browser to authenticate)
Write-Host "Logging into Supabase..." -ForegroundColor Cyan
npx supabase login

# 2. Link your local project to your remote Supabase project
Write-Host "`nLinking project nuzbqbmukqmdcmxblnuo..." -ForegroundColor Cyan
npx supabase link --project-ref nuzbqbmukqmdcmxblnuo

# 3. Securely set the AI API keys as secrets in Supabase
Write-Host "`nSetting Supabase Secrets..." -ForegroundColor Cyan
npx supabase secrets set GEMINI_API_KEY=AIzaSyAPh2zjZbUusB6nlox2MC8vu8NzmbNlxhU
npx supabase secrets set TRIPO_API_KEY=tsk_MUS2m-_vfQv5ijWOwyLcnSn_N9UgcQZ8hLR88Ke0Tb3

# 4. Deploy the edge function
Write-Host "`nDeploying Edge Function (process-menu-item)..." -ForegroundColor Cyan
npx supabase functions deploy process-menu-item

Write-Host "`nAll done! Step 4 complete." -ForegroundColor Green
