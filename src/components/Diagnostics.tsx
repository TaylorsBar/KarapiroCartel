import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Info, ArrowRight, Cpu, Database, Car } from 'lucide-react';

const Diagnostics: React.FC = () => {
  const [vehicleMake, setVehicleMake] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleYear, setVehicleYear] = useState<string>('');
  const [troubleCode, setTroubleCode] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('scan');

  const popularMakes = [
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Holden',
    'Hyundai', 'Kia', 'Lexus', 'Infiniti', 'Acura'
  ];

  const commonModels: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Prius', 'Land Cruiser', 'Yaris', 'Highlander'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Jazz', 'Odyssey', 'Pilot', 'HR-V', 'City'],
    'Nissan': ['Navara', 'X-Trail', 'Qashqai', 'Micra', 'Pathfinder', 'Juke', 'Leaf', 'Altima'],
    'Mazda': ['CX-5', 'Mazda3', 'CX-3', 'Mazda6', 'CX-9', 'MX-5', 'BT-50', 'CX-30'],
    'Subaru': ['Outback', 'Forester', 'XV', 'Impreza', 'Legacy', 'WRX', 'Ascent', 'BRZ'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '1 Series', '7 Series', 'X1', 'i3'],
    'Ford': ['Ranger', 'Territory', 'Focus', 'Mustang', 'Escape', 'Everest', 'Fiesta', 'Mondeo']
  };

  const commonCodes = [
    { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', severity: 'high' },
    { code: 'P0171', description: 'System Too Lean (Bank 1)', severity: 'medium' },
    { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', severity: 'medium' },
    { code: 'P0455', description: 'Evaporative Emission System Leak Detected', severity: 'low' },
    { code: 'P0401', description: 'Exhaust Gas Recirculation Flow Insufficient', severity: 'medium' },
    { code: 'P0128', description: 'Coolant Thermostat Temperature', severity: 'medium' },
    { code: 'P0442', description: 'Evaporative Emission System Leak Detected (small leak)', severity: 'low' },
    { code: 'P0506', description: 'Idle Air Control System RPM Lower Than Expected', severity: 'low' }
  ];

  const commonSymptoms = [
    'Engine misfiring',
    'Check engine light',
    'Poor fuel economy',
    'Rough idle',
    'Hard starting',
    'Engine stalling',
    'Loss of power',
    'Unusual exhaust smoke',
    'Strange noises',
    'Overheating'
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to diagnostic service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate more realistic results based on vehicle make and symptoms
      const mockResult = {
        vehicle: {
          make: vehicleMake,
          model: vehicleModel,
          year: parseInt(vehicleYear),
          mileage: parseInt(mileage)
        },
        diagnosticResults: {
          troubleCodes: [troubleCode],
          description: getCodeDescription(troubleCode),
          possibleCauses: getPossibleCauses(troubleCode, vehicleMake),
          symptoms: symptoms
        },
        aiInterpretation: {
          interpretation: generateAIInterpretation(troubleCode, vehicleMake, vehicleModel, symptoms),
          confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
          urgencyLevel: getUrgencyLevel(troubleCode),
          estimatedCost: getEstimatedCost(troubleCode, vehicleMake)
        },
        blockchainRecord: {
          status: 'recorded',
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          consensusTimestamp: new Date().toISOString()
        },
        recommendations: getRecommendations(troubleCode, vehicleMake, symptoms)
      };
      
      setDiagnosticResult(mockResult);
    } catch (error) {
      console.error('Error during diagnostic scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCodeDescription = (code: string): string => {
    const codeInfo = commonCodes.find(c => c.code === code);
    return codeInfo?.description || 'Unknown diagnostic trouble code';
  };

  const getPossibleCauses = (code: string, make: string): string[] => {
    const baseCauses: Record<string, string[]> = {
      'P0300': ['Faulty spark plugs', 'Damaged ignition coils', 'Fuel injector issues', 'Vacuum leaks', 'Low compression'],
      'P0171': ['Dirty mass airflow sensor', 'Vacuum leaks', 'Faulty oxygen sensor', 'Fuel pump issues'],
      'P0420': ['Worn catalytic converter', 'Faulty oxygen sensors', 'Engine running rich/lean', 'Exhaust leaks'],
      'P0455': ['Loose gas cap', 'Damaged EVAP lines', 'Faulty purge valve', 'Charcoal canister issues']
    };

    let causes = baseCauses[code] || ['Requires professional diagnosis', 'Component malfunction', 'Wiring issues'];
    
    // Add make-specific common issues
    if (make === 'Toyota' && code === 'P0171') {
      causes.push('Common MAF sensor issue in Toyota vehicles');
    } else if (make === 'Honda' && code === 'P0300') {
      causes.push('Known ignition coil failure in Honda models');
    } else if (make === 'BMW' && code === 'P0420') {
      causes.push('BMW-specific catalytic converter design issue');
    }

    return causes;
  };

  const generateAIInterpretation = (code: string, make: string, model: string, symptoms: string[]): string => {
    const vehicle = `${vehicleYear} ${make} ${model}`;
    const symptomsText = symptoms.length > 0 ? ` along with symptoms including ${symptoms.join(', ')}` : '';
    
    const interpretations: Record<string, string> = {
      'P0300': `Your ${vehicle} is experiencing multiple cylinder misfires${symptomsText}. This is commonly caused by worn spark plugs or ignition coils, especially in vehicles with higher mileage. For ${make} vehicles, this often indicates maintenance is due. I recommend starting with a spark plug inspection and replacement if needed.`,
      'P0171': `The diagnostic code indicates your ${vehicle} is running too lean${symptomsText}. This means there's too much air or not enough fuel in the combustion mixture. In ${make} vehicles, this is frequently caused by a dirty mass airflow sensor or vacuum leaks. Clean the MAF sensor first as this is a common and inexpensive fix.`,
      'P0420': `Your ${vehicle} has a catalytic converter efficiency issue${symptomsText}. While this could indicate a failing catalytic converter, it's often caused by faulty oxygen sensors or engine running conditions. For ${make} vehicles, I recommend checking the oxygen sensors first before replacing the expensive catalytic converter.`,
      'P0455': `There's a large evaporative emission system leak detected in your ${vehicle}${symptomsText}. Start by checking if your gas cap is properly tightened - this fixes the issue about 30% of the time. If that doesn't work, inspect the EVAP lines for damage or disconnection.`
    };

    return interpretations[code] || `Your ${vehicle} has triggered diagnostic code ${code}${symptomsText}. This requires further investigation to determine the exact cause. I recommend having a professional diagnostic scan performed to identify the specific component or system causing this code.`;
  };

  const getUrgencyLevel = (code: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const urgencyMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      'P0300': 'HIGH',
      'P0171': 'MEDIUM',
      'P0420': 'MEDIUM',
      'P0455': 'LOW',
      'P0401': 'MEDIUM',
      'P0128': 'MEDIUM',
      'P0442': 'LOW',
      'P0506': 'LOW'
    };
    return urgencyMap[code] || 'MEDIUM';
  };

  const getEstimatedCost = (code: string, make: string): { min: number; max: number; currency: string } => {
    const baseCosts: Record<string, { min: number; max: number }> = {
      'P0300': { min: 150, max: 800 },
      'P0171': { min: 80, max: 400 },
      'P0420': { min: 500, max: 2500 },
      'P0455': { min: 20, max: 300 }
    };

    let costs = baseCosts[code] || { min: 100, max: 500 };
    
    // Adjust for luxury brands
    if (['BMW', 'Mercedes-Benz', 'Audi', 'Lexus'].includes(make)) {
      costs.min *= 1.3;
      costs.max *= 1.5;
    }

    return {
      min: Math.round(costs.min),
      max: Math.round(costs.max),
      currency: 'NZD'
    };
  };

  const getRecommendations = (code: string, make: string, symptoms: string[]): string[] => {
    const baseRecommendations: Record<string, string[]> = {
      'P0300': [
        'Replace spark plugs if over 60,000km',
        'Inspect ignition coils for damage',
        'Check fuel injectors for proper operation',
        'Test engine compression'
      ],
      'P0171': [
        'Clean mass airflow sensor',
        'Inspect for vacuum leaks',
        'Check fuel pressure',
        'Replace air filter if dirty'
      ],
      'P0420': [
        'Test oxygen sensors first',
        'Check for exhaust leaks',
        'Verify engine is running properly',
        'Consider catalytic converter replacement if sensors are good'
      ]
    };

    return baseRecommendations[code] || [
      'Perform comprehensive diagnostic scan',
      'Inspect related components',
      'Check wiring and connections',
      'Consult vehicle-specific service bulletins'
    ];
  };

  const handleCodeSelect = (code: string) => {
    setTroubleCode(code);
  };

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getSeverityBadge = (level: string) => {
    switch(level) {
      case 'HIGH':
        return (
          <div className="inline-flex items-center bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm">
            <AlertTriangle size={14} className="mr-1" />
            High Priority
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="inline-flex items-center bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full text-sm">
            <Info size={14} className="mr-1" />
            Medium Priority
          </div>
        );
      case 'LOW':
        return (
          <div className="inline-flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm">
            <CheckCircle size={14} className="mr-1" />
            Low Priority
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <div className="particles">
        {[...Array(12)].map((_, i) => (
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
          AI-Powered Vehicle Diagnostics
          <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-champagne to-transparent"></div>
        </h1>
        <p className="text-center text-gray-300 mb-12 text-lg">Advanced diagnostic analysis with blockchain verification</p>
        
        <div className="flex mb-8 glass-card rounded-xl p-2">
          <button
            className={`px-6 py-3 font-medium rounded-lg transition-all ${activeTab === 'scan' ? 'bg-champagne/20 text-champagne' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('scan')}
          >
            Diagnostic Scan
          </button>
          <button
            className={`px-6 py-3 font-medium rounded-lg transition-all ${activeTab === 'codes' ? 'bg-champagne/20 text-champagne' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('codes')}
          >
            Common Codes
          </button>
          <button
            className={`px-6 py-3 font-medium rounded-lg transition-all ${activeTab === 'symptoms' ? 'bg-champagne/20 text-champagne' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('symptoms')}
          >
            Symptom Checker
          </button>
        </div>
        
        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-diagnostic-card rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-glow">
                <Car className="mr-3 text-champagne" />
                Vehicle Diagnostic Scan
              </h2>
              
              <form onSubmit={handleScan} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Vehicle Make</label>
                  <div className="glass-card rounded-lg p-1">
                    <select
                      value={vehicleMake}
                      onChange={(e) => {
                        setVehicleMake(e.target.value);
                        setVehicleModel(''); // Reset model when make changes
                      }}
                      className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
                      required
                    >
                      <option value="" className="bg-black">Select Vehicle Make</option>
                      {popularMakes.map(make => (
                        <option key={make} value={make} className="bg-black">{make}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Vehicle Model</label>
                  <div className="glass-card rounded-lg p-1">
                    <select
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
                      disabled={!vehicleMake}
                      required
                    >
                      <option value="" className="bg-black">Select Vehicle Model</option>
                      {vehicleMake && commonModels[vehicleMake]?.map(model => (
                        <option key={model} value={model} className="bg-black">{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Vehicle Year</label>
                    <div className="glass-card rounded-lg p-1">
                      <select
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white focus:outline-none"
                        required
                      >
                        <option value="" className="bg-black">Select Year</option>
                        {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                          <option key={year} value={year} className="bg-black">{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Mileage (km)</label>
                    <div className="glass-card rounded-lg p-1">
                      <input
                        type="number"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        placeholder="e.g., 85000"
                        className="w-full px-4 py-3 bg-transparent text-white focus:outline-none placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Diagnostic Trouble Code</label>
                  <div className="glass-card rounded-lg p-1">
                    <input
                      type="text"
                      value={troubleCode}
                      onChange={(e) => setTroubleCode(e.target.value.toUpperCase())}
                      placeholder="e.g., P0300"
                      className="w-full px-4 py-3 bg-transparent text-white focus:outline-none placeholder-gray-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter the code from your OBD2 scanner or check engine light</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Symptoms (Optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {commonSymptoms.slice(0, 6).map(symptom => (
                      <label key={symptom} className="flex items-center glass-card px-3 py-2 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="mr-3 accent-champagne"
                        />
                        <span className="text-gray-300 text-sm">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-luxury py-4 rounded-xl text-lg flex items-center justify-center font-medium"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-3">⚙️</span>
                      Analyzing Vehicle...
                    </>
                  ) : (
                    <>
                      <Cpu size={20} className="mr-3" />
                      Run AI Diagnostic Analysis
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="glass-card rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-glow">
                <Database className="mr-3 text-champagne" />
                Common Diagnostic Codes
              </h2>
              
              <div className="space-y-3">
                {commonCodes.map((code) => (
                  <div 
                    key={code.code}
                    onClick={() => handleCodeSelect(code.code)}
                    className="glass-card p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-champagne font-mono font-bold text-lg">{code.code}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        code.severity === 'high' ? 'bg-red-600/20 text-red-500' :
                        code.severity === 'medium' ? 'bg-amber-600/20 text-amber-500' :
                        'bg-green-600/20 text-green-500'
                      }`}>
                        {code.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{code.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'codes' && (
          <div className="glass-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-glow">OBD2 Code Reference</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-champagne">P Codes - Powertrain</h3>
                  <p className="text-gray-300 text-sm mb-4">Related to engine, transmission, and emissions systems</p>
                  <div className="space-y-3">
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">P0xxx</span> - Generic OBD-II codes
                    </div>
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">P1xxx</span> - Manufacturer-specific codes
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-amber-500">B Codes - Body</h3>
                  <p className="text-gray-300 text-sm mb-4">Related to body systems like airbags, seatbelts, etc.</p>
                  <div className="space-y-3">
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">B0xxx</span> - Generic body codes
                    </div>
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">B1xxx</span> - Manufacturer-specific codes
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">C Codes - Chassis</h3>
                  <p className="text-gray-300 text-sm mb-4">Related to chassis systems like brakes, steering, etc.</p>
                  <div className="space-y-3">
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">C0xxx</span> - Generic chassis codes
                    </div>
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">C1xxx</span> - Manufacturer-specific codes
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-green-500">U Codes - Network</h3>
                  <p className="text-gray-300 text-sm mb-4">Related to network and computer systems</p>
                  <div className="space-y-3">
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">U0xxx</span> - Generic network codes
                    </div>
                    <div className="glass-card p-3 rounded-lg">
                      <span className="font-mono text-white font-bold">U1xxx</span> - Manufacturer-specific codes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="glass-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-glow">Symptom-Based Diagnosis</h2>
            <p className="text-gray-300 mb-8 text-lg">Select the symptoms your vehicle is experiencing for AI-powered diagnosis suggestions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonSymptoms.map(symptom => (
                <label key={symptom} className="flex items-center glass-card p-4 rounded-lg hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={symptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="mr-4 accent-champagne"
                  />
                  <span className="text-gray-300">{symptom}</span>
                </label>
              ))}
            </div>

            {symptoms.length > 0 && (
              <div className="mt-8 glass-card p-6 rounded-lg border border-champagne/30">
                <h3 className="font-semibold text-champagne mb-3 text-lg">Selected Symptoms Analysis</h3>
                <p className="text-gray-300">
                  Based on the symptoms you've selected ({symptoms.join(', ')}), 
                  common diagnostic codes to check include: P0300, P0171, P0420. 
                  Consider running a full diagnostic scan for accurate results.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Premium Diagnostic Results */}
        {diagnosticResult && (
          <div className="mt-12 glass-diagnostic-card rounded-xl p-8 shadow-2xl depth-3">
            <h2 className="text-3xl font-bold mb-8 text-center text-luxury">AI Diagnostic Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-glow">Vehicle Information</h3>
                <div className="space-y-3">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Vehicle:</span>
                    <span className="text-white font-medium">{diagnosticResult.vehicle.year} {diagnosticResult.vehicle.make} {diagnosticResult.vehicle.model}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Mileage:</span>
                    <span className="text-white font-medium">{diagnosticResult.vehicle.mileage.toLocaleString()} km</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Trouble Code:</span>
                    <span className="font-mono text-champagne font-bold">{diagnosticResult.diagnosticResults.troubleCodes[0]}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Priority:</span>
                    <span>{getSeverityBadge(diagnosticResult.aiInterpretation.urgencyLevel)}</span>
                  </p>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-glow">Cost Estimate</h3>
                <div className="space-y-3">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Estimated Range:</span>
                    <span className="font-bold text-luxury">
                      ${diagnosticResult.aiInterpretation.estimatedCost.min} - ${diagnosticResult.aiInterpretation.estimatedCost.max} {diagnosticResult.aiInterpretation.estimatedCost.currency}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">AI Confidence:</span>
                    <span className="text-white font-medium">{diagnosticResult.aiInterpretation.confidence}%</span>
                  </p>
                  {diagnosticResult.diagnosticResults.symptoms.length > 0 && (
                    <div>
                      <span className="text-gray-400">Reported Symptoms:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {diagnosticResult.diagnosticResults.symptoms.map((symptom: string, index: number) => (
                          <span key={index} className="glass-card text-xs text-blue-400 px-3 py-1 rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4 text-glow">AI Interpretation</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">{diagnosticResult.aiInterpretation.interpretation}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-champagne mb-3 text-lg">Possible Causes:</h4>
                  <ul className="space-y-2 text-gray-300">
                    {diagnosticResult.diagnosticResults.possibleCauses.map((cause: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-champagne mr-2">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-500 mb-3 text-lg">Recommended Actions:</h4>
                  <ul className="space-y-2 text-gray-300">
                    {diagnosticResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-glow">
                <Database className="mr-3 text-champagne" size={20} />
                Blockchain Verification
              </h3>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-500 font-medium">{diagnosticResult.blockchainRecord.status}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-300 bg-black/30 px-3 py-1 rounded-lg">{diagnosticResult.blockchainRecord.transactionId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-gray-300">{new Date(diagnosticResult.blockchainRecord.consensusTimestamp).toLocaleString()}</span>
                </p>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">This diagnostic result has been securely recorded on Hedera Hashgraph blockchain for authenticity and immutability.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button className="btn-luxury px-8 py-4 rounded-xl text-lg font-medium">
                Find Compatible Parts in Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostics;