const mockTranslateTexts = jest.fn();

jest.mock('../../src/services/translationService', () => ({
  translateTexts: mockTranslateTexts,
}));

const { translateContent } = require('../../src/controllers/translateController');

const invokeController = async (body) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  translateContent({ body }, response, next);
  await new Promise((resolve) => setImmediate(resolve));

  return { response, next };
};

describe('translation endpoint source and target validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['en', 'zh'])('translates verified Vietnamese directly to %s in strict mode', async (targetLang) => {
    mockTranslateTexts.mockResolvedValue({ title: targetLang === 'en' ? 'Da Nang Tour' : '岘港之旅' });

    const { response, next } = await invokeController({
      texts: { title: 'Tour Đà Nẵng' },
      targetLang,
    });

    expect(next).not.toHaveBeenCalled();
    expect(mockTranslateTexts).toHaveBeenCalledWith({
      texts: { title: 'Tour Đà Nẵng' },
      targetLang,
      strict: true,
    });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it.each([
    ['en', 'Round-trip airline tickets and hotel accommodation.'],
    ['zh', '往返机票和酒店住宿服务。'],
  ])('rejects suspicious %s source before provider invocation', async (targetLang, title) => {
    const { response, next } = await invokeController({ texts: { title }, targetLang });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toContain('title');
    expect(mockTranslateTexts).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });

  it.each(['vi', 'fr', undefined])('rejects unsupported translation target %s', async (targetLang) => {
    const { next } = await invokeController({
      texts: { title: 'Tour Đà Nẵng' },
      targetLang,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(mockTranslateTexts).not.toHaveBeenCalled();
  });

  it('surfaces provider failure instead of returning source content as a success', async () => {
    const providerError = new Error('translation timed out');
    mockTranslateTexts.mockRejectedValue(providerError);

    const { response, next } = await invokeController({
      texts: { title: 'Tour Đà Nẵng' },
      targetLang: 'en',
    });

    expect(next).toHaveBeenCalledWith(providerError);
    expect(response.json).not.toHaveBeenCalled();
  });
});
