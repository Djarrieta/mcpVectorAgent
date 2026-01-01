// Manejo de disponibilidad de moldes/productos
export interface ProductAvailability {
  sku: string;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  estimatedRestockDate?: Date; // Para casos como el iPhone 15
}

// Para manejar el caso de Paola y Andres (mismo celular, distintos nombres)
export interface ContactProfile {
  phoneNumber: string;
  associatedNames: string[]; // ['Yeny Paola Rueda Rojas', 'Andres Felipe Samaniego']
  defaultEmail: string;
  orderHistoryIds: string[];
}

export interface ShippingZone {
  city: string;
  department: string;
  baseCost: number; // Bogotá: 12500
  isRemoteArea: boolean; // Para los 10 días de entrega
}

// Actualizamos la interfaz de Producto para incluir el tema/diseño
export interface OrderItem {
  id: string;
  designTheme: string; // Ej: "Barcelona", "Dragon Ball"
  price: number;
}
export interface Order {
  customerName: string;
  device: string; // Ej: "iPhone 13 Pro Max", "Samsung Galaxy S21"
  designTheme: string; // Ej: "Barcelona", "Dragon Ball", "Nacional"
  price: number; // Precio base en COP
  shippingCost: number; // Costo de envío en COP
  totalCost: number; // price + shippingCost
  shippingZone: ShippingZone;
  estimatedDeliveryDays: number; // 3-5 para áreas normales, 10 para áreas remotas
}