import React, { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver, useResponsiveImage, useDeviceType } from '../utils/responsive';

/**
 * LazyImage Component
 * Optimizes image loading with:
 * - Lazy loading via Intersection Observer
 * - Responsive sizing
 * - Placeholder/skeleton loading
 * - Error handling
 * - ARIA support
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23374151"/%3E%3C/svg%3E',
  onLoad,
  onError,
  priority = false,
  ...props
}) => {
  const imageRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const deviceType = useDeviceType();
  
  // Use intersection observer for lazy loading
  const { hasIntersected } = useIntersectionObserver(imageRef, {
    threshold: 0.01,
    rootMargin: deviceType === 'mobile' ? '50px' : '100px'
  });

  // Load image when it enters viewport
  useEffect(() => {
    if (hasIntersected && !priority && src) {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
      };
    }
  }, [hasIntersected, src, priority, onLoad, onError]);

  // Generate responsive srcset if multiple sources provided
  const generateSrcSet = () => {
    if (typeof src === 'object' && src.srcset) {
      return src.srcset;
    }
    return undefined;
  };

  return (
    <div 
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
      )}
      
      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs text-gray-500">Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          srcSet={generateSrcSet()}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage; 