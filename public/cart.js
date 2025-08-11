// Simple cart using localStorage
const CART_KEY = '905_cart';

export function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{ return []; } }
export function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }
export function addToCart(item){ 
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === item.id);
  if (idx >= 0){ cart[idx].qty += item.qty || 1; }
  else { cart.push({...item, qty: item.qty || 1}); }
  saveCart(cart);
}
export function updateQty(id, qty){
  const cart = getCart().map(i => i.id===id ? {...i, qty: Math.max(1, qty)} : i);
  saveCart(cart);
}
export function removeFromCart(id){
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}
export function clearCart(){ saveCart([]); }

export const DELIVERY_FEE = 50;

export function subtotal(items){ return items.reduce((s,i)=> s + i.price*i.qty, 0); }
export function total(items, wantDelivery){ return subtotal(items) + (wantDelivery?DELIVERY_FEE:0); }
