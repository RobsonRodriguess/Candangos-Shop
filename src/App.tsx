import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Admin from "./pages/Admin";

// Importações das Páginas
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders"; 
import NotFound from "./pages/NotFound";

// Importações de Componentes
import CartDrawer from "./components/CartDrawer";
import CartButton from "./components/CartButton";
import Header from "./components/Header"; 

const queryClient = new QueryClient();

// 👇 COMPONENTE NOVO PARA CONTROLAR O HEADER
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Lista de rotas onde o Header NÃO deve aparecer
  const hideHeaderRoutes = ["/meus-pedidos", "/admin", "/checkout"]; //
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
          
          {/* Envolvemos tudo no Layout que decide se mostra o Header ou não */}
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/meus-pedidos" element={<MyOrders />} />
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