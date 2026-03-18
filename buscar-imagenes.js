#!/usr/bin/env node

/**
 * Script para buscar todas las referencias de imágenes en archivos HTML
 * y mostrar los cambios necesarios
 * 
 * Uso: node buscar-imagenes.js [ruta_html]
 */

const fs = require('fs');
const path = require('path');

const imageMap = {
  // Raíz
  'apple-touch-icon.png': 'apple-touch-icon.webp',
  'bannerprinci.jpg': 'bannerprinci.webp',
  'favicon-96x96.png': 'favicon-96x96.webp',
  'favicon.ico': 'favicon.webp',
  'favicon.svg': 'favicon.webp',
  'IMG_1420.jpg.jpeg': 'IMG_1420.jpg.webp',
  'IMG_1434.jpg.jpeg': 'IMG_1434.jpg.webp',
  'logojhona.png': 'logojhona.webp',
  'web-app-manifest-192x192.png': 'web-app-manifest-192x192.webp',
  'web-app-manifest-512x512.png': 'web-app-manifest-512x512.webp',
  
  // Quince
  'IMG_0774 (1) (1).jpg': 'IMG_0774 (1) (1).webp',
  'IMG_0785 (1).jpg': 'IMG_0785 (1).webp',
  'IMG_1199 (1) (1).jpg': 'IMG_1199 (1) (1).webp',
  'quince1.jpg': 'quince1.webp',
  'quince2.jpg': 'quince2.webp',
  
  // Bautismo
  'IMG_3371.jpg': 'IMG_3371.webp',
  'IMG_6697.jpg': 'IMG_6697.webp',
  'IMG_6715 (1).jpg': 'IMG_6715 (1).webp',
  'IMG_6864.jpg': 'IMG_6864.webp',
  
  // Cumple
  'comple3.jpg': 'comple3.webp',
  'cumple1.jpg': 'cumple1.webp',
  'cumple2.jpg': 'cumple2.webp',
  'cumple4.jpg': 'cumple4.webp',
  'cumple5.jpeg': 'cumple5.webp',
  'cumple6.jpeg': 'cumple6.webp',
  
  // Sesion
  'sesion1.jpg': 'sesion1.webp',
  'sesion2.jpg': 'sesion2.webp',
  'sesion4.jpeg': 'sesion4.webp',
  'sesion5.jpeg': 'sesion5.webp',
  'sesion7.jpeg': 'sesion7.webp',
  
  // Contacto
  'carrusel1.jpeg': 'carrusel1.webp',
  'carrusel2.jpeg': 'carrusel2.webp',
  'carrusel3.jpeg': 'carrusel3.webp',
  'sesion3.jpeg': 'sesion3.webp',
  'sesion6.jpeg': 'sesion6.webp'
};

function findImageReferences(htmlContent) {
  const references = [];
  
  // Buscar en img src
  const imgRegex = /src=["']([^"']*?)([\w\s().-]+\.(jpg|jpeg|png|gif|webp|ico|svg))["']/gi;
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const fullPath = match[1] + match[2];
    const fileName = match[2];
    
    if (imageMap[fileName]) {
      references.push({
        type: 'img src',
        original: fullPath,
        replacement: match[1] + imageMap[fileName],
        fileName: fileName
      });
    }
  }
  
  // Buscar en background-image
  const bgRegex = /url\(["']?([^"')]*?)([\w\s().-]+\.(jpg|jpeg|png|gif|webp|ico|svg))["']?\)/gi;
  while ((match = bgRegex.exec(htmlContent)) !== null) {
    const fullPath = match[1] + match[2];
    const fileName = match[2];
    
    if (imageMap[fileName]) {
      references.push({
        type: 'background-image',
        original: fullPath,
        replacement: match[1] + imageMap[fileName],
        fileName: fileName
      });
    }
  }
  
  // Buscar en href (favicon, apple-touch-icon)
  const linkRegex = /href=["']([^"']*?)([\w\s().-]+\.(jpg|jpeg|png|gif|webp|ico|svg))["']/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const fullPath = match[1] + match[2];
    const fileName = match[2];
    
    if (imageMap[fileName]) {
      references.push({
        type: 'link href',
        original: fullPath,
        replacement: match[1] + imageMap[fileName],
        fileName: fileName
      });
    }
  }
  
  return references;
}

function main() {
  const basePath = process.argv[2] || '.';
  
  if (!fs.existsSync(basePath)) {
    console.error(`Error: La ruta '${basePath}' no existe`);
    process.exit(1);
  }
  
  const stats = fs.statSync(basePath);
  let filesToProcess = [];
  
  if (stats.isDirectory()) {
    // Si es una carpeta, buscar todos los archivos HTML
    const findHtmlFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const fileStat = fs.statSync(fullPath);
        
        if (fileStat.isDirectory() && !file.startsWith('.')) {
          findHtmlFiles(fullPath);
        } else if (file.endsWith('.html')) {
          filesToProcess.push(fullPath);
        }
      });
    };
    
    findHtmlFiles(basePath);
  } else if (basePath.endsWith('.html')) {
    filesToProcess.push(basePath);
  } else {
    console.error('Error: El archivo debe ser HTML');
    process.exit(1);
  }
  
  if (filesToProcess.length === 0) {
    console.error('No se encontraron archivos HTML');
    process.exit(1);
  }
  
  console.log(`\n🔍 Buscando referencias de imágenes en ${filesToProcess.length} archivo(s)...\n`);
  
  let totalReferences = 0;
  
  filesToProcess.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const references = findImageReferences(content);
    
    if (references.length > 0) {
      totalReferences += references.length;
      console.log(`\n📄 ${filePath}`);
      console.log('═'.repeat(80));
      
      references.forEach((ref, index) => {
        console.log(`\n${index + 1}. [${ref.type}]`);
        console.log(`   Original:    ${ref.original}`);
        console.log(`   Cambiar a:   ${ref.replacement}`);
      });
    }
  });
  
  if (totalReferences > 0) {
    console.log(`\n\n✅ Se encontraron ${totalReferences} referencias de imágenes a actualizar`);
  } else {
    console.log('\n✨ No se encontraron referencias de imágenes antiguas');
  }
}

main();
