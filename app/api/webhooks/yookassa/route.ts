// app/api/webhooks/yookassa/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  console.log('🔄 [Вебхук] Запрос получен');

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const rawBody = await request.text();
    console.log('📨 [Вебхук] Сырое тело (первые 500 символов):', rawBody.substring(0, 500));

    const event = JSON.parse(rawBody);
    console.log('📋 [Вебхук] Тип события:', event.event);

    if (event.event !== 'payment.succeeded') {
      console.log(`📭 [Вебхук] Событие "${event.event}" пропущено`);
      return NextResponse.json({ status: 'ignored' });
    }

    const payment = event.object;
    const userId = payment.metadata?.userId;
    const coinsToAdd = payment.metadata?.coins;

    console.log(`📊 [Вебхук] Извлеченные данные:`, { userId, coinsToAdd });

    if (!userId || !coinsToAdd) {
      console.error('❌ [Вебхук] Отсутствуют обязательные данные в metadata:', payment.metadata);
      return NextResponse.json({ error: 'Missing userId or coins in metadata' }, { status: 400 });
    }

    const coinsToAddNum = Number(coinsToAdd);
    if (isNaN(coinsToAddNum) || coinsToAddNum <= 0) {
      console.error('❌ [Вебхук] Некорректное количество coins:', coinsToAdd);
      return NextResponse.json({ error: 'Invalid coins value' }, { status: 400 });
    }

    console.log(`🔄 [Вебхук] Начинаю атомарное обновление для пользователя ${userId}, монет: ${coinsToAddNum}`);

    try {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_coins', {
        user_id_param: userId,
        amount_param: coinsToAddNum
      });

      if (rpcError) {
        console.log('⚠️ [Вебхук] RPC increment_coins не сработал, пробую прямой SQL:', rpcError.message);

        const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
          query: `
            WITH updated_profile AS (
              UPDATE profiles
              SET coins = coins + $1
              WHERE id = $2
              RETURNING id, coins
            )
            INSERT INTO transactions (user_id, amount)
            VALUES ($2, $1)
          `,
          params: [coinsToAddNum, userId]
        });

        if (sqlError) {
          console.error('❌ [Вебхук] Ошибка при прямом SQL обновлении:', sqlError);
          await fallbackUpdate(userId, coinsToAddNum);
        }
      }

      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          amount: coinsToAddNum,
          yookassa_payment_id: payment.id
        });

      if (txError) {
        console.error('⚠️ [Вебхук] Ошибка создания транзакции (не критично):', txError);
      }

      console.log(`✅ [Вебхук] Успех! Пользователю ${userId} добавлено ${coinsToAddNum} монет. Платеж: ${payment.id}`);

    } catch (dbError) {
      console.error('🔥 [Вебхук] Ошибка работы с БД:', dbError);
      throw dbError;
    }

    return NextResponse.json({
      status: 'success',
      message: `Added ${coinsToAddNum} coins to user ${userId}`
    });

  } catch (error) {
    console.error('🔥 [Вебхук] Критическая ошибка:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function fallbackUpdate(userId: string, coinsToAddNum: number) {
  console.log('🔄 [Вебхук] Использую резервный метод обновления');
  const supabaseAdmin = getSupabaseAdmin();

  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const currentCoins = Number(profile?.coins) || 0;
  const newCoins = currentCoins + coinsToAddNum;

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ coins: newCoins })
    .eq('id', userId);

  if (updateError) throw updateError;

  console.log(`📊 [Вебхук] Резервное обновление: ${currentCoins} → ${newCoins}`);
}
