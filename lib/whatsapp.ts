// Client-safe WhatsApp helpers: the business number, click-to-chat link
// builder, and reusable message templates. Contains NO secrets — it only
// reads the public NEXT_PUBLIC_WHATSAPP_NUMBER — so it is safe to import in
// both client components and server code. The actual Cloud API sender (which
// uses a private token) lives in lib/whatsappServer.ts.

// Business WhatsApp number in international format, digits only.
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918851911653'
).replace(/[^0-9]/g, '');

/**
 * Build a wa.me click-to-chat link, optionally pre-filled with a message.
 * Pass a specific number to message a customer; omit it to reach the store.
 */
export function whatsappLink(message?: string, number?: string): string {
  const digits = (number || WHATSAPP_NUMBER).replace(/[^0-9]/g, '') || WHATSAPP_NUMBER;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Pre-written order-status update an admin can send to a customer. */
export function orderUpdateMessage(order: {
  id: string;
  customer: string;
  status: string;
}): string {
  return (
    `Namaste ${order.customer}, this is Om Gauri Putra. ` +
    `Your order ${order.id} is now "${order.status}". ` +
    `Thank you for shopping with us!`
  );
}

/** Opening reply to a new lead/enquiry. */
export function leadReplyMessage(name: string): string {
  const first = (name || '').trim().split(/\s+/)[0] || 'there';
  return (
    `Namaste ${first}, thank you for reaching out to Om Gauri Putra. ` +
    `How may we help you today?`
  );
}
