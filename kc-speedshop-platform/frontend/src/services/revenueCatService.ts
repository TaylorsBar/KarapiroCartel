// Placeholder RevenueCat Service - Works without actual RevenueCat setup
export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  rcPackage?: any; // Placeholder for actual package
}

export interface MockCustomerInfo {
  entitlements: {
    active: Record<string, any>;
  };
  activeSubscriptions: string[];
  allPurchaseDates: Record<string, string>;
}

export class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private mockCustomerInfo: MockCustomerInfo = {
    entitlements: { active: {} },
    activeSubscriptions: [],
    allPurchaseDates: {}
  };

  private constructor() {
    // Load mock subscription state from localStorage
    this.loadMockState();
  }

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(apiKey: string, userId?: string): Promise<void> {
    try {
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isInitialized = true;
      console.log('RevenueCat (Mock) initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat (Mock):', error);
      throw error;
    }
  }

  async getOfferings(): Promise<SubscriptionTier[]> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
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
    ];
  }

  async purchasePackage(tier: SubscriptionTier): Promise<MockCustomerInfo> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful purchase
    this.mockCustomerInfo.entitlements.active[tier.id] = {
      identifier: tier.id,
      isActive: true,
      willRenew: true,
      periodType: 'NORMAL',
      latestPurchaseDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    this.mockCustomerInfo.activeSubscriptions = [tier.id];
    this.mockCustomerInfo.allPurchaseDates[tier.id] = new Date().toISOString();

    this.saveMockState();
    return this.mockCustomerInfo;
  }

  async restorePurchases(): Promise<MockCustomerInfo> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, restore a professional subscription if none exists
    if (Object.keys(this.mockCustomerInfo.entitlements.active).length === 0) {
      this.mockCustomerInfo.entitlements.active['professional'] = {
        identifier: 'professional',
        isActive: true,
        willRenew: true,
        periodType: 'NORMAL',
        latestPurchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        expirationDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString() // 23 days from now
      };
      this.mockCustomerInfo.activeSubscriptions = ['professional'];
      this.saveMockState();
    }

    return this.mockCustomerInfo;
  }

  async getCustomerInfo(): Promise<MockCustomerInfo> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockCustomerInfo;
  }

  async identifyUser(userId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Simulate user identification
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`User identified: ${userId}`);
  }

  async logOut(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat not initialized');
    }

    // Clear mock state on logout
    this.mockCustomerInfo = {
      entitlements: { active: {} },
      activeSubscriptions: [],
      allPurchaseDates: {}
    };
    this.saveMockState();
  }

  getActiveSubscriptions(customerInfo: MockCustomerInfo): string[] {
    return customerInfo.activeSubscriptions || [];
  }

  hasActiveSubscription(customerInfo: MockCustomerInfo, entitlementId: string): boolean {
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  }

  // Mock state persistence
  private loadMockState(): void {
    try {
      const saved = localStorage.getItem('karapiro_mock_subscription');
      if (saved) {
        this.mockCustomerInfo = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load mock subscription state:', error);
    }
  }

  private saveMockState(): void {
    try {
      localStorage.setItem('karapiro_mock_subscription', JSON.stringify(this.mockCustomerInfo));
    } catch (error) {
      console.warn('Failed to save mock subscription state:', error);
    }
  }

  // Demo methods for testing
  async simulateSubscription(tierId: string): Promise<void> {
    const tiers = await this.getOfferings();
    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      await this.purchasePackage(tier);
    }
  }

  async clearSubscriptions(): Promise<void> {
    this.mockCustomerInfo = {
      entitlements: { active: {} },
      activeSubscriptions: [],
      allPurchaseDates: {}
    };
    this.saveMockState();
  }
}

export const revenueCatService = RevenueCatService.getInstance();