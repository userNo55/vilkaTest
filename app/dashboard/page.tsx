'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudonym, setPseudonym] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyStories() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return (window.location.href = '/auth');

      const { data: profile } = await supabase.from('profiles').select('pseudonym, avatar_url').eq('id', user.id).single();
      setPseudonym(profile?.pseudonym || '');
      setAvatarUrl(profile?.avatar_url || null);

      const { data } = await supabase
        .from('stories')
        .select('*, chapters(chapter_number, expires_at)')
        .eq('author_id', user.id);

      setStories(data || []);
      setLoading(false);
    }
    loadMyStories();
  }, []);

  const handleDelete = async (storyId: string, title: string) => {
    if (!confirm(`Удалить книгу "${title}"?`)) return;
    const { error } = await supabase.from('stories').delete().eq('id', storyId);
    if (error) alert("Ошибка: " + error.message);
    else setStories(stories.filter(s => s.id !== storyId));
  };

  if (loading) return <div className="p-10 text-center text-[#3d6b7a] font-semibold animate-pulse">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-h-screen">
      {/* HEADER */}
      <header className="glass-card px-6 py-4 mb-6 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold text-[#00D4FF] hover:text-[#4FC3F7] transition flex items-center gap-2">
          <span>←</span> На главную
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#3d6b7a]/60 block uppercase font-black tracking-tighter">Автор</span>
            <span className="font-bold text-sm text-[#1a3a4a]">{pseudonym}</span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#1a3a4a] font-bold">{pseudonym ? pseudonym[0].toUpperCase() : '?'}</span>
            )}
          </div>
        </div>
      </header>

      {/* TITLE + NEW BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Личный кабинет</h1>
        <Link
          href="/write"
          className="glass-button px-8 py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition"
        >
          + Написать новую книгу
        </Link>
      </div>

      {/* STORIES LIST */}
      <div className="space-y-4">
        {stories.length === 0 ? (
          <div className="glass-card text-center py-20">
            <p className="text-[#3d6b7a] font-medium">У вас пока нет опубликованных книг.</p>
          </div>
        ) : (
          stories.map(story => {
            const lastChapter = story.chapters?.reduce((prev: any, curr: any) =>
              (prev.chapter_number > curr.chapter_number) ? prev : curr, story.chapters[0] || null);

            const isVotingActive = lastChapter && new Date(lastChapter.expires_at) > new Date();
            const isCompleted = story.is_completed === true;

            return (
              <div key={story.id} className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <Link href={`/story/${story.id}`} className="group block">
                    <h2 className="text-xl md:text-2xl font-bold mb-1 group-hover:text-[#00D4FF] transition-colors flex items-center gap-2 text-[#1a3a4a]">
                      {story.title}
                      {isCompleted && (
                        <span className="text-xs px-2 py-1 bg-[#B388FF]/20 text-[#B388FF] rounded-full font-bold">
                          ЗАВЕРШЕНО
                        </span>
                      )}
                    </h2>
                  </Link>
                  <p className="text-[#3d6b7a] text-sm">
                    Опубликовано глав: <span className="font-bold text-[#1a3a4a]">{story.chapters?.length || 0}</span>
                  </p>
                </div>

                <div className="w-full md:w-auto flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(story.id, story.title)}
                    className="p-3 rounded-xl bg-[#FF6B9D]/20 text-[#FF6B9D] hover:bg-[#FF6B9D]/30 transition-colors border border-[#FF6B9D]/30"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>

                  {isCompleted ? (
                    <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-xl text-center flex-1 md:min-w-[200px]">
                      <span className="text-[#3d6b7a] text-[10px] font-black uppercase block mb-1 tracking-widest">История завершена</span>
                    </div>
                  ) : isVotingActive ? (
                    <div className="bg-[#FFB74D]/20 border border-[#FFB74D]/30 px-6 py-4 rounded-xl text-center flex-1 md:min-w-[200px]">
                      <span className="text-[#FFB74D] text-[10px] font-black uppercase block mb-1 tracking-widest">Голосование активно</span>
                      <button disabled className="text-[#3d6b7a] text-sm font-bold cursor-not-allowed">Ожидайте</button>
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/add-chapter?storyId=${story.id}&next=${(lastChapter?.chapter_number || 0) + 1}`}
                      className="inline-block text-center glass-button px-8 py-4 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition flex-1 md:min-w-[200px]"
                    >
                      Глава {(lastChapter?.chapter_number || 0) + 1}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
