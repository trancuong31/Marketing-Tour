import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
}));

vi.mock('../services/api', () => ({ default: apiMocks }));

import { footerLinkService } from '@/services/footerLinkService';

describe('footerLinkService', () => {
    let originalWindow;
    let dispatchEventMock;

    beforeEach(() => {
        vi.clearAllMocks();
        footerLinkService.clearCache();

        originalWindow = global.window;
        dispatchEventMock = vi.fn();
        global.window = {
            dispatchEvent: dispatchEventMock,
        };
        global.CustomEvent = class {
            constructor(type, detail) {
                this.type = type;
                this.detail = detail;
            }
        };
    });

    afterEach(() => {
        global.window = originalWindow;
    });

    it('reuses cached public links without making duplicate network requests', async () => {
        const mockData = [
            { id: 1, title: 'Về Chúng Tôi', url: '/guides/ve-chung-toi', column_position: 1, is_active: 1 },
            { id: 2, title: 'Vietnam Airlines', url: 'https://vietnamairlines.com', column_position: 3, is_active: 1 },
        ];
        apiMocks.get.mockResolvedValue({ data: { data: mockData } });

        const first = await footerLinkService.getPublic();
        const second = await footerLinkService.getPublic();

        expect(first).toEqual(mockData);
        expect(second).toEqual(mockData);
        expect(apiMocks.get).toHaveBeenCalledTimes(1);
    });

    it('fetches admin footer links', async () => {
        const adminLinks = [{ id: 1, title: 'Link 1' }, { id: 2, title: 'Link 2' }];
        apiMocks.get.mockResolvedValue({ data: { data: adminLinks } });

        const res = await footerLinkService.getAdmin();
        expect(apiMocks.get).toHaveBeenCalledWith('/admin/footer-links');
        expect(res.data.data).toEqual(adminLinks);
    });

    it('clears cache and emits footer-links:updated on CRUD mutations', async () => {
        apiMocks.post.mockResolvedValue({ data: { status: 'success' } });
        apiMocks.put.mockResolvedValue({ data: { status: 'success' } });
        apiMocks.patch.mockResolvedValue({ data: { status: 'success' } });
        apiMocks.delete.mockResolvedValue({ data: { status: 'success' } });

        // 1. Create
        await footerLinkService.create({ title: 'New Link', url: '/new', column_position: 1 });
        expect(apiMocks.post).toHaveBeenCalledWith('/admin/footer-links', expect.objectContaining({ title: 'New Link' }));
        expect(dispatchEventMock).toHaveBeenCalledTimes(1);
        expect(dispatchEventMock.mock.calls[0][0].type).toBe('footer-links:updated');

        // 2. Update
        await footerLinkService.update(5, { title: 'Updated Link' });
        expect(apiMocks.put).toHaveBeenCalledWith('/admin/footer-links/5', { title: 'Updated Link' });
        expect(dispatchEventMock).toHaveBeenCalledTimes(2);

        // 3. Toggle
        await footerLinkService.toggle(5);
        expect(apiMocks.patch).toHaveBeenCalledWith('/admin/footer-links/5/toggle');
        expect(dispatchEventMock).toHaveBeenCalledTimes(3);

        // 4. Reorder
        await footerLinkService.reorder([{ id: 1, sort_order: 1 }, { id: 2, sort_order: 2 }]);
        expect(apiMocks.put).toHaveBeenCalledWith('/admin/footer-links/reorder', {
            items: [{ id: 1, sort_order: 1 }, { id: 2, sort_order: 2 }],
        });
        expect(dispatchEventMock).toHaveBeenCalledTimes(4);

        // 5. Delete
        await footerLinkService.delete(5);
        expect(apiMocks.delete).toHaveBeenCalledWith('/admin/footer-links/5');
        expect(dispatchEventMock).toHaveBeenCalledTimes(5);
    });
});
