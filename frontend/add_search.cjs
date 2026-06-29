const fs = require('fs');
const path = require('path');

const langs = ['vi', 'en', 'zh'];
const searchTranslations = {
  vi: {
    allPrices: 'Tất cả mức giá',
    under5M: 'Dưới 5 triệu',
    '5to10M': 'Từ 5 - 10 triệu',
    '10to20M': 'Từ 10 - 20 triệu',
    over20M: 'Trên 20 triệu',
    destinationLabel: 'Bạn muốn đi đâu?',
    destinationPlaceholder: 'Tên tour, điểm đến...',
    departureLabel: 'Ngày khởi hành',
    budgetLabel: 'Ngân sách',
    button: 'Tìm Kiếm'
  },
  en: {
    allPrices: 'All prices',
    under5M: 'Under 5 million',
    '5to10M': '5 - 10 million',
    '10to20M': '10 - 20 million',
    over20M: 'Over 20 million',
    destinationLabel: 'Where do you want to go?',
    destinationPlaceholder: 'Tour name, destination...',
    departureLabel: 'Departure date',
    budgetLabel: 'Budget',
    button: 'Search'
  },
  zh: {
    allPrices: '所有价格',
    under5M: '500万以下',
    '5to10M': '500万 - 1000万',
    '10to20M': '1000万 - 2000万',
    over20M: '2000万以上',
    destinationLabel: '你想去哪里？',
    destinationPlaceholder: '旅游名称，目的地...',
    departureLabel: '出发日期',
    budgetLabel: '预算',
    button: '搜索'
  }
};

for (const lng of langs) {
  const filePath = path.join(__dirname, 'src', 'i18n', lng, 'home.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.search = searchTranslations[lng];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log('Updated ' + filePath);
  }
}
