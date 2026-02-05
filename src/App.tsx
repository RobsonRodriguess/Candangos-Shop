import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";

// --- PÁGINAS ---
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders"; 
import NotFound from "./pages/NotFound";
import HallOfFame from "./pages/HallOfFame"; // Ranking
import Admin from "./pages/Admin";
import Tournament from "./pages/Tournament"; // <--- ADICIONADO: Página do Torneio Ao Vivo

// --- COMPONENTES ---
import PlayerProfile from "./components/PlayerProfile";
import CartDrawer from "./components/CartDrawer";
import CartButton from "./components/CartButton";
import Header from "./components/Header"; 

// --- COMPONENTES ESPECIAIS (O SEGREDO DO SITE) ---
import KonamiCode from "./components/KonamiCode"; // Easter Egg (Snake Game)
import Shoutbox from "./components/Shoutbox"; // Chat Flutuante
import AFKScreen from "./components/AFKScreen"; // Protetor de Tela Matrix

const queryClient = new QueryClient();

// Controla onde o Header aparece (Layout)
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Rotas onde o Header NÃO deve aparecer (Dashboards ou Fullscreen)
  // Nota: Mantivemos o Header no /torneio para facilitar a navegação, 
  // mas se quiser tela cheia total, adicione "/torneio" aqui na lista.
  const hideHeaderRoutes = ["/meus-pedidos", "/admin", "/checkout", "/perfil"]; 
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        
        {/* Notificações do Sistema */}
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          
          {/* --- CAMADA DE INTERAÇÃO GLOBAL (Roda por cima de tudo) --- */}
          
          {/* 1. Protetor de Tela Matrix (Se ficar 1min parado) */}
          <AFKScreen />

          {/* 2. Ouve o código secreto (↑ ↑ ↓ ↓ ← → ← → B A) */}
          <KonamiCode />

          {/* 3. Chat Global Flutuante (Bar do Submundo) */}
          <Shoutbox />

          {/* --- ROTEAMENTO --- */}
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/meus-pedidos" element={<MyOrders />} />
              <Route path="/ranking" element={<HallOfFame />} />
              <Route path="/perfil" element={<PlayerProfile />} />
              <Route path="/torneio" element={<Tournament />} /> {/* <--- ADICIONADO: Rota do Torneio */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>

          {/* Componentes do Carrinho (Sempre disponíveis) */}
          <CartDrawer />
          <CartButton />
          
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;