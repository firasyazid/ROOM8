'use client';
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllAIConfigs,
  updateAIConfig,
  getAvailableModels, AIConfig,
  AIConfigUpdate
} from "../../services/prompt_service";
import ComponentCard from "../common/ComponentCard";

// Simple Modal Component
const PromptModal = ({ content, isOpen, onClose }: { content: string; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{content.length} characters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Press ESC to close</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Edit Modal Component
const EditModal = ({ 
  config, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  config: AIConfig | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (updates: AIConfigUpdate) => Promise<void>;
}) => {
  const [editForm, setEditForm] = useState<AIConfigUpdate>({
    prompt_content: '',
    openrouter_model: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update form when config changes
  useEffect(() => {
    if (config) {
      setEditForm({
        prompt_content: config.prompt_content,
        openrouter_model: config.openrouter_model,
        description: config.description || ''
      });
    }
  }, [config]);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!editForm.prompt_content?.trim()) {
      errors.push('Prompt content is required');
    }
    if (!editForm.openrouter_model?.trim()) {
      errors.push('Model selection is required');
    }
    if (editForm.prompt_content && editForm.prompt_content.length > 4000) {
      errors.push('Prompt content must be less than 4000 characters');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationErrors([]);
      await onSave(editForm);
      onClose();
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Failed to update configuration']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !config) return null;

  const availableModels = getAvailableModels();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Configuration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{config.prompt_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Model Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  AI Model
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {availableModels.map((model) => (
                    <label
                      key={model.value}
                      className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                        editForm.openrouter_model === model.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={model.value}
                        checked={editForm.openrouter_model === model.value}
                        onChange={(e) => setEditForm(prev => ({ ...prev, openrouter_model: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{model.label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {model.provider}
                          </span>
                        </div>
                      </div>
                      {editForm.openrouter_model === model.value && (
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 ml-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Brief description of this prompt configuration..."
                />
              </div>
            </div>

            {/* Right Column - Prompt Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prompt Content
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={editForm.prompt_content || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, prompt_content: e.target.value }))}
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  placeholder="Enter your AI prompt content here..."
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {editForm.prompt_content?.length || 0}/4000
                </div>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Press ESC to cancel</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PromptPage = () => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAIConfigs();
      // Handle both array response and object response
      if (Array.isArray(response)) {
        setConfigs(response);
      } else {
        setConfigs(response.configs || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPrompt(null);
    };
    if (selectedPrompt) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [selectedPrompt]);

  // Edit handlers
  const handleEditClick = (config: AIConfig) => {
    setEditingConfig(config);
    setShowEditModal(true);
  };

  const handleEditSave = async (updates: AIConfigUpdate) => {
    if (!editingConfig) return;

    try {
      const updatedConfig = await updateAIConfig(editingConfig.prompt_name, updates);
      
      // Update the local state
      setConfigs(prev => prev.map(config => 
        config.id === editingConfig.id ? updatedConfig : config
      ));

      setShowEditModal(false);
      setEditingConfig(null);
    } catch (err) {
      throw err; // Let the EditModal handle the error display
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingConfig(null);
  };

  // Handle ESC key for edit modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEditModal) {
        handleEditCancel();
      }
    };
    if (showEditModal) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showEditModal]);

  // Get unique services for filtering
  const services = ['all', ...Array.from(new Set(configs?.map(config => config.service) || []))];

  // Filter configs by selected service
  const filteredConfigs = selectedService === 'all' 
    ? configs || []
    : configs?.filter(config => config.service === selectedService) || [];

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get service color scheme
  const getServiceColor = (service: string) => {
    const colors = {
      news: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      podcast: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      headlines: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      summaries: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      categories: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    };
    return colors[service as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  // Get model color
  const getModelColor = (model: string) => {
    if (model.includes('gpt-4')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
    if (model.includes('gpt-3')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    if (model.includes('claude')) return 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300';
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const retryFetch = () => {
    fetchConfigs();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ComponentCard title="AI Prompt Configurations" desc="Loading configurations...">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ComponentCard title="AI Prompt Configurations" desc="Error loading configurations">
          <div className="p-6 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Error Loading Configurations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComponentCard 
        title="AI Prompt Configurations" 
        desc={`Managing ${configs?.length || 0} AI prompt configurations`}
      >
        <div className="p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Configs</p>
                  <p className="text-2xl font-bold">{configs?.length || 0}</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            
            {services.filter(s => s !== 'all').map(service => (
              <div key={service} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{service}</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {configs?.filter(c => c.service === service).length || 0}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getServiceColor(service).split(' ')[0]}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Service Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedService === service
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {service === 'all' ? 'All Services' : service.charAt(0).toUpperCase() + service.slice(1)}
                  {service !== 'all' && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                      {configs?.filter(c => c.service === service).length || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Configurations Grid */}
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConfigs.map((config, index) => (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Config Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {config.prompt_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceColor(config.service)}`}>
                          {config.service}
                        </div>
                      </div>
                    </div>
                    {config.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {config.description}
                      </p>
                    )}
                  </div>

                  {/* Model Information */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getModelColor(config.openrouter_model)}`}>
                      {config.openrouter_model}
                    </div>
                  </div>

                  {/* Prompt Content Preview */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Content</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-24 overflow-y-auto">
                      <div 
                        onClick={() => setSelectedPrompt(config.prompt_content)}
                        className="cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md p-2 -m-2 group"
                      >
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                          {config.prompt_content.length > 200 
                            ? `${config.prompt_content.substring(0, 200)}...` 
                            : config.prompt_content
                          }
                        </p>
                        {config.prompt_content.length > 200 && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Click to view full prompt</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button & Timestamps */}
                  <div className="space-y-3">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(config)}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-2 rounded-md transition-all duration-200 font-medium text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md opacity-80 hover:opacity-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>

                    {/* Timestamps */}
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Created: {formatDate(config.created_at)}</span>
                      </div>
                      {config.updated_at !== config.created_at && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Updated: {formatDate(config.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredConfigs.length === 0 && configs.length > 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No configurations found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No AI configurations found for the &quot;{selectedService}&quot; service.
              </p>
              <button
                onClick={() => setSelectedService('all')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All Configurations
              </button>
            </div>
          )}

          {/* Completely Empty State */}
          {configs.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No AI Configurations Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first AI prompt configuration.</p>
            </div>
          )}
        </div>
      </ComponentCard>
      
      {/* Prompt Modal */}
      <AnimatePresence>
        {selectedPrompt && (
          <PromptModal 
            content={selectedPrompt} 
            isOpen={!!selectedPrompt} 
            onClose={() => setSelectedPrompt(null)} 
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal 
            config={editingConfig}
            isOpen={showEditModal}
            onClose={handleEditCancel}
            onSave={handleEditSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptPage;