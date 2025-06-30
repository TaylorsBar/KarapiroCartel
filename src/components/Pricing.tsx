import React, { useState } from 'react';
import { CheckCircle, CreditCard, Shield, Zap, Globe, Database, Crown } from 'lucide-react';
import { useRevenueCat } from '../hooks/useRevenueCat';
import RevenueCatPaywall from './RevenueCatPaywall';

const Pricing: React.FC = () => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const { offerings, getCurrentTier, hasActiveSubscription } = useRevenueCat();
  const currentTier = getCurrentTier();

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId);
    setShowPaywall(true);
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'starter':
        return 'border-blue-600 bg-blue-600/5';
      case 'professional':
        return 'border-red-600 bg-red-600/5';
      case 'enterprise':
        return 'border-purple-600 bg-purple-600/5';
      default:
        return 'border-zinc-700';
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'starter':
        return <Zap className="text-blue-600" size={24} />;
      case 'professional':
        return <Crown className="text-red-600" size={24} />;
      case 'enterprise':
        return <Shield className="text-purple-600" size={24} />;
      default:
        return <Database className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-6 relative">
        Platform Pricing
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>
      
      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
        Choose the perfect plan for your automotive business. All plans include blockchain verification, 
        AI-powered diagnostics, and access to our marketplace.
      </p>

      {/* Current Subscription Status */}
      {currentTier !== 'free' && (
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-green-900/20 border border-green-600/30 rounded-full px-6 py-3">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-400 font-medium">
              Currently subscribed to {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {offerings.map((tier) => {
          const isCurrentTier = currentTier === tier.id;
          const isPopular = tier.isPopular;
          
          return (
            <div 
              key={tier.id}
              className={`bg-gradient-to-br from-zinc-900 to-black border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                isPopular 
                  ? 'border-red-600 shadow-lg shadow-red-600/10 scale-105' 
                  : getTierColor(tier.id)
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-red-700 to-red-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentTier && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="mb-4">
                  {getTierIcon(tier.id)}
                </div>
                <h2 className="text-xl font-bold text-red-600 uppercase tracking-wide">{tier.name}</h2>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {tier.id === 'starter' && 'For small workshops and individual mechanics'}
                  {tier.id === 'professional' && 'For established workshops and dealerships'}
                  {tier.id === 'enterprise' && 'For large dealership networks and franchises'}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(tier.id)}
                disabled={isCurrentTier}
                className={`w-full py-3 rounded-md flex items-center justify-center transition-all duration-300 font-medium ${
                  isCurrentTier
                    ? 'bg-green-600/20 text-green-500 cursor-not-allowed border border-green-600/30'
                    : 'bg-gradient-to-r from-red-700 to-red-600 text-white hover:shadow-lg hover:shadow-red-600/30'
                }`}
              >
                {isCurrentTier ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CreditCard className="mr-2 text-red-600" />
            Payment Options
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-blue-600/20 p-2 rounded-lg mr-4">
                <CreditCard className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Credit/Debit Cards</h3>
                <p className="text-sm text-gray-400">Visa, Mastercard, American Express</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-purple-600/20 p-2 rounded-lg mr-4">
                <Database className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">HBAR Cryptocurrency</h3>
                <p className="text-sm text-gray-400">Direct blockchain payments with Hedera</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-green-600/20 p-2 rounded-lg mr-4">
                <Globe className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Mobile Payments</h3>
                <p className="text-sm text-gray-400">Apple Pay, Google Pay, PayPal</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Shield className="mr-2 text-red-600" />
            Enterprise Features
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-amber-600/20 p-2 rounded-lg mr-4 mt-1">
                <Shield className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Custom Smart Contracts</h3>
                <p className="text-sm text-gray-400">Develop custom blockchain contracts for your specific business needs, from parts authentication to warranty tracking.</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-blue-600/20 p-2 rounded-lg mr-4 mt-1">
                <Zap className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Advanced AI Training</h3>
                <p className="text-sm text-gray-400">Train our AI models on your specific vehicle data for more accurate diagnostics and recommendations.</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-zinc-800/50 rounded-lg">
              <div className="bg-green-600/20 p-2 rounded-lg mr-4 mt-1">
                <Globe className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Multi-Region Support</h3>
                <p className="text-sm text-gray-400">Global deployment options with regional data centers for optimal performance worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-8 shadow-lg shadow-red-600/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Need a Custom Solution?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our team can build custom solutions for large automotive networks, dealerships, and specialized workshops.
            Contact us to discuss your specific requirements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <div className="bg-red-600/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-red-600" size={28} />
            </div>
            <h3 className="font-bold mb-2">Enterprise Security</h3>
            <p className="text-sm text-gray-400">Advanced security features with dedicated infrastructure and compliance options.</p>
          </div>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <div className="bg-red-600/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Database className="text-red-600" size={28} />
            </div>
            <h3 className="font-bold mb-2">Custom Blockchain</h3>
            <p className="text-sm text-gray-400">Dedicated Hedera consensus nodes and custom token implementation for your business.</p>
          </div>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <div className="bg-red-600/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="text-red-600" size={28} />
            </div>
            <h3 className="font-bold mb-2">AI Development</h3>
            <p className="text-sm text-gray-400">Custom AI models trained specifically for your vehicle types and common issues.</p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-red-700 to-red-600 text-white px-8 py-3 rounded-md hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium">
            Contact Our Enterprise Team
          </button>
        </div>
      </div>

      {/* RevenueCat Paywall */}
      <RevenueCatPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        selectedTier={selectedTier}
      />
    </div>
  );
};

export default Pricing;