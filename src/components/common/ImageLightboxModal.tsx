import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in select-none"
      onClick={onClose}
    >
      {/* Top Controls */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          <ZoomIn className="w-4 h-4 text-white/70" />
          <span className="text-xs font-medium text-white/90">
            {title ? `${title} • ` : ''}Foto {currentIndex + 1} de {images.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          title="Fechar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Anexo ${currentIndex + 1}`}
          className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:-left-12 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all shadow-lg"
              title="Foto anterior (Seta esquerda)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:-right-12 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all shadow-lg"
              title="Próxima foto (Seta direita)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnails Strip (if multiple) */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 flex items-center gap-2 p-1.5 bg-black/50 border border-white/10 rounded-xl backdrop-blur-md z-10"
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-white scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
