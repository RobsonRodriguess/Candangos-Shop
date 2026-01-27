import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    if (!accessToken) throw new Error("Token MP não configurado (Secrets).")

    const url = new URL(req.url)
    const action = url.searchParams.get('action') 

    // --- STATUS CHECK ---
    if (action === 'check_status') {
      const { payment_id } = await req.json()
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await resp.json()
      return new Response(JSON.stringify({ status: data.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- CRIA PAGAMENTO ---
    const bodyText = await req.text()
    if (!bodyText) throw new Error("Corpo da requisição vazio")
    const { items, buyer_email, buyer_name, payment_method } = JSON.parse(bodyText)

    // Previne erros bobos
    if (!items || items.length === 0) throw new Error("Carrinho vazio no Backend")
    if (!buyer_email || !buyer_email.includes('@')) throw new Error("Email inválido no Backend")

    const totalAmount = items.reduce((acc: any, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0)
    
    // Tratamento de Nome
    const nameParts = (buyer_name || 'Cliente').trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Gamer'

    // PIX
    if (payment_method === 'pix') {
      const paymentData = {
        transaction_amount: Number(totalAmount.toFixed(2)),
        description: `Hywer Store - ${buyer_email}`,
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
      
      // Se der erro no MP, lançamos o erro com o detalhe
      if (mpResult.error || !mpResult.id) {
         const errorDetail = mpResult.message || JSON.stringify(mpResult.cause) || 'Erro desconhecido'
         throw new Error(`MP Recusou: ${errorDetail}`)
      }

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
    }
    // CARTÃO
    else {
      const preferenceData = {
        items: items.map((item: any) => ({
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL',
        })),
        payer: { email: buyer_email },
        back_urls: {
            success: "https://www.google.com", 
            failure: "https://www.google.com",
            pending: "https://www.google.com"
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
    // --- O PULO DO GATO ---
    // Retorna status 200 (OK) mesmo sendo erro, para o Frontend conseguir ler a mensagem "error"
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})