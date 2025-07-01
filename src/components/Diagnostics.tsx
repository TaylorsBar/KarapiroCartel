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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-red-600 uppercase tracking-wider mb-12 relative">
        AI-Powered Vehicle Diagnostics
        <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-700 to-red-500"></span>
      </h1>
      
      <div className="flex mb-6 border-b border-zinc-800">
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'scan' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('scan')}
        >
          Diagnostic Scan
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'codes' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('codes')}
        >
          Common Codes
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'symptoms' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('symptoms')}
        >
          Symptom Checker
        </button>
      </div>
      
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Car className="mr-2 text-red-600" />
              Vehicle Diagnostic Scan
            </h2>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Make</label>
                <select
                  value={vehicleMake}
                  onChange={(e) => {
                    setVehicleMake(e.target.value);
                    setVehicleModel(''); // Reset model when make changes
                  }}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  required
                >
                  <option value="">Select Vehicle Make</option>
                  {popularMakes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Model</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  disabled={!vehicleMake}
                  required
                >
                  <option value="">Select Vehicle Model</option>
                  {vehicleMake && commonModels[vehicleMake]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Year</label>
                  <select
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                    required
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g., 85000"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Diagnostic Trouble Code</label>
                <input
                  type="text"
                  value={troubleCode}
                  onChange={(e) => setTroubleCode(e.target.value.toUpperCase())}
                  placeholder="e.g., P0300"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the code from your OBD2 scanner or check engine light</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symptoms (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonSymptoms.slice(0, 6).map(symptom => (
                    <label key={symptom} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={symptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                        className="mr-2 text-red-600"
                      />
                      <span className="text-gray-300">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Analyzing Vehicle...
                  </>
                ) : (
                  <>
                    <Cpu size={18} className="mr-2" />
                    Run AI Diagnostic Analysis
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Database className="mr-2 text-red-600" />
              Common Diagnostic Codes
            </h2>
            
            <div className="space-y-2">
              {commonCodes.map((code) => (
                <div 
                  key={code.code}
                  onClick={() => handleCodeSelect(code.code)}
                  className="flex justify-between items-center p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-red-500 font-mono font-bold">{code.code}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        code.severity === 'high' ? 'bg-red-600/20 text-red-500' :
                        code.severity === 'medium' ? 'bg-amber-600/20 text-amber-500' :
                        'bg-green-600/20 text-green-500'
                      }`}>
                        {code.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{code.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-500 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'codes' && (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">OBD2 Code Reference</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-red-500">P Codes - Powertrain</h3>
                <p className="text-gray-400 text-sm mb-3">Related to engine, transmission, and emissions systems</p>
                <div className="space-y-2">
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">P0xxx</span> - Generic OBD-II codes
                  </div>
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">P1xxx</span> - Manufacturer-specific codes
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-amber-500">B Codes - Body</h3>
                <p className="text-gray-400 text-sm mb-3">Related to body systems like airbags, seatbelts, etc.</p>
                <div className="space-y-2">
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">B0xxx</span> - Generic body codes
                  </div>
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">B1xxx</span> - Manufacturer-specific codes
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-500">C Codes - Chassis</h3>
                <p className="text-gray-400 text-sm mb-3">Related to chassis systems like brakes, steering, etc.</p>
                <div className="space-y-2">
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">C0xxx</span> - Generic chassis codes
                  </div>
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">C1xxx</span> - Manufacturer-specific codes
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-green-500">U Codes - Network</h3>
                <p className="text-gray-400 text-sm mb-3">Related to network and computer systems</p>
                <div className="space-y-2">
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">U0xxx</span> - Generic network codes
                  </div>
                  <div className="bg-zinc-700/30 p-2 rounded">
                    <span className="font-mono text-white">U1xxx</span> - Manufacturer-specific codes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'symptoms' && (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Symptom-Based Diagnosis</h2>
          <p className="text-gray-400 mb-6">Select the symptoms your vehicle is experiencing for AI-powered diagnosis suggestions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonSymptoms.map(symptom => (
              <label key={symptom} className="flex items-center p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={symptoms.includes(symptom)}
                  onChange={() => handleSymptomToggle(symptom)}
                  className="mr-3 text-red-600"
                />
                <span className="text-gray-300">{symptom}</span>
              </label>
            ))}
          </div>

          {symptoms.length > 0 && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
              <h3 className="font-semibold text-red-400 mb-2">Selected Symptoms Analysis</h3>
              <p className="text-gray-300 text-sm">
                Based on the symptoms you've selected ({symptoms.join(', ')}), 
                common diagnostic codes to check include: P0300, P0171, P0420. 
                Consider running a full diagnostic scan for accurate results.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Diagnostic Results */}
      {diagnosticResult && (
        <div className="mt-8 bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-600">AI Diagnostic Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-400">Vehicle:</span>
                  <span>{diagnosticResult.vehicle.year} {diagnosticResult.vehicle.make} {diagnosticResult.vehicle.model}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Mileage:</span>
                  <span>{diagnosticResult.vehicle.mileage.toLocaleString()} km</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Trouble Code:</span>
                  <span className="font-mono text-red-500 font-bold">{diagnosticResult.diagnosticResults.troubleCodes[0]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Priority:</span>
                  <span>{getSeverityBadge(diagnosticResult.aiInterpretation.urgencyLevel)}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Cost Estimate</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-400">Estimated Range:</span>
                  <span className="font-bold">
                    ${diagnosticResult.aiInterpretation.estimatedCost.min} - ${diagnosticResult.aiInterpretation.estimatedCost.max} {diagnosticResult.aiInterpretation.estimatedCost.currency}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">AI Confidence:</span>
                  <span>{diagnosticResult.aiInterpretation.confidence}%</span>
                </p>
                {diagnosticResult.diagnosticResults.symptoms.length > 0 && (
                  <div>
                    <span className="text-gray-400">Reported Symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {diagnosticResult.diagnosticResults.symptoms.map((symptom: string, index: number) => (
                        <span key={index} className="text-xs bg-blue-900/20 text-blue-400 px-2 py-1 rounded">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">AI Interpretation</h3>
            <p className="text-gray-300 mb-4">{diagnosticResult.aiInterpretation.interpretation}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-red-500 mb-2">Possible Causes:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {diagnosticResult.diagnosticResults.possibleCauses.map((cause: string, index: number) => (
                    <li key={index} className="text-sm">{cause}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-green-500 mb-2">Recommended Actions:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {diagnosticResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Database className="mr-2 text-red-600" size={18} />
              Blockchain Verification
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-500">{diagnosticResult.blockchainRecord.status}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="font-mono text-xs truncate max-w-[250px]">{diagnosticResult.blockchainRecord.transactionId}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span>{new Date(diagnosticResult.blockchainRecord.consensusTimestamp).toLocaleString()}</span>
              </p>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">This diagnostic result has been securely recorded on Hedera Hashgraph blockchain for authenticity and immutability.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-md hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium">
              Find Compatible Parts in Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;