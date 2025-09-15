'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';

export default function ImportModal({ onClose, onSuccess }) {
  const [csvData, setCsvData] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const importMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import leads');
      }
      
      return response.json();
    },
    onSuccess: (results) => {
      setImportResults(results);
      if (results.imported > 0) {
        toast.success(`Successfully imported ${results.imported} leads`);
        if (results.skipped > 0) {
          toast.warning(`${results.skipped} leads were skipped`);
        }
      } else {
        toast.error('No leads were imported');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileUpload = (file) => {
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvData.trim()) {
      toast.error('Please upload a CSV file or paste CSV data');
      return;
    }
    importMutation.mutate(csvData);
  };

  const downloadTemplate = () => {
    const template = `First Name,Last Name,Email,Phone,Company,Budget Min,Budget Max,Location,Property Type,Timeline,Notes,Status,Source
John,Smith,john.smith@example.com,555-0123,Smith Corp,500000,750000,Downtown,Office,3-6 months,Looking for modern office space,new,website
Sarah,Johnson,sarah.j@example.com,555-0456,Johnson LLC,200000,400000,Suburbs,Retail,1-3 months,Need retail space for new store,new,referral`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFinish = () => {
    if (importResults && importResults.imported > 0) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!importResults ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Import Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• CSV file must include columns: First Name, Last Name, Email</li>
                  <li>• Optional columns: Phone, Company, Budget Min, Budget Max, Location, Property Type, Timeline, Notes, Status, Source</li>
                  <li>• Email addresses must be unique</li>
                  <li>• Budget amounts should be numbers without currency symbols</li>
                </ul>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Download size={16} />
                  <span>Download Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your CSV file here, or{' '}
                    <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">CSV files only</p>
                </div>
              </div>

              {/* CSV Data Preview */}
              {csvData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data Preview
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Or paste your CSV data here..."
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!csvData.trim() || importMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importMutation.isLoading ? 'Importing...' : 'Import Leads'}
                </button>
              </div>
            </form>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete</h3>
              </div>

              {/* Results Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                    <div className="text-sm text-gray-600">Imported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importResults.errors && importResults.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                    Issues Found
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}