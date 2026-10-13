jest.mock('../../src/models', () => ({
    User: { findOne: jest.fn() },
    ContactSetting: { findByPk: jest.fn(), upsert: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const { User, ContactSetting } = require('../../src/models');
const env = require('../../src/config/env');
const { DEFAULT_CONTACT_SETTINGS } = require('../../src/constants/contactSettings');
const { authenticate, authorize } = require('../../src/middlewares/auth');
const { validate } = require('../../src/middlewares/validate');
const { contactSettingsSchema } = require('../../src/validations/contactSettingsValidation');
const {
    getPublicContactSettings,
    getAdminContactSettings,
    updateContactSettings,
} = require('../../src/controllers/contactSettingsController');
const { errorHandler } = require('../../src/middlewares/errorHandler');

const tokenFor = (id) => jwt.sign({ id }, env.jwt.secret, { expiresIn: '1h' });
let persistedSettings = null;
const app = express();
app.use(express.json());
app.get('/api/contact-settings', getPublicContactSettings);
app.get('/api/admin/contact-settings', authenticate, authorize('ADMIN', 'admin'), getAdminContactSettings);
app.put(
    '/api/admin/contact-settings',
    authenticate,
    authorize('ADMIN', 'admin'),
    validate(contactSettingsSchema),
    updateContactSettings
);
app.use(errorHandler);

describe('contact settings API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        persistedSettings = null;
        ContactSetting.findByPk.mockImplementation(async () => persistedSettings);
        ContactSetting.upsert.mockImplementation(async (row) => {
            persistedSettings = {
                configuration: row.configuration,
                updated_at: row.updated_at,
                created_at: persistedSettings?.created_at || new Date('2026-01-01T00:00:00.000Z'),
            };
        });
    });

    it('provides a safe empty response when settings are not yet configured', async () => {
        const response = await request(app).get('/api/contact-settings');

        expect(response.status).toBe(200);
        expect(response.body.data.contacts).toEqual([]);
        expect(response.body.data.general.heading.vi).toBe('');
        expect(response.body.data.updated_by).toBeUndefined();
    });

    it('returns only public fields from the public endpoint', async () => {
        ContactSetting.findByPk.mockResolvedValue({
            configuration: DEFAULT_CONTACT_SETTINGS,
            updated_by: 41,
            internal_secret: 'must-not-leak',
        });

        const response = await request(app).get('/api/contact-settings');

        expect(response.status).toBe(200);
        expect(response.body.data.contacts).toHaveLength(DEFAULT_CONTACT_SETTINGS.contacts.length);
        expect(response.body.data.updated_by).toBeUndefined();
        expect(JSON.stringify(response.body)).not.toContain('must-not-leak');
    });

    it('rejects unauthenticated and non-admin access to admin settings', async () => {
        const unauthenticated = await request(app).get('/api/admin/contact-settings');
        expect(unauthenticated.status).toBe(401);
        const unauthenticatedUpdate = await request(app)
            .put('/api/admin/contact-settings')
            .send(DEFAULT_CONTACT_SETTINGS);
        expect(unauthenticatedUpdate.status).toBe(401);

        User.findOne.mockResolvedValue({ id: 2, Role: { role_name: 'user' } });
        const nonAdminRead = await request(app)
            .get('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${tokenFor(2)}`);
        expect(nonAdminRead.status).toBe(403);

        const nonAdmin = await request(app)
            .put('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${tokenFor(2)}`)
            .send(DEFAULT_CONTACT_SETTINGS);

        expect(nonAdmin.status).toBe(403);
        expect(ContactSetting.upsert).not.toHaveBeenCalled();
    });

    it('allows an admin to read and persist a valid configuration', async () => {
        User.findOne.mockResolvedValue({ id: 1, Role: { role_name: 'ADMIN' } });
        const updatedConfiguration = structuredClone(DEFAULT_CONTACT_SETTINGS);
        updatedConfiguration.contacts.find(({ id }) => id === 'hotline').displayValue = '1900 1234';

        const token = tokenFor(1);
        const readResponse = await request(app)
            .get('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${token}`);
        expect(readResponse.status).toBe(200);
        expect(readResponse.body.data.configuration).toEqual(DEFAULT_CONTACT_SETTINGS);

        const updateResponse = await request(app)
            .put('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${token}`)
            .send(updatedConfiguration);

        expect(updateResponse.status).toBe(200);
        expect(ContactSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 1,
            configuration: updatedConfiguration,
            updated_by: 1,
        }), { fields: ['id', 'configuration', 'updated_by', 'updated_at'] });
        expect(updateResponse.body.data.configuration.contacts[0].displayValue).toBe('1900 1234');

        const subsequentRead = await request(app)
            .get('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${token}`);
        expect(subsequentRead.status).toBe(200);
        expect(subsequentRead.body.data.configuration).toEqual(updatedConfiguration);
        expect(subsequentRead.body.data.created_at).toBe('2026-01-01T00:00:00.000Z');
    });

    it('rejects invalid admin updates before persistence', async () => {
        User.findOne.mockResolvedValue({ id: 1, Role: { role_name: 'ADMIN' } });
        const invalidConfiguration = structuredClone(DEFAULT_CONTACT_SETTINGS);
        invalidConfiguration.contacts.find(({ id }) => id === 'facebook').destination = 'javascript:alert(1)';

        const response = await request(app)
            .put('/api/admin/contact-settings')
            .set('Authorization', `Bearer ${tokenFor(1)}`)
            .send(invalidConfiguration);

        expect(response.status).toBe(400);
        expect(ContactSetting.upsert).not.toHaveBeenCalled();
    });
});