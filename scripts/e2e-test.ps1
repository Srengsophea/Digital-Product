param(
  [string]$Base = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$pass = 0
$fail = 0

function Test-Check {
  param([string]$Name, [scriptblock]$Block)
  try {
    & $Block | Out-Null
    Write-Output "PASS  $Name"
    $script:pass++
  } catch {
    Write-Output "FAIL  $Name -> $($_.Exception.Message)"
    $script:fail++
  }
}

# Helper: new random user
function New-RandomUser {
  $n = Get-Random -Maximum 999999
  return @{
    email = "e2e_${n}@example.com"
    password = "E2ePass!${n}"
    name = "E2E User ${n}"
  }
}

# ============ 1. Public pages render ============
Test-Check "GET / (home)" { Invoke-WebRequest -Uri "$Base/" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /products" { Invoke-WebRequest -Uri "$Base/products" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /products?category=software" { Invoke-WebRequest -Uri "$Base/products?category=software" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /products/nebula-ui-kit-pro" { Invoke-WebRequest -Uri "$Base/products/nebula-ui-kit-pro" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /login" { Invoke-WebRequest -Uri "$Base/login" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /register" { Invoke-WebRequest -Uri "$Base/register" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /cart (anon)" { Invoke-WebRequest -Uri "$Base/cart" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /checkout (anon)" { Invoke-WebRequest -Uri "$Base/checkout" -UseBasicParsing -TimeoutSec 30 | Out-Null }
Test-Check "GET /account (anon -> redirect)" {
  $r = Invoke-WebRequest -Uri "$Base/account" -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30 -ErrorAction SilentlyContinue
  if ($r.StatusCode -ne 307 -and $r.StatusCode -ne 302) { throw "expected redirect, got $($r.StatusCode)" }
}
Test-Check "GET /admin (anon -> 401)" {
  try {
    Invoke-WebRequest -Uri "$Base/admin" -UseBasicParsing -TimeoutSec 30 | Out-Null
    throw "expected 401, got 200"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -ne 401) { throw "expected 401, got $code" }
  }
}

# ============ 2. Auth: register ============
$user = New-RandomUser
Test-Check "POST /api/auth/register" {
  $body = $user | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$Base/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 201) { throw "expected 201, got $($r.StatusCode)" }
  if (-not $r.Content.Contains("id")) { throw "no user id returned" }
}

# ============ 3. Auth: login (bad + good) ============
Test-Check "POST /api/auth/login (wrong password)" {
  $body = @{ email = $user.email; password = "wrongpass" } | ConvertTo-Json
  try {
    Invoke-WebRequest -Uri "$Base/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30 | Out-Null
    throw "expected 401, got 200"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -ne 401) { throw "expected 401, got $code" }
  }
}
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Test-Check "POST /api/auth/login (good)" {
  $body = @{ email = $user.email; password = $user.password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$Base/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
  if (-not $session.Cookies.GetCookies("$Base/")["digi_session"]) { throw "session cookie not set" }
}

# ============ 4. Authenticated pages ============
Test-Check "GET /account (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/account" -WebSession $session -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
  if (-not $r.Content.Contains("Welcome back")) { throw "account page missing welcome" }
}
Test-Check "GET /api/auth/me (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/api/auth/me" -WebSession $session -UseBasicParsing -TimeoutSec 30
  $d = $r.Content | ConvertFrom-Json
  if (-not $d.user) { throw "no user in /me" }
}

# ============ 5. Cart -> Checkout -> Order ============
Test-Check "POST /api/checkout (auth, 1 item)" {
  $body = @{ items = @(@{ productId = "prod_aU57QQ5I2dK2"; qty = 1 }) } | ConvertTo-Json -Depth 5
  $r = Invoke-WebRequest -Uri "$Base/api/checkout" -Method POST -Body $body -ContentType "application/json" -WebSession $session -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 201) { throw "expected 201, got $($r.StatusCode)" }
  $d = $r.Content | ConvertFrom-Json
  if (-not $d.order.id) { throw "no order id" }
  if (-not $d.licenses -or $d.licenses.Count -lt 1) { throw "no licenses returned" }
  $script:orderId = $d.order.id
  $script:licenseKey = $d.licenses[0].key
  $script:qrSecret = $d.licenses[0].qr_secret
}
Test-Check "POST /api/checkout (anon -> 401)" {
  $body = @{ items = @(@{ productId = "prod_aU57QQ5I2dK2"; qty = 1 }) } | ConvertTo-Json -Depth 5
  try {
    Invoke-WebRequest -Uri "$Base/api/checkout" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30 | Out-Null
    throw "expected 401, got 200"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -ne 401) { throw "expected 401, got $code" }
  }
}
Test-Check "GET /account/orders/$script:orderId (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/account/orders/$script:orderId" -WebSession $session -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
}

# ============ 6. License / QR ============
Test-Check "License key returned" {
  if (-not $script:licenseKey) { throw "no license key" }
}
Test-Check "QR secret returned" {
  if (-not $script:qrSecret) { throw "no qr secret" }
}

# ============ 7. Logout ============
Test-Check "POST /api/auth/logout" {
  $r = Invoke-WebRequest -Uri "$Base/api/auth/logout" -Method POST -WebSession $session -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
}
Test-Check "GET /account after logout (redirect)" {
  $r = Invoke-WebRequest -Uri "$Base/account" -WebSession $session -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30 -ErrorAction SilentlyContinue
  if ($r.StatusCode -ne 307 -and $r.StatusCode -ne 302) { throw "expected redirect, got $($r.StatusCode)" }
}

# ============ 8. Admin demo login ============
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Test-Check "POST /api/auth/login (admin)" {
  $body = @{ email = "admin@digivip.io"; password = "admin123" } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$Base/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $adminSession -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
}
Test-Check "GET /admin (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/admin" -WebSession $adminSession -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
}
Test-Check "GET /api/admin/orders (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/api/admin/orders" -WebSession $adminSession -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
  $d = $r.Content | ConvertFrom-Json
  if (-not ($d.orders -or $d)) { throw "no orders data" }
}
Test-Check "GET /api/admin/products (auth)" {
  $r = Invoke-WebRequest -Uri "$Base/api/admin/products" -WebSession $adminSession -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -ne 200) { throw "expected 200, got $($r.StatusCode)" }
}

Write-Output ""
Write-Output "===================="
Write-Output "E2E RESULT: $pass passed, $fail failed"
Write-Output "===================="
if ($fail -gt 0) { exit 1 } else { exit 0 }
