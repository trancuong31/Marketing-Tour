-- Thêm cột images vào bảng votes để lưu trữ hình ảnh đánh giá (dạng chuỗi JSON)
ALTER TABLE votes ADD COLUMN images JSON NULL;
