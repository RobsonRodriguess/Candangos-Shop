import { Calendar, ArrowRight, Bell, Tag, ExternalLink } from 'lucide-react';

const newsUpdates = [
  {
    id: 7,
    title: "Esclarecimentos, Novidades e Cupom!",
    excerpt: "Estamos trabalhando para resolver as quedas recentes. Lançamos um novo canal de spoilers, o VIP Aventureiro e um cupom de 15% OFF: Hywer15.",
    date: "26 Jan 2026",
    // AQUI VOCÊ MUDA O NICK
    author: "DryIce_",
    // AQUI VOCÊ MUDA A COR DO NICK (Igual do cargo no Discord)
    authorColor: "text-purple-400",
    category: "Novidades",
    categoryColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    // AQUI PUXA A CABEÇA DO BONECO (Se quiser foto real, cole o link da imagem aqui)
    avatar: "https://mc-heads.net/avatar/DryIce_/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1465520009081126944"
  },
  {
    id: 6,
    title: "Inauguração do Site + VIP Apoiador",
    excerpt: "Site oficial no ar (temporário)! Com o VIP APOIADOR, você ajuda diretamente no desenvolvimento e recebe vantagens exclusivas.",
    date: "25 Jan 2026",
    author: "DryIce_",
    authorColor: "text-purple-400",
    category: "Loja",
    categoryColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    avatar: "https://mc-heads.net/avatar/DryIce_/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1464845251263988009"
  },
  {
    id: 5,
    title: "Aviso Importante — Sobre as Claims",
    excerpt: "Precisamos alterar o método de salvamento das claims. Por favor, entrem no servidor e verifiquem se sua proteção está correta.",
    date: "23 Jan 2026",
    author: "DryIce_",
    authorColor: "text-purple-400",
    category: "Urgente",
    categoryColor: "bg-red-500/20 text-red-300 border-red-500/30",
    avatar: "https://mc-heads.net/avatar/DryIce_/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1464275679683285107"
  },
  {
    id: 4,
    title: "Otimização do Survival",
    excerpt: "Realizamos uma otimização geral! O servidor está muito mais liso, superando a marca de 40 jogadores online sem lag.",
    date: "22 Jan 2026",
    author: "zCrazy21",
    authorColor: "text-purple-400", // Cor do cargo CEO/DEV
    category: "Manutenção",
    categoryColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    avatar: "https://mc-heads.net/avatar/zCrazy21/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1464045287805816902"
  },
  {
    id: 3,
    title: "Novo Sistema de Lobby Disponível",
    excerpt: "Agora temos um lobby central para facilitar a conexão! Atualizamos os IPs oficiais para 'hywer.net'.",
    date: "18 Jan 2026",
    author: "zCrazy21",
    authorColor: "text-purple-400",
    category: "Sistema",
    categoryColor: "bg-green-500/20 text-green-300 border-green-500/30",
    avatar: "https://mc-heads.net/avatar/zCrazy21/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1462401077529022588"
  },
  {
    id: 2,
    title: "HYWER ESTÁ ONLINE NO HYTALE!",
    excerpt: "Chegou o momento! Dando início oficialmente à nossa jornada. Lembre-se: estamos em Beta, bugs podem ocorrer.",
    date: "15 Jan 2026",
    author: "zCrazy21",
    authorColor: "text-purple-400",
    category: "Lançamento",
    categoryColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    avatar: "https://mc-heads.net/avatar/zCrazy21/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1461427640136372286"
  },
  {
    id: 1,
    title: "Sejam Bem-vindos à Hywer!",
    excerpt: "Estamos começando esse projeto com muito carinho e empolgação. Nosso objetivo é evoluir junto com a comunidade.",
    date: "15 Jan 2026",
    author: "zCrazy21",
    authorColor: "text-purple-400",
    category: "Geral",
    categoryColor: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    avatar: "https://mc-heads.net/avatar/zCrazy21/48",
    discordLink: "https://discordapp.com/channels/1461132354096726171/1461156824676827313/1461359610337427762"
  }
];

const NewsSection = () => {
  return (
    <section id="noticias" className="w-full space-y-6">
      
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
          <Bell className="w-6 h-6 text-primary animate-bounce-subtle" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Últimas Atualizações</h2>
          <p className="text-sm text-muted-foreground">Acompanhe as novidades direto do nosso Discord.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {newsUpdates.map((news) => (
          <article 
            key={news.id} 
            className="group relative bg-[#313338] backdrop-blur-md border border-[#1e1f22] rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-[1.01]"
          >
            {/* LINHA DO AUTOR (Igual Discord) */}
            <div className="flex items-center gap-3 mb-3">
              {/* Foto Redonda */}
              <img 
                src={news.avatar} 
                alt={news.author} 
                className="w-10 h-10 rounded-full border-2 border-[#1e1f22] bg-gray-700"
              />
              
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                {/* Nome do Autor Colorido */}
                <span className={`font-bold text-sm ${news.authorColor} hover:underline cursor-pointer`}>
                  {news.author}
                </span>
                
                {/* Data e Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{news.date}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${news.categoryColor} uppercase tracking-wider`}>
                        {news.category}
                    </span>
                </div>
              </div>
            </div>

            {/* CONTEÚDO (Padding na esquerda para alinhar com o texto do chat) */}
            <div className="pl-[52px]">
              <a href={news.discordLink} target="_blank" rel="noreferrer" className="block">
                <h3 className="text-base font-bold text-gray-100 mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                  {news.title}
                </h3>
              </a>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {news.excerpt}
              </p>

              {/* Botão de Ação */}
              <a 
                href={news.discordLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#00A8FC] hover:text-[#00A8FC]/80 hover:underline transition-all"
              >
                Ir para mensagem <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;