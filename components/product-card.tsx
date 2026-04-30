import Link from "next/link";
import T from "./t";
import AddToCartButton from "./add-to-cart-button";

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
      <div className="product-card-image">
        <Link href={`/gear/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {mainImage ? (
            <img src={mainImage} alt={product.name_en} />
          ) : (
            <div className="placeholder">
              <T en="No Image" ar="لا توجد صورة" />
            </div>
          )}
        </Link>
        <WishlistButton productId={product.id} />
      </div>
      
      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="product-brand">{product.brand?.name_en || "GearBeat"}</div>
          {product.category && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, color: 'var(--muted)' }}>
              <T en={product.category.name_en} ar={product.category.name_ar} />
            </span>
          )}
        </div>
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
