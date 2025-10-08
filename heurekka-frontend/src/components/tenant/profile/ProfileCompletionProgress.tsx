/**
 * Profile Completion Progress Component
 * Muestra el progreso de completitud del perfil con barra circular
 */

'use client';

import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ProfileCompletionProgressProps {
  percentage: number;
  missingFields?: string[];
  nextSteps?: string[];
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24',
  large: 'w-32 h-32',
};

const textSizeClasses = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
};

export function ProfileCompletionProgress({
  percentage,
  missingFields = [],
  nextSteps = [],
  showDetails = false,
  size = 'medium',
}: ProfileCompletionProgressProps) {
  // Ensure percentage is a valid number
  const validPercentage = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (validPercentage / 100) * circumference;

  const getStatusColor = () => {
    if (validPercentage === 100) return 'text-green-600';
    if (validPercentage >= 70) return 'text-blue-600';
    if (validPercentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (validPercentage === 100) return 'Perfil Completo';
    if (validPercentage >= 70) return 'Casi Completo';
    if (validPercentage >= 40) return 'En Progreso';
    return 'Completa tu Perfil';
  };

  return (
    <div className="space-y-4">
      {/* Circular Progress */}
      <div className="flex flex-col items-center">
        <div className={`relative ${sizeClasses[size]}`}>
          <svg className="transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${getStatusColor()}`}
            />
          </svg>

          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold ${getStatusColor()} ${textSizeClasses[size]}`}>
              {validPercentage}%
            </span>
          </div>
        </div>

        {/* Status Text */}
        <p className={`mt-2 font-medium ${getStatusColor()} ${textSizeClasses[size]}`}>
          {getStatusText()}
        </p>
      </div>

      {/* Details Section */}
      {showDetails && (missingFields.length > 0 || nextSteps.length > 0) && (
        <div className="space-y-3">
          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                    Campos Faltantes
                  </h4>
                  <ul className="space-y-1">
                    {missingFields.map((field, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-yellow-800">
                        <Circle className="h-3 w-3" />
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {nextSteps.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Próximos Pasos
                  </h4>
                  <ul className="space-y-1">
                    {nextSteps.map((step, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                        <Circle className="h-3 w-3" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
