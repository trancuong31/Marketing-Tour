const SuccessModal = ({ isOpen, onClose, title, message, bookingCode, totalAmount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-up">
                {/* Success Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-center text-text mb-2">
                    {title || 'Thành công!'}
                </h3>

                <p className="text-center text-text-secondary mb-4">
                    {message || 'Thao tác đã được thực hiện thành công.'}
                </p>

                {bookingCode && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-center">
                        <p className="text-sm text-text-secondary mb-1">Mã đặt tour của bạn</p>
                        <p className="text-2xl font-bold text-primary tracking-wider">{bookingCode}</p>
                        
                        {totalAmount > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary/10">
                                <p className="text-sm text-text-secondary mb-1">Số tiền cần thanh toán</p>
                                <p className="text-2xl font-extrabold text-[#f44336] tracking-tight">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                                </p>
                            </div>
                        )}
                        
                        <p className="text-xs text-text-muted mt-3">Vui lòng lưu lại mã này để tra cứu</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                    Đóng và xem lịch sử
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
