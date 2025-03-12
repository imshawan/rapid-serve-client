import { File } from "@/lib/models/upload";

interface PdfViewerProps {
  file: File;
  data: string;
}

export default function PdfViewer({ file, data }: PdfViewerProps) {

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <object
          data={data}
          type="application/pdf"
          className="w-full h-full border rounded-lg shadow-lg bg-white dark:bg-gray-800"
        >
          <p className="text-center text-gray-600 dark:text-gray-300">
            Your browser does not support embedded PDFs.
            <a href={data} download={file.fileName} className="text-blue-500">Download PDF</a>
          </p>
        </object>
      </div>
    </div>
  );
}
