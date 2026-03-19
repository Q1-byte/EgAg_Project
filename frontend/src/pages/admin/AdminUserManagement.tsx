import { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface UserInfo {
    id: string;
    nickname: string;
    email: string;
    tokenBalance: number;
    isSuspended: boolean;
}

interface TokenLog {
    id: number;
    targetNickname: string;
    amount: number;
    reason: string;
    createdAt: string;
    adminNickname: string;
}

const AdminUserManagement = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    const accessToken = useAuthStore((state) => state.accessToken); // ✅ 토큰 추가

    const [searchKeyword, setSearchKeyword] = useState('');
    const [user, setUser] = useState<UserInfo | null>(null);
    const [tokenAmount, setTokenAmount] = useState(1);
    const [reason, setReason] = useState('결제 오류 보상');
    const [logs, setLogs] = useState<TokenLog[]>([]);

    // 🔑 공통 헤더 설정 함수
    const getAuthHeader = useCallback(() => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    }), [accessToken]);

    // 2️⃣ API 호출 함수 (헤더 추가)
    const fetchLogs = useCallback(async () => {
        if (role !== 'ADMIN' || !accessToken) return;

        try {
            // ✅ 요청 시 인증 헤더 포함
            const res = await axios.get('/api/admin/tokens/logs', getAuthHeader());
            setLogs(res.data);
        } catch (err) {
            console.error("로그 로딩 실패:", err);
        }
    }, [role, accessToken, getAuthHeader]);

    useEffect(() => {
        let isMounted = true;
        if (isAuthenticated && role === 'ADMIN' && accessToken) {
            const loadInitialData = async () => {
                if (isMounted) await fetchLogs();
            };
            loadInitialData();
        }
        return () => { isMounted = false; };
    }, [isAuthenticated, role, accessToken, fetchLogs]);

    if (!isAuthenticated || role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // 🔍 유저 검색 (헤더 추가)
    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;
        try {
            const res = await axios.get(`/api/admin/users`, {
                params: { nickname: searchKeyword },
                ...getAuthHeader() // ✅ 인증 헤더 추가
            });
            setUser(res.data);
        } catch (err) {
            console.error("유저 검색 중 오류 발생:", err);
            alert("유저를 찾을 수 없거나 서버 오류가 발생했습니다.");
            setUser(null);
        }
    };

    // 💰 토큰 지급 (헤더 추가)
    const handleGiveToken = async () => {
        if (!user) return;
        if (!confirm(`${user.nickname}님에게 ${tokenAmount} 토큰을 지급하시겠습니까?`)) return;

        try {
            await axios.post('/api/admin/tokens/manual', {
                userId: user.id,
                amount: tokenAmount,
                reason: reason
            }, getAuthHeader()); // ✅ 인증 헤더 추가

            alert("토큰이 성공적으로 지급되었습니다!");
            setUser({ ...user, tokenBalance: user.tokenBalance + tokenAmount });
            fetchLogs();
        } catch (err) {
            console.error("토큰 지급 중 오류 발생:", err);
            alert("토큰 지급에 실패했습니다.");
        }
    };

    // 🚫 계정 정지 토글 (헤더 추가)
    const handleToggleSuspension = async () => {
        if (!user) return;
        const action = user.isSuspended ? "해제" : "정지";
        if (!confirm(`정말로 ${user.nickname}님의 계정을 ${action}하시겠습니까?`)) return;
        try {
            await axios.patch(`/api/admin/users/${user.id}/suspension`, {}, getAuthHeader()); // ✅ 인증 헤더 추가
            alert(`성공적으로 ${action}되었습니다.`);
            setUser({ ...user, isSuspended: !user.isSuspended });
        } catch (err) {
            console.error("계정 상태 변경 오류:", err);
            alert("상태 변경에 실패했습니다.");
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>👥 유저 및 토큰 관리</h1>
                <p style={s.meta}>유저 관리와 수동 토큰 지급 이력을 확인할 수 있습니다.</p>
            </header>

            <div style={s.searchSection}>
                <input type="text" placeholder="유저 닉네임을 입력하세요" style={s.searchInput} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} style={s.searchBtn}>검색</button>
            </div>

            {user && (
                <div style={s.userCard}>
                    <div style={s.userInfo}>
                        <div style={s.userHeader}>
                            <h2 style={s.nickname}>{user.nickname} <span style={{fontSize: '14px', fontWeight: 400, color: '#94A3B8'}}>({user.email})</span></h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ ...s.statusBadge, backgroundColor: user.isSuspended ? '#EF4444' : '#10B981' }}>{user.isSuspended ? "정지됨" : "정상"}</span>
                                <button onClick={handleToggleSuspension} style={{ ...s.suspendBtn, backgroundColor: user.isSuspended ? '#6366F1' : '#F43F5E' }}>{user.isSuspended ? "정지 해제" : "계정 정지"}</button>
                            </div>
                        </div>
                        <p style={s.tokenInfo}>현재 보유 토큰: <strong>{user.tokenBalance} 🐣</strong></p>
                    </div>
                    <div style={s.divider} />
                    <div style={s.actionSection}>
                        <h3 style={s.sectionSubTitle}>💰 수동 토큰 지급</h3>
                        <div style={{display: 'flex', gap: '20px'}}>
                            <div style={{...s.formGroup, flex: 1}}>
                                <label style={s.label}>지급 수량</label>
                                <input type="number" style={s.input} value={tokenAmount} onChange={(e) => setTokenAmount(Number(e.target.value))} />
                            </div>
                            <div style={{...s.formGroup, flex: 2}}>
                                <label style={s.label}>지급 사유</label>
                                <select style={s.input} value={reason} onChange={(e) => setReason(e.target.value)}>
                                    <option>결제 오류 보상</option>
                                    <option>이벤트 당첨</option>
                                    <option>시스템 장애 보상</option>
                                    <option>기타</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGiveToken} style={s.submitBtn}>토큰 지급하기</button>
                    </div>
                </div>
            )}

            <div style={s.logSection}>
                <h3 style={s.sectionSubTitle}>📝 최근 수동 지급 이력</h3>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={s.th}>일시</th>
                            <th style={s.th}>대상 유저</th>
                            <th style={s.th}>수량</th>
                            <th style={s.th}>사유</th>
                            <th style={s.th}>처리자</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.id} style={s.tr}>
                                <td style={s.td}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{...s.td, fontWeight: 700}}>{log.targetNickname}</td>
                                <td style={{...s.td, color: '#6366F1', fontWeight: 800}}>+{log.amount}</td>
                                <td style={s.td}>{log.reason}</td>
                                <td style={s.td}>{log.adminNickname}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} style={{...s.td, textAlign: 'center', padding: '40px'}}>지급 이력이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 🌌 스타일 보강
const s: Record<string, React.CSSProperties> = {
    // ... 기존 스타일 유지 ...
    container: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '40px' },
    title: { fontSize: '28px', fontWeight: 800, color: '#5B21B6' },
    meta: { color: '#7C3AED', fontWeight: 600, opacity: 0.8 },
    searchSection: { display: 'flex', gap: '15px', marginBottom: '30px' },
    searchInput: { flex: 1, padding: '15px 20px', borderRadius: '15px', border: '2px solid #DDD6FE', fontSize: '16px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.5)' },
    searchBtn: { padding: '0 30px', borderRadius: '15px', border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 800, cursor: 'pointer' },
    userCard: { backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '30px', padding: '40px', border: '2px solid #FFFFFF', boxShadow: '0 10px 25px rgba(165, 180, 252, 0.15)', marginBottom: '40px' },
    userHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    nickname: { fontSize: '24px', fontWeight: 800, color: '#4C1D95' },
    statusBadge: { padding: '5px 12px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 700 },
    suspendBtn: { padding: '6px 14px', borderRadius: '10px', border: 'none', color: '#fff', fontWeight: 700, fontSize: '11px', cursor: 'pointer' },
    tokenInfo: { fontSize: '18px', color: '#6366F1' },
    divider: { height: '1px', backgroundColor: '#DDD6FE', margin: '30px 0' },
    actionSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sectionSubTitle: { fontSize: '20px', fontWeight: 800, color: '#5B21B6', marginBottom: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: 700, color: '#4C1D95' },
    input: { padding: '12px', borderRadius: '12px', border: '1px solid #DDD6FE', fontSize: '15px' },
    submitBtn: { marginTop: '10px', padding: '16px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '16px', fontWeight: 800, cursor: 'pointer' },

    // 📝 테이블 전용 스타일
    logSection: { marginTop: '20px' },
    tableWrapper: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '20px', overflow: 'hidden', border: '1px solid #EEE' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', textAlign: 'left', color: '#4B5563', borderBottom: '2px solid #F3F4F6' },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#374151' },
    tr: { transition: 'background 0.2s' },
};

export default AdminUserManagement;