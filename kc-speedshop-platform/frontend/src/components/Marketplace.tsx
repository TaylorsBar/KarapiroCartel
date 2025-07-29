import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, X, Tag, Truck, Clock } from 'lucide-react';

interface MarketplaceProps {
  onBlockchainPayment: (amount: number) => void;
}

interface Part {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  compatibility: string[];
  stock: number;
  description: string;
  blockchainVerified: boolean;
}

interface CartItem {
  part: Part;
  quantity: number;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onBlockchainPayment }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  useEffect(() => {
    // Simulated parts data
    const partsData: Part[] = [
      {
        id: 'p1',
        name: 'GT3582R Turbocharger',
        brand: 'Garrett',
        price: 1299.99,
        image: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Engine',
        compatibility: ['Nissan Skyline', 'Toyota Supra', 'Mitsubishi Evo'],
        stock: 5,
        description: 'High-performance turbocharger with dual ceramic ball bearings for maximum response and power.',
        blockchainVerified: true
      },
      {
        id: 'p2',
        name: 'BR Series Coilovers',
        brand: 'BC Racing',
        price: 1049.99,
        image: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Suspension',
        compatibility: ['Honda Civic Type R', 'Subaru WRX STI', 'Mazda RX-7'],
        stock: 8,
        description: '30-way adjustable damping force, full height adjustability, and camber plates included.',
        blockchainVerified: true
      },
      {
        id: 'p3',
        name: 'Titanium Cat-Back Exhaust System',
        brand: 'HKS',
        price: 1599.99,
        image: 'https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Exhaust',
        compatibility: ['Nissan 370Z', 'Infiniti G37', 'Lexus IS-F'],
        stock: 3,
        description: 'Lightweight titanium construction with signature HKS sound. Includes all mounting hardware.',
        blockchainVerified: true
      },
      {
        id: 'p4',
        name: 'Big Brake Kit',
        brand: 'Brembo',
        price: 2499.99,
        image: 'https://images.pexels.com/photos/4024484/pexels-photo-4024484.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Brakes',
        compatibility: ['BMW M3', 'Audi RS4', 'Mercedes-AMG C63'],
        stock: 2,
        description: '6-piston front calipers with 380mm 2-piece rotors for maximum stopping power.',
        blockchainVerified: true
      },
      {
        id: 'p5',
        name: 'Intake Manifold',
        brand: 'Skunk2',
        price: 699.99,
        image: 'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Engine',
        compatibility: ['Honda Civic', 'Acura Integra', 'Honda Accord'],
        stock: 6,
        description: 'Cast aluminum intake manifold with velocity stacks for improved airflow and power.',
        blockchainVerified: false
      },
      {
        id: 'p6',
        name: 'Adjustable Rear Wing',
        brand: 'Voltex',
        price: 1899.99,
        image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: 'Exterior',
        compatibility: ['Subaru WRX STI', 'Mitsubishi Evo', 'Honda Civic Type R'],
        stock: 4,
        description: 'Carbon fiber construction with adjustable angle of attack for optimal downforce.',
        blockchainVerified: true
      }
    ];
    
    setParts(partsData);
    setFilteredParts(partsData);
  }, []);
  
  useEffect(() => {
    let result = parts;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(part => part.category === categoryFilter);
    }
    
    // Apply brand filter
    if (brandFilter) {
      result = result.filter(part => part.brand === brandFilter);
    }
    
    setFilteredParts(result);
  }, [searchTerm, categoryFilter, brandFilter, parts]);
  
  const addToCart = (part: Part) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.part.id === part.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.part.id === part.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { part, quantity: 1 }];
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
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    onBlockchainPayment(calculateTotal());
  };
  
  // Get unique categories and brands for filters
  const categories = Array.from(new Set(parts.map(part => part.category)));
  const brands = Array.from(new Set(parts.map(part => part.brand)));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        Automotive Marketplace
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1">
            <input
              type="text"
              placeholder="Search parts..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Parts Grid */}
        <div className="lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredParts.map(part => (
              <PartCard 
                key={part.id} 
                part={part} 
                onAddToCart={() => addToCart(part)} 
              />
            ))}
          </div>
          
          {filteredParts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No parts found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {/* Shopping Cart */}
        <div className="lg:w-1/3">
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
                  <p className="text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {cart.map(item => (
                      <CartItem 
                        key={item.part.id} 
                        item={item} 
                        onRemove={() => removeFromCart(item.part.id)}
                        onUpdateQuantity={(quantity) => updateQuantity(item.part.id, quantity)}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Shipping</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-400">Tax</span>
                      <span>${(calculateTotal() * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-red-500">${(calculateTotal() * 1.15).toFixed(2)} NZD</span>
                    </div>
                    
                    <button
                      className="w-full mt-6 bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      Pay with HBAR 🔗
                    </button>
                    
                    <div className="mt-4 text-xs text-center text-gray-500">
                      <p>All transactions are secured by Hedera Hashgraph</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Part Card Component
interface PartCardProps {
  part: Part;
  onAddToCart: () => void;
}

const PartCard: React.FC<PartCardProps> = ({ part, onAddToCart }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 hover:border-red-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
      <div className="h-48 overflow-hidden">
        <img 
          src={part.image} 
          alt={part.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{part.name}</h3>
          {part.blockchainVerified && (
            <div className="bg-green-900/30 text-green-500 text-xs px-2 py-1 rounded-full flex items-center">
              <Check size={12} className="mr-1" />
              Verified
            </div>
          )}
        </div>
        
        <p className="text-red-500 text-sm font-medium uppercase mb-2">{part.brand}</p>
        
        <div className="flex items-center mb-3">
          <Tag size={16} className="text-gray-400 mr-2" />
          <span className="text-gray-400 text-sm">{part.category}</span>
        </div>
        
        <div className="flex items-center mb-3">
          <Truck size={16} className="text-gray-400 mr-2" />
          <span className="text-gray-400 text-sm">
            {part.stock > 0 ? `${part.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{part.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${part.price.toFixed(2)}</span>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors duration-300"
            onClick={onAddToCart}
            disabled={part.stock === 0}
          >
            <ShoppingCart size={16} className="mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
interface CartItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-start space-x-4 p-3 bg-zinc-800/50 rounded-lg">
      <img 
        src={item.part.image} 
        alt={item.part.name} 
        className="w-16 h-16 object-cover rounded"
      />
      
      <div className="flex-1">
        <h4 className="text-sm font-medium">{item.part.name}</h4>
        <p className="text-xs text-red-500">{item.part.brand}</p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
            >
              -
            </button>
            <span className="text-sm">{item.quantity}</span>
            <button 
              className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded-md hover:bg-zinc-600"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-sm font-medium">${(item.part.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      
      <button 
        className="text-gray-400 hover:text-red-500"
        onClick={onRemove}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Marketplace;