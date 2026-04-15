'use client';
import Link from 'next/link';

export default function AuthorTerms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4]">
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-12">
        <header className="glass-card px-6 py-4 mb-8">
          <Link href="/" className="text-sm font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition">
            ← Вернуться на главную
          </Link>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mt-4 uppercase text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Пользовательское соглашение (оферта) платформы VILKA
          </h1>
          <p className="text-[#3d6b7a] text-sm mt-2 font-medium">Редакция от 21 января 2026 года</p>
        </header>

        <article className="space-y-6">
          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">1. Общие положения</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>1.1. Настоящий документ является публичной офертой в соответствии со ст. 437 Гражданского кодекса РФ.</p>
              <p>1.2. Платформа VILKA (далее — «Платформа») предоставляет техническую возможность размещения литературных произведений, а лицо, осуществившее регистрацию и публикацию контента (далее — «Автор»), принимает условия настоящего Соглашения в полном объеме.</p>
              <p>1.3. Акцептом оферты является завершение регистрации Автора или нажатие кнопки «Опубликовать».</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">2. Права на интеллектуальную собственность</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>2.1. <strong className="text-[#1a3a4a]">Сохранение прав:</strong> Все исключительные авторские права на размещаемые произведения (далее — «Контент») в полном объеме сохраняются за Автором.</p>
              <p>2.2. <strong className="text-[#1a3a4a]">Лицензия:</strong> Автор предоставляет Платформе право на использование Контента на условиях простой (неисключительной) безвозмездной лицензии на территории всего мира.</p>
              <p>2.3. Данная лицензия разрешает Платформе: Хранить, воспроизводить и доводить Контент до всеобщего сведения в цифровом виде; использовать фрагменты Контента для продвижения.</p>
              <p>2.4. Лицензия действует с момента публикации Контента и прекращается автоматически в момент удаления Контента Автором.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">3. Финансовые условия и система «Баллов»</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>3.1. Размещение Контента осуществляется на безвозмездной основе. Платформа не выплачивает роялти или денежные компенсации.</p>
              <p>3.2. На Платформе реализована система «Баллов поддержки». Денежные средства, вносимые Пользователями для приобретения Баллов, признаются добровольными пожертвованиями на техническую поддержку Платформы.</p>
              <p>3.3. Автор признает, что получение Платформой пожертвований от читателей не налагает обязательств по перечислению данных средств Автору.</p>
              <p>3.4. Автор подтверждает некоммерческий характер своей деятельности в рамках Платформы.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">4. Обязанности и гарантии Автора</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>4.1. Автор гарантирует, что он является законным правообладателем Контента.</p>
              <p>4.2. <strong className="text-[#1a3a4a]">Маркировка:</strong> Автор обязуется самостоятельно устанавливать возрастной ценз (0+, 6+, 12+, 16+, 18+).</p>
              <p>4.3. Автор обязуется не размещать Контент, содержащий призывы к насилию, экстремистские материалы, пропаганду наркотических средств.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">5. Ответственность сторон</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>5.1. Платформа не несет ответственности за содержание Контента, размещаемого Авторами.</p>
              <p>5.2. В случае претензий о нарушении авторских прав, Автор обязуется урегулировать их самостоятельно.</p>
              <p>5.3. Платформа имеет право удалить Контент или заблокировать аккаунт Автора в случае нарушения условий Соглашения.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">6. Изменение и прекращение Соглашения</h2>
            <div className="text-[#3d6b7a] leading-relaxed space-y-3 text-sm">
              <p>6.1. Платформа имеет право изменять условия Оферты в одностороннем порядке.</p>
              <p>6.2. К настоящему Соглашению применяется действующее законодательство РФ.</p>
            </div>
          </section>

          <div className="glass-card p-6 text-center">
            <p className="text-sm font-medium text-[#3d6b7a] italic">
              Нажимая «Опубликовать», вы принимаете данные условия.
            </p>
          </div>
        </article>

        <footer className="mt-8 text-center">
          <Link href="/write" className="glass-button px-8 py-3 font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition inline-block">
            Вернуться к написанию
          </Link>
        </footer>
      </main>
    </div>
  );
}
