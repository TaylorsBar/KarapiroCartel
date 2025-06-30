import React, { useState } from 'react';
import { Wrench, Calendar, Clock, CheckCircle, X, Users, Star, PenTool as Tool } from 'lucide-react';

interface WorkshopBay {
  id: string;
  name: string;
  status: 'available' | 'unavailable';
  equipment: string[];
  rate: number;
  nextAvailable?: string;
  features: string[];
  isVIP?: boolean;
}

const Workshop: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  
  const workshopBays: WorkshopBay[] = [
    {
      id: 'bay1',
      name: 'Performance Bay 1',
      status: 'available',
      equipment: ['Lift', 'Dyno', 'Diagnostic Tools', 'Air Compressor'],
      rate: 75,
      features: ['Climate Controlled', 'Toolbox Access', 'Fluid Disposal'],
      isVIP: true
    },
    {
      id: 'bay2',
      name: 'Standard Bay 2',
      status: 'unavailable',
      nextAvailable: '2025-04-15T14:00:00',
      equipment: ['Lift', 'Basic Tools', 'Air Compressor'],
      rate: 45,
      features: ['Fluid Disposal', 'Toolbox Access']
    },
    {
      id: 'bay3',
      name: 'Performance Bay 3',
      status: 'available',
      equipment: ['Lift', 'Dyno', 'Diagnostic Tools', 'Air Compressor', 'Welding Equipment'],
      rate: 85,
      features: ['Climate Controlled', 'Toolbox Access', 'Fluid Disposal', 'Lounge Access'],
      isVIP: true
    },
    {
      id: 'bay4',
      name: 'Standard Bay 4',
      status: 'available',
      equipment: ['Lift', 'Basic Tools', 'Air Compressor'],
      rate: 45,
      features: ['Fluid Disposal', 'Toolbox Access']
    }
  ];
  
  const handleBaySelection = (bayId: string) => {
    const bay = workshopBays.find(b => b.id === bayId);
    if (bay && bay.status === 'available') {
      setSelectedBay(bayId);
      setShowBookingModal(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        VIP Self-Service Workshop
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="mr-2 text-red-600" />
              Book a Workshop Bay
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshopBays.map((bay) => (
                <div 
                  key={bay.id}
                  className={`bg-gradient-to-br ${bay.isVIP ? 'from-zinc-900 to-red-950/30 border-amber-600' : 'from-zinc-900 to-black border-zinc-700'} ${bay.status === 'available' ? 'hover:border-green-500 cursor-pointer' : 'opacity-70'} border rounded-lg p-5 transition-all duration-300`}
                  onClick={() => bay.status === 'available' && handleBaySelection(bay.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">
                      {bay.name}
                      {bay.isVIP && (
                        <span className="ml-2 text-xs bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                    </h3>
                    <div className={`${bay.status === 'available' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'} px-2 py-1 rounded-full text-xs font-medium flex items-center`}>
                      {bay.status === 'available' ? (
                        <>
                          <CheckCircle size={12} className="mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <X size={12} className="mr-1" />
                          Unavailable
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {bay.equipment.map((item, index) => (
                        <span key={index} className="bg-zinc-800 text-gray-300 px-2 py-1 rounded-md text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {bay.features.map((feature, index) => (
                        <span key={index} className="bg-red-900/20 text-red-400 px-2 py-1 rounded-md text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xl font-bold">${bay.rate}<span className="text-sm font-normal text-gray-400">/hour</span></div>
                    {bay.status === 'unavailable' && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock size={14} className="mr-1" />
                        Next available: {new Date(bay.nextAvailable!).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="mr-2 text-amber-500" />
              VIP Membership
            </h2>
            
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold px-6 py-2 rounded-full mb-3">
                GOLD TIER
              </div>
              <p className="text-lg">Current Points: <span className="font-bold">7,500</span></p>
              <div className="w-full h-2 bg-zinc-800 rounded-full mt-2 mb-3">
                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm text-gray-400">10,000 points needed for Platinum</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Gold Tier Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>20% discount on workshop bay bookings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Priority booking for performance bays</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access to VIP lounge with refreshments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Free diagnostic scans (2 per month)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Upcoming Rewards</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platinum Tier</span>
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full">2,500 points away</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Free Track Day</span>
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full">5,000 points away</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional Tuning Session</span>
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full">7,500 points away</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-black py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-amber-600/30 transition-all duration-300 font-bold">
              Upgrade to Platinum
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Tool className="mr-2 text-red-600" />
              Available Tools
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>Professional Toolbox</span>
                <span className="text-green-500 text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>Engine Hoist</span>
                <span className="text-green-500 text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>Transmission Jack</span>
                <span className="text-red-500 text-sm">In Use</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>Welding Equipment</span>
                <span className="text-green-500 text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                <span>Tire Mounting Machine</span>
                <span className="text-green-500 text-sm">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && selectedBay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg w-full max-w-md p-6 shadow-2xl shadow-red-600/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-600">Book Workshop Bay</h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Selected Bay</label>
                <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white">
                  {workshopBays.find(b => b.id === selectedBay)?.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Time Slot</label>
                <select className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
                  <option value="09:00">09:00 - 12:00 (3 hours)</option>
                  <option value="13:00">13:00 - 16:00 (3 hours)</option>
                  <option value="17:00">17:00 - 20:00 (3 hours)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what you'll be working on..."
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                ></textarea>
              </div>
              
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Bay Rate (3 hours)</span>
                  <span>${(workshopBays.find(b => b.id === selectedBay)?.rate || 0) * 3}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">VIP Discount (20%)</span>
                  <span className="text-green-500">-${((workshopBays.find(b => b.id === selectedBay)?.rate || 0) * 3 * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-700">
                  <span>Total</span>
                  <span>${((workshopBays.find(b => b.id === selectedBay)?.rate || 0) * 3 * 0.8).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-zinc-700 text-white py-3 rounded-md hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workshop;