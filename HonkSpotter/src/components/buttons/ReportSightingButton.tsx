import { Plus } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Button } from "../ui/button";

interface ReportSightingButtonProps {
  onClick: () => void;
};

export default function ReportSightingButton({ onClick }: ReportSightingButtonProps) {
  return (
    <div className="fixed z-99999 bottom-8 right-4">
      <Tooltip id="button-tooltip"/>
      <Button
        className="w-12 h-12 rounded-full shadow-lg bg-red-600 hover:bg-red-700 cursor-pointer"
        onClick={onClick}
        data-tooltip-id="button-tooltip"
        data-tooltip-place="top"
        data-tooltip-content="Report goose sighting"
      >
        <Plus size={48} color="white" />
      </Button>
    </div>
  )
}