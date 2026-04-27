declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: Record<string, unknown>) => void
    }
  }
}

export function loadMidtransSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(); return }
    const isSandbox = process.env.NEXT_PUBLIC_MIDTRANS_IS_SANDBOX === 'true'
    const script = document.createElement('script')
    script.src = isSandbox 
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap'))
    document.head.appendChild(script)
  })
}
