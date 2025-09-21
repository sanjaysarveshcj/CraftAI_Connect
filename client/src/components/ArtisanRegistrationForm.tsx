import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ArtisanProfessionalDetails } from '@/types/artisan';

export function ArtisanRegistrationForm() {
  const { updateArtisanDetails } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ArtisanProfessionalDetails>({
    specialties: [],
    yearsOfExperience: '',
    businessBackground: '',
    achievements: '',
    inspirationStory: '',
    techniquesAndMaterials: '',
    customOrderPreferences: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'specialties') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(s => s.trim()),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await updateArtisanDetails(formData);
      if (success) {
        toast.success("Profile updated successfully!");
        navigate('/artisan/dashboard');
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artisan Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="specialties">Your Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              name="specialties"
              placeholder="e.g., Woodworking, Custom Furniture, Restoration"
              value={formData.specialties.join(', ')}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input
              id="yearsOfExperience"
              name="yearsOfExperience"
              placeholder="How long have you been practicing your craft?"
              value={formData.yearsOfExperience}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessBackground">Business Background</Label>
            <Textarea
              id="businessBackground"
              name="businessBackground"
              placeholder="Tell us about your business journey and what inspired you to start"
              value={formData.businessBackground}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Notable Achievements</Label>
            <Textarea
              id="achievements"
              name="achievements"
              placeholder="Share your proudest achievements, awards, or recognition"
              value={formData.achievements}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspirationStory">Your Inspiration Story</Label>
            <Textarea
              id="inspirationStory"
              name="inspirationStory"
              placeholder="What inspired you to become an artisan? Share your story"
              value={formData.inspirationStory}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techniquesAndMaterials">Techniques and Materials</Label>
            <Textarea
              id="techniquesAndMaterials"
              name="techniquesAndMaterials"
              placeholder="Describe your preferred techniques and materials"
              value={formData.techniquesAndMaterials}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customOrderPreferences">Custom Order Preferences</Label>
            <Textarea
              id="customOrderPreferences"
              name="customOrderPreferences"
              placeholder="What types of custom orders do you prefer to work on?"
              value={formData.customOrderPreferences}
              onChange={handleFormChange}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Complete Registration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}