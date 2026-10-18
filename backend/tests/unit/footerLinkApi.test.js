jest.mock('../../src/models', () => ({
    User: { findOne: jest.fn() },
    FooterLink: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        max: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('../../src/config/database', () => ({
    sequelize: {
        transaction: jest.fn(async (cb) => cb({})),
    },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const { User, FooterLink } = require('../../src/models');
const env = require('../../src/config/env');
const { authenticate, authorize } = require('../../src/middlewares/auth');
const { validate } = require('../../src/middlewares/validate');
const { footerLinkSchema, footerLinkReorderSchema } = require('../../src/validations/footerLinkValidation');
const {
    getPublicFooterLinks,
    getAdminFooterLinks,
    createFooterLink,
    updateFooterLink,
    deleteFooterLink,
    toggleFooterLink,
    reorderFooterLinks,
} = require('../../src/controllers/footerLinkController');
const { errorHandler } = require('../../src/middlewares/errorHandler');

const tokenFor = (id) => jwt.sign({ id }, env.jwt.secret, { expiresIn: '1h' });

const app = express();
app.use(express.json());

// Public route
app.get('/api/footer-links', getPublicFooterLinks);

// Admin routes
app.get('/api/admin/footer-links', authenticate, authorize('ADMIN', 'admin'), getAdminFooterLinks);
app.post('/api/admin/footer-links', authenticate, authorize('ADMIN', 'admin'), validate(footerLinkSchema), createFooterLink);
app.put('/api/admin/footer-links/reorder', authenticate, authorize('ADMIN', 'admin'), validate(footerLinkReorderSchema), reorderFooterLinks);
app.put('/api/admin/footer-links/:id', authenticate, authorize('ADMIN', 'admin'), validate(footerLinkSchema), updateFooterLink);
app.patch('/api/admin/footer-links/:id/toggle', authenticate, authorize('ADMIN', 'admin'), toggleFooterLink);
app.delete('/api/admin/footer-links/:id', authenticate, authorize('ADMIN', 'admin'), deleteFooterLink);

app.use(errorHandler);

describe('Footer Links API', () => {
    let mockLinks;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLinks = [
            { id: 1, title: 'Về Chúng Tôi', url: '/guides/ve-chung-toi', link_type: 'internal', column_position: 1, sort_order: 1, is_active: 1 },
            { id: 2, title: 'Blog Du Lịch', url: '/guides/blog-du-lich', link_type: 'internal', column_position: 1, sort_order: 2, is_active: 0 },
            { id: 3, title: 'Vietnam Airlines', url: 'https://vietnamairlines.com', link_type: 'external', column_position: 3, sort_order: 1, is_active: 1 },
        ];
    });

    describe('Public API', () => {
        it('returns only active links for public endpoint', async () => {
            const activeLinks = mockLinks.filter((l) => l.is_active === 1);
            FooterLink.findAll.mockResolvedValue(activeLinks);

            const res = await request(app).get('/api/footer-links');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveLength(2);
            expect(FooterLink.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { is_active: 1 },
            }));
        });
    });

    describe('Admin Authorization', () => {
        it('rejects unauthenticated requests to admin endpoints', async () => {
            const res = await request(app).get('/api/admin/footer-links');
            expect(res.status).toBe(401);
        });

        it('rejects non-admin users from admin endpoints', async () => {
            User.findOne.mockResolvedValue({ id: 99, Role: { role_name: 'user' } });
            const token = tokenFor(99);

            const res = await request(app)
                .get('/api/admin/footer-links')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(403);
        });
    });

    describe('Admin CRUD Operations', () => {
        beforeEach(() => {
            User.findOne.mockResolvedValue({ id: 1, Role: { role_name: 'ADMIN' } });
        });

        it('returns all links including inactive for admin', async () => {
            FooterLink.findAll.mockResolvedValue(mockLinks);

            const res = await request(app)
                .get('/api/admin/footer-links')
                .set('Authorization', `Bearer ${tokenFor(1)}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(3);
        });

        it('creates a new footer link with validation', async () => {
            const newLinkData = {
                title: 'Câu Hỏi Thường Gặp',
                url: '/guides/cau-hoi-thuong-gap',
                link_type: 'internal',
                column_position: 1,
                sort_order: 3,
                is_active: 1,
            };

            FooterLink.create.mockResolvedValue({ id: 4, ...newLinkData });

            const res = await request(app)
                .post('/api/admin/footer-links')
                .set('Authorization', `Bearer ${tokenFor(1)}`)
                .send(newLinkData);

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.title).toBe('Câu Hỏi Thường Gặp');
            expect(FooterLink.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Câu Hỏi Thường Gặp',
                url: '/guides/cau-hoi-thuong-gap',
            }));
        });

        it('rejects invalid link data during creation', async () => {
            const invalidData = {
                title: '', // empty title
                url: 'invalid',
                link_type: 'unknown_type',
                column_position: 5, // invalid column
            };

            const res = await request(app)
                .post('/api/admin/footer-links')
                .set('Authorization', `Bearer ${tokenFor(1)}`)
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(FooterLink.create).not.toHaveBeenCalled();
        });

        it('updates an existing footer link', async () => {
            const mockInstance = {
                id: 1,
                title: 'Về Chúng Tôi Cũ',
                url: '/guides/about-old',
                link_type: 'internal',
                column_position: 1,
                sort_order: 1,
                is_active: 1,
                update: jest.fn().mockImplementation(async (data) => Object.assign(mockInstance, data)),
            };

            FooterLink.findByPk.mockResolvedValue(mockInstance);

            const updateData = {
                title: 'Về Chúng Tôi Mới',
                url: '/guides/ve-chung-toi',
                link_type: 'internal',
                column_position: 1,
                sort_order: 1,
                is_active: 1,
            };

            const res = await request(app)
                .put('/api/admin/footer-links/1')
                .set('Authorization', `Bearer ${tokenFor(1)}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(mockInstance.update).toHaveBeenCalled();
            expect(res.body.data.title).toBe('Về Chúng Tôi Mới');
        });

        it('toggles link active status', async () => {
            const mockInstance = {
                id: 2,
                is_active: 0,
                update: jest.fn().mockImplementation(async (data) => Object.assign(mockInstance, data)),
            };

            FooterLink.findByPk.mockResolvedValue(mockInstance);

            const res = await request(app)
                .patch('/api/admin/footer-links/2/toggle')
                .set('Authorization', `Bearer ${tokenFor(1)}`);

            expect(res.status).toBe(200);
            expect(mockInstance.update).toHaveBeenCalledWith({ is_active: 1 });
        });

        it('deletes an existing footer link', async () => {
            const mockInstance = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(),
            };

            FooterLink.findByPk.mockResolvedValue(mockInstance);

            const res = await request(app)
                .delete('/api/admin/footer-links/1')
                .set('Authorization', `Bearer ${tokenFor(1)}`);

            expect(res.status).toBe(200);
            expect(mockInstance.destroy).toHaveBeenCalled();
        });

        it('reorders footer links in bulk', async () => {
            FooterLink.findAll.mockResolvedValue([
                { id: 2, sort_order: 1 },
                { id: 1, sort_order: 2 },
            ]);

            const res = await request(app)
                .put('/api/admin/footer-links/reorder')
                .set('Authorization', `Bearer ${tokenFor(1)}`)
                .send({
                    items: [
                        { id: 2, sort_order: 1 },
                        { id: 1, sort_order: 2 },
                    ],
                });

            expect(res.status).toBe(200);
            expect(FooterLink.update).toHaveBeenCalledTimes(2);
        });
    });
});
