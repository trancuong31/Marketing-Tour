const { resolveExistingUploadUrl } = require('../../src/utils/uploadUrl');

describe('resolveExistingUploadUrl', () => {
    it('repairs a stale upload URL only when the JPEG-suffixed file exists', () => {
        expect(resolveExistingUploadUrl('/uploads/tours/tour-1785739441405-6896510.jpg'))
            .toBe('/uploads/tours/tour-1785739441405-6896510.jpg.jpg');
        expect(resolveExistingUploadUrl('/uploads/not-present.webp'))
            .toBe('/uploads/not-present.webp');
    });

    it('leaves external and non-upload URLs unchanged', () => {
        expect(resolveExistingUploadUrl('https://images.example.test/tour.jpg'))
            .toBe('https://images.example.test/tour.jpg');
        expect(resolveExistingUploadUrl('/placeholder-tour.svg'))
            .toBe('/placeholder-tour.svg');
    });
});