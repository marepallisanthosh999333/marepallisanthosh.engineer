import React, { useState, useEffect } from 'react';
import { X, Github, Loader2 } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';

interface ProjectStructureProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectStructure: React.FC<ProjectStructureProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      // Give some time for the diagram to render
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscape);
        // Restore background scrolling when modal closes
        document.body.style.overflow = 'unset';
      };
    } else {
      // Restore background scrolling when modal closes
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Project Architecture</h2>
            <a
              href="https://github.com/marepallisanthosh999333/marepallisanthosh.engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <Github size={16} />
              View on GitHub
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800">
            🖱️ <strong>Pan:</strong> Click and drag to move around • 
            🔍 <strong>Zoom:</strong> Use mouse wheel to zoom in/out • 
            🔗 <strong>Click nodes:</strong> Navigate to GitHub files • 
            ↩️ <strong>Reset:</strong> Double-click to reset view
          </p>
        </div>

        {/* Diagram Container */}
        <div 
          className="flex-1 p-6 relative overflow-hidden"
          style={{ 
            touchAction: 'none',
            userSelect: 'none'
          }}
          onWheel={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Loading interactive diagram...</p>
              </div>
            </div>
          )}
          <MermaidDiagram />
        </div>
      </div>
    </div>
  );
};

export default ProjectStructure;
