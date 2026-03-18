const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const baseDir = __dirname;
const folders = ['quince', 'bautismo', 'cumple', 'sesion', 'contacto'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico'];

const results = {
  converted: [],
  errors: [],
  totalOriginalSize: 0,
  totalWebPSize: 0
};

async function convertImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    // Obtener extensión original
    const ext = path.extname(inputPath).toLowerCase();
    
    // Para imágenes SVG e ICO, solo copiar
    if (ext === '.svg' || ext === '.ico') {
      fs.copyFileSync(inputPath, outputPath);
      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      return { originalSize, newSize, copied: true };
    }

    // Convertir a WebP
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;

    return { originalSize, newSize, copied: false };
  } catch (error) {
    throw error;
  }
}

async function processFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return;
  }

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!imageExtensions.includes(ext)) {
      continue;
    }

    const inputPath = path.join(folderPath, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(folderPath, baseName + '.webp');

    try {
      const { originalSize, newSize, copied } = await convertImage(inputPath, outputPath);
      const reduction = originalSize - newSize;
      const percentage = ((reduction / originalSize) * 100).toFixed(2);

      results.converted.push({
        original: path.relative(baseDir, inputPath),
        converted: path.relative(baseDir, outputPath),
        originalSize,
        newSize,
        reduction,
        percentage,
        copied
      });

      results.totalOriginalSize += originalSize;
      results.totalWebPSize += newSize;

      console.log(`✓ ${file} -> ${baseName}.webp (${percentage}% reducción)`);
    } catch (error) {
      results.errors.push({
        file: path.relative(baseDir, inputPath),
        error: error.message
      });
      console.error(`✗ Error procesando ${file}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    // Procesar carpeta raíz
    console.log('Procesando imágenes en la carpeta raíz...');
    const files = fs.readdirSync(baseDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!imageExtensions.includes(ext)) {
        continue;
      }

      const inputPath = path.join(baseDir, file);
      const baseName = path.parse(file).name;
      const outputPath = path.join(baseDir, baseName + '.webp');

      try {
        const { originalSize, newSize, copied } = await convertImage(inputPath, outputPath);
        const reduction = originalSize - newSize;
        const percentage = ((reduction / originalSize) * 100).toFixed(2);

        results.converted.push({
          original: file,
          converted: baseName + '.webp',
          originalSize,
          newSize,
          reduction,
          percentage,
          copied
        });

        results.totalOriginalSize += originalSize;
        results.totalWebPSize += newSize;

        console.log(`✓ ${file} -> ${baseName}.webp (${percentage}% reducción)`);
      } catch (error) {
        results.errors.push({
          file: file,
          error: error.message
        });
        console.error(`✗ Error procesando ${file}: ${error.message}`);
      }
    }

    // Procesar subcarpetas
    for (const folder of folders) {
      console.log(`\nProcesando carpeta: ${folder}/`);
      await processFolder(path.join(baseDir, folder));
    }

    // Mostrar resumen
    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN DE CONVERSIÓN');
    console.log('='.repeat(80));
    console.log(`Total de imágenes convertidas: ${results.converted.length}`);
    console.log(`Tamaño original total: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Tamaño WebP total: ${(results.totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
    const totalReduction = results.totalOriginalSize - results.totalWebPSize;
    const avgPercentage = ((totalReduction / results.totalOriginalSize) * 100).toFixed(2);
    console.log(`Reducción total: ${(totalReduction / 1024 / 1024).toFixed(2)} MB (${avgPercentage}%)`);
    
    if (results.errors.length > 0) {
      console.log(`\nErrores: ${results.errors.length}`);
      results.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
    }

    // Guardar resultados en JSON
    fs.writeFileSync(path.join(baseDir, 'conversion-results.json'), JSON.stringify(results, null, 2));
    console.log('\nResultados guardados en: conversion-results.json');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
