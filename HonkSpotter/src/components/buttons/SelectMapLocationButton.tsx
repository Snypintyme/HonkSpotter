import { MapPin } from "lucide-react";
import { Button } from "../ui/button";

interface SelectMapLocationButtonProps {
  onClick: () => void;
};

export default function SelectMapLocationButton({ onClick }: SelectMapLocationButtonProps) {
  return (
    <div className="fixed z-99999 bottom-8 right-4">
      <Button
        className="rounded-sm shadow-md border-2 border-black bg-white hover:bg-gray-200 cursor-pointer"
        onClick={onClick}
      >
        <p className="text-black underline">Choose a location</p>
        <MapPin color="red"/>
      </Button>
    </div>
  );
}