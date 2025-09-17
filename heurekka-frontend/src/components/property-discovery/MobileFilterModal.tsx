'use client';

import React from 'react';
import { SearchFilters } from '@/types/property';

interface MobileFilterModalProps {
  isOpen: boolean;
  filterType: 'bedrooms' | 'price' | 'type' | 'pets' | 'deals' | 'more';
  title: string;
  filters: SearchFilters;
  onClose: () => void;
  onApply: (newFilters: Partial<SearchFilters>) => void;
}

/**
 * Mobile fullscreen filter modal with exact structure from the image
 */
export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  filterType,
  title,
  filters,
  onClose,
  onApply
}) => {
  const [tempFilters, setTempFilters] = React.useState<Partial<SearchFilters>>({});

  // Initialize temp filters when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters({
        bedrooms: filters.bedrooms || [],
        bathrooms: filters.bathrooms || []
      });
    }
  }, [isOpen, filters]);

  const handleBedroomToggle = (num: number | 'studio') => {
    const currentBedrooms = tempFilters.bedrooms || [];
    const newBedrooms = currentBedrooms.includes(num)
      ? currentBedrooms.filter(b => b !== num)
      : [...currentBedrooms, num];

    setTempFilters(prev => ({ ...prev, bedrooms: newBedrooms }));
  };

  const handleBathroomToggle = (num: number) => {
    const currentBathrooms = tempFilters.bathrooms || [];
    const newBathrooms = currentBathrooms.includes(num)
      ? currentBathrooms.filter(b => b !== num)
      : [...currentBathrooms, num];

    setTempFilters(prev => ({ ...prev, bathrooms: newBathrooms }));
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  if (!isOpen) return null;

  const renderBedroomsBathroomsContent = () => (
    <div className="flex-1 px-6 py-6 space-y-10">
      {/* Bedrooms Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Bedrooms</h3>
        <div className="flex gap-2 justify-between">
          {['studio', 1, 2, 3, '4+'].map(option => (
            <button
              key={option}
              onClick={() => handleBedroomToggle(option === 'studio' ? 'studio' : option === '4+' ? 4 : option)}
              className={`flex-1 py-4 text-center text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                (tempFilters.bedrooms || []).includes(option === 'studio' ? 'studio' : option === '4+' ? 4 : option)
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option === 'studio' ? 'Studio' : option}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Bathrooms</h3>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, '5+'].map(option => (
            <button
              key={option}
              onClick={() => handleBathroomToggle(option === '5+' ? 5 : option)}
              className={`flex-1 py-4 text-center text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                (tempFilters.bathrooms || []).includes(option === '5+' ? 5 : option)
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Container with Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end backdrop-brightness-75"
        onClick={(e) => {
          // Only close if clicking the background area (not the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full h-[65vh] bg-white rounded-t-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            {/* Clear Button */}
            <button
              onClick={() => {
                setTempFilters({ bedrooms: [], bathrooms: [] });
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-base transition-colors duration-200"
            >
              Clear
            </button>

            {/* Title */}
            <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wider">BEDS/BATHS</h2>

            {/* Close X */}
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {filterType === 'bedrooms' && renderBedroomsBathroomsContent()}

          {/* Footer */}
          <div className="px-6 py-6 border-t border-gray-100 mt-auto">
            <button
              onClick={handleApply}
              className="w-full bg-gray-900 text-white py-4 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors duration-200"
            >
              Ver resultados
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;