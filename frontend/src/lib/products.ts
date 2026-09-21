import type { Dict } from '@/i18n/zh';

export type ProductId =
  | 'notebook'
  | 'toteSmall'
  | 'toteLarge'
  | 'postcard'
  | 'keyring1'
  | 'keyring2';

export type ProductMeta = {
  id: ProductId;
  /** Primary image (first photo) — used for cart thumbnails. */
  art: string;
  /** Real product photography, in display order. */
  photos: string[];
  /** accent color for the product card */
  accent: string;
};

export const PRODUCTS: ProductMeta[] = [
  {
    id: 'notebook',
    art: '/images/products/notebook-1.jpg',
    photos: ['/images/products/notebook-1.jpg', '/images/products/notebook-2.jpg', '/images/products/notebook-3.jpg'],
    accent: '#e85a4f',
  },
  {
    id: 'toteSmall',
    art: '/images/products/tote-small-1.jpg',
    photos: [
      '/images/products/tote-small-1.jpg',
      '/images/products/tote-small-2.jpg',
      '/images/products/tote-small-3.jpg',
      '/images/products/tote-small-4.jpg',
    ],
    accent: '#6c3a4f',
  },
  {
    id: 'toteLarge',
    art: '/images/products/tote-large-1.jpg',
    photos: ['/images/products/tote-large-1.jpg', '/images/products/tote-large-2.jpg', '/images/products/tote-large-3.jpg'],
    accent: '#6c3a4f',
  },
  {
    id: 'postcard',
    art: '/images/products/postcard-1.jpg',
    photos: ['/images/products/postcard-1.jpg', '/images/products/postcard-2.jpg', '/images/products/postcard-3.jpg'],
    accent: '#7d8a4a',
  },
  {
    id: 'keyring1',
    art: '/images/products/keyring-1-1.jpg',
    photos: ['/images/products/keyring-1-1.jpg', '/images/products/keyring-1-2.jpg', '/images/products/keyring-1-3.jpg'],
    accent: '#1a1a1a',
  },
  {
    id: 'keyring2',
    art: '/images/products/keyring-2-1.jpg',
    photos: [
      '/images/products/keyring-2-1.jpg',
      '/images/products/keyring-2-2.jpg',
      '/images/products/keyring-2-3.jpg',
      '/images/products/keyring-2-4.jpg',
    ],
    accent: '#1a1a1a',
  },
];

export function getProduct(t: Dict, id: ProductId) {
  const meta = PRODUCTS.find((p) => p.id === id)!;
  const data = t.products[id];
  return { ...meta, ...data };
}
