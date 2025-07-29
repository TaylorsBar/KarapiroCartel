import React from 'react';
import { X, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface BlockchainModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  amount: number;
  status: string;
}

const BlockchainModal: React.FC<BlockchainModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  amount,
  status
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-600 rounded-lg w-full max-w-md p-6 shadow-2xl shadow-red-600/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-red-600">Blockchain Transaction</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="text-green-500 mr-2" size={32} />
            <span className="text-xl font-bold text-white">Transaction Confirmed</span>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-white font-medium">Hedera Hashgraph</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="text-white font-medium truncate max-w-[200px]">{transactionId}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white font-medium">{amount.toFixed(2)} HBAR</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-500 font-medium">{status}</span>
            </p>
          </div>
        </div>
        
        <div className="border-t border-zinc-700 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Initiated</span>
            </div>
            <ArrowRight size={16} className="text-zinc-600" />
            <div className="flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Verified</span>
            </div>
            <ArrowRight size={16} className="text-zinc-600" />
            <div className="flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Confirmed</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-3 rounded-md flex items-center justify-center hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainModal;