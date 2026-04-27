import { useState, useEffect, useRef } from 'react';
import { adminService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Image, Plus, Pencil, Trash2, X, Loader2, Upload,
    Monitor, PanelLeft, PanelRight, Eye, EyeOff, Link2, Search, Check,
} from 'lucide-react';

const POSITION_MAP = {
    hero: { label: 'Hero (Trang chủ)', icon: Monitor, color: 'text-blue-500 bg-blue-50' },
    left_home: { label: 'Sidebar Trái', icon: PanelLeft, color: 'text-emerald-500 bg-emerald-50' },
    right_home: { label: 'Sidebar Phải', icon: PanelRight, color: 'text-purple-500 bg-purple-50' },
};

const BannerManagementPage = () => {
    const [banners, setBanners] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPos, setFilterPos] = useState('all');
    const [modal, setModal] = useState({ open: false, banner: null });
    const [form, setForm] = useState({ title: '', target_link: '', position: 'hero', is_active: 1 });
    const [selectedTourId, setSelectedTourId] = useState(null);
    const [selectedTourImageUrl, setSelectedTourImageUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageSource, setImageSource] = useState('tour'); // 'tour' | 'upload'
    const [tourSearch, setTourSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const fileRef = useRef(null);

    const fetchBanners = async () => {
        try {
            const res = await adminService.getBanners();
            setBanners(res.data.data || []);
        } catch { /* ignore */ }
    };

    const fetchTours = async () => {
        try {
            const res = await adminService.getTours();
            setTours(res.data.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchBanners(), fetchTours()]).finally(() => setLoading(false));
    }, []);

    // ── Filter ──
    const filtered = filterPos === 'all' ? banners : banners.filter(b => b.position === filterPos);

    // ── Tour đang chọn ──
    const selectedTour = tours.find(t => t.id === selectedTourId);
    const tourImages = selectedTour?.images || [];

    // ── Lọc tour theo search ──
    const filteredTours = tourSearch
        ? tours.filter(t => t.title.toLowerCase().includes(tourSearch.toLowerCase()))
        : tours;

    // ── Modal ──
    const openCreate = () => {
        setForm({ title: '', target_link: '', position: 'hero', is_active: 1 });
        setSelectedTourId(null);
        setSelectedTourImageUrl(null);
        setImageFile(null);
        setImagePreview(null);
        setImageSource('tour');
        setTourSearch('');
        setModal({ open: true, banner: null });
    };

    const openEdit = (banner) => {
        setForm({
            title: banner.title,
            target_link: banner.target_link || '',
            position: banner.position,
            is_active: banner.is_active,
        });
        setSelectedTourId(null);
        setSelectedTourImageUrl(null);
        setImageFile(null);
        setImagePreview(banner.image_url);
        setImageSource('upload');
        setTourSearch('');
        setModal({ open: true, banner });
    };

    const closeModal = () => {
        setModal({ open: false, banner: null });
        setImageFile(null);
        setImagePreview(null);
        setSelectedTourId(null);
        setSelectedTourImageUrl(null);
    };

    // ── Khi chọn tour → auto-fill title + target_link ──
    const handleSelectTour = (tour) => {
        setSelectedTourId(tour.id);
        setSelectedTourImageUrl(null);
        setForm(p => ({
            ...p,
            title: tour.title,
            target_link: `/tours/${tour.slug}`,
        }));
        // Tự chọn ảnh đầu tiên nếu có
        if (tour.images && tour.images.length > 0) {
            setSelectedTourImageUrl(tour.images[0].image_url);
            setImagePreview(tour.images[0].image_url);
            setImageSource('tour');
        }
    };

    // ── Khi chọn ảnh tour ──
    const handleSelectTourImage = (imageUrl) => {
        setSelectedTourImageUrl(imageUrl);
        setImagePreview(imageUrl);
        setImageFile(null);
        setImageSource('tour');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setSelectedTourImageUrl(null);
            setImageSource('upload');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('target_link', form.target_link);
            fd.append('position', form.position);
            fd.append('is_active', form.is_active);
            fd.append('tour_id', selectedTourId || '');

            if (imageSource === 'tour' && selectedTourImageUrl) {
                // Fetch ảnh từ server và convert thành file
                const imgUrl = getImageUrl(selectedTourImageUrl);
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                const fileName = selectedTourImageUrl.split('/').pop() || 'banner.jpg';
                const file = new File([blob], fileName, { type: blob.type });
                fd.append('image', file);
            } else if (imageFile) {
                fd.append('image', imageFile);
            }

            if (modal.banner) {
                await adminService.updateBanner(modal.banner.id, fd);
            } else {
                if (!imageFile && !selectedTourImageUrl) {
                    alert('Vui lòng chọn ảnh banner');
                    setSubmitting(false);
                    return;
                }
                await adminService.createBanner(fd);
            }
            closeModal();
            await fetchBanners();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
        setDeleting(id);
        try {
            await adminService.deleteBanner(id);
            await fetchBanners();
        } catch {
            alert('Lỗi xóa banner');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <AdminLayout>
            {/* ═══ PAGE HEADER ═══ */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-text-muted">
                    Quản lý banner hiển thị trên trang chủ: Hero, Sidebar trái, Sidebar phải
                </p>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm Banner
                </button>
            </div>

            {/* ═══ STATS ═══ */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
                    {[
                        { key: 'all', label: 'Tất cả', count: banners.length, icon: Image, color: 'text-text-secondary bg-surface-alt' },
                        ...Object.entries(POSITION_MAP).map(([key, val]) => ({
                            key,
                            label: val.label,
                            count: banners.filter(b => b.position === key).length,
                            icon: val.icon,
                            color: val.color,
                        })),
                    ].map(stat => (
                        <button
                            key={stat.key}
                            onClick={() => setFilterPos(stat.key)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${filterPos === stat.key
                                ? 'border-primary/30 bg-primary/5 shadow-sm'
                                : 'border-border bg-surface hover:border-primary/20'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-text">{stat.count}</p>
                                <p className="text-xs text-text-muted">{stat.label}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* ═══ BANNER GRID ═══ */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">Đang tải dữ liệu...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
                        <Image className="w-8 h-8 text-text-muted" />
                    </div>
                    <p className="text-text-muted font-medium">Chưa có banner nào</p>
                    <p className="text-sm text-text-muted mt-1">Nhấn "Thêm Banner" để tạo mới</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
                    {filtered.map((banner) => {
                        const posInfo = POSITION_MAP[banner.position] || {};
                        const PosIcon = posInfo.icon || Image;
                        return (
                            <div
                                key={banner.id}
                                className="group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                            >
                                <div className="relative aspect-video bg-surface-alt overflow-hidden">
                                    <img
                                        src={getImageUrl(banner.image_url)}
                                        alt={banner.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => openEdit(banner)}
                                            className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-primary hover:text-white transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            disabled={deleting === banner.id}
                                            className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-error hover:text-white transition-colors disabled:opacity-50"
                                            title="Xóa"
                                        >
                                            {deleting === banner.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${posInfo.color}`}>
                                        <PosIcon className="w-3.5 h-3.5" />
                                        {posInfo.label}
                                    </div>
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${banner.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {banner.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text truncate" title={banner.title}>{banner.title}</h3>
                                    {banner.target_link && (
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <Link2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                            <span className="text-xs text-primary truncate">{banner.target_link}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ MODAL ═══ */}
            {modal.open && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text">
                                    {modal.banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                                </h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {modal.banner ? 'Cập nhật thông tin banner' : 'Chọn tour và ảnh để tạo banner'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            {/* ── STEP 1: Chọn Tour (chỉ khi tạo mới) ── */}
                            {!modal.banner && (
                                <div>
                                    <label className="text-sm font-semibold text-text mb-1.5 block">
                                        Bước 1: Chọn Tour <span className="text-error">*</span>
                                    </label>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            value={tourSearch}
                                            onChange={e => setTourSearch(e.target.value)}
                                            placeholder="Tìm tour theo tên..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-2 bg-surface-alt">
                                        {filteredTours.length === 0 ? (
                                            <p className="text-center text-text-muted text-sm py-4">Không tìm thấy tour</p>
                                        ) : (
                                            filteredTours.map(tour => (
                                                <button
                                                    key={tour.id}
                                                    type="button"
                                                    onClick={() => handleSelectTour(tour)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${selectedTourId === tour.id
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'hover:bg-surface-hover text-text'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-surface-alt overflow-hidden shrink-0 border border-border">
                                                        {tour.thumbnail_url ? (
                                                            <img src={getImageUrl(tour.thumbnail_url)} alt="" className="w-full h-full object-cover" />
                                                        ) : tour.images?.[0] ? (
                                                            <img src={getImageUrl(tour.images[0].image_url)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Image className="w-4 h-4 text-text-muted" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{tour.title}</p>
                                                        <p className="text-xs text-text-muted truncate">/tours/{tour.slug}</p>
                                                    </div>
                                                    {selectedTourId === tour.id && (
                                                        <Check className="w-4 h-4 text-primary shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Chọn Ảnh ── */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    {modal.banner ? 'Ảnh Banner' : 'Bước 2: Chọn ảnh'}
                                    {!modal.banner && <span className="text-error"> *</span>}
                                </label>

                                {/* Grid ảnh tour có sẵn */}
                                {!modal.banner && tourImages.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-text-muted mb-2">Chọn từ ảnh tour:</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {tourImages.map(img => (
                                                <button
                                                    key={img.id}
                                                    type="button"
                                                    onClick={() => handleSelectTourImage(img.image_url)}
                                                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${selectedTourImageUrl === img.image_url
                                                        ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                                                        : 'border-border hover:border-primary/40'
                                                        }`}
                                                >
                                                    <img
                                                        src={getImageUrl(img.image_url)}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {selectedTourImageUrl === img.image_url && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload ảnh tùy chỉnh */}
                                <div>
                                    {(!modal.banner && tourImages.length > 0) && (
                                        <p className="text-xs text-text-muted mb-2">Hoặc upload ảnh riêng:</p>
                                    )}
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors group/upload"
                                    >
                                        {(imageSource === 'upload' && imagePreview) || (modal.banner && imagePreview && !selectedTourImageUrl) ? (
                                            <div className="relative aspect-video">
                                                <img
                                                    src={imagePreview?.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/30 transition-colors flex items-center justify-center">
                                                    <div className="opacity-0 group-hover/upload:opacity-100 transition-opacity bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-text">
                                                        Đổi ảnh
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                                                <Upload className="w-6 h-6 mb-2" />
                                                <p className="text-sm font-medium">Nhấn để upload ảnh</p>
                                                <p className="text-xs mt-1">JPG, PNG, WebP (tối đa 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* ── Thông tin tự động (hiện khi đã chọn tour hoặc đang edit) ── */}
                            {(selectedTourId || modal.banner) && (
                                <>
                                    <div>
                                        <label className="text-sm font-semibold text-text mb-1.5 block">
                                            Tiêu đề Banner
                                        </label>
                                        <input
                                            value={form.title}
                                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                            placeholder="Tiêu đề banner..."
                                            className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-text mb-1.5 block">
                                            Link đến tour
                                        </label>
                                        <input
                                            value={form.target_link}
                                            onChange={e => setForm(p => ({ ...p, target_link: e.target.value }))}
                                            placeholder="/tours/slug-tour"
                                            className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Position */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    Vị trí hiển thị <span className="text-error">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(POSITION_MAP).map(([key, val]) => {
                                        const isSelected = form.position === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, position: key }))}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-surface-alt text-text-secondary hover:border-primary/30'
                                                    }`}
                                            >
                                                <val.icon className="w-5 h-5" />
                                                {val.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active === 1}
                                        onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5.5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-[18px] after:shadow-sm" />
                                </label>
                                <div>
                                    <p className="text-sm font-medium text-text">Hiển thị công khai</p>
                                    <p className="text-xs text-text-muted">Banner sẽ xuất hiện trên trang chủ</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || (!modal.banner && !selectedTourId)}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {modal.banner ? 'Cập nhật' : 'Tạo Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BannerManagementPage;
