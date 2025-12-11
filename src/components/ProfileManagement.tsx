import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, MapPin, Sprout, Save, Navigation, Loader2 } from 'lucide-react';
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
    profile_picture_url: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
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
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      setProfile({
        full_name: data?.full_name || '',
        phone_number: data?.phone_number || '',
        county: data?.county || '',
        sub_county: data?.sub_county || '',
        ward: data?.ward || '',
        farm_name: data?.farm_name || '',
        farm_size_acres: data?.farm_size_acres ? String(data.farm_size_acres) : '',
        crop_types: data?.crop_types || [],
        profile_picture_url: (data as any)?.profile_picture_url || '',
        latitude: data?.latitude ? String(data.latitude) : '',
        longitude: data?.longitude ? String(data.longitude) : ''
      });

      if (!data) {
        toast({
          title: "👋 Welcome!",
          description: "Please complete your profile to get started",
        });
      }
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      toast({
        title: "Database Connection Error",
        description: `Failed to load profile: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setLoadingLocation(false);
        toast({
          title: "Location Retrieved",
          description: "Your farm location has been captured successfully",
        });
      },
      (error) => {
        setLoadingLocation(false);
        toast({
          title: "Location Error",
          description: error.message || "Failed to get your location",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      if (!profile.full_name.trim()) {
        throw new Error('Full name is required');
      }

      const profileData = {
        user_id: user.id,
        full_name: profile.full_name.trim(),
        phone_number: profile.phone_number.trim(),
        county: profile.county,
        sub_county: profile.sub_county.trim(),
        ward: profile.ward.trim(),
        farm_name: profile.farm_name.trim(),
        farm_size_acres: profile.farm_size_acres ? parseFloat(profile.farm_size_acres) : null,
        crop_types: profile.crop_types,
        latitude: profile.latitude ? parseFloat(profile.latitude) : null,
        longitude: profile.longitude ? parseFloat(profile.longitude) : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      if (data) {
        toast({
          title: "Profile Updated Successfully",
          description: "Your profile has been saved to the database",
        });
      } else {
        throw new Error('Profile update verification failed');
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast({
        title: "Database Update Failed",
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <User className="w-6 h-6 text-primary" />
            <span>Profile Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
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
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Personal Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone_number}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+254700000000"
                    className="pl-10 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="county" className="text-foreground">County</Label>
                <Select value={profile.county} onValueChange={(value) => setProfile(prev => ({ ...prev, county: value }))}>
                  <SelectTrigger className="bg-background text-foreground">
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
                <Label htmlFor="sub_county" className="text-foreground">Sub County</Label>
                <Input
                  id="sub_county"
                  value={profile.sub_county}
                  onChange={(e) => setProfile(prev => ({ ...prev, sub_county: e.target.value }))}
                  placeholder="Enter sub county"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward" className="text-foreground">Ward</Label>
                <Input
                  id="ward"
                  value={profile.ward}
                  onChange={(e) => setProfile(prev => ({ ...prev, ward: e.target.value }))}
                  placeholder="Enter ward"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-primary" />
              Farm GPS Coordinates
            </h3>
            <p className="text-sm text-muted-foreground">
              Add your exact farm location for accurate mapping. Click the button below to automatically detect your location.
            </p>
            
            <Button 
              onClick={getMyLocation} 
              variant="outline" 
              disabled={loadingLocation}
              className="w-full md:w-auto"
            >
              {loadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Get My Location
                </>
              )}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-foreground">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={profile.latitude}
                  onChange={(e) => setProfile(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="-1.2921"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-foreground">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={profile.longitude}
                  onChange={(e) => setProfile(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="36.8219"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            
            {profile.latitude && profile.longitude && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <MapPin className="w-3 h-3 mr-1" />
                Location set: {profile.latitude}, {profile.longitude}
              </Badge>
            )}
          </div>

          {/* Farm Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-primary" />
              Farm Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm_name" className="text-foreground">Farm Name</Label>
                <Input
                  id="farm_name"
                  value={profile.farm_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, farm_name: e.target.value }))}
                  placeholder="Green Valley Farm"
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_size" className="text-foreground">Farm Size (Acres)</Label>
                <Input
                  id="farm_size"
                  type="number"
                  value={profile.farm_size_acres}
                  onChange={(e) => setProfile(prev => ({ ...prev, farm_size_acres: e.target.value }))}
                  placeholder="10"
                  className="bg-background text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Crop Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {cropTypes.map((crop) => (
                  <div key={crop} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={crop}
                      checked={profile.crop_types.includes(crop)}
                      onChange={(e) => handleCropTypeChange(crop, e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor={crop} className="text-sm text-foreground">{crop}</Label>
                  </div>
                ))}
              </div>
            </div>

            {profile.crop_types.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.crop_types.map((crop) => (
                  <Badge key={crop} variant="secondary" className="bg-primary/10 text-primary">
                    {crop}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={updateProfile}
            className="w-full"
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
