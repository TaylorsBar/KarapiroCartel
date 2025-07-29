import { useState, useEffect } from 'react';
import { revenueCatService, SubscriptionTier, MockCustomerInfo } from '../services/revenueCatService';
import { useAuth } from './useAuth';

export function useRevenueCat() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [offerings, setOfferings] = useState<SubscriptionTier[]>([]);
  const [customerInfo, setCustomerInfo] = useState<MockCustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeRevenueCat();
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize with placeholder API key
      const apiKey = 'mock_api_key_for_development';
      await revenueCatService.initialize(apiKey, user?.id);
      
      setIsInitialized(true);

      // Get offerings and customer info
      const [offeringsData, customerData] = await Promise.all([
        revenueCatService.getOfferings(),
        revenueCatService.getCustomerInfo()
      ]);

      setOfferings(offeringsData);
      setCustomerInfo(customerData);
    } catch (err) {
      console.error('RevenueCat initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize RevenueCat');
      
      // Fallback to basic offerings even if initialization fails
      setOfferings([
        {
          id: 'starter',
          name: 'Starter',
          price: '$99/month',
          features: [
            'Up to 50 diagnostic scans per month',
            'Basic AI diagnostic interpretations',
            'Blockchain verification for parts',
            'Marketplace access',
            'Email support'
          ]
        },
        {
          id: 'professional',
          name: 'Professional',
          price: '$249/month',
          features: [
            'Unlimited diagnostic scans',
            'Advanced AI diagnostic interpretations',
            'Blockchain verification for all transactions',
            'Marketplace with preferred listing',
            'Priority support with 24-hour response',
            'Customer management tools',
            'Basic analytics dashboard'
          ],
          isPopular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: '$599/month',
          features: [
            'Everything in Professional plan',
            'Multi-location support',
            'Advanced analytics and reporting',
            'Custom blockchain smart contracts',
            'Dedicated account manager',
            'API access for custom integrations',
            'White-label options available'
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const purchaseSubscription = async (tier: SubscriptionTier) => {
    try {
      setLoading(true);
      const customerData = await revenueCatService.purchasePackage(tier);
      setCustomerInfo(customerData);
      return customerData;
    } catch (err) {
      console.error('Purchase error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      const customerData = await revenueCatService.restorePurchases();
      setCustomerInfo(customerData);
      return customerData;
    } catch (err) {
      console.error('Restore error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveSubscriptions = () => {
    if (!customerInfo) return [];
    return revenueCatService.getActiveSubscriptions(customerInfo);
  };

  const hasActiveSubscription = (entitlementId?: string) => {
    if (!customerInfo) return false;
    if (!entitlementId) {
      return getActiveSubscriptions().length > 0;
    }
    return revenueCatService.hasActiveSubscription(customerInfo, entitlementId);
  };

  const getCurrentTier = (): string => {
    if (!customerInfo) return 'free';
    
    const activeSubscriptions = getActiveSubscriptions();
    
    if (activeSubscriptions.includes('enterprise')) return 'enterprise';
    if (activeSubscriptions.includes('professional')) return 'professional';
    if (activeSubscriptions.includes('starter')) return 'starter';
    
    return 'free';
  };

  // Demo functions for testing
  const simulateSubscription = async (tierId: string) => {
    try {
      setLoading(true);
      await revenueCatService.simulateSubscription(tierId);
      const customerData = await revenueCatService.getCustomerInfo();
      setCustomerInfo(customerData);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSubscriptions = async () => {
    try {
      setLoading(true);
      await revenueCatService.clearSubscriptions();
      const customerData = await revenueCatService.getCustomerInfo();
      setCustomerInfo(customerData);
    } catch (err) {
      console.error('Clear error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isInitialized,
    offerings,
    customerInfo,
    loading,
    error,
    purchaseSubscription,
    restorePurchases,
    getActiveSubscriptions,
    hasActiveSubscription,
    getCurrentTier,
    refreshCustomerInfo: () => revenueCatService.getCustomerInfo().then(setCustomerInfo),
    // Demo functions
    simulateSubscription,
    clearSubscriptions
  };
}