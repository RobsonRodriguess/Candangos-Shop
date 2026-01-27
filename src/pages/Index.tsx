import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import Sidebar from '@/components/Sidebar';
import ShopSection from '@/components/ShopSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar />

      {/* Header */}
      <Header />

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
      <ShopSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
