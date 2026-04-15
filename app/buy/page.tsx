'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BuyPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const packages = [
    { coins: 1, rubles: 150, weight: 3 },
    { coins: 3, rubles: 450, weight: 9 },
    { coins: 7, rubles: 1050, weight: 21 },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('coins').eq('id', user.id).single();
        setCoins(data?.coins || 0);
      } else {
        router.push('/auth');
      }
    }
    loadData();
  }, [router]);

  const handlePayment = async (pkg: typeof packages[0]) => {
    if (!user) return router.push('/auth');
    if (!acceptedTerms) {
      alert("Примите условия пользовательского соглашения.");
      return;
    }

    setSelectedPackage(`${pkg.coins}-coins`);
    setLoading(true);

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pkg.rubles, userId: user.id, coins: pkg.coins }),
      });

      const data = await response.json();

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else if (data.error) {
        alert(`Ошибка: ${data.error}`);
        setLoading(false);
        setSelectedPackage(null);
      }
    } catch (error) {
      alert("Произошла ошибка при подключении к платежной системе");
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* HEADER */}
      <header className="glass-card px-6 py-4 mb-6 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold text-[#00D4FF] hover:text-[#4FC3F7] transition flex items-center gap-2">
          <span>←</span> На главную
        </Link>
        <div className="text-right">
          <span className="text-[10px] text-[#3d6b7a]/60 block uppercase font-black">Баланс</span>
          <span className="font-bold text-sm text-[#1a3a4a]">{coins} ⚡</span>
        </div>
      </header>

      {/* MAIN CARD */}
      <div className="glass-card p-8 md:p-10 text-center">
        <h1 className="text-3xl font-black mb-4 text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Пополнить баланс</h1>
        <p className="text-[#3d6b7a] mb-8 text-sm leading-relaxed">
          Один платный голос (<span className="text-[#00D4FF] font-bold">1 ⚡</span>) дает вашей опции сразу
          <span className="font-bold text-[#1a3a4a] ml-1">3 очка</span>.
        </p>

        {/* PACKAGES */}
        <div className="space-y-4 mb-8">
          {packages.map(pkg => (
            <button
              key={pkg.coins}
              onClick={() => handlePayment(pkg)}
              disabled={loading}
              className={`w-full p-5 border-2 rounded-3xl flex justify-between items-center transition-all bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPackage === `${pkg.coins}-coins`
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                  : 'border-white/20 hover:border-[#00D4FF]/50 hover:bg-white/15'
              }`}
            >
              <div className="text-left">
                <span className="block font-black text-2xl text-[#1a3a4a]">{pkg.coins} ⚡</span>
                <span className="text-[10px] text-[#3d6b7a]/60 font-bold uppercase tracking-wider">
                  {pkg.weight} очка в сюжет
                </span>
              </div>
              <div className={`px-6 py-3 rounded-2xl font-black transition shadow-lg ${
                selectedPackage === `${pkg.coins}-coins`
                  ? 'bg-[#00D4FF] text-[#1a3a4a] shadow-[#00D4FF]/30'
                  : 'bg-white/20 text-[#1a3a4a] hover:bg-white/30'
              }`}>
                {pkg.rubles} ₽
              </div>
            </button>
          ))}
        </div>

        {/* TERMS CHECKBOX */}
        <div className="flex items-start gap-3 text-left mb-8 p-4 bg-white/10 rounded-2xl border border-white/20">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/30 text-[#00D4FF] focus:ring-[#00D4FF] bg-white/10 cursor-pointer"
          />
          <label htmlFor="terms" className="text-[11px] leading-snug text-[#3d6b7a] cursor-pointer">
            Я принимаю условия <Link href="/purchase-terms" className="text-[#00D4FF] font-bold underline">Пользовательского соглашения</Link> и согласен на оказание платных услуг.
          </label>
        </div>

        <p className="text-[10px] text-[#3d6b7a]/60 uppercase tracking-widest font-bold">Безопасная оплата ЮKassa</p>
      </div>
    </div>
  );
}
