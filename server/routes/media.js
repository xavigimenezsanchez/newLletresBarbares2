const express = require('express');
const router = express.Router();
const { s3, BUCKET_NAME, IMAGES_FOLDER, VIDEOS_FOLDER } = require('../config/s3');

// GET /api/images/:name - Obtener imagen desde S3
router.get('/images/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Añadir extensión .jpg si no la tiene
    const imageName = name.endsWith('.jpg') ? name : `${name}.jpg`;
    const key = `${IMAGES_FOLDER}/${imageName}`;
    
    console.log(`Intentando obtener imagen: ${key} del bucket ${BUCKET_NAME}`);
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    const data = await s3.getObject(params).promise();
    
    // Configurar headers para imagen
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': data.ContentLength,
      'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(data.Body);
    
  } catch (error) {
    console.error('Error obteniendo imagen desde S3:', error);
    
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({ 
        error: 'Imagen no encontrada',
        message: `La imagen ${req.params.name} no existe en S3`
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error obteniendo imagen desde S3'
    });
  }
});

// GET /api/videos/:name - Obtener vídeo desde S3
router.get('/videos/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Añadir extensión .mp4 si no la tiene
    const videoName = name.endsWith('.mp4') ? name : `${name}.mp4`;
    const key = `${VIDEOS_FOLDER}/${videoName}`;
    
    console.log(`Intentando obtener vídeo: ${key} del bucket ${BUCKET_NAME}`);
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    const data = await s3.getObject(params).promise();
    
    // Configurar headers para vídeo
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': data.ContentLength,
      'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(data.Body);
    
  } catch (error) {
    console.error('Error obteniendo vídeo desde S3:', error);
    
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({ 
        error: 'Vídeo no encontrado',
        message: `El vídeo ${req.params.name} no existe en S3`
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error obteniendo vídeo desde S3'
    });
  }
});

// GET /api/media/health - Health check para S3
router.get('/health', async (req, res) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    };
    
    await s3.listObjectsV2(params).promise();
    
    res.json({
      status: 'OK',
      message: 'Conexión a S3 exitosa',
      bucket: BUCKET_NAME,
      imagesFolder: IMAGES_FOLDER,
      videosFolder: VIDEOS_FOLDER
    });
    
  } catch (error) {
    console.error('Error en health check de S3:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error conectando a S3',
      error: error.message
    });
  }
});

module.exports = router; 