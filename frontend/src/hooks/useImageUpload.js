import { useState, useRef } from "react";
import { text, preferences } from "../resources";

export function useImageUpload(
    maxImages = 5,
    getExistingCount = () => 0,
    onImagesAdded = null,
) {
    const [images, setImages] = useState([]);
    const [cropQueue, setCropQueue] = useState([]);
    const [currentCropSrc, setCurrentCropSrc] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const totalCount = () => getExistingCount() + images.length;

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);

        const oversizedFiles = files.filter(
            (file) => file.size > preferences.maxImageSize,
        );
        if (oversizedFiles.length > 0) {
            setUploadError([text.errorImageSize]);
            e.target.value = "";
            return;
        }

        if (files.length + totalCount() > maxImages) {
            setUploadError([text.errorMaxImages]);
            e.target.value = "";
            return;
        }

        const nonSquareSrcs = [];
        const squareFiles = [];

        await Promise.all(
            files.map(
                (file) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            if (img.width === img.height) {
                                squareFiles.push(file);
                            } else {
                                nonSquareSrcs.push(URL.createObjectURL(file));
                            }
                            resolve();
                        };
                        img.src = URL.createObjectURL(file);
                    }),
            ),
        );

        const addFiles = (prev) =>
            [...prev, ...squareFiles].slice(0, maxImages);
        if (onImagesAdded) {
            onImagesAdded(addFiles);
        } else {
            setImages(addFiles);
        }

        if (nonSquareSrcs.length > 0) {
            setCropQueue(nonSquareSrcs);
            setCurrentCropSrc(nonSquareSrcs[0]);
        }

        e.target.value = "";
    };

    const handleCropConfirm = (croppedFile) => {
        const addFile = (prev) => [...prev, croppedFile].slice(0, maxImages);
        if (onImagesAdded) {
            onImagesAdded(addFile);
        } else {
            setImages(addFile);
        }
        const remaining = cropQueue.slice(1);
        setCropQueue(remaining);
        setCurrentCropSrc(remaining.length > 0 ? remaining[0] : null);
    };

    const handleCropCancel = () => {
        const remaining = cropQueue.slice(1);
        setCropQueue(remaining);
        setCurrentCropSrc(remaining.length > 0 ? remaining[0] : null);
    };

    const handleImageRemove = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const resetImages = () => {
        setImages([]);
        setCropQueue([]);
        setCurrentCropSrc(null);
        setUploadError(null);
    };

    return {
        images,
        setImages,
        fileInputRef,
        cropQueue,
        currentCropSrc,
        uploadError,
        setUploadError,
        handleImageChange,
        handleCropConfirm,
        handleCropCancel,
        handleImageRemove,
        resetImages,
    };
}
