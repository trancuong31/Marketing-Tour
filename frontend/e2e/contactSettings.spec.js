import { test, expect } from '@playwright/test';

const makeContact = (contact) => ({
    labels: { vi: '', en: '', zh: '' },
    displayValue: '',
    destination: '',
    phoneNumber: '',
    accountIdentifier: '',
    icon: 'link',
    enabled: true,
    footerVisible: false,
    floatingVisible: false,
    footerOrder: 1,
    floatingOrder: 1,
    wechatAction: 'none',
    ...contact,
});

const initialSettings = () => ({
    general: {
        heading: { vi: 'BẠN CẦN TRỢ GIÚP?', en: 'NEED HELP?', zh: '需要帮助？' },
        workingHours: { vi: '7h30 → 21h hằng ngày', en: 'Daily, 7:30 AM → 9:00 PM', zh: '每日 7:30 → 21:00' },
        description: { vi: '', en: '', zh: '' },
    },
    contacts: [
        makeContact({ id: 'hotline', type: 'phone', labels: { vi: 'Hotline hiển thị', en: 'Footer hotline', zh: '页脚热线' }, displayValue: '1900 0000', destination: '19002045', icon: 'phone', footerVisible: true, footerOrder: 1 }),
        makeContact({ id: 'email', type: 'email', labels: { vi: 'Email', en: 'Email', zh: '电子邮件' }, displayValue: 'info@kynghituyetvoi.vn', icon: 'mail', footerVisible: true, footerOrder: 2 }),
        makeContact({ id: 'facebook', type: 'facebook', labels: { vi: 'Facebook', en: 'Facebook', zh: 'Facebook' }, displayValue: 'Facebook', icon: 'facebook', footerVisible: true, footerOrder: 3 }),
        makeContact({ id: 'zalo', type: 'zalo', labels: { vi: 'Zalo', en: 'Zalo', zh: 'Zalo' }, displayValue: 'Zalo', destination: 'https://zalo.me/0987654321', phoneNumber: '0987654321', icon: 'zalo', footerVisible: true, floatingVisible: true, footerOrder: 4, floatingOrder: 2 }),
        makeContact({ id: 'wechat', type: 'wechat', labels: { vi: 'Chat WeChat', en: 'Chat WeChat', zh: '微信联系' }, displayValue: 'WeChat', icon: 'wechat', footerVisible: true, floatingVisible: true, footerOrder: 5, floatingOrder: 1 }),
        makeContact({ id: 'quick_call', type: 'phone', labels: { vi: 'Nút gọi nhanh', en: 'Quick call button', zh: '快捷拨号按钮' }, displayValue: '0987654321', destination: '0987654321', phoneNumber: '0987654321', icon: 'phone', floatingVisible: true, footerOrder: 6, floatingOrder: 3 }),
    ],
});

const guide = {
    id: 3,
    title: 'Về Chúng Tôi',
    slug: 've-chung-toi',
    content: '<h1>Về Chúng Tôi</h1><p>Contact page</p>',
    is_active: 1,
    updated_at: '2026-10-13T00:00:00.000Z',
};

test.describe('admin contact settings', () => {
    test.beforeEach(async ({ page }) => {
        let savedSettings = initialSettings();
        let failSave = false;

        await page.addInitScript(() => {
            localStorage.setItem('auth:has-session', '1');
            localStorage.setItem('i18nextLng', 'vi');
        });

        await page.route('**/api/auth/refresh', (route) => route.fulfill({
            status: 200,
            json: {
                status: 'success',
                data: {
                    user: { id: 1, role_id: 1, full_name: 'Settings Admin', email: 'admin@example.test' },
                    accessToken: 'mock-admin-contact-settings-token',
                },
            },
        }));

        await page.route('**/api/admin/contact-settings', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ json: { status: 'success', data: { configuration: savedSettings, updated_at: null } } });
                return;
            }

            if (failSave) {
                await route.fulfill({ status: 400, json: { status: 'fail', message: 'Invalid contact settings.' } });
                return;
            }

            savedSettings = route.request().postDataJSON();
            await route.fulfill({
                json: {
                    status: 'success',
                    data: { configuration: savedSettings, updated_at: '2026-10-13T12:00:00.000Z' },
                },
            });
        });

        await page.route('**/api/contact-settings', (route) => route.fulfill({
            json: { status: 'success', data: savedSettings },
        }));
        await page.route('**/api/guides/ve-chung-toi', (route) => route.fulfill({
            json: { status: 'success', data: guide },
        }));
        await page.route('**/api/**', async (route) => {
            if (route.request().url().includes('/api/auth/refresh')
                || route.request().url().includes('/api/admin/contact-settings')
                || route.request().url().includes('/api/contact-settings')
                || route.request().url().includes('/api/guides/ve-chung-toi')) {
                await route.fallback();
                return;
            }
            await route.fulfill({ json: { status: 'success', data: [] } });
        });

        page.setDefaultTimeout(10000);
        page.on('pageerror', (error) => console.error(error));
        page.context().setDefaultTimeout(10000);
        page.context().exposeBinding('failContactSettingsSave', () => { failSave = true; });
    });

    test('saves contact edits and reflects the shared configuration in the site footer and widget', async ({ page }) => {
        await page.goto('/admin/contact-settings');
        await expect(page.getByRole('heading', { name: 'Thông tin liên hệ' })).toBeVisible();

        const hotline = page.getByRole('group', { name: 'Hotline hiển thị' });
        await hotline.getByLabel('Nội dung hiển thị').fill('1900 1234');

        const quickCall = page.getByRole('group', { name: 'Nút gọi nhanh' });
        await quickCall.locator('input[type="tel"]').first().fill('0911112233');
        await quickCall.getByLabel('Nội dung hiển thị').fill('0911112233');

        const zalo = page.getByRole('group', { name: 'Zalo' });
        await zalo.getByLabel('Đường dẫn').fill('https://zalo.me/0999999999');
        await zalo.getByLabel('Hiển thị trong chân trang').uncheck();

        const facebook = page.getByRole('group', { name: 'Facebook' });
        await facebook.locator('input[type="checkbox"]').first().uncheck();

        await expect(page.getByText('1900 1234').last()).toBeVisible();
        await page.getByRole('button', { name: 'Lưu cấu hình' }).click();
        await expect(page.getByText('Đã lưu thông tin liên hệ.')).toBeVisible();

        await page.goto('/guides/ve-chung-toi');
        const footer = page.locator('footer');
        await expect(footer.getByText('1900 1234')).toBeVisible();
        await expect(footer.locator('a[href="tel:19002045"]')).toBeVisible();
        await expect(footer.locator('a[href="https://zalo.me/0999999999"]')).toHaveCount(0);
        await expect(footer.locator('[role="img"][aria-label="Facebook"]')).toHaveCount(0);
        await expect(page.locator('.fixed.bottom-4.right-4 a[href="tel:0911112233"]')).toBeVisible();
        await expect(page.locator('.fixed.bottom-4.right-4 a[href="https://zalo.me/0999999999"]')).toBeVisible();
    });

    test('keeps unsaved values visible when saving fails and supports discarding drafts', async ({ page }) => {
        await page.goto('/admin/contact-settings');
        const hotline = page.getByRole('group', { name: 'Hotline hiển thị' });
        const hotlineValue = hotline.getByLabel('Nội dung hiển thị');
        await hotlineValue.fill('1900 7777');

        await page.evaluate(() => window.failContactSettingsSave());
        await page.getByRole('button', { name: 'Lưu cấu hình' }).click();

        await expect(hotlineValue).toHaveValue('1900 7777');
        await expect(page.getByText('Invalid contact settings.')).toBeVisible();
        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Hủy thay đổi' }).click();
        await expect(hotlineValue).toHaveValue('1900 0000');
    });

    test('shows a loading state while settings are pending and an error state on API failure', async ({ page }) => {
        let releaseSettings;
        const pendingSettings = new Promise((resolve) => { releaseSettings = resolve; });
        await page.route('**/api/admin/contact-settings', async (route) => {
            await pendingSettings;
            await route.fulfill({ status: 500, json: { status: 'error', message: 'Settings unavailable.' } });
        });

        const navigation = page.goto('/admin/contact-settings');
        await expect(page.getByText('Đang tải cấu hình liên hệ...')).toBeVisible();
        releaseSettings();
        await navigation;
        await expect(page.getByRole('alert')).toContainText('Settings unavailable.');
        await expect(page.getByRole('button', { name: 'Lưu cấu hình' })).toHaveCount(0);
    });

    test('does not expose an editable settings form to a non-admin user', async ({ page }) => {
        await page.route('**/api/auth/refresh', (route) => route.fulfill({
            status: 200,
            json: {
                status: 'success',
                data: {
                    user: { id: 2, role_id: 2, full_name: 'Customer', email: 'customer@example.test' },
                    accessToken: 'mock-customer-contact-settings-token',
                },
            },
        }));
        await page.route('**/api/admin/contact-settings', (route) => route.fulfill({
            status: 403,
            json: { status: 'fail', message: 'You do not have permission.' },
        }));

        await page.goto('/admin/contact-settings');

        await expect(page.getByRole('alert')).toContainText('You do not have permission.');
        await expect(page.getByRole('button', { name: 'Lưu cấu hình' })).toHaveCount(0);
    });

    test('shows inline errors for invalid email and unsupported social URL schemes', async ({ page }) => {
        await page.goto('/admin/contact-settings');
        const email = page.getByRole('group', { name: 'Email' });
        await email.getByLabel('Địa chỉ email').fill('not-an-email');
        await page.getByRole('button', { name: 'Lưu cấu hình' }).click();
        await expect(email.getByRole('alert')).toHaveText('Địa chỉ email không hợp lệ.');

        await email.getByLabel('Địa chỉ email').fill('support@example.test');
        const facebook = page.getByRole('group', { name: 'Facebook' });
        await facebook.getByLabel('Đường dẫn').fill('javascript:alert(1)');
        await page.getByRole('button', { name: 'Lưu cấu hình' }).click();
        await expect(facebook.getByRole('alert')).toHaveText('Chỉ chấp nhận liên kết HTTPS đúng miền của kênh.');
    });

    test('disables the save button while a settings write is pending', async ({ page }) => {
        let releaseSave;
        let markSaveStarted;
        let saveRequests = 0;
        const pendingSave = new Promise((resolve) => { releaseSave = resolve; });
        const saveStarted = new Promise((resolve) => { markSaveStarted = resolve; });

        await page.route('**/api/admin/contact-settings', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fallback();
                return;
            }

            saveRequests += 1;
            markSaveStarted();
            await pendingSave;
            const configuration = route.request().postDataJSON();
            await route.fulfill({
                json: { status: 'success', data: { configuration, updated_at: '2026-10-13T12:00:00.000Z' } },
            });
        });

        await page.goto('/admin/contact-settings');
        const hotline = page.getByRole('group', { name: 'Hotline hiển thị' });
        await hotline.getByLabel('Nội dung hiển thị').fill('1900 5678');
        const saveButton = page.locator('form button[type="submit"]');
        await saveButton.click();
        await saveStarted;
        await expect(saveButton).toBeDisabled();
        releaseSave();
        await expect(page.getByText('Đã lưu thông tin liên hệ.')).toBeVisible();
        await expect(saveButton).toBeDisabled();
        expect(saveRequests).toBe(1);
    });
});