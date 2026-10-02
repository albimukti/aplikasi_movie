import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  QrCode, Heart, Sparkles, ShieldCheck, CheckCircle2, 
  Copy, Check, DollarSign, Wallet, Award 
} from 'lucide-react';

export const SupportQRISView = () => {
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  useEffect(() => {
    api.getActiveQRIS()
      .then((res) => {
        if (res.data) setQrisData(res.data);
      })
      .catch((err) => console.error("Error fetching active QRIS:", err))
      .finally(() => setLoading(false));
  }, []);

  const copyString = () => {
    if (qrisData?.qris_url) {
      navigator.clipboard.writeText(qrisData.qris_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    setIsSuccessModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-10 pb-24 md:pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center space-y-2.5 sm:space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-emerald-400" /> Dukungan Komunitas & Kreator
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
          Dukung Pengembangan <span className="text-cinema-red text-glow-red">MovieHub</span>
        </h1>
        <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
          {qrisData?.description || "Setiap kontribusi Anda membantu kami menjaga server CDN kecepatan tinggi, kompresi 4K Ultra HD, dan menghadirkan film indie tanpa jeda."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left Column: QRIS Barcode Card */}
        <div className="md:col-span-5 glass-panel p-4 sm:p-8 rounded-3xl border border-cinema-red/30 shadow-3d-card text-center space-y-4 sm:space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-zinc-300 uppercase tracking-widest">
            <QrCode className="w-4 h-4 text-cinema-red" />
            <span>Scan QRIS Resmi</span>
          </div>

          {/* Barcode Frame with Red Glow */}
          <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64 p-2.5 sm:p-3 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-4 border-cinema-red">
            <img
              src={qrisData?.qris_url || "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MOVIEHUB-QRIS-SUPPORT-2026"}
              alt="QRIS Barcode"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="font-heading font-bold text-base sm:text-lg text-white">
              {qrisData?.title || "MovieHub Official Support"}
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NMID Terverifikasi QRIS Nasional (ASPI)</span>
            </div>
          </div>

          {/* Supported E-Wallets */}
          <div className="pt-2 border-t border-zinc-800 text-[10px] sm:text-[11px] text-zinc-400 space-y-2">
            <div>Mendukung Semua Bank & E-Wallet:</div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap font-semibold text-zinc-300">
              <span className="px-2 py-0.5 rounded bg-cinema-850">BCA</span>
              <span className="px-2 py-0.5 rounded bg-cinema-850">Mandiri</span>
              <span className="px-2 py-0.5 rounded bg-cinema-850">BRI</span>
              <span className="px-2 py-0.5 rounded bg-cinema-850">GoPay</span>
              <span className="px-2 py-0.5 rounded bg-cinema-850">OVO</span>
              <span className="px-2 py-0.5 rounded bg-cinema-850">Dana</span>
            </div>
          </div>
        </div>

        {/* Right Column: Amount Selection & Direct Action */}
        <div className="md:col-span-7 glass-panel p-4 sm:p-8 rounded-3xl border border-cinema-border space-y-5 sm:space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
              Pilih Nominal Apresiasi
            </h2>
            <p className="text-xs text-zinc-400">
              Pilih nominal donasi yang ingin Anda berikan untuk server MovieHub:
            </p>
          </div>

          {/* Amount Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[10000, 25000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-cinema-red text-white border-cinema-red shadow-3d-red'
                    : 'bg-cinema-850 text-zinc-300 border-zinc-700/60 hover:border-cinema-red/50 hover:bg-cinema-800'
                }`}
              >
                Rp {amt.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Atau Masukkan Nominal Khusus (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-bold">
                Rp
              </span>
              <input
                type="number"
                placeholder="Contoh: 150000"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(Number(e.target.value) || 0);
                }}
                className="w-full bg-cinema-850 border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          {/* Perks / Benefits */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-cinema-850/50 border border-zinc-800 text-xs text-zinc-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cinema-gold" />
              <span>Apresiasi Donatur MovieHub:</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-zinc-400">
              <li>Mendukung pemeliharaan server berkecepatan tinggi tanpa buffering.</li>
              <li>Akses prioritas resolusi 4K Ultra HD 2160p untuk semua film.</li>
              <li>Membantu biaya penerjemahan subtitle multi-bahasa resmi.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleSimulatePayment}
              className="w-full sm:flex-1 py-3.5 rounded-xl red-gradient-btn text-white font-bold text-sm flex items-center justify-center gap-2 shadow-3d-red hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Konfirmasi Telah Bayar (Rp {(customAmount ? Number(customAmount) : selectedAmount).toLocaleString('id-ID')})</span>
            </button>

            <button
              onClick={copyString}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin URL QRIS'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Thank you confirmation modal */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-emerald-500/40 shadow-3d-card text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl text-white">
                Terima Kasih Banyak!
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Dukungan sebesar <strong className="text-emerald-400 font-bold">Rp {(customAmount ? Number(customAmount) : selectedAmount).toLocaleString('id-ID')}</strong> telah berhasil dikonfirmasi. Anda adalah pahlawan bagi kelangsungan platform streaming film ini!
              </p>
            </div>

            <button
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-3 rounded-xl red-gradient-btn text-white font-bold text-sm shadow-3d-red cursor-pointer"
            >
              Kembali Menonton Film
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
