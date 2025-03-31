import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

function Profile() {
  const { updateProfile1, isUpdateProfile, authUser } = useAuthStore();
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState('');
  
  // Add useEffect to update preview when authUser changes
  useEffect(() => {
    if (authUser?.user?.avatar) {
      setPreview(authUser.user.avatar);
    }
  }, [authUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!avatar) {
      toast.error('Please select an avatar');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);
    
    try {
      await updateProfile1(formData);
    } catch (error) {
      toast.error('Failed to update avatar', error.message);
    }
  };

  if (!authUser) return <div className="text-center p-8">Please login to view profile</div>;

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-md mx-auto bg-base-100 rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="text-white w-16 h-16" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-secondary rounded-full p-2 cursor-pointer">
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUpdateProfile}
              />
            </label>
          </div>
          <div className="flex flex-col items-center">
            {isUpdateProfile ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                <p className="text-sm text-gray-500 mt-2">Uploading avatar...</p>
              </>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Change your avatar</p>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{authUser?.user?.fullname}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{authUser?.user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={isUpdateProfile}
          className={`btn btn-primary w-full ${isUpdateProfile ? 'loading' : ''}`}
        >
          {isUpdateProfile ? 'Updating...' : 'Update Avatar'}
        </button>
      </div>
    </div>
  );
}

export default Profile;