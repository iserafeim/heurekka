'use client';

/**
 * ProfilePhotoUpload Component
 * Drag & drop file upload con crop de imagen
 */

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
  onUpload: (base64Image: string) => void;
  currentPhoto?: string | null;
  onDelete?: () => void;
  className?: string;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ProfilePhotoUpload({
  onUpload,
  currentPhoto,
  onDelete,
  className,
}: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Solo se aceptan imágenes JPG, PNG o WEBP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen no puede exceder 5MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1); // Aspect ratio 1:1 (cuadrado)
    setCrop(crop);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!imgRef.current || !crop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [crop]);

  const handleCropConfirm = useCallback(async () => {
    const croppedImage = await getCroppedImage();
    if (croppedImage) {
      setPreviewUrl(croppedImage);
      setImageToCrop(null);
      onUpload(croppedImage);
    }
  }, [getCroppedImage, onUpload]);

  const handleCropCancel = useCallback(() => {
    setImageToCrop(null);
    setCrop(undefined);
  }, []);

  const handleDelete = useCallback(() => {
    setPreviewUrl(null);
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onDelete?.();
  }, [onDelete]);

  // Vista de crop
  if (imageToCrop) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="bg-gray-900 rounded-lg p-4">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={imageToCrop}
              alt="Imagen para recortar"
              onLoad={handleImageLoad}
              className="max-w-full max-h-96 mx-auto"
            />
          </ReactCrop>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCropConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={handleCropCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Vista de preview o upload
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Foto de perfil"
            className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-blue-100"
          />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-0 right-1/2 translate-x-24 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Eliminar foto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer',
            'flex flex-col items-center justify-center gap-4 min-h-64',
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          )}
        >
          <div className="text-6xl">📷</div>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? 'Suelta la imagen aquí' : 'Subir Foto'}
            </p>
            <p className="text-sm text-gray-500">
              Arrastra una imagen o haz clic para seleccionar
            </p>
          </div>

          <p className="text-xs text-gray-400">
            JPG, PNG o WEBP - Máximo 5MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center flex items-center justify-center gap-1">
          <span className="text-base">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
