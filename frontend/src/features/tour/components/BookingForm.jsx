import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store';
import { bookingService } from '@/services/tourService';
import SuccessModal from '@/components/ui/SuccessModal';
import { User, Phone, Mail, FileText, Loader2, Calendar, Users, Minus, Plus } from 'lucide-react';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const PassengerCounter = ({ label, ageDesc, count, onChange, min = 0 }) => (
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
                onClick={() => onChange(count + 1)}
                className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);

const BookingForm = ({ tour }) => {
    const { user } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ open: false, code: '' });
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            customer_name: user?.full_name || '',
            customer_phone: user?.phone_number || '',
            customer_email: user?.email || '',
            departure_date: '',
            customer_note: '',
        },
    });

    const totalPeople = adults + children + infants;

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const payload = {
                ...data,
                tour_id: tour.id,
                number_of_people: totalPeople,
                customer_note: [
                    data.customer_note,
                    `Ngày khởi hành: ${data.departure_date || 'Chưa chọn'}`,
                    `Người lớn (>10 tuổi): ${adults}`,
                    `Trẻ em (2-10 tuổi): ${children}`,
                    `Trẻ nhỏ (<2 tuổi): ${infants}`,
                ].filter(Boolean).join(' | '),
            };
            delete payload.departure_date;
            const res = await bookingService.create(payload);
            setModal({ open: true, code: res.data.data.booking_code });
            reset();
            setAdults(1);
            setChildren(0);
            setInfants(0);
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const hasSaleAdult = tour.sale_price_adult && parseFloat(tour.sale_price_adult) < parseFloat(tour.price_adult);
    const adultPrice = hasSaleAdult ? parseFloat(tour.sale_price_adult) : parseFloat(tour.price_adult);
    const childPrice = tour.price_child
        ? (tour.sale_price_child && parseFloat(tour.sale_price_child) < parseFloat(tour.price_child)
            ? parseFloat(tour.sale_price_child) : parseFloat(tour.price_child))
        : 0;
    const infantPrice = tour.price_infant
        ? (tour.sale_price_infant && parseFloat(tour.sale_price_infant) < parseFloat(tour.price_infant)
            ? parseFloat(tour.sale_price_infant) : parseFloat(tour.price_infant))
        : 0;
    const totalPrice = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);

    // Compute min departure date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <>
            <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-5">
                <h3 className="text-lg font-bold text-text mb-1">Đặt Tour Ngay</h3>
                <p className="text-sm text-text-muted mb-5">
                    Giá từ <span className="font-bold text-primary">{formatPrice(adultPrice)}</span>/người lớn
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Họ tên */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <User className="w-3.5 h-3.5 text-text-muted" />
                            Họ và tên <span className="text-error">*</span>
                        </label>
                        <input
                            {...register('customer_name', {
                                required: 'Vui lòng nhập họ tên',
                                minLength: { value: 2, message: 'Họ tên ít nhất 2 ký tự' },
                            })}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="Nguyễn Văn A"
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-xs text-error">{errors.customer_name.message}</p>
                        )}
                    </div>

                    {/* SĐT */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <Phone className="w-3.5 h-3.5 text-text-muted" />
                            Số điện thoại <span className="text-error">*</span>
                        </label>
                        <input
                            {...register('customer_phone', {
                                required: 'Vui lòng nhập số điện thoại',
                                pattern: {
                                    value: /^(0[35789])[0-9]{8}$/,
                                    message: 'Số điện thoại không hợp lệ (VD: 0901234567)',
                                },
                            })}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="0901234567"
                        />
                        {errors.customer_phone && (
                            <p className="mt-1 text-xs text-error">{errors.customer_phone.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <Mail className="w-3.5 h-3.5 text-text-muted" />
                            Email <span className="text-error">*</span>
                        </label>
                        <input
                            {...register('customer_email', {
                                required: 'Vui lòng nhập email',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Email không hợp lệ',
                                },
                            })}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="email@example.com"
                        />
                        {errors.customer_email && (
                            <p className="mt-1 text-xs text-error">{errors.customer_email.message}</p>
                        )}
                    </div>

                    {/* Ngày khởi hành */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            Ngày khởi hành <span className="text-error">*</span>
                        </label>
                        <input
                            type="date"
                            {...register('departure_date', {
                                required: 'Vui lòng chọn ngày khởi hành',
                            })}
                            min={minDate}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                        {errors.departure_date && (
                            <p className="mt-1 text-xs text-error">{errors.departure_date.message}</p>
                        )}
                    </div>

                    {/* ═══ HÀNH KHÁCH ═══ */}
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
                            />
                            <PassengerCounter
                                label="Trẻ em"
                                ageDesc="Từ 2 – 10 tuổi"
                                count={children}
                                onChange={setChildren}
                            />
                            <PassengerCounter
                                label="Trẻ nhỏ"
                                ageDesc="Dưới 2 tuổi"
                                count={infants}
                                onChange={setInfants}
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-1.5 text-right">
                            Tổng: <span className="font-semibold text-text">{totalPeople}</span> hành khách
                        </p>
                        {/* Chi tiết giá */}
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
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
                            <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-border">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
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
                onClose={() => setModal({ open: false, code: '' })}
                title="Đặt Tour Thành Công!"
                message="Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
                bookingCode={modal.code}
            />
        </>
    );
};

export default BookingForm;
