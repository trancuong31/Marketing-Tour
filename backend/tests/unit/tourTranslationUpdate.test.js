const mockTourFindOne = jest.fn();
const mockTourFindByPk = jest.fn();
const mockTourCreate = jest.fn();
const mockTourTranslationFindOne = jest.fn();
const mockTourTranslationCreate = jest.fn();
const mockTourTranslationDestroy = jest.fn();
const mockTourTranslationBulkCreate = jest.fn();
const mockTourDepartureFindAll = jest.fn();
const mockTourImageFindAll = jest.fn();
const mockTourItineraryDestroy = jest.fn();
const mockTourPickupLocationDestroy = jest.fn();
const mockTourOptionDestroy = jest.fn();

const mockRollback = jest.fn();
const mockCommit = jest.fn();

const mockTransaction = {
  LOCK: { UPDATE: 'UPDATE' },
  rollback: mockRollback,
  commit: mockCommit,
};

jest.mock('../../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn(async (callback) => {
      try {
        const result = await callback(mockTransaction);
        await mockCommit();
        return result;
      } catch (err) {
        await mockRollback();
        throw err;
      }
    }),
  },
}));

jest.mock('../../src/models', () => {
  const Tour = {
    findOne: mockTourFindOne,
    findByPk: mockTourFindByPk,
    create: mockTourCreate,
  };
  const TourTranslation = {
    findOne: mockTourTranslationFindOne,
    create: mockTourTranslationCreate,
    destroy: mockTourTranslationDestroy,
    bulkCreate: mockTourTranslationBulkCreate,
  };
  const TourDeparture = {
    findAll: mockTourDepartureFindAll,
    destroy: jest.fn(),
    create: jest.fn(),
  };
  const TourImage = {
    findAll: mockTourImageFindAll,
    bulkCreate: jest.fn(),
  };
  const TourItinerary = {
    destroy: mockTourItineraryDestroy,
    create: jest.fn(),
  };
  const TourItineraryTranslation = {
    bulkCreate: jest.fn(),
  };
  const TourPickupLocation = {
    destroy: mockTourPickupLocationDestroy,
    bulkCreate: jest.fn(),
  };
  const TourOption = {
    destroy: mockTourOptionDestroy,
    bulkCreate: jest.fn(),
  };
  const Booking = {
    findAll: jest.fn().mockResolvedValue([]),
  };
  const Category = {};

  return {
    Tour,
    TourTranslation,
    TourDeparture,
    TourImage,
    TourItinerary,
    TourItineraryTranslation,
    TourPickupLocation,
    TourOption,
    Booking,
    Category,
  };
});

const { createTour, updateTour } = require('../../src/controllers/adminController');

const callUpdateTour = (req, res, next) =>
  new Promise((resolve) => {
    const wrappedRes = {
      status: jest.fn((code) => {
        res.status(code);
        return wrappedRes;
      }),
      json: jest.fn((data) => {
        res.json(data);
        resolve({ type: 'success', data });
        return wrappedRes;
      }),
    };

    const wrappedNext = jest.fn((err) => {
      next(err);
      resolve({ type: 'error', error: err });
    });

    updateTour(req, wrappedRes, wrappedNext);
  });

const callCreateTour = (req, res, next) =>
  new Promise((resolve) => {
    const wrappedRes = {
      status: jest.fn((code) => {
        res.status(code);
        return wrappedRes;
      }),
      json: jest.fn((data) => {
        res.json(data);
        resolve({ type: 'success', data });
        return wrappedRes;
      }),
    };
    const wrappedNext = jest.fn((err) => {
      next(err);
      resolve({ type: 'error', error: err });
    });

    createTour(req, wrappedRes, wrappedNext);
  });

describe('Tour Translation Update - Architecture Regression Tests', () => {
  let mockTour;
  let mockExistingEn;
  let mockExistingZh;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExistingEn = {
      id: 10,
      tour_id: 1,
      language: 'en',
      title: 'Original EN Title',
      slug: 'original-en-title',
      summary: 'Original EN Summary',
      highlights: 'Original EN Highlights',
      price_includes: 'Original EN Includes',
      price_excludes: 'Original EN Excludes',
      terms_and_notes: 'Original EN Terms',
      cancellation_policy: 'Original EN Policy',
      update: jest.fn().mockResolvedValue(true),
      destroy: jest.fn().mockResolvedValue(true),
    };

    mockExistingZh = {
      id: 11,
      tour_id: 1,
      language: 'zh',
      title: '原始中文标题',
      slug: 'original-zh-title',
      summary: '原始中文概述',
      highlights: '原始中文亮点',
      price_includes: '原始中文包含',
      price_excludes: '原始中文不包含',
      terms_and_notes: '原始中文条款',
      cancellation_policy: '原始中文政策',
      update: jest.fn().mockResolvedValue(true),
      destroy: jest.fn().mockResolvedValue(true),
    };

    mockTour = {
      id: 1,
      title: 'Tour Sapa Gốc',
      slug: 'tour-sapa-goc',
      category_id: 2,
      summary: 'Tóm tắt gốc',
      highlights: 'Điểm nổi bật gốc',
      price_includes: 'Giá bao gồm gốc',
      price_excludes: 'Giá không bao gồm gốc',
      terms_and_notes: 'Điều khoản gốc',
      cancellation_policy: 'Chính sách hoàn hủy gốc',
      duration_days: 3,
      duration_nights: 2,
      tour_badge: 'hot',
      status: 'active',
      update: jest.fn().mockResolvedValue(true),
    };

    mockTourFindByPk.mockResolvedValue(mockTour);
    mockTourFindOne.mockResolvedValue(null); // No slug collision

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('1. Cập nhật riêng EN không làm mất hoặc thay đổi ZH', async () => {
    mockTourTranslationFindOne.mockImplementation(({ where }) => {
      if (where.language === 'en') return Promise.resolve(mockExistingEn);
      if (where.language === 'zh') return Promise.resolve(mockExistingZh);
      return Promise.resolve(null);
    });

    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'en',
            title: 'Updated English Title',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    // Global destroy MUST NEVER be called
    expect(mockTourTranslationDestroy).not.toHaveBeenCalled();
    expect(mockTourTranslationBulkCreate).not.toHaveBeenCalled();

    // EN should be queried and updated
    expect(mockExistingEn.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated English Title' }),
      expect.objectContaining({ transaction: mockTransaction })
    );

    // ZH was not in payload -> should NEVER be updated or destroyed
    expect(mockExistingZh.update).not.toHaveBeenCalled();
    expect(mockExistingZh.destroy).not.toHaveBeenCalled();
  });

  it('2. Cập nhật riêng ZH không làm mất hoặc thay đổi EN', async () => {
    mockTourTranslationFindOne.mockImplementation(({ where }) => {
      if (where.language === 'en') return Promise.resolve(mockExistingEn);
      if (where.language === 'zh') return Promise.resolve(mockExistingZh);
      return Promise.resolve(null);
    });

    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'zh',
            title: '更新的中文标题',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    expect(mockTourTranslationDestroy).not.toHaveBeenCalled();

    // ZH should be updated
    expect(mockExistingZh.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: '更新的中文标题' }),
      expect.objectContaining({ transaction: mockTransaction })
    );

    // EN was not in payload -> should NEVER be updated or destroyed
    expect(mockExistingEn.update).not.toHaveBeenCalled();
    expect(mockExistingEn.destroy).not.toHaveBeenCalled();
  });

  it('3. Cập nhật tour không có translations giữ nguyên toàn bộ bản dịch', async () => {
    const req = {
      params: { id: 1 },
      body: {
        title: 'Tour Sapa Cập Nhật Tên',
        // translations is undefined
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    // Neither findOne, create, update, nor destroy should be invoked on TourTranslation
    expect(mockTourTranslationFindOne).not.toHaveBeenCalled();
    expect(mockTourTranslationCreate).not.toHaveBeenCalled();
    expect(mockTourTranslationDestroy).not.toHaveBeenCalled();
    expect(mockTourTranslationBulkCreate).not.toHaveBeenCalled();
  });

  it('4. Payload thiếu một trường không vô tình xóa trường đã lưu', async () => {
    mockTourTranslationFindOne.mockImplementation(({ where }) => {
      if (where.language === 'en') return Promise.resolve(mockExistingEn);
      return Promise.resolve(null);
    });

    // Client only updates title, omitting summary, highlights, price_includes, etc.
    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'en',
            title: 'Only Title Changed',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockExistingEn.update).toHaveBeenCalledTimes(1);

    const updatePayload = mockExistingEn.update.mock.calls[0][0];
    expect(updatePayload).toHaveProperty('title', 'Only Title Changed');

    // Missing fields MUST NOT be present in updatePayload as null/empty
    expect(updatePayload).not.toHaveProperty('summary');
    expect(updatePayload).not.toHaveProperty('highlights');
    expect(updatePayload).not.toHaveProperty('price_includes');
    expect(updatePayload).not.toHaveProperty('price_excludes');
    expect(updatePayload).not.toHaveProperty('terms_and_notes');
    expect(updatePayload).not.toHaveProperty('cancellation_policy');
  });

  it('5. Trường rỗng không xóa nội dung bản dịch đã lưu', async () => {
    mockTourTranslationFindOne.mockImplementation(({ where }) => {
      if (where.language === 'zh') return Promise.resolve(mockExistingZh);
      return Promise.resolve(null);
    });

    // Empty frontend defaults must not erase already saved ZH content.
    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'zh',
            title: '',
            summary: '',
            highlights: '',
            price_includes: '',
            price_excludes: '',
            terms_and_notes: '',
            cancellation_policy: '',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockExistingZh.destroy).not.toHaveBeenCalled();
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('6. Từ chối ngôn ngữ không hợp lệ và không cập nhật một phần', async () => {
    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'fr',
            title: 'Tour en Français',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('Ngôn ngữ bản dịch không hợp lệ');

    // Nothing should have been modified
    expect(mockTourTranslationCreate).not.toHaveBeenCalled();
    expect(mockTourTranslationDestroy).not.toHaveBeenCalled();
  });

  it('7. Thêm mới bản dịch cho ngôn ngữ chưa có khi có nội dung hợp lệ', async () => {
    // ZH does not exist yet
    mockTourTranslationFindOne.mockResolvedValue(null);

    const req = {
      params: { id: 1 },
      body: {
        translations: [
          {
            language: 'zh',
            title: '新创建的中文旅游',
            summary: '中文概述',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTourTranslationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tour_id: 1,
        language: 'zh',
        title: '新创建的中文旅游',
        summary: '中文概述',
      }),
      expect.objectContaining({ transaction: mockTransaction })
    );
  });

  it('7a. Retry cập nhật EN sửa hàng hiện có thay vì tạo hàng dịch trùng', async () => {
    mockTourTranslationFindOne.mockResolvedValue(mockExistingEn);
    const request = {
      params: { id: 1 },
      body: {
        translations: [{ language: 'en', title: 'Updated English title' }],
      },
    };

    await callUpdateTour(request, res, next);
    await callUpdateTour(request, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTourTranslationFindOne).toHaveBeenCalledTimes(2);
    expect(mockExistingEn.update).toHaveBeenCalledTimes(2);
    expect(mockTourTranslationCreate).not.toHaveBeenCalled();
    expect(mockTourTranslationBulkCreate).not.toHaveBeenCalled();
  });

  it('8. Rollback cả nguồn VI và bản dịch EN/ZH nếu bước ghi tiếp theo thất bại', async () => {
    mockTourTranslationFindOne.mockImplementation(({ where }) => {
      if (where.language === 'en') return Promise.resolve(mockExistingEn);
      if (where.language === 'zh') return Promise.resolve(mockExistingZh);
      return Promise.resolve(null);
    });

    const originalTourState = { ...mockTour };
    const originalEnState = { ...mockExistingEn };
    const originalZhState = { ...mockExistingZh };
    mockTour.update.mockImplementation(async (attributes) => {
      Object.assign(mockTour, attributes);
      return mockTour;
    });
    mockExistingEn.update.mockImplementation(async (attributes) => {
      Object.assign(mockExistingEn, attributes);
      return mockExistingEn;
    });
    mockExistingZh.update.mockRejectedValue(new Error('DB connection lost'));
    mockRollback.mockImplementation(() => {
      Object.assign(mockTour, originalTourState);
      Object.assign(mockExistingEn, originalEnState);
      Object.assign(mockExistingZh, originalZhState);
    });

    const req = {
      params: { id: 1 },
      body: {
        price_includes: 'Vé máy bay và khách sạn cập nhật.',
        translations: [
          {
            language: 'en',
            title: 'Updated English tour title before failure',
          },
          {
            language: 'zh',
            title: '翻译更新失败',
          },
        ],
      },
    };

    await callUpdateTour(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('DB connection lost');
    expect(mockExistingEn.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated English tour title before failure' }),
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockExistingZh.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: '翻译更新失败' }),
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockExistingEn.title).toBe('Original EN Title');
    expect(mockExistingZh.title).toBe('原始中文标题');
    expect(mockTour.price_includes).toBe('Giá bao gồm gốc');
  });

  it('9. Cập nhật EN không ghi các trường nguồn VI vào Tour', async () => {
    mockTourTranslationFindOne.mockResolvedValue(mockExistingEn);

    await callUpdateTour({
      params: { id: 1 },
      body: {
        translations: [{ language: 'en', title: 'Updated English title' }],
      },
    }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTour.update).not.toHaveBeenCalled();
    expect(mockTour.price_includes).toBe('Giá bao gồm gốc');
    expect(mockTour.price_excludes).toBe('Giá không bao gồm gốc');
    expect(mockTour.terms_and_notes).toBe('Điều khoản gốc');
    expect(mockTour.cancellation_policy).toBe('Chính sách hoàn hủy gốc');
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('10. Từ chối tiếng Anh rõ ràng trong trường nguồn VI trước khi ghi', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: {
        price_includes: 'Round-trip airline tickets and hotel accommodation.',
        translations: [{ language: 'en', title: 'Updated English title' }],
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toContain('Vietnamese source content requires review');
    expect(mockTour.update).not.toHaveBeenCalled();
    expect(mockExistingEn.update).not.toHaveBeenCalled();
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('11. Cập nhật chỉ metadata không thay đổi các trường nguồn hoặc bản dịch', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: { duration_days: 5 },
    }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTour.update).toHaveBeenCalledWith(
      { duration_days: 5 },
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockExistingEn.update).not.toHaveBeenCalled();
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('12. Cập nhật nguồn VI không ghi đè các bản dịch EN/ZH', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: {
        price_includes: 'Vé máy bay và khách sạn đã được cập nhật.',
      },
    }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTour.update).toHaveBeenCalledWith(
      { price_includes: 'Vé máy bay và khách sạn đã được cập nhật.' },
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockTourTranslationFindOne).not.toHaveBeenCalled();
    expect(mockExistingEn.update).not.toHaveBeenCalled();
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('13. Từ chối nội dung nguồn rõ ràng không phải tiếng Việt khi tạo tour', async () => {
    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        price_includes: 'Round-trip airline tickets and hotel accommodation.',
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toContain('Vietnamese source content requires review');
    expect(mockTourFindOne).not.toHaveBeenCalled();
    expect(mockTourCreate).not.toHaveBeenCalled();
  });

  it('14. Từ chối tiếng Trung trong trường nguồn VI khi cập nhật tour', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: { cancellation_policy: '如需取消行程，请提前通知。' },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('cancellation_policy');
    expect(mockTour.update).not.toHaveBeenCalled();
  });

  it('15. Từ chối tiếng Trung trong nguồn VI khi tạo tour', async () => {
    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        price_includes: '往返机票和酒店住宿服务。',
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('price_includes');
    expect(mockTourCreate).not.toHaveBeenCalled();
  });

  it('16. Flags ambiguous source content before tour creation', async () => {
    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        terms_and_notes: 'Flexible payment options for every traveler',
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('terms_and_notes (ambiguous_language)');
    expect(mockTourCreate).not.toHaveBeenCalled();
  });

  it('17. Creates a tour from Vietnamese source with mixed proper nouns and metadata', async () => {
    mockTourCreate.mockResolvedValue(mockTour);
    mockTourFindByPk.mockResolvedValue(mockTour);

    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng cùng Vietnam Airlines VN123',
        category_id: 2,
        price_includes: 'Vé máy bay Vietnam Airlines, xem https://example.com, phụ thu 500 USD.',
      },
    }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTourCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Tour Đà Nẵng cùng Vietnam Airlines VN123',
        price_includes: 'Vé máy bay Vietnam Airlines, xem https://example.com, phụ thu 500 USD.',
      }),
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('18. Rejects wrong-language translation content during tour creation', async () => {
    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        translations: [{
          language: 'en',
          title: '新建中文旅游标题',
        }],
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('title (contains_han_characters)');
    expect(mockTourCreate).not.toHaveBeenCalled();
  });

  it('19. Rejects a wrong-language translation row before writing it', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: {
        translations: [{
          language: 'en',
          title: '新建中文旅游标题',
        }],
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('title (contains_han_characters)');
    expect(mockExistingEn.update).not.toHaveBeenCalled();
    expect(mockExistingZh.update).not.toHaveBeenCalled();
  });

  it('20. Rejects duplicate translation languages instead of attempting duplicate rows', async () => {
    await callUpdateTour({
      params: { id: 1 },
      body: {
        translations: [
          { language: 'en', title: 'Updated English title' },
          { language: 'en', title: 'A different English title' },
        ],
      },
    }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('tối đa một bản dịch');
    expect(mockTourTranslationFindOne).not.toHaveBeenCalled();
  });

  it('21. Saves final reviewed EN and ZH form values to the new tour language rows', async () => {
    mockTourCreate.mockResolvedValue(mockTour);
    mockTourFindByPk.mockResolvedValue(mockTour);

    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        price_includes: 'Vé máy bay khứ hồi và khách sạn đã bao gồm.',
        translations: [
          {
            language: 'en',
            title: 'Da Nang Discovery Tour - reviewed',
            price_includes: 'Includes airline tickets, hotel accommodation, and breakfast.',
          },
          {
            language: 'zh',
            title: '岘港探索之旅（已审核）',
            price_includes: '包含往返机票、酒店住宿和早餐。',
          },
        ],
      },
    }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockTourCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Tour Đà Nẵng',
        price_includes: 'Vé máy bay khứ hồi và khách sạn đã bao gồm.',
      }),
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockTourTranslationBulkCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          tour_id: mockTour.id,
          language: 'en',
          title: 'Da Nang Discovery Tour - reviewed',
          price_includes: 'Includes airline tickets, hotel accommodation, and breakfast.',
        }),
        expect.objectContaining({
          tour_id: mockTour.id,
          language: 'zh',
          title: '岘港探索之旅（已审核）',
          price_includes: '包含往返机票、酒店住宿和早餐。',
        }),
      ],
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it('22. Rolls back the new tour if saving a translation row fails', async () => {
    mockTourCreate.mockResolvedValue(mockTour);
    mockTourTranslationBulkCreate.mockRejectedValue(new Error('translation row failed'));

    await callCreateTour({
      body: {
        title: 'Tour Đà Nẵng',
        category_id: 2,
        translations: [
          { language: 'en', title: 'Da Nang Discovery Tour' },
          { language: 'zh', title: '岘港探索之旅' },
        ],
      },
    }, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'translation row failed' }));
    expect(mockTourTranslationBulkCreate).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ transaction: mockTransaction })
    );
    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
  });
});
