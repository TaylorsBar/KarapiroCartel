import React, { useState } from 'react';
import { Car, Zap, ShoppingCart, Wrench, BarChart3, CreditCard, Menu, X, User, LogOut, Store } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useRevenueCat } from './hooks/useRevenueCat';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import EnhancedMarketplace from './components/EnhancedMarketplace';
import Diagnostics from './components/Diagnostics';
import Workshop from './components/Workshop';
import Analytics from './components/Analytics';
import Pricing from './components/Pricing';
import SupplierDashboard from './components/SupplierDashboard';
import BlockchainModal from './components/BlockchainModal';
import AuthModal from './components/AuthModal';
import RevenueCatPaywall from './components/RevenueCatPaywall';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState({
    id: '',
    amount: 0,
    status: 'pending'
  });

  const { user, profile, loading, signOut } = useAuth();
  const { getCurrentTier, hasActiveSubscription } = useRevenueCat();

  // Check for premium features access
  const checkPremiumAccess = (feature: string) => {
    const currentTier = getCurrentTier();
    
    switch (feature) {
      case 'unlimited_diagnostics':
        return currentTier === 'professional' || currentTier === 'enterprise';
      case 'advanced_analytics':
        return currentTier === 'professional' || currentTier === 'enterprise';
      case 'priority_support':
        return currentTier === 'professional' || currentTier === 'enterprise';
      case 'supplier_dashboard':
        return profile?.user_type === 'dealer' || profile?.user_type === 'mechanic';
      default:
        return true;
    }
  };

  const handleSectionChange = (section: string) => {
    // Check if user needs premium access for certain sections
    if (section === 'analytics' && !checkPremiumAccess('advanced_analytics')) {
      setShowPaywall(true);
      return;
    }
    
    if (section === 'supplier' && !checkPremiumAccess('supplier_dashboard')) {
      alert('Supplier dashboard is available for dealers and mechanics only.');
      return;
    }
    
    setActiveSection(section);
    setShowMobileMenu(false);
    window.scrollTo(0, 0);
  };

  const handleBlockchainPayment = (amount: number) => {
    // Generate a random transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    setTransactionDetails({
      id: transactionId,
      amount: amount,
      status: 'confirmed'
    });
    
    setShowBlockchainModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      setActiveSection('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-champagne border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Karapiro Cartel Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-black to-zinc-900 border-b-2 border-champagne shadow-lg shadow-champagne/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Larger Circular Logo in Header */}
              <div className="relative w-16 h-16 mr-4">
                <div className="w-full h-full bg-black rounded-full border-2 border-champagne shadow-lg shadow-champagne/30 overflow-hidden flex items-center justify-center">
                  <img 
                    src="/image (6).png" 
                    alt="Karapiro Cartel Logo" 
                    className="w-14 h-14 object-contain animate-flag-wave"
                    onError={(e) => {
                      // Fallback to Car icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.innerHTML = '<svg class="text-champagne" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h2.4a.6.6 0 0 0 .6-.6V12a4 4 0 0 0-4-4h-3"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>';
                      target.parentNode?.insertBefore(fallback, target);
                    }}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-champagne uppercase tracking-wider animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">Karapiro Cartel</h1>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Intelligent Automotive Platform</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <NavButton 
                icon={<Zap size={16} />} 
                label="Dashboard" 
                active={activeSection === 'dashboard'} 
                onClick={() => handleSectionChange('dashboard')} 
              />
              <NavButton 
                icon={<ShoppingCart size={16} />} 
                label="Marketplace" 
                active={activeSection === 'marketplace'} 
                onClick={() => handleSectionChange('marketplace')} 
              />
              <NavButton 
                icon={<Wrench size={16} />} 
                label="Diagnostics" 
                active={activeSection === 'diagnostics'} 
                onClick={() => handleSectionChange('diagnostics')} 
              />
              <NavButton 
                icon={<Car size={16} />} 
                label="Workshop" 
                active={activeSection === 'workshop'} 
                onClick={() => handleSectionChange('workshop')} 
              />
              <NavButton 
                icon={<BarChart3 size={16} />} 
                label="Analytics" 
                active={activeSection === 'analytics'} 
                onClick={() => handleSectionChange('analytics')} 
                premium={!checkPremiumAccess('advanced_analytics')}
              />
              {checkPremiumAccess('supplier_dashboard') && (
                <NavButton 
                  icon={<Store size={16} />} 
                  label="Supplier" 
                  active={activeSection === 'supplier'} 
                  onClick={() => handleSectionChange('supplier')} 
                />
              )}
              <NavButton 
                icon={<CreditCard size={16} />} 
                label="Pricing" 
                active={activeSection === 'pricing'} 
                onClick={() => handleSectionChange('pricing')} 
              />
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md border border-champagne text-white hover:bg-champagne/10 transition-colors"
                  >
                    <User size={16} />
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm">{profile?.full_name || user.email}</span>
                      <span className="text-xs text-champagne capitalize">{getCurrentTier()} Plan</span>
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-zinc-700">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <p className="text-xs text-champagne capitalize">{getCurrentTier()} Plan</p>
                        <p className="text-xs text-gray-500 capitalize">{profile?.user_type || 'customer'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowPaywall(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-zinc-800 transition-colors"
                      >
                        <CreditCard size={16} className="mr-2" />
                        Manage Subscription
                      </button>
                      {checkPremiumAccess('supplier_dashboard') && (
                        <button
                          onClick={() => {
                            handleSectionChange('supplier');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-zinc-800 transition-colors"
                        >
                          <Store size={16} className="mr-2" />
                          Supplier Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-zinc-800 transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-champagne-dark to-champagne text-black rounded-md hover:shadow-lg hover:shadow-champagne/30 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-white p-2 rounded-md hover:bg-zinc-800"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {showMobileMenu && (
            <nav className="md:hidden mt-4 pb-2 flex flex-col space-y-2">
              <MobileNavButton 
                icon={<Zap size={16} />} 
                label="Dashboard" 
                active={activeSection === 'dashboard'} 
                onClick={() => handleSectionChange('dashboard')} 
              />
              <MobileNavButton 
                icon={<ShoppingCart size={16} />} 
                label="Marketplace" 
                active={activeSection === 'marketplace'} 
                onClick={() => handleSectionChange('marketplace')} 
              />
              <MobileNavButton 
                icon={<Wrench size={16} />} 
                label="Diagnostics" 
                active={activeSection === 'diagnostics'} 
                onClick={() => handleSectionChange('diagnostics')} 
              />
              <MobileNavButton 
                icon={<Car size={16} />} 
                label="Workshop" 
                active={activeSection === 'workshop'} 
                onClick={() => handleSectionChange('workshop')} 
              />
              <MobileNavButton 
                icon={<BarChart3 size={16} />} 
                label="Analytics" 
                active={activeSection === 'analytics'} 
                onClick={() => handleSectionChange('analytics')} 
                premium={!checkPremiumAccess('advanced_analytics')}
              />
              {checkPremiumAccess('supplier_dashboard') && (
                <MobileNavButton 
                  icon={<Store size={16} />} 
                  label="Supplier Dashboard" 
                  active={activeSection === 'supplier'} 
                  onClick={() => handleSectionChange('supplier')} 
                />
              )}
              <MobileNavButton 
                icon={<CreditCard size={16} />} 
                label="Pricing" 
                active={activeSection === 'pricing'} 
                onClick={() => handleSectionChange('pricing')} 
              />
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeSection === 'dashboard' && <Dashboard onSectionChange={handleSectionChange} />}
        {activeSection === 'marketplace' && <EnhancedMarketplace onBlockchainPayment={handleBlockchainPayment} />}
        {activeSection === 'diagnostics' && <Diagnostics />}
        {activeSection === 'workshop' && <Workshop />}
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'pricing' && <Pricing />}
        {activeSection === 'supplier' && <SupplierDashboard />}
      </main>

      {/* Modals */}
      <BlockchainModal 
        isOpen={showBlockchainModal}
        onClose={() => setShowBlockchainModal(false)}
        transactionId={transactionDetails.id}
        amount={transactionDetails.amount}
        status={transactionDetails.status}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <RevenueCatPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
};

// Navigation Button Components
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  premium?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, premium }) => {
  return (
    <button
      className={`flex items-center px-3 py-2 text-sm rounded border ${
        active 
          ? 'border-champagne bg-champagne text-black' 
          : 'border-champagne text-white hover:bg-champagne/10'
      } transition-all duration-200 uppercase tracking-wide font-medium relative`}
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span>
      {label}
      {premium && (
        <span className="ml-1 text-xs bg-amber-500 text-black px-1 rounded">PRO</span>
      )}
    </button>
  );
};

const MobileNavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, premium }) => {
  return (
    <button
      className={`flex items-center px-4 py-3 text-sm rounded border ${
        active 
          ? 'border-champagne bg-champagne text-black' 
          : 'border-champagne text-white hover:bg-champagne/10'
      } transition-all duration-200 uppercase tracking-wide font-medium w-full relative`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
      {premium && (
        <span className="ml-auto text-xs bg-amber-500 text-black px-2 py-1 rounded">PRO</span>
      )}
    </button>
  );
};

export default App;