/**
 * Xây dựng URL ảnh từ đường dẫn tương đối.
 * Proxy Vite sẽ forward /uploads → http://localhost:8888/uploads.
 */
export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('blob:')) return url;  // Object URL (upload preview)
    if (url.startsWith('data:')) return url;  // Base64

    // Đảm bảo bắt đầu bằng /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return cleanUrl;
};

/**
 * Placeholder SVG nội tuyến — hiển thị khi ảnh bị lỗi 404.
 * Dùng làm giá trị cho onError của thẻ <img>.
 *
 * @param {'tour' | 'banner' | 'avatar'} type - loại ảnh
 */
export const PLACEHOLDER = {
    tour:   '/placeholder-tour.jpg',
    banner: '/placeholder-banner.jpg',
    avatar: '/placeholder-avatar.png',
    default: '/placeholder-tour.jpg',
};

/**
 * Trả về hàm onError để dùng trực tiếp trên thẻ <img>:
 *   <img src={...} onError={onImgError('tour')} />
 *
 * Khi ảnh tải thất bại (404, network error…), ảnh sẽ được thay bằng placeholder
 * và sự kiện sẽ không kích hoạt lại (tránh vòng lặp vô tận).
 */
export const onImgError = (type = 'default') => (e) => {
    const fallback = PLACEHOLDER[type] || PLACEHOLDER.default;
    if (e.currentTarget.src !== window.location.origin + fallback) {
        e.currentTarget.src = fallback;
    }
};
