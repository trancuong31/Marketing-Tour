import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { adminService, categoryService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Edit2, Trash2, Loader2, X, Image, Upload, Calendar, MapPin, Settings, List, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';



const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ═══ TAB NAVIGATION ═══
const TABS = [
    { key: 'general', label: 'Thông tin chung', icon: Settings },
    { key: 'itineraries', label: 'Lịch trình', icon: List },
    { key: 'departures', label: 'Lịch khởi hành', icon: Calendar },
    { key: 'pickups', label: 'Điểm đón', icon: Navigation },
    { key: 'options', label: 'Tùy chọn', icon: Settings },
];

// ═══ RICH TEXT EDITOR WRAPPER ═══
const RichTextEditor = ({ value, onChange, label, placeholder }) => {
    const [ReactQuill, setReactQuill] = useState(null);

    useEffect(() => {
        import('react-quill-new').then(mod => setReactQuill(() => mod.default));
        import('react-quill-new/dist/quill.snow.css');
    }, []);

    return (
        <div>
            {label && <label className="text-sm font-medium text-text mb-1 block">{label}</label>}
            {ReactQuill ? (
                <ReactQuill
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="bg-surface rounded-xl [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[120px]"
                />
            ) : (
                <textarea
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};  

// ═══ TAB: THÔNG TIN CHUNG ═══
const GeneralTab = ({ register, watch, setValue, categories, modal, files, setFiles, handleDeleteImage }) => (
    <div className="space-y-4">
        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Danh mục *</label>
                <select
                    {...register('category_id', { required: true })}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Trạng thái</label>
                <select
                    {...register('status')}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="active">Hoạt động</option>
                    <option value="hidden">Ẩn</option>
                    <option value="sold_out">Hết chỗ</option>
                </select>
            </div>
        </div>

        {/* Title */}
        <div>
            <label className="text-sm font-medium text-text mb-1 block">Tên tour *</label>
            <input
                {...register('title', { required: true })}
                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        </div>

        {/* Summary */}
        <div>
            <label className="text-sm font-medium text-text mb-1 block">Tóm tắt</label>
            <textarea
                {...register('summary')}
                rows={2}
                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Số ngày</label>
                <input
                    type="number"
                    {...register('duration_days')}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="VD: 3"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Số đêm</label>
                <input
                    type="number"
                    {...register('duration_nights')}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="VD: 2"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Nhãn tour</label>
                <select
                    {...register('tour_badge')}
                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="none">Không có</option>
                    <option value="featured">Nổi bật</option>
                    <option value="promotion">Khuyến mãi</option>
                </select>
            </div>
        </div>

        {/* 5 Rich Text Fields */}
        <RichTextEditor
            value={watch('highlights')}
            onChange={val => setValue('highlights', val)}
            label="Điểm nổi bật"
            placeholder="Các điểm nổi bật của tour..."
        />
        <RichTextEditor
            value={watch('price_includes')}
            onChange={val => setValue('price_includes', val)}
            label="Giá tour bao gồm"
            placeholder="Vé tham quan, khách sạn, xe đưa đón..."
        />
        <RichTextEditor
            value={watch('price_excludes')}
            onChange={val => setValue('price_excludes', val)}
            label="Giá tour không bao gồm"
            placeholder="Chi phí cá nhân, tip HDV..."
        />
        <RichTextEditor
            value={watch('terms_and_notes')}
            onChange={val => setValue('terms_and_notes', val)}
            label="Điều khoản và lưu ý"
            placeholder="Quy định, lưu ý quan trọng..."
        />
        <RichTextEditor
            value={watch('cancellation_policy')}
            onChange={val => setValue('cancellation_policy', val)}
            label="Quy định hoàn hủy"
            placeholder="Chính sách hoàn hủy tour..."
        />

        {/* Existing Images */}
        {modal.tour?.images?.length > 0 && (
            <div>
                <label className="text-sm font-medium text-text mb-2 block">Ảnh hiện tại</label>
                <div className="flex flex-wrap gap-2">
                    {modal.tour.images.map(img => (
                        <div key={img.id} className="relative group">
                            <img src={getImageUrl(img.image_url)} alt="" className="w-20 h-15 object-cover rounded-lg" />
                            <button type="button" onClick={() => handleDeleteImage(img.id)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Upload */}
        <div>
            <label className="text-sm font-medium text-text mb-1 block">Thêm ảnh mới</label>
            <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition text-sm text-text-muted">
                <Upload className="w-5 h-5" />
                <span>{files.length > 0 ? `${files.length} ảnh đã chọn` : 'Chọn ảnh upload'}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => setFiles([...e.target.files])} />
            </label>
        </div>
    </div>
);

// ═══ TAB: LỊCH TRÌNH ═══
const ItinerariesTab = ({ control, register, watch, setValue }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'itineraries' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Lịch trình từng ngày</h4>
                <button
                    type="button"
                    onClick={() => append({ day_number: fields.length + 1, title: '', content: '' })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> Thêm ngày
                </button>
            </div>

            {fields.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8 bg-surface-alt rounded-xl">
                    Chưa có lịch trình. Nhấn "Thêm ngày" để bắt đầu.
                </p>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">Ngày {index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1 rounded-lg hover:bg-error/10 transition" title="Xóa ngày">
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                    <input type="hidden" {...register(`itineraries.${index}.day_number`)} value={index + 1} />
                    <div>
                        <label className="text-xs font-medium text-text-secondary mb-1 block">Tiêu đề ngày</label>
                        <input
                            {...register(`itineraries.${index}.title`, { required: true })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="VD: Đón khách - Tham quan phố cổ"
                        />
                    </div>
                    <RichTextEditor
                        value={watch(`itineraries.${index}.content`)}
                        onChange={val => setValue(`itineraries.${index}.content`, val)}
                        label="Chi tiết hoạt động"
                        placeholder="Mô tả chi tiết các hoạt động trong ngày..."
                    />
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: LỊCH KHỞI HÀNH ═══
const DeparturesTab = ({ control, register }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'departures' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Lịch khởi hành & Giá</h4>
                <button
                    type="button"
                    onClick={() => append({ departure_date: '', price_adult: '', price_child: 0, price_infant: 0, available_seats: 20, status: 'open' })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> Thêm ngày khởi hành
                </button>
            </div>

            {fields.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8 bg-surface-alt rounded-xl">
                    Chưa có lịch khởi hành. Nhấn "Thêm ngày khởi hành" để bắt đầu.
                </p>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">Khởi hành #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1 rounded-lg hover:bg-error/10 transition" title="Xóa">
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Ngày khởi hành *</label>
                            <input
                                type="date"
                                {...register(`departures.${index}.departure_date`, { required: true })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Giá người lớn (VNĐ) *</label>
                            <input
                                type="number"
                                {...register(`departures.${index}.price_adult`, { required: true, min: 0 })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="3500000"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Giá trẻ em</label>
                            <input
                                type="number"
                                {...register(`departures.${index}.price_child`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Giá em bé</label>
                            <input
                                type="number"
                                {...register(`departures.${index}.price_infant`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Số chỗ tối đa</label>
                            <input
                                type="number"
                                {...register(`departures.${index}.available_seats`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Trạng thái</label>
                            <select
                                {...register(`departures.${index}.status`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="open">Mở bán</option>
                                <option value="full">Hết chỗ</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: ĐIỂM ĐÓN ═══
const PickupsTab = ({ control, register }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'pickup_locations' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Điểm đón khách</h4>
                <button
                    type="button"
                    onClick={() => append({ location_name: '', pickup_time: '', surcharge_amount: 0 })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> Thêm điểm đón
                </button>
            </div>

            {fields.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8 bg-surface-alt rounded-xl">
                    Chưa có điểm đón. Nhấn "Thêm điểm đón" để bắt đầu.
                </p>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-primary">Điểm đón #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1 rounded-lg hover:bg-error/10 transition" title="Xóa">
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Tên điểm đón *</label>
                            <input
                                {...register(`pickup_locations.${index}.location_name`, { required: true })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="VD: Khách sạn Saigon"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Giờ đón</label>
                            <input
                                type="time"
                                {...register(`pickup_locations.${index}.pickup_time`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Phụ thu (VNĐ)</label>
                            <input
                                type="number"
                                {...register(`pickup_locations.${index}.surcharge_amount`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: TÙY CHỌN ═══
const OptionsTab = ({ control, register }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'options' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Tùy chọn (Add-ons)</h4>
                <button
                    type="button"
                    onClick={() => append({ option_name: '', price: 0, charge_type: 'quantity' })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> Thêm tùy chọn
                </button>
            </div>

            {fields.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8 bg-surface-alt rounded-xl">
                    Chưa có tùy chọn. Nhấn "Thêm tùy chọn" để bắt đầu.
                </p>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-primary">Tùy chọn #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1 rounded-lg hover:bg-error/10 transition" title="Xóa">
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Tên dịch vụ *</label>
                            <input
                                {...register(`options.${index}.option_name`, { required: true })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="VD: Phụ thu phòng đơn"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Giá (VNĐ)</label>
                            <input
                                type="number"
                                {...register(`options.${index}.price`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">Cách tính</label>
                            <select
                                {...register(`options.${index}.charge_type`)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="per_person">Theo người</option>
                                <option value="per_booking">Theo đơn</option>
                                <option value="quantity">Số lượng</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ITEMS_PER_PAGE = 10;

// ═══ MAIN PAGE ═══
const TourManagementPage = () => {
    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, tour: null });
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [files, setFiles] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const defaultValues = {
        category_id: '', title: '', summary: '',
        highlights: '', price_includes: '', price_excludes: '',
        terms_and_notes: '', cancellation_policy: '',
        duration_days: '', duration_nights: '',
        tour_badge: 'none', status: 'active',
        itineraries: [],
        departures: [],
        pickup_locations: [],
        options: [],
    };

    const { register, handleSubmit, control, watch, setValue, reset } = useForm({ defaultValues });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [toursRes, catsRes] = await Promise.all([
                adminService.getTours({ page: currentPage, limit: ITEMS_PER_PAGE }),
                categoryService.getAll(),
            ]);
            setTours(toursRes.data.data || []);
            setTotalPages(toursRes.data.totalPages || 1);
            setTotalItems(toursRes.data.totalItems || 0);
            setCategories(catsRes.data.data || []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const openCreate = () => {
        reset({
            ...defaultValues,
            category_id: categories[0]?.id || '',
        });
        setFiles([]);
        setActiveTab('general');
        setModal({ open: true, tour: null });
    };

    const openEdit = async (tour) => {
        try {
            // Lấy chi tiết đầy đủ từ API
            const res = await adminService.getTourById(tour.id);
            const detail = res.data.data;

            reset({
                category_id: detail.category_id,
                title: detail.title,
                summary: detail.summary || '',
                highlights: detail.highlights || '',
                price_includes: detail.price_includes || '',
                price_excludes: detail.price_excludes || '',
                terms_and_notes: detail.terms_and_notes || '',
                cancellation_policy: detail.cancellation_policy || '',
                duration_days: detail.duration_days || '',
                duration_nights: detail.duration_nights || '',
                tour_badge: detail.tour_badge || 'none',
                status: detail.status || 'active',
                itineraries: (detail.itineraries || []).map(it => ({
                    day_number: it.day_number,
                    title: it.title,
                    content: it.content,
                })),
                departures: (detail.departures || []).map(d => ({
                    departure_date: d.departure_date,
                    price_adult: d.price_adult,
                    price_child: d.price_child || 0,
                    price_infant: d.price_infant || 0,
                    available_seats: d.available_seats,
                    status: d.status,
                })),
                pickup_locations: (detail.pickupLocations || []).map(p => ({
                    location_name: p.location_name,
                    pickup_time: p.pickup_time || '',
                    surcharge_amount: p.surcharge_amount || 0,
                })),
                options: (detail.options || []).map(o => ({
                    option_name: o.option_name,
                    price: o.price || 0,
                    charge_type: o.charge_type || 'quantity',
                })),
            });

            setFiles([]);
            setActiveTab('general');
            setModal({ open: true, tour: detail });
        } catch (err) {
            toast.error('Lỗi tải chi tiết tour');
        }
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const fd = new FormData();

            // Thông tin chung
            const generalFields = [
                'category_id', 'title', 'summary',
                'highlights', 'price_includes', 'price_excludes',
                'terms_and_notes', 'cancellation_policy',
                'duration_days', 'duration_nights',
                'tour_badge', 'status',
            ];
            generalFields.forEach(key => {
                if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
                    fd.append(key, data[key]);
                }
            });

            // Satellite data → JSON strings
            fd.append('itineraries', JSON.stringify(data.itineraries || []));
            fd.append('departures', JSON.stringify(data.departures || []));
            fd.append('pickup_locations', JSON.stringify(data.pickup_locations || []));
            fd.append('options', JSON.stringify(data.options || []));

            // Images
            files.forEach(f => fd.append('images', f));

            if (modal.tour) {
                await adminService.updateTour(modal.tour.id, fd);
                toast.success('Cập nhật tour thành công!');
            } else {
                await adminService.createTour(fd);
                toast.success('Thêm tour mới thành công!');
            }
            setModal({ open: false, tour: null });
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi lưu tour');
        } finally {
            setSubmitting(false);
        }
    };

    const performDelete = async (id) => {
        try {
            await adminService.deleteTour(id);
            toast.success('Xóa tour thành công!');
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi xóa tour');
        }
    };

    const handleDelete = (id) => {
        toast('Xác nhận xóa', {
            description: 'Bạn có chắc chắn muốn xóa tour này?',
            action: {
                label: 'Xóa',
                onClick: () => performDelete(id)
            },
            cancel: {
                label: 'Hủy'
            },
            duration: 5000,
        });
    };

    const performDeleteImage = async (imageId) => {
        try {
            await adminService.deleteTourImage(imageId);
            toast.success('Xóa ảnh thành công!');
            await fetchData();
        } catch {
            toast.error('Lỗi xóa ảnh');
        }
    };

    const handleDeleteImage = (imageId) => {
        toast('Xác nhận xóa ảnh', {
            description: 'Bạn có chắc chắn muốn xóa ảnh này?',
            action: {
                label: 'Xóa',
                onClick: () => performDeleteImage(imageId)
            },
            cancel: {
                label: 'Hủy'
            },
            duration: 5000,
        });
    };

    // Lấy giá thấp nhất từ departures
    const getMinPrice = (tour) => {
        const departures = tour.departures || [];
        if (departures.length === 0) return null;
        return Math.min(...departures.map(d => parseFloat(d.price_adult)));
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">Danh sách Tour ({tours.length})</h2>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm Tour
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
                <div className="bg-surface rounded-xl border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Tour</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden md:table-cell">Danh mục</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Giá từ</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden lg:table-cell">Thời gian</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">Trạng thái</th>
                                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map(tour => {
                                const minPrice = getMinPrice(tour);
                                return (
                                    <tr key={tour.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {tour.thumbnail_url ? (
                                                    <img src={getImageUrl(tour.thumbnail_url)} alt="" className="w-12 h-9 object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-12 h-9 bg-surface-alt rounded-lg flex items-center justify-center">
                                                        <Image className="w-4 h-4 text-text-muted" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-text line-clamp-1">{tour.title}</p>
                                                    {tour.tour_badge === 'featured' && <span className="text-xs text-secondary font-bold">⭐ Nổi bật</span>}
                                                    {tour.tour_badge === 'promotion' && <span className="text-xs text-secondary font-bold">🏷️ Khuyến mãi</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{tour.Category?.name}</td>
                                        <td className="px-4 py-3">
                                            {minPrice ? (
                                                <p className="font-semibold text-primary">{formatPrice(minPrice)}</p>
                                            ) : (
                                                <p className="text-text-muted text-xs">Chưa có giá</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-text-secondary text-sm">
                                            {tour.duration_days && tour.duration_nights
                                                ? `${tour.duration_days}N${tour.duration_nights}Đ`
                                                : tour.duration_days ? `${tour.duration_days} ngày` : '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                tour.status === 'active' ? 'bg-success/10 text-success' :
                                                tour.status === 'hidden' ? 'bg-warning/10 text-warning' :
                                                'bg-error/10 text-error'
                                            }`}>
                                                {tour.status === 'active' ? 'Hoạt động' : tour.status === 'hidden' ? 'Ẩn' : 'Hết chỗ'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(tour)} className="p-1.5 rounded-lg hover:bg-primary/10 transition" title="Sửa">
                                                    <Edit2 className="w-4 h-4 text-primary" />
                                                </button>
                                                <button onClick={() => handleDelete(tour.id)} className="p-1.5 rounded-lg hover:bg-error/10 transition" title="Xóa">
                                                    <Trash2 className="w-4 h-4 text-error" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {tours.length === 0 && <div className="text-center py-12 text-text-muted">Chưa có tour nào</div>}
                </div>
            )}

            {/* Pagination Logic */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Trước</span>
                        </button>

                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold border transition ${
                                    page === currentPage
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="hidden sm:inline">Sau</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-text-muted">
                        Trang {currentPage} / {totalPages} • Tổng {totalItems} tour
                    </p>
                </div>
            )}

            {/* ═══ MULTI-TAB MODAL FORM ═══ */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal({ open: false, tour: null })} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-up">
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-text">{modal.tour ? 'Sửa Tour' : 'Thêm Tour Mới'}</h3>
                            <button onClick={() => setModal({ open: false, tour: null })} className="p-1 rounded-lg hover:bg-surface-hover">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="px-6 pt-3 border-b border-border flex gap-1 overflow-x-auto shrink-0">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                                            activeTab === tab.key
                                                ? 'bg-primary/10 text-primary border-b-2 border-primary -mb-px'
                                                : 'text-text-muted hover:text-text hover:bg-surface-alt'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'general' && (
                                    <GeneralTab
                                        register={register}
                                        watch={watch}
                                        setValue={setValue}
                                        categories={categories}
                                        modal={modal}
                                        files={files}
                                        setFiles={setFiles}
                                        handleDeleteImage={handleDeleteImage}
                                    />
                                )}
                                {activeTab === 'itineraries' && (
                                    <ItinerariesTab control={control} register={register} watch={watch} setValue={setValue} />
                                )}
                                {activeTab === 'departures' && (
                                    <DeparturesTab control={control} register={register} />
                                )}
                                {activeTab === 'pickups' && (
                                    <PickupsTab control={control} register={register} />
                                )}
                                {activeTab === 'options' && (
                                    <OptionsTab control={control} register={register} />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
                                <button type="button" onClick={() => setModal({ open: false, tour: null })}
                                    className="flex-1 py-2.5 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {modal.tour ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default TourManagementPage;
