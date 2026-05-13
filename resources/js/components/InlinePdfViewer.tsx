import React from 'react';

interface Props {
    fileUrl: string;
    title?: string;
}

export default function InlinePdfViewer({ fileUrl, title = 'Dokumen Naskah' }: Props) {
    return (
        <div className="w-full h-[600px] border border-gray-300 rounded-md overflow-hidden">
            <iframe 
                src={fileUrl} 
                title={title}
                className="w-full h-full"
                style={{ border: 'none' }}
            />
        </div>
    );
}