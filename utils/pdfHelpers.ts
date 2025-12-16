// Access the global pdfjsLib injected via script tag in index.html
declare const pdfjsLib: any;

export const loadPDF = async (file: File): Promise<any> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return await loadingTask.promise;
};

export const renderPageToImage = async (pdfDoc: any, pageNumber: number, scale = 1.5): Promise<string> => {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Canvas context not available');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Convert to base64 jpeg for Gemini
  return canvas.toDataURL('image/jpeg', 0.8);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
