import { Building2, MapPin, DollarSign, Home, Users, CheckCircle2, AlertCircle, ArrowLeft, Image } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { Disclaimer } from './ui/disclaimer';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

interface ListYourVillageProps {
  onClose?: () => void;
}

export function ListYourVillage({ onClose }: ListYourVillageProps) {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    operator: '',
    location: '',
    suburb: '',
    postcode: '',
    state: '',
    
    // Village Type
    village_type: '',
    care_level: '',
    
    // Pricing
    entry_price_min: '',
    entry_price_max: '',
    monthly_fees_min: '',
    monthly_fees_max: '',
    dmf_structure: '',
    dmf_percentage: '',
    dmf_cap: '',
    
    // Attributes
    pet_friendly: false,
    total_units: '',
    bedrooms: [] as string[],
    age_restriction: '55',
    
    // Contact
    contact_phone: '',
    contact_email: '',
    website: '',
    
    // Description
    description: '',
    
    // Amenities & Services
    amenities: [] as string[],
    care_services: [] as string[],
    activities: [] as string[],
    
    // Images
    images: ['', '', '', ''],
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amenitiesList = [
    'Swimming pool',
    'Gym & fitness center',
    'Community center',
    'Library',
    'Cinema room',
    'Bowling green',
    'Tennis courts',
    'Workshop',
    'Arts & crafts studio',
    'Garden plots',
    'Dog park',
    'BBQ areas',
    'Medical center',
    'Hairdresser',
    'Cafe/restaurant',
  ];

  const careServicesList = [
    '24/7 emergency response',
    'On-site nurse',
    'GP visits',
    'Physiotherapy',
    'Podiatry',
    'Meals service',
    'Cleaning service',
    'Laundry service',
    'Transport service',
    'Home maintenance',
  ];

  const activitiesList = [
    'Exercise classes',
    'Arts & crafts',
    'Card games',
    'Movie nights',
    'Excursions',
    'Social events',
    'Dancing',
    'Gardening club',
    'Book club',
    'Cooking classes',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.name || !formData.suburb || !formData.postcode || !formData.state || !formData.contact_email) {
        setError('Please fill in all required fields marked with *');
        setSubmitting(false);
        return;
      }

      // Validate website URL format if provided
      if (formData.website) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(formData.website)) {
          setError('Please enter a valid website URL (e.g., https://example.com or example.com)');
          setSubmitting(false);
          return;
        }
      }

      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.contact_email)) {
        setError('Please enter a valid email address');
        setSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        operator: formData.operator || null,
        location: formData.location,
        suburb: formData.suburb,
        postcode: formData.postcode,
        state: formData.state,
        
        village_type: formData.village_type || null,
        care_level: formData.care_level || null,
        
        entry_price_min: formData.entry_price_min ? parseInt(formData.entry_price_min) : null,
        entry_price_max: formData.entry_price_max ? parseInt(formData.entry_price_max) : null,
        monthly_fees_min: formData.monthly_fees_min ? parseInt(formData.monthly_fees_min) : null,
        monthly_fees_max: formData.monthly_fees_max ? parseInt(formData.monthly_fees_max) : null,
        dmf_structure: formData.dmf_structure || null,
        dmf_percentage: formData.dmf_percentage ? parseFloat(formData.dmf_percentage) : null,
        dmf_cap: formData.dmf_cap ? parseFloat(formData.dmf_cap) : null,
        
        amenities: formData.amenities,
        care_services: formData.care_services,
        activities: formData.activities,
        
        pet_friendly: formData.pet_friendly,
        total_units: formData.total_units ? parseInt(formData.total_units) : null,
        bedrooms: formData.bedrooms,
        age_restriction: formData.age_restriction ? parseInt(formData.age_restriction) : 55,
        
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email,
        website: formData.website || null,
        
        description: formData.description || null,
        images: formData.images, // Add image upload functionality
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Use session token if logged in, otherwise use anon key
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit village');
      }

      setSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        operator: '',
        location: '',
        suburb: '',
        postcode: '',
        state: '',
        village_type: '',
        care_level: '',
        entry_price_min: '',
        entry_price_max: '',
        monthly_fees_min: '',
        monthly_fees_max: '',
        dmf_structure: '',
        dmf_percentage: '',
        dmf_cap: '',
        pet_friendly: false,
        total_units: '',
        bedrooms: [],
        age_restriction: '55',
        contact_phone: '',
        contact_email: '',
        website: '',
        description: '',
        amenities: [],
        care_services: [],
        activities: [],
        images: ['', '', '', ''],
      });
    } catch (err) {
      console.error('Error submitting village:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit village. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
            </div>
            <h2 className="mb-4">Thank You for Your Submission!</h2>
            <p className="text-muted-foreground mb-6">
              Your retirement village listing has been submitted successfully and is now pending review. 
              Our team will review your submission and get back to you within 2-3 business days.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Village
              </Button>
              <Button variant="outline" onClick={() => onClose?.()}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onClose?.()}
          className="mb-6"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4">List Your Retirement Village</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reach thousands of retirees searching for their perfect retirement village. 
            List your village for free and connect with your ideal residents.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-2">Reach More Retirees</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with thousands of retirees actively searching for retirement villages
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-2">Free Listing</h3>
                <p className="text-sm text-muted-foreground">
                  Basic listings are completely free with no hidden costs
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="size-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-2">Full Control</h3>
                <p className="text-sm text-muted-foreground">
                  Update your listing anytime with accurate, current information
                </p>
              </div>
            </div>
          </Card>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="size-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Operator Disclaimer */}
        <Disclaimer variant="default" title="Operator Submission Guidelines" className="mb-6">
          <p className="mb-2">
            <strong>Accuracy of Information:</strong> By submitting this listing, you confirm that you are an authorized representative of the retirement village and that all information provided is accurate, current, and complete.
          </p>
          <p className="mb-2">
            <strong>Verification Process:</strong> All submissions are subject to verification by the RetirePath team. We reserve the right to request supporting documentation and to decline or remove listings that do not meet our quality standards.
          </p>
          <p className="mb-2">
            <strong>Your Responsibilities:</strong> You are responsible for keeping your listing information up to date, including pricing, availability, and contact details. Misleading or inaccurate information may result in removal from our directory.
          </p>
          <p>
            <strong>Terms of Use:</strong> By listing your village, you agree to our Terms of Service and acknowledge that RetirePath is a directory service and not responsible for direct interactions between operators and prospective residents.
          </p>
        </Disclaimer>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="size-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl">Basic Information</h2>
                  <p className="text-sm text-muted-foreground">Essential details about your retirement village</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Village Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sunshine Gardens Retirement Village"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="operator">Operator/Company Name</Label>
                  <Input
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    placeholder="e.g. Retirement Living Group"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Street Address</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. 123 Main Street"
                  />
                </div>

                <div>
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    placeholder="e.g. Brighton"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="e.g. 3186"
                    maxLength={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIC">Victoria</SelectItem>
                      <SelectItem value="NSW">New South Wales</SelectItem>
                      <SelectItem value="QLD">Queensland</SelectItem>
                      <SelectItem value="SA">South Australia</SelectItem>
                      <SelectItem value="WA">Western Australia</SelectItem>
                      <SelectItem value="TAS">Tasmania</SelectItem>
                      <SelectItem value="NT">Northern Territory</SelectItem>
                      <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Village Type */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Home className="size-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl">Village Type & Care</h2>
                  <p className="text-sm text-muted-foreground">What type of retirement living do you offer?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="village_type">Village Type</Label>
                  <Select value={formData.village_type} onValueChange={(value) => setFormData({ ...formData, village_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select village type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freehold">Freehold</SelectItem>
                      <SelectItem value="Loan-License">Loan-License</SelectItem>
                      <SelectItem value="Rental">Rental</SelectItem>
                      <SelectItem value="Strata">Strata Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="care_level">Care Level</Label>
                  <Select value={formData.care_level} onValueChange={(value) => setFormData({ ...formData, care_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select care level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Independent">Independent Living</SelectItem>
                      <SelectItem value="Assisted">Assisted Living</SelectItem>
                      <SelectItem value="Aged Care">Aged Care</SelectItem>
                      <SelectItem value="Mixed">Mixed (Multiple Levels)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="total_units">Total Units/Homes</Label>
                  <Input
                    id="total_units"
                    type="number"
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                    placeholder="e.g. 120"
                  />
                </div>

                <div>
                  <Label htmlFor="age_restriction">Minimum Age</Label>
                  <Input
                    id="age_restriction"
                    type="number"
                    value={formData.age_restriction}
                    onChange={(e) => setFormData({ ...formData, age_restriction: e.target.value })}
                    placeholder="e.g. 55"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-3 block">Available Bedroom Options</Label>
                  <div className="flex gap-4">
                    {['1', '2', '3', '4+'].map((bedroom) => (
                      <label key={bedroom} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.bedrooms.includes(bedroom)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              bedrooms: toggleArrayItem(formData.bedrooms, bedroom),
                            })
                          }
                        />
                        <span>{bedroom} bedroom{bedroom !== '1' ? 's' : ''}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.pet_friendly}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pet_friendly: checked as boolean })
                      }
                    />
                    <span>Pet Friendly</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl">Pricing Information</h2>
                  <p className="text-sm text-muted-foreground">Entry costs and ongoing fees</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="entry_price_min">Entry Price (From)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="entry_price_min"
                      type="number"
                      className="pl-7"
                      value={formData.entry_price_min}
                      onChange={(e) => setFormData({ ...formData, entry_price_min: e.target.value })}
                      placeholder="400000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="entry_price_max">Entry Price (To)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="entry_price_max"
                      type="number"
                      className="pl-7"
                      value={formData.entry_price_max}
                      onChange={(e) => setFormData({ ...formData, entry_price_max: e.target.value })}
                      placeholder="600000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthly_fees_min">Monthly Fees (From)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthly_fees_min"
                      type="number"
                      className="pl-7"
                      value={formData.monthly_fees_min}
                      onChange={(e) => setFormData({ ...formData, monthly_fees_min: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthly_fees_max">Monthly Fees (To)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthly_fees_max"
                      type="number"
                      className="pl-7"
                      value={formData.monthly_fees_max}
                      onChange={(e) => setFormData({ ...formData, monthly_fees_max: e.target.value })}
                      placeholder="700"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="dmf_structure">DMF/Exit Fee Structure</Label>
                  <Input
                    id="dmf_structure"
                    value={formData.dmf_structure}
                    onChange={(e) => setFormData({ ...formData, dmf_structure: e.target.value })}
                    placeholder="e.g. 5% per year, capped at 30% after 6 years"
                  />
                </div>

                <div>
                  <Label htmlFor="dmf_percentage">DMF Percentage (% per year)</Label>
                  <Input
                    id="dmf_percentage"
                    type="number"
                    step="0.1"
                    value={formData.dmf_percentage}
                    onChange={(e) => setFormData({ ...formData, dmf_percentage: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <Label htmlFor="dmf_cap">DMF Cap (%)</Label>
                  <Input
                    id="dmf_cap"
                    type="number"
                    step="0.1"
                    value={formData.dmf_cap}
                    onChange={(e) => setFormData({ ...formData, dmf_cap: e.target.value })}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h3 className="mb-4">Amenities & Facilities</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          amenities: toggleArrayItem(formData.amenities, amenity),
                        })
                      }
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Care Services */}
            <div className="mb-8">
              <h3 className="mb-4">Care & Support Services</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {careServicesList.map((service) => (
                  <label key={service} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.care_services.includes(service)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          care_services: toggleArrayItem(formData.care_services, service),
                        })
                      }
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="mb-8">
              <h3 className="mb-4">Activities & Programs</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {activitiesList.map((activity) => (
                  <label key={activity} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.activities.includes(activity)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          activities: toggleArrayItem(formData.activities, activity),
                        })
                      }
                    />
                    <span className="text-sm">{activity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="size-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">How can retirees get in touch?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="e.g. 03 9999 9999"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email Address *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="e.g. info@yourvillage.com.au"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="e.g. https://yourvillage.com.au"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Image className="size-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl">Village Photos</h2>
                  <p className="text-sm text-muted-foreground">Add image URLs to showcase your village (optional)</p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index}>
                    <Label htmlFor={`image-${index}`}>
                      Image {index + 1} URL {index === 0 && '(Primary - shown on cards)'}
                    </Label>
                    <Input
                      id={`image-${index}`}
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Use high-quality images (at least 1200x800px) from your website. 
                  The first image will be displayed on village cards. Right-click images on your website 
                  and select \"Copy Image Address\" to get the URL.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <Label htmlFor="description">Village Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell retirees about your village... What makes it special? What's the community like? What are the standout features?"
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                A compelling description helps retirees understand what makes your village unique
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onClose?.()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              By submitting, you agree that the information provided is accurate and you have authority to list this village.
              Our team will review your submission within 2-3 business days.
            </p>
          </Card>
        </form>
      </div>
    </div>
  );
}