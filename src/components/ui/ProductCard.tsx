import { CatalogImage } from '@/components/ui/CatalogImage';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingCart, Package, Check } from '@phosphor-icons/react';
import type { Product } from '@/types/models';
import { formatColones } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';
import './ProductCard.css';

export const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const image = product.images?.[0];
  const productUrl = '/producto/' + product.slug;
  const offerPrice = product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : null;

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const handleAdd = () => {
    addItem(product, 1);
    setJustAdded(true);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article className="product-card">
      <Link to={productUrl} className="product-card-media" aria-label={'Ver ' + product.name}>
        {image ? <CatalogImage src={image} alt={product.name} loading="lazy" width={480} height={400} /> : (
          <div className="product-card-placeholder"><Package size={40} aria-hidden="true" /><span>Imagen no disponible</span></div>
        )}
        {(product.is_featured || offerPrice) && (
          <div className="product-card-badges">
            {product.is_featured && <span className="product-badge">Destacado</span>}
            {offerPrice && <span className="product-badge product-badge-offer">Oferta</span>}
          </div>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{product.category?.name || 'Equipos'}</span>
          {product.brand?.name && <span>{product.brand.name}</span>}
        </div>
        <h2 className="product-card-title"><Link to={productUrl}>{product.name}</Link></h2>
        <p className="product-card-sku">SKU: {product.sku}</p>
        <div className="product-card-price" data-price>
          <strong>{formatColones(product.price)}</strong>
          {offerPrice && <del>{formatColones(offerPrice)}</del>}
        </div>
        <div className="product-card-actions">
          <Link to={productUrl} className="button-secondary">Ver detalle <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <button type="button" className="button-primary" onClick={handleAdd} aria-label={'Agregar ' + product.name + ' al carrito'}>
            {justAdded ? <Check size={17} aria-hidden="true" /> : <ShoppingCart size={17} aria-hidden="true" />}
            <span aria-live="polite">{justAdded ? 'Agregado' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

