import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import { CargoType, Urgency, PaymentMethod, OrderRequestDto } from '../../../shared/api/types';
import { MapPicker } from '../../../shared/ui/MapPicker';
import { useCreateOrder } from '../../../entities/order/api/orderApi';

const orderSchema = z.object({
  pickupAddress: z.string().min(5, 'Address is too short'),
  pickupLat: z.number(),
  pickupLon: z.number(),
  destinationAddress: z.string().min(5, 'Address is too short'),
  destLat: z.number(),
  destLon: z.number(),
  cargoType: z.nativeEnum(CargoType),
  weight: z.number().min(0.1, 'Weight must be at least 0.1kg'),
  description: z.string().min(5, 'Please describe the cargo'),
  senderPhone: z.string().min(10, 'Invalid phone number'),
  receiverName: z.string().min(2, 'Receiver name is required'),
  receiverPhone: z.string().min(10, 'Invalid phone number'),
  urgency: z.nativeEnum(Urgency),
  paymentMethod: z.nativeEnum(PaymentMethod),
  pickupComment: z.string().optional(),
  deliveryComment: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BISHKEK_CENTER = { lat: 42.8746, lng: 74.5698 };
const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  let val = value.replace(/[^\d+]/g, '');
  
  if (val.length > 0 && !val.startsWith('+')) {
    val = '+' + val;
  }

  if (val.startsWith('+996')) {
    const digits = val.replace(/\D/g, '').substring(3, 12);
    let res = '+996';
    if (digits.length > 0) res += ` (${digits.substring(0, 3)}`;
    if (digits.length >= 4) res += `) ${digits.substring(3, 6)}`;
    if (digits.length >= 7) res += `-${digits.substring(6, 9)}`;
    return res;
  }

  if (val.startsWith('+7')) {
    const digits = val.replace(/\D/g, '').substring(1, 11);
    let res = '+7';
    if (digits.length > 0) res += ` (${digits.substring(0, 3)}`;
    if (digits.length >= 4) res += `) ${digits.substring(3, 6)}`;
    if (digits.length >= 7) res += `-${digits.substring(6, 8)}`;
    if (digits.length >= 9) res += `-${digits.substring(8, 10)}`;
    return res;
  }

  return val;
};

export const OrderForm = ({ onSuccess, onCancel }: OrderFormProps) => {
  const createOrder = useCreateOrder();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destAutocomplete, setDestAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      cargoType: CargoType.PARCEL,
      weight: 1.0,
      urgency: Urgency.STANDARD,
      paymentMethod: PaymentMethod.CASH,
      pickupLat: BISHKEK_CENTER.lat,
      pickupLon: BISHKEK_CENTER.lng,
      destLat: BISHKEK_CENTER.lat,
      destLon: BISHKEK_CENTER.lng,
      pickupAddress: '',
      destinationAddress: '',
      description: '',
      senderPhone: '',
      receiverName: '',
      receiverPhone: '',
      pickupComment: '',
      deliveryComment: '',
    },
  });

  const pickupLat = watch('pickupLat');
  const pickupLon = watch('pickupLon');
  const destLat = watch('destLat');
  const destLon = watch('destLon');

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setValue('pickupLat', lat);
        setValue('pickupLon', lng);
        setValue('pickupAddress', place.formatted_address || '');
      }
    }
  };

  const onDestPlaceChanged = () => {
    if (destAutocomplete !== null) {
      const place = destAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setValue('destLat', lat);
        setValue('destLon', lng);
        setValue('destinationAddress', place.formatted_address || '');
      }
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      await createOrder.mutateAsync(data as OrderRequestDto);
      onSuccess();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold animate-pulse">Loading Map Services...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">CREATE NEW SHIPMENT</h2>
        <p className="text-gray-500 text-sm">Fill in the details below to start your delivery mission.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECTION 1: ROUTE */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold">1</div>
            <h3 className="font-black uppercase tracking-wider text-sm">Route & Map</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Pickup Address</label>
              <Autocomplete
                onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
                onPlaceChanged={onPickupPlaceChanged}
                options={{ componentRestrictions: { country: "kg" } }}
              >
                <input
                  type="text"
                  {...register('pickupAddress')}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter pickup point"
                />
              </Autocomplete>
              {errors.pickupAddress && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.pickupAddress.message}</p>}
            </div>

            <div className="h-[200px] rounded-xl overflow-hidden border border-gray-100">
              <MapPicker 
                center={{ lat: pickupLat, lng: pickupLon }}
                onLocationSelect={(lat, lng, address) => {
                  setValue('pickupLat', lat);
                  setValue('pickupLon', lng);
                  if (address) setValue('pickupAddress', address);
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Destination Address</label>
              <Autocomplete
                onLoad={(autocomplete) => setDestAutocomplete(autocomplete)}
                onPlaceChanged={onDestPlaceChanged}
                options={{ componentRestrictions: { country: "kg" } }}
              >
                <input
                  type="text"
                  {...register('destinationAddress')}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Where to deliver?"
                />
              </Autocomplete>
              {errors.destinationAddress && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.destinationAddress.message}</p>}
            </div>

            <div className="h-[200px] rounded-xl overflow-hidden border border-gray-100">
              <MapPicker 
                center={{ lat: destLat, lng: destLon }}
                onLocationSelect={(lat, lng, address) => {
                  setValue('destLat', lat);
                  setValue('destLon', lng);
                  if (address) setValue('destinationAddress', address);
                }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 & 3 & 4: RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* SECTION 2: PARCEL */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-orange-600">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center font-bold">2</div>
              <h3 className="font-black uppercase tracking-wider text-sm">Parcel Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cargo Type</label>
                <select
                  {...register('cargoType')}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={CargoType.FOOD}>🍱 Food</option>
                  <option value={CargoType.DOCUMENT}>📄 Document</option>
                  <option value={CargoType.PARCEL}>📦 Parcel</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Short Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are we delivering?"
              />
              {errors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.description.message}</p>}
            </div>
          </div>

          {/* SECTION 3: CONTACTS */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center font-bold">3</div>
              <h3 className="font-black uppercase tracking-wider text-sm">Contact Information</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Your Phone (Sender)</label>
                <input
                  type="tel"
                  {...register('senderPhone', {
                    onChange: (e) => {
                      e.target.value = formatPhoneNumber(e.target.value);
                    }
                  })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="+996 (___) ___-___"
                />
                {errors.senderPhone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.senderPhone.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Receiver Name</label>
                  <input
                    type="text"
                    {...register('receiverName')}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    placeholder="John Doe"
                  />
                  {errors.receiverName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.receiverName.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Receiver Phone</label>
                  <input
                    type="tel"
                    {...register('receiverPhone', {
                      onChange: (e) => {
                        e.target.value = formatPhoneNumber(e.target.value);
                      }
                    })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+996 (___) ___-___"
                  />
                  {errors.receiverPhone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.receiverPhone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: LOGISTICS */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-purple-600">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center font-bold">4</div>
              <h3 className="font-black uppercase tracking-wider text-sm">Logistics & Comments</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Urgency</label>
                <div className="flex space-x-2">
                  <label className="flex-1 text-center py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer has-[:checked]:bg-blue-600 has-[:checked]:text-white transition-all">
                    <input type="radio" value={Urgency.STANDARD} {...register('urgency')} className="hidden" />
                    <span className="text-xs font-bold">Standard</span>
                  </label>
                  <label className="flex-1 text-center py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer has-[:checked]:bg-blue-600 has-[:checked]:text-white transition-all">
                    <input type="radio" value={Urgency.EXPRESS} {...register('urgency')} className="hidden" />
                    <span className="text-xs font-bold">Express</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Payment</label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value={PaymentMethod.CASH}>💵 Cash</option>
                  <option value={PaymentMethod.CARD}>💳 Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Pickup Comment</label>
                <textarea
                  {...register('pickupComment')}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                  placeholder="E.g. Door code 123"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Delivery Comment</label>
                <textarea
                  {...register('deliveryComment')}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                  placeholder="E.g. Leave at reception"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createOrder.isPending}
          className="px-12 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black disabled:bg-gray-300 shadow-xl shadow-gray-200 transition-all active:scale-95"
        >
          {createOrder.isPending ? 'PROCESSING...' : 'START DELIVERY'}
        </button>
      </div>
    </form>
  );
};
