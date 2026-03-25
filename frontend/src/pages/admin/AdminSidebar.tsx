import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

/**
 * 💎 Slick Admin Sidebar
 * - Minimalist, high-density, professional aesthetic
 */
const AdminSidebar = () => {
    const location = useLocation();
    const { logout, nickname } = useAuthStore();

    const menuItems = [
        { name: '오버뷰', path: '/admin/dashboard', icon: '📊' },
        { name: '유저 관리', path: '/admin/users', icon: '👥' },
        { name: '배너 관리', path: '/admin/images', icon: '🖼️' },
        { name: '문의 관리', path: '/admin/inquiries', icon: '💬' },
        { name: '작품 신고', path: '/admin/artworks', icon: '🛡️' },
        { name: '결제 내역', path: '/admin/payments', icon: '💰' },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <aside style={s.sidebar}>
            <div style={s.topSection}>
                <Link to="/" style={s.logoWrapper}>
                    <img
                        src="/Egag_logo-removebg.png"
                        alt="Egag"
                        style={s.logoImg}
                    />
                    <div style={s.badge}>SYSTEM v2.0</div>
                </Link>
            </div>

            <nav style={s.nav}>
                <p style={s.navLabel}>MAIN MENU</p>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...s.navLink,
                                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                                color: isActive ? '#6366F1' : '#94A3B8',
                            }}
                        >
                            <span style={{...s.iconWrapper, color: isActive ? '#FFF' : '#6366F1'}}>{item.icon}</span>
                            <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={s.bottomSection}>
            <div style={s.userInfo}>
                <div style={s.avatar}>{nickname?.charAt(0) || 'A'}</div>
                <div style={s.userText}>
                    <div style={s.userRole}>최고 관리자</div>
                    <div style={s.userNickname}>{nickname || '관리자'}</div>
                </div>
            </div>
                <div style={s.actionGroup}>
                    <Link to="/" style={s.miniBtn}>🏠</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>
                        <span style={s.logoutIcon}>🚪</span> 로그아웃
                    </button>
                </div>
            </div>
        </aside>
    );
};

const s: Record<string, React.CSSProperties> = {
    sidebar: {
        width: '240px',
        backgroundColor: '#FFFFFF', 
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.02)',
        borderRight: '1px solid #F1F5F9',
        color: '#1E293B'
    },
    topSection: { padding: '40px 25px 30px' },
    logoWrapper: { textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    logoImg: { width: '90px', height: 'auto', marginBottom: '12px' },
    badge: { 
        fontSize: '10px', fontWeight: 900, color: '#6366F1', 
        backgroundColor: '#EEF2FF', padding: '2px 8px', 
        borderRadius: '6px', letterSpacing: '1px' 
    },

    nav: { flex: 1, padding: '0 15px' },
    navLabel: { fontSize: '11px', fontWeight: 900, color: '#CBD5E1', margin: '0 0 15px 10px', letterSpacing: '1px' },
    navLink: {
        display: 'flex', alignItems: 'center', padding: '12px 15px',
        borderRadius: '12px', textDecoration: 'none', fontSize: '14px',
        marginBottom: '4px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: '12px'
    },
    iconWrapper: { fontSize: '18px', width: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    bottomSection: { padding: '20px', borderTop: '1px solid #F1F5F9' },
    userInfo: { 
        display: 'flex', alignItems: 'center', gap: '10px', 
        marginBottom: '15px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '14px' 
    },
    avatar: { 
        width: '32px', height: '32px', borderRadius: '8px', 
        backgroundColor: '#6366F1', color: '#FFF', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' 
    },
    userText: { display: 'flex', flexDirection: 'column' },
    userNickname: { margin: 0, fontSize: '13px', fontWeight: 700, color: '#1E293B' },
    userRole: { margin: 0, fontSize: '10px', color: '#94A3B8', fontWeight: 600 },

    actionGroup: { display: 'flex', gap: '8px' },
    miniBtn: { 
        padding: '8px', borderRadius: '10px', backgroundColor: '#F1F5F9', 
        border: 'none', cursor: 'pointer', textDecoration: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
    },
    logoutBtn: { 
        flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #E2E8F0',
        backgroundColor: 'transparent', color: '#94A3B8', fontSize: '11px', 
        fontWeight: 800, cursor: 'pointer', transition: '0.2s' 
    }
};

export default AdminSidebar;