import React from 'react';
import { Car, Zap, ShoppingCart, Wrench, BarChart3, CreditCard, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSectionChange }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-zinc-900 to-black py-16 overflow-hidden">
        <div className="absolute inset-0 bg-champagne/5 bg-[radial-gradient(ellipse_at_center,rgba(218,165,32,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              New Zealand's First Hedera-Native Automotive Platform
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              AI-powered diagnostics, blockchain-verified parts, and VIP self-service workshops
            </p>
            <div className="mb-12">
              {/* Clean Logo Display without Text Overlay */}
              <div className="relative mx-auto max-w-4xl">
                <div className="relative w-full h-96 md:h-[500px] group">
                  <div className="absolute inset-0 bg-gradient-to-r from-champagne/20 via-champagne-light/30 to-champagne/20 rounded-xl blur-xl animate-pulse-slow"></div>
                  <div className="relative w-full h-full bg-black rounded-xl border-4 border-champagne shadow-2xl shadow-champagne/40 overflow-hidden flex items-center justify-center">
                    <img 
                      src="/generated-image (1).png" 
                      alt="Karapiro Cartel - State Highway Speed Shop" 
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 filter drop-shadow-lg animate-flag-wave"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none"></div>
                  </div>
                  <div className="absolute -inset-4 bg-champagne/10 rounded-xl blur-2xl animate-pulse-slow pointer-events-none opacity-60"></div>
                  
                  {/* Floating elements around the image */}
                  <div className="absolute -top-4 -right-4 bg-champagne/20 backdrop-blur-sm border border-champagne/30 rounded-full p-3 animate-bounce">
                    <Zap className="text-champagne" size={20} />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-champagne/20 backdrop-blur-sm border border-champagne/30 rounded-full p-3 animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <Car className="text-champagne" size={20} />
                  </div>
                  <div className="absolute top-1/2 -left-8 bg-champagne/20 backdrop-blur-sm border border-champagne/30 rounded-full p-3 animate-bounce" style={{ animationDelay: '1s' }}>
                    <Wrench className="text-champagne" size={20} />
                  </div>
                  <div className="absolute top-1/2 -right-8 bg-champagne/20 backdrop-blur-sm border border-champagne/30 rounded-full p-3 animate-bounce" style={{ animationDelay: '1.5s' }}>
                    <ShoppingCart className="text-champagne" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selector */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-champagne uppercase tracking-wider mb-16 relative animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">
            Choose Your Portal
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-champagne-dark to-champagne"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RoleCard 
              icon={<ShoppingCart className="w-12 h-12 text-champagne" />}
              title="BUYER PORTAL"
              description="Browse premium automotive parts with AI compatibility checking"
              onClick={() => onSectionChange('marketplace')}
            />
            
            <RoleCard 
              icon={<BarChart3 className="w-12 h-12 text-champagne" />}
              title="SELLER DASHBOARD"
              description="Manage inventory and process orders with blockchain verification"
              onClick={() => onSectionChange('analytics')}
            />
            
            <RoleCard 
              icon={<Car className="w-12 h-12 text-champagne" />}
              title="WORKSHOP ACCESS"
              description="Book self-service workshop bays with professional equipment"
              onClick={() => onSectionChange('workshop')}
            />
            
            <RoleCard 
              icon={<Wrench className="w-12 h-12 text-champagne" />}
              title="AI DIAGNOSTICS"
              description="Mobile-first OBD2 scanning with intelligent troubleshooting"
              onClick={() => onSectionChange('diagnostics')}
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-champagne uppercase tracking-wider mb-16 relative animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">
            Platform Features
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-champagne-dark to-champagne"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 hover:border-champagne transition-all duration-300">
              <div className="bg-champagne/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Zap className="text-champagne" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-champagne animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">AI-Powered Diagnostics</h3>
              <p className="text-gray-400 mb-4">
                Advanced diagnostic interpretations using X.AI's Grok models to provide accurate, actionable insights from OBD2 data.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Trouble code interpretation</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Repair recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Cost estimates</span>
                </li>
              </ul>
              <button 
                onClick={() => onSectionChange('diagnostics')}
                className="flex items-center text-champagne hover:text-champagne-light transition-colors"
              >
                Try Diagnostics <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 hover:border-champagne transition-all duration-300">
              <div className="bg-champagne/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Database className="text-champagne" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-champagne animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">Blockchain Integration</h3>
              <p className="text-gray-400 mb-4">
                Hedera Hashgraph integration for secure, transparent transactions and parts authentication.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Parts authentication</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>HBAR payments</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Smart contracts</span>
                </li>
              </ul>
              <button 
                onClick={() => onSectionChange('marketplace')}
                className="flex items-center text-champagne hover:text-champagne-light transition-colors"
              >
                View Marketplace <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 hover:border-champagne transition-all duration-300">
              <div className="bg-champagne/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Wrench className="text-champagne" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-champagne animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">VIP Workshop Access</h3>
              <p className="text-gray-400 mb-4">
                Self-service workshop bays with professional equipment for DIY enthusiasts and mechanics.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Professional lifts</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Diagnostic equipment</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="mr-2 mt-1 flex-shrink-0" />
                  <span>Tool access</span>
                </li>
              </ul>
              <button 
                onClick={() => onSectionChange('workshop')}
                className="flex items-center text-champagne hover:text-champagne-light transition-colors"
              >
                Book Workshop <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-champagne uppercase tracking-wider mb-16 relative animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">
            What Our Users Say
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-champagne-dark to-champagne"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-500">
                  <Star /><Star /><Star /><Star /><Star />
                </div>
                <span className="ml-2 text-gray-400">5.0</span>
              </div>
              <p className="text-gray-300 mb-6">
                "The AI diagnostic tool saved me thousands in unnecessary repairs. It correctly identified my issue when three different mechanics couldn't figure it out."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-champagne rounded-full flex items-center justify-center text-black font-bold">
                  JD
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">James Donovan</h4>
                  <p className="text-sm text-gray-400">Supra Owner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-500">
                  <Star /><Star /><Star /><Star /><Star />
                </div>
                <span className="ml-2 text-gray-400">5.0</span>
              </div>
              <p className="text-gray-300 mb-6">
                "As a shop owner, the blockchain verification has eliminated counterfeit parts issues. My customers love the added trust and transparency."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  MT
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Mike Thompson</h4>
                  <p className="text-sm text-gray-400">Shop Owner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-500">
                  <Star /><Star /><Star /><Star /><HalfStar />
                </div>
                <span className="ml-2 text-gray-400">4.5</span>
              </div>
              <p className="text-gray-300 mb-6">
                "The workshop bays are incredible. Access to professional equipment without the massive investment has been a game-changer for my project car builds."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  SL
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Sarah Lee</h4>
                  <p className="text-sm text-gray-400">DIY Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-champagne rounded-lg p-8 shadow-lg shadow-champagne/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Automotive Experience?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join New Zealand's most innovative automotive platform with AI diagnostics, blockchain verification, and professional workshop access.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onSectionChange('pricing')}
                className="bg-gradient-to-r from-champagne-dark to-champagne text-black px-8 py-3 rounded-md hover:shadow-lg hover:shadow-champagne/30 transition-all duration-300 font-medium"
              >
                <CreditCard className="inline-block mr-2" size={18} />
                View Pricing
              </button>
              <button 
                onClick={() => onSectionChange('marketplace')}
                className="bg-transparent border-2 border-champagne text-white px-8 py-3 rounded-md hover:bg-champagne/10 transition-all duration-300 font-medium"
              >
                <ShoppingCart className="inline-block mr-2" size={18} />
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const RoleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-gray-400 hover:border-champagne rounded-lg p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-champagne/20 hover:-translate-y-1 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-champagne/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-champagne mb-3 animate-shimmer bg-gradient-to-r from-champagne via-champagne-light to-champagne bg-clip-text text-transparent bg-size-200 animate-shimmer-text">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <button 
        onClick={onClick}
        className="bg-gradient-to-r from-champagne-dark to-champagne text-black px-6 py-2 rounded-md hover:shadow-lg hover:shadow-champagne/30 transition-all duration-300"
      >
        Enter Portal
      </button>
    </div>
  );
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`text-champagne ${className}`}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Star: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const HalfStar: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none"></polygon>
    <path d="M12 2 L12 17.77" stroke="none"></path>
    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L12 2" fill="currentColor"></path>
  </svg>
);

const Database: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

export default Dashboard;