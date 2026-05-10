import { createPortal } from "react-dom";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Button from "../ui/Button";
import { text } from "../../resources";

const createCroppedImage = async (imageSrc, croppedAreaPixels) => {
    const image = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = imageSrc;
    });

    const MAX_SIZE = 1200;
    const scale = Math.min(
        1,
        MAX_SIZE / croppedAreaPixels.width,
        MAX_SIZE / croppedAreaPixels.height,
    );

    const outputWidth = Math.round(croppedAreaPixels.width * scale);
    const outputHeight = Math.round(croppedAreaPixels.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputWidth,
        outputHeight,
    );

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(
                    new File([blob], "cropped.jpg", { type: "image/jpeg" }),
                );
            },
            "image/jpeg",
            0.8,
        );
    });
};

function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        const file = await createCroppedImage(imageSrc, croppedAreaPixels);
        onConfirm(file);
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-50 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg border border-surface-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 pb-3">
                    <h2 className="text-lg font-bold text-text-dark">
                        {text.cropPhoto}
                    </h2>
                </div>

                {/* Crop area */}
                <div className="relative w-full aspect-square bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Zoom slider */}
                <div className="px-6 pt-4 pb-2">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-secondary-400"
                    />
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6">
                    <Button variant="surface" onClick={onCancel}>
                        <X size={16} className="mr-1" /> {text.cancel}
                    </Button>
                    <Button variant="secondary" onClick={handleConfirm}>
                        <Check size={16} className="mr-1" /> {text.crop}
                    </Button>
                </div>
            </motion.div>
        </motion.div>,
        document.body,
    );
}

export default ImageCropModal;
