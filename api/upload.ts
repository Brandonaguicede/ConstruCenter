import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import Busboy from 'busboy';

// Configuración para Vercel Serverless Function
export const config = {
  api: {
    bodyParser: false, // Desactiva bodyParser para manejar streams/multipart
  },
};

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);
const PDF_MIME_TYPE = 'application/pdf';

function isPdfMime(mimeType: string): boolean {
  return mimeType === PDF_MIME_TYPE;
}

// Inicializar cliente S3 compatible con Cloudflare R2
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

interface ParsedFile {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

/**
 * Extrae el primer archivo de un cuerpo multipart/form-data usando busboy,
 * leyendo directamente el stream del request de Node (sin bodyParser).
 */
function parseMultipartFile(req: any, contentType: string): Promise<ParsedFile | null> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { 'content-type': contentType } });
    let result: ParsedFile | null = null;
    const chunks: Buffer[] = [];

    busboy.on('file', (_fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      fileStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      fileStream.on('end', () => {
        result = { buffer: Buffer.concat(chunks), mimeType, fileName: filename };
      });
    });
    busboy.on('error', reject);
    busboy.on('finish', () => resolve(result));

    req.pipe(busboy);
  });
}

/**
 * Endpoint Vercel Serverless Function para subida de imágenes a Cloudflare R2.
 * Compatible con Web Standard Request (Next.js/Vercel Edge & Node Runtime).
 */
export default async function handler(req: any, res?: any) {
  // Manejo de solicitudes CORS preflight
  if (req.method === 'OPTIONS') {
    if (res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    const errorResponse = { error: 'Método no permitido. Solo se acepta POST.' };
    if (res) return res.status(405).json(errorResponse);
    return new Response(JSON.stringify(errorResponse), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    let fileBuffer: Buffer | null = null;
    let mimeType: string = '';
    let fileName: string = '';

    // Soporte para Web Request standard (fetch / formData), p. ej. en runtime Edge
    if (typeof req.formData === 'function') {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return new Response(JSON.stringify({ error: 'No se envió ningún archivo en el campo "file".' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
      fileName = file.name;
    } else {
      // Runtime Node clásico de Vercel: el req es un stream multipart/form-data crudo.
      const contentType = req.headers['content-type'] || req.headers['Content-Type'] || '';
      const parsed = await parseMultipartFile(req, contentType);

      if (!parsed) {
        const errorMsg = { error: 'No se envió ningún archivo en el campo "file".' };
        if (res) return res.status(400).json(errorMsg);
        return new Response(JSON.stringify(errorMsg), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      fileBuffer = parsed.buffer;
      mimeType = parsed.mimeType;
      fileName = parsed.fileName;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      const errorMsg = { error: 'El archivo está vacío.' };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const isPdfUpload = isPdfMime(mimeType);

    if (!isPdfUpload && !ALLOWED_IMAGE_TYPES.has(mimeType)) {
      const errorMsg = { error: `Tipo de archivo (${mimeType}) no permitido. Debe ser JPG, PNG, WEBP, GIF, SVG o PDF.` };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const maxBufferSize = isPdfUpload ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

    if (fileBuffer.length > maxBufferSize) {
      const limitLabel = isPdfUpload ? '20MB' : '2MB';
      const errorMsg = { error: `El archivo excede el límite máximo de ${limitLabel}.` };
      if (res) return res.status(400).json(errorMsg);
      return new Response(JSON.stringify(errorMsg), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Configuración de almacenamiento R2
    const bucketName = process.env.R2_BUCKET_NAME || 'construcenter-images';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-construcenter.r2.dev';
    const fileExt = fileName.split('.').pop() || (isPdfUpload ? 'pdf' : 'jpg');
    const keyPrefix = isPdfUpload ? 'catalogs' : 'products';
    const fileKey = `${keyPrefix}/${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`;

    // Si no hay credenciales configuradas (modo local/demo), retornamos simulación exitosa o subimos
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.warn('⚠️ Credenciales R2 no detectadas en variables de entorno. Generando URL de prueba local.');
      const mockUrl = isPdfUpload
        ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
      const responsePayload = {
        success: true,
        url: mockUrl,
        key: fileKey,
        isMock: true,
        message: 'Subida simulada: Configure R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY en producción.',
      };
      if (res) return res.status(200).json(responsePayload);
      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r2Client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);

    const publicUrl = `${publicDomain.replace(/\/$/, '')}/${fileKey}`;

    const successPayload = {
      success: true,
      url: publicUrl,
      key: fileKey,
    };

    if (res) return res.status(200).json(successPayload);
    return new Response(JSON.stringify(successPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error durante la subida a Cloudflare R2:', error);
    const errorMsg = { error: `Fallo al procesar o subir archivo: ${error?.message || 'Error desconocido'}` };
    if (res) return res.status(500).json(errorMsg);
    return new Response(JSON.stringify(errorMsg), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
