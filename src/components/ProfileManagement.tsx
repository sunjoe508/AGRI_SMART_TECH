import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, MapPin, Sprout, Save } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfilePhotoUpload from './ProfilePhotoUpload';

interface ProfileManagementProps {
  user: any;
}

const ProfileManagement = ({ user }: ProfileManagementProps) => {
  const [profile, setProfile] = useState({
    full_name: '',
    phone_number: '',
    county: '',
    sub_county: '',
    ward: '',
    farm_name: '',
    farm_size_acres: '',
    crop_types: [] as string[],
    profile_picture_url: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const kenyanCounties = [
    'Nairobi', 'Kiambu', 'Nakuru', 'Meru', 'Kisumu', 'Mombasa', 
    'Uasin Gishu', 'Murang\'a', 'Nyeri', 'Machakos', 'Kajiado',
    'Nyandarua', 'Laikipia', 'Kirinyaga', 'Embu', 'Tharaka Nithi',
    'Kitui', 'Makueni', 'Nzaui', 'Taita Taveta', 'Kwale', 'Kilifi',
    'Tana River', 'Lamu', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
    'Isiolo', 'Samburu', 'Trans Nzoia', 'Bungoma', 'Busia', 'Siaya',
    'Kisii', 'Nyamira', 'Narok', 'Bomet', 'Kericho', 'Nandi',
    'Baringo', 'Elgeyo Marakwet', 'West Pokot', 'Turkana'
  ];

  const cropTypes = [
    'Maize', 'Beans', 'Rice', 'Wheat', 'Potatoes', 'Sweet Potatoes',
    'Cassava', 'Bananas', 'Coffee', 'Tea', 'Sugarcane', 'Cotton',
    'Tomatoes', 'Onions', 'Cabbages', 'Kales', 'Spinach', 'Carrots'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle for better error handling

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      // Set profile data or default values if no profile exists
      setProfile({
        full_name: data?.full_name || '',
        phone_number: data?.phone_number || '',
        county: data?.county || '',
        sub_county: data?.sub_county || '',
        ward: data?.ward || '',
        farm_name: data?.farm_name || '',
        farm_size_acres: data?.farm_size_acres ? String(data.farm_size_acres) : '',
        crop_types: data?.crop_types || [],
        profile_picture_url: (data as any)?.profile_picture_url || ''
      });

      // If no profile exists, show helpful message
      if (!data) {
        toast({
          title: "👋 Welcome!",
          description: "Please complete your profile to get started",
        });
      }
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      toast({
        title: "❌ Database Connection Error",
        description: `Failed to load profile: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!profile.full_name.trim()) {
        throw new Error('Full name is required');
      }

      const profileData = {
        id: user.id,
        full_name: profile.full_name.trim(),
        phone_number: profile.phone_number.trim(),
        county: profile.county,
        sub_county: profile.sub_county.trim(),
        ward: profile.ward.trim(),
        farm_name: profile.farm_name.trim(),
        farm_size_acres: profile.farm_size_acres ? parseFloat(profile.farm_size_acres) : null,
        crop_types: profile.crop_types,
        profile_picture_url: profile.profile_picture_url,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // Verify the update was successful
      if (data) {
        toast({
          title: "✅ Profile Updated Successfully",
          description: "Your profile has been saved to the database",
        });
      } else {
        throw new Error('Profile update verification failed');
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast({
        title: "❌ Database Update Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCropTypeChange = (cropType: string, checked: boolean) => {
    if (checked) {
      setProfile(prev => ({
        ...prev,
        crop_types: [...prev.crop_types, cropType]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        crop_types: prev.crop_types.filter(crop => crop !== cropType)
      }));
    }
  };

  const handlePhotoUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, profile_picture_url: url }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-green-600" />
            <span>Profile Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <ProfilePhotoUpload
              userId={user.id}
              currentPhotoUrl={profile.profile_picture_url}
              onPhotoUpdate={handlePhotoUpdate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profile.phone_number}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+254700000000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select value={profile.county} onValueChange={(value) => setProfile(prev => ({ ...prev, county: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanCounties.map((county) => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_county">Sub County</Label>
                <Input
                  id="sub_county"
                  value={profile.sub_county}
                  onChange={(e) => setProfile(prev => ({ ...prev, sub_county: e.target.value }))}
                  placeholder="Enter sub county"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  value={profile.ward}
                  onChange={(e) => setProfile(prev => ({ ...prev, ward: e.target.value }))}
                  placeholder="Enter ward"
                />
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <Sprout className="w-5 h-5 mr-2" />
              Farm Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm_name">Farm Name</Label>
                <Input
                  id="farm_name"
                  value={profile.farm_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, farm_name: e.target.value }))}
                  placeholder="Green Valley Farm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_size">Farm Size (Acres)</Label>
                <Input
                  id="farm_size"
                  type="number"
                  value={profile.farm_size_acres}
                  onChange={(e) => setProfile(prev => ({ ...prev, farm_size_acres: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Crop Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {cropTypes.map((crop) => (
                  <div key={crop} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={crop}
                      checked={profile.crop_types.includes(crop)}
                      onChange={(e) => handleCropTypeChange(crop, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={crop} className="text-sm">{crop}</Label>
                  </div>
                ))}
              </div>
            </div>

            {profile.crop_types.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.crop_types.map((crop) => (
                  <Badge key={crop} variant="secondary" className="bg-green-100 text-green-800">
                    {crop}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={updateProfile}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Updating Profile...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
