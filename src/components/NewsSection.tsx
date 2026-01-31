'use client'; 

import { useEffect, useState } from 'react';
import { Bell, ExternalLink, MessageSquare, Hash, Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = 'https://vrlswaqvswzcapbzshcp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybHN3YXF2c3d6Y2FwYnpzaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI1NjYsImV4cCI6MjA4NTA1ODU2Nn0.YooTRks2-zy4hqAIpSQmhDpTCf134QHrzl7Ry5TbKn8';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- TIPAGEM ---
interface News {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  avatar: string;
  discord_link: string;
  category: string;
  created_at: string;
}

// --- SKELETON (Industrial Style) ---
const NewsSkeleton = () => (
  <div className="w-full bg-[#121212] border border-white/5 rounded-xl p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded bg-white/10" />
      <div className="space-y-2">
        <div className="w-24 h-3 bg-white/10 rounded" />
        <div className="w-16 h-2 bg-white/5 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="w-3/4 h-3 bg-white/10 rounded" />
      <div className="w-full h-2 bg-white/5 rounded" />
      <div className="w-2/3 h-2 bg-white/5 rounded" />
    </div>
  </div>
);

const NewsSection = () => {
  const [newsUpdates, setNewsUpdates] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        if (data) setNewsUpdates(data);
      } catch (error: any) {
        console.error('Erro ao buscar notícias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    const channel = supabase
      .channel('news-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, (payload) => {
        setNewsUpdates((prev) => [payload.new as News, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section id="noticias" className="w-full relative overflow-hidden bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 md:p-8 scroll-mt-28">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Hash className="w-5 h-5 text-green-500" />
            </div>
            <div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide">
                    Feed da Guilda
                </h2>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Sincronizado em Tempo Real</span>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          <>
            <NewsSkeleton />
            <NewsSkeleton />
          </>
        ) : newsUpdates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl">
            <Bell className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">Sem novidades no fronte.</p>
          </div>
        ) : (
          newsUpdates.map((news, index) => (
            <article 
              key={news.id}
              className="group relative bg-[#121212] hover:bg-[#161616] border border-white/5 hover:border-green-500/30 rounded-xl p-5 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                    <img 
                      src={news.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      alt={news.author} 
                      className="w-10 h-10 rounded bg-gray-800 object-cover ring-1 ring-white/10 group-hover:ring-green-500/50 transition-all"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm group-hover:text-green-400 transition-colors">
                            {news.author}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#5865F2] text-white uppercase tracking-wider">
                            BOT
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                           <Calendar className="w-3 h-3" /> {formatDate(news.created_at)}
                        </span>
                    </div>

                    {news.title && (
                       <h3 className="text-base font-bold text-gray-200 mb-1 leading-tight group-hover:text-white transition-colors">
                         {news.title}
                       </h3>
                    )}
                    
                    {/* ALTERAÇÃO AQUI: removido o line-clamp-4 para mostrar o texto todo */}
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap font-sans mb-3">
                        {news.excerpt}
                    </p>

                    <a 
                      href={news.discord_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5865F2] hover:text-[#7983f5] transition-colors uppercase tracking-wide group/link"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Ler no Discord
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

    </section>
  );
};

export default NewsSection;