const mockQuery = jest.fn();

jest.mock('../../src/config/database', () => ({
  sequelize: { query: mockQuery },
}));

const { validateTourSourcesBeforeCopy } = require('../../src/migrations/run_i18n_migration');

describe('i18n migration Vietnamese source validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows verified Vietnamese source before the migration copies it as vi', async () => {
    mockQuery.mockResolvedValueOnce([{
      id: 3,
      title: 'Tour khám phá Đà Nẵng',
      summary: 'Khám phá phố cổ.',
      highlights: null,
      price_includes: '<p>Vé máy bay và khách sạn.</p>',
      price_excludes: null,
      terms_and_notes: null,
      cancellation_policy: null,
    }]).mockResolvedValueOnce([]);

    await expect(validateTourSourcesBeforeCopy()).resolves.toBeUndefined();
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[0][0]).toMatch(/^SELECT id,/);
    expect(mockQuery.mock.calls[1][0]).toMatch(/^SELECT id, tour_id, title, content FROM tour_itineraries$/);
  });

  it('stops before assigning the vi label when source content is suspicious', async () => {
    mockQuery.mockResolvedValueOnce([{
      id: 16,
      title: 'Tour khám phá Đà Nẵng',
      summary: null,
      highlights: null,
      price_includes: 'Round-trip airline tickets and hotel accommodation.',
      price_excludes: null,
      terms_and_notes: null,
      cancellation_policy: null,
    }]);

    await expect(validateTourSourcesBeforeCopy()).rejects.toThrow(
      'Cannot label tour id=16 as Vietnamese'
    );
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toMatch(/^SELECT id,/);
  });

  it('also rejects non-Vietnamese itinerary content before copying it as vi', async () => {
    mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([{
      id: 8,
      tour_id: 3,
      title: 'Tour khám phá Đà Nẵng',
      content: 'Visit the coastal city and enjoy hotel accommodation.',
    }]);

    await expect(validateTourSourcesBeforeCopy()).rejects.toThrow(
      'Cannot label itinerary id=8 as Vietnamese'
    );
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
});
