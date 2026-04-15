'use client';
import Link from 'next/link';

export default function PurchaseTerms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7EC8E3] to-[#4A90A4]">
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-12">
        {/* HEADER */}
        <header className="glass-card px-6 py-4 mb-8">
          <Link href="/buy" className="text-sm font-bold text-[#1a3a4a] hover:text-[#00D4FF] transition flex items-center gap-2">
            <span>←</span> Назад к оплате
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-4 uppercase text-[#1a3a4a]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Соглашение о платных услугах
          </h1>
          <div className="flex flex-col md:flex-row md:justify-between mt-2 text-[#3d6b7a] text-xs font-medium gap-2">
            <span>Платформа VILKA</span>
            <span>Редакция от 01 февраля 2026 г.</span>
          </div>
        </header>

        <article className="space-y-6">
          {/* Реквизиты */}
          <section className="glass-card p-6">
            <p className="text-sm font-bold mb-1 text-[#1a3a4a]">Исполнитель:</p>
            <p className="text-sm text-[#3d6b7a]">
              [Новикова Наталья Сергеевна] <br />
              ИНН: [550516382260] <br />
              Статус: Плательщик налога на профессиональный доход (самозанятый)
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[#1a3a4a]">1. Общие положения и предмет договора</h2>
            <div className="text-[#3d6b7a] text-sm space-y-3">
              <p>1.1. Данный документ является публичной офертой и содержит все существенные условия по оказанию Исполнителем платных услуг.</p>
              <p>1.2. <strong className="text-[#1a3a4a]">Предмет договора:</strong> Исполнитель оказывает услуги по предоставлению доступа к дополнительному техническому функционалу и приобретению внутренних игровых единиц («Баллов»).</p>
              <p>1.3. <strong className="text-[#1a3a4a]">Акцепт:</strong> Полным и безоговорочным принятием условий Оферты считается факт оплаты через платежную форму на Сайте.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[#1a3a4a]">2. Права и обязанности сторон</h2>
            <div className="text-[#3d6b7a] text-sm space-y-3">
              <p><strong className="text-[#1a3a4a]">2.1. Обязанности Исполнителя:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Предоставить доступ к оплаченному функционалу или начислить Баллы.</li>
                <li>Обеспечить техническую поддержку в рамках Платформы.</li>
                <li>Сформировать и направить электронный чек в соответствии с ФЗ №422.</li>
              </ul>
              <p><strong className="text-[#1a3a4a]">2.2. Обязанности Пользователя:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Оплатить услуги по указанному тарифу.</li>
                <li>Соблюдать правила Платформы.</li>
              </ul>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[#1a3a4a]">3. Финансовые условия и внутренние единицы</h2>
            <div className="text-[#3d6b7a] text-sm space-y-3">
              <p>3.1. Стоимость услуг и количество Баллов указаны на странице оплаты.</p>
              <p>3.2. Баллы являются внутренними техническими единицами и не являются электронной валютой.</p>
              <p>3.3. Баллы не подлежат обмену на реальные денежные средства.</p>
              <p>3.4. Исполнитель вправе изменять стоимость услуг и правила использования Баллов.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[#1a3a4a]">4. Порядок оказания услуг и возвраты</h2>
            <div className="text-[#3d6b7a] text-sm space-y-3">
              <p>4.1. Услуга считается оказанной в момент начисления Баллов на аккаунт.</p>
              <p>4.2. <strong className="text-[#1a3a4a]">Возврат средств:</strong> Возврат денежных средств после начисления Баллов не производится.</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[#1a3a4a]">5. Ограничение ответственности</h2>
            <p className="text-[#3d6b7a] text-sm">5.1. Исполнитель не несет ответственности за перебои в работе Платформы, вызванные техническими сбоями или форс-мажором.</p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a3a4a]">6. Разрешение споров и реквизиты</h2>
            <p className="text-[#3d6b7a] text-sm mb-6">6.1. Все споры решаются путем переговоров. При недостижении согласия — в суд по месту регистрации Исполнителя.</p>

            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#3d6b7a]/60 uppercase text-[10px] font-bold tracking-widest mb-2">Исполнитель</p>
                  <p className="font-bold text-[#1a3a4a]">[Новикова Наталья Сергеевна]</p>
                  <p className="text-[#3d6b7a]">ИНН: [550516382260]</p>
                </div>
                <div>
                  <p className="text-[#3d6b7a]/60 uppercase text-[10px] font-bold tracking-widest mb-2">Контакты</p>
                  <p className="font-bold text-[#1a3a4a]">[nataly.tyler@gmail.com]</p>
                  <p className="text-[#3d6b7a] mt-1 italic">Для претензий и вопросов по оплате</p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
