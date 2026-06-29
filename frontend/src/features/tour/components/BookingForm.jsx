import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store';
import { bookingService } from '@/services/tourService';
import SuccessModal from '@/components/ui/SuccessModal';
import { Loader2, Calendar, Users, Minus, Plus, MapPin, Settings, Check, ChevronDown, Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from '@/components/ui';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ─── Helper: tách thông tin departure ───────────────────────────────────────
const parseDeparture = (d, t) => {
    const date = new Date(d.departure_date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });

    const seats = d.available_seats;
    const seatBadge =
        seats === 0
            ? { label: t('booking.soldOut'), variant: 'danger' }
            : seats <= 5
            ? { label: t('booking.seatsLeft', { count: seats }), variant: 'warning' }
            : { label: t('booking.seatsLeft', { count: seats }), variant: 'success' };

    return { day, month, year, weekday, seatBadge, disabled: seats === 0 };
};

const BADGE_CLASS = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger:  'bg-red-50   text-red-500',
};

// ─── DepartureSelect ─────────────────────────────────────────────────────────
const DepartureSelect = ({ departures, value, onChange, placeholder, t }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Đóng khi click ngoài
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = departures.find(d => String(d.id) === String(value));
    const parsed = selected ? parseDeparture(selected, t) : null;

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`
                    w-full flex items-center justify-between gap-3
                    px-3 py-2.5 rounded-xl border bg-white text-left
                    transition-all duration-150
                    ${open ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-primary/50'}
                `}
            >
                {parsed ? (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Khối ngày */}
                        <div className="text-center shrink-0 w-9">
                            <div className="text-base font-semibold text-text leading-none">{parsed.day}</div>
                            <div className="text-[11px] text-text-muted mt-0.5">Th{parsed.month}</div>
                        </div>
                        {/* Divider */}
                        <div className="w-px h-7 bg-border shrink-0" />
                        {/* Thứ + năm */}
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-text truncate">{parsed.weekday}</div>
                            <div className="text-xs text-text-muted">{parsed.year}</div>
                        </div>
                        {/* Badge */}
                        <span className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${BADGE_CLASS[parsed.seatBadge.variant]}`}>
                            {parsed.seatBadge.label}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-text-muted">{placeholder}</span>
                )}
                <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <ul className="absolute z-50 mt-1.5 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden py-1 max-h-64 overflow-y-auto">
                    {departures.length === 0 && (
                        <li className="px-4 py-3 text-sm text-text-muted text-center">{t('booking.noDepartureList')}</li>
                    )}
                    {departures.map(d => {
                        const p = parseDeparture(d, t);
                        const isSelected = String(d.id) === String(value);

                        return (
                            <li
                                key={d.id}
                                onClick={() => {
                                    if (!p.disabled) { onChange(String(d.id)); setOpen(false); }
                                }}
                                className={`
                                    flex items-center justify-between gap-3 px-3 py-3 cursor-pointer
                                    transition-colors duration-100
                                    ${p.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-alt'}
                                    ${isSelected ? 'bg-primary/5' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Khối ngày */}
                                    <div className="text-center shrink-0 w-9 flex flex-col items-center justify-center">
                                        <div className="text-base font-semibold text-text leading-none">{p.day}</div>
                                        <div className="text-[11px] text-text-muted mt-0.5">Th{p.month}</div>
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px self-stretch bg-border shrink-0" />
                                    {/* Thứ + năm */}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-text">{p.weekday}</div>
                                        <div className="text-xs text-text-muted">{p.year}</div>
                                    </div>
                                </div>
                                {/* Badge + checkmark */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${BADGE_CLASS[p.seatBadge.variant]}`}>
                                        {p.seatBadge.label}
                                    </span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// ─── PassengerCounter ─────────────────────────────────────────────────────────
const PassengerCounter = ({ label, ageDesc, count, onChange, min = 0, max = 99, price }) => (
    <div className="flex items-center justify-between py-2.5">
        <div>
            <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-text">{label}</p>
                {price > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {formatPrice(price)}
                    </span>
                )}
            </div>
            <p className="text-xs text-text-muted">{ageDesc}</p>
        </div>
        <div className="flex items-center gap-2.5">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, count - 1))}
                disabled={count <= min}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-alt hover:border-primary/50 transition-all disabled:opacity-30 disabled:hover:border-border"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-text">{count}</span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, count + 1))}
                disabled={count >= max}
                className="w-8 h-8 rounded-full bg-primary/5 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);

// ─── CustomCheckbox ───────────────────────────────────────────────────────────
const CustomCheckbox = ({ checked, onChange, label, className = '' }) => (
    <label className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}>
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                className="absolute opacity-0 w-0 h-0"
                checked={checked}
                onChange={onChange}
            />
            <div className={`
                w-5 h-5 rounded flex items-center justify-center border transition-all duration-200 ease-in-out
                ${checked
                    ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(var(--color-primary),0.2)]'
                    : 'bg-surface-alt border-border text-transparent group-hover:border-primary/50'
                }
            `}>
                <Check className={`w-3.5 h-3.5 transition-transform duration-200 ${checked ? 'scale-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
            </div>
        </div>
        {label && (
            <span className={`text-sm transition-colors ${checked ? 'text-text font-medium' : 'text-text group-hover:text-text-secondary'}`}>
                {label}
            </span>
        )}
    </label>
);

// ─── BookingForm ──────────────────────────────────────────────────────────────
const BookingForm = ({ tour }) => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ open: false, code: '', amount: 0 });

    const [selectedDepartureId, setSelectedDepartureId] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [selectedPickupId, setSelectedPickupId] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({});

    const { register, handleSubmit, reset } = useForm({ defaultValues: { customer_note: '' } });

    const departures = (tour.departures || []).filter(d => d.status === 'open');
    const pickupLocations = tour.pickupLocations || [];
    const tourOptions = tour.options || [];

    const pickupOptions = useMemo(() => pickupLocations.map(p => ({
        value: String(p.id),
        label: `${p.location_name}${p.pickup_time ? ` · ${p.pickup_time}` : ''}${parseFloat(p.surcharge_amount) > 0 ? ` · +${formatPrice(p.surcharge_amount)}${t('booking.perPerson')}` : ''}`
    })), [pickupLocations, t]);

    const selectedDeparture = useMemo(
        () => departures.find(d => String(d.id) === String(selectedDepartureId)),
        [departures, selectedDepartureId],
    );

    const maxSeats = selectedDeparture?.available_seats || 99;
    const adultPrice = selectedDeparture ? parseFloat(selectedDeparture.price_adult) : 0;
    const childPrice = selectedDeparture ? parseFloat(selectedDeparture.price_child || 0) : 0;
    const infantPrice = selectedDeparture ? parseFloat(selectedDeparture.price_infant || 0) : 0;

    const selectedPickup = pickupLocations.find(p => String(p.id) === String(selectedPickupId));
    const pickupSurcharge = selectedPickup ? parseFloat(selectedPickup.surcharge_amount || 0) : 0;

    const totalPassengers = adults + children + infants;

    const optionsTotal = useMemo(() => {
        let total = 0;
        tourOptions.forEach(opt => {
            const sel = selectedOptions[opt.id];
            if (!sel?.selected) return;
            const price = parseFloat(opt.price || 0);
            if (opt.charge_type === 'per_person') total += price * totalPassengers;
            else if (opt.charge_type === 'per_booking') total += price;
            else total += price * (sel.quantity || 1);
        });
        return total;
    }, [tourOptions, selectedOptions, totalPassengers]);

    const totalPrice = useMemo(() => {
        if (!selectedDeparture) return 0;
        const base = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
        return base + (pickupSurcharge * totalPassengers) + optionsTotal;
    }, [adults, children, infants, adultPrice, childPrice, infantPrice, pickupSurcharge, totalPassengers, optionsTotal, selectedDeparture]);

    const toggleOption = (optionId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: { selected: !prev[optionId]?.selected, quantity: prev[optionId]?.quantity || 1 },
        }));
    };

    const setOptionQuantity = (optionId, qty) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: { ...prev[optionId], quantity: Math.max(1, qty) },
        }));
    };

    const onSubmit = async (data) => {
        if (!selectedDepartureId) { toast.error(t('booking.errSelectDeparture')); return; }
        if (!selectedPickupId)    { toast.error(t('booking.errSelectPickup'));       return; }
        if (!user)                { toast.error(t('booking.errLoginRequired')); return; }

        setSubmitting(true);
        try {
            const optionsPayload = [];
            tourOptions.forEach(opt => {
                const sel = selectedOptions[opt.id];
                if (sel?.selected) optionsPayload.push({
                    option_id: opt.id,
                    quantity: opt.charge_type === 'quantity' ? (sel.quantity || 1) : 1,
                });
            });

            const payload = {
                tour_id: tour.id,
                departure_id: parseInt(selectedDepartureId),
                pickup_location_id: selectedPickupId ? parseInt(selectedPickupId) : null,
                customer_name: user.full_name || user.username || 'Khách hàng',
                customer_phone: user.phone_number || '0000000000',
                customer_email: user.email || 'email@example.com',
                adult_qty: adults,
                child_qty: children,
                infant_qty: infants,
                customer_note: data.customer_note || null,
                selected_options: optionsPayload,
            };

            const res = await bookingService.create(payload);
            setModal({ open: true, code: res.data.data.bookingCode, amount: totalPrice });
            reset();
            setAdults(1); setChildren(0); setInfants(0);
            setSelectedDepartureId(''); setSelectedPickupId(''); setSelectedOptions({});
        } catch (err) {
            toast.error(err.response?.data?.message || t('booking.errGeneric'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setModal({ open: false, code: '', amount: 0 });
        navigate('/history');
    };

    return (
        <>
            <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-5">
                <h3 className="text-lg font-bold text-text mb-1">{t('booking.bookNow')}</h3>
                {departures.length > 0 ? (
                    <p className="text-sm text-text-muted mb-5">
                        {t('booking.priceFrom')}{' '}
                        <span className="font-bold text-primary">
                            {formatPrice(Math.min(...departures.map(d => parseFloat(d.price_adult))))}
                        </span>
                        {t('booking.perAdult')}
                    </p>
                ) : (
                    <p className="text-sm text-warning mb-5">{t('booking.noDepartures')}</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* ═══ BƯỚC 1: CHỌN NGÀY KHỞI HÀNH ═══ */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            {t('booking.departureDate')} <span className="text-error">*</span>
                        </label>
                        <DepartureSelect
                            departures={departures}
                            value={selectedDepartureId}
                            t={t}
                            placeholder={t('booking.selectDeparture')}
                            onChange={(val) => {
                                setSelectedDepartureId(val);
                                setAdults(1); setChildren(0); setInfants(0);
                            }}
                        />
                    </div>

                    {/* ═══ BƯỚC 2: HÀNH KHÁCH ═══ */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
                            <Users className="w-3.5 h-3.5 text-text-muted" />
                            {t('booking.passengers')}
                        </label>
                        <div className="bg-surface-alt rounded-xl border border-border p-3 divide-y divide-border">
                            <PassengerCounter label={t('booking.adult')} ageDesc={t('booking.adultAge')} count={adults} onChange={setAdults} min={1} max={maxSeats} price={adultPrice} />
                            <PassengerCounter label={t('booking.child')} ageDesc={t('booking.childAge')} count={children} onChange={setChildren} max={Math.max(0, maxSeats - adults)} price={childPrice} />
                            <PassengerCounter label={t('booking.infant')} ageDesc={t('booking.infantAge')} count={infants} onChange={setInfants} max={Math.max(0, maxSeats - adults - children)} price={infantPrice} />
                        </div>
                        <p className="text-xs text-text-muted mt-1.5 text-right">
                            <span className="font-semibold text-text">{t('booking.totalPassengers', { count: totalPassengers })}</span>
                            {selectedDeparture?.available_seats > 0 && (
                                <span className="text-text-muted"> / {selectedDeparture.available_seats} {t('booking.seats')}</span>
                            )}
                        </p>
                    </div>

                    {/* ═══ BƯỚC 3: ĐIỂM ĐÓN ═══ */}
                    {pickupLocations.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                                {t('booking.pickupPoint')} <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={selectedPickupId}
                                onChange={val => setSelectedPickupId(val)}
                                options={pickupOptions}
                                placeholder={t('booking.selectPickup')}
                            />
                        </div>
                    )}

                    {/* ═══ BƯỚC 4: TÙY CHỌN THÊM ═══ */}
                    {tourOptions.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
                                <Settings className="w-3.5 h-3.5 text-text-muted" />
                                {t('booking.extraServices')}
                            </label>
                            <div className="bg-surface-alt rounded-xl border border-border divide-y divide-border">
                                {tourOptions.map(opt => {
                                    const sel = selectedOptions[opt.id];
                                    const isSelected = sel?.selected;
                                    const chargeLabel = opt.charge_type === 'per_person' ? t('booking.perPerson')
                                        : opt.charge_type === 'per_booking' ? t('booking.perBooking') : '';
                                    return (
                                        <div key={opt.id} className="px-3 py-2.5">
                                            <div className="flex items-center justify-between">
                                                <CustomCheckbox
                                                    className="flex-1"
                                                    checked={isSelected || false}
                                                    onChange={() => toggleOption(opt.id)}
                                                    label={opt.option_name}
                                                />
                                                <span className="text-sm font-medium text-primary">
                                                    +{formatPrice(opt.price)}{chargeLabel}
                                                </span>
                                            </div>
                                            {isSelected && opt.charge_type === 'quantity' && (
                                                <div className="flex items-center gap-2 ml-6 mt-1.5">
                                                    <span className="text-xs text-text-muted">{t('booking.quantity')}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button type="button" onClick={() => setOptionQuantity(opt.id, (sel?.quantity || 1) - 1)}
                                                            className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-surface-hover text-xs">-</button>
                                                        <span className="w-6 text-center text-sm font-medium">{sel?.quantity || 1}</span>
                                                        <button type="button" onClick={() => setOptionQuantity(opt.id, (sel?.quantity || 1) + 1)}
                                                            className="w-6 h-6 rounded border border-primary text-primary flex items-center justify-center hover:bg-primary/5 text-xs">+</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ═══ CHI TIẾT GIÁ ═══ */}
                    {selectedDeparture && (
                        <div className="pt-3 border-t border-border space-y-1.5">
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>{t('booking.adultPrice', { count: adults, price: formatPrice(adultPrice) })}</span>
                                <span className="font-medium">{formatPrice(adults * adultPrice)}</span>
                            </div>
                            {children > 0 && childPrice > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{t('booking.childPrice', { count: children, price: formatPrice(childPrice) })}</span>
                                    <span className="font-medium">{formatPrice(children * childPrice)}</span>
                                </div>
                            )}
                            {infants > 0 && infantPrice > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{t('booking.infantPrice', { count: infants, price: formatPrice(infantPrice) })}</span>
                                    <span className="font-medium">{formatPrice(infants * infantPrice)}</span>
                                </div>
                            )}
                            {pickupSurcharge > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{t('booking.pickupSurcharge', { count: totalPassengers })}</span>
                                    <span className="font-medium">{formatPrice(pickupSurcharge * totalPassengers)}</span>
                                </div>
                            )}
                            {optionsTotal > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{t('booking.extraServiceTotal')}</span>
                                    <span className="font-medium">{formatPrice(optionsTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
                                <span>{t('booking.total')}</span>
                                <span className="text-lg">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />{t('booking.processing')}</>
                        ) : (
                            t('booking.submitBooking')
                        )}
                    </button>
                </form>
            </div>

            <SuccessModal
                isOpen={modal.open}
                onClose={handleCloseModal}
                title={t('booking.successTitle')}
                message={t('booking.successMessage')}
                bookingCode={modal.code}
                totalAmount={modal.amount}
            />
        </>
    );
};

export default BookingForm;