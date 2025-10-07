# API-Testbefehle für OP-Item-DB

Dieses Dokument fasst `curl`- und Windows PowerShell-Befehle zusammen, um die Cloudflare Pages Functions API manuell zu prüfen. Ersetze Platzhalter (z. B. Basis-URL und Bearer Token) vor der Ausführung.

## Vorbereitung

```bash
# Unix/macOS
export BASE_URL="https://<your-project>.pages.dev"
export SUPABASE_BEARER="<SUPABASE_USER_JWT>"
```

```powershell
# Windows PowerShell
$Env:BASE_URL = "https://<your-project>.pages.dev"
$Env:SUPABASE_BEARER = "<SUPABASE_USER_JWT>"
$authHeaders = @{ Authorization = "Bearer $($Env:SUPABASE_BEARER)" }
```

> Tipp: Für lokale Tests ersetze `BASE_URL` durch die lokale Dev-URL der Functions (`http://127.0.0.1:8788`).

---

## GET `/api/items`

Beispiel-Query: `?page=1&page_size=10&sort=stars_desc&q=diamond&rarity=legendary&material=netherite&stars_min=2&stars_max=5`

```bash
curl -X GET "${BASE_URL}/api/items?page=1&page_size=10&sort=stars_desc&q=diamond&rarity=legendary&material=netherite&stars_min=2&stars_max=5" \
  -H "Authorization: Bearer ${SUPABASE_BEARER}" \
  -H "Accept: application/json"
```

```powershell
Invoke-RestMethod -Method Get -Uri "${Env:BASE_URL}/api/items?page=1&page_size=10&sort=stars_desc&q=diamond&rarity=legendary&material=netherite&stars_min=2&stars_max=5" `
  -Headers $authHeaders
```

---

## POST `/api/items`

Beispiel-Body:

```json
{
  "title": "Diamond Pickaxe",
  "description": "Legendäres Werkzeug für Hochstufen-Mining.",
  "item_type_id": 1,
  "rarity_id": 4,
  "material_id": 2,
  "stars": 5,
  "image_url": "https://cdn.example.com/items/diamond-pickaxe.png"
}
```

```bash
curl -X POST "${BASE_URL}/api/items" \
  -H "Authorization: Bearer ${SUPABASE_BEARER}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Diamond Pickaxe",
    "description": "Legendäres Werkzeug für Hochstufen-Mining.",
    "item_type_id": 1,
    "rarity_id": 4,
    "material_id": 2,
    "stars": 5,
    "image_url": "https://cdn.example.com/items/diamond-pickaxe.png"
  }'
```

```powershell
$body = @{
  title = "Diamond Pickaxe"
  description = "Legendäres Werkzeug für Hochstufen-Mining."
  item_type_id = 1
  rarity_id = 4
  material_id = 2
  stars = 5
  image_url = "https://cdn.example.com/items/diamond-pickaxe.png"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "${Env:BASE_URL}/api/items" -Headers $authHeaders -ContentType "application/json" -Body $body
```

---

## GET `/api/item-types`

```bash
curl -X GET "${BASE_URL}/api/item-types" -H "Accept: application/json"
```

```powershell
Invoke-RestMethod -Method Get -Uri "${Env:BASE_URL}/api/item-types"
```

---

## GET `/api/materials`

```bash
curl -X GET "${BASE_URL}/api/materials" -H "Accept: application/json"
```

```powershell
Invoke-RestMethod -Method Get -Uri "${Env:BASE_URL}/api/materials"
```

---

## GET `/api/rarities`

```bash
curl -X GET "${BASE_URL}/api/rarities" -H "Accept: application/json"
```

```powershell
Invoke-RestMethod -Method Get -Uri "${Env:BASE_URL}/api/rarities"
```

---

## GET `/api/me`

```bash
curl -X GET "${BASE_URL}/api/me" \
  -H "Authorization: Bearer ${SUPABASE_BEARER}" \
  -H "Accept: application/json"
```

```powershell
Invoke-RestMethod -Method Get -Uri "${Env:BASE_URL}/api/me" -Headers $authHeaders
```

---

## POST `/api/me`

Beispiel-Body:

```json
{
  "username": "RedstoneGuru"
}
```

```bash
curl -X POST "${BASE_URL}/api/me" \
  -H "Authorization: Bearer ${SUPABASE_BEARER}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "RedstoneGuru"
  }'
```

```powershell
$body = @{ username = "RedstoneGuru" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "${Env:BASE_URL}/api/me" -Headers $authHeaders -ContentType "application/json" -Body $body
```

---

## POST `/api/upload-url`

Beispiel-Body:

```json
{
  "file_extension": "png",
  "content_type": "image/png"
}
```

```bash
curl -X POST "${BASE_URL}/api/upload-url" \
  -H "Authorization: Bearer ${SUPABASE_BEARER}" \
  -H "Content-Type: application/json" \
  -d '{
    "file_extension": "png",
    "content_type": "image/png"
  }'
```

```powershell
$body = @{
  file_extension = "png"
  content_type = "image/png"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "${Env:BASE_URL}/api/upload-url" -Headers $authHeaders -ContentType "application/json" -Body $body
```

---

> **Hinweis:** Alle Befehle gehen von einem gültigen Supabase User-JWT aus. Für Tests mit verschiedenen Rollen können getrennte Token exportiert werden.
