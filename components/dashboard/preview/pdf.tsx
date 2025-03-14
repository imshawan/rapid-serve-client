import { File } from "@/lib/models/upload";
import { cn } from "@/lib/utils/common";

interface PdfViewerProps {
  file: File;
  data: string;
  outerClassname?: string
  className?: string
}

export default function PdfViewer({ file, data, outerClassname, className }: PdfViewerProps) {

  return (
    <div className={cn("w-full h-full flex items-center justify-center", outerClassname)}>
        <object
          data={data}
          type="application/pdf"
          className={cn("w-full h-full border rounded-lg shadow-lg bg-white dark:bg-gray-800 p-0 min-h-screen sm:min-h-[calc(100vh-100px)]", className)}
        >
          <p className="text-center text-gray-600 dark:text-gray-300">
            Your browser does not support embedded PDFs.
            <a href={data} download={file.fileName} className="text-blue-500">Download PDF</a>
          </p>
        </object>
    </div>
  );
}
