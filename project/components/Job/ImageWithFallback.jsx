"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({
  src,
  fallbackSrc = "/company.png",
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
};

export default ImageWithFallback;
