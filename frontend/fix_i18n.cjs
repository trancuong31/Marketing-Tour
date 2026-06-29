const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/features/auth/components/AuthModal.jsx',
    'src/features/tour/components/BookingForm.jsx',
    'src/features/lookup/pages/LookupBookingPage.jsx',
    'src/features/profile/pages/ProfilePage.jsx',
    'src/features/history/pages/HistoryPage.jsx'
];

filesToFix.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find namespace: const { t } = useTranslation('namespace');
    const nsMatch = content.match(/useTranslation\(['"]([^'"]+)['"]\)/);
    if (!nsMatch) return;
    
    const ns = nsMatch[1];
    
    // Replace useTranslation('ns') with useTranslation()
    content = content.replace(/useTranslation\(['"][^'"]+['"]\)/g, 'useTranslation()');
    
    // Replace t('key' with t('ns.key'
    // but only if it's not already namespaced (no dot before the quote or inside)
    // Actually, any t('key') or t("key") where key doesn't have a dot
    content = content.replace(/t\(['"]([^.'"]+)['"]/g, `t('${ns}.$1'`);
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed:', relPath, 'with namespace:', ns);
});
