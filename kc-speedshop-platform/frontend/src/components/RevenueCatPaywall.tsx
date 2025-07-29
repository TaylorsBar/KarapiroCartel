import React, { useState } from 'react';
import { X, Crown, Zap, Shield, Star, CheckCircle, Loader2, Play, RotateCcw } from 'lucide-react';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { SubscriptionTier } from '../services/revenueCatService';

interface RevenueCatPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: string;
}

const RevenueCatPaywall: React.FC<RevenueCatPaywallProps> = ({
  isOpen,
  onClose,
  selectedTier
}) => {
  const { 
    offerings, 
    loading, 
    purchaseSubscription, 
    restorePurchases, 
    getCurrentTier,
    simulateSubscription,
    clearSubscriptions
  } = useRevenueCat();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const currentTier = getCurrentTier();

  if (!isOpen) return null;

  const handlePurchase = async (tier: SubscriptionTier) => {
    try {
      setPurchasing(tier.id);
      await purchaseSubscription(tier);
      alert(`Successfully subscribed to ${tier.name}! 🎉`);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase simulation completed! In a real app, this would process payment.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleSimulate = async (tierId: string) => {
    try {
      setSimulating(tierId);
      await simulateSubscription(tierId);
      alert(`Demo: Simulated subscription to ${tierId}! 🎭`);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulating(null);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await clearSubscriptions();
      alert('Demo: All subscriptions cleared! 🧹');
    } catch (error) {
      console.error('Clear failed:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await restorePurchases();
      alert('Demo: Purchases restored! (Simulated Professional subscription) 📱');
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Demo: No purchases found to restore.');
    } finally {
      setRestoring(false);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'starter':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'professional':
        return <Crown className="w-8 h-8 text-amber-500" />;
      case 'enterprise':
        return <Shield className="w-8 h-8 text-purple-500" />;
      default:
        return <Star className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTierGradient = (tierId: string) => {
    switch (tierId) {
      case 'starter':
        return 'from-blue-600 to-blue-700';
      case 'professional':
        return 'from-amber-600 to-amber-700';
      case 'enterprise':
        return 'from-purple-600 to-purple-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-600/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <div>
            <h2 className="text-2xl font-bold text-red-600">Upgrade Your Experience</h2>
            <p className="text-gray-400 mt-1">Choose the perfect plan for your automotive needs</p>
            <div className="mt-2 bg-amber-900/20 border border-amber-600/30 rounded-lg px-3 py-1 inline-block">
              <span className="text-amber-400 text-xs font-medium">🎭 DEMO MODE - No real payments processed</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Current Tier Display */}
        {currentTier !== 'free' && (
          <div className="p-6 bg-green-900/20 border-b border-zinc-700">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 font-medium">
                Currently subscribed to {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan
              </span>
            </div>
          </div>
        )}

        {/* Demo Controls */}
        <div className="p-6 bg-zinc-800/50 border-b border-zinc-700">
          <h3 className="text-lg font-semibold text-white mb-4">🎮 Demo Controls</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Simulate Restore</span>
            </button>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-400">Loading subscription options...</p>
          </div>
        )}

        {/* Subscription Tiers */}
        {!loading && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offerings.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative bg-gradient-to-br from-zinc-900 to-black border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-xl ${
                    tier.isPopular 
                      ? 'border-red-600 shadow-lg shadow-red-600/20 scale-105' 
                      : 'border-zinc-700 hover:border-red-600/50'
                  } ${
                    selectedTier === tier.id ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-4 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {getTierIcon(tier.id)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-red-500 mb-1">{tier.price}</div>
                    <p className="text-gray-400 text-sm">per month</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Main Purchase Button */}
                    <button
                      onClick={() => handlePurchase(tier)}
                      disabled={purchasing === tier.id || currentTier === tier.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                        currentTier === tier.id
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : `bg-gradient-to-r ${getTierGradient(tier.id)} text-white hover:shadow-lg hover:shadow-red-600/30`
                      }`}
                    >
                      {purchasing === tier.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : currentTier === tier.id ? (
                        'Current Plan'
                      ) : (
                        `Subscribe to ${tier.name}`
                      )}
                    </button>

                    {/* Demo Simulate Button */}
                    <button
                      onClick={() => handleSimulate(tier.id)}
                      disabled={simulating === tier.id || currentTier === tier.id}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 bg-zinc-700 hover:bg-zinc-600 text-gray-300 text-sm"
                    >
                      {simulating === tier.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Simulating...</span>
                        </div>
                      ) : (
                        `🎭 Demo: Simulate ${tier.name}`
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Features Comparison */}
            <div className="mt-12 bg-zinc-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Why Choose Karapiro Cartel?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">AI-Powered Diagnostics</h4>
                  <p className="text-gray-400 text-sm">Advanced X.AI Grok integration for accurate vehicle diagnostics</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Blockchain Security</h4>
                  <p className="text-gray-400 text-sm">Hedera Hashgraph ensures secure, verified transactions</p>
                </div>
                <div className="text-center">
                  <Crown className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">VIP Workshop Access</h4>
                  <p className="text-gray-400 text-sm">Professional-grade equipment and self-service bays</p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p className="mb-2 bg-amber-900/20 border border-amber-600/30 rounded-lg px-4 py-2 text-amber-400">
                🎭 This is a demo implementation. No real payments are processed.
              </p>
              <p>In production: Subscriptions auto-renew monthly. Cancel anytime in your account settings.</p>
              <p className="mt-1">
                By subscribing, you agree to our{' '}
                <a href="#" className="text-red-500 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-red-500 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueCatPaywall;