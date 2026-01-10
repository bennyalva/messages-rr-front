import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  visible?: boolean; // Can be controlled externally
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children, 
    visible, 
    className = "",
    position = 'top' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine visibility: if 'visible' prop is provided, use it. Otherwise use hover state.
  const isVisible = visible !== undefined ? visible : isHovered;

  if (!content) return <>{children}</>;

  const positionClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div 
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black/90 rounded shadow-lg pointer-events-none whitespace-nowrap fade-in ${positionClasses[position]}`}>
          {content}
          {/* Triangle arrow */}
          <div className={`absolute w-2 h-2 bg-black/90 transform rotate-45 
            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
          `}></div>
        </div>
      )}
    </div>
  );
};
