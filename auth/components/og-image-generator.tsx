import React from 'react';

interface OGImageProps {
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export const OGImageGenerator: React.FC<OGImageProps> = ({
  title = "Valor2FA",
  description = "Secure Two-Factor Authentication Generator",
  width = 1200,
  height = 630
}) => {
  return (
    <div 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: 'linear-gradient(33deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 25%, rgba(59, 130, 246, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 85% 75%, rgba(99, 102, 241, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 70%),
            radial-gradient(circle at 30% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Saturn Sigil Triangles */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {/* Triangle 1 - Upper left (Saturn's cross top) */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '0',
            height: '0',
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '104px solid rgba(255, 255, 255, 0.1)',
            filter: 'blur(1px)',
            transform: 'rotate(15deg)',
            backdropFilter: 'blur(20px)'
          }}
        />
        
        {/* Triangle 2 - Lower right (Saturn's scythe) */}
        <div
          style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '0',
            height: '0',
            borderLeft: '45px solid transparent',
            borderRight: '45px solid transparent',
            borderTop: '78px solid rgba(255, 255, 255, 0.08)',
            filter: 'blur(1px)',
            transform: 'rotate(-30deg)',
            backdropFilter: 'blur(15px)'
          }}
        />
        
        {/* Triangle 3 - Upper right (completing the sigil) */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            right: '25%',
            width: '0',
            height: '0',
            borderLeft: '35px solid transparent',
            borderRight: '35px solid transparent',
            borderBottom: '61px solid rgba(255, 255, 255, 0.06)',
            filter: 'blur(2px)',
            transform: 'rotate(75deg)',
            backdropFilter: 'blur(25px)'
          }}
        />
      </div>

      {/* Liquid highlight effect */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0.7
        }}
      />
      
      {/* Valor Symbol - No container */}
      <div style={{ marginBottom: '40px', zIndex: 1 }}>
        <svg 
          viewBox="0 0 436.35 377.89" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100px',
            height: '86px',
            color: 'white',
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))'
          }}
        >
          <g 
            fill="none" 
            stroke="currentColor"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path 
              strokeWidth="18"
              d="M4.33,2.5L218.17,372.89L432,2.5Z"
            />
            <path 
              strokeWidth="18"
              d="M39.33,62.91l145.36-0.72l0.11,252.68L39.33,62.91Z M251.69,62.19L397,62.91l-145.47,252L251.69,62.19z"
            />
            <path 
              strokeWidth="6"
              d="M367.61,112.55L367.61,116.55L326.99,116.55L326.99,116.51L329.28,112.55Z
                 M134.41,131.74L134.38,62.74L94.74,62.74Z
                 M278.98,192.38L278.98,192.4L277.83,194.37L276.65,196.38L253.58,196.38L253.58,192.38Z"
            />
          </g>
        </svg>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '72px',
          fontWeight: '800',
          color: 'white',
          textAlign: 'center',
          margin: '0 0 20px 0',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          lineHeight: '1.1',
          zIndex: 1,
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: '32px',
          fontWeight: '400',
          color: 'rgba(255, 255, 255, 0.95)',
          textAlign: 'center',
          margin: '0 0 40px 0',
          maxWidth: '800px',
          lineHeight: '1.3',
          zIndex: 1,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        {description}
      </p>

      {/* Features */}
      <div
        style={{
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          zIndex: 1
        }}
      >
        {[
          { icon: '🔒', text: 'Secure' },
          { icon: '🆓', text: 'Free' },
          { icon: '⚡', text: 'Fast' },
          { icon: '🌐', text: 'Open Source' }
        ].map((feature, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '18px 28px',
              borderRadius: '50px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                borderRadius: '50px'
              }}
            />
            <span style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>{feature.icon}</span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* Centered branding */}
      <div
        style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '12px 20px',
          borderRadius: '25px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          marginTop: '30px',
          zIndex: 1
        }}
      >
        2fa.valortraders.com
      </div>
    </div>
  );
};

export default OGImageGenerator; 