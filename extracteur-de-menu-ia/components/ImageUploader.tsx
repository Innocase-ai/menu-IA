
import React, { useRef } from 'react';

interface ImageUploaderProps {
  imagePreviewUrl: string | null;
  onImageUpload: (file: File | null) => void;
  onReset: () => void;
  disabled?: boolean;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 17.25z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M11.255 5.291L3.777 5.79m7.478 0c-.229-.061-.455-.119-.679-.17M5.256 5.79A48.068 48.068 0 0112 4.5c4.236 0 8.083.986 11.416 2.768m-11.416-2.768v.001c0 .001 0 .001 0 .002M7.5 7.5h9M7.5 10.5h9M7.5 13.5h9m-4.5-4.5v4.5" />
  </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePreviewUrl, onImageUpload, onReset, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("La taille du fichier ne doit pas dépasser 10MB.");
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        alert("Format de fichier non supporté. Veuillez utiliser PNG, JPG, GIF ou WEBP.");
        return;
      }
      onImageUpload(file);
    }
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !fileInputRef.current) {
      return;
    }
    // Prevent re-triggering if the click is on the label or the input itself
    // as their native behavior will handle opening the file dialog.
    const targetElement = event.target as HTMLElement;
    if (targetElement === fileInputRef.current || targetElement.closest('label[for="image-uploader"]')) {
      return;
    }
    fileInputRef.current.click();
  };

  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent re-triggering file input if preview is clicked
    onReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <div className="w-full max-w-md">
      {!imagePreviewUrl ? (
        <div
          onClick={handleContainerClick}
          className={`p-6 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:bg-slate-50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="button" // Add role button for accessibility as div is clickable
          tabIndex={disabled ? -1 : 0} // Make it focusable if not disabled
          onKeyDown={(e) => { // Allow activation with Enter/Space for accessibility
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              if (fileInputRef.current) {
                // Check if the event originated from the label to avoid double trigger
                 if (!(e.target as HTMLElement).closest('label[for="image-uploader"]')) {
                    fileInputRef.current.click();
                 }
              }
            }
          }}
        >
          <input
            type="file"
            id="image-uploader" // ID for the label to reference
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            disabled={disabled}
          />
          {/* The label will trigger the input with id "image-uploader" */}
          <label htmlFor="image-uploader" className="cursor-pointer">
            <UploadIcon className="mx-auto h-16 w-16 text-slate-400" />
            <span className="mt-3 block text-base font-medium text-slate-700">
              Cliquez pour choisir une image
            </span>
            <span className="block text-xs text-slate-500 mt-1">
              PNG, JPG, GIF, WEBP jusqu'à 10MB
            </span>
          </label>
        </div>
      ) : (
        <div className="mt-4 w-full max-w-md relative group">
          <img
            src={imagePreviewUrl}
            alt="Aperçu du menu"
            className="rounded-xl shadow-lg max-w-full h-auto mx-auto max-h-96 object-contain"
          />
          {!disabled && (
            <button
              onClick={handleResetClick}
              title="Réinitialiser l'image"
              className="absolute top-3 right-3 bg-white bg-opacity-70 rounded-full p-2 text-slate-700 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all opacity-0 group-hover:opacity-100 duration-200"
              disabled={disabled}
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
