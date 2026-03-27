import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'

const TOSS_CLIENT_KEY: string = (import.meta as any).env?.VITE_TOSS_CLIENT_KEY ?? ''

export default function TossPayPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const amount = Number(searchParams.get('amount'))
    const orderName = searchParams.get('orderName') || '토큰 충전'
    const packageId = searchParams.get('packageId') || ''
    const successBase = searchParams.get('successBase') || window.location.origin

    if (!orderId || !amount) return

    sessionStorage.setItem('toss_package_id', packageId)

    loadTossPayments(TOSS_CLIENT_KEY).then(tossPayments => {
      const customerKey = 'guest_qr'
      const payment = tossPayments.payment({ customerKey })
      payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId,
        orderName,
        successUrl: `${successBase}/token-shop?status=toss_success`,
        failUrl: `${successBase}/token-shop?status=fail`,
      }).catch(() => {
        window.close()
      })
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f5ff',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>💳</div>
      <p style={{ color: '#555', fontSize: 15 }}>토스 결제창을 불러오는 중...</p>
    </div>
  )
}
