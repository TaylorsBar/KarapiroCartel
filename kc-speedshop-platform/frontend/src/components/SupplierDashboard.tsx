import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';
import { SupplierService, type Supplier, type InventoryItem, type SupplierOrder } from '../services/supplierService';
import { useAuth } from '../hooks/useAuth';

const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSupplierData();
    }
  }, [user]);

  const loadSupplierData = async () => {
    try {
      setLoading(true);
      
      // Load supplier profile
      const supplierProfile = await SupplierService.getSupplierProfile(user!.id);
      setSupplier(supplierProfile);

      if (supplierProfile) {
        // Load inventory, orders, and analytics
        const [inventoryData, ordersData, analyticsData] = await Promise.all([
          SupplierService.getSupplierInventory(supplierProfile.id),
          SupplierService.getSupplierOrders(supplierProfile.id),
          SupplierService.getSupplierAnalytics(supplierProfile.id, 'month')
        ]);

        setInventory(inventoryData);
        setOrders(ordersData);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: SupplierOrder['status'], trackingNumber?: string) => {
    try {
      await SupplierService.updateOrderStatus(orderId, status, trackingNumber);
      await loadSupplierData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleInventoryUpdate = async (itemId: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
    try {
      await SupplierService.updateInventoryQuantity(itemId, quantity, operation);
      await loadSupplierData(); // Refresh data
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const enableAutomation = async (type: 'pricing' | 'reorder') => {
    try {
      if (type === 'pricing') {
        await SupplierService.enableAutoPricing(supplier!.id, []);
      } else {
        await SupplierService.enableAutoReorder(supplier!.id);
      }
      await loadSupplierData();
    } catch (error) {
      console.error(`Error enabling ${type} automation:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading supplier dashboard...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return <SupplierOnboarding onComplete={loadSupplierData} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Supplier Dashboard</h1>
          <p className="text-gray-400">{supplier.business_name}</p>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              supplier.verification_status === 'verified' 
                ? 'bg-green-600/20 text-green-500' 
                : 'bg-yellow-600/20 text-yellow-500'
            }`}>
              {supplier.verification_status.charAt(0).toUpperCase() + supplier.verification_status.slice(1)}
            </span>
            <span className="text-sm text-gray-400">
              Rating: {supplier.performance_metrics.rating.toFixed(1)}/5.0
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b border-zinc-800">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'automation', label: 'Automation', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium ${
                activeTab === tab.id 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            supplier={supplier} 
            analytics={analytics} 
            inventory={inventory}
            orders={orders}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab 
            inventory={inventory} 
            onUpdate={handleInventoryUpdate}
            onRefresh={loadSupplierData}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} 
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab analytics={analytics} />
        )}

        {activeTab === 'automation' && (
          <AutomationTab 
            supplier={supplier} 
            onEnableAutomation={enableAutomation}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  supplier: Supplier;
  analytics: any;
  inventory: InventoryItem[];
  orders: SupplierOrder[];
}> = ({ supplier, analytics, inventory, orders }) => {
  const lowStockItems = inventory.filter(item => item.quantity_available <= item.reorder_point);
  const pendingOrders = orders.filter(order => order.status === 'received' || order.status === 'processing');

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={`$${analytics?.sales?.totalRevenue?.toLocaleString() || '0'}`}
          change="+12.5%"
          icon={DollarSign}
          positive
        />
        <MetricCard
          title="Total Orders"
          value={analytics?.sales?.totalOrders?.toString() || '0'}
          change="+8.3%"
          icon={ShoppingCart}
          positive
        />
        <MetricCard
          title="Inventory Items"
          value={inventory.length.toString()}
          change={`${lowStockItems.length} low stock`}
          icon={Package}
          positive={lowStockItems.length === 0}
        />
        <MetricCard
          title="Fulfillment Rate"
          value={`${supplier.performance_metrics.fulfillment_rate.toFixed(1)}%`}
          change="Target: 95%"
          icon={CheckCircle}
          positive={supplier.performance_metrics.fulfillment_rate >= 95}
        />
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-yellow-500" size={20} />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {lowStockItems.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <p className="text-yellow-400 font-medium">Low Stock Alert</p>
                <p className="text-sm text-gray-400">{lowStockItems.length} items need restocking</p>
              </div>
            )}
            {pendingOrders.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                <p className="text-blue-400 font-medium">Pending Orders</p>
                <p className="text-sm text-gray-400">{pendingOrders.length} orders awaiting processing</p>
              </div>
            )}
            {supplier.verification_status !== 'verified' && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                <p className="text-red-400 font-medium">Verification Required</p>
                <p className="text-sm text-gray-400">Complete verification to unlock all features</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
              <Plus size={16} className="mr-2" />
              Add New Product
            </button>
            <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
              <RefreshCw size={16} className="mr-2" />
              Sync Inventory
            </button>
            <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors">
              <BarChart3 size={16} className="mr-2" />
              View Full Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab: React.FC<{
  inventory: InventoryItem[];
  onUpdate: (itemId: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void;
  onRefresh: () => void;
}> = ({ inventory, onUpdate, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'low_stock' && item.quantity_available <= item.reorder_point && item.quantity_available > 0) ||
      (filterStatus === 'out_of_stock' && item.quantity_available === 0);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
        >
          <option value="all">All Items</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">SKU</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Reorder Point</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Cost</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <InventoryRow 
                  key={item.id} 
                  item={item} 
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Inventory Row Component
const InventoryRow: React.FC<{
  item: InventoryItem;
  onUpdate: (itemId: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void;
}> = ({ item, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(item.quantity_available);

  const getStatusBadge = () => {
    if (item.quantity_available === 0) {
      return <span className="bg-red-600/20 text-red-500 px-2 py-1 rounded-full text-xs">Out of Stock</span>;
    } else if (item.quantity_available <= item.reorder_point) {
      return <span className="bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded-full text-xs">Low Stock</span>;
    } else {
      return <span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">In Stock</span>;
    }
  };

  const handleSave = () => {
    onUpdate(item.id, newQuantity, 'set');
    setIsEditing(false);
  };

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
      <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
      <td className="py-3 px-4">
        <div>
          <p className="font-medium">{(item as any).parts?.name || 'Unknown Product'}</p>
          <p className="text-sm text-gray-400">{(item as any).parts?.brand}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
            />
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-400"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-red-500 hover:text-red-400"
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>{item.quantity_available}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white"
            >
              <Edit size={14} />
            </button>
          </div>
        )}
      </td>
      <td className="py-3 px-4">{item.reorder_point}</td>
      <td className="py-3 px-4">${item.cost_price.toFixed(2)}</td>
      <td className="py-3 px-4">{getStatusBadge()}</td>
      <td className="py-3 px-4">
        <div className="flex space-x-2">
          <button className="text-blue-500 hover:text-blue-400">
            <Eye size={16} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Edit size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{
  orders: SupplierOrder[];
  onStatusUpdate: (orderId: string, status: SupplierOrder['status'], trackingNumber?: string) => void;
}> = ({ orders, onStatusUpdate }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
        >
          <option value="all">All Orders</option>
          <option value="received">Received</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: SupplierOrder;
  onStatusUpdate: (orderId: string, status: SupplierOrder['status'], trackingNumber?: string) => void;
}> = ({ order, onStatusUpdate }) => {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-600/20 text-blue-500';
      case 'processing': return 'bg-yellow-600/20 text-yellow-500';
      case 'shipped': return 'bg-purple-600/20 text-purple-500';
      case 'delivered': return 'bg-green-600/20 text-green-500';
      case 'cancelled': return 'bg-red-600/20 text-red-500';
      default: return 'bg-gray-600/20 text-gray-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold">Order #{order.order_id.slice(-8)}</h3>
          <p className="text-sm text-gray-400">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="font-medium">${(order as any).orders?.total_amount?.toFixed(2) || '0.00'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Estimated Delivery</p>
          <p className="font-medium">{new Date(order.estimated_delivery).toLocaleDateString()}</p>
        </div>
      </div>

      {order.status === 'processing' && (
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
          />
          <button
            onClick={() => onStatusUpdate(order.id, 'shipped', trackingNumber)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
          >
            Mark Shipped
          </button>
        </div>
      )}

      {order.status === 'received' && (
        <button
          onClick={() => onStatusUpdate(order.id, 'processing')}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
        >
          Start Processing
        </button>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Analytics data is loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.sales.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Orders"
          value={analytics.sales.totalOrders.toString()}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Average Order Value"
          value={`$${analytics.sales.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Inventory Items"
          value={analytics.inventory.totalItems.toString()}
          icon={Package}
        />
        <MetricCard
          title="Inventory Value"
          value={`$${analytics.inventory.totalValue.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Low Stock Items"
          value={analytics.inventory.lowStockItems.toString()}
          icon={AlertTriangle}
          positive={analytics.inventory.lowStockItems === 0}
        />
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Fulfillment Rate</p>
            <div className="flex items-center">
              <div className="flex-1 bg-zinc-800 rounded-full h-2 mr-3">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${analytics.performance.fulfillment_rate || 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analytics.performance.fulfillment_rate?.toFixed(1) || 0}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Average Response Time</p>
            <p className="text-lg font-semibold">{analytics.performance.response_time || 0} hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Automation Tab Component
const AutomationTab: React.FC<{
  supplier: Supplier;
  onEnableAutomation: (type: 'pricing' | 'reorder') => void;
}> = ({ supplier, onEnableAutomation }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Pricing */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2 text-red-600" size={20} />
            Automatic Pricing
          </h3>
          <p className="text-gray-400 mb-4">
            Automatically adjust prices based on competitor analysis and market conditions.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                supplier.auto_pricing_enabled 
                  ? 'bg-green-600/20 text-green-500' 
                  : 'bg-gray-600/20 text-gray-500'
              }`}>
                {supplier.auto_pricing_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {!supplier.auto_pricing_enabled && (
              <button
                onClick={() => onEnableAutomation('pricing')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Enable Auto Pricing
              </button>
            )}
          </div>
        </div>

        {/* Auto Reorder */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <RefreshCw className="mr-2 text-red-600" size={20} />
            Automatic Reordering
          </h3>
          <p className="text-gray-400 mb-4">
            Automatically reorder inventory when stock levels reach reorder points.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                supplier.inventory_sync_enabled 
                  ? 'bg-green-600/20 text-green-500' 
                  : 'bg-gray-600/20 text-gray-500'
              }`}>
                {supplier.inventory_sync_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {!supplier.inventory_sync_enabled && (
              <button
                onClick={() => onEnableAutomation('reorder')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Enable Auto Reorder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Automation Rules</h3>
        <div className="space-y-4">
          <div className="border border-zinc-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Competitive Pricing Rule</h4>
            <p className="text-sm text-gray-400 mb-2">
              Automatically match competitor prices with 5% discount
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Last updated: 2 hours ago</span>
              <button className="text-red-600 hover:text-red-500 text-sm">Edit</button>
            </div>
          </div>
          
          <div className="border border-zinc-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Low Stock Alert</h4>
            <p className="text-sm text-gray-400 mb-2">
              Send notifications when inventory drops below reorder point
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Active</span>
              <button className="text-red-600 hover:text-red-500 text-sm">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<any>;
  positive?: boolean;
}> = ({ title, value, change, icon: Icon, positive = true }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <p className={`text-sm mt-1 ${positive ? 'text-green-500' : 'text-red-500'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="bg-red-600/20 p-3 rounded-lg">
          <Icon className="text-red-600" size={24} />
        </div>
      </div>
    </div>
  );
};

// Supplier Onboarding Component
const SupplierOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'retailer' as const,
    tax_id: '',
    business_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'New Zealand'
    },
    contact_info: {
      phone: '',
      email: user?.email || '',
      website: ''
    },
    certifications: [] as string[],
    subscription_tier: 'basic' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SupplierService.createSupplier({
        ...formData,
        user_id: user!.id,
        verification_status: 'pending',
        performance_metrics: {
          rating: 0,
          total_orders: 0,
          fulfillment_rate: 0,
          response_time: 0
        },
        commission_rate: 0.15,
        auto_pricing_enabled: false,
        inventory_sync_enabled: false
      });
      onComplete();
    } catch (error) {
      console.error('Error creating supplier profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">
            Become a Supplier
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Join our automotive parts marketplace and start selling to customers worldwide.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Business Type
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value as any })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
              >
                <option value="manufacturer">Manufacturer</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
                <option value="individual">Individual Seller</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_info.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.contact_info.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, website: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
            >
              Create Supplier Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;