import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Home, Users, Star, ArrowLeft, Phone, Mail, Globe, ExternalLink, Calendar, Image as ImageIcon, AlertCircle, Flag, X, ChevronLeft, ChevronRight, AlertTriangle, Building2, Heart, Activity, Dumbbell, Utensils } from 'lucide-react';
import { GoogleMap } from './GoogleMap';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportIssueModal } from './ReportIssueModal';
import { BookTourModal } from './BookTourModal';
import { VillageReviews } from './VillageReviews';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  village_type: string | null;
  care_level: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  dmf_type: string | null;
  amenities: string[];
  units_available: number | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  status: string;
  partnership_status: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
}

interface VillageProfileProps {
  villageId: string;
  onClose: () => void;
}

type TabType = 'overview' | 'amenities' | 'pricing' | 'reviews';

export function VillageProfile({ villageId, onClose }: VillageProfileProps) {
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBookTourModal, setShowBookTourModal] = useState(false);

  useEffect(() => {
    fetchVillage();
  }, [villageId]);

  const fetchVillage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/${villageId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch village details');
      }

      const data = await response.json();
      console.log('Village data received:', data.village);
      console.log('Website field:', data.village.website);
      setVillage(data.village);
    } catch (err: any) {
      console.error('Error fetching village:', err);
      setError('Failed to load village details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Contact for pricing';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Contact for pricing';
  };

  const formatDMFType = (type: string | null) => {
    if (!type) return null;
    const types: Record<string, string> = {
      deferred: 'Deferred Management Fee',
      exit: 'Exit Fee',
      weekly: 'Weekly Fee',
      combination: 'Combination',
    };
    return types[type] || type;
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextImage = () => {
    const images = getVillageImages();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getVillageImages();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Get village images or fallback to placeholder
  const getVillageImages = () => {
    if (village?.images && village.images.length > 0 && village.images.some(img => img && img.trim() !== '')) {
      return village.images.filter(img => img && img.trim() !== '');
    }
    // No placeholder images - return empty array
    return [];
  };

  const hasRealImages = () => {
    return village?.images && village.images.length > 0 && village.images.some(img => img && img.trim() !== '');
  };

  const handleBookTour = () => {
    setShowBookTourModal(true);
  };

  const ensureHttps = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading village details...</p>
        </div>
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onClose} variant="outline" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Directory
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Village not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={onClose} variant="outline">
            <ArrowLeft className="size-4 mr-2" />
            Back to Directory
          </Button>
          <Button onClick={handleBookTour} className="bg-emerald-600 hover:bg-emerald-700">
            <Calendar className="size-4 mr-2" />
            Book a Tour
          </Button>
        </div>
      </div>

      {/* Hero Image Gallery */}
      {hasRealImages() && (
        <div className="relative h-96 bg-gray-900">
          <div className="grid grid-cols-4 gap-2 h-full p-2">
            {getVillageImages().map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${
                  index === 0 ? 'col-span-2 row-span-2' : ''
                } hover:opacity-90 transition-opacity`}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image}
                  alt={`${village.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {getVillageImages().length > 4 && (
            <Button
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100"
            >
              View all {getVillageImages().length} photos
            </Button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <Button
            onClick={() => setShowLightbox(false)}
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="size-6" />
          </Button>
          <Button
            onClick={prevImage}
            variant="ghost"
            className="absolute left-4 text-white hover:bg-white/20"
          >
            <ChevronLeft className="size-8" />
          </Button>
          <Button
            onClick={nextImage}
            variant="ghost"
            className="absolute right-4 text-white hover:bg-white/20"
          >
            <ChevronRight className="size-8" />
          </Button>
          <img
            src={getVillageImages()[lightboxIndex]}
            alt={`${village.name} - Image ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {lightboxIndex + 1} / {getVillageImages().length}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Village Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl mb-2">{village.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="size-4" />
                    <span>{village.location}, {village.suburb}, {village.state} {village.postcode}</span>
                  </div>
                  {village.operator && (
                    <p className="text-muted-foreground">
                      Operated by <span className="font-medium">{village.operator}</span>
                    </p>
                  )}
                </div>
                {village.partnership_status === 'active' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Featured Partner
                  </Badge>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3">
                {village.village_type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="size-3" />
                    {village.village_type}
                  </Badge>
                )}
                {village.care_level && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="size-3" />
                    {village.care_level}
                  </Badge>
                )}
                {village.units_available !== null && village.units_available > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Home className="size-3" />
                    {village.units_available} units available
                  </Badge>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex gap-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'pricing', label: 'Pricing' },
                  { id: 'reviews', label: 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {village.description && (
                    <Card className="p-6">
                      <h3 className="text-xl mb-4">About {village.name}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {village.description}
                      </p>
                    </Card>
                  )}

                  {/* Interactive Map */}
                  <Card className="p-6">
                    <h3 className="text-xl mb-4">Location</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-80">
                      {village.latitude && village.longitude ? (
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${village.latitude},${village.longitude}&zoom=15`}
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                            `${village.location}, ${village.suburb}, ${village.state} ${village.postcode}`
                          )}&zoom=15`}
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      <MapPin className="size-4 inline mr-1" />
                      {village.location}, {village.suburb}, {village.state} {village.postcode}
                    </p>
                  </Card>
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === 'amenities' && (
                <Card className="p-6">
                  <h3 className="text-xl mb-6">Facilities & Services</h3>
                  {village.amenities && village.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {village.amenities.map((amenity, index) => {
                        const iconMap: Record<string, any> = {
                          'swimming pool': Activity,
                          'gym': Dumbbell,
                          'dining': Utensils,
                          'community': Users,
                        };
                        
                        const IconComponent = Object.entries(iconMap).find(([key]) => 
                          amenity.toLowerCase().includes(key)
                        )?.[1] || Heart;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg"
                          >
                            <IconComponent className="size-5 text-emerald-600" />
                            <span className="capitalize">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Amenity information not available. Please contact the village for details.
                    </p>
                  )}
                </Card>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-xl mb-6">Pricing Information</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="size-5 text-emerald-600" />
                          <h4 className="font-medium">Entry Price Range</h4>
                        </div>
                        <p className="text-2xl text-emerald-700">
                          {formatPrice(village.price_range_min, village.price_range_max)}
                        </p>
                      </div>

                      {village.dmf_type && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="size-5 text-gray-600" />
                            <h4 className="font-medium">Fee Structure</h4>
                          </div>
                          <p className="text-muted-foreground">
                            {formatDMFType(village.dmf_type)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Prices are indicative and subject to change. Contact the village directly for current pricing and availability.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {!showReviewForm ? (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Star className="size-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  ) : (
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl">Write a Review</h3>
                        <Button
                          onClick={() => setShowReviewForm(false)}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                      <ReviewSubmissionForm
                        villageId={village.id}
                        villageName={village.name}
                        onSuccess={() => {
                          setShowReviewForm(false);
                          // Reviews will be refreshed automatically by VillageReviews component
                        }}
                      />
                    </Card>
                  )}

                  <VillageReviews villageId={village.id} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <Card className="p-6">
                <h3 className="text-xl mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {village.contact_phone && (
                    <a
                      href={`tel:${village.contact_phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="size-5 text-emerald-600" />
                      <span>{village.contact_phone}</span>
                    </a>
                  )}
                  {village.contact_email && (
                    <a
                      href={`mailto:${village.contact_email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="size-5 text-emerald-600" />
                      <span className="truncate">{village.contact_email}</span>
                    </a>
                  )}
                  {village.website && (
                    <a
                      href={ensureHttps(village.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="size-5 text-emerald-600" />
                      <span className="truncate">Visit Website</span>
                      <ExternalLink className="size-4 ml-auto" />
                    </a>
                  )}
                </div>
              </Card>

              {/* CTA Card */}
              <Card className="p-6 bg-emerald-50 border-emerald-200">
                <h3 className="text-xl mb-3">Ready to Visit?</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Book a tour to experience {village.name} in person and meet the community.
                </p>
                <Button
                  onClick={handleBookTour}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  <Calendar className="size-5 mr-2" />
                  Book a Tour
                </Button>
              </Card>

              {/* Partnership Badge */}
              {village.partnership_status === 'active' && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Building2 className="size-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium mb-1">Featured Partner</h4>
                      <p className="text-sm text-muted-foreground">
                        This village is a verified RetirePath partner, offering exclusive benefits to our members.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Report Issue Button */}
              <Button
                onClick={() => setShowReportModal(true)}
                variant="outline"
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <AlertTriangle className="size-4 mr-2" />
                Report an Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <ReportIssueModal
          villageId={village.id}
          villageName={village.name}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Book Tour Modal */}
      {showBookTourModal && village && (
        <BookTourModal
          village={{
            name: village.name,
            contact_phone: village.contact_phone || undefined,
            contact_email: village.contact_email || undefined,
            website: village.website || undefined,
            location: `${village.location}, ${village.suburb}, ${village.state} ${village.postcode}`
          }}
          onClose={() => setShowBookTourModal(false)}
        />
      )}
    </div>
  );
}