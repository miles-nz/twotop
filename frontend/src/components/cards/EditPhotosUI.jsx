import { Check, X, ImagePlus } from "lucide-react";
import ImageCropModal from "../cards/ImageCropModal";
import { useImageUpload } from "../../hooks/useImageUpload";

function EditPhotosUI({
    review,
    addPhotoImages,
    setAddPhotoImages,
    removedPhotoUrls,
    handleRemoveExistingPhoto,
    handleSavePhotos,
    onClose,
}) {
    const {
        fileInputRef,
        currentCropSrc,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        uploadError,
    } = useImageUpload(
        5,
        () =>
            (review.image_urls?.length || 0) -
            removedPhotoUrls.length +
            addPhotoImages.length,
        setAddPhotoImages,
    );

    return (
        <div className="px-6 pt-4">
            <div className="border border-surface-200 rounded-xl p-4 bg-surface-50">
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 flex-1">
                        {review.image_urls &&
                            review.image_urls
                                .filter(
                                    (url) => !removedPhotoUrls.includes(url),
                                )
                                .map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExistingPhoto(url)
                                            }
                                            className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                        {addPhotoImages.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(image)}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAddPhotoImages((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1 -right-1 bg-surface-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {(review.image_urls?.length || 0) -
                            removedPhotoUrls.length +
                            addPhotoImages.length <
                            5 && (
                            <>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-16 h-16 flex items-center justify-center text-secondary-400 hover:text-secondary-600 cursor-pointer transition-colors"
                                >
                                    <ImagePlus size={24} />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="text-text-light hover:text-text-mid cursor-pointer transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <button
                            onClick={async () => {
                                await handleSavePhotos();
                                onClose();
                            }}
                            className="text-secondary-500 hover:text-secondary-600 cursor-pointer transition-colors"
                        >
                            <Check size={24} />
                        </button>
                    </div>
                </div>
            </div>
            {uploadError && (
                <div className="mt-2">
                    {Array.isArray(uploadError) ? (
                        uploadError.map((err, index) => (
                            <p key={index} className="text-error-600 text-sm">
                                {err}
                            </p>
                        ))
                    ) : (
                        <p className="text-error-600 text-sm">{uploadError}</p>
                    )}
                </div>
            )}
            {currentCropSrc && (
                <ImageCropModal
                    imageSrc={currentCropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}

export default EditPhotosUI;
