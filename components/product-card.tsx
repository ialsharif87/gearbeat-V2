import Link from "next/link";
import T from "./t";

type ProductCardProps = {
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    base_price: number;
    brand?: { name_en: string };
    category?: { name_en: string; name_ar: string };
    images?: { image_url: string }[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]?.image_url || null;

  return (
    <article className="card product-card">
      <Link href={`/gear/products/${product.slug}`} className="product-card-image">
        {mainImage ? (
          <img src={mainImage} alt={product.name_en} />
        ) : (
          <div className="placeholder">
            <T en="No Image" ar="لا توجد صورة" />
          </div>
        )}
      </Link>
      
      <div className="product-card-body">
        <div className="product-brand">{product.brand?.name_en || "GearBeat"}</div>
        <Link href={`/gear/products/${product.slug}`} className="product-name">
          <h3>{product.name_en}</h3>
          <p className="ar-name">{product.name_ar}</p>
        </Link>
        
        <div className="product-footer">
          <div className="product-price">
            <strong>{product.base_price}</strong> <small>SAR</small>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
