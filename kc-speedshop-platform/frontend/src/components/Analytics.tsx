import React, { useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Users, Calendar, ShoppingBag, Zap, Wrench } from 'lucide-react';
import Chart from 'chart.js/auto';

const Analytics: React.FC = () => {
  const revenueChartRef = useRef<HTMLCanvasElement | null>(null);
  const partsChartRef = useRef<HTMLCanvasElement | null>(null);
  const workshopChartRef = useRef<HTMLCanvasElement | null>(null);
  const diagnosticsChartRef = useRef<HTMLCanvasElement | null>(null);
  
  // Refs to hold Chart instances
  const revenueChartInstance = useRef<Chart | null>(null);
  const partsChartInstance = useRef<Chart | null>(null);
  const workshopChartInstance = useRef<Chart | null>(null);
  const diagnosticsChartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    // Revenue Chart
    if (revenueChartRef.current) {
      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (revenueChartInstance.current) {
          revenueChartInstance.current.destroy();
        }
        
        revenueChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue (NZD)',
              data: [65000, 72000, 68000, 84000, 93000, 125000],
              borderColor: '#DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      }
    }
    
    // Parts Chart
    if (partsChartRef.current) {
      const ctx = partsChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (partsChartInstance.current) {
          partsChartInstance.current.destroy();
        }
        
        partsChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Engine', 'Suspension', 'Exhaust', 'Brakes', 'Electronics', 'Other'],
            datasets: [{
              data: [35, 20, 15, 12, 10, 8],
              backgroundColor: [
                '#DC2626', // Red
                '#2563EB', // Blue
                '#D97706', // Amber
                '#059669', // Green
                '#7C3AED', // Purple
                '#6B7280'  // Gray
              ],
              borderWidth: 1,
              borderColor: '#18181B'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      }
    }
    
    // Workshop Chart
    if (workshopChartRef.current) {
      const ctx = workshopChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (workshopChartInstance.current) {
          workshopChartInstance.current.destroy();
        }
        
        workshopChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Bay Bookings',
              data: [12, 19, 15, 8, 22, 27, 10],
              backgroundColor: 'rgba(220, 38, 38, 0.7)',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      }
    }
    
    // Diagnostics Chart
    if (diagnosticsChartRef.current) {
      const ctx = diagnosticsChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (diagnosticsChartInstance.current) {
          diagnosticsChartInstance.current.destroy();
        }
        
        diagnosticsChartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['Engine', 'Transmission', 'Electrical', 'Suspension', 'Brakes', 'Exhaust'],
            datasets: [{
              label: 'Issue Frequency',
              data: [65, 40, 75, 30, 45, 25],
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderColor: '#DC2626',
              pointBackgroundColor: '#DC2626',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#DC2626'
            }]
          },
          options: {
            responsive: true,
            scales: {
              r: {
                angleLines: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                  color: 'rgba(255, 255, 255, 0.7)'
                },
                ticks: {
                  backdropColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      }
    }
    
    // Cleanup function to destroy charts when component unmounts or effect re-runs
    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
        revenueChartInstance.current = null;
      }
      if (partsChartInstance.current) {
        partsChartInstance.current.destroy();
        partsChartInstance.current = null;
      }
      if (workshopChartInstance.current) {
        workshopChartInstance.current.destroy();
        workshopChartInstance.current = null;
      }
      if (diagnosticsChartInstance.current) {
        diagnosticsChartInstance.current.destroy();
        diagnosticsChartInstance.current = null;
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        Platform Analytics
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">$125,350</h3>
              <p className="text-green-500 text-sm flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="bg-red-600/20 p-3 rounded-lg">
              <DollarSign className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <h3 className="text-2xl font-bold mt-1">2,847</h3>
              <p className="text-green-500 text-sm flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +8.3% from last month
              </p>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Workshop Bookings</p>
              <h3 className="text-2xl font-bold mt-1">156</h3>
              <p className="text-green-500 text-sm flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +15.7% from last month
              </p>
            </div>
            <div className="bg-amber-600/20 p-3 rounded-lg">
              <Calendar className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">HBAR Transactions</p>
              <h3 className="text-2xl font-bold mt-1">943</h3>
              <p className="text-green-500 text-sm flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +23.1% from last month
              </p>
            </div>
            <div className="bg-purple-600/20 p-3 rounded-lg">
              <Activity className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-red-600" />
            Revenue Trends
          </h2>
          <div className="h-80">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <ShoppingBag className="mr-2 text-red-600" />
            Parts Sales by Category
          </h2>
          <div className="h-80">
            <canvas ref={partsChartRef}></canvas>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Wrench className="mr-2 text-red-600" />
            Workshop Bay Usage
          </h2>
          <div className="h-80">
            <canvas ref={workshopChartRef}></canvas>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="mr-2 text-red-600" />
            Diagnostic Issue Distribution
          </h2>
          <div className="h-80">
            <canvas ref={diagnosticsChartRef}></canvas>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Activity className="mr-2 text-red-600" />
          Recent Blockchain Transactions
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-3 px-4 font-mono text-xs">txn_1681234567_a7b8c9</td>
                <td className="py-3 px-4">Parts Authentication</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4"><span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
                <td className="py-3 px-4 text-gray-400">2025-04-10 14:23:45</td>
              </tr>
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-3 px-4 font-mono text-xs">txn_1681234568_d4e5f6</td>
                <td className="py-3 px-4">HBAR Payment</td>
                <td className="py-3 px-4">125.00 HBAR</td>
                <td className="py-3 px-4"><span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
                <td className="py-3 px-4 text-gray-400">2025-04-10 13:45:12</td>
              </tr>
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-3 px-4 font-mono text-xs">txn_1681234569_g7h8i9</td>
                <td className="py-3 px-4">Diagnostic Record</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4"><span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
                <td className="py-3 px-4 text-gray-400">2025-04-10 11:32:08</td>
              </tr>
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-3 px-4 font-mono text-xs">txn_1681234570_j1k2l3</td>
                <td className="py-3 px-4">HBAR Payment</td>
                <td className="py-3 px-4">75.50 HBAR</td>
                <td className="py-3 px-4"><span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
                <td className="py-3 px-4 text-gray-400">2025-04-09 17:14:22</td>
              </tr>
              <tr className="hover:bg-zinc-800/50">
                <td className="py-3 px-4 font-mono text-xs">txn_1681234571_m4n5o6</td>
                <td className="py-3 px-4">Smart Contract</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4"><span className="bg-green-600/20 text-green-500 px-2 py-1 rounded-full text-xs">Confirmed</span></td>
                <td className="py-3 px-4 text-gray-400">2025-04-09 15:08:37</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;