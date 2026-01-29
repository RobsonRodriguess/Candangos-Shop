import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!accessToken) throw new Error("Token MP não configurado.")
    if (!supabaseUrl || !supabaseServiceRole) throw new Error("Supabase Keys não configuradas.")

    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    const url = new URL(req.url)
    const action = url.searchParams.get('action') 

    if (action === 'check_status') {
      const { payment_id } = await req.json()
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await resp.json()
      return new Response(JSON.stringify({ status: data.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const bodyText = await req.text()
    if (!bodyText) throw new Error("Corpo da requisição vazio")
    const { items, buyer_email, buyer_name, payment_method, coupon_code } = JSON.parse(bodyText)

    if (!items || items.length === 0) throw new Error("Carrinho vazio no Backend")
    if (!buyer_email || !buyer_email.includes('@')) throw new Error("Email inválido no Backend")

    let subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0)
    let totalAmount = subtotal

    // --- LÓGICA DE CUPOM COM TRAVA DE USO ÚNICO ---
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('discount_percent, active, usage_limit, times_used')
        .eq('code', coupon_code.toUpperCase())
        .single()

      if (coupon && coupon.active) {
        // 1. Verificar se este e-mail já usou este cupom em um pedido aprovado
        const { data: alreadyUsed } = await supabase
          .from('orders')
          .select('id')
          .eq('buyer_email', buyer_email)
          .eq('coupon_used', coupon_code.toUpperCase())
          .eq('status', 'approved')
          .maybeSingle()

        if (alreadyUsed) {
          throw new Error("Você já utilizou o poder deste pergaminho em outra jornada!")
        }

        // 2. Verificar limite global de usos
        const limitReached = coupon.usage_limit && coupon.times_used >= coupon.usage_limit
        if (!limitReached) {
          const discount = subtotal * (coupon.discount_percent / 100)
          totalAmount = subtotal - discount
        }
      }
    }
    
    const nameParts = (buyer_name || 'Cliente').trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Gamer'

    if (payment_method === 'pix') {
      const paymentData = {
        transaction_amount: Number(totalAmount.toFixed(2)),
        description: `Hywer Store - ${buyer_email}${coupon_code ? ` (Cupom: ${coupon_code})` : ''}`,
        payment_method_id: 'pix',
        payer: { email: buyer_email, first_name: firstName, last_name: lastName }
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
      if (mpResult.error || !mpResult.id) throw new Error(`MP Recusou: ${mpResult.message}`)

      const qrData = mpResult.point_of_interaction.transaction_data
      return new Response(
        JSON.stringify({ 
          type: 'pix_generated',
          payment_id: mpResult.id,
          qr_code: qrData.qr_code, 
          qr_code_base64: qrData.qr_code_base64 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const preferenceData = {
        items: items.map((item: any) => ({
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL',
        })),
        ...(totalAmount < subtotal && {
          items: [
            ...items.map((item: any) => ({
              title: item.title,
              quantity: Number(item.quantity),
              unit_price: Number(item.price),
              currency_id: 'BRL',
            })),
            {
              title: `Desconto Cupom: ${coupon_code}`,
              quantity: 1,
              unit_price: -(subtotal - totalAmount),
              currency_id: 'BRL',
            }
          ]
        }),
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
      
      return new Response(
        JSON.stringify({ type: 'redirect', url: mpResult.init_point }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})