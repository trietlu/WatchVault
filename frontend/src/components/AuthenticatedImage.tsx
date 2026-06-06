'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AuthenticatedImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function AuthenticatedImage({ src, alt, className }: AuthenticatedImageProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        let nextObjectUrl: string | null = null;

        const loadImage = async () => {
            try {
                const response = await api.get(src, { responseType: 'blob' });
                nextObjectUrl = URL.createObjectURL(response.data);

                if (active) {
                    setObjectUrl(nextObjectUrl);
                } else {
                    URL.revokeObjectURL(nextObjectUrl);
                }
            } catch (error) {
                console.error('Failed to load image', error);
                if (active) {
                    setObjectUrl(null);
                }
            }
        };

        setObjectUrl(null);
        loadImage();

        return () => {
            active = false;
            if (nextObjectUrl) {
                URL.revokeObjectURL(nextObjectUrl);
            }
        };
    }, [src]);

    if (!objectUrl) {
        return null;
    }

    return <img src={objectUrl} alt={alt} className={className} />;
}
