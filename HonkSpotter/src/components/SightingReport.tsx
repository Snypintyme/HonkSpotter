import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { GooseSighting } from '@/interfaces/gooseSighting';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { AxiosError } from 'axios';
import { Label } from './ui/label';
import ImageUpload from './ImageUpload';
import router from '@/router';
import { useCoordinatesStore } from '@/store/useCoordinatesStore';

const ReportSighting = () => {
  const { addGooseSighting } = useGooseSightingStore();
  const { coordinates, setCoordinates, setMapShouldPickCoords } = useCoordinatesStore();

  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    lat: '',
    lng: '',
    image: '',
  });

  useEffect(() => {
    if (coordinates) setFormData({ ...formData, lat: String(coordinates.lat), lng: String(coordinates.lng) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  // Set map to choose coords on load
  useEffect(() => {
    setMapShouldPickCoords(true);
  }, []);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const postData = {
      name: formData.name,
      notes: formData.notes,
      coords: `${formData.lat},${formData.lng}`,
      image: formData.image,
    };

    try {
      const response = await apiClient.post(ApiEndpoints.SubmitSighting, postData, { withCredentials: true });
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
      };
      addGooseSighting(gooseSighting);
    } catch (e: unknown) {
      const error = e as AxiosError;
      console.log(error.message, '\n', error.stack);
    }

    setCoordinates(null);
    router.navigate({ to: '/' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full container mx-auto px-6 py-4">
      <Button variant="link" onClick={() => router.history.back()} className="text-blue-500 px-0 self-start mb-4">
        &larr; Back
      </Button>
      <h2 className="text-2xl font-bold mb-4">Report Goose Sighting</h2>
      <Label htmlFor="name">Location Name</Label>
      <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />

      <Label htmlFor="notes">Notes</Label>
      <Textarea name="notes" placeholder="Write any notes here..." value={formData.notes} onChange={handleChange} />

      <div className="flex flex-row flex-wrap">
        <div className="mr-4">
          <Label htmlFor="lat">Latitude</Label>
          <Input name="lat" placeholder="Latitude" value={formData.lat} className="w-fit" required readOnly />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input name="lng" placeholder="Longitude" value={formData.lng} className="w-fit" required readOnly />
        </div>
      </div>
      <ImageUpload onImageChange={(image) => setFormData((prev) => ({ ...prev, image }))} />
      <Button type="submit" className="w-fit bg-green-400 hover:bg-green-500 mt-auto">
        Submit Goose Sighting
      </Button>
    </form>
  );
};

export default ReportSighting;
