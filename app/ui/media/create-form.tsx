'use client';

import React, { useState } from "react";
import { MediaField } from "@/app/services/definitions";
import Link from "next/link";
import { Button } from "@app/ui/button";
import { addMedia } from "@/app/services/mediaService";
import { useRouter } from "next/navigation";

export default function Form({ media }: { media: MediaField[] }) {
    const router = useRouter;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const mediaId = formData.get('mediaId') as string;
        const status = formData.get('status') as string;

        try {
            await addMedia({
                mediaId: parseInt(mediaId, 10),
            });
            router.push('/dashboard/media')
        } catch (err) {
            console.error('Failed to create media', err);
        }
    }
}