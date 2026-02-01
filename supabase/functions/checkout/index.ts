import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

serve(async (req) => {
  // Tratamento de CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Removemos o prefixo "SUPABASE_" aqui também:
    const supabaseServiceRole = Deno.env.get('SERVICE_ROLE_KEY')

    if (!accessToken) throw new Error("Token MP não configurado.")
    if (!supabaseUrl || !supabaseServiceRole) throw new Error("Supabase Keys não configuradas.")

    // Cliente Supabase com Service Role (Admin) para ler todas as tabelas
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    const url = new URL(req.url)
    const action = url.searchParams.get('action') 

    // --- AÇÃO 1: CHECAR STATUS DO PIX ---
    if (action === 'check_status') {
      const { payment_id } = await req.json()
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await resp.json()
      return new Response(
        JSON.stringify({ status: data.status }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- AÇÃO 2: CRIAR PAGAMENTO (CHECKOUT) ---
    const bodyText = await req.text()
    if (!bodyText) throw new Error("Corpo da requisição vazio")
    
    const { items, buyer_email, buyer_name, payment_method, coupon_code } = JSON.parse(bodyText)

    if (!items || items.length === 0) throw new Error("Carrinho vazio no Backend")
    if (!buyer_email || !buyer_email.includes('@')) throw new Error("Email inválido")

    // 1. Calcula Subtotal Original
    let subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0)
    let totalAmount = subtotal
    let discountAmount = 0

    // 2. LÓGICA DE CUPONS (A CORREÇÃO PRINCIPAL)
    if (coupon_code) {
        const cleanCode = coupon_code.trim().toUpperCase()
        let activeCoupon = null

        // A) Tenta achar na tabela de ROLETA (user_coupons)
        // Nota: user_coupons podem ter case sensitive dependendo de como salvou, 
        // mas vamos tentar buscar exato ou upper.
        const { data: userCoupon } = await supabase
            .from('user_coupons')
            .select('*')
            .eq('code', coupon_code.trim()) // Busca exata do código gerado
            .eq('is_used', false)
            .maybeSingle()

        if (userCoupon) {
            activeCoupon = userCoupon
        } else {
            // B) Se não achou, tenta na tabela GLOBAL (coupons)
            const { data: globalCoupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', cleanCode)
                .eq('active', true)
                .maybeSingle()
            
            // Valida limite de uso do global
            if (globalCoupon) {
                if (globalCoupon.usage_limit && globalCoupon.times_used >= globalCoupon.usage_limit) {
                    throw new Error("Este cupom esgotou!")
                }
                activeCoupon = globalCoupon
            }
        }

        // C) Se achou algum cupom válido, aplica o desconto
        if (activeCoupon) {
            const percent = activeCoupon.discount_percent
            discountAmount = subtotal * (percent / 100)
            totalAmount = subtotal - discountAmount
        }
    }

    // Garante formato decimal correto (2 casas)
    totalAmount = Number(totalAmount.toFixed(2))
    discountAmount = Number(discountAmount.toFixed(2))
    
    // Tratamento do nome para o Mercado Pago
    const nameParts = (buyer_name || 'Cliente').trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Gamer'

    // --- FLUXO PIX ---
    if (payment_method === 'pix') {
      const paymentData = {
        transaction_amount: totalAmount, // <--- AQUI VAI O PREÇO COM DESCONTO
        description: `Hywer Store - ${buyer_email}${coupon_code ? ` (Cupom: ${coupon_code})` : ''}`,
        payment_method_id: 'pix',
        payer: { 
            email: buyer_email, 
            first_name: firstName, 
            last_name: lastName 
        }
      }

      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify(paymentData)
      })

      const mpResult = await mpResponse.json()
      
      // Se o MP recusar, retornamos erro legível
      if (mpResult.error || !mpResult.id) {
          console.error("Erro MP Pix:", mpResult)
          throw new Error(mpResult.message || "Erro ao gerar PIX no Mercado Pago")
      }

      const qrData = mpResult.point_of_interaction.transaction_data
      
      return new Response(
        JSON.stringify({ 
          type: 'pix_generated',
          payment_id: mpResult.id,
          qr_code: qrData.qr_code, 
          qr_code_base64: qrData.qr_code_base64,
          final_value: totalAmount // Retorna o valor final para debug se precisar
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    // --- FLUXO CARTÃO (PREFERENCE) ---
    } else {
      
      // Prepara os itens. Se tiver desconto, adiciona um item negativo
      // O MP exige que a soma dos itens bata com o total.
      const preferenceItems = items.map((item: any) => ({
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL',
      }))

      if (discountAmount > 0) {
          preferenceItems.push({
              title: `Desconto Cupom: ${coupon_code}`,
              quantity: 1,
              unit_price: -discountAmount, // Valor negativo para abater
              currency_id: 'BRL'
          })
      }

      const preferenceData = {
        items: preferenceItems,
        payer: { email: buyer_email },
        back_urls: {
            success: "https://hywer-shop.vercel.app",
            failure: "https://hywer-shop.vercel.app",
            pending: "https://hywer-shop.vercel.app"
        },
        auto_return: "approved",
      }

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(preferenceData)
      })
      
      const mpResult = await mpResponse.json()
      
      if (!mpResult.init_point) {
          console.error("Erro MP Preference:", mpResult)
          throw new Error("Erro ao criar preferência de pagamento")
      }
      
      return new Response(
        JSON.stringify({ type: 'redirect', url: mpResult.init_point }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    // Retorna erro 400 para o frontend não travar com "null" e mostrar o alerta
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})