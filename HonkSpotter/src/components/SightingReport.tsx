import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import { useState } from "react";
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { GooseSighting } from '@/interfaces/gooseSighting';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { AxiosError } from 'axios';
import { Label } from './ui/label';
import ImageUpload from './ImageUpload';
import router from '@/router';

const ReportSighting = () => {
  const { addGooseSighting } = useGooseSightingStore();

  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    lat: "",
    lng: "",
    image: "",
  });

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUploadData = new FormData();
    fileUploadData.append("image", file);

    try {
      const response = await apiClient.post(ApiEndpoints.ImageUpload, fileUploadData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Delete existing image if exists
      if (formData.image) {
        await apiClient.delete(`/image-delete/${formData.image}`, { withCredentials: true });
      }

      setFormData((prev) => ({ ...prev, image: response.data.id }));
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const onDeleteImage = async( e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const response = await apiClient.delete(`/image-delete/${formData.image}`, { withCredentials: true });

    if (response.status == 200) {
      setFormData((prev) => ({ ...prev, image: ''}));
    }
  }

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Handle form submission (e.g., send data to an API)
    const postData = {
      name: formData.name,
      notes: formData.notes,
      coords: `${formData.lat},${formData.lng}`,
      image: formData.image,
    };

    try {
      const response = await apiClient.post(ApiEndpoints.SubmitSighting, postData, {withCredentials: true})
      const sighting = await response.data.sighting;
      const gooseSighting: GooseSighting = {
        id: sighting.id,
        name: sighting.name,
        notes: sighting.notes,
        coords: {
          lat: Number(sighting.coords?.lat),
          lng: Number(sighting.coords?.lng),
        },
        image: sighting.image,
        user: sighting.user.email,
        created_date: new Date(sighting.created_date),
      }
      addGooseSighting(gooseSighting);
    } catch (e: unknown) {
      const error = e as AxiosError;
      console.log(error.message, '\n', error.stack);
    }

    router.navigate({ to: '/'})
  };

  return (
    <>
      <Button variant="link" onClick={() => router.navigate({ to: '/'})} className="text-blue-500 px-0">
        &larr; Back
      </Button>
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">Report Goose Sighting</h2>
        <Label htmlFor="name">Location Name</Label>
        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />

        <Label htmlFor="notes">Notes</Label>
        <Textarea name="notes" placeholder="Write any notes here..." value={formData.notes} onChange={handleChange} required />

        <div className="flex flex-row">
          <div className="mr-4">
            <Label htmlFor="lat">Latitude</Label>
            <Input name="lat" placeholder="Latitude" value={formData.lat} onChange={handleChange} className="w-fit" required />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input name="lng" placeholder="Longitude" value={formData.lng} onChange={handleChange} className="w-fit" required />
          </div>
        </div>


        <Label htmlFor="image">Image</Label>
        <ImageUpload onImageChange={onImageChange} onDeleteImage={onDeleteImage} />
        <Button 
          type="submit"
          className="w-fit bg-green-400 hover:bg-green-500 mt-auto"
        >
          Submit Goose Sighting
        </Button>
      </form>
    </>
  );
};

export default ReportSighting;
