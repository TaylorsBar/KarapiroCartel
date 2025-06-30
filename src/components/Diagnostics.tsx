import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Info, ArrowRight, Cpu, Database } from 'lucide-react';

const Diagnostics: React.FC = () => {
  const [vin, setVin] = useState<string>('');
  const [troubleCode, setTroubleCode] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('scan');

  const commonCodes = [
    { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected' },
    { code: 'P0171', description: 'System Too Lean (Bank 1)' },
    { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold' },
    { code: 'P0455', description: 'Evaporative Emission System Leak Detected (large leak)' },
    { code: 'P0401', description: 'Exhaust Gas Recirculation Flow Insufficient' }
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to diagnostic service
    try {
      // In a real implementation, this would call the backend service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate response
      const mockResult = {
        vin,
        vehicleInfo: {
          make: 'Toyota',
          model: 'Supra',
          year: parseInt(year),
          engine: '3.0L Inline-6 Turbo'
        },
        diagnosticResults: {
          troubleCodes: [troubleCode],
          description: troubleCode === 'P0300' 
            ? 'Multiple cylinder misfires detected' 
            : 'Oxygen sensor circuit malfunction',
          possibleCauses: [
            'Faulty spark plugs',
            'Damaged ignition coils',
            'Fuel injector issues',
            'Vacuum leaks'
          ]
        },
        aiInterpretation: {
          interpretation: `Based on the diagnostic code ${troubleCode} and the vehicle's mileage of ${mileage}, this appears to be a ${troubleCode === 'P0300' ? 'misfire issue that could be caused by worn spark plugs or ignition coils' : 'sensor issue that may require replacement of the oxygen sensor'}. The severity is moderate but should be addressed soon to prevent further damage to the catalytic converter.`,
          confidence: 85,
          urgencyLevel: 'MEDIUM',
          estimatedCost: {
            min: 150,
            max: 450,
            currency: 'USD',
            confidence: 'medium'
          }
        },
        blockchainRecord: {
          status: 'recorded',
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          consensusTimestamp: new Date().toISOString()
        }
      };
      
      setDiagnosticResult(mockResult);
    } catch (error) {
      console.error('Error during diagnostic scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSelect = (code: string) => {
    setTroubleCode(code);
  };

  const getSeverityBadge = (level: string) => {
    switch(level) {
      case 'HIGH':
        return (
          <div className="inline-flex items-center bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm">
            <AlertTriangle size={14} className="mr-1" />
            High Severity
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="inline-flex items-center bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full text-sm">
            <Info size={14} className="mr-1" />
            Medium Severity
          </div>
        );
      case 'LOW':
        return (
          <div className="inline-flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm">
            <CheckCircle size={14} className="mr-1" />
            Low Severity
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
          className={`px-4 py-3 font-medium ${activeTab === 'history' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('history')}
        >
          Diagnostic History
        </button>
        <button
          className={`px-4 py-3 font-medium ${activeTab === 'codes' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('codes')}
        >
          Common Codes
        </button>
      </div>
      
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Wrench className="mr-2 text-red-600" />
              OBD2 Diagnostic Scan
            </h2>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle VIN</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Enter 17-digit VIN"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Trouble Code</label>
                <input
                  type="text"
                  value={troubleCode}
                  onChange={(e) => setTroubleCode(e.target.value)}
                  placeholder="e.g., P0300"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2018"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mileage</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g., 45000"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                    required
                  />
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
                    Processing...
                  </>
                ) : (
                  <>
                    <Cpu size={18} className="mr-2" />
                    Run Diagnostic Scan
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
                  <div>
                    <span className="text-red-500 font-mono font-bold">{code.code}</span>
                    <p className="text-sm text-gray-400">{code.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Diagnostic History</h2>
          <p className="text-gray-400 text-center py-8">No diagnostic history available. Run a diagnostic scan to see results here.</p>
        </div>
      )}
      
      {activeTab === 'codes' && (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">OBD2 Code Reference</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-red-500">P Codes - Powertrain</h3>
                <p className="text-gray-400 text-sm">Related to engine, transmission, and emissions systems</p>
                <div className="mt-3 space-y-2">
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
                <p className="text-gray-400 text-sm">Related to body systems like airbags, seatbelts, etc.</p>
                <div className="mt-3 space-y-2">
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
                <p className="text-gray-400 text-sm">Related to chassis systems like brakes, steering, etc.</p>
                <div className="mt-3 space-y-2">
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
                <p className="text-gray-400 text-sm">Related to network and computer systems</p>
                <div className="mt-3 space-y-2">
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
      
      {/* Diagnostic Results */}
      {diagnosticResult && (
        <div className="mt-8 bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Diagnostic Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-400">VIN:</span>
                  <span className="font-mono">{diagnosticResult.vin}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Make:</span>
                  <span>{diagnosticResult.vehicleInfo.make}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span>{diagnosticResult.vehicleInfo.model}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Year:</span>
                  <span>{diagnosticResult.vehicleInfo.year}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Engine:</span>
                  <span>{diagnosticResult.vehicleInfo.engine}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Diagnostic Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-400">Trouble Code:</span>
                  <span className="font-mono text-red-500 font-bold">{diagnosticResult.diagnosticResults.troubleCodes[0]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Description:</span>
                  <span>{diagnosticResult.diagnosticResults.description}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Severity:</span>
                  <span>{getSeverityBadge(diagnosticResult.aiInterpretation.urgencyLevel)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Confidence:</span>
                  <span>{diagnosticResult.aiInterpretation.confidence}%</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">AI Interpretation</h3>
            <p className="text-gray-300 mb-4">{diagnosticResult.aiInterpretation.interpretation}</p>
            
            <h4 className="font-medium text-red-500 mb-2">Possible Causes:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 mb-4">
              {diagnosticResult.diagnosticResults.possibleCauses.map((cause: string, index: number) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
            
            <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-4">
              <h4 className="font-medium text-red-500 mb-2">Estimated Repair Cost:</h4>
              <p className="text-xl font-bold text-white">
                ${diagnosticResult.aiInterpretation.estimatedCost.min} - ${diagnosticResult.aiInterpretation.estimatedCost.max} 
                <span className="text-sm font-normal text-gray-400 ml-1">
                  ({diagnosticResult.aiInterpretation.estimatedCost.currency})
                </span>
              </p>
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
              Get Parts Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;