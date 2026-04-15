'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [pseudonym, setPseudonym] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setPseudonym(data.pseudonym || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        }
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      pseudonym,
      bio,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    });

    if (error) alert("Ошибка: возможно псевдоним уже занят");
    else alert("Профиль обновлён!");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Ошибка: ' + error.message);
    else {
      router.push('/');
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center text-[#3d6b7a] font-semibold animate-pulse">Загрузка...</div>;
  if (!user) return <div className="p-10 text-center text-[#3d6b7a]">Нужно войти в систему</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* HEADER */}
      <header className="glass-card px-6 py-4 mb-6 flex items-center justify-between">
        <Link href="/" className="text-[#00D4FF] font-bold hover:text-[#4FC3F7] transition flex items-center gap-2 text-lg">
          ←
        </Link>
        <h1 className="text-lg font-black uppercase tracking-widest text-[#1a3a4a]">Настройки</h1>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-full hover:bg-white/10 transition-colors group"
          title="Выйти"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3d6b7a] group-hover:text-[#FF6B9D] transition-colors">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      {/* PROFILE CARD */}
      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white/20 mb-4 overflow-hidden border-4 border-white/30">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>
          <p className="text-xs text-[#3d6b7a]/60 font-bold uppercase">Фото автора</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase text-[#3d6b7a]/60 mb-2 ml-1">Псевдоним</label>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
              placeholder="Как вас называть?"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#3d6b7a]/60 mb-2 ml-1">Ссылка на аватар (URL)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
              placeholder="https://image.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#3d6b7a]/60 mb-2 ml-1">Биография</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="glass-input w-full p-4 h-32 text-[#1a3a4a] placeholder-[#3d6b7a]/40 resize-none"
              placeholder="Расскажите о себе читателям..."
            />
          </div>

          <button
            onClick={saveProfile}
            className="w-full glass-button py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
