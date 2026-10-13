import { describe, expect, it } from 'vitest';
import {
    getContactHref,
    getContactText,
    getVisibleContacts,
    isContactCopyAction,
} from '@/utils/contactSettings';

describe('contact settings helpers', () => {
    it('builds phone and email actions from persisted values', () => {
        expect(getContactHref({ type: 'phone', destination: '1900 2045' })).toBe('tel:19002045');
        expect(getContactHref({ type: 'phone', destination: '+1 (212) 555-0100' })).toBe('tel:+12125550100');
        expect(getContactHref({ type: 'email', displayValue: 'info@kynghituyetvoi.vn' }))
            .toBe('mailto:info@kynghituyetvoi.vn');
    });

    it('does not invent a destination for unconfigured WeChat actions', () => {
        expect(getContactHref({ type: 'wechat', wechatAction: 'none' })).toBe('');
        expect(getContactHref({ type: 'wechat', wechatAction: 'url', destination: '' })).toBe('');
        expect(isContactCopyAction({ type: 'wechat', wechatAction: 'copy', accountIdentifier: '' })).toBe(false);
        expect(isContactCopyAction({ type: 'wechat', wechatAction: 'copy', accountIdentifier: 'travel-id' })).toBe(true);
    });

    it('uses language fallback and filters/sorts methods per location', () => {
        const settings = {
            contacts: [
                { id: 'zalo', enabled: true, footerVisible: true, floatingVisible: true, footerOrder: 2, floatingOrder: 1 },
                { id: 'email', enabled: true, footerVisible: true, floatingVisible: false, footerOrder: 1, floatingOrder: 2 },
                { id: 'facebook', enabled: false, footerVisible: true, floatingVisible: true, footerOrder: 3, floatingOrder: 3 },
            ],
        };

        expect(getContactText({ vi: 'Tiếng Việt' }, 'en-US')).toBe('Tiếng Việt');
        expect(getVisibleContacts(settings, 'footer').map(({ id }) => id)).toEqual(['email', 'zalo']);
        expect(getVisibleContacts(settings, 'floating').map(({ id }) => id)).toEqual(['zalo']);
    });
});