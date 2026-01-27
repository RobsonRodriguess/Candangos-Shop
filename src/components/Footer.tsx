import { useState } from 'react';
import { Heart, X, FileText, Shield } from 'lucide-react';

const Footer = () => {
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | null>(null);

  // --- TEXTOS JURÍDICOS PADRÃO (Pode manter esses, são genéricos e funcionam) ---
  const texts = {
    terms: (
      <div className="space-y-4 text-sm text-gray-300">
        <p><strong>1. Aceitação:</strong> Ao comprar qualquer pacote na Loja Hywer, você concorda automaticamente com estes termos.</p>
        <p><strong>2. Entrega:</strong> A ativação dos produtos digitais (VIPs, Coins) ocorre automaticamente após a confirmação do pagamento pelo banco. O prazo médio é de 5 minutos, podendo chegar a 24h em casos raros.</p>
        <p><strong>3. Reembolso:</strong> Por se tratar de um produto digital intangível consumível imediatamente, não oferecemos reembolso após a ativação do serviço no jogo, exceto em casos de falha técnica comprovada.</p>
        <p><strong>4. Regras do Servidor:</strong> A compra de itens não isenta o usuário de seguir as regras do servidor. Banimentos por mau comportamento não dão direito a ressarcimento.</p>
      </div>
    ),
    privacy: (
      <div className="space-y-4 text-sm text-gray-300">
        <p><strong>1. Coleta de Dados:</strong> Coletamos apenas seu Nickname e E-mail para fins de identificação do pedido e envio do comprovante.</p>
        <p><strong>2. Segurança:</strong> Seus dados de pagamento (cartão, chaves pix) são processados diretamente pelo Mercado Pago. Nós <strong>NÃO</strong> temos acesso e nem salvamos seus dados financeiros.</p>
        <p><strong>3. Uso de Dados:</strong> Não vendemos nem compartilhamos seus dados com terceiros. Eles ficam salvos em nosso banco de dados seguro apenas para seu histórico de compras.</p>
      </div>
    )
  };

  return (
    <>
      <footer className="w-full py-10 bg-black/80 border-t border-white/10 mt-20 backdrop-blur-md">
        <div className="container mx-auto text-center flex flex-col gap-4">
          
          {/* Marca */}
          <div>
             <p className="text-muted-foreground text-sm">
               © 2026 <span className="text-primary font-bold">Hywer Network</span>. Todos os direitos reservados.
             </p>
          </div>

          {/* Links Funcionais */}
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground/60 font-medium">
              
              {/* Abre Modal de Termos */}
              <button onClick={() => setModalOpen('terms')} className="hover:text-white transition-colors">
                Termos de Uso
              </button>
              
              <span className="text-white/10">•</span>
              
              {/* Abre Modal de Privacidade */}
              <button onClick={() => setModalOpen('privacy')} className="hover:text-white transition-colors">
                Privacidade
              </button>
              
              <span className="text-white/10">•</span>
              
              {/* Link REAL do Discord */}
              <a 
                href="https://discord.gg/EPKNs6QK" // <--- COLOQUE SEU LINK DO DISCORD AQUI
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#5865F2] transition-colors"
              >
                Suporte
              </a>
          </div>

          {/* Créditos */}
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
            Desenvolvido com <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> por <span className="text-white font-bold hover:text-primary transition-colors cursor-pointer">Robson Rodrigues</span>
          </p>

          {/* Disclaimer */}
          <div className="border-t border-white/5 pt-6 mt-2">
              <p className="text-muted-foreground/30 text-[10px] max-w-lg mx-auto leading-relaxed">
              Não somos afiliados à Hypixel Studios. Hytale é uma marca registrada da Hypixel Studios. 
              </p>
          </div>
        </div>
      </footer>

      {/* --- MODAL (A JANELA QUE ABRE) --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Botão Fechar */}
            <button 
              onClick={() => setModalOpen(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-full"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              {modalOpen === 'terms' ? <FileText className="text-primary" /> : <Shield className="text-primary" />}
              <h2 className="text-xl font-bold font-display text-white">
                {modalOpen === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
              </h2>
            </div>

            {/* Conteúdo do Texto */}
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {texts[modalOpen]}
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setModalOpen(null)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Entendi
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Footer;