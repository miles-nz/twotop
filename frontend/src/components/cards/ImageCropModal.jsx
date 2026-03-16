import { createPortal } from "react-dom";
import { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Button from "../ui/Button";
import { text } from "../../resources";

function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;
        setCrop({ unit: "px", width: size, height: size, x, y });
    };

    const getCroppedFile = useCallback(() => {
        const image = imgRef.current;
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelCrop = {
            x: crop.x * scaleX,
            y: crop.y * scaleY,
            width: crop.width * scaleX,
            height: crop.height * scaleY,
        };

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(
                        new File([blob], "cropped.jpg", { type: "image/jpeg" }),
                    );
                },
                "image/jpeg",
                0.95,
            );
        });
    }, [crop]);

    const handleConfirm = async () => {
        const file = await getCroppedFile();
        onConfirm(file);
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-surface-50 rounded-2xl shadow-xl p-6 w-full max-w-lg border border-surface-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-text-dark mb-4">
                    {text.cropPhoto}
                </h2>
                <div className="flex justify-center mb-4">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={1}
                        minWidth={50}
                        minHeight={50}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            className="max-h-96 max-w-full"
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-3">
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
