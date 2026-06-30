import JSZip from "jszip";
import * as XLSXStyle from "xlsx-js-style";

export async function downloadWorkbooksAsZip(
  files: {
    name: string;
    workbook: XLSXStyle.WorkBook;
  }[],
  zipName = "SOLINT_EXPORTACION_TRAMAS.zip",
  extraFiles: {
    name: string;
    content: ArrayBuffer | Blob | string;
  }[] = []
) {
  const zip = new JSZip();

  files.forEach((file) => {
    const arrayBuffer = XLSXStyle.write(file.workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });

    zip.file(file.name, arrayBuffer);
  });

  extraFiles.forEach((file) => {
    zip.file(file.name, file.content);
  });

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}
