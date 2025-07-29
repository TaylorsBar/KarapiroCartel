import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Check, 
  X, 
  Tag, 
  Truck, 
  Clock, 
  Star, 
  Filter,
  Search,
  Grid,
  List,
  MapPin,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { PartsService } from '../services/partsService';
import { SupplierService } from '../services/supplierService';
import type { Part } from '../lib/supabase';

interface EnhancedMarketplaceProps {
  onBlockchainPayment: (amount: number) => void;
}

interface EnhancedPart extends Part {
  supplier?: {
    business_name: string;
    rating: number;
    location: string;
    verified: boolean;
    response_time: number;
  };
  inventory?: {
    quantity_available: number;
    condition: string;
    warranty_period: number;
  };
  shipping?: {
    estimated_days: number;
    cost: number;
    free_shipping_threshold: number;
  };
}

interface CartItem {
  part: EnhancedPart;
  quantity: number;
}

interface Filters {
  category: string;
  brand: string;
  priceRange: [number, number];
  condition: string;
  location: string;
  verified: boolean;
  inStock: boolean;
}

const EnhancedMarketplace: React.FC<EnhancedMarketplaceProps> = ({ onBlockchainPayment }) => {
  const [parts, setParts] = useState<EnhancedPart[]>([]);
  const [filteredParts, setFilteredParts] = useState<EnhancedPart[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'>('relevance');
  
  const [filters, setFilters] = useState<Filters>({
    category: '',
    brand: '',
    priceRange: [0, 10000],
    condition: '',
    location: '',
    verified: false,
    inStock: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [parts, filters, searchTerm, sortBy]);

  const loadParts = async () => {
    try {
      setLoading(true);
      
      // Load parts with enhanced data
      const partsData = await PartsService.getParts();
      
      // Enhance parts with supplier and inventory data
      const enhancedParts = await Promise.all(
        partsData.map(async (part) => {
          // Mock enhanced data - in production, this would come from joins or separate API calls
          const enhanced: EnhancedPart = {
            ...part,
            supplier: {
              business_name: `${part.brand} Official Store`,
              rating: 4.2 + Math.random() * 0.8,
              location: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'][Math.floor(Math.random() * 4)],
              verified: Math.random() > 0.3,
              response_time: Math.floor(Math.random() * 24) + 1
            },
            inventory: {
              quantity_available: part.stock_quantity,
              condition: ['new', 'refurbished', 'used'][Math.floor(Math.random() * 3)] as any,
              warranty_period: Math.floor(Math.random() * 24) + 6
            },
            shipping: {
              estimated_days: Math.floor(Math.random() * 5) + 1,
              cost: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 30) + 10,
              free_shipping_threshold: 100
            }
          };
          
          return enhanced;
        })
      );
      
      setParts(enhancedParts);
    } catch (error) {
      console.error('Error loading parts:', error);
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
            !part.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && part.category !== filters.category) return false;

      // Brand filter
      if (filters.brand && part.brand !== filters.brand) return false;

      // Price range filter
      if (part.price < filters.priceRange[0] || part.price > filters.priceRange[1]) return false;

      // Condition filter
      if (filters.condition && part.inventory?.condition !== filters.condition) return false;

      // Location filter
      if (filters.location && part.supplier?.location !== filters.location) return false;

      // Verified filter
      if (filters.verified && !part.supplier?.verified) return false;

      // In stock filter
      if (filters.inStock && part.stock_quantity <= 0) return false;

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.supplier?.rating || 0) - (a.supplier?.rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredParts(filtered);
  };

  const addToCart = (part: EnhancedPart, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.part.id === part.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.part.id === part.id 
            ? { ...item, quantity: item.quantity + quantity } 
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
    if (newQuantity < 1) return;
    
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
    return cart.reduce((total, item) => total + (item.part.shipping?.cost || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    onBlockchainPayment(calculateTotal());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        Enhanced Automotive Marketplace
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>

      {/* Search and Controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search parts, brands, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-md border transition-colors ${
                showFilters 
                  ? 'border-red-600 bg-red-600 text-white' 
                  : 'border-zinc-700 text-gray-400 hover:text-white'
              }`}
            >
              <Filter size={20} />
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            <div className="flex border border-zinc-700 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <FiltersPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            parts={parts}
          />
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Parts Grid/List */}
        <div className="xl:w-2/3">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-400">
              Showing {filteredParts.length} of {parts.length} parts
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParts.map(part => (
                <EnhancedPartCard 
                  key={part.id} 
                  part={part} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParts.map(part => (
                <EnhancedPartListItem 
                  key={part.id} 
                  part={part} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          )}

          {filteredParts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No parts found matching your criteria.</p>
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    brand: '',
                    priceRange: [0, 10000],
                    condition: '',
                    location: '',
                    verified: false,
                    inStock: true
                  });
                  setSearchTerm('');
                }}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Shopping Cart */}
        <div className="xl:w-1/3">
          <EnhancedShoppingCart
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
  );
};

// Enhanced Part Card Component
const EnhancedPartCard: React.FC<{
  part: EnhancedPart;
  onAddToCart: (part: EnhancedPart, quantity: number) => void;
}> = ({ part, onAddToCart }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 hover:border-red-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
          alt={part.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {part.blockchain_verified && (
            <span className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Shield size={10} className="mr-1" />
              Verified
            </span>
          )}
          {part.supplier?.verified && (
            <span className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Check size={10} className="mr-1" />
              Trusted
            </span>
          )}
          {part.shipping?.cost === 0 && (
            <span className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full">
              Free Ship
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="absolute top-2 right-2">
          {part.stock_quantity > 0 ? (
            <span className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full">
              {part.stock_quantity} in stock
            </span>
          ) : (
            <span className="bg-red-600/90 text-white text-xs px-2 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white mb-1">{part.name}</h3>
          <p className="text-red-500 text-sm font-medium uppercase">{part.brand}</p>
        </div>

        {/* Supplier Info */}
        <div className="mb-3 p-2 bg-zinc-800/50 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">{part.supplier?.business_name}</span>
            <div className="flex items-center">
              <Star size={12} className="text-yellow-500 mr-1" />
              <span className="text-xs text-gray-400">{part.supplier?.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center">
              <MapPin size={10} className="mr-1" />
              {part.supplier?.location}
            </span>
            <span className="flex items-center">
              <Clock size={10} className="mr-1" />
              {part.supplier?.response_time}h response
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center text-sm">
            <Tag size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-400">{part.category}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Truck size={14} className="text-gray-400 mr-2" />
            <span className="text-gray-400">
              {part.shipping?.estimated_days} days delivery
              {part.shipping?.cost === 0 ? ' (Free)' : ` ($${part.shipping?.cost})`}
            </span>
          </div>

          {part.inventory?.warranty_period && (
            <div className="flex items-center text-sm">
              <Shield size={14} className="text-gray-400 mr-2" />
              <span className="text-gray-400">{part.inventory.warranty_period} months warranty</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold">${part.price.toFixed(2)}</span>
            {part.inventory?.condition !== 'new' && (
              <span className="ml-2 text-xs bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded-full">
                {part.inventory.condition}
              </span>
            )}
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onAddToCart(part, 1)}
            disabled={part.stock_quantity === 0}
          >
            <ShoppingCart size={16} className="mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Part List Item Component
const EnhancedPartListItem: React.FC<{
  part: EnhancedPart;
  onAddToCart: (part: EnhancedPart, quantity: number) => void;
}> = ({ part, onAddToCart }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 hover:border-red-600 rounded-lg p-6 transition-all duration-300">
      <div className="flex gap-6">
        <div className="w-32 h-32 flex-shrink-0">
          <img 
            src={part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
            alt={part.name} 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold text-white">{part.name}</h3>
              <p className="text-red-500 font-medium">{part.brand}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${part.price.toFixed(2)}</div>
              <div className="flex items-center justify-end mt-1">
                <Star size={14} className="text-yellow-500 mr-1" />
                <span className="text-sm text-gray-400">{part.supplier?.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{part.description}</p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <span className="flex items-center text-gray-400">
              <Tag size={14} className="mr-1" />
              {part.category}
            </span>
            <span className="flex items-center text-gray-400">
              <MapPin size={14} className="mr-1" />
              {part.supplier?.location}
            </span>
            <span className="flex items-center text-gray-400">
              <Truck size={14} className="mr-1" />
              {part.shipping?.estimated_days} days delivery
            </span>
            <span className="flex items-center text-gray-400">
              <Shield size={14} className="mr-1" />
              {part.inventory?.warranty_period} months warranty
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {part.blockchain_verified && (
                <span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                  <Shield size={10} className="mr-1" />
                  Blockchain Verified
                </span>
              )}
              {part.supplier?.verified && (
                <span className="bg-blue-600/20 text-blue-500 px-2 py-1 rounded-full text-xs">
                  Trusted Supplier
                </span>
              )}
              {part.shipping?.cost === 0 && (
                <span className="bg-purple-600/20 text-purple-500 px-2 py-1 rounded-full text-xs">
                  Free Shipping
                </span>
              )}
            </div>
            
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center transition-colors duration-300 disabled:opacity-50"
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

// Filters Panel Component
const FiltersPanel: React.FC<{
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  parts: EnhancedPart[];
}> = ({ filters, onFiltersChange, parts }) => {
  const categories = [...new Set(parts.map(p => p.category))];
  const brands = [...new Set(parts.map(p => p.brand))];
  const locations = [...new Set(parts.map(p => p.supplier?.location).filter(Boolean))];

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
          <select
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Condition</label>
          <select
            value={filters.condition}
            onChange={(e) => onFiltersChange({ ...filters, condition: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFiltersChange({ ...filters, verified: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-400">Verified Suppliers Only</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-400">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

// Enhanced Shopping Cart Component
const EnhancedShoppingCart: React.FC<{
  cart: CartItem[];
  onRemove: (partId: string) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
  onCheckout: () => void;
  subtotal: number;
  shipping: number;
  total: number;
}> = ({ cart, onRemove, onUpdateQuantity, onCheckout, subtotal, shipping, total }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg shadow-lg sticky top-24">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Shopping Cart
          </h2>
          <span className="bg-red-600/20 text-red-500 text-sm px-2 py-1 rounded">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-2">Add some parts to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {cart.map(item => (
                <EnhancedCartItem 
                  key={item.part.id} 
                  item={item} 
                  onRemove={onRemove}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax (15%)</span>
                  <span>${(subtotal * 0.15).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-red-500">${(total * 1.15).toFixed(2)} NZD</span>
              </div>
              
              {subtotal < 100 && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
                onClick={onCheckout}
                disabled={cart.length === 0}
              >
                <Zap size={18} className="mr-2" />
                Pay with HBAR 🔗
              </button>
              
              <div className="mt-4 text-xs text-center text-gray-500">
                <p>✓ Secure blockchain payments</p>
                <p>✓ Parts authenticity guaranteed</p>
                <p>✓ 30-day return policy</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Enhanced Cart Item Component
const EnhancedCartItem: React.FC<{
  item: CartItem;
  onRemove: (partId: string) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
}> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-start space-x-4 p-3 bg-zinc-800/50 rounded-lg">
      <img 
        src={item.part.images?.[0] || 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600'} 
        alt={item.part.name} 
        className="w-16 h-16 object-cover rounded"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.part.name}</h4>
        <p className="text-xs text-red-500">{item.part.brand}</p>
        <p className="text-xs text-gray-400">{item.part.supplier?.business_name}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600 text-xs"
              onClick={() => onUpdateQuantity(item.part.id, item.quantity - 1)}
            >
              -
            </button>
            <span className="text-sm w-8 text-center">{item.quantity}</span>
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600 text-xs"
              onClick={() => onUpdateQuantity(item.part.id, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-sm font-medium">${(item.part.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      
      <button 
        className="text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => onRemove(item.part.id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default EnhancedMarketplace;