const mockTourFindAll = jest.fn();
const mockTourFindOne = jest.fn();
const mockLoggerWarn = jest.fn();

jest.mock('../../src/models', () => ({
  Tour: {
    findAll: mockTourFindAll,
    findOne: mockTourFindOne,
  },
  TourImage: {},
  TourItinerary: {},
  TourDeparture: {},
  TourPickupLocation: {},
  TourOption: {},
  Category: {},
  Banner: {},
  TourTranslation: {},
  CategoryTranslation: {},
  TourItineraryTranslation: {},
}));

jest.mock('../../src/config/logger', () => ({ warn: mockLoggerWarn }));

const { getTours, getTourBySlug } = require('../../src/controllers/tourController');

const sourceFields = {
  id: 31,
  title: 'Tour Đà Nẵng',
  slug: 'tour-da-nang',
  summary: 'Khám phá thành phố biển.',
  highlights: 'Thăm phố cổ Hội An.',
  price_includes: '<p>Vé máy bay và khách sạn.</p>',
  price_excludes: '<p>Chi phí cá nhân.</p>',
  terms_and_notes: '<p>Áp dụng theo quy định.</p>',
  cancellation_policy: '<p>Liên hệ để được hỗ trợ.</p>',
  images: [],
  departures: [],
  itineraries: [],
  pickupLocations: [],
  options: [],
  Category: null,
};

const translationRows = {
  en: {
    language: 'en',
    title: 'Da Nang Tour',
    slug: 'da-nang-tour',
    summary: 'Explore the coastal city.',
    highlights: 'Visit Hoi An ancient town.',
    price_includes: '<p>Flight tickets and hotel accommodation.</p>',
    price_excludes: '<p>Personal expenses.</p>',
    terms_and_notes: '<p>Terms apply.</p>',
    cancellation_policy: '<p>Contact us for support.</p>',
  },
  zh: {
    language: 'zh',
    title: '岘港之旅',
    slug: 'xian-gang-zhi-lv',
    summary: '探索海滨城市。',
    highlights: '游览会安古镇。',
    price_includes: '<p>往返机票和酒店住宿。</p>',
    price_excludes: '<p>个人费用。</p>',
    terms_and_notes: '<p>适用相关规定。</p>',
    cancellation_policy: '<p>请联系我们获得帮助。</p>',
  },
};

const invokeEndpoint = async (endpoint, language, fixture) => {
  const record = { toJSON: () => structuredClone(fixture) };
  mockTourFindAll.mockResolvedValue([record]);
  mockTourFindOne.mockResolvedValue(record);

  const response = {
    vary: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  const request = endpoint === getTours
    ? { language, query: {} }
    : { language, params: { slug: 'tour-da-nang' } };

  endpoint(request, response, next);
  await new Promise((resolve) => setImmediate(resolve));
  expect(next).not.toHaveBeenCalled();
  expect(response.vary).toHaveBeenCalledWith('x-language');
  return response.json.mock.calls[0][0].data;
};

describe.each([
  ['list', getTours],
  ['detail', getTourBySlug],
])('%s endpoint locale resolution', (_name, endpoint) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns valid Vietnamese source fields for VI', async () => {
    const fixture = { ...sourceFields, translations: [translationRows.en, translationRows.zh] };
    const response = await invokeEndpoint(endpoint, 'vi', fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBe(sourceFields.price_includes);
    expect(data.locale_content_status.price_includes).toBe('available');
  });

  it('does not return suspicious English or Chinese source content for VI', async () => {
    const fixture = {
      ...sourceFields,
      price_includes: 'Round-trip airline tickets and hotel accommodation.',
      price_excludes: '往返机票和酒店住宿服务。',
      translations: [translationRows.en, translationRows.zh],
    };
    const response = await invokeEndpoint(endpoint, 'vi', fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBeNull();
    expect(data.price_excludes).toBeNull();
    expect(data.locale_content_status.price_includes).toBe('unverified');
    expect(mockLoggerWarn).toHaveBeenCalled();
  });

  it.each([
    ['en', translationRows.en],
    ['zh', translationRows.zh],
  ])('returns only the %s translation row', async (language, expected) => {
    const fixture = {
      ...sourceFields,
      translations: [translationRows.en, translationRows.zh],
    };
    const response = await invokeEndpoint(endpoint, language, fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBe(expected.price_includes);
    expect(data.title).toBe(expected.title);
    expect(data.locale_content_status.price_includes).toBe('available');
  });

  it.each(['en', 'zh'])('does not use source when the %s row is missing', async (language) => {
    const fixture = { ...sourceFields, translations: [] };
    const response = await invokeEndpoint(endpoint, language, fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBeNull();
    expect(data.title).toBeNull();
    expect(data.slug).toBeNull();
    expect(data.locale_content_status.price_includes).toBe('missing');
  });

  it.each(['en', 'zh'])('does not fall back when the %s field is empty', async (language) => {
    const fixture = {
      ...sourceFields,
      translations: [{ ...translationRows[language], price_includes: '' }],
    };
    const response = await invokeEndpoint(endpoint, language, fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBeNull();
    expect(data.locale_content_status.price_includes).toBe('missing');
  });

  it('does not fall back to translations when a Vietnamese source is missing', async () => {
    const fixture = {
      ...sourceFields,
      price_includes: null,
      translations: [translationRows.en, translationRows.zh],
    };
    const response = await invokeEndpoint(endpoint, 'vi', fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBeNull();
    expect(data.locale_content_status.price_includes).toBe('missing');
  });

  it('does not fall back to a Vietnamese category name for EN/ZH', async () => {
    const fixture = {
      ...sourceFields,
      Category: {
        id: 6,
        name: 'Tên danh mục nguồn',
        slug: 'ten-danh-muc-nguon',
        is_international: 1,
        translations: [],
      },
      translations: [translationRows.en, translationRows.zh],
    };
    const response = await invokeEndpoint(endpoint, 'en', fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.Category.name).toBeNull();
    expect(data.Category.slug).toBeNull();
  });

  it('rejects a Chinese value mistakenly saved in the EN row', async () => {
    const fixture = {
      ...sourceFields,
      translations: [{ ...translationRows.en, price_includes: '往返机票和酒店住宿。' }],
    };
    const response = await invokeEndpoint(endpoint, 'en', fixture);
    const data = endpoint === getTours ? response[0] : response;

    expect(data.price_includes).toBeNull();
    expect(data.locale_content_status.price_includes).toBe('unverified');
  });
});

describe('detail itinerary locale resolution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not return suspicious VI itinerary source or fall back from missing translations', async () => {
    const fixture = {
      ...sourceFields,
      itineraries: [{
        id: 9,
        tour_id: sourceFields.id,
        title: 'Visit the coastal city',
        content: 'Enjoy hotel accommodation and airport transfers.',
        translations: [translationRows.en, translationRows.zh],
      }],
    };
    const data = await invokeEndpoint(getTourBySlug, 'vi', fixture);

    expect(data.itineraries[0].title).toBeNull();
    expect(data.itineraries[0].content).toBeNull();
    expect(data.itineraries[0].locale_content_status.content).toBe('unverified');
  });

  it('uses only the matching EN itinerary row', async () => {
    const fixture = {
      ...sourceFields,
      itineraries: [{
        id: 9,
        tour_id: sourceFields.id,
        title: 'Ngày đầu',
        content: 'Nội dung nguồn VI.',
        translations: [{
          language: 'en',
          title: 'First day',
          content: 'Visit the coastal city and enjoy hotel accommodation.',
        }],
      }],
    };
    const data = await invokeEndpoint(getTourBySlug, 'en', fixture);

    expect(data.itineraries[0].title).toBe('First day');
    expect(data.itineraries[0].content).toBe('Visit the coastal city and enjoy hotel accommodation.');
  });
});
