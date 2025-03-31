import { Input } from "./ui/input";
import { useState } from "react";

interface ImageUploadProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (e: { preventDefault: () => void; }) => void;
}

const ImageUpload = ({ onImageChange, onDeleteImage }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>('');

  const onImageChangeWrapper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onImageChange(e);
  };

  const onDeleteImageWrapper = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    setPreview('');
    onDeleteImage(e);
  };

  return (
    <div>
      <Input name="image" type="file" accept="image/*" onChange={onImageChangeWrapper} />
      {preview ? (
        <div className="mt-2">
          <img src={preview} alt="Preview" style={{ width: "200px", height: "auto" }} />
          <button className="cursor-pointer underline" onClick={onDeleteImageWrapper}>Delete</button>

        </div>
      ) :
        undefined
      }
    </div>
  )
}

export default ImageUpload;