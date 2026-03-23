param(
    [string]$FolderPath = (Get-Location).Path
)

Add-Type -AssemblyName System.Drawing

function Convert-ToWebP {
    param(
        [string]$InputPath,
        [string]$OutputPath
    )
    
    try {
        [System.Drawing.Image]$image = [System.Drawing.Image]::FromFile($InputPath)
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
            Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
        
        if ($jpegCodec) {
            $image.Save($OutputPath, $jpegCodec)
            Write-Host "Convertido: $(Split-Path -Leaf $InputPath)" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    return $false
}

# Procesar archivos JPG/JPEG
$jpgFiles = Get-ChildItem -Path $FolderPath -Filter "*.jpg" -ErrorAction SilentlyContinue
$jpegFiles = Get-ChildItem -Path $FolderPath -Filter "*.jpeg" -ErrorAction SilentlyContinue
$allFiles = $jpgFiles + $jpegFiles

Write-Host "Procesando $(($allFiles | Measure-Object).Count) imágenes en $(Split-Path -Leaf $FolderPath)..." -ForegroundColor Cyan

$converted = 0
foreach ($file in $allFiles) {
    $outputPath = Join-Path -Path $FolderPath -ChildPath "$([System.IO.Path]::GetFileNameWithoutExtension($file.Name)).webp"
    if (Convert-ToWebP -InputPath $file.FullName -OutputPath $outputPath) {
        $converted++
    }
}

$totalCount = ($allFiles | Measure-Object).Count
Write-Host "Total convertidos: $converted/$totalCount" -ForegroundColor Cyan
