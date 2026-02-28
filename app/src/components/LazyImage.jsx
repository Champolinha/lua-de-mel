import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, className, style, placeholderClassName = 'bg-surface-dark animate-pulse' }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        });

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className || ''}`}
            style={style}
        >
            {/* Placeholder */}
            {!isLoaded && (
                <div className={`absolute inset-0 ${placeholderClassName}`} />
            )}

            {/* Actual Image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`h-full w-full object-cover transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
}
