import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, Search, CheckCircle2, XCircle, Loader2, Camera, Keyboard } from 'lucide-react'

export default function Validate() {
  const [mode, setMode] = useState('manual')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)
  const isRunning = useRef(false)

  async function lookup(qrCode) {
    if (!qrCode.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('qr_code', qrCode.trim())
        .maybeSingle()

      if (error) throw error
      setResult(data ? { found: true, user: data } : { found: false })
    } catch {
      setResult({ found: false, error: true })
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    lookup(code)
  }

  function switchMode(newMode) {
    setResult(null)
    if (newMode !== 'scan') setScannerReady(false)
    setMode(newMode)
  }

  // safely stop the scanner without throwing
  async function stopScanner(instance) {
    if (!instance || !isRunning.current) return
    try { await instance.stop() } catch { /* already stopped */ }
    isRunning.current = false
  }

  useEffect(() => {
    if (mode !== 'scan') {
      stopScanner(html5QrRef.current).then(() => { html5QrRef.current = null })
      return
    }

    let cancelled = false

    async function initScanner() {
      try {
        const scanner = new Html5Qrcode('qr-reader')
        html5QrRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            setCode(decoded)
            lookup(decoded)
            isRunning.current = false
            scanner.stop().catch(() => {})
            setScannerReady(false)
            setMode('manual')
          },
          () => {} // ignore partial scan errors
        )

        if (!cancelled) {
          isRunning.current = true
          setScannerReady(true)
        }
      } catch {
        // camera denied or unavailable
        if (!cancelled) {
          isRunning.current = false
          setScannerReady(false)
          setMode('manual')
        }
      }
    }

    initScanner()

    return () => {
      cancelled = true
      stopScanner(html5QrRef.current).then(() => { html5QrRef.current = null })
    }
  }, [mode])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Validate QR Code</h1>
          <p className="mt-3 text-gray-500 text-lg">Scan or enter a QR code to verify registration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Manual Input
            </button>
            <button
              onClick={() => switchMode('scan')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                mode === 'scan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-4 h-4" /> Scan QR
            </button>
          </div>

          {mode === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="qr-code" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  QR Code Value
                </label>
                <input
                  id="qr-code"
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Paste the QR code here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Validating...</>
                  : <><Search className="w-5 h-5" /> Validate</>
                }
              </button>
            </form>
          )}

          {mode === 'scan' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-900">
                <div id="qr-reader" ref={scannerRef} className="w-full" />
                {scannerReady && (
                  <div className="scanner-overlay">
                    <div className="scan-line" />
                    <div className="scanner-corners" />
                    <div className="scanner-corners-bottom" />
                  </div>
                )}
                {!scannerReady && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Starting camera...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 text-center">
                {scannerReady ? 'Scanning... hold QR code steady' : 'Waiting for camera access'}
              </p>
            </div>
          )}
        </div>

        {/* validation result */}
        {result && result.found && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">User Verified</h2>
                <p className="text-sm text-emerald-600">QR code matches a registered user</p>
              </div>
            </div>

            <div className="space-y-2">
              <DetailRow label="Name" value={result.user.name} />
              <DetailRow label="Phone" value={result.user.phone} />
              <DetailRow label="QR Code" value={result.user.qr_code} mono />
              <DetailRow label="Registered" value={formatDate(result.user.created_at)} />
            </div>
          </div>
        )}

        {result && !result.found && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-red-100 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-800">Not Found</h2>
                <p className="text-sm text-red-500">
                  {result.error ? 'Something went wrong, try again.' : 'No user matches this QR code.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between bg-emerald-50/40 rounded-lg px-4 py-3 border border-emerald-100">
      <span className="text-xs font-medium text-emerald-500 uppercase">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono text-xs text-gray-600' : ''}`}>
        {value}
      </span>
    </div>
  )
}
