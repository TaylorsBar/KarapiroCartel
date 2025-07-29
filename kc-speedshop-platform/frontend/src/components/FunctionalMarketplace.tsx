import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Grid, List, Star, Shield, Truck, Heart, Eye, ChevronDown, X, Plus, Minus, CheckCircle, Tag, Clock, MapPin, Zap, Settings, PenTool as Tool } from 'lucide-react';
import { PartsService } from '../services/partsService';
import { useAuth } from '../hooks/useAuth';
import type { Part } from '../lib/supabase';

interface FunctionalMarketplaceProps {
  onBlockchainPayment: (amount: number) => void;
}

interface CartItem {
  part: Part;
  quantity: number;
}

interface Filters {
  category: string;
  brand: string;
  priceRange: [number, number];
  compatibility: string;
  inStock: boolean;
  verified: boolean;
}

const FunctionalMarketplace: React.FC<FunctionalMarketplaceProps> = ({ onBlockchainPayment }) => {
  const { user } = useAuth();
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [compatibleVehicles, setCompatibleVehicles] = useState<string[]>([]);
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showPartDetails, setShowPartDetails] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    category: '',
    brand: '',
    priceRange: [0, 5000],
    compatibility: '',
    inStock: true,
    verified: false
  });

  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'newest'>('relevance');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [parts, filters, searchTerm, sortBy]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [partsData, categoriesData, brandsData, vehiclesData, featuredData] = await Promise.all([
        PartsService.getParts(),
        PartsService.getCategories(),
        PartsService.getBrands(),
        PartsService.getCompatibleVehicles(),
        PartsService.getFeaturedParts(6)
      ]);
      
      setParts(partsData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setCompatibleVehicles(vehiclesData);
      setFeaturedParts(featuredData);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPartsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const categoryParts = await PartsService.getPartsByCategory(category);
      setParts(categoryParts);
      setSelectedCategory(category);
      setFilters({...filters, category});
    } catch (error) {
      console.error('Error loading parts by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = parts.filter(part => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!part.name.toLowerCase().includes(searchLower) &&
            !part.brand.toLowerCase().includes(searchLower) &&
            !part.description?.toLowerCase().includes(searchLower) &&
            !part.part_number?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && part.category !== filters.category) return false;

      // Brand filter
      if (filters.brand && part.brand !== filters.brand) return false;

      // Price range filter
      if (part.price < filters.priceRange[0] || part.price > filters.priceRange[1]) return false;

      // Compatibility filter
      if (filters.compatibility && !part.compatibility.includes(filters.compatibility)) return false;

      // In stock filter
      if (filters.inStock && part.stock_quantity <= 0) return false;

      // Verified filter
      if (filters.verified && !part.blockchain_verified) return false;

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredParts(filtered);
  };

  const addToCart = (part: Part, quantity: number = 1) => {
    if (part.stock_quantity < quantity) {
      alert('Not enough stock available');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.part.id === part.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > part.stock_quantity) {
          alert('Not enough stock available');
          return prevCart;
        }
        return prevCart.map(item => 
          item.part.id === part.id 
            ? { ...item, quantity: newQuantity } 
            : item
        );
      } else {
        return [...prevCart, { part, quantity }];
      }
    });
  };

  const removeFromCart = (partId: string) => {
    setCart(prevCart => prevCart.filter(item => item.part.id !== partId));
  };

  const updateQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(partId);
      return;
    }
    
    const part = parts.find(p => p.id === partId);
    if (part && newQuantity > part.stock_quantity) {
      alert('Not enough stock available');
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.part.id === partId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 100) return 0; // Free shipping over $100
    return 15.99; // Flat rate shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in to complete your purchase');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      // Group items by seller
      const itemsBySeller = cart.reduce((acc, item) => {
        const sellerId = item.part.seller_id;
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push({
          part_id: item.part.id,
          quantity: item.quantity,
          unit_price: item.part.price
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Create orders for each seller
      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        await PartsService.createOrder({
          seller_id: sellerId,
          items,
          shipping_address: {
            street: '123 Main St',
            city: 'Auckland',
            state: 'Auckland',
            zip: '1010',
            country: 'New Zealand'
          },
          payment_method: 'hbar'
        });
      }

      // Trigger blockchain payment
      onBlockchainPayment(calculateTotal());
      
      // Clear cart
      setCart([]);
      
      // Refresh parts data to update stock
      await loadInitialData();
      
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg text-white flex items-center justify-center relative overflow-hidden">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        <div className="text-center glass-card p-8 rounded-xl depth-3">
          <div className="animate-spin w-16 h-16 border-4 border-champagne border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-luxury text-xl">Loading Premium Parts Database...</p>
          <p className="text-gray-400 mt-2">Connecting to live inventory systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-8 relative depth-2">
        <h1 className="text-4xl font-bold text-center text-luxury uppercase tracking-wider mb-4 relative">
          ULTRA-PREMIUM SPEED SHOP
          <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-champagne to-transparent"></div>
        </h1>
        <p className="text-center text-gray-300 mb-12 text-lg">Comprehensive Performance Parts Catalog with Blockchain Verification</p>

        {/* Featured Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-luxury mb-6">Shop By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(category => (
              <button 
                key={category}
                onClick={() => loadPartsByCategory(category)}
                className={`glass-card p-6 rounded-xl text-center glass-hover ${
                  selectedCategory === category ? 'border-champagne bg-champagne/20' : ''
                }`}
              >
                <div className="mb-3">
                  {category === 'Engine' && <Zap size={32} className="mx-auto text-champagne" />}
                  {category === 'Suspension' && <Settings size={32} className="mx-auto text-champagne" />}
                  {category === 'Brakes' && <Tool size={32} className="mx-auto text-champagne" />}
                  {category === 'Exhaust' && <Truck size={32} className="mx-auto text-champagne" />}
                  {category === 'Exterior' && <Eye size={32} className="mx-auto text-champagne" />}
                  {category === 'Wheels' && <Clock size={32} className="mx-auto text-champagne" />}
                  {!['Engine', 'Suspension', 'Brakes', 'Exhaust', 'Exterior', 'Wheels'].includes(category) && 
                    <Tag size={32} className="mx-auto text-champagne" />
                  }
                </div>
                <span className="text-white font-medium">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        {!selectedCategory && !searchTerm && !filters.brand && !filters.compatibility && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-luxury mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredParts.map(part => (
                <PartCard 
                  key={part.id} 
                  part={part} 
                  onAddToCart={addToCart}
                  onViewDetails={() => setShowPartDetails(part.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Premium Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Luxury Search Bar */}
            <div className="flex-1 relative">
              <div className="glass-card rounded-xl p-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-champagne" size={20} />
                  <input
                    type="text"
                    placeholder="Search premium automotive parts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Premium Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-luxury px-6 py-4 rounded-xl transition-all duration-300 ${
                  showFilters ? 'bg-champagne/20 border-champagne' : ''
                }`}
              >
                <Filter size={20} />
              </button>
              
              <div className="glass-card rounded-xl p-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-6 py-4 bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="relevance" className="bg-black">Sort by Relevance</option>
                  <option value="price_low" className="bg-black">Price: Low to High</option>
                  <option value="price_high" className="bg-black">Price: High to Low</option>
                  <option value="newest" className="bg-black">Newest First</option>
                </select>
              </div>

              <div className="glass-card rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-4 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-champagne/20 text-champagne' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-4 rounded-lg transition-all ${viewMode === 'list' ? 'bg-champagne/20 text-champagne' : 'text-gray-400 hover:text-white'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Premium Filters Panel */}
          {showFilters && (
            <div className="glass-card rounded-xl p-8 mb-8 depth-1">
              <FiltersPanel 
                filters={filters} 
                onFiltersChange={setFilters}
                categories={categories}
                brands={brands}
                compatibleVehicles={compatibleVehicles}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Premium Parts Grid/List */}
          <div className="xl:w-2/3">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-300 text-lg">
                Showing <span className="text-champagne font-bold">{filteredParts.length}</span> of <span className="text-champagne font-bold">{parts.length}</span> premium parts
                {selectedCategory && <span> in <span className="text-champagne font-bold">{selectedCategory}</span></span>}
              </p>
              {selectedCategory && (
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setFilters({...filters, category: ''});
                    loadInitialData();
                  }}
                  className="text-champagne hover:text-champagne-light text-sm"
                >
                  Clear Category Filter
                </button>
              )}
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredParts.map(part => (
                  <PartCard 
                    key={part.id} 
                    part={part} 
                    onAddToCart={addToCart}
                    onViewDetails={() => setShowPartDetails(part.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredParts.map(part => (
                  <PartListItem 
                    key={part.id} 
                    part={part} 
                    onAddToCart={addToCart}
                    onViewDetails={() => setShowPartDetails(part.id)}
                  />
                ))}
              </div>
            )}

            {filteredParts.length === 0 && (
              <div className="text-center py-16">
                <div className="glass-card rounded-xl p-12 max-w-md mx-auto">
                  <p className="text-gray-300 text-xl mb-6">No premium parts found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        brand: '',
                        priceRange: [0, 5000],
                        compatibility: '',
                        inStock: true,
                        verified: false
                      });
                      setSearchTerm('');
                      setSelectedCategory('');
                      loadInitialData();
                    }}
                    className="btn-luxury px-8 py-3 rounded-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Shopping Cart */}
          <div className="xl:w-1/3">
            <CartComponent
              cart={cart}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onCheckout={handleCheckout}
              subtotal={calculateSubtotal()}
              shipping={calculateShipping()}
              total={calculateTotal()}
            />
          </div>
        </div>
      </div>

      {/* Part Details Modal */}
      {showPartDetails && (
        <PartDetailsModal 
          partId={showPartDetails} 
          onClose={() => setShowPartDetails(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

// Premium Part Card Component
const PartCard: React.FC<{
  part: Part;
  onAddToCart: (part: Part, quantity: number) => void;
  onViewDetails: () => void;
}> = ({ part, onAddToCart, onViewDetails }) => {
  return (
    <div className="glass-marketplace-card rounded-xl overflow-hidden glass-hover float-element">
      <div className="h-56 overflow-hidden relative">
        <img 
          src={part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
          alt={part.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        
        {/* Premium Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {part.blockchain_verified && (
            <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-green-400 flex items-center">
              <Shield size={12} className="mr-1" />
              Verified
            </span>
          )}
          {part.stock_quantity > 0 && (
            <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-blue-400">
              {part.stock_quantity} in stock
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button 
          onClick={onViewDetails}
          className="absolute bottom-4 right-4 glass-card p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Eye size={18} className="text-white" />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2 text-glow">{part.name}</h3>
          <p className="text-champagne text-sm font-medium uppercase tracking-wider">{part.brand}</p>
          {part.part_number && (
            <p className="text-gray-400 text-xs mt-1">Part #: {part.part_number}</p>
          )}
        </div>

        <div className="mb-4">
          <span className="glass-card px-3 py-1 rounded-full text-xs text-gray-300">{part.category}</span>
        </div>

        {part.compatibility.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Compatible with:</p>
            <div className="flex flex-wrap gap-1">
              {part.compatibility.slice(0, 2).map((vehicle, index) => (
                <span key={index} className="text-xs bg-champagne/20 text-champagne px-2 py-1 rounded-full">
                  {vehicle}
                </span>
              ))}
              {part.compatibility.length > 2 && (
                <span className="text-xs text-gray-500">+{part.compatibility.length - 2} more</span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-luxury">${part.price.toFixed(2)}</span>
            <span className="text-sm text-gray-400 ml-1">{part.currency}</span>
          </div>
          <button
            className="btn-luxury px-6 py-3 rounded-xl text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onAddToCart(part, 1)}
            disabled={part.stock_quantity === 0}
          >
            <ShoppingCart size={16} className="mr-2" />
            {part.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Premium Part List Item Component
const PartListItem: React.FC<{
  part: Part;
  onAddToCart: (part: Part, quantity: number) => void;
  onViewDetails: () => void;
}> = ({ part, onAddToCart, onViewDetails }) => {
  return (
    <div className="glass-marketplace-card rounded-xl p-8 glass-hover">
      <div className="flex gap-8">
        <div className="w-40 h-40 flex-shrink-0 relative">
          <img 
            src={part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
            alt={part.name} 
            className="w-full h-full object-cover rounded-lg"
          />
          <button 
            onClick={onViewDetails}
            className="absolute bottom-2 right-2 glass-card p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Eye size={16} className="text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white text-glow">{part.name}</h3>
              <p className="text-champagne font-medium text-lg">{part.brand}</p>
              {part.part_number && (
                <p className="text-gray-400 text-sm">Part #: {part.part_number}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-luxury">${part.price.toFixed(2)}</div>
              <div className="text-sm text-gray-400">{part.currency}</div>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{part.description}</p>

          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="glass-card px-3 py-1 rounded-full text-gray-300">{part.category}</span>
            <span className="text-gray-400">Stock: {part.stock_quantity}</span>
            {part.blockchain_verified && (
              <span className="flex items-center text-green-400">
                <Shield size={14} className="mr-1" />
                Blockchain Verified
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {part.compatibility.slice(0, 3).map((vehicle, index) => (
                <span key={index} className="bg-champagne/20 text-champagne px-3 py-1 rounded-full text-xs">
                  {vehicle}
                </span>
              ))}
              {part.compatibility.length > 3 && (
                <span className="text-xs text-gray-500 px-3 py-1">+{part.compatibility.length - 3} more</span>
              )}
            </div>
            
            <button
              className="btn-luxury px-8 py-3 rounded-xl flex items-center disabled:opacity-50"
              onClick={() => onAddToCart(part, 1)}
              disabled={part.stock_quantity === 0}
            >
              <ShoppingCart size={16} className="mr-2" />
              {part.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Filters Panel Component
const FiltersPanel: React.FC<{
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
  brands: string[];
  compatibleVehicles: string[];
}> = ({ filters, onFiltersChange, categories, brands, compatibleVehicles }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-luxury mb-6">Premium Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
          <div className="glass-card rounded-lg p-1">
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
            >
              <option value="" className="bg-black">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-black">{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Brand</label>
          <div className="glass-card rounded-lg p-1">
            <select
              value={filters.brand}
              onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
              className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
            >
              <option value="" className="bg-black">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand} className="bg-black">{brand}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Compatible Vehicle</label>
          <div className="glass-card rounded-lg p-1">
            <select
              value={filters.compatibility}
              onChange={(e) => onFiltersChange({ ...filters, compatibility: e.target.value })}
              className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
            >
              <option value="" className="bg-black">All Vehicles</option>
              {compatibleVehicles.map(vehicle => (
                <option key={vehicle} value={vehicle} className="bg-black">{vehicle}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Price Range</label>
          <div className="flex gap-3">
            <div className="glass-card rounded-lg p-1 flex-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
                })}
                className="w-full px-3 py-3 bg-transparent text-white focus:outline-none"
              />
            </div>
            <div className="glass-card rounded-lg p-1 flex-1">
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  priceRange: [filters.priceRange[0], parseInt(e.target.value) || 5000] 
                })}
                className="w-full px-3 py-3 bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-6">
        <label className="flex items-center glass-card px-4 py-2 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFiltersChange({ ...filters, verified: e.target.checked })}
            className="mr-3 accent-champagne"
          />
          <span className="text-sm text-gray-300">Blockchain Verified Only</span>
        </label>
        
        <label className="flex items-center glass-card px-4 py-2 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.checked })}
            className="mr-3 accent-champagne"
          />
          <span className="text-sm text-gray-300">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

// Premium Shopping Cart Component
const CartComponent: React.FC<{
  cart: CartItem[];
  onRemove: (partId: string) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
  onCheckout: () => void;
  subtotal: number;
  shipping: number;
  total: number;
}> = ({ cart, onRemove, onUpdateQuantity, onCheckout, subtotal, shipping, total }) => {
  return (
    <div className="glass-cart rounded-xl shadow-2xl sticky top-24 depth-3">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-luxury flex items-center">
            <ShoppingCart className="mr-3" size={24} />
            Premium Cart
          </h2>
          <span className="glass-card px-4 py-2 rounded-full text-sm text-champagne font-medium">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card rounded-xl p-8">
              <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <p className="text-gray-300 text-lg mb-2">Your premium cart is empty</p>
              <p className="text-sm text-gray-500">Add some luxury automotive parts to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {cart.map(item => (
                <CartItem 
                  key={item.part.id} 
                  item={item} 
                  onRemove={onRemove}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-300">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-400' : 'text-white'}`}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-300">Tax (15%)</span>
                  <span className="text-white font-medium">${(subtotal * 0.15).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-2xl font-bold mb-8 pt-4 border-t border-gray-700">
                <span className="text-white">Total</span>
                <span className="text-luxury">${(total * 1.15).toFixed(2)} NZD</span>
              </div>
              
              {subtotal < 100 && (
                <div className="mb-6 glass-card p-4 rounded-lg">
                  <p className="text-blue-400 text-sm mb-3">
                    Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for free shipping!
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                className="w-full btn-luxury py-4 rounded-xl text-lg flex items-center justify-center font-medium"
                onClick={onCheckout}
                disabled={cart.length === 0}
              >
                <CheckCircle size={20} className="mr-3" />
                Complete Premium Purchase
              </button>
              
              <div className="mt-6 text-xs text-center text-gray-400 space-y-1">
                <p>✓ Secure blockchain payments with HBAR</p>
                <p>✓ Parts authenticity guaranteed</p>
                <p>✓ 30-day premium return policy</p>
                <p>✓ White-glove delivery service</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Premium Cart Item Component
const CartItem: React.FC<{
  item: CartItem;
  onRemove: (partId: string) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
}> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-start space-x-4">
        <img 
          src={item.part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
          alt={item.part.name} 
          className="w-20 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium text-white truncate">{item.part.name}</h4>
          <p className="text-sm text-champagne">{item.part.brand}</p>
          <p className="text-xs text-gray-400">Stock: {item.part.stock_quantity}</p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button 
                className="glass-card w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => onUpdateQuantity(item.part.id, item.quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
              <button 
                className="glass-card w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => onUpdateQuantity(item.part.id, item.quantity + 1)}
                disabled={item.quantity >= item.part.stock_quantity}
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-lg font-bold text-luxury">${(item.part.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          className="text-gray-400 hover:text-red-400 transition-colors p-2"
          onClick={() => onRemove(item.part.id)}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Part Details Modal
const PartDetailsModal: React.FC<{
  partId: string;
  onClose: () => void;
  onAddToCart: (part: Part, quantity: number) => void;
}> = ({ partId, onClose, onAddToCart }) => {
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedParts, setRelatedParts] = useState<Part[]>([]);
  
  useEffect(() => {
    const loadPartDetails = async () => {
      try {
        setLoading(true);
        const partData = await PartsService.getPartById(partId);
        setPart(partData);
        
        if (partData) {
          const related = await PartsService.getRelatedParts(partId, partData.category);
          setRelatedParts(related);
        }
      } catch (error) {
        console.error('Error loading part details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPartDetails();
  }, [partId]);
  
  if (loading || !part) {
    return (
      <div className="fixed inset-0 glass-modal flex items-center justify-center z-50">
        <div className="glass-modal-content rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-champagne border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading part details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 glass-modal flex items-center justify-center z-50">
      <div className="glass-modal-content rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-bold text-luxury">{part.name}</h2>
            <button 
              onClick={onClose}
              className="glass-card p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="glass-card rounded-xl overflow-hidden mb-4">
                <img 
                  src={part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                  alt={part.name} 
                  className="w-full h-64 object-cover"
                />
              </div>
              
              {part.images && part.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {part.images.map((img, index) => (
                    <div key={index} className="glass-card rounded-lg overflow-hidden w-20 h-20 flex-shrink-0">
                      <img src={img} alt={`${part.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <span className="text-champagne text-xl font-medium uppercase tracking-wider mr-4">{part.brand}</span>
                {part.blockchain_verified && (
                  <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-green-400 flex items-center">
                    <Shield size={12} className="mr-1" />
                    Blockchain Verified
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <div className="text-3xl font-bold text-luxury mb-2">${part.price.toFixed(2)}</div>
                <div className="flex items-center">
                  <span className={`text-sm ${part.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {part.stock_quantity > 0 ? `${part.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                  <span className="mx-2 text-gray-500">|</span>
                  <span className="text-sm text-gray-400">Part #: {part.part_number || 'N/A'}</span>
                </div>
              </div>
              
              <div className="glass-card rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Description</h3>
                <p className="text-gray-300">{part.description}</p>
              </div>
              
              {part.compatibility.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Compatible Vehicles</h3>
                  <div className="flex flex-wrap gap-2">
                    {part.compatibility.map((vehicle, index) => (
                      <span key={index} className="glass-card px-3 py-1 rounded-lg text-sm text-champagne">
                        {vehicle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {part.specifications && Object.keys(part.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Specifications</h3>
                  <div className="glass-card rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(part.specifications).map(([key, value]) => (
                          <tr key={key} className="border-b border-gray-700 last:border-0">
                            <td className="py-2 text-gray-400 capitalize">{key.replace(/_/g, ' ')}</td>
                            <td className="py-2 text-white text-right">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="glass-card rounded-lg p-1 flex items-center">
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-lg font-medium">{quantity}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={() => setQuantity(Math.min(part.stock_quantity, quantity + 1))}
                    disabled={quantity >= part.stock_quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <button
                  className="flex-1 btn-luxury py-4 rounded-xl text-lg flex items-center justify-center font-medium"
                  onClick={() => {
                    onAddToCart(part, quantity);
                    onClose();
                  }}
                  disabled={part.stock_quantity === 0}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {part.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
          
          {relatedParts.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-luxury mb-6">Related Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedParts.map(relatedPart => (
                  <div key={relatedPart.id} className="glass-card rounded-lg p-4">
                    <div className="flex gap-4">
                      <img 
                        src={relatedPart.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                        alt={relatedPart.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="text-white font-medium">{relatedPart.name}</h4>
                        <p className="text-champagne text-sm">{relatedPart.brand}</p>
                        <p className="text-luxury font-bold mt-1">${relatedPart.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunctionalMarketplace;