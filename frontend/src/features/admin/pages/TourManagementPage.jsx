import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { adminService, categoryService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import AdminLayout from '@/components/layout/AdminLayout';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import TranslationToolbar from '@/features/admin/components/TranslationToolbar';
import { Plus, Edit2, Trash2, Loader2, X, Image, Upload, Calendar, Settings, List, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
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
const RichTextEditor = ({ value, onChange, label, placeholder, error }) => {
    const [ReactQuill, setReactQuill] = useState(null);

    useEffect(() => {
        import('react-quill-new').then(mod => setReactQuill(() => mod.default));
        import('react-quill-new/dist/quill.snow.css');
    }, []);

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'align'
    ];

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    };

    return (
        <div>
            {label && (
                <label className="text-sm font-medium text-text mb-1 block">
                    {label} {error && <span className="text-error text-xs font-normal ml-1">({error})</span>}
                </label>
            )}
            <div className={`rounded-xl border transition-colors duration-200 ${error ? 'border-error ring-1 ring-error/20' : 'border-transparent'}`}>
                {ReactQuill ? (
                    <ReactQuill
                        theme="snow"
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        formats={formats}
                        modules={modules}
                        className="bg-transparent rounded-xl [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[120px]"
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
        </div>
    );
};

const PriceInput = ({ control, name, rules, error, placeholder }) => (
    <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
            const displayValue = field.value !== undefined && field.value !== '' && field.value !== null 
                ? Number(field.value).toLocaleString('vi-VN') 
                : '';
            return (
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\./g, '');
                        if (val === '' || !isNaN(val)) {
                            field.onChange(val === '' ? '' : Number(val));
                        }
                    }}
                    className={`w-full px-3 py-2 bg-surface border ${error ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder={placeholder}
                />
            );
        }}
    />
);

// ═══ TAB: THÔNG TIN CHUNG ═══
const GeneralTab = ({ register, watch, setValue, categories, modal, files, setFiles, handleDeleteImage, errors, control, currentLang }) => {
    const categoryOptions = useMemo(() => categories.map(c => ({ label: c.name, value: String(c.id) })), [categories]);
    const statusOptions = [
        { label: 'Hoạt động', value: 'active' },
        { label: 'Ẩn', value: 'hidden' },
        { label: 'Hết chỗ', value: 'sold_out' }
    ];
    const badgeOptions = [
        { label: 'Không có', value: 'none' },
        { label: 'Nổi bật', value: 'featured' },
        { label: 'Khuyến mãi', value: 'promotion' }
    ];

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const getFieldName = (name) => {
        if (currentLang === 'vi') return name;
        if (currentLang === 'en') return `translations.0.${name}`;
        return `translations.1.${name}`;
    };

    const getFieldError = (name) => {
        if (currentLang === 'vi') return errors[name];
        if (currentLang === 'en') return errors?.translations?.[0]?.[name];
        return errors?.translations?.[1]?.[name];
    };

    return (
        <div className="space-y-5">
            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
                    <label className="text-sm font-medium text-text mb-1 block">Danh mục *</label>
                    <Controller
                        name="category_id"
                        control={control}
                        rules={{ required: 'Vui lòng chọn danh mục' }}
                        render={({ field }) => (
                            <CustomSelect
                                value={String(field.value)}
                                onChange={field.onChange}
                                options={categoryOptions}
                                placeholder="Chọn danh mục"
                            />
                        )}
                    />
                    {errors.category_id && <p className="text-error text-xs mt-1 font-medium">{errors.category_id.message}</p>}
                </div>
                <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
                    <label className="text-sm font-medium text-text mb-1 block">Trạng thái *</label>
                    <Controller
                        name="status"
                        control={control}
                        rules={{ required: 'Vui lòng chọn trạng thái' }}
                        render={({ field }) => (
                            <CustomSelect
                                value={field.value}
                                onChange={field.onChange}
                                options={statusOptions}
                                placeholder="Chọn trạng thái"
                            />
                        )}
                    />
                    {errors.status && <p className="text-error text-xs mt-1 font-medium">{errors.status.message}</p>}
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Tên tour ({currentLang.toUpperCase()}) *</label>
                <input
                    {...register(getFieldName('title'), { required: 'Tên tour không được để trống' })}
                    className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('title') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Nhập tên tour..."
                />
                {getFieldError('title') && <p className="text-error text-xs mt-1 font-medium">{getFieldError('title').message}</p>}
            </div>

            {/* Summary */}
            <div>
                <label className="text-sm font-medium text-text mb-1 block">Tóm tắt ({currentLang.toUpperCase()}) *</label>
                <textarea
                    {...register(getFieldName('summary'), { required: 'Tóm tắt không được để trống' })}
                    rows={2}
                    className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('summary') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none`}
                    placeholder="Mô tả ngắn gọn về tour..."
                />
                {getFieldError('summary') && <p className="text-error text-xs mt-1 font-medium">{getFieldError('summary').message}</p>}
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-text mb-1 block">Số ngày *</label>
                    <input
                        type="number"
                        {...register('duration_days', { required: 'Nhập số ngày', min: { value: 1, message: 'Tối thiểu 1 ngày' } })}
                        className={`w-full px-3 py-2.5 bg-surface-alt border ${errors.duration_days ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="VD: 3"
                    />
                    {errors.duration_days && <p className="text-error text-xs mt-1 font-medium">{errors.duration_days.message}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-text mb-1 block">Số đêm *</label>
                    <input
                        type="number"
                        {...register('duration_nights', { required: 'Nhập số đêm', min: { value: 0, message: 'Tối thiểu 0 đêm' }, max: { value: 30, message: 'Tối đa 30 đêm' } })}
                        className={`w-full px-3 py-2.5 bg-surface-alt border ${errors.duration_nights ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="VD: 2"
                    />
                    {errors.duration_nights && <p className="text-error text-xs mt-1 font-medium">{errors.duration_nights.message}</p>}
                </div>
                <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
                    <label className="text-sm font-medium text-text mb-1 block">Nhãn tour</label>
                    <Controller
                        name="tour_badge"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                value={field.value}
                                onChange={field.onChange}
                                options={badgeOptions}
                                placeholder="Chọn nhãn"
                            />
                        )}
                    />
                </div>
            </div>

            {/* 5 Rich Text Fields */}
            <div className="space-y-6 pt-2">
                <div>
                    <label className="text-sm font-medium text-text mb-1 block">
                        Điểm nổi bật ({currentLang.toUpperCase()}) *
                    </label>
                    <textarea
                        {...register(getFieldName('highlights'), { required: 'Vui lòng nhập điểm nổi bật' })}
                        rows={4}
                        className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('highlights') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none`}
                        placeholder="Nhập các điểm nổi bật... (Lưu ý: Viết thành đoạn văn, mỗi điểm nổi bật kết thúc bằng 1 dấu chấm)"
                    />
                    {getFieldError('highlights') && <p className="text-error text-xs mt-1 font-medium">{getFieldError('highlights').message}</p>}
                </div>

                <div>
                    <RichTextEditor
                        value={watch(getFieldName('price_includes'))}
                        onChange={val => setValue(getFieldName('price_includes'), val, { shouldValidate: true })}
                        label={`Giá tour bao gồm (${currentLang.toUpperCase()}) *`}
                        placeholder="Vé tham quan, khách sạn, xe đưa đón..."
                        error={getFieldError('price_includes')?.message}
                    />
                    <input type="hidden" {...register(getFieldName('price_includes'), { required: 'Vui lòng nhập thông tin giá bao gồm' })} />
                </div>

                <div>
                    <RichTextEditor
                        value={watch(getFieldName('price_excludes'))}
                        onChange={val => setValue(getFieldName('price_excludes'), val, { shouldValidate: true })}
                        label={`Giá tour không bao gồm (${currentLang.toUpperCase()}) *`}
                        placeholder="Chi phí cá nhân, tip HDV..."
                        error={getFieldError('price_excludes')?.message}
                    />
                    <input type="hidden" {...register(getFieldName('price_excludes'), { required: 'Vui lòng nhập thông tin giá không bao gồm' })} />
                </div>

                <div>
                    <RichTextEditor
                        value={watch(getFieldName('terms_and_notes'))}
                        onChange={val => setValue(getFieldName('terms_and_notes'), val, { shouldValidate: true })}
                        label={`Điều khoản và lưu ý (${currentLang.toUpperCase()}) *`}
                        placeholder="Quy định, lưu ý quan trọng..."
                        error={getFieldError('terms_and_notes')?.message}
                    />
                    <input type="hidden" {...register(getFieldName('terms_and_notes'), { required: 'Vui lòng nhập điều khoản' })} />
                </div>

                <div>
                    <RichTextEditor
                        value={watch(getFieldName('cancellation_policy'))}
                        onChange={val => setValue(getFieldName('cancellation_policy'), val, { shouldValidate: true })}
                        label={`Quy định hoàn hủy (${currentLang.toUpperCase()}) *`}
                        placeholder="Chính sách hoàn hủy tour..."
                        error={getFieldError('cancellation_policy')?.message}
                    />
                    <input type="hidden" {...register(getFieldName('cancellation_policy'), { required: 'Vui lòng nhập chính sách hoàn hủy' })} />
                </div>
            </div>

            {/* Unified Image Management */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-text block">
                    Album ảnh tour {!modal.tour && files.length === 0 && <span className="text-error font-normal">(Bắt buộc ít nhất 1 ảnh)</span>}
                </label>
                
                <div 
                    className={`p-4 border-2 border-dashed rounded-2xl transition-all ${
                        !modal.tour && files.length === 0 && Object.keys(errors).length > 0 
                        ? 'border-error bg-error/5' 
                        : 'border-border hover:border-primary/50 bg-surface-alt/50'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        const droppedFiles = Array.from(e.dataTransfer.files);
                        if (droppedFiles.length > 0) setFiles(prev => [...prev, ...droppedFiles]);
                    }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {/* Existing Images */}
                        {modal.tour?.images?.map(img => (
                            <div key={img.id} className="relative aspect-square group rounded-xl overflow-hidden border border-border shadow-sm bg-surface">
                                <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                                        className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform" title="Xóa ảnh hệ thống">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* New Uploaded Files */}
                        {files.map((file, idx) => {
                            const previewUrl = URL.createObjectURL(file);
                            return (
                                <div key={idx} className="relative aspect-square group rounded-xl overflow-hidden border border-border shadow-sm bg-surface">
                                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md shadow-sm z-10">MỚI</div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                        <button type="button" onClick={() => removeFile(idx)}
                                            className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform" title="Hủy ảnh này">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Upload Button Tile */}
                        <label className="relative aspect-square flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-text-muted group">
                            <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Thêm ảnh</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    
                    {(files.length === 0 && (!modal.tour?.images || modal.tour.images.length === 0)) && (
                        <div className="text-center py-4 text-text-muted">
                            <p className="text-xs font-medium">Kéo thả ảnh vào đây hoặc nhấp &quot;Thêm ảnh&quot;</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══ TAB: LỊCH TRÌNH ═══
const ItinerariesTab = ({ control, register, watch, setValue, errors, currentLang }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'itineraries' });

    const getFieldName = (index, name) => {
        if (currentLang === 'vi') return `itineraries.${index}.${name}`;
        if (currentLang === 'en') return `itineraries.${index}.translations.0.${name}`;
        return `itineraries.${index}.translations.1.${name}`;
    };

    const getFieldError = (index, name) => {
        if (currentLang === 'vi') return errors.itineraries?.[index]?.[name];
        if (currentLang === 'en') return errors.itineraries?.[index]?.translations?.[0]?.[name];
        return errors.itineraries?.[index]?.translations?.[1]?.[name];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Lịch trình từng ngày ({currentLang.toUpperCase()}) *</h4>
                <button
                    type="button"
                    onClick={() => {
                        append({ 
                            day_number: fields.length + 1, 
                            title: '', 
                            content: '',
                            translations: [
                                { language: 'en', title: '', content: '' },
                                { language: 'zh', title: '', content: '' }
                            ]
                        });
                        setTimeout(() => {
                            const elements = document.querySelectorAll('.itinerary-day-card');
                            if (elements.length > 0) {
                                const lastEl = elements[elements.length - 1];
                                lastEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                const input = lastEl.querySelector('input[type="text"]');
                                if (input) input.focus();
                            }
                        }, 100);
                    }}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition flex items-center gap-1 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm ngày
                </button>
            </div>

            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
                    <List className="w-12 h-12 text-text-muted mb-3 opacity-50" />
                    <p className="text-base font-semibold text-text mb-1">Chưa có lịch trình</p>
                    <p className="text-sm text-error font-medium">Bắt buộc phải có ít nhất 1 ngày lịch trình cho tour.</p>
                </div>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="itinerary-day-card p-5 bg-surface-alt rounded-2xl border border-border space-y-4 shadow-sm relative group">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Ngày {index + 1}
                        </span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition" title="Xóa ngày">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <input type="hidden" {...register(`itineraries.${index}.day_number`)} value={index + 1} />
                    <div>
                        <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Tiêu đề ngày ({currentLang.toUpperCase()}) *</label>
                        <input
                            {...register(getFieldName(index, 'title'), { required: 'Nhập tiêu đề ngày' })}
                            className={`w-full px-3 py-2 bg-surface border ${getFieldError(index, 'title') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                            placeholder="VD: Đón khách - Tham quan phố cổ"
                        />
                        {getFieldError(index, 'title') && <p className="text-error text-xs mt-1 font-medium">{getFieldError(index, 'title').message}</p>}
                    </div>
                    
                    <div>
                        <RichTextEditor
                            value={watch(getFieldName(index, 'content'))}
                            onChange={val => setValue(getFieldName(index, 'content'), val, { shouldValidate: true })}
                            label={`Chi tiết hoạt động (${currentLang.toUpperCase()}) *`}
                            placeholder="Mô tả chi tiết các hoạt động trong ngày..."
                            error={getFieldError(index, 'content')?.message}
                        />
                        <input type="hidden" {...register(getFieldName(index, 'content'), { required: 'Nhập nội dung hoạt động' })} />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: LỊCH KHỞI HÀNH ═══
const DeparturesTab = ({ control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'departures' });

    const statusOptions = [
        { label: 'Mở bán', value: 'open' },
        { label: 'Hết chỗ', value: 'full' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Lịch khởi hành & Giá *</h4>
                <button
                    type="button"
                    onClick={() => append({ departure_date: '', price_adult: '', price_child: 0, price_infant: 0, available_seats: 20, status: 'open' })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition flex items-center gap-1 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm khởi hành
                </button>
            </div>

            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
                    <Calendar className="w-12 h-12 text-text-muted mb-3 opacity-50" />
                    <p className="text-base font-semibold text-text mb-1">Chưa có lịch khởi hành</p>
                    <p className="text-sm text-error font-medium">Bắt buộc phải cấu hình ít nhất 1 lịch khởi hành để hiển thị giá.</p>
                </div>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-2xl border border-border space-y-4 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Khởi hành #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Ngày đi *</label>
                            <input
                                type="date"
                                {...register(`departures.${index}.departure_date`, { required: 'Bắt buộc chọn' })}
                                className={`w-full px-3 py-2 bg-surface border ${errors.departures?.[index]?.departure_date ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                            />
                            {errors.departures?.[index]?.departure_date && <p className="text-error text-[10px] mt-1 font-medium">{errors.departures[index].departure_date.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Giá NL (VNĐ) *</label>
                            <PriceInput control={control} name={`departures.${index}.price_adult`} rules={{ required: 'Bắt buộc', min: { value: 1, message: '>0' } }} error={errors.departures?.[index]?.price_adult} placeholder="3.500.000" />
                            {errors.departures?.[index]?.price_adult && <p className="text-error text-[10px] mt-1 font-medium">{errors.departures[index].price_adult.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Giá trẻ em (VNĐ) *</label>
                            <PriceInput control={control} name={`departures.${index}.price_child`} rules={{ required: 'Bắt buộc', min: { value: 0, message: '>=0' } }} error={errors.departures?.[index]?.price_child} placeholder="0" />
                            {errors.departures?.[index]?.price_child && <p className="text-error text-[10px] mt-1 font-medium">{errors.departures[index].price_child.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Giá em bé (VNĐ) *</label>
                            <PriceInput control={control} name={`departures.${index}.price_infant`} rules={{ required: 'Bắt buộc', min: { value: 0, message: '>=0' } }} error={errors.departures?.[index]?.price_infant} placeholder="0" />
                            {errors.departures?.[index]?.price_infant && <p className="text-error text-[10px] mt-1 font-medium">{errors.departures[index].price_infant.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Số chỗ *</label>
                            <input
                                type="number"
                                {...register(`departures.${index}.available_seats`, { required: 'Bắt buộc', min: { value: 1, message: '>0' } })}
                                className={`w-full px-3 py-2 bg-surface border ${errors.departures?.[index]?.available_seats ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                                placeholder="20"
                            />
                            {errors.departures?.[index]?.available_seats && <p className="text-error text-[10px] mt-1 font-medium">{errors.departures[index].available_seats.message}</p>}
                        </div>
                        <div className="[&>div>button]:py-2 [&>div>button]:bg-surface">
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Trạng thái *</label>
                            <Controller
                                name={`departures.${index}.status`}
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={statusOptions}
                                        placeholder="Chọn"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: ĐIỂM ĐÓN ═══
const PickupsTab = ({ control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'pickup_locations' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Điểm đón khách *</h4>
                <button
                    type="button"
                    onClick={() => append({ location_name: '', pickup_time: '', surcharge_amount: 0 })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition flex items-center gap-1 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm điểm đón
                </button>
            </div>

            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
                    <Navigation className="w-12 h-12 text-text-muted mb-3 opacity-50" />
                    <p className="text-base font-semibold text-text mb-1">Chưa có điểm đón</p>
                    <p className="text-sm text-error font-medium">Bắt buộc cấu hình ít nhất 1 điểm đón để khách hàng lựa chọn.</p>
                </div>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Điểm đón #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Tên điểm đón *</label>
                            <input
                                {...register(`pickup_locations.${index}.location_name`, { required: 'Nhập tên điểm đón' })}
                                className={`w-full px-3 py-2 bg-surface border ${errors.pickup_locations?.[index]?.location_name ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                                placeholder="VD: Khách sạn Saigon"
                            />
                            {errors.pickup_locations?.[index]?.location_name && <p className="text-error text-[10px] mt-1 font-medium">{errors.pickup_locations[index].location_name.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Giờ đón *</label>
                            <input
                                type="time"
                                {...register(`pickup_locations.${index}.pickup_time`, { required: 'Nhập giờ đón' })}
                                className={`w-full px-3 py-2 bg-surface border ${errors.pickup_locations?.[index]?.pickup_time ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                            />
                            {errors.pickup_locations?.[index]?.pickup_time && <p className="text-error text-[10px] mt-1 font-medium">{errors.pickup_locations[index].pickup_time.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Phụ thu (VNĐ) *</label>
                            <PriceInput control={control} name={`pickup_locations.${index}.surcharge_amount`} rules={{ required: 'Bắt buộc', min: { value: 0, message: '>= 0' } }} error={errors.pickup_locations?.[index]?.surcharge_amount} placeholder="0" />
                            {errors.pickup_locations?.[index]?.surcharge_amount && <p className="text-error text-[10px] mt-1 font-medium">{errors.pickup_locations[index].surcharge_amount.message}</p>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ═══ TAB: TÙY CHỌN ═══
const OptionsTab = ({ control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'options' });

    const chargeTypeOptions = [
        { label: 'Theo người', value: 'per_person' },
        { label: 'Theo đơn', value: 'per_booking' },
        { label: 'Số lượng', value: 'quantity' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">Tùy chọn nâng cao (Add-ons)</h4>
                <button
                    type="button"
                    onClick={() => append({ option_name: '', price: 0, charge_type: 'quantity' })}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition flex items-center gap-1 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm tùy chọn
                </button>
            </div>

            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
                    <Settings className="w-12 h-12 text-text-muted mb-3 opacity-50" />
                    <p className="text-base font-semibold text-text mb-1">Không có tùy chọn phụ</p>
                    <p className="text-sm text-text-secondary">Bạn có thể cấu hình thêm các dịch vụ bán kèm như phòng đơn, buffet...</p>
                </div>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-surface-alt rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Tùy chọn #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)}
                            className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Tên dịch vụ *</label>
                            <input
                                {...register(`options.${index}.option_name`, { required: 'Bắt buộc' })}
                                className={`w-full px-3 py-2 bg-surface border ${errors.options?.[index]?.option_name ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-xl text-sm focus:outline-none focus:ring-2 transition-all`}
                                placeholder="VD: Phụ thu phòng đơn"
                            />
                            {errors.options?.[index]?.option_name && <p className="text-error text-[10px] mt-1 font-medium">{errors.options[index].option_name.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Giá (VNĐ) *</label>
                            <PriceInput control={control} name={`options.${index}.price`} rules={{ required: 'Bắt buộc', min: { value: 0, message: '>=0' } }} error={errors.options?.[index]?.price} placeholder="0" />
                            {errors.options?.[index]?.price && <p className="text-error text-[10px] mt-1 font-medium">{errors.options[index].price.message}</p>}
                        </div>
                        <div className="[&>div>button]:py-2 [&>div>button]:bg-surface">
                            <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Cách tính *</label>
                            <Controller
                                name={`options.${index}.charge_type`}
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={chargeTypeOptions}
                                        placeholder="Chọn"
                                    />
                                )}
                            />
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
    const [translating, setTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [currentLang, setCurrentLang] = useState('vi'); // Language Switcher State
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
        translations: [
            { language: 'en', title: '', summary: '', highlights: '', price_includes: '', price_excludes: '', terms_and_notes: '', cancellation_policy: '' },
            { language: 'zh', title: '', summary: '', highlights: '', price_includes: '', price_excludes: '', terms_and_notes: '', cancellation_policy: '' }
        ]
    };

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({ defaultValues });

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
        reset(defaultValues);
        setFiles([]);
        setActiveTab('general');
        setCurrentLang('vi');
        setModal({ open: true, tour: null });
    };

    const openEdit = async (tour) => {
        try {
            // Lấy chi tiết đầy đủ từ API
            const res = await adminService.getTourById(tour.id);
            const detail = res.data.data;

            reset({
                category_id: String(detail.category_id),
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
                    translations: [
                        { language: 'en', title: '', content: '' },
                        { language: 'zh', title: '', content: '' }
                    ].map(defaultTr => {
                        const found = it.translations?.find(t => t.language === defaultTr.language);
                        return found || defaultTr;
                    })
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
                translations: [
                    { language: 'en', title: '', summary: '', highlights: '', price_includes: '', price_excludes: '', terms_and_notes: '', cancellation_policy: '' },
                    { language: 'zh', title: '', summary: '', highlights: '', price_includes: '', price_excludes: '', terms_and_notes: '', cancellation_policy: '' }
                ].map(defaultTr => {
                    const found = detail.translations?.find(t => t.language === defaultTr.language);
                    return found || defaultTr;
                })
            });

            setFiles([]);
            setActiveTab('general');
            setCurrentLang('vi');
            setModal({ open: true, tour: detail });
        } catch (err) {
            toast.error('Lỗi tải chi tiết tour');
        }
    };

    const onSubmit = async (data) => {
        // Tab routing for arrays if error/empty
        if (data.itineraries.length === 0) {
            setActiveTab('itineraries');
            toast.error('Bắt buộc phải có ít nhất 1 ngày lịch trình');
            return;
        }
        if (data.departures.length === 0) {
            setActiveTab('departures');
            toast.error('Bắt buộc phải có ít nhất 1 lịch khởi hành');
            return;
        }
        if (data.pickup_locations.length === 0) {
            setActiveTab('pickups');
            toast.error('Bắt buộc phải cấu hình ít nhất 1 điểm đón');
            return;
        }

        if (!modal.tour && files.length === 0) {
            setActiveTab('general');
            toast.error('Vui lòng tải lên ít nhất 1 ảnh đại diện cho tour');
            return;
        }

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
            fd.append('translations', JSON.stringify(data.translations || []));

            // Images
            files.forEach(f => fd.append('images', f));

            if (modal.tour) {
                await adminService.updateTour(modal.tour.id, fd);
                toast.success('Cập nhật tour thành công!');
            } else {
                await adminService.createTour(fd);
                toast.success('Thêm tour mới thành công!');
            }
            setFiles([]);
            setModal({ open: false, tour: null });
            await fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const applyTranslatedContent = (translated, targetLang) => {
        const langIndex = targetLang === 'en' ? 0 : 1;
        const setTranslatedValue = (fieldName, value) => {
            setValue(fieldName, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        };

        Object.keys(translated).forEach(key => {
            if (key.startsWith('tour_')) {
                const field = key.replace(/^tour_/, '');
                setTranslatedValue(`translations.${langIndex}.${field}`, translated[key]);
                return;
            }

            const parts = key.split('_');
            if (parts.length === 3) {
                const index = parts[1];
                const field = parts[2];
                setTranslatedValue(`itineraries.${index}.translations.${langIndex}.${field}`, translated[key]);
            }
        });
    };

    const getVietnameseContentForTranslation = () => {
        const viData = {
            tour_title: watch('title'),
            tour_summary: watch('summary'),
            tour_highlights: watch('highlights'),
            tour_price_includes: watch('price_includes'),
            tour_price_excludes: watch('price_excludes'),
            tour_terms_and_notes: watch('terms_and_notes'),
            tour_cancellation_policy: watch('cancellation_policy'),
        };

        const itineraries = watch('itineraries') || [];
        itineraries.forEach((iti, index) => {
            viData[`iti_${index}_title`] = iti.title;
            viData[`iti_${index}_content`] = iti.content;
        });

        return viData;
    };

    const getOriginalVietnameseContentForTranslation = () => {
        if (!modal.tour) return {};

        const originalData = {
            tour_title: modal.tour.title,
            tour_summary: modal.tour.summary,
            tour_highlights: modal.tour.highlights,
            tour_price_includes: modal.tour.price_includes,
            tour_price_excludes: modal.tour.price_excludes,
            tour_terms_and_notes: modal.tour.terms_and_notes,
            tour_cancellation_policy: modal.tour.cancellation_policy,
        };

        (modal.tour.itineraries || []).forEach((iti, index) => {
            originalData[`iti_${index}_title`] = iti.title;
            originalData[`iti_${index}_content`] = iti.content;
        });

        return originalData;
    };

    const normalizeTranslationSource = (value) => String(value || '').trim();

    const getTargetTranslationValue = (key, targetLang) => {
        const langIndex = targetLang === 'en' ? 0 : 1;

        if (key.startsWith('tour_')) {
            const field = key.replace(/^tour_/, '');
            return watch(`translations.${langIndex}.${field}`);
        }

        const parts = key.split('_');
        if (parts.length === 3) {
            const index = parts[1];
            const field = parts[2];
            return watch(`itineraries.${index}.translations.${langIndex}.${field}`);
        }

        return '';
    };

    const getTranslatableFields = (viData, targetLang) => {
        const originalViData = getOriginalVietnameseContentForTranslation();

        return Object.fromEntries(
            Object.entries(viData).filter(([key, value]) => {
                const currentSource = normalizeTranslationSource(value);
                if (!currentSource) return false;

                const targetValue = normalizeTranslationSource(getTargetTranslationValue(key, targetLang));
                const originalSource = normalizeTranslationSource(originalViData[key]);
                const hasNewSource = !modal.tour || currentSource !== originalSource;

                return !targetValue || hasNewSource;
            }),
        );
    };

    const handleTranslate = async () => {
        const viData = getVietnameseContentForTranslation();

        if (Object.values(viData).every(v => !normalizeTranslationSource(v))) {
            toast.warning('Chưa có nội dung Tiếng Việt để dịch');
            return;
        }

        const targetLanguages = currentLang === 'vi' ? ['en', 'zh'] : [currentLang];
        const translationPayloadByLanguage = targetLanguages.reduce((payloads, targetLang) => {
            const fields = getTranslatableFields(viData, targetLang);
            if (Object.keys(fields).length > 0) {
                payloads[targetLang] = fields;
            }
            return payloads;
        }, {});
        const languagesToTranslate = targetLanguages.filter(targetLang => translationPayloadByLanguage[targetLang]);

        if (languagesToTranslate.length === 0) {
            toast.info('KhÃ´ng cÃ³ ná»™i dung má»›i cáº§n dá»‹ch');
            return;
        }

        try {
            setTranslating(true);
            const toastId = toast.loading(
                languagesToTranslate.length === 2 ? 'Đang dịch sang EN và ZH...' : `Đang dịch sang ${languagesToTranslate[0].toUpperCase()}...`,
            );

            for (const targetLang of languagesToTranslate) {
                const res = await adminService.translateContent({
                    texts: translationPayloadByLanguage[targetLang],
                    targetLang,
                });
                applyTranslatedContent(res.data.data, targetLang);
            }

            toast.success('Dịch tự động thành công!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi dịch tự động');
        } finally {
            setTranslating(false);
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
            // Update local state for modal
            if (modal.tour) {
                setModal(prev => ({
                    ...prev,
                    tour: {
                        ...prev.tour,
                        images: prev.tour.images.filter(img => img.id !== imageId)
                    }
                }));
            }
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

    const getMinPrice = (tour) => {
        const departures = tour.departures || [];
        if (departures.length === 0) return null;
        return Math.min(...departures.map(d => parseFloat(d.price_adult)));
    };

    // Check if a specific tab has validation errors
    const checkTabHasError = (tabKey) => {
        return Object.keys(errors).some(key => {
            if (tabKey === 'general' && ['category_id', 'title', 'summary', 'duration_days', 'duration_nights', 'highlights', 'price_includes', 'price_excludes', 'terms_and_notes', 'cancellation_policy'].includes(key)) return true;
            if (tabKey === 'itineraries' && key === 'itineraries') return true;
            if (tabKey === 'departures' && key === 'departures') return true;
            if (tabKey === 'pickups' && key === 'pickup_locations') return true;
            if (tabKey === 'options' && key === 'options') return true;
            return false;
        });
    };

    // Intercept form submission to switch to first tab with errors
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit((data) => {
            onSubmit(data);
        }, (formErrors) => {
            // Find the first tab that has an error
            for (const tab of TABS) {
                if (Object.keys(formErrors).some(key => {
                    if (tab.key === 'general' && ['category_id', 'title', 'summary', 'duration_days', 'duration_nights', 'highlights', 'price_includes', 'price_excludes', 'terms_and_notes', 'cancellation_policy'].includes(key)) return true;
                    if (tab.key === 'itineraries' && key === 'itineraries') return true;
                    if (tab.key === 'departures' && key === 'departures') return true;
                    if (tab.key === 'pickups' && key === 'pickup_locations') return true;
                    if (tab.key === 'options' && key === 'options') return true;
                    return false;
                })) {
                    setActiveTab(tab.key);
                    toast.error('Vui lòng kiểm tra lại thông tin bị lỗi trên tab này');
                    break;
                }
            }
        })(e);
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-text-muted">Tổng cộng {totalItems} tour trong hệ thống</p>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm shadow-md"
                >
                    <Plus className="w-4 h-4" /> Thêm Tour
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : (
                <div className="bg-surface rounded-2xl border border-border overflow-x-auto shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-4 py-3.5 text-left font-semibold text-text-secondary uppercase tracking-wider text-xs">Tour</th>
                                <th className="px-4 py-3.5 text-left font-semibold text-text-secondary uppercase tracking-wider text-xs hidden md:table-cell">Danh mục</th>
                                <th className="px-4 py-3.5 text-left font-semibold text-text-secondary uppercase tracking-wider text-xs">Giá từ</th>
                                <th className="px-4 py-3.5 text-left font-semibold text-text-secondary uppercase tracking-wider text-xs hidden lg:table-cell">Thời gian</th>
                                <th className="px-4 py-3.5 text-left font-semibold text-text-secondary uppercase tracking-wider text-xs hidden sm:table-cell">Trạng thái</th>
                                <th className="px-4 py-3.5 text-right font-semibold text-text-secondary uppercase tracking-wider text-xs">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map(tour => {
                                const minPrice = getMinPrice(tour);
                                return (
                                    <tr key={tour.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {tour.thumbnail_url ? (
                                                    <img src={getImageUrl(tour.thumbnail_url)} alt="" className="w-14 h-10 object-cover rounded-lg border border-border shadow-sm" />
                                                ) : (
                                                    <div className="w-14 h-10 bg-surface-alt rounded-lg border border-border flex items-center justify-center">
                                                        <Image className="w-4 h-4 text-text-muted" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-text line-clamp-1">{tour.title}</p>
                                                    {tour.tour_badge === 'featured' && <span className="text-[10px] text-white bg-gradient-to-r from-orange-400 to-red-500 font-bold px-1.5 py-0.5 rounded shadow-sm">Nổi bật</span>}
                                                    {tour.tour_badge === 'promotion' && <span className="text-[10px] text-white bg-gradient-to-r from-green-400 to-emerald-500 font-bold px-1.5 py-0.5 rounded shadow-sm">Khuyến mãi</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-text-secondary font-medium">{tour.Category?.name}</td>
                                        <td className="px-4 py-3">
                                            {minPrice ? (
                                                <p className="font-bold text-primary">{formatPrice(minPrice)}</p>
                                            ) : (
                                                <p className="text-text-muted text-xs italic">Chưa có giá</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-text-secondary font-medium text-sm">
                                            {tour.duration_days && tour.duration_nights
                                                ? `${tour.duration_days}N${tour.duration_nights}Đ`
                                                : tour.duration_days ? `${tour.duration_days} ngày` : '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-md ${tour.status === 'active' ? 'bg-success/10 text-success' :
                                                    tour.status === 'hidden' ? 'bg-warning/10 text-warning' :
                                                        'bg-error/10 text-error'
                                                }`}>
                                                {tour.status === 'active' ? 'Hoạt động' : tour.status === 'hidden' ? 'Ẩn' : 'Hết chỗ'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => openEdit(tour)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Sửa">
                                                    <Edit2 className="w-4 h-4 text-primary" />
                                                </button>
                                                <button onClick={() => handleDelete(tour.id)} className="p-2 rounded-lg hover:bg-error/10 transition-colors" title="Xóa">
                                                    <Trash2 className="w-4 h-4 text-error" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {tours.length === 0 && <div className="text-center py-12 text-text-muted font-medium">Chưa có tour nào</div>}
                </div>
            )}

            {/* Pagination Logic */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold border transition ${page === currentPage
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
                            className="inline-flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-text-muted font-medium">
                        Trang {currentPage} / {totalPages} • Tổng {totalItems} tour
                    </p>
                </div>
            )}

            {/* ═══ MULTI-TAB MODAL FORM ═══ */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ open: false, tour: null })} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] lg:h-[85vh] flex flex-col animate-fade-up ring-1 ring-white/10">
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
                            <h3 className="text-xl font-extrabold text-text tracking-tight">{modal.tour ? 'Sửa Tour' : 'Thêm Tour Mới'}</h3>
                            <button type="button" onClick={() => setModal({ open: false, tour: null })} className="p-2 rounded-xl hover:bg-surface-hover transition text-text-secondary hover:text-error hover:bg-error/10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="px-6 pt-4 border-b border-border flex gap-2 overflow-x-auto shrink-0 scrollbar-hide [&::-webkit-scrollbar]:hidden">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isError = checkTabHasError(tab.key);

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 whitespace-nowrap relative ${activeTab === tab.key
                                                ? 'bg-primary/10 text-primary border-b-2 border-primary -mb-px'
                                                : 'text-text-muted hover:text-text hover:bg-surface-alt'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-primary' : ''}`} />
                                        {tab.label}
                                        {isError && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse shadow-sm" title="Có lỗi nhập liệu"></span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Language Switcher & AI Translation */}
                        {['general', 'itineraries'].includes(activeTab) && (
                            <TranslationToolbar
                                currentLang={currentLang}
                                translating={translating}
                                onLanguageChange={setCurrentLang}
                                onTranslate={handleTranslate}
                            />
                        )}

                        {/* Tab Content */}
                        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden relative">
                            <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-surface-alt/30">
                                <div 
                                    key={activeTab} 
                                    className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-both"
                                >
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
                                            errors={errors}
                                            control={control}
                                            currentLang={currentLang}
                                        />
                                    )}
                                    {activeTab === 'itineraries' && (
                                        <ItinerariesTab control={control} register={register} watch={watch} setValue={setValue} errors={errors} currentLang={currentLang} />
                                    )}
                                    {activeTab === 'departures' && (
                                        <DeparturesTab control={control} register={register} errors={errors} />
                                    )}
                                    {activeTab === 'pickups' && (
                                        <PickupsTab control={control} register={register} errors={errors} />
                                    )}
                                    {activeTab === 'options' && (
                                        <OptionsTab control={control} register={register} errors={errors} />
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-surface rounded-b-2xl">
                                <button type="button" onClick={() => setModal({ open: false, tour: null })}
                                    className="px-6 py-2.5 bg-surface-alt text-text-secondary font-bold rounded-xl hover:bg-surface-hover transition text-sm">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        modal.tour ? 'Lưu thay đổi' : 'Thêm Tour Mới'
                                    )}
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
