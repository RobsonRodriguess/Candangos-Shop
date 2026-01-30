import { useState } from 'react';
import { Heart, X, FileText, Shield } from 'lucide-react';

const Footer = () => {
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | null>(null);

  // TEXTOS JURÍDICOS (Mantidos e organizados)
  const texts = {
    terms: (
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <p><strong className="text-green-400">1. Aceitação:</strong> Ao comprar qualquer pacote na Loja Hywer/Candangos, você concorda automaticamente com estes termos.</p>
        <p><strong className="text-green-400">2. Entrega:</strong> A ativação dos produtos digitais (VIPs, Coins) ocorre automaticamente após a confirmação do pagamento pelo banco. O prazo médio é de 5 minutos, podendo chegar a 24h em casos raros.</p>
        <p><strong className="text-green-400">3. Reembolso:</strong> Por se tratar de um produto digital intangível consumível imediatamente, não oferecemos reembolso após a ativação do serviço no jogo, exceto em casos de falha técnica comprovada.</p>
        <p><strong className="text-green-400">4. Regras do Servidor:</strong> A compra de itens não isenta o usuário de seguir as regras do servidor. Banimentos por mau comportamento não dão direito a ressarcimento.</p>
      </div>
    ),
    privacy: (
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <p><strong className="text-green-400">1. Coleta de Dados:</strong> Coletamos apenas seu Nickname e E-mail para fins de identificação do pedido e envio do comprovante.</p>
        <p><strong className="text-green-400">2. Segurança:</strong> Seus dados de pagamento (cartão, chaves pix) são processados diretamente pelo Mercado Pago. Nós <strong>NÃO</strong> temos acesso e nem salvamos seus dados financeiros.</p>
        <p><strong className="text-green-400">3. Uso de Dados:</strong> Não vendemos nem compartilhamos seus dados com terceiros. Eles ficam salvos em nosso banco de dados seguro apenas para seu histórico de compras.</p>
      </div>
    )
  };

  return (
    <>
      <footer className="w-full bg-[#050505] pt-12 md:pt-16 pb-8 relative mt-20">
        
        {/* Linha de Energia no Topo (Gradiente Verde/Laranja) */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
        
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-6 md:gap-8">
          
          {/* Marca / Logo Texto */}
          <div className="flex flex-col items-center gap-2">
             <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
                CANDANGOS <span className="text-green-500">GUILD</span>
             </h3>
             <p className="text-xs md:text-sm text-gray-500 max-w-xs md:max-w-md mx-auto">
                A guilda que constrói o futuro. Servidor oficial de Hytale no Brasil.
             </p>
          </div>

          {/* Links Jurídicos e Suporte (Melhorado para Mobile) */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs md:text-sm font-medium text-gray-400">
              <button 
                onClick={() => setModalOpen('terms')} 
                className="hover:text-white transition-colors hover:underline decoration-green-500 decoration-2 underline-offset-4 px-2 py-1"
              >
                Termos de Uso
              </button>
              <button 
                onClick={() => setModalOpen('privacy')} 
                className="hover:text-white transition-colors hover:underline decoration-green-500 decoration-2 underline-offset-4 px-2 py-1"
              >
                Privacidade
              </button>
              <a 
                href="https://discord.gg/GqJnprnS" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#5865F2] transition-colors flex items-center gap-2 px-2 py-1"
              >
                Suporte via Discord
              </a>
          </div>

          {/* Divisória */}
          <div className="w-full max-w-[200px] h-px bg-white/5" />

          {/* Copyright e Créditos */}
          <div className="flex flex-col gap-1 md:gap-2">
             <p className="text-[10px] md:text-xs text-gray-600">
               © 2026 Candangos Guild. Todos os direitos reservados.
             </p>
             <p className="text-[10px] md:text-xs text-gray-600 flex flex-wrap items-center justify-center gap-1.5">
               Desenvolvido por 
               <span className="text-green-500 font-bold hover:text-green-400 transition-colors cursor-pointer">
                 Robson Rodrigues
               </span>
             </p>
          </div>
          
          {/* Disclaimer Jurídico */}
          <div className="mt-2 md:mt-4 px-4 py-2 rounded bg-white/[0.02] border border-white/5 w-full max-w-2xl">
              <p className="text-gray-600 text-[9px] md:text-[10px] leading-relaxed">
              Não somos afiliados à Hypixel Studios. Hytale é uma marca registrada da Hypixel Studios. Este é um site de fã para fã.
              </p>
          </div>
        </div>
      </footer>

      {/* --- MODAL (JURÍDICO) --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Botão Fechar */}
            <button 
              onClick={() => setModalOpen(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg border border-white/5 z-10"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 shrink-0">
              <div className="p-2 bg-green-500/10 rounded-lg">
                 {modalOpen === 'terms' ? <FileText className="text-green-500 w-5 h-5" /> : <Shield className="text-green-500 w-5 h-5" />}
              </div>
              <h2 className="text-lg md:text-xl font-bold font-display text-white">
                {modalOpen === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
              </h2>
            </div>

            {/* Conteúdo do Texto (Com Scroll) */}
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              {texts[modalOpen]}
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end shrink-0">
              <button 
                onClick={() => setModalOpen(null)}
                className="px-6 py-2 bg-white/5 hover:bg-green-600 text-white border border-white/10 hover:border-green-500 rounded-lg text-sm font-bold transition-all w-full md:w-auto"
              >
                Compreendido
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Footer;