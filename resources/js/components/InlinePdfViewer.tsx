interface Props {
    fileUrl: string;
    title?: string;
}

export default function InlinePdfViewer({ fileUrl, title = 'Dokumen Naskah' }: Props) {
    return (
        <div className="h-[600px] w-full overflow-hidden rounded-md border border-gray-300">
            <iframe src={fileUrl} title={title} className="h-full w-full" style={{ border: 'none' }} />
        </div>
    );
}
