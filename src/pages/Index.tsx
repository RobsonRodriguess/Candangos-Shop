// 👇 Removi o import do TopBar e do Header (já está no App.tsx)
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import Sidebar from '@/components/Sidebar';
import ShopSection from '@/components/ShopSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      
      {/* 🚨 REMOVIDOS:
         <TopBar /> -> Não existe mais.
         <Header /> -> Já colocamos no App.tsx para aparecer em todas as páginas.
      */}

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content - Two Column Layout */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Left Column - News */}
          <div className="order-2 lg:order-1">
            <NewsSection />
          </div>

          {/* Right Column - Sidebar */}
          <aside className="order-1 lg:order-2">
            <Sidebar />
          </aside>
        </div>
      </main>

      {/* Shop Section */}
      <div id="loja">
         <ShopSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;