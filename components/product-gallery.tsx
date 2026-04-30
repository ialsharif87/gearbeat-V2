"use client";

import { useState } from "react";
import T from "./t";

export default function ProductGallery({ images, productName }: { images: any[], productName: string }) {
  const [activeImage, setActiveImage] = useState(images[0]?.image_url || null);

  if (!images || images.length === 0) {
    return (
      <div className="main-image-box card">
        <div className="placeholder"><T en="No Image" ar="لا توجد صورة" /></div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="main-image-box card">
        <img src={activeImage} alt={productName} />
      </div>
      {images.length > 1 && (
        <div className="image-thumbnails" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginTop: 20 }}>
          {images.map((img: any, i: number) => (
            <div 
              key={i} 
              className={`card thumb-box ${activeImage === img.image_url ? 'active' : ''}`}
              onClick={() => setActiveImage(img.image_url)}
              style={{ border: activeImage === img.image_url ? '2px solid var(--gb-gold)' : '2px solid transparent' }}
            >
              <img src={img.image_url} alt="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
