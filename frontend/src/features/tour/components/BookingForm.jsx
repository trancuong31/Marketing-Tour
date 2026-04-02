import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store';
import { bookingService } from '@/services/tourService';
import SuccessModal from '@/components/ui/SuccessModal';
import { User, Phone, Mail, FileText, Loader2, Calendar, Users, Minus, Plus, MapPin, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const PassengerCounter = ({ label, ageDesc, count, onChange, min = 0, max = 99 }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-medium text-text">{label}</p>
            <p className="text-xs text-text-muted">{ageDesc}</p>
        </div>
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, count - 1))}
                disabled={count <= min}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-alt transition disabled:opacity-30"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-semibold text-text">{count}</span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, count + 1))}
                disabled={count >= max}
                className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition disabled:opacity-30"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);

const BookingForm = ({ tour }) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ open: false, code: '', amount: 0 });

    // Booking selections
    const [selectedDepartureId, setSelectedDepartureId] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [selectedPickupId, setSelectedPickupId] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({}); // { optionId: { selected: bool, quantity: number } }

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        defaultValues: {
            customer_note: '',
        },
    });

    // Data
    const departures = (tour.departures || []).filter(d => d.status === 'open');
    const pickupLocations = tour.pickupLocations || [];
    const tourOptions = tour.options || [];

    // Departure đã chọn
    const selectedDeparture = useMemo(
        () => departures.find(d => String(d.id) === String(selectedDepartureId)),
        [departures, selectedDepartureId],
    );

    // Max passengers từ available_seats
    const maxSeats = selectedDeparture?.available_seats || 99;

    // Giá từ departure
    const adultPrice = selectedDeparture ? parseFloat(selectedDeparture.price_adult) : 0;
    const childPrice = selectedDeparture ? parseFloat(selectedDeparture.price_child || 0) : 0;
    const infantPrice = selectedDeparture ? parseFloat(selectedDeparture.price_infant || 0) : 0;

    // Pickup surcharge
    const selectedPickup = pickupLocations.find(p => String(p.id) === String(selectedPickupId));
    const pickupSurcharge = selectedPickup ? parseFloat(selectedPickup.surcharge_amount || 0) : 0;

    const totalPassengers = adults + children + infants;

    // Options total
    const optionsTotal = useMemo(() => {
        let total = 0;
        tourOptions.forEach(opt => {
            const sel = selectedOptions[opt.id];
            if (!sel?.selected) return;
            const price = parseFloat(opt.price || 0);
            if (opt.charge_type === 'per_person') {
                total += price * totalPassengers;
            } else if (opt.charge_type === 'per_booking') {
                total += price;
            } else {
                total += price * (sel.quantity || 1);
            }
        });
        return total;
    }, [tourOptions, selectedOptions, totalPassengers]);

    // Real-time calculation
    const totalPrice = useMemo(() => {
        if (!selectedDeparture) return 0;
        const base = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
        const pickup = pickupSurcharge * totalPassengers;
        return base + pickup + optionsTotal;
    }, [adults, children, infants, adultPrice, childPrice, infantPrice, pickupSurcharge, totalPassengers, optionsTotal, selectedDeparture]);

    const toggleOption = (optionId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: {
                selected: !prev[optionId]?.selected,
                quantity: prev[optionId]?.quantity || 1,
            },
        }));
    };

    const setOptionQuantity = (optionId, qty) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: { ...prev[optionId], quantity: Math.max(1, qty) },
        }));
    };

    const onSubmit = async (data) => {
        if (!selectedDepartureId) {
            alert('Vui lòng chọn ngày khởi hành');
            return;
        }

        if (!user) {
            alert('Vui lòng đăng nhập để đặt tour');
            return;
        }

        setSubmitting(true);
        try {
            // Build options payload
            const optionsPayload = [];
            tourOptions.forEach(opt => {
                const sel = selectedOptions[opt.id];
                if (sel?.selected) {
                    optionsPayload.push({
                        option_id: opt.id,
                        quantity: opt.charge_type === 'quantity' ? (sel.quantity || 1) : 1,
                    });
                }
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
            setAdults(1);
            setChildren(0);
            setInfants(0);
            setSelectedDepartureId('');
            setSelectedPickupId('');
            setSelectedOptions({});
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            alert(msg);
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
                <h3 className="text-lg font-bold text-text mb-1">Đặt Tour Ngay</h3>
                {departures.length > 0 ? (
                    <p className="text-sm text-text-muted mb-5">
                        Giá từ <span className="font-bold text-primary">
                            {formatPrice(Math.min(...departures.map(d => parseFloat(d.price_adult))))}
                        </span>/người lớn
                    </p>
                ) : (
                    <p className="text-sm text-warning mb-5">Chưa có lịch khởi hành</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* ═══ BƯỚC 1: CHỌN NGÀY KHỞI HÀNH ═══ */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            Ngày khởi hành <span className="text-error">*</span>
                        </label>
                        <select
                            value={selectedDepartureId}
                            onChange={e => {
                                setSelectedDepartureId(e.target.value);
                                // Reset passengers khi đổi departure
                                setAdults(1);
                                setChildren(0);
                                setInfants(0);
                            }}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            required
                        >
                            <option value="">— Chọn ngày khởi hành —</option>
                            {departures.map(d => (
                                <option key={d.id} value={d.id}>
                                    {new Date(d.departure_date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    {' · '}
                                    {formatPrice(d.price_adult)}/người lớn
                                    {d.available_seats > 0 ? ` · Còn ${d.available_seats} chỗ` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hiện giá theo departure đã chọn */}
                    {selectedDeparture && (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-primary/5 px-3 py-2 border-b border-border">
                                <p className="text-xs font-bold text-primary">Giá ngày {new Date(selectedDeparture.departure_date).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="divide-y divide-border text-sm">
                                <div className="flex justify-between px-3 py-2">
                                    <span className="text-text-secondary">Người lớn</span>
                                    <span className="font-semibold text-primary">{formatPrice(adultPrice)}</span>
                                </div>
                                {childPrice > 0 && (
                                    <div className="flex justify-between px-3 py-2">
                                        <span className="text-text-secondary">Trẻ em</span>
                                        <span className="font-semibold text-primary">{formatPrice(childPrice)}</span>
                                    </div>
                                )}
                                {infantPrice > 0 && (
                                    <div className="flex justify-between px-3 py-2">
                                        <span className="text-text-secondary">Em bé</span>
                                        <span className="font-semibold text-primary">{formatPrice(infantPrice)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ BƯỚC 2: HÀNH KHÁCH ═══ */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
                            <Users className="w-3.5 h-3.5 text-text-muted" />
                            Hành khách
                        </label>
                        <div className="bg-surface-alt rounded-xl border border-border p-3 divide-y divide-border">
                            <PassengerCounter
                                label="Người lớn"
                                ageDesc="Trên 10 tuổi"
                                count={adults}
                                onChange={setAdults}
                                min={1}
                                max={maxSeats}
                            />
                            <PassengerCounter
                                label="Trẻ em"
                                ageDesc="Từ 2 – 10 tuổi"
                                count={children}
                                onChange={setChildren}
                                max={Math.max(0, maxSeats - adults)}
                            />
                            <PassengerCounter
                                label="Trẻ nhỏ"
                                ageDesc="Dưới 2 tuổi"
                                count={infants}
                                onChange={setInfants}
                                max={Math.max(0, maxSeats - adults - children)}
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-1.5 text-right">
                            Tổng: <span className="font-semibold text-text">{totalPassengers}</span> hành khách
                            {selectedDeparture?.available_seats > 0 && (
                                <span className="text-text-muted"> / {selectedDeparture.available_seats} chỗ</span>
                            )}
                        </p>
                    </div>

                    {/* ═══ BƯỚC 3: ĐIỂM ĐÓN ═══ */}
                    {pickupLocations.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                                Điểm đón
                            </label>
                            <select
                                value={selectedPickupId}
                                onChange={e => setSelectedPickupId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            >
                                <option value="">— Không chọn điểm đón —</option>
                                {pickupLocations.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.location_name}
                                        {p.pickup_time ? ` · ${p.pickup_time}` : ''}
                                        {parseFloat(p.surcharge_amount) > 0 ? ` · +${formatPrice(p.surcharge_amount)}/người` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ═══ BƯỚC 4: TÙY CHỌN THÊM ═══ */}
                    {tourOptions.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
                                <Settings className="w-3.5 h-3.5 text-text-muted" />
                                Dịch vụ thêm
                            </label>
                            <div className="bg-surface-alt rounded-xl border border-border divide-y divide-border">
                                {tourOptions.map(opt => {
                                    const sel = selectedOptions[opt.id];
                                    const isSelected = sel?.selected;
                                    const chargeLabel = opt.charge_type === 'per_person' ? '/người'
                                        : opt.charge_type === 'per_booking' ? '/đơn'
                                        : '';

                                    return (
                                        <div key={opt.id} className="px-3 py-2.5">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected || false}
                                                        onChange={() => toggleOption(opt.id)}
                                                        className="w-4 h-4 rounded border-border text-primary accent-primary"
                                                    />
                                                    <span className="text-sm text-text">{opt.option_name}</span>
                                                </label>
                                                <span className="text-sm font-medium text-primary">
                                                    +{formatPrice(opt.price)}{chargeLabel}
                                                </span>
                                            </div>
                                            {/* Quantity input for type='quantity' */}
                                            {isSelected && opt.charge_type === 'quantity' && (
                                                <div className="flex items-center gap-2 ml-6 mt-1.5">
                                                    <span className="text-xs text-text-muted">Số lượng:</span>
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

                    {/* ═══ CHI TIẾT GIÁ (Real-time) ═══ */}
                    {selectedDeparture && (
                        <div className="pt-3 border-t border-border space-y-1.5">
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>{adults} Người lớn × {formatPrice(adultPrice)}</span>
                                <span className="font-medium">{formatPrice(adults * adultPrice)}</span>
                            </div>
                            {children > 0 && childPrice > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{children} Trẻ em × {formatPrice(childPrice)}</span>
                                    <span className="font-medium">{formatPrice(children * childPrice)}</span>
                                </div>
                            )}
                            {infants > 0 && infantPrice > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>{infants} Trẻ nhỏ × {formatPrice(infantPrice)}</span>
                                    <span className="font-medium">{formatPrice(infants * infantPrice)}</span>
                                </div>
                            )}
                            {pickupSurcharge > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>Phụ thu đón ({totalPassengers} người)</span>
                                    <span className="font-medium">{formatPrice(pickupSurcharge * totalPassengers)}</span>
                                </div>
                            )}
                            {optionsTotal > 0 && (
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>Dịch vụ thêm</span>
                                    <span className="font-medium">{formatPrice(optionsTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
                                <span>Tổng cộng</span>
                                <span className="text-lg">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    )}

                    {/* ═══ THÔNG TIN KHÁCH ═══ */}
                    <div className="pt-3 border-t border-border space-y-3">
                        <div className="bg-surface-alt rounded-xl p-4 mb-4 border border-border/50 text-sm">
                            <p className="mb-2"><span className="text-text-muted">Họ và tên:</span> <strong className="text-text">{user?.full_name || user?.username}</strong></p>
                            <p className="mb-2"><span className="text-text-muted">Số điện thoại:</span> <strong className="text-text">{user?.phone_number}</strong></p>
                            <p><span className="text-text-muted">Email:</span> <strong className="text-text">{user?.email}</strong></p>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                                <FileText className="w-3.5 h-3.5 text-text-muted" />
                                Ghi chú
                            </label>
                            <textarea
                                {...register('customer_note')}
                                rows={2}
                                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                                placeholder="Yêu cầu đặc biệt..."
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !selectedDepartureId}
                        className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Đặt Tour Ngay'
                        )}
                    </button>
                </form>
            </div>

            <SuccessModal
                isOpen={modal.open}
                onClose={handleCloseModal}
                title="Đặt Tour Thành Công!"
                message="Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
                bookingCode={modal.code}
                totalAmount={modal.amount}
            />
        </>
    );
};

export default BookingForm;
