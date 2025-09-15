'use client';

import React from 'react';
import { X, Edit, Mail, Phone, Building, MapPin, Calendar, DollarSign, Clock, FileText, Tag } from 'lucide-react';

export default function LeadDetails({ lead, onClose, onEdit }) {
  const formatBudget = (min, max) => {
    if (!min && !max) return 'Not specified';
    const formatAmount = (amount) => amount ? `$${amount.toLocaleString()}` : '';
    if (min && max) return `${formatAmount(min)} - ${formatAmount(max)}`;
    if (min) return `From ${formatAmount(min)}`;
    if (max) return `Up to ${formatAmount(max)}`;
    return 'Not specified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {lead.first_name} {lead.last_name}
            </h2>
            <p className="text-gray-600">{lead.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Lead Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
              {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
            </span>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
              </div>

              {lead.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{lead.phone}</p>
                  </div>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center space-x-3">
                  <Building className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{lead.company}</p>
                  </div>
                </div>
              )}

              {lead.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{lead.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.property_type && (
                <div className="flex items-center space-x-3">
                  <Building className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="font-medium">{lead.property_type}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <DollarSign className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Budget Range</p>
                  <p className="font-medium">{formatBudget(lead.budget_min, lead.budget_max)}</p>
                </div>
              </div>

              {lead.timeline && (
                <div className="flex items-center space-x-3">
                  <Clock className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Timeline</p>
                    <p className="font-medium">{lead.timeline}</p>
                  </div>
                </div>
              )}

              {lead.source && (
                <div className="flex items-center space-x-3">
                  <Tag className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="font-medium">{lead.source}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="flex items-start space-x-3">
                <FileText className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{formatDate(lead.created_at)}</p>
                </div>
              </div>

              {lead.updated_at && lead.updated_at !== lead.created_at && (
                <div className="flex items-center space-x-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{formatDate(lead.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
}