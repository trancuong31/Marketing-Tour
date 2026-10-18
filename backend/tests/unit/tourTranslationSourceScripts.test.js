const mockTranslateTexts = jest.fn();

jest.mock('../../src/config/database', () => ({
  sequelize: { query: jest.fn(), close: jest.fn() },
}));

jest.mock('../../src/services/translationService', () => ({
  translateTexts: mockTranslateTexts,
}));

const { translateField } = require('../../scripts/execute_translation_remediation');
const { translateSourceValues } = require('../../scripts/execute_eligible_missing_translation_remediation');
const { repairField } = require('../../src/scripts/repair_tour16_en_translation');

describe('translation scripts validate VI before provider calls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects suspicious source in the general remediation script before provider call', async () => {
    await expect(translateField(
      'price_includes',
      'Round-trip airline tickets and hotel accommodation.',
      'en'
    )).rejects.toThrow(/Vietnamese source content requires review/);

    expect(mockTranslateTexts).not.toHaveBeenCalled();
  });

  it('rejects suspicious source in the eligible missing-fields script before provider call', async () => {
    await expect(translateSourceValues({
      summary: 'Explore the coastal city with hotel accommodation.',
    }, 'zh')).rejects.toThrow(/Vietnamese source content requires review/);

    expect(mockTranslateTexts).not.toHaveBeenCalled();
  });

  it('rejects suspicious source in the Tour 16 repair script before provider call', async () => {
    const sourceTour = {
      price_includes: 'Round-trip airline tickets and hotel accommodation.',
    };
    const currentTranslation = {
      price_includes: '往返机票和酒店住宿。',
    };

    await expect(repairField(sourceTour, currentTranslation, 'price_includes'))
      .rejects.toThrow(/Vietnamese source content requires review/);

    expect(mockTranslateTexts).not.toHaveBeenCalled();
  });

  it('allows legitimate Vietnamese containing English names and airline codes', async () => {
    mockTranslateTexts.mockResolvedValue({ summary: 'Explore Da Nang.' });

    await expect(translateField(
      'summary',
      'Khởi hành cùng Vietnam Airlines chuyến VN123 đến Đà Nẵng.',
      'en'
    )).resolves.toBe('Explore Da Nang.');

    expect(mockTranslateTexts).toHaveBeenCalledTimes(1);
  });
});
