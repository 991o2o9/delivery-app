import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCompleteOrder,
  useOrderDetails,
  usePickupOrder,
  useStartTransitOrder,
} from '../../entities/order/api/orderApi';
import { OrderStatus } from '../../shared/api/types';
import {
  cargoTypeLabelMap,
  statusColorMap,
  statusLabelMap,
  urgencyLabelMap,
} from '../../shared/utils/enumMappings';

/* ─── Icons ─────────────────────────────────────────────────────────────── */

const ArrowLeftIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
);

const NavIcon = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polygon points='3 11 22 2 13 21 11 13 3 11' />
  </svg>
);

const PhoneIcon = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
  </svg>
);

const MailIcon = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
    <polyline points='22,6 12,13 2,6' />
  </svg>
);

const UserIcon = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
);

const MessageIcon = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
  </svg>
);

/* ─── Component  */

export const ActiveOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderDetails(id);

  const pickupMutation   = usePickupOrder();
  const transitMutation  = useStartTransitOrder();
  const completeMutation = useCompleteOrder();

  /* ── Loading / Error states ── */
  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin' />
          <p className='text-xs font-semibold text-slate-400 tracking-widest uppercase'>Loading</p>
        </div>
      </div>
    );

  if (isError || !order)
    return (
      <div className='min-h-screen flex items-center justify-center p-8'>
        <p className='text-sm font-medium text-red-500'>Failed to load order. Please try again.</p>
      </div>
    );

  /* ── Action handler ── */
  const handleAction = async () => {
    try {
      if (order.status === OrderStatus.ASSIGNED) {
        await pickupMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.PICKED_UP) {
        await transitMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.IN_TRANSIT) {
        await completeMutation.mutateAsync(order.id);
        navigate('/courier');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  /* ── Button config ── */
  const getButtonConfig = () => {
    switch (order.status) {
      case OrderStatus.ASSIGNED:
        return { text: 'Confirm Pickup',     color: 'bg-slate-900 hover:bg-slate-700',       pending: pickupMutation.isPending };
      case OrderStatus.PICKED_UP:
        return { text: 'Start Transit',      color: 'bg-orange-500 hover:bg-orange-600',     pending: transitMutation.isPending };
      case OrderStatus.IN_TRANSIT:
        return { text: 'Mark as Delivered',  color: 'bg-emerald-600 hover:bg-emerald-700',   pending: completeMutation.isPending };
      case OrderStatus.DELIVERED:
        return { text: 'Order Completed',    color: 'bg-slate-300',                          disabled: true };
      default:
        return { text: 'Back to Market',     color: 'bg-slate-900 hover:bg-slate-700',       onClick: () => navigate('/courier') };
    }
  };

  const config = getButtonConfig();

  /* ── Shared label style ── */
  const label = 'text-[10px] font-black text-slate-400 uppercase tracking-widest';
  const value = 'text-sm font-black text-slate-800';

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 font-sans'>

      {/* ── Header ── */}
      <header className='bg-white border-b border-slate-100 sticky top-0 z-30'>
        <div className='max-w-5xl mx-auto px-4 h-14 flex items-center justify-between'>
          <button
            onClick={() => navigate('/courier')}
            className='flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-black tracking-tighter'
          >
            <ArrowLeftIcon />
            RETURN
          </button>

          <div className='text-center'>
            <p className='text-[10px] font-black text-slate-400 tracking-widest uppercase leading-none'>Order</p>
            <p className='text-xs font-black text-blue-600 mt-0.5'>#{order.id.substring(0, 8).toUpperCase()}</p>
          </div>

          {/* Status pill */}
          <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusColorMap[order.status]}`}>
            {statusLabelMap[order.status]}
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className='max-w-5xl mx-auto px-4 py-6 pb-32 lg:pb-10 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6'>

        {/* ══ LEFT COLUMN ══ */}
        <div className='space-y-4'>

          {/* ETA + Distance row — mobile */}
          <div className='grid grid-cols-3 gap-3 lg:hidden'>
            <MetaCard label='Distance'  value={`${order.distanceKm?.toFixed(1) ?? '0.0'} km`} />
            <MetaCard label='ETA'       value={order.estimatedArrivalTime ? dayjs(order.estimatedArrivalTime).format('HH:mm') : '--:--'} accent='orange' />
            <MetaCard label='Payout'    value={`$${order.price.toFixed(2)}`} accent='green' />
          </div>

          {/* ── Pickup card ── */}
          <RouteCard
            type='pickup'
            label='Pickup'
            address={order.pickupAddress}
            showNav={order.status === OrderStatus.ASSIGNED}
            navHref={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupLat},${order.pickupLon}`}
            comment={order.pickupComment}
          >
            {/* Contact row */}
            <div className='flex flex-wrap gap-2 mt-2'>
              <ContactChip icon={<MailIcon />} text={order.clientEmail} />
              {order.senderPhone && (
                <ContactChip icon={<PhoneIcon />} text={order.senderPhone} href={`tel:${order.senderPhone}`} />
              )}
            </div>
          </RouteCard>

          {/* ── Delivery card ── */}
          <RouteCard
            type='delivery'
            label='Delivery'
            address={order.destinationAddress}
            showNav={order.status === OrderStatus.PICKED_UP || order.status === OrderStatus.IN_TRANSIT}
            navHref={`https://www.google.com/maps/dir/?api=1&destination=${order.destLat},${order.destLon}`}
            comment={order.deliveryComment}
          >
            {(order.receiverName || order.receiverPhone) && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {order.receiverName  && <ContactChip icon={<UserIcon />}  text={order.receiverName} />}
                {order.receiverPhone && <ContactChip icon={<PhoneIcon />} text={order.receiverPhone} href={`tel:${order.receiverPhone}`} />}
              </div>
            )}
          </RouteCard>

          {/* ── Cargo details ── */}
          <div className='bg-white rounded-2xl border border-slate-100 p-5'>
            <p className={`${label} mb-4`}>Cargo Details</p>
            <div className='grid grid-cols-2 gap-y-4'>
              <div>
                <p className={label}>Type</p>
                <p className={value}>{cargoTypeLabelMap[order.cargoType]}</p>
              </div>
              <div>
                <p className={label}>Weight</p>
                <p className={value}>{order.weight} kg</p>
              </div>
              <div>
                <p className={label}>Urgency</p>
                <p className='text-sm font-black text-orange-600'>{urgencyLabelMap[order.urgency]}</p>
              </div>
              <div>
                <p className={label}>Payment</p>
                <p className={value}>{order.paymentMethod}</p>
              </div>
            </div>
            {order.description && (
              <div className='mt-4 pt-4 border-t border-slate-100'>
                <p className={`${label} mb-1`}>Description</p>
                <p className='text-sm text-slate-600 font-bold leading-relaxed'>{order.description}</p>
              </div>
            )}
          </div>

          {/* ── Mission log ── */}
          <div className='bg-white rounded-2xl border border-slate-100 p-5'>
            <p className={`${label} mb-4`}>Status Log</p>
            <div className='relative'>
              {/* vertical line */}
              <div className='absolute left-[5px] top-2 bottom-2 w-px bg-slate-100' />
              <div className='space-y-4'>
                {order.history?.map((entry, idx) => (
                  <div key={idx} className='flex items-center gap-4 relative'>
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 z-10 ${
                      idx === 0
                        ? 'border-blue-600 bg-blue-600 animate-pulse'
                        : 'border-slate-200 bg-white'
                    }`} />
                    <div className='flex-1 flex justify-between items-center'>
                      <span className={`text-[11px] font-black uppercase tracking-wide ${
                        idx === 0 ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {statusLabelMap[entry.status]}
                      </span>
                      <span className='text-[10px] text-slate-300 font-black tabular-nums'>
                        {dayjs(entry.changedAt).format('HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>        
        </div>

        {/* ══ RIGHT SIDEBAR — desktop ══ */}
        <aside className='hidden lg:flex flex-col gap-4'>

          {/* Meta cards */}
          <div className='grid grid-cols-1 gap-3'>
            <MetaCard label='Distance' value={`${order.distanceKm?.toFixed(1) ?? '0.0'} km`} large />
            <MetaCard label='Estimated Arrival' value={order.estimatedArrivalTime ? dayjs(order.estimatedArrivalTime).format('HH:mm') : '--:--'} accent='orange' large />
            <MetaCard label='Your Payout' value={`$${order.price.toFixed(2)}`} accent='green' large />
          </div>

          {/* Order summary */}
          <div className='bg-white rounded-2xl border border-slate-100 p-5'>
            <p className={`${label} mb-4`}>Order Summary</p>
            <div className='space-y-3'>
              <SummaryRow label='Order ID'  value={`#${order.id.substring(0, 8).toUpperCase()}`} mono />
              <SummaryRow label='Cargo'     value={cargoTypeLabelMap[order.cargoType]} />
              <SummaryRow label='Weight'    value={`${order.weight} kg`} />
              <SummaryRow label='Urgency'   value={urgencyLabelMap[order.urgency]} accent='orange' />
              <SummaryRow label='Payment'   value={order.paymentMethod} />
            </div>
          </div>

          {/* Desktop action button */}
          <div className='sticky top-20'>
            <ActionButton config={config} handleAction={handleAction} />
            <p className='text-center text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-wider'>
              Payout on delivery
            </p>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky action bar ── */}
      <footer className='lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-20'>
        <ActionButton config={config} handleAction={handleAction} />
      </footer>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/* Route card (pickup / delivery) */
type RouteCardProps = {
  type: 'pickup' | 'delivery';
  label: string;
  address: string;
  showNav: boolean;
  navHref: string;
  comment?: string | null;
  children?: React.ReactNode;
};

const RouteCard = ({ type, label, address, showNav, navHref, comment, children }: RouteCardProps) => {
  const accentColor = type === 'pickup' ? 'bg-emerald-500' : 'bg-blue-500';
  const labelColor  = type === 'pickup' ? 'text-emerald-600' : 'text-blue-600';
  const navStyle    = type === 'pickup'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';

  return (
    <div className='bg-white rounded-2xl border border-slate-100 overflow-hidden'>
      <div className={`h-0.5 w-full ${accentColor}`} />
      <div className='p-5'>
        <div className='flex items-start justify-between mb-2'>
          <p className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>{label}</p>
          {showNav && (
            <a
              href={navHref}
              target='_blank'
              rel='noopener noreferrer'
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-black transition-colors ${navStyle}`}
            >
              <NavIcon />
              Navigate
            </a>
          )}
        </div>
        <p className='text-sm font-semibold text-slate-800 leading-snug'>{address}</p>
        {children}
        {comment && (
          <div className='mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl'>
            <MessageIcon/>
            <p className='text-xs text-amber-800 font-medium leading-relaxed'>
              {comment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* Contact chip */
type ContactChipProps = { icon: React.ReactNode; text: string; href?: string };
const ContactChip = ({ icon, text, href }: ContactChipProps) => {
  const cls = 'inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors';
  return href
    ? <a href={href} className={cls}>{icon}{text}</a>
    : <span className={cls}>{icon}{text}</span>;
};

/* Meta card */
type MetaCardProps = { label: string; value: string; accent?: 'orange' | 'green'; large?: boolean };
const MetaCard = ({ label, value, accent, large }: MetaCardProps) => {
  const valueColor = accent === 'orange' ? 'text-orange-500' : accent === 'green' ? 'text-emerald-600' : 'text-slate-900';
  return (
    <div className='bg-white rounded-2xl border border-slate-100 p-4'>
      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>{label}</p>
      <p className={`font-bold ${large ? 'text-xl' : 'text-lg'} ${valueColor}`}>{value}</p>
    </div>
  );
};

/* Summary row */
type SummaryRowProps = { label: string; value: string; mono?: boolean; accent?: 'orange' };
const SummaryRow = ({ label, value, mono, accent }: SummaryRowProps) => (
  <div className='flex justify-between items-center'>
    <span className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>{label}</span>
    <span className={`text-xs font-black ${mono ? 'font-mono' : ''} ${accent === 'orange' ? 'text-orange-500' : 'text-slate-700'}`}>{value}</span>
  </div>
);

/* Action button */
type ActionButtonProps = { config: any; handleAction: () => void };
const ActionButton = ({ config, handleAction }: ActionButtonProps) => (
  <button
    onClick={config.onClick || handleAction}
    disabled={config.disabled || config.pending}
    className={`w-full h-14 rounded-2xl font-black text-base tracking-widest transition-all active:scale-[0.98] flex items-center justify-center text-white ${config.color} ${config.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {config.pending
      ? <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
      : config.text}
  </button>
);