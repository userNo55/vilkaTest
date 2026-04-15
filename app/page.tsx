'use client';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Link from 'next/link';
import { FaRegClock } from 'react-icons/fa';

export default function HomePage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'new' | 'engagement'>('new');

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('pseudonym')
        .eq('id', user.id)
        .single();
      setUserNickname(profile?.pseudonym || user.email);
    }

    let query = supabase
      .from('stories')
      .select(`
        *,
        profiles(pseudonym),
        chapters(id),
        favorites(user_id)
      `)
      .limit(20)
      .filter('favorites.user_id', 'eq', user?.id || '00000000-0000-0000-0000-000000000000');

    if (sortOrder === 'new') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('engagement', { ascending: false });
    }

    const { data } = await query;
    setStories(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [sortOrder]);

  const toggleFavorite = async (e: React.MouseEvent, storyId: string, isFav: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) return alert("Войдите, чтобы добавлять в избранное");

    setStories(prevStories =>
      prevStories.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            favorites: isFav ? [] : [{ user_id: userId }]
          };
        }
        return story;
      })
    );

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, story_id: storyId });
      if (error) { console.error(error); loadData(); }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, story_id: storyId });
      if (error) { console.error(error); loadData(); }
    }
  };

  const displayedStories = showFavoritesOnly
    ? stories.filter(s => s.favorites && s.favorites.length > 0)
    : stories.filter(story => {
        if (showActiveOnly && story.is_completed) {
          return false;
        }
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4] transition-colors duration-500">
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">

        {/* ===== HEADER ===== */}
        <header className="glass-card px-6 py-4 mb-6 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              VILKA <span className="text-lg font-normal opacity-60">· 2.0KY</span>
            </h1>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {userNickname ? (
              <>
                {/* ДЕСКТОПНАЯ КНОПКА "МОИ КНИГИ" */}
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center glass-button px-4 py-2 text-sm font-semibold text-[#1a3a4a] hover:text-[#00D4FF] transition-colors"
                >
                  <span>Мои книги</span>
                </Link>

                {/* ПРОФИЛЬ */}
                <Link
                  href="/profile"
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-[#4AE8A5] dot-pulse"></div>
                  <span className="text-sm font-bold text-[#1a3a4a] truncate max-w-[80px] md:max-w-none">
                    {userNickname}
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/auth" className="glass-button px-6 py-2.5 text-sm font-bold text-[#1a3a4a] hover:text-[#00D4FF]">
                Войти
              </Link>
            )}
          </div>
        </header>

        {/* ===== FILTER TABS (DESKTOP ONLY) ===== */}
        <div className="hidden md:flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSortOrder(sortOrder === 'new' ? 'engagement' : 'new')}
            className={`glass-button px-5 py-3 flex items-center gap-2 whitespace-nowrap font-semibold text-sm ${
              sortOrder === 'engagement'
                ? 'glass-button-active text-[#1a3a4a]'
                : 'text-[#3d6b7a] hover:text-[#00D4FF]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            ПОПУЛЯРНЫЕ
          </button>

          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`glass-button px-5 py-3 flex items-center gap-2 whitespace-nowrap font-semibold text-sm ${
              showActiveOnly
                ? 'glass-button-active text-[#1a3a4a]'
                : 'text-[#3d6b7a] hover:text-[#00D4FF]'
            }`}
          >
            <FaRegClock className="w-4 h-4" />
            АКТИВНЫЕ
          </button>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`glass-button px-5 py-3 flex items-center gap-2 whitespace-nowrap font-semibold text-sm ${
              showFavoritesOnly
                ? 'glass-button-active text-[#1a3a4a]'
                : 'text-[#3d6b7a] hover:text-[#FF6B9D]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            ИЗБРАННОЕ
          </button>

          <Link
            href="/feed"
            className="glass-button px-5 py-3 flex items-center gap-2 whitespace-nowrap font-semibold text-sm text-[#1a3a4a] hover:text-[#B388FF] transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            НОВЫЕ ГЛАВЫ
          </Link>
        </div>

        {/* ===== STORIES GRID ===== */}
        {loading ? (
          <div className="text-center py-20 text-[#3d6b7a] font-semibold animate-pulse">Загрузка...</div>
        ) : displayedStories.length === 0 ? (
          <div className="glass-card text-center py-20">
            <p className="text-[#3d6b7a] font-medium">
              {showFavoritesOnly ? "В избранном пока пусто." :
               showActiveOnly ? "Активных историй пока нет." :
               "Книг пока нет."}
            </p>
            {showFavoritesOnly && (
              <button onClick={() => setShowFavoritesOnly(false)} className="mt-4 text-[#00D4FF] font-bold text-sm underline hover:text-[#4FC3F7] transition-colors">
                Показать всё
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedStories.map((story) => {
              const isFavorite = story.favorites && story.favorites.length > 0;
              const isCompleted = story.is_completed;

              return (
                <Link
                  href={`/story/${story.id}`}
                  key={story.id}
                  className="group glass-card p-6 md:p-8 card-hover flex flex-col h-full"
                >
                  {/* TOP ROW: Age badge + Heart */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="glass-badge text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 text-[#1a3a4a]">
                      {story.age_rating || '16+'}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(e, story.id, isFavorite)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        isFavorite 
                          ? 'text-[#FF6B9D] bg-[#FF6B9D]/20 heart-glow' 
                          : 'text-[#3d6b7a]/40 bg-white/10 hover:text-[#FF6B9D]'
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* BADGES ROW */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="glass-badge flex items-center gap-1 text-[10px] font-bold text-[#FFB74D] px-3 py-1.5 uppercase">
                      ⚡ {story.engagement || 0}
                    </span>

                    <span className="glass-badge text-[10px] font-bold text-[#4FC3F7] px-3 py-1.5 uppercase">
                      {story.chapters?.length || 0} ГЛАВ
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#B388FF] bg-[#B388FF]/20 border border-[#B388FF]/40 px-3 py-1.5 rounded-full uppercase">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        ЗАВЕРШЕНА
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-[#00D4FF] transition-colors leading-tight text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {story.title}
                  </h2>

                  {/* DESCRIPTION */}
                  <p className="text-[#3d6b7a] text-sm mb-6 line-clamp-3 leading-relaxed">
                    {story.description || 'Описание отсутствует...'}
                  </p>

                  {/* BOTTOM: Author + Arrow */}
                  <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4AE8A5] dot-pulse"></div>
                      <span className="text-sm font-bold text-[#1a3a4a]">
                        {story.profiles?.pseudonym || 'Анонимный автор'}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[#1a3a4a] group-hover:bg-[#00D4FF]/30 group-hover:border-[#00D4FF] transition-all">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* ===== MOBILE BOTTOM BAR ===== */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-3 flex justify-around items-center">
            <button
              onClick={() => setSortOrder(sortOrder === 'new' ? 'engagement' : 'new')}
              className={`p-3 rounded-full transition-all duration-300 ${
                sortOrder === 'engagement'
                  ? 'bg-[#FFB74D]/30 text-[#1a3a4a]'
                  : 'bg-white/10 text-[#3d6b7a]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </button>

            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`p-3 rounded-full transition-all duration-300 ${
                showActiveOnly
                  ? 'bg-[#00D4FF]/30 text-[#1a3a4a]'
                  : 'bg-white/10 text-[#3d6b7a]'
              }`}
            >
              <FaRegClock className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-3 rounded-full transition-all duration-300 ${
                showFavoritesOnly
                  ? 'bg-[#FF6B9D]/30 text-[#1a3a4a]'
                  : 'bg-white/10 text-[#3d6b7a]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <Link
              href="/feed"
              className="p-3 rounded-full bg-white/10 text-[#3d6b7a] hover:text-[#B388FF] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </Link>

            <Link
              href="/dashboard"
              className="p-3 rounded-full bg-white/10 text-[#3d6b7a] hover:text-[#00D4FF] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="md:hidden h-16"></div>
    </div>
  );
}
