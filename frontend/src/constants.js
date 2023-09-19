export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '';
export const PRODUCTS_URL ='/api/products';
export const USERS_URL ='/api/users';
export const ORDERS_URL ='/api/orders';
export const STRIPE_URL ='/api/orders/config/stripe';