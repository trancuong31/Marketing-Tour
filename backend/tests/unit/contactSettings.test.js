const {
    DEFAULT_CONTACT_SETTINGS,
    toPublicContactSettings,
} = require('../../src/constants/contactSettings');
const { contactSettingsSchema } = require('../../src/validations/contactSettingsValidation');

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_CONTACT_SETTINGS));
const validate = (configuration) => contactSettingsSchema.validate(configuration, { abortEarly: false });

describe('contact settings configuration', () => {
    it('accepts the preserved current contact values', () => {
        expect(validate(cloneDefaults()).error).toBeUndefined();
    });

    it('rejects invalid email and phone values, even when disabled', () => {
        const invalidEmail = cloneDefaults();
        invalidEmail.contacts.find(({ id }) => id === 'email').displayValue = 'not-an-email';
        expect(validate(invalidEmail).error).toBeDefined();

        const invalidPhone = cloneDefaults();
        invalidPhone.contacts.find(({ id }) => id === 'quick_call').destination = 'javascript:alert(1)';
        expect(validate(invalidPhone).error).toBeDefined();
    });

    it('rejects dangerous, non-HTTPS, and wrong-domain social destinations', () => {
        for (const destination of [
            'javascript:alert(1)',
            'data:text/html,hello',
            'http://facebook.com/example',
            'https://attacker.example/path',
        ]) {
            const configuration = cloneDefaults();
            configuration.contacts.find(({ id }) => id === 'facebook').destination = destination;
            expect(validate(configuration).error).toBeDefined();
        }
    });

    it('rejects duplicate IDs, unsupported icon identifiers, and colliding visible orders', () => {
        const duplicateId = cloneDefaults();
        duplicateId.contacts[1].id = duplicateId.contacts[0].id;
        expect(validate(duplicateId).error).toBeDefined();

        const invalidIcon = cloneDefaults();
        invalidIcon.contacts.find(({ id }) => id === 'zalo').icon = 'arbitrary-svg';
        expect(validate(invalidIcon).error).toBeDefined();

        const invalidType = cloneDefaults();
        invalidType.contacts.find(({ id }) => id === 'facebook').type = 'script';
        expect(validate(invalidType).error).toBeDefined();

        const duplicateOrder = cloneDefaults();
        duplicateOrder.contacts.find(({ id }) => id === 'zalo').footerOrder = 1;
        expect(validate(duplicateOrder).error).toBeDefined();

        const outOfRangeOrder = cloneDefaults();
        outOfRangeOrder.contacts.find(({ id }) => id === 'zalo').floatingOrder = 101;
        expect(validate(outOfRangeOrder).error).toBeDefined();
    });

    it('requires a valid WeChat action target when an action is configured', () => {
        const invalidUrl = cloneDefaults();
        const wechat = invalidUrl.contacts.find(({ id }) => id === 'wechat');
        wechat.wechatAction = 'url';
        wechat.destination = 'https://attacker.example';
        expect(validate(invalidUrl).error).toBeDefined();

        const missingAccount = cloneDefaults();
        const copyWechat = missingAccount.contacts.find(({ id }) => id === 'wechat');
        copyWechat.wechatAction = 'copy';
        expect(validate(missingAccount).error).toBeDefined();
    });

    it('returns only public display fields and excludes internal configuration metadata', () => {
        const configuration = cloneDefaults();
        configuration.internalApiKey = 'must-not-leak';
        configuration.contacts[0].privateNote = 'must-not-leak';

        const result = toPublicContactSettings(configuration);
        expect(result.internalApiKey).toBeUndefined();
        expect(result.contacts[0].privateNote).toBeUndefined();
        expect(result.contacts[0]).toHaveProperty('destination', '19002045');
    });
});