const fs = require('fs');
const path = require('path');

const langs = ['vi', 'en', 'zh'];
const tourTranslations = {
  vi: {
    list: {
      domesticLabel: "Tour Nội Địa",
      domesticDesc: "Khám phá vẻ đẹp Việt Nam từ Bắc đến Nam",
      internationalLabel: "Tour Quốc Tế",
      internationalDesc: "Trải nghiệm văn hóa đa dạng khắp thế giới",
      allLabel: "Kết quả tìm kiếm",
      allDesc: "Khám phá những hành trình phù hợp nhất với bạn",
      filterTitle: "Bộ lọc tìm kiếm",
      clearAll: "Xóa tất cả",
      filterDepartureDate: "Ngày khởi hành",
      filterType: "Loại tour",
      filterBudget: "Ngân sách",
      filterDeparturePoint: "Điểm khởi hành",
      filterDestination: "Điểm đến",
      filterSort: "Sắp xếp theo",
      apply: "Áp dụng",
      filterBtn: "Bộ lọc",
      showingResults: "Hiển thị {{count}} / {{total}} tour",
      noResults: "Không tìm thấy tour",
      changeFilter: "Thử thay đổi bộ lọc để xem thêm kết quả",
      clearFilterBtn: "Xóa bộ lọc"
    },
    filter: {
      all: "Tất cả",
      budgetUnder5M: "Dưới 5 triệu",
      budget5To10M: "5 - 10 triệu",
      budget10To20M: "10 - 20 triệu",
      budgetOver20M: "Trên 20 triệu",
      badgeFeatured: "Tour nổi bật",
      badgePromotion: "Tour ưu đãi"
    },
    sort: {
      default: "Mặc định",
      priceAsc: "Giá thấp → cao",
      priceDesc: "Giá cao → thấp",
      dateAsc: "Ngày khởi hành gần nhất"
    },
    detail: {
      itinerary: "Lịch trình chi tiết",
      customerExperience: "Trải nghiệm thực tế từ khách hàng",
      customerExperienceDesc: "Những chia sẻ chân thực từ khách hàng trên toàn hệ thống",
      customer: "Khách hàng",
      suggested: "Gợi ý",
      notFoundDesc: "Tour này có thể đã ngừng hoặc không tồn tại.",
      perPerson: "/người",
      photos: "Ảnh",
      highlights: "Điểm nổi bật",
      priceIncludes: "Giá bao gồm",
      priceExcludes: "Giá không bao gồm",
      termsNotes: "Điều khoản & Lưu ý",
      cancellationPolicy: "Quy định hoàn hủy"
    },
    card: {
      durationDaysNights: "{{days}} Ngày {{nights}} Đêm",
      durationDays: "{{days}} Ngày",
      from: "Giá từ",
      promotion: "Khuyến mãi",
      featured: "Nổi bật",
      contact: "Liên hệ"
    }
  },
  en: {
    list: {
      domesticLabel: "Domestic Tours",
      domesticDesc: "Discover the beauty of Vietnam from North to South",
      internationalLabel: "International Tours",
      internationalDesc: "Experience diverse cultures around the world",
      allLabel: "Search Results",
      allDesc: "Discover the best journeys for you",
      filterTitle: "Search Filters",
      clearAll: "Clear all",
      filterDepartureDate: "Departure Date",
      filterType: "Tour Type",
      filterBudget: "Budget",
      filterDeparturePoint: "Departure Point",
      filterDestination: "Destination",
      filterSort: "Sort by",
      apply: "Apply",
      filterBtn: "Filters",
      showingResults: "Showing {{count}} / {{total}} tours",
      noResults: "No tours found",
      changeFilter: "Try changing the filters to see more results",
      clearFilterBtn: "Clear filters"
    },
    filter: {
      all: "All",
      budgetUnder5M: "Under 5 million",
      budget5To10M: "5 - 10 million",
      budget10To20M: "10 - 20 million",
      budgetOver20M: "Over 20 million",
      badgeFeatured: "Featured tours",
      badgePromotion: "Promotional tours"
    },
    sort: {
      default: "Default",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low",
      dateAsc: "Earliest Departure"
    },
    detail: {
      itinerary: "Detailed Itinerary",
      customerExperience: "Customer Experiences",
      customerExperienceDesc: "Authentic shares from customers across the system",
      customer: "Customer",
      suggested: "Suggested",
      notFoundDesc: "This tour may have been discontinued or does not exist.",
      perPerson: "/person",
      photos: "Photos",
      highlights: "Highlights",
      priceIncludes: "Price Includes",
      priceExcludes: "Price Excludes",
      termsNotes: "Terms & Notes",
      cancellationPolicy: "Cancellation Policy"
    },
    card: {
      durationDaysNights: "{{days}} Days {{nights}} Nights",
      durationDays: "{{days}} Days",
      from: "From",
      promotion: "Promotion",
      featured: "Featured",
      contact: "Contact"
    }
  },
  zh: {
    list: {
      domesticLabel: "国内游",
      domesticDesc: "探索从北到南的越南之美",
      internationalLabel: "国际游",
      internationalDesc: "体验世界各地不同的文化",
      allLabel: "搜索结果",
      allDesc: "发现最适合您的旅程",
      filterTitle: "搜索过滤器",
      clearAll: "全部清除",
      filterDepartureDate: "出发日期",
      filterType: "旅游类型",
      filterBudget: "预算",
      filterDeparturePoint: "出发地",
      filterDestination: "目的地",
      filterSort: "排序方式",
      apply: "应用",
      filterBtn: "过滤器",
      showingResults: "显示 {{count}} / {{total}} 个旅游",
      noResults: "未找到旅游",
      changeFilter: "尝试更改过滤器以查看更多结果",
      clearFilterBtn: "清除过滤器"
    },
    filter: {
      all: "全部",
      budgetUnder5M: "500万以下",
      budget5To10M: "500万 - 1000万",
      budget10To20M: "1000万 - 2000万",
      budgetOver20M: "2000万以上",
      badgeFeatured: "精选旅游",
      badgePromotion: "促销旅游"
    },
    sort: {
      default: "默认",
      priceAsc: "价格：从低到高",
      priceDesc: "价格：从高到低",
      dateAsc: "最早出发"
    },
    detail: {
      itinerary: "详细行程",
      customerExperience: "客户体验",
      customerExperienceDesc: "来自系统内客户的真实分享",
      customer: "客户",
      suggested: "推荐",
      notFoundDesc: "此旅游可能已停止或不存在。",
      perPerson: "/人",
      photos: "照片",
      highlights: "亮点",
      priceIncludes: "价格包含",
      priceExcludes: "价格不包含",
      termsNotes: "条款和注意事项",
      cancellationPolicy: "取消政策"
    },
    card: {
      durationDaysNights: "{{days}} 天 {{nights}} 晚",
      durationDays: "{{days}} 天",
      from: "起价",
      promotion: "促销",
      featured: "精选",
      contact: "联系"
    }
  }
};

for (const lng of langs) {
  const filePath = path.join(__dirname, 'src', 'i18n', lng, 'tour.json');
  fs.writeFileSync(filePath, JSON.stringify(tourTranslations[lng], null, 4));
  console.log('Created ' + filePath);
}
