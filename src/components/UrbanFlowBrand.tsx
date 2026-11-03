import React from 'react';

interface UrbanFlowBrandProps {
  collapsed?: boolean;
  className?: string;
  height?: number;
}

export const UrbanFlowBrand: React.FC<UrbanFlowBrandProps> = ({
  collapsed = false,
  className = '',
  height = 36,
}) => {
  if (collapsed) {
    // Compact icon-only version for collapsed sidebar navigation
    return (
      <div
        className={`flex items-center justify-center relative select-none ${className}`}
        title="URBANFLOW — Smart City Intelligence"
      >
        <div className="w-9 h-9 rounded bg-[#11212D] border border-[#4A5C6A] flex items-center justify-center p-1 overflow-hidden shadow-xs">
          <img
            src="/urbanflow-logo.png"
            alt="URBANFLOW"
            className="w-full h-full object-contain object-left scale-150 transform translate-x-1"
          />
        </div>
      </div>
    );
  }

  // Full official brand logo preserving exact proportions and clean contrast
  return (
    <div
      className={`flex items-center select-none ${className}`}
      title="URBANFLOW — Smart City Traffic & Road Accident Prediction Platform"
    >
      <div className="flex items-center space-x-2 py-1">
        <img
          src="/urbanflow-logo.png"
          alt="URBANFLOW — Smart City Intelligence"
          style={{ height: `${height}px`, width: 'auto' }}
          className="object-contain max-w-[210px] filter drop-shadow-sm"
        />
      </div>
    </div>
  );
};

