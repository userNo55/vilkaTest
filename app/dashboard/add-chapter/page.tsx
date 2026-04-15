'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import Link from 'next/link';

function AddChapterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get('storyId');
  const nextNum = searchParams.get('next');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !content || !question || options.some(o => !o)) return alert("Заполните всё!");
    setLoading(true);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + Number(hours));

    const { data: chap, error: cErr } = await supabase.from('chapters').insert({
      story_id: storyId,
      chapter_number: Number(nextNum),
      title,
      content,
      question_text: question,
      expires_at: expiresAt.toISOString()
    }).select().single();

    if (cErr) {
      alert("Ошибка: " + cErr.message);
      setLoading(false);
      return;
    }

    const opts = options.map(o => ({ chapter_id: chap.id, text: o, votes: 0 }));
    await supabase.from('options').insert(opts);

    alert("Глава опубликована!");
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* HEADER */}
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Назад в кабинет</span>
        </Link>

        <h1 className="text-2xl font-black text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Добавить главу {nextNum}
        </h1>
      </header>

      {/* CHAPTER FIELDS */}
      <div className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Название главы"
          className="glass-input w-full p-4 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Текст истории..."
          className="glass-input w-full p-4 h-64 text-[#1a3a4a] placeholder-[#3d6b7a]/40 resize-none"
          onChange={e => setContent(e.target.value)}
        />
      </div>

      {/* QUESTION BLOCK */}
      <div className="glass-card p-6 space-y-4 mb-8">
        <input
          type="text"
          placeholder="Вопрос читателям"
          className="glass-input w-full p-3 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
          onChange={e => setQuestion(e.target.value)}
        />

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Вариант ${i+1}`}
            className="glass-input w-full p-3 text-[#1a3a4a] placeholder-[#3d6b7a]/40"
            value={opt}
            onChange={e => {
              const n = [...options];
              n[i] = e.target.value;
              setOptions(n);
            }}
          />
        ))}

        <div>
          <label className="text-xs text-[#3d6b7a] block mb-1 font-bold uppercase">
            Голосование в часах:
          </label>
          <input
            type="number"
            value={hours}
            className="glass-input p-3 w-24 text-center font-bold text-[#1a3a4a]"
            onChange={e => setHours(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full glass-button py-5 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Публикация...' : 'Опубликовать продолжение'}
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#3d6b7a] font-semibold animate-pulse">Загрузка...</div>}>
      <AddChapterForm />
    </Suspense>
  );
}
