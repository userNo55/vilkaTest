'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaShare, FaTelegramPlane, FaVk, FaCopy, FaCheck } from 'react-icons/fa';

const AUTHOR_ID = '01db5da0-7374-40ac-b6a5-63be48bc7410';

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expireTime = new Date(expiresAt).getTime();
      const distance = expireTime - now;

      if (isNaN(distance) || distance < 0) {
        setTimeLeft("Голосование завершено");
      } else {
        const h = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}ч ${m}м ${s}с`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="glass-card px-6 py-4 mb-4 flex items-center justify-center gap-3">
      <span className="font-semibold text-sm text-[#3d6b7a]">до конца голосования:</span>
      <span className="font-mono font-black text-2xl tabular-nums text-[#FFB74D]">{timeLeft}</span>
    </div>
  );
}

function ShareButton({
  storyTitle,
  chapterNumber,
  chapterId
}: {
  storyTitle: string,
  chapterNumber: number,
  chapterId: string
}) {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMessages = [
    `Тут в истории «${storyTitle}» идёт спорный выбор в главе ${chapterNumber}. Идём ломать сюжет в нужную сторону. Голосуй тут: ${window.location.origin}/story/${chapterId}`,
    `В главе ${chapterNumber} «${storyTitle}» дилемма. Нужен твой голос. Жми: ${window.location.origin}/story/${chapterId}`,
    `Народ, срочно! В «${storyTitle}» идёт битва за развитие сюжета. Наша версия проигрывает. Лети голосовать: ${window.location.origin}/story/${chapterId}`,
    `Отдал свой голос в истории «${storyTitle}». Теперь жду новую главу как соучастник. Интересно, к чему это приведёт? ${window.location.origin}/story/${chapterId}`
  ];

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * shareMessages.length);
    return shareMessages[randomIndex];
  };

  const copyToClipboard = async () => {
    const message = getRandomMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const shareToTelegram = () => {
    const message = encodeURIComponent(getRandomMessage());
    window.open(`https://t.me/share/url?url=${window.location.origin}/story/${chapterId}&text=${message}`, '_blank');
  };

  const shareToVK = () => {
    const message = encodeURIComponent(getRandomMessage());
    window.open(`https://vk.com/share.php?url=${window.location.origin}/story/${chapterId}&title=${encodeURIComponent(storyTitle)}&comment=${message}`, '_blank');
  };

  const shareViaNative = async () => {
    const message = getRandomMessage();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Глава ${chapterNumber}: ${storyTitle}`,
          text: message,
          url: `${window.location.origin}/story/${chapterId}`,
        });
      } catch (err) {
        console.error('Ошибка нативного шеринга:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="relative mt-4">
      <button
        onClick={() => setShowSharePanel(!showSharePanel)}
        className="w-full py-3 text-sm font-bold text-[#4AE8A5] glass-button hover:text-[#4AE8A5] flex items-center justify-center gap-2"
      >
        <FaShare className="w-4 h-4" />
        Поделиться
      </button>

      {showSharePanel && (
        <div className="mt-3 glass-card p-4">
          <p className="text-xs text-[#3d6b7a] mb-3 text-center">
            Текст поста:
          </p>
          <div className="text-sm text-[#1a3a4a] mb-4 p-3 bg-white/20 rounded-xl">
            {getRandomMessage()}
          </div>

          <div className="flex justify-center gap-2">
            <button onClick={shareToTelegram} className="p-3 bg-[#0088cc]/30 text-white rounded-xl hover:bg-[#0088cc]/50 transition" title="Telegram">
              <FaTelegramPlane className="w-5 h-5" />
            </button>
            <button onClick={shareToVK} className="p-3 bg-[#4C75A3]/30 text-white rounded-xl hover:bg-[#4C75A3]/50 transition" title="VK">
              <FaVk className="w-5 h-5" />
            </button>
            <button onClick={copyToClipboard} className="p-3 bg-white/20 text-[#1a3a4a] rounded-xl hover:bg-white/30 transition flex items-center gap-2" title="Скопировать">
              {copied ? <FaCheck className="w-5 h-5 text-[#4AE8A5]" /> : <FaCopy className="w-5 h-5" />}
            </button>
            <button onClick={shareViaNative} className="p-3 bg-[#B388FF]/30 text-white rounded-xl hover:bg-[#B388FF]/50 transition" title="Поделиться">
              <FaShare className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="h-6 w-1/2 bg-white/20 rounded mb-2"></div>
          <div className="h-4 w-1/4 bg-white/20 rounded"></div>
        </div>
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [story, setStory] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [votedChapters, setVotedChapters] = useState<string[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [isAuthorIdMatch, setIsAuthorIdMatch] = useState(false);

  const findLatestChapterId = (chapters: any[]) => {
    if (chapters.length === 0) return null;
    const sortedChapters = [...chapters].sort((a, b) => b.chapter_number - a.chapter_number);
    return sortedChapters[0].id;
  };

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const [
          profilePromise,
          votesPromise,
          storyPromise,
          chaptersPromise
        ] = await Promise.all([
          user ? supabase.from('profiles').select('coins').eq('id', user.id).single() : Promise.resolve({ data: null }),
          user ? supabase.from('votes').select('chapter_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
          supabase.from('stories').select(`*, profiles(*)`).eq('id', id).single(),
          supabase.from('chapters').select('*, options(*)').eq('story_id', id).order('chapter_number', { ascending: true })
        ]);

        const profileData = profilePromise.data;
        const votesData = votesPromise.data;
        const storyData = storyPromise.data;
        const chaptersData = chaptersPromise.data;

        setUserCoins(profileData?.coins || 0);
        setVotedChapters(votesData?.map((item: any) => item.chapter_id) || []);
        setStory(storyData);
        setChapters(chaptersData || []);

        if (storyData?.author_id === AUTHOR_ID) {
          setIsAuthorIdMatch(true);
        }

        const latestChapterId = findLatestChapterId(chaptersData || []);
        if (latestChapterId) {
          setOpenChapter(latestChapterId);
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const isAuthor = user && story && story.author_id === user.id;

  const handleChapterClick = (chapterId: string) => {
    setOpenChapter(openChapter === chapterId ? null : chapterId);
  };

  const handleVote = async (chapterId: string, optionId: string, currentVotes: number) => {
    if (!user) return router.push('/auth');
    const { error } = await supabase.from('votes').insert({ user_id: user.id, chapter_id: chapterId });
    if (error) return alert("Вы уже голосовали!");

    await supabase.from('options').update({ votes: currentVotes + 1 }).eq('id', optionId);
    window.location.reload();
  };

  const handlePaidVote = async (chapterId: string, optionId: string) => {
    if (!user) return router.push('/auth');
    if (userCoins < 1) return router.push('/buy');

    const { error } = await supabase.rpc('vote_with_coin', {
      user_id_param: user.id,
      option_id_param: optionId,
      chapter_id_param: chapterId
    });

    if (error) alert(error.message);
    else window.location.reload();
  };

  const handleDeleteChapter = async (chapterId: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt).getTime() < new Date().getTime();
    if (isExpired) return alert("Нельзя удалить главу после окончания голосования");
    if (!confirm("Вы уверены, что хотите удалить эту главу?")) return;

    setDeleting(chapterId);
    try {
      const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
      if (error) throw error;
      setChapters(prevChapters => prevChapters.filter(c => c.id !== chapterId));
      const updatedLatestChapterId = findLatestChapterId(chapters.filter(c => c.id !== chapterId));
      setOpenChapter(updatedLatestChapterId);
      alert("Глава успешно удалена");
    } catch (error) {
      alert("Произошла ошибка при удалении главы");
    } finally {
      setDeleting(null);
    }
  };

  const handleCompleteStory = async () => {
    if (!isAuthor || !story) return;
    if (!confirm("Завершить историю? После этого нельзя будет добавлять новые главы.")) return;

    setCompleting(true);
    try {
      const { error } = await supabase.from('stories').update({ is_completed: true }).eq('id', story.id);
      if (error) throw error;
      setStory({ ...story, is_completed: true });
      alert("История завершена!");
    } catch (error) {
      alert("Произошла ошибка");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
        <div className="glass-card px-6 py-4 mb-8 flex justify-between items-center">
          <div className="h-6 w-32 bg-white/20 rounded"></div>
          <div className="h-8 w-40 bg-white/20 rounded-full"></div>
        </div>
        <div className="h-12 bg-white/20 rounded mb-10 w-3/4"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <ChapterSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const latestChapterNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      {/* HEADER */}
      <header className="glass-card px-6 py-4 mb-6 flex justify-between items-center">
        <Link href="/" className="text-[#1a3a4a] font-bold hover:text-[#00D4FF] transition-colors">← К списку</Link>
        {user && (
          <Link href="/buy" className="glass-button px-4 py-2 text-sm font-bold text-[#1a3a4a]">
            Баланс: {userCoins} ⚡
          </Link>
        )}
      </header>

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-black mb-8 text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>{story.title}</h1>

      {/* AUTHOR INFO */}
      {story.profiles && (
        <div className="glass-card p-4 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
            {story.profiles.avatar_url ? (
              <img src={story.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#3d6b7a] font-bold">?</div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#3d6b7a]/60 mb-0.5">Автор истории</div>
            <div className="font-bold text-[#1a3a4a]">{story.profiles.pseudonym || 'Анонимный автор'}</div>
            {story.profiles.bio && <div className="text-sm text-[#3d6b7a] leading-tight mt-1">{story.profiles.bio}</div>}
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      <p className="text-[#3d6b7a] text-lg mb-8 italic">{story.description}</p>

      {/* COMPLETE BUTTON */}
      {isAuthor && !story.is_completed && (
        <div className="mb-8 flex justify-center">
          <button
            onClick={handleCompleteStory}
            disabled={completing}
            className="glass-button px-6 py-3 font-bold text-[#1a3a4a] hover:text-[#00D4FF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? 'Завершение...' : '✅ Завершить историю'}
          </button>
        </div>
      )}

      {/* CHAPTERS */}
      <div className="space-y-4">
        {chapters.map((chapter) => {
          const isExpired = new Date(chapter.expires_at).getTime() < new Date().getTime();
          const hasVoted = votedChapters.includes(chapter.id);
          const isLatest = chapter.chapter_number === latestChapterNumber;
          const isLatestVotable = isLatest && !isExpired && !story.is_completed;
          const totalVotes = chapter.options?.reduce((sum: number, o: any) => sum + o.votes, 0) || 0;
          const canDelete = isAuthor && isLatest && !isExpired && !story.is_completed;

          return (
            <div key={chapter.id} className={`glass-card overflow-hidden ${isLatestVotable ? 'border-[#00D4FF]/50' : 'opacity-80'}`}>
              <div className="flex justify-between items-center hover:bg-white/10 transition-colors">
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  className="flex-1 text-left p-6 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-[#1a3a4a]">Глава {chapter.chapter_number}: {chapter.title}</span>
                    {isLatestVotable && !hasVoted && (
                      <span className="text-xs px-2 py-1 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full font-bold">
                        ГОЛОСОВАТЬ!
                      </span>
                    )}
                  </div>
                  <span className="text-[#3d6b7a]/40 text-lg">{openChapter === chapter.id ? '−' : '+'}</span>
                </button>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteChapter(chapter.id, chapter.expires_at)}
                    disabled={deleting === chapter.id}
                    className="mr-4 p-2 text-[#FF6B9D] hover:text-[#FF6B9D] transition-colors disabled:opacity-50"
                    title="Удалить главу"
                  >
                    {deleting === chapter.id ? (
                      <div className="w-4 h-4 border-2 border-[#FF6B9D] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {openChapter === chapter.id && (
                <div className="p-6 border-t border-white/20">
                  <div className="text-lg leading-relaxed mb-8 text-[#3d6b7a] whitespace-pre-wrap">{chapter.content}</div>

                  {!story.is_completed && (
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4 text-center text-[#1a3a4a]">{chapter.question_text}</h3>

                      {isLatestVotable && <Countdown expiresAt={chapter.expires_at} />}

                      <div className="space-y-3">
                        {chapter.options?.map((opt: any, index: number) => {
                          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                          const canVote = isLatestVotable && !hasVoted && user;

                          return (
                            <div key={opt.id} className="space-y-2">
                              <div className={`rounded-xl border transition-all ${
                                canVote
                                  ? 'border-[#00D4FF]/50 bg-white/10 cursor-pointer hover:bg-white/20'
                                  : 'border-white/20 bg-white/5'
                              } ${!canVote ? 'opacity-80' : ''}`}>
                                <div className="p-4">
                                  <div className="flex justify-between items-center gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                                          index === 0 ? 'bg-[#4AE8A5]' :
                                          index === 1 ? 'bg-[#FF6B9D]' :
                                          index === 2 ? 'bg-[#B388FF]' :
                                          'bg-[#FFB74D]'
                                        }`}>
                                          Вариант {index + 1}
                                        </span>
                                      </div>
                                      <p className="text-[#1a3a4a] font-semibold text-base">{opt.text}</p>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-3">
                                      {(hasVoted || isExpired) && totalVotes > 0 && (
                                        <div className="text-right min-w-[70px]">
                                          <div className="text-2xl font-black text-[#1a3a4a]">{percentage}%</div>
                                        </div>
                                      )}

                                      {hasVoted && isLatestVotable && isAuthorIdMatch && (
                                        <button
                                          onClick={() => handlePaidVote(chapter.id, opt.id)}
                                          className="px-4 py-2 bg-[#00D4FF]/30 hover:bg-[#00D4FF]/50 text-[#1a3a4a] text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
                                        >
                                          <span>⚡</span> Поддержать (1⚡)
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {(hasVoted || isExpired) && totalVotes > 0 && (
                                  <div className="h-1.5 bg-white/10 rounded-b-xl overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        index === 0 ? 'bg-[#4AE8A5]' :
                                        index === 1 ? 'bg-[#FF6B9D]' :
                                        index === 2 ? 'bg-[#B388FF]' :
                                        'bg-[#FFB74D]'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleVote(chapter.id, opt.id, opt.votes)}
                                disabled={!canVote}
                                className="w-full text-left p-3 text-sm font-bold text-[#3d6b7a] hover:text-[#00D4FF] disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                Голосовать
                              </button>

                              {/* MOBILE PAID VOTE */}
                              <div className="sm:hidden">
                                {hasVoted && isLatestVotable && isAuthorIdMatch && (
                                  <button
                                    onClick={() => handlePaidVote(chapter.id, opt.id)}
                                    className="w-full px-4 py-2 bg-[#00D4FF]/30 hover:bg-[#00D4FF]/50 text-[#1a3a4a] text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                  >
                                    <span>⚡</span> Поддержать за 1 монету
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {totalVotes === 0 && (
                        <p className="text-center text-sm text-[#3d6b7a] mt-4">Пока нет голосов. Будьте первым!</p>
                      )}

                      <ShareButton
                        storyTitle={story.title}
                        chapterNumber={chapter.chapter_number}
                        chapterId={chapter.id}
                      />
                    </div>
                  )}

                  {story.is_completed && (
                    <div className="glass-card p-6 text-center">
                      <p className="text-[#3d6b7a] font-medium">🏁 История завершена. Голосование закрыто.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
