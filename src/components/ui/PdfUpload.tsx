import React, { useState, useRef } from 'react';
import { CloudArrowUp as UploadCloud, X, CircleNotch as Loader2, WarningCircle as AlertCircle, CheckCircle, FileText } from '@phosphor-icons/react';

interface PdfUploadProps {
  value?: string | null;
  onChange: (url: string, sizeBytes?: number) => void;
  label?: string;
  helperText?: string;
  error?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const PdfUpload: React.FC<PdfUploadProps> = ({
  value,
  onChange,
  label = 'Archivo PDF',
  helperText = 'Formato admitido: PDF. Tamaño máximo 20MB.',
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

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('El archivo supera el límite permitido de 20MB.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setUploadError('Únicamente se permiten archivos PDF.');
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
        throw new Error(detail?.error || 'No se pudo subir el PDF. Revisa el servicio de archivos o utiliza una URL pública.');
      }

      const data = await response.json();
      if (typeof data.url === 'string' && /^https?:\/\//.test(data.url)) {
        onChange(data.url, file.size);
        setUploadSuccess(true);
      } else {
        throw new Error('La respuesta del servidor no incluyó una URL válida.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir el PDF.');
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

  const handleRemoveFile = () => {
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

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center gap-3 p-4">
          <div className="w-11 h-11 rounded-xl bg-constru-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-constru-primary" />
          </div>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-constru-primary underline underline-offset-2 truncate flex-1"
          >
            {value}
          </a>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-constru-dark rounded-lg text-xs font-bold shadow-xs border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-xs"
              title="Quitar PDF"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
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
              <p className="text-xs text-gray-400">Validando formato e integridad (máx. 20MB)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-constru-primary mb-3">
                <UploadCloud className="w-6 h-6 text-constru-primary" />
              </div>
              <p className="text-sm font-bold text-constru-dark">
                Arrastra y suelta tu PDF aquí, o{' '}
                <span className="text-constru-primary underline">explora tus archivos</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{helperText}</p>
            </div>
          )}
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-constru-accent" />
          PDF cargado correctamente
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
export default PdfUpload;
