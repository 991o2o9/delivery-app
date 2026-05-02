import { OrderStatus, CargoType, Urgency } from '../api/types';

export const statusLabelMap: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'Created',
  [OrderStatus.ASSIGNED]: 'Assigned',
  [OrderStatus.PICKED_UP]: 'Picked Up',
  [OrderStatus.IN_TRANSIT]: 'In Transit',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export const statusColorMap: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.PICKED_UP]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.IN_TRANSIT]: 'bg-orange-100 text-orange-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export const cargoTypeLabelMap: Record<CargoType, string> = {
  [CargoType.FOOD]: '🍱 Food',
  [CargoType.DOCUMENT]: '📄 Document',
  [CargoType.PARCEL]: '📦 Parcel',
};

export const urgencyLabelMap: Record<Urgency, string> = {
  [Urgency.STANDARD]: '⚡ Standard',
  [Urgency.EXPRESS]: '🚀 Express',
};
