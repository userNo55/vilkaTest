'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [votedChapters, setVotedChapters] = useState<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  const touchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    async function loadFeed() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const dayAgo = new Date();
      dayAgo.setHours(dayAgo.getHours() - 24);

      const { data: chaptersData } = await supabase
        .from('chapters')
        .select(`
          *,
          story:stories!inner(
            id,
            title,
            author_id,
            profiles!inner(pseudonym, avatar_url)
          ),
          options(*)
        `)
        .gte('created_at', dayAgo.toISOString())
        .order('created_at', { ascending: false });

      if (chaptersData) setChapters(chaptersData);

      if (user) {
        const [favsResult, votesResult] = await Promise.all([
          supabase.from('favorites').select('story_id').eq('user_id', user.id),
          supabase.from('votes').select('chapter_id').eq('user_id', user.id)
        ]);

        setFavorites(new Set(favsResult.data?.map(f => f.story_id) || []));
        setVotedChapters(new Set(votesResult.data?.map(v => v.chapter_id) || []));
      }

      setLoading(false);
    }

    loadFeed();
  }, []);

  const goToNext = () => {
    if (currentIndex < chapters.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleDoubleTap = () => {
    goToNext();
    if (!localStorage.getItem('feed_tooltip_shown')) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      localStorage.setItem('feed_tooltip_shown', 'true');
    }
  };

  const handleTap = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      if (touchTimer.current) clearTimeout(touchTimer.current);
      touchTimer.current = setTimeout(() => {
        lastTapRef.current = 0;
        touchTimer.current = undefined;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    setTouchEnd(touchEndX);
    const distance = Math.abs(touchEndX - touchStart);
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      if (touchEndX < touchStart) goToNext();
      else goToPrev();
    } else if (distance < 10) {
      handleTap(e);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleFavorite = async (e: React.MouseEvent, storyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return router.push('/auth');

    const isFavorite = favorites.has(storyId);
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (isFavorite) newSet.delete(storyId);
      else newSet.add(storyId);
      return newSet;
    });

    if (isFavorite) {
      await supabase.from('favorites').delete().match({ user_id: user.id, story_id: storyId });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, story_id: storyId });
    }
  };

  const canVote = (chapter: any) => {
    if (!user) return false;
    const now = new Date();
    const expiresAt = new Date(chapter.expires_at);
    return expiresAt > now && !votedChapters.has(chapter.id);
  };

  const handleVote = async (optionId: string, chapterId: string, currentVotes: number) => {
    if (!user) return router.push('/auth');

    try {
      const { error: voteError } = await supabase.from('votes').insert({ user_id: user.id, chapter_id: chapterId });
      if (voteError) throw voteError;

      const { error: updateError } = await supabase.from('options').update({ votes: currentVotes + 1 }).eq('id', optionId);
      if (updateError) throw updateError;

      setVotedChapters(prev => new Set(prev).add(chapterId));
      setChapters(prevChapters =>
        prevChapters.map(ch => {
          if (ch.id === chapterId) {
            return {
              ...ch,
              options: ch.options.map((opt: any) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              )
            };
          }
          return ch;
        })
      );
    } catch (error) {
      alert('Не удалось проголосовать');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4] p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-40"></div>
          ))}
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4] flex items-center justify-center p-4">
        <div className="glass-card text-center p-8">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-bold mb-2 text-[#1a3a4a]">
            За последние 24 часа новых глав нет
          </h2>
          <p className="text-[#3d6b7a] mb-6">Загляните позже или перейдите в каталог</p>
          <button onClick={() => router.back()} className="glass-button px-6 py-3 font-bold text-[#1a3a4a]">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const currentChapter = chapters[currentIndex];
  const isVoteActive = canVote(currentChapter);
  const hasVoted = votedChapters.has(currentChapter.id);
  const totalVotes = currentChapter.options?.reduce((sum: number, o: any) => sum + o.votes, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4]">
      {/* TOP BAR */}
      <div className="sticky top-0 z-10 glass-card rounded-none border-b border-white/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-[#1a3a4a] hover:text-[#00D4FF] transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              {currentChapter.story.profiles?.avatar_url ? (
                <img src={currentChapter.story.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#3d6b7a] font-bold text-sm">
                  {currentChapter.story.profiles?.pseudonym?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            <Link href={`/story/${currentChapter.story.id}`} className="flex items-center gap-1 group">
              <span className="font-bold text-[#1a3a4a] group-hover:text-[#00D4FF] transition line-clamp-1 max-w-[150px]">
                {currentChapter.story.title}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#3d6b7a] group-hover:text-[#00D4FF] transition rotate-90">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>

            <button
              onClick={(e) => toggleFavorite(e, currentChapter.story.id)}
              className={`p-1 transition-colors ${
                favorites.has(currentChapter.story.id) ? 'text-[#FF6B9D] heart-glow' : 'text-[#3d6b7a]/40 hover:text-[#FF6B9D]'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={favorites.has(currentChapter.story.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        ref={contentRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {showTooltip && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 bg-[#00D4FF]/30 backdrop-blur-lg text-[#1a3a4a] px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
            👆 Двойной тап или свайп для навигации
          </div>
        )}

        <div className="px-4 py-6 pb-24">
          <h2 className="text-2xl font-bold mb-4 text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Глава {currentChapter.chapter_number}: {currentChapter.title}
          </h2>

          <div className="prose max-w-none">
            {currentChapter.content?.split('\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-4 text-[#3d6b7a] leading-relaxed">{paragraph}</p>
            ))}
          </div>

          {currentChapter.question_text && (
            <div className="mt-8 glass-card p-6">
              <h3 className="text-lg font-bold mb-4 text-[#1a3a4a]">{currentChapter.question_text}</h3>

              <div className="space-y-3">
                {currentChapter.options?.map((opt: any, index: number) => {
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const canUserVote = isVoteActive && !hasVoted && user;

                  return (
                    <div key={opt.id}>
                      <button
                        onClick={() => handleVote(opt.id, currentChapter.id, opt.votes)}
                        disabled={!canUserVote}
                        className="relative w-full text-left p-4 rounded-xl border border-white/20 bg-white/10 overflow-hidden transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/20"
                      >
                        {(hasVoted || !isVoteActive) && (
                          <div className={`absolute top-0 left-0 h-full transition-all ${
                            index === 0 ? 'bg-[#4AE8A5]/25' :
                            index === 1 ? 'bg-[#FF6B9D]/25' :
                            index === 2 ? 'bg-[#B388FF]/25' :
                            'bg-[#FFB74D]/25'
                          }`} style={{ width: `${percentage}%` }} />
                        )}

                        <div className="relative flex justify-between items-center z-10">
                          <span className="font-semibold text-base text-[#1a3a4a]">
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded text-white mr-2 ${
                              index === 0 ? 'bg-[#4AE8A5]' :
                              index === 1 ? 'bg-[#FF6B9D]' :
                              index === 2 ? 'bg-[#B388FF]' :
                              'bg-[#FFB74D]'
                            }`}>
                              {index + 1}
                            </span>
                            {opt.text}
                          </span>
                          {(hasVoted || !isVoteActive) && (
                            <span className="text-sm font-medium text-[#3d6b7a]">{percentage}%</span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasVoted && (
                <p className="text-center text-xs text-[#3d6b7a] mt-4">
                  Дополнительное голосование доступно на странице истории
                </p>
              )}

              {!user && isVoteActive && (
                <p className="text-center text-xs text-[#3d6b7a] mt-4">
                  <Link href="/auth" className="text-[#00D4FF] font-bold underline">Войдите</Link>, чтобы голосовать
                </p>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div className="fixed bottom-4 left-0 right-0 z-20 px-4">
          <div className="glass-card rounded-2xl p-3 flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentIndex > 0 ? 'bg-[#00D4FF]/30 text-[#1a3a4a]' : 'bg-white/10 text-[#3d6b7a]/40 cursor-not-allowed'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <span className="text-lg font-bold text-[#1a3a4a]">{currentIndex + 1}/{chapters.length}</span>

            <button
              onClick={goToNext}
              disabled={currentIndex === chapters.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentIndex < chapters.length - 1 ? 'bg-[#00D4FF]/30 text-[#1a3a4a]' : 'bg-white/10 text-[#3d6b7a]/40 cursor-not-allowed'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="h-1 bg-white/10">
          <div className="h-full bg-[#00D4FF] transition-all duration-300" style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }} />
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}
