'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WritePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [hasAcceptedAlready, setHasAcceptedAlready] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageRating, setAgeRating] = useState('16+');

  const [chapterTitle, setChapterTitle] = useState('Глава 1');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [timerHours, setTimerHours] = useState(24);
  const [options, setOptions] = useState(['', '', '']);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Только зарегистрированные авторы могут писать истории");
        return router.push('/auth');
      }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('accepted_terms').eq('id', user.id).single();
      if (profile?.accepted_terms) setHasAcceptedAlready(true);
    }
    checkUser();
  }, [router]);

  const handlePublish = async () => {
    if (!title || !content || !question || options.some(o => !o)) {
      return alert("Заполните все поля и все 3 варианта ответа!");
    }

    if (!hasAcceptedAlready && !checkboxChecked) {
      return alert("Пожалуйста, примите условия размещения контента.");
    }

    setLoading(true);

    try {
      if (!hasAcceptedAlready) {
        await supabase.from('profiles').update({ accepted_terms: true }).eq('id', user.id);
      }

      const { data: story, error: sErr } = await supabase
        .from('stories')
        .insert({ title, description, age_rating: ageRating, author_id: user.id })
        .select().single();

      if (sErr) throw sErr;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + Number(timerHours));

      const { data: chapter, error: cErr } = await supabase
        .from('chapters')
        .insert({
          story_id: story.id,
          chapter_number: 1,
          title: chapterTitle,
          content,
          question_text: question,
          expires_at: expiresAt.toISOString()
        })
        .select().single();

      if (cErr) throw cErr;

      const optionsData = options.map(text => ({ chapter_id: chapter.id, text, votes: 0 }));
      const { error: oErr } = await supabase.from('options').insert(optionsData);
      if (oErr) throw oErr;

      alert("Книга опубликована!");
      router.push('/');
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* HEADER */}
      <header className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#00D4FF] hover:text-[#4FC3F7] transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Назад в кабинет</span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Новая история
        </h1>
      </header>

      {/* STORY INFO */}
      <section className="space-y-5 mb-10">
        <input
          type="text"
          placeholder="Название книги"
          className="glass-input w-full text-2xl md:text-3xl font-bold p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Краткое описание (аннотация)..."
          className="glass-input w-full p-4 h-32 text-[#1a3a4a] placeholder-[#3d6b7a]/40 resize-none"
          onChange={e => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-[#3d6b7a]/60 uppercase">Рейтинг:</span>
          <select
            className="glass-input p-3 font-bold text-[#1a3a4a]"
            value={ageRating}
            onChange={e => setAgeRating(e.target.value)}
          >
            <option value="6+">6+</option>
            <option value="12+">12+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
          </select>
        </div>
      </section>

      {/* CHAPTER SECTION */}
      <section className="space-y-5 mb-8 glass-card p-6 md:p-8">
        <input
          type="text"
          value={chapterTitle}
          className="glass-input w-full p-3 font-bold text-[#1a3a4a] placeholder-[#3d6b7a]/40"
          onChange={e => setChapterTitle(e.target.value)}
        />
        <textarea
          placeholder="Текст вашей главы..."
          className="glass-input w-full p-4 h-64 text-[#1a3a4a] placeholder-[#3d6b7a]/40 resize-none"
          onChange={e => setContent(e.target.value)}
        />

        {/* QUESTION BLOCK */}
        <div className="glass-card p-6">
          <label className="block text-xs uppercase font-bold text-[#00D4FF] mb-2">Вопрос читателям</label>
          <input
            type="text"
            placeholder="Например: Как поступит герой?"
            className="glass-input w-full p-3 mb-6 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
            onChange={e => setQuestion(e.target.value)}
          />

          <label className="block text-xs uppercase font-bold text-[#00D4FF] mb-2">Варианты ответов</label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Вариант ${i+1}`}
                className="glass-input w-full p-3 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
                value={opt}
                onChange={e => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
              />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <label className="block text-xs uppercase font-bold text-[#00D4FF] mb-2 text-center md:text-left">Длительность голосования (часы)</label>
            <input
              type="number"
              value={timerHours}
              className="glass-input p-3 w-full md:w-24 text-center font-bold text-[#1a3a4a]"
              onChange={e => setTimerHours(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* TERMS CHECKBOX */}
      {!hasAcceptedAlready && (
        <div className="mb-8 glass-card p-6">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-6 h-6 rounded border-white/30 text-[#00D4FF] focus:ring-[#00D4FF] bg-white/10"
              checked={checkboxChecked}
              onChange={e => setCheckboxChecked(e.target.checked)}
            />
            <span className="text-sm leading-relaxed text-[#3d6b7a]">
              Я принимаю <Link href="/author-terms" className="text-[#00D4FF] font-bold underline">Условия размещения контента</Link>
            </span>
          </label>
        </div>
      )}

      {/* PUBLISH BUTTON */}
      <button
        onClick={handlePublish}
        disabled={loading}
        className="w-full glass-button py-5 font-black text-xl text-[#1a3a4a] hover:text-[#00D4FF] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ПУБЛИКАЦИЯ...' : 'ОПУБЛИКОВАТЬ КНИГУ'}
      </button>
    </div>
  );
}
