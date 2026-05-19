import React from 'react';

interface LoadingAnimationProps {
  speed?: 'fast' | 'normal' | 'slow';
  mode?: 'normal' | 'love' | 'roast' | 'study' | null;
  size?: number;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ speed = 'normal', mode = 'normal', size = 48 }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const petalColor = mode === 'love' ? '#ff6b9d' 
    : mode === 'roast' ? '#ff6b2b' 
    : isDark ? '#ffffff' : '#111111';
  
  const dBase = speed === 'fast' ? 1.0 : speed === 'slow' ? 3.5 : 1.8;
  const duration = `${dBase}s`;
  const delay = dBase / 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px` }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <style>{`
            .petal { transform-origin: 100px 100px; animation: spin ${duration} cubic-bezier(.4,0,.2,1) infinite; }
            .p1 { --r: 0deg; animation-delay: 0s; }
            .p2 { --r: 72deg; animation-delay: ${delay.toFixed(2)}s; }
            .p3 { --r: 144deg; animation-delay: ${(delay * 2).toFixed(2)}s; }
            .p4 { --r: 216deg; animation-delay: ${(delay * 3).toFixed(2)}s; }
            .p5 { --r: 288deg; animation-delay: ${(delay * 4).toFixed(2)}s; }
            @keyframes spin {
              0% { opacity: 0.15; transform: rotate(var(--r)); }
              25% { opacity: 1; transform: rotate(calc(var(--r) + 40deg)); }
              60% { opacity: 0.7; transform: rotate(calc(var(--r) + 200deg)); }
              100% { opacity: 0.15; transform: rotate(calc(var(--r) + 360deg)); }
            }
          `}</style>
        </defs>
        <g className="petal p1"><ellipse cx="100" cy="62" rx="13" ry="38" style={{ fill: petalColor }} /></g>
        <g className="petal p2"><ellipse cx="100" cy="62" rx="13" ry="38" style={{ fill: petalColor }} /></g>
        <g className="petal p3"><ellipse cx="100" cy="62" rx="13" ry="38" style={{ fill: petalColor }} /></g>
        <g className="petal p4"><ellipse cx="100" cy="62" rx="13" ry="38" style={{ fill: petalColor }} /></g>
        <g className="petal p5"><ellipse cx="100" cy="62" rx="13" ry="38" style={{ fill: petalColor }} /></g>
      </svg>
    </div>
  );
};

export default LoadingAnimation;
