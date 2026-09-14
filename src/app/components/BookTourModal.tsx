import React from 'react';
import { X, Phone, Mail, Globe, Calendar } from 'lucide-react';

interface BookTourModalProps {
  village: {
    name: string;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    location?: string;
  };
  onClose: () => void;
}

export function BookTourModal({ village, onClose }: BookTourModalProps) {
  const ensureHttps = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[#1B4332] mb-1">Book a Tour</h2>
            <p className="text-gray-600">{village.name}</p>
            {village.location && (
              <p className="text-sm text-gray-500">{village.location}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-4">
            Contact {village.name} to schedule your personalized tour and experience the community firsthand.
          </p>

          <div className="space-y-3">
            {village.contact_phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <a
                    href={`tel:${village.contact_phone}`}
                    className="text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {village.contact_phone}
                  </a>
                </div>
              </div>
            )}

            {village.contact_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${village.contact_email}?subject=Book a Tour - ${village.name}`}
                    className="text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                  >
                    {village.contact_email}
                  </a>
                </div>
              </div>
            )}

            {village.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Website</p>
                  <a
                    href={ensureHttps(village.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                  >
                    {village.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Tip:</span> When booking your tour, ask about:
          </p>
          <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc space-y-1">
            <li>Available accommodation types and pricing</li>
            <li>Community activities and amenities</li>
            <li>Care services and support options</li>
            <li>Contract terms and exit fees</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
