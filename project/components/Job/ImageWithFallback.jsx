// components/ImageWithFallback.jsx
"use client";

import Image from "next/image";

const ImageWithFallback = ({ src, fallbackSrc, alt, ...props }) => {
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackSrc;
  };

  return <Image src={src} alt={alt} onError={handleError} {...props} />;
};

export default ImageWithFallback;
