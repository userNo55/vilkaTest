'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.refresh();
    }, 2000);
  }, [router]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="glass-card p-8 mb-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black mb-2 text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Оплата успешна!</h1>
        <p className="text-[#3d6b7a] mb-6">
          Ваш баланс пополнен. Монеты уже на вашем счету.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/"
          className="block w-full glass-button py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition"
        >
          На главную
        </Link>

        <Link
          href="/buy"
          className="block w-full glass-button py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition"
        >
          Купить ещё
        </Link>
      </div>
    </div>
  );
}
