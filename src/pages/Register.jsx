import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { UserPlus, Download, Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const qrRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      // check if phone already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle()

      if (existing) {
        setError('A user with this phone number is already registered.')
        setLoading(false)
        return
      }

      const qrCode = uuidv4()
      const { data, error: dbError } = await supabase
        .from('users')
        .insert([{ name: name.trim(), phone: phone.trim(), qr_code: qrCode }])
        .select()
        .single()

      if (dbError) throw dbError

      setResult({ ...data, qr_code: qrCode })
      setName('')
      setPhone('')
    } catch (err) {
      setError(err.message || 'Something went wrong, please try again.')
    } finally {
      setLoading(false)
    }
  }

  function downloadQR() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qr-${result.name.replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function copyCode() {
    if (!result) return
    await navigator.clipboard.writeText(result.qr_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl mb-5 shadow-lg shadow-violet-200">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">User Registration</h1>
          <p className="mt-3 text-gray-500 text-lg">Register a new user and generate their unique QR code</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Register User</>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Registration Successful!</h2>
                <p className="text-sm text-gray-500">QR code generated for {result.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center gap-5">
              <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <QRCodeCanvas
                  value={result.qr_code}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="w-full space-y-2">
                <InfoRow label="Name" value={result.name} />
                <InfoRow label="Phone" value={result.phone} />
                <InfoRow label="QR Code" value={result.qr_code} mono />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={copyCode}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  {copied
                    ? <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                    : <><Copy className="w-4 h-4" /> Copy Code</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-200">
      <span className="text-xs font-medium text-gray-400 uppercase">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono text-xs text-gray-600 truncate max-w-[200px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
