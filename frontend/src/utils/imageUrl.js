export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('blob:')) return url; // Bỏ qua Object URL của file upload
    if (url.startsWith('data:')) return url; // Bỏ qua base64
    
    // Đảm bảo url bắt đầu bằng /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Trả về trực tiếp đường dẫn tương đối (proxy sẽ xử lý '/uploads')
    return cleanUrl;
};
