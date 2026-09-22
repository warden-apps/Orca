# Serves this folder at http://localhost:8080 so the service worker and the
# Install button work (both are disabled on file:// URLs).
#
#   Right-click this file > Run with PowerShell
#   or:  powershell -ExecutionPolicy Bypass -File serve.ps1
#
# Ctrl+C stops it. Nothing is installed and nothing leaves your machine.

param([int]$Port = 8080)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$types = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
  ".svg"  = "image/svg+xml"
  ".csv"  = "text/csv; charset=utf-8"
  ".md"   = "text/markdown; charset=utf-8"
  ".woff2"= "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch {
  Write-Host "Could not open port $Port. Try another: .\serve.ps1 -Port 8090" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  Orca is running at http://localhost:$Port/" -ForegroundColor Green
Write-Host "  Serving: $root"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""
Start-Process "http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart("/"))
    if ($rel -eq "") { $rel = "index.html" }

    $path = Join-Path $root $rel
    # keep requests inside this folder
    $full = [IO.Path]::GetFullPath($path)
    if (-not $full.StartsWith([IO.Path]::GetFullPath($root))) {
      $ctx.Response.StatusCode = 403; $ctx.Response.Close(); continue
    }

    if (Test-Path $full -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
      # the service worker must never be served stale
      if ($rel -eq "sw.js") { $ctx.Response.Headers.Add("Cache-Control", "no-cache") }
      $bytes = [IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  200  /" + $rel)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes("Not found: /$rel")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
      Write-Host ("  404  /" + $rel) -ForegroundColor DarkYellow
    }
    $ctx.Response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
  Write-Host "  Stopped." -ForegroundColor DarkGray
}
