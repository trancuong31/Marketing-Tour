import { useState, useEffect, useRef } from 'react';
import { adminService, categoryService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Edit2, Trash2, Loader2, X, Image, Upload } from 'lucide-react';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const TourManagementPage = () => {
    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, tour: null });
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '', title: '', summary: '', content: '',
        price_adult: '', sale_price_adult: '',
        price_child: '', sale_price_child: '',
        price_infant: '', sale_price_infant: '',
        departure_point: '', duration_days: '', duration_nights: '',
        tour_badge: 'none', status: 'active',
    });
    const [files, setFiles] = useState([]);
    const editorRef = useRef(null);
    const [ReactQuill, setReactQuill] = useState(null);

    useEffect(() => {
        import('react-quill-new').then(mod => setReactQuill(() => mod.default));
        import('react-quill-new/dist/quill.snow.css');
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [toursRes, catsRes] = await Promise.all([
                adminService.getTours(),
                categoryService.getAll(),
            ]);
            setTours(toursRes.data.data || []);
            setCategories(catsRes.data.data || []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setFormData({
            category_id: categories[0]?.id || '', title: '', summary: '', content: '',
            price_adult: '', sale_price_adult: '',
            price_child: '', sale_price_child: '',
            price_infant: '', sale_price_infant: '',
            departure_point: '', duration_days: '', duration_nights: '',
            tour_badge: 'none', status: 'active',
        });
        setFiles([]);
        setModal({ open: true, tour: null });
    };

    const openEdit = (tour) => {
        setFormData({
            category_id: tour.category_id, title: tour.title, summary: tour.summary || '',
            content: tour.content || '',
            price_adult: tour.price_adult || '', sale_price_adult: tour.sale_price_adult || '',
            price_child: tour.price_child || '', sale_price_child: tour.sale_price_child || '',
            price_infant: tour.price_infant || '', sale_price_infant: tour.sale_price_infant || '',
            departure_point: tour.departure_point || '',
            duration_days: tour.duration_days || '', duration_nights: tour.duration_nights || '',
            tour_badge: tour.tour_badge, status: tour.status,
        });
        setFiles([]);
        setModal({ open: true, tour });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== '' && val !== null && val !== undefined) fd.append(key, val);
            });
            files.forEach(f => fd.append('images', f));

            if (modal.tour) {
                await adminService.updateTour(modal.tour.id, fd);
            } else {
                await adminService.createTour(fd);
            }
            setModal({ open: false, tour: null });
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu tour');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa tour này?')) return;
        try {
            await adminService.deleteTour(id);
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi xóa tour');
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await adminService.deleteTourImage(imageId);
            await fetchData();
        } catch (err) {
            alert('Lỗi xóa ảnh');
        }
    };

    const f = (key, value) => setFormData(p => ({ ...p, [key]: value }));

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
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Giá người lớn</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden lg:table-cell">Thời gian</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">Trạng thái</th>
                                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map(tour => (
                                <tr key={tour.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {tour.thumbnail_url ? (
                                                <img src={tour.thumbnail_url} alt="" className="w-12 h-9 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-12 h-9 bg-surface-alt rounded-lg flex items-center justify-center">
                                                    <Image className="w-4 h-4 text-text-muted" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-text line-clamp-1">{tour.title}</p>
                                                {tour.tour_badge === 'featured' ? <span className="text-xs text-secondary font-bold">⭐ Nổi bật</span> : null}
                                                {tour.tour_badge === 'promotion' ? <span className="text-xs text-secondary font-bold">🏷️ Khuyến mãi</span> : null}
                                                {tour.tour_badge === 'none' ? <span className="text-xs text-secondary font-bold">Không có</span> : null}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{tour.Category?.name}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-primary">{formatPrice(tour.price_adult)}</p>
                                        {tour.sale_price_adult && parseFloat(tour.sale_price_adult) < parseFloat(tour.price_adult) && (
                                            <p className="text-xs text-error line-through">{formatPrice(tour.sale_price_adult)}</p>
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
                            ))}
                        </tbody>
                    </table>
                    {tours.length === 0 && <div className="text-center py-12 text-text-muted">Chưa có tour nào</div>}
                </div>
            )}

            {/* ═══ MODAL FORM ═══ */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal({ open: false, tour: null })} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text">{modal.tour ? 'Sửa Tour' : 'Thêm Tour Mới'}</h3>
                            <button onClick={() => setModal({ open: false, tour: null })} className="p-1 rounded-lg hover:bg-surface-hover">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Category & Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-text mb-1 block">Danh mục *</label>
                                    <select value={formData.category_id} onChange={e => f('category_id', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text mb-1 block">Trạng thái</label>
                                    <select value={formData.status} onChange={e => f('status', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        <option value="active">Hoạt động</option>
                                        <option value="hidden">Ẩn</option>
                                        <option value="sold_out">Hết chỗ</option>
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium text-text mb-1 block">Tên tour *</label>
                                <input value={formData.title} onChange={e => f('title', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="text-sm font-medium text-text mb-1 block">Tóm tắt</label>
                                <textarea value={formData.summary} onChange={e => f('summary', e.target.value)}
                                    rows={2} className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                            </div>

                            {/* ═══ GIÁ TOUR ═══ */}
                            <div className="p-4 bg-surface-alt rounded-xl border border-border space-y-3">
                                <h4 className="text-sm font-bold text-text">Bảng giá tour</h4>

                                {/* Người lớn */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá người lớn (VNĐ) *</label>
                                        <input type="number" value={formData.price_adult} onChange={e => f('price_adult', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required placeholder="VD: 3500000" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá KM người lớn</label>
                                        <input type="number" value={formData.sale_price_adult} onChange={e => f('sale_price_adult', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Để trống nếu không KM" />
                                    </div>
                                </div>

                                {/* Trẻ em */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá trẻ em (2-10 tuổi)</label>
                                        <input type="number" value={formData.price_child} onChange={e => f('price_child', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="VD: 2000000" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá KM trẻ em</label>
                                        <input type="number" value={formData.sale_price_child} onChange={e => f('sale_price_child', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Để trống nếu không KM" />
                                    </div>
                                </div>

                                {/* Trẻ nhỏ */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá trẻ nhỏ (dưới 2 tuổi)</label>
                                        <input type="number" value={formData.price_infant} onChange={e => f('price_infant', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="VD: 500000" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Giá KM trẻ nhỏ</label>
                                        <input type="number" value={formData.sale_price_infant} onChange={e => f('sale_price_infant', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Để trống nếu không KM" />
                                    </div>
                                </div>
                            </div>

                            {/* Thời gian & Khởi hành */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-text mb-1 block">Số ngày</label>
                                    <input type="number" value={formData.duration_days} onChange={e => f('duration_days', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="VD: 3" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text mb-1 block">Số đêm</label>
                                    <input type="number" value={formData.duration_nights} onChange={e => f('duration_nights', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="VD: 2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text mb-1 block">Khởi hành từ</label>
                                    <input value={formData.departure_point} onChange={e => f('departure_point', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="VD: TP.HCM" />
                                </div>
                            </div>

                            {/* Featured */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.tour_badge === 'featured'}
                                    onChange={e => f('tour_badge', e.target.checked ? 'featured' : 'none')}
                                    className="w-4 h-4 rounded border-border text-primary" />
                                <span className="text-sm text-text">Tour nổi bật</span>

                                <input type="checkbox" checked={formData.tour_badge === 'promotion'}
                                    onChange={e => f('tour_badge', e.target.checked ? 'promotion' : 'none')}
                                    className="w-4 h-4 rounded border-border text-primary" />
                                <span className="text-sm text-text">Tour khuyến mãi</span>

                                <input type="checkbox" checked={formData.tour_badge === 'none'}
                                    onChange={e => f('tour_badge', e.target.checked ? 'none' : 'none')}
                                    className="w-4 h-4 rounded border-border text-primary" />
                                <span className="text-sm text-text">Không có</span>
                            </label>

                            {/* Rich Text Editor */}
                            <div>
                                <label className="text-sm font-medium text-text mb-1 block">Nội dung chi tiết</label>
                                {ReactQuill ? (
                                    <ReactQuill ref={editorRef} theme="snow" value={formData.content}
                                        onChange={val => f('content', val)}
                                        className="bg-surface rounded-xl [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[150px]" />
                                ) : (
                                    <textarea value={formData.content} onChange={e => f('content', e.target.value)}
                                        rows={6} className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm" placeholder="Nội dung HTML..." />
                                )}
                            </div>

                            {/* Existing Images */}
                            {modal.tour?.images?.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-text mb-2 block">Ảnh hiện tại</label>
                                    <div className="flex flex-wrap gap-2">
                                        {modal.tour.images.map(img => (
                                            <div key={img.id} className="relative group">
                                                <img src={img.image_url} alt="" className="w-20 h-15 object-cover rounded-lg" />
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

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal({ open: false, tour: null })}
                                    className="flex-1 py-2.5 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm">Hủy</button>
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
