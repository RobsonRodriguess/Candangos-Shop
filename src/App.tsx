import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";

// Páginas
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders"; 
import NotFound from "./pages/NotFound";
import HallOfFame from "./pages/HallOfFame"; // Ranking
import Admin from "./pages/Admin";

// Componentes
import PlayerProfile from "./components/PlayerProfile"; // Carteirinha Nova
import CartDrawer from "./components/CartDrawer";
import CartButton from "./components/CartButton";
import Header from "./components/Header"; 
import KonamiCode from "./components/KonamiCode"; // <--- IMPORTADO O SEGREDO

const queryClient = new QueryClient();

// Controla onde o Header aparece
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Rotas "Full Screen" ou Dashboard onde o Header atrapalha
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          
          {/* O OUVINTE DO CÓDIGO FICA AQUI, INVISÍVEL */}
          <KonamiCode />

          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/meus-pedidos" element={<MyOrders />} />
              <Route path="/ranking" element={<HallOfFame />} />
              <Route path="/perfil" element={<PlayerProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>

          <CartDrawer />
          <CartButton />
          
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;