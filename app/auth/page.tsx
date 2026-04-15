'use client';
import { useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Загрузка...');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setStatus('Ошибка: ' + error.message);
      else window.location.href = '/';
    } else {
      if (!pseudonym) return setStatus('Введите псевдоним!');

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setStatus('Ошибка: ' + signUpError.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, pseudonym });
        if (profileError) setStatus('Аккаунт создан, но профиль не настроен: ' + profileError.message);
        else {
          setStatus('Успешная регистрация! Теперь войдите.');
          setIsLogin(true);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8">
        {/* TABS */}
        <div className="flex bg-white/20 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              isLogin ? 'bg-white/30 text-[#1a3a4a] shadow-lg' : 'text-[#3d6b7a]/60 hover:text-[#1a3a4a]'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              !isLogin ? 'bg-white/30 text-[#1a3a4a] shadow-lg' : 'text-[#3d6b7a]/60 hover:text-[#1a3a4a]'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* TITLE */}
        <h1 className="text-xl font-black text-center mb-6 text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {isLogin ? 'С возвращением!' : 'Новый пользователь'}
        </h1>

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Ваш псевдоним"
              className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
              onChange={e => setPseudonym(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full glass-button py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition"
          >
            {isLogin ? 'Войти' : 'Создать профиль'}
          </button>
        </form>

        {/* STATUS */}
        {status && (
          <p className="mt-6 text-center text-sm font-bold text-[#1a3a4a] bg-white/20 p-3 rounded-xl">
            {status}
          </p>
        )}

        {/* BACK LINK */}
        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#3d6b7a] hover:text-[#00D4FF] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>На главную</span>
          </a>
        </div>
      </div>
    </div>
  );
}
