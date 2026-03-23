const fs = require('fs');
const path = require('path');

// Función para convertir una imagen usando Node.js
async function convertToWebP(inputPath, outputPath) {
    try {
        // Intentar usar sharp si está disponible
        try {
            const sharp = require('sharp');
            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);
            console.log(`✓ Convertido: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
            return true;
        } catch (e) {
            // Si sharp no está disponible, intentar usar canvas o compilar con Node.js nativo
            console.log(`⚠ Sharp no disponible, intentando alternative para ${path.basename(inputPath)}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error al convertir ${inputPath}:`, error.message);
        return false;
    }
}

async function processFolder(folderPath, pattern = '*.jpg') {
    const files = fs.readdirSync(folderPath)
        .filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'));
    
    console.log(`Procesando ${files.length} archivos en ${path.basename(folderPath)}...`);
    
    let converted = 0;
    for (const file of files) {
        const inputPath = path.join(folderPath, file);
        const outputPath = path.join(folderPath, file.replace(/\.[^/.]+$/, '.webp'));
        
        if (await convertToWebP(inputPath, outputPath)) {
            converted++;
        }
    }
    
    console.log(`Total convertidos en ${path.basename(folderPath)}: ${converted}/${files.length}\n`);
    return converted > 0;
}

// Procesar todas las carpetas
async function main() {
    const basePath = __dirname;
    const folders = ['cumple', 'quince', 'Urbano', 'Colacion'];
    
    console.log('=== Iniciando conversión de imágenes ===\n');
    
    let hasSharp = false;
    try {
        require('sharp');
        hasSharp = true;
        console.log('Sharp disponible ✓\n');
    } catch (e) {
        console.log('Sharp NO disponible ⚠\nIntentando instalar...\n');
    }
    
    for (const folder of folders) {
        const folderPath = path.join(basePath, folder);
        if (fs.existsSync(folderPath)) {
            await processFolder(folderPath);
        }
    }
    
    console.log('=== Conversión completada ===');
}

main().catch(console.error);
