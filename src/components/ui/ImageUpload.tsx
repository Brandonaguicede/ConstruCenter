import React, { useState, useRef } from 'react';
import { CloudArrowUp as UploadCloud, X, CircleNotch as Loader2, WarningCircle as AlertCircle, CheckCircle } from '@phosphor-icons/react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Fotografía del Producto',
  helperText = 'Formatos admitidos: PNG, JPG, WEBP. Tamaño máximo 2MB.',
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    // 1. Validación de tamaño en frontend (2MB)
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('El archivo supera el límite permitido de 2MB.');
      return;
    }

    // 2. Validación de tipo MIME
    if (!file.type.startsWith('image/')) {
      setUploadError('Únicamente se permiten archivos de imagen válidos.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || 'No se pudo subir la imagen. Revisa el servicio de archivos o utiliza una URL pública.');
      }

      const data = await response.json();
      if (typeof data.url === 'string' && /^https?:\/\//.test(data.url)) {
        onChange(data.url);
        setUploadSuccess(true);
      } else {
        throw new Error('La respuesta del servidor no incluyó una URL válida.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          {label}
        </label>
      )}

      {/* Input oculto nativo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Vista previa si ya existe una imagen */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center p-2">
          <img
            src={value}
            alt="Vista previa de producto"
            className="w-full h-52 object-contain rounded-xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-constru-dark rounded-lg text-xs font-bold shadow-md hover:bg-gray-100 transition-colors"
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
              title="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Zona Drag & Drop */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            isDragging
              ? 'border-constru-accent bg-green-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-constru-primary bg-white hover:bg-gray-50/60'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-9 h-9 text-constru-primary animate-spin" />
              <p className="text-sm font-semibold text-constru-primary">
                Subiendo a Cloudflare R2...
              </p>
              <p className="text-xs text-gray-400">Validando formato e integridad (máx. 2MB)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-constru-primary mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-constru-primary" />
              </div>
              <p className="text-sm font-bold text-constru-dark">
                Arrastra y suelta tu imagen aquí, o{' '}
                <span className="text-constru-primary underline">explora tus archivos</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{helperText}</p>
            </div>
          )}
        </div>
      )}

      {/* Mensajes de Estado */}
      {uploadSuccess && (
        <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-constru-accent" />
          Imagen cargada correctamente
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          {uploadError}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
export default ImageUpload;
