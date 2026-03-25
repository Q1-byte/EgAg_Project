import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminMainImages, getArtworks, assignMainImage } from '../../api/adminApi';

interface BannerSlot {
    slotNumber: number;
    artworkId: string | null;
    artworkTitle: string | null;
    imageUrl: string | null;
}

interface Artwork {
    id: string;
    title: string;
    imageUrl: string;
    nickname: string;
}

const AdminImageManagement = () => {
    const [slots, setSlots] = useState<BannerSlot[]>(
        Array.from({ length: 6 }, (_, i) => ({ slotNumber: i, artworkId: null, artworkTitle: null, imageUrl: null }))
    );
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    // 🎡 stable 3-Set Loop Logic ([Prev][Current][Next])
    const N = slots.length || 6;
    const [currentIndex, setCurrentIndex] = useState(N);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [useAnim, setUseAnim] = useState(true);
    const trackRef = useRef<HTMLDivElement>(null);

    const extendedSlots = [...slots, ...slots, ...slots];

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [bannerData, artworkData] = await Promise.all([
                getAdminMainImages(),
                getArtworks(0, 30)
            ]);

            const updatedSlots = Array.from({ length: 6 }, (_, i) => ({ slotNumber: i, artworkId: null, artworkTitle: null, imageUrl: null }));
            bannerData.forEach((b: any) => {
                if (b.slotNumber < 6) {
                    updatedSlots[b.slotNumber] = {
                        slotNumber: b.slotNumber,
                        artworkId: b.artworkId,
                        artworkTitle: b.artworkTitle || b.title,
                        imageUrl: b.imageUrl
                    };
                }
            });
            setSlots(updatedSlots);
            setArtworks(artworkData.content || artworkData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    // Update currentIndex if slot count changes
    useEffect(() => {
        if (slots.length > 0) {
            setCurrentIndex(slots.length);
        }
    }, [slots.length]);

    const handleTransitionEnd = useCallback(() => {
        setIsTransitioning(false);
        if (currentIndex < N || currentIndex >= N * 2) {
            setUseAnim(false);
            const relative = ((currentIndex % N) + N) % N;
            setCurrentIndex(N + relative);
        }
    }, [currentIndex, N]);

    // Safeguard: Force unlock if transitionEnd fails
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                handleTransitionEnd();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning, handleTransitionEnd]);

    useEffect(() => {
        if (!useAnim) {
            const timer = requestAnimationFrame(() => {
                requestAnimationFrame(() => setUseAnim(true));
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [useAnim]);

    const moveNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    };

    const movePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    };

    const handleAssign = async (artworkId: string) => {
        if (selectedSlot === null || assigning) return;
        try {
            setAssigning(true);
            await assignMainImage(artworkId, selectedSlot);
            void fetchData();
            setSelectedSlot(null);
            alert("배너 슬롯 #" + (selectedSlot + 1) + "에 성공적으로 반영되었습니다. ✨");
        } catch (err) {
            alert("할당 중 오류 발생");
        } finally {
            setAssigning(false);
        }
    };

    if (isLoading) return <div style={s.loadingBox}>데이터 로드 중... ⏳</div>;

    return (
        <div style={s.pageWrapper}>
            <header style={s.header}>
                <div>
                    <h1 style={s.pageTitle}>배너 콘텐츠 큐레이션</h1>
                    <p style={s.pageSubtitle}>메인 슬라이더의 {N}개 고정 슬롯을 실시간으로 제어하고 이미지를 교체합니다.</p>
                </div>
                <div style={s.statusBadge}>
                    SYSTEM LIVE: SLOT <span style={s.activeNum}>{(currentIndex % N) + 1}</span> / {N}
                </div>
            </header>

            <div style={s.section}>
                <div style={s.secHeader}>
                    <h2 style={s.secTitle}>Step 01. 편집 슬롯 정렬</h2>
                    <p style={s.secDesc}>화살표를 사용하여 편집할 배너 슬롯을 중앙에 위치시키세요.</p>
                </div>

                <div style={s.sliderWrap}>
                    <div style={s.floatingControls}>
                        <button onClick={movePrev} style={s.controlBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <button onClick={moveNext} style={s.controlBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                    </div>

                    <div style={s.trackWindow}>
                        <div 
                            onTransitionEnd={handleTransitionEnd}
                            ref={trackRef}
                            style={{
                                ...s.trackLayout,
                                transform: `translateX(calc(50% - 150px - ${currentIndex * 340}px))`,
                                transition: useAnim ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                            }}
                        >
                            {extendedSlots.map((slot, idx) => {
                                const isCenter = idx === currentIndex;
                                const isEditing = selectedSlot === slot.slotNumber && (idx >= N && idx < N * 2);

                                return (
                                    <div 
                                        key={`slot-${idx}`} 
                                        onClick={() => idx >= N && idx < N * 2 && setSelectedSlot(slot.slotNumber)}
                                        style={{
                                            ...s.slotCard,
                                            transform: isCenter ? 'scale(1.05) translateY(-5px)' : 'scale(0.85)',
                                            opacity: isCenter ? 1 : 0.4,
                                            border: isEditing ? '2px solid #6366F1' : '1px solid #E2E8F0',
                                            boxShadow: isCenter ? '0 20px 40px -10px rgba(0,0,0,0.1)' : 'none',
                                            cursor: (idx >= N && idx < N * 2) ? 'pointer' : 'default'
                                        }}
                                    >
                                        <div style={s.cardImageArea}>
                                            {slot.imageUrl ? (
                                                <img src={slot.imageUrl} alt="" style={s.fullImg} />
                                            ) : (
                                                <div style={s.emptyPlacer}>
                                                    <span style={{fontSize: '32px', opacity: 0.2}}>🖼️</span>
                                                    <p style={{margin: '10px 0 0', fontWeight: 700}}>비어있음</p>
                                                </div>
                                            )}
                                            <div style={s.slotLabel}>SLOT {slot.slotNumber + 1}</div>
                                        </div>
                                        <div style={s.cardInfo}>
                                            <h3 style={s.cardTitleText}>{slot.artworkTitle || "지정된 작품 없음"}</h3>
                                            <div style={{
                                                ...s.selectPill,
                                                backgroundColor: isEditing ? '#6366F1' : '#F1F5F9',
                                                color: isEditing ? '#FFF' : '#64748B'
                                            }}>
                                                {isEditing ? "CURATING..." : isCenter ? "EDIT SLOT" : "SELECT"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div style={s.section}>
                <div style={s.secHeader}>
                    <h2 style={s.secTitle}>Step 02. 작품 라이브러리</h2>
                    <p style={s.secDesc}>데이터베이스에서 작품을 선택하여 선택한 슬롯에 즉시 반영합니다. ({selectedSlot !== null ? `슬롯 #${selectedSlot + 1} 편집 중` : "편집할 슬롯을 먼저 선택하세요"})</p>
                </div>

                <div style={s.libraryGrid}>
                    {artworks.map((art) => (
                        <div key={art.id} style={s.artCard} onClick={() => handleAssign(art.id)}>
                            <div style={s.artImgBox}>
                                <img src={art.imageUrl} alt="" style={s.fullImg} />
                                <div style={s.artOverlay}>
                                    <div style={s.applyBtn}>슬롯에 즉시 반영 ⚡</div>
                                </div>
                            </div>
                            <div style={s.artInfo}>
                                <span style={s.artTitle}>{art.title}</span>
                                <span style={s.artUser}>@{art.nickname}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    pageWrapper: { animation: 'fadeIn 0.5s ease-out', color: '#1E293B', padding: '0 0 40px 0' },
    loadingBox: { padding: '100px', textAlign: 'center', color: '#94A3B8', fontWeight: 700 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    pageTitle: { fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-1px' },
    pageSubtitle: { fontSize: '15px', color: '#64748B', fontWeight: 500, marginTop: '4px' },
    statusBadge: { padding: '8px 16px', background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 800, color: '#6366F1', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    activeNum: { fontSize: '18px', fontWeight: 900 },
    section: { backgroundColor: '#FFF', padding: '40px', borderRadius: '32px', border: '1px solid #F1F5F9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)', marginBottom: '32px' },
    secHeader: { marginBottom: '30px' },
    secTitle: { fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' },
    secDesc: { fontSize: '14px', color: '#94A3B8', margin: 0, fontWeight: 500 },
    sliderWrap: { position: 'relative', width: '100%', display: 'flex', alignItems: 'center' },
    floatingControls: { position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none', padding: '0 10px' },
    controlBtn: { 
        width: '56px', height: '56px', borderRadius: '50%', border: 'none', background: '#0F172A', color: '#FFF', 
        cursor: 'pointer', pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)', transition: '0.2s transform'
    },
    trackWindow: { width: '100%', height: '480px', overflow: 'hidden', position: 'relative', margin: '0 auto' },
    trackLayout: { display: 'flex', position: 'absolute', top: '20px', left: '0', gap: '40px', width: 'max-content', willChange: 'transform' },
    slotCard: { width: '300px', height: '420px', backgroundColor: '#FFF', borderRadius: '28px', overflow: 'hidden', flexShrink: 0, transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)' },
    cardImageArea: { height: '300px', background: '#F8FAFC', position: 'relative' },
    fullImg: { width: '100%', height: '100%', objectFit: 'cover' },
    emptyPlacer: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' },
    slotLabel: { position: 'absolute', top: '15px', left: '15px', padding: '6px 12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', borderRadius: '10px', fontSize: '11px', fontWeight: 900, color: '#0F172A', border: '1px solid rgba(0,0,0,0.05)' },
    cardInfo: { padding: '24px', textAlign: 'center' },
    cardTitleText: { fontSize: '17px', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    selectPill: { width: '100%', padding: '12px', borderRadius: '14px', fontSize: '12px', fontWeight: 900, transition: '0.2s' },
    libraryGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' },
    artCard: { backgroundColor: '#FFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', transition: '0.2s', cursor: 'pointer' },
    artImgBox: { height: '220px', position: 'relative', overflow: 'hidden' },
    artOverlay: { position: 'absolute', inset: 0, background: 'rgba(99, 102, 241, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' },
    applyBtn: { padding: '8px 16px', background: '#FFF', color: '#6366F1', borderRadius: '10px', fontSize: '12px', fontWeight: 900 },
    artInfo: { padding: '18px' },
    artTitle: { display: 'block', fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' },
    artUser: { fontSize: '12px', color: '#94A3B8', fontWeight: 600 }
};

export default AdminImageManagement;
