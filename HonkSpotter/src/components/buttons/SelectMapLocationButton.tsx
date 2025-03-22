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
    // <div className="fixed z-99999 bottom-8 right-4">
    //   <Tooltip id="button-tooltip"/>
    //   <Button
    //     className="w-14 h-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700"
    //     onClick={onClick}
    //     data-tooltip-id="button-tooltip"
    //     data-tooltip-place="top"
    //     data-tooltip-content="Report goose sighting"
    //   >
    //     <Plus size={24} className="text-white" />
    //   </Button>
    // </div>
  );
}