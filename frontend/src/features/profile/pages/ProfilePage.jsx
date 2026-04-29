import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { User, Camera, Loader2, Save, Lock, Mail, Shield } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { getImageUrl } from '@/utils/imageUrl';
const ProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({ full_name: '', phone_number: '', email: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // Password state
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                email: user.email || ''
            });
            setAvatarPreview(user.avatar_url ? getImageUrl(user.avatar_url) : '');
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        // Validate phone
        const phoneRegex = /^[0-9]{10,11}$/;
        if (profileData.phone_number && !phoneRegex.test(profileData.phone_number)) {
            toast.error('Số điện thoại không hợp lệ (10-11 số)');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('full_name', profileData.full_name);
            formData.append('phone_number', profileData.phone_number);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await userService.updateProfile(formData);
            if (res.data.status === 'success') {
                toast.success('Cập nhật hồ sơ thành công!');
                updateUser(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Check strong password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(passwordData.newPassword)) {
            toast.error('Mật khẩu mới phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            const res = await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.status === 'success') {
                toast.success('Đổi mật khẩu thành công!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="max-w-4xl mx-auto py-2 px-4">
                <h1 className="text-2xl font-bold text-text mb-6">Tài khoản của tôi</h1>

                {/* Header Profile Box */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 mb-8 flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-alt flex-shrink-0">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/30">
                                <User className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-text">{user?.full_name}</h2>
                            {user?.role_id === 1 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                    <Shield className="w-3 h-3" /> Admin
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-text-muted mt-1.5">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm font-medium">{user?.email}</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Thông tin */}
                    <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
                        <h2 className="text-lg font-bold text-text mb-4 border-b border-border pb-3">Thông tin cá nhân</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">

                            {/* Avatar File Input (Hidden, Triggered by Label) */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="flex items-center gap-3 px-4 py-2 border border-border rounded-xl cursor-pointer hover:bg-surface-alt transition-colors duration-200">
                                    <Camera className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-text">Tải ảnh đại diện</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                                {avatarFile && <span className="text-xs text-text-muted truncate max-w-[150px]">{avatarFile.name}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Họ và tên</label>
                                <input
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Email (Read-only)</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    readOnly
                                    disabled
                                    className="w-full px-4 py-2.5 bg-surface-alt/70 text-text-muted border border-border/50 rounded-xl cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={profileData.phone_number}
                                    onChange={e => setProfileData(p => ({ ...p, phone_number: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>

                    {/* Password */}
                    <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col">
                        <h2 className="text-lg font-bold text-text mb-4 border-b border-border pb-3">Đổi mật khẩu</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 flex-1 flex flex-col">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div className="mt-auto pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-text text-white font-semibold rounded-xl hover:bg-black transition-colors flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                    Cập nhật mật khẩu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default ProfilePage;
