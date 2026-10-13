import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('../services/api', () => ({ default: apiMocks }));

import { contactSettingsService } from '@/services/contactSettingsService';

describe('contactSettingsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('reuses public data and refreshes its cache after an admin save', async () => {
        const initial = { general: { heading: { vi: 'Initial' } }, contacts: [] };
        const updated = { general: { heading: { vi: 'Updated' } }, contacts: [] };
        apiMocks.get.mockResolvedValue({ data: { data: initial } });
        apiMocks.put.mockResolvedValue({ data: { data: { configuration: updated } } });

        await expect(contactSettingsService.getPublic()).resolves.toEqual(initial);
        await contactSettingsService.getPublic();
        expect(apiMocks.get).toHaveBeenCalledTimes(1);

        await contactSettingsService.updateAdmin(updated);
        await expect(contactSettingsService.getPublic()).resolves.toEqual(updated);
        expect(apiMocks.get).toHaveBeenCalledTimes(1);
    });
});