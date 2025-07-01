import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Grid,
  List,
  Star,
  Shield,
  Truck,
  Heart,
  Eye,
  ChevronDown,
  X,
  Plus,
  Minus,
  CheckCircle
} from 'lucide-react';
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
      
      const [partsData, categoriesData, brandsData, vehiclesData] = await Promise.all([
        PartsService.getParts(),
        PartsService.getCategories(),
        PartsService.getBrands(),
        PartsService.getCompatibleVehicles()
      ]);
      
      setParts(partsData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setCompatibleVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading automotive parts database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        Live Automotive Parts Database
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
              placeholder="Search parts, brands, part numbers..."
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
            categories={categories}
            brands={brands}
            compatibleVehicles={compatibleVehicles}
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
                <PartCard 
                  key={part.id} 
                  part={part} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParts.map(part => (
                <PartListItem 
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
                    priceRange: [0, 5000],
                    compatibility: '',
                    inStock: true,
                    verified: false
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

        {/* Shopping Cart */}
        <div className="xl:w-1/3">
          <ShoppingCart
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

// Part Card Component
const PartCard: React.FC<{
  part: Part;
  onAddToCart: (part: Part, quantity: number) => void;
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
          {part.stock_quantity > 0 && (
            <span className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">
              {part.stock_quantity} in stock
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white mb-1">{part.name}</h3>
          <p className="text-red-500 text-sm font-medium uppercase">{part.brand}</p>
          {part.part_number && (
            <p className="text-gray-400 text-xs">Part #: {part.part_number}</p>
          )}
        </div>

        <div className="mb-3">
          <span className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded">{part.category}</span>
        </div>

        {part.compatibility.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">Compatible with:</p>
            <div className="flex flex-wrap gap-1">
              {part.compatibility.slice(0, 2).map((vehicle, index) => (
                <span key={index} className="text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded">
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
            <span className="text-2xl font-bold">${part.price.toFixed(2)}</span>
            <span className="text-sm text-gray-400 ml-1">{part.currency}</span>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onAddToCart(part, 1)}
            disabled={part.stock_quantity === 0}
          >
            <ShoppingCart size={16} className="mr-1" />
            {part.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Part List Item Component
const PartListItem: React.FC<{
  part: Part;
  onAddToCart: (part: Part, quantity: number) => void;
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
              {part.part_number && (
                <p className="text-gray-400 text-sm">Part #: {part.part_number}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${part.price.toFixed(2)}</div>
              <div className="text-sm text-gray-400">{part.currency}</div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{part.description}</p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <span className="flex items-center text-gray-400">
              <span className="bg-zinc-800 px-2 py-1 rounded text-xs mr-2">{part.category}</span>
            </span>
            <span className="text-gray-400">
              Stock: {part.stock_quantity}
            </span>
            {part.blockchain_verified && (
              <span className="flex items-center text-green-500">
                <Shield size={14} className="mr-1" />
                Blockchain Verified
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {part.compatibility.slice(0, 3).map((vehicle, index) => (
                <span key={index} className="bg-red-900/20 text-red-400 px-2 py-1 rounded-full text-xs">
                  {vehicle}
                </span>
              ))}
              {part.compatibility.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{part.compatibility.length - 3} more</span>
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
  categories: string[];
  brands: string[];
  compatibleVehicles: string[];
}> = ({ filters, onFiltersChange, categories, brands, compatibleVehicles }) => {
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
          <label className="block text-sm font-medium text-gray-400 mb-2">Compatible Vehicle</label>
          <select
            value={filters.compatibility}
            onChange={(e) => onFiltersChange({ ...filters, compatibility: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          >
            <option value="">All Vehicles</option>
            {compatibleVehicles.map(vehicle => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
              })}
              className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                priceRange: [filters.priceRange[0], parseInt(e.target.value) || 5000] 
              })}
              className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
            />
          </div>
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
          <span className="text-sm text-gray-400">Blockchain Verified Only</span>
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

// Shopping Cart Component
const ShoppingCart: React.FC<{
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
                <CartItem 
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
                <CheckCircle size={18} className="mr-2" />
                Complete Purchase with HBAR
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

// Cart Item Component
const CartItem: React.FC<{
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
        <p className="text-xs text-gray-400">Stock: {item.part.stock_quantity}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600 text-xs"
              onClick={() => onUpdateQuantity(item.part.id, item.quantity - 1)}
            >
              <Minus size={12} />
            </button>
            <span className="text-sm w-8 text-center">{item.quantity}</span>
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600 text-xs"
              onClick={() => onUpdateQuantity(item.part.id, item.quantity + 1)}
              disabled={item.quantity >= item.part.stock_quantity}
            >
              <Plus size={12} />
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

export default FunctionalMarketplace;