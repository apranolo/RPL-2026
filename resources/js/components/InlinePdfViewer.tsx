/**
 * @file InlinePdfViewer.tsx
 * @description Komponen untuk merender file PDF secara inline menggunakan iframe.
 * @author Muhammad Irfan Habibi
 */

interface Props {
    fileUrl: string;
    title?: string;
}

export default function InlinePdfViewer({ fileUrl, title = 'Dokumen Naskah' }: Props) {
    return (
        <div className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-300">
            <iframe src={fileUrl} title={title} className="h-full w-full" style={{ border: 'none' }} />
        </div>
    );
}
