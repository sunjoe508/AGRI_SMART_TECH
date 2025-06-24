
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Camera } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUpdate: (url: string) => void;
}

const ProfilePhotoUpload = ({ userId, currentPhotoUrl, onPhotoUpdate }: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onPhotoUpdate(data.publicUrl);
      
      toast({
        title: "✅ Photo Uploaded",
        description: "Profile photo updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async () => {
    try {
      if (currentPhotoUrl) {
        const fileName = currentPhotoUrl.split('/').pop();
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${fileName}`]);
      }
      
      onPhotoUpdate('');
      
      toast({
        title: "✅ Photo Deleted",
        description: "Profile photo removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </Button>
          </label>
        </div>
        
        {currentPhotoUrl && (
          <Button
            variant="outline"
            onClick={deletePhoto}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-2" />
            Delete Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
