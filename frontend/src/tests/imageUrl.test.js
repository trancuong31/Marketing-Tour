import { afterEach, describe, expect, it, vi } from 'vitest';
import { onImgError, PLACEHOLDER } from '@/utils/imageUrl';

const originalWindow = globalThis.window;

const makeImage = (source) => {
    let currentSource = new URL(source, window.location.href).href;
    const image = { dataset: {} };
    Object.defineProperty(image, 'src', {
        get: () => currentSource,
        set: (value) => { currentSource = new URL(value, window.location.href).href; },
    });
    Object.defineProperty(image, 'currentSrc', { get: () => currentSource });
    return image;
};

afterEach(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    vi.restoreAllMocks();
});

describe('tour image fallback handling', () => {
    it('falls back after an upload error without constructing another upload URL', () => {
        globalThis.window = { location: { href: 'http://localhost:5173/tours/example', origin: 'http://localhost:5173' } };
        const image = makeImage('/uploads/tours/example.webp');
        const handleError = onImgError('tour');

        handleError({ currentTarget: image });
        expect(image.src).toBe(`http://localhost:5173${PLACEHOLDER.tour}`);

        handleError({ currentTarget: image });
        expect(image.src).toBe(`http://localhost:5173${PLACEHOLDER.tour}`);
    });

    it('uses the valid tour placeholder for a non-upload image error', () => {
        globalThis.window = { location: { href: 'http://localhost:5173/tours/example', origin: 'http://localhost:5173' } };
        const image = makeImage('/external/broken-image.jpg');

        onImgError('tour')({ currentTarget: image });

        expect(image.src).toBe('http://localhost:5173/placeholder-tour.svg');
    });
});