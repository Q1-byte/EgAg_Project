import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getPaymentStatus } from '../api/payment'
import { useAuthStore } from '../stores/useAuthStore'

interface Props {
  type: 'kakaopay' | 'tosspay'
  url: string
  orderId: string
  amount: number
  onSuccess: (tokens: number, newBalance: number) => void
  onClose: () => void
}

export default function PaymentQrModal({ type, url, orderId, amount, onSuccess, onClose }: Props) {
  const { tokenBalance, setTokenBalance } = useAuthStore()
  const [status, setStatus] = useState<'waiting' | 'paid' | 'failed'>('waiting')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const TIMEOUT = 300

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= TIMEOUT) {
          clearInterval(timerRef.current!)
          clearInterval(intervalRef.current!)
          setStatus('failed')
        }
        return e + 1
      })
    }, 1000)

    intervalRef.current = setInterval(async () => {
      try {
        const res = await getPaymentStatus(orderId)
        if (res.status === 'paid') {
          clearInterval(intervalRef.current!)
          clearInterval(timerRef.current!)
          setStatus('paid')
          const tokens = Number(res.tokens || 0)
          const newBalance = (tokenBalance ?? 0) + tokens
          setTokenBalance(newBalance)
          setTimeout(() => onSuccess(tokens, newBalance), 1400)
        }
      } catch { /* ignore */ }
    }, 3000)

    return () => {
      clearInterval(intervalRef.current!)
      clearInterval(timerRef.current!)
    }
  }, [])

  const remaining = TIMEOUT - elapsed
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progress = (elapsed / TIMEOUT) * 100

  const isKakao = type === 'kakaopay'
  const brand = isKakao
    ? { bg: '#FAE100', text: '#3C1E1E', label: '카카오페이', grad: 'linear-gradient(135deg,#FAE100,#f5c400)' }
    : { bg: '#0064FF', text: '#fff',    label: '토스페이',   grad: 'linear-gradient(135deg,#0064FF,#0047cc)' }

  const KakaoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#3C1E1E">
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.74 5.18 4.36 6.6l-.96 3.6 4.2-2.76c.78.12 1.58.18 2.4.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
    </svg>
  )
  const TossIcon = () => (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" fill="#fff" fillOpacity=".15"/>
      <path d="M15 24l6 6 12-12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <>
      <style>{`
        @keyframes qr-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes qr-in { from{opacity:0;transform:scale(.92) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin-ring { to{transform:rotate(360deg)} }
        @keyframes success-pop { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes dot-bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{
          background: '#fff', borderRadius: 28,
          width: 360, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          animation: 'qr-in .3s cubic-bezier(.34,1.56,.64,1) both',
        }}>

          {/* 헤더 */}
          <div style={{
            background: brand.grad, padding: '24px 28px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isKakao ? <KakaoIcon /> : <TossIcon />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: brand.text, lineHeight: 1.2 }}>
                  {brand.label} QR 결제
                </div>
                <div style={{
                  fontWeight: 700, fontSize: 15, color: brand.text,
                  opacity: .7, marginTop: 2,
                }}>
                  {amount.toLocaleString()}원
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: brand.text, fontSize: 16,
            }}>✕</button>
          </div>

          {/* 본문 */}
          <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

            {status === 'waiting' && (
              <>
                {/* QR 프레임 */}
                <div style={{ position: 'relative' }}>
                  {/* 코너 장식 */}
                  {[
                    { top: -4, left: -4, borderTop: `3px solid ${brand.bg}`, borderLeft: `3px solid ${brand.bg}` },
                    { top: -4, right: -4, borderTop: `3px solid ${brand.bg}`, borderRight: `3px solid ${brand.bg}` },
                    { bottom: -4, left: -4, borderBottom: `3px solid ${brand.bg}`, borderLeft: `3px solid ${brand.bg}` },
                    { bottom: -4, right: -4, borderBottom: `3px solid ${brand.bg}`, borderRight: `3px solid ${brand.bg}` },
                  ].map((s, i) => (
                    <div key={i} style={{
                      position: 'absolute', width: 20, height: 20, borderRadius: 2, ...s,
                    }} />
                  ))}
                  <div style={{
                    padding: 14, background: '#fafafa', borderRadius: 16,
                    border: '1px solid #ebebeb',
                  }}>
                    <QRCodeSVG
                      value={url}
                      size={180}
                      bgColor="#fafafa"
                      level="M"
                    />
                  </div>
                </div>

                {/* 안내 */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>
                    QR 코드를 스캔해주세요
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                    스마트폰 카메라 또는 {brand.label} 앱으로<br />스캔하면 결제창이 열립니다
                  </p>
                </div>

                {/* 결제 대기 인디케이터 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#f7f7fc', borderRadius: 12, padding: '10px 18px',
                  width: '100%',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: brand.bg === '#FAE100' ? '#d4a000' : brand.bg,
                        animation: `dot-bounce 1.4s ${i * 0.16}s infinite ease-in-out`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: '#666', flex: 1 }}>결제 완료를 기다리는 중...</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: remaining < 60 ? '#e05050' : '#999',
                  }}>{mm}:{ss}</span>
                </div>

                {/* 타임아웃 프로그레스 */}
                <div style={{ width: '100%', height: 3, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: remaining < 60 ? '#e05050' : (brand.bg === '#FAE100' ? '#d4a000' : brand.bg),
                    width: `${100 - progress}%`,
                    transition: 'width 1s linear, background .3s',
                  }} />
                </div>
              </>
            )}

            {status === 'paid' && (
              <div style={{ textAlign: 'center', padding: '16px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#43c59e,#2aa87a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(67,197,158,.35)',
                  animation: 'success-pop .5s cubic-bezier(.34,1.56,.64,1) both',
                }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 20, color: '#1a1a2e', margin: 0 }}>결제 완료!</p>
                  <p style={{ fontSize: 14, color: '#888', margin: '6px 0 0' }}>토큰이 충전되었습니다</p>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div style={{ textAlign: 'center', padding: '16px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ff6b6b,#e05050)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(224,80,80,.3)',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 17, color: '#1a1a2e', margin: 0 }}>시간이 초과되었습니다</p>
                  <p style={{ fontSize: 13, color: '#aaa', margin: '6px 0 0' }}>다시 시도해주세요</p>
                </div>
                <button onClick={onClose} style={{
                  padding: '12px 32px', borderRadius: 14,
                  background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                  color: '#fff', border: 'none', fontWeight: 700,
                  cursor: 'pointer', fontSize: 14, marginTop: 4,
                  boxShadow: '0 4px 16px rgba(124,58,237,.3)',
                }}>닫기</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
