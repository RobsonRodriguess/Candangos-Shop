# 🛒 Hywer Store

> E-commerce moderno e automatizado para venda de itens e ranks de servidores de jogos.

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📸 Sobre o Projeto

O **Hywer Store** é uma plataforma de vendas fullstack desenvolvida para automatizar a entrega de produtos digitais (VIPs, Coins, Itens). O diferencial é o **Checkout Transparente** via Pix, que gera o QR Code na própria tela e aprova o pagamento automaticamente em tempo real, sem necessidade de enviar comprovantes.

### ✨ Funcionalidades Principais
- 🛍️ **Carrinho de Compras:** Gestão de itens com cálculo automático de total.
- 💳 **Checkout Híbrido (Mercado Pago):**
  - **Pix Automático:** Geração de QR Code e Copia e Cola instantâneo.
  - **Cartão de Crédito:** Redirecionamento seguro para ambiente certificado.
- 🔄 **Real-time Polling:** O frontend verifica automaticamente o status do pagamento e aprova o pedido na hora.
- 📩 **Emails Transacionais:** Envio automático de confirmação de pedido via EmailJS.
- 🎨 **UI/UX Premium:** Design responsivo com tema "Dark RPG", barra de progresso e animações fluídas.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React + Vite:** Para performance e construção de interfaces.
- **Tailwind CSS:** Estilização moderna e responsiva.
- **Lucide React:** Ícones vetoriais leves.
- **Sonner:** Sistema de notificações (Toasts) elegante.

### Backend & Serviços
- **Supabase Edge Functions:** Backend serverless para processar pagamentos com segurança (escondendo tokens de produção).
- **Mercado Pago API:** Integração direta para criar pagamentos e webhooks.
- **EmailJS:** Serviço de disparo de emails sem necessidade de servidor SMTP próprio.