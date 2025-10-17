# Test Netlify Functions Deployment
Write-Host "🧪 Testing Netlify Functions..." -ForegroundColor Cyan

$baseUrl = "https://backend-17-10-2025.netlify.app/.netlify/functions"

# Test 1: Scrape function
Write-Host "`n1️⃣ Testing /scrape endpoint..." -ForegroundColor Yellow
$scrapeBody = @{
    url = "https://example.com"
    analyzeWithAI = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/scrape" -Method POST -Body $scrapeBody -ContentType "application/json"
    Write-Host "✅ Scrape endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Scrape endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
}

# Test 2: Preview function
Write-Host "`n2️⃣ Testing /preview endpoint..." -ForegroundColor Yellow
$previewBody = @{
    url = "https://example.com"
    analyzeWithAI = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/preview" -Method POST -Body $previewBody -ContentType "application/json"
    Write-Host "✅ Preview endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Preview endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Data function
Write-Host "`n3️⃣ Testing /data endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/data?page=1&limit=5" -Method GET
    Write-Host "✅ Data endpoint working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Data endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Testing complete!" -ForegroundColor Cyan
