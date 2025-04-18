import * as pdfjs from 'pdfjs-dist';

// Set the PDF.js worker path directly instead of importing the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Generate thumbnail from a PDF file
 * @param {File|Blob} pdfFile - PDF file object
 * @param {number} pageNum - Page number to render (1-based)
 * @param {number} scale - Scale of the thumbnail (default: 0.2)
 * @returns {Promise<string>} - Base64 encoded thumbnail image
 */
export const generatePdfThumbnail = async (pdfFile, pageNum = 1, scale = 0.2) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    // Get the specified page
    const page = await pdfDocument.getPage(pageNum);
    
    // Set viewport for thumbnail size
    const viewport = page.getViewport({ scale });
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to base64 image
    const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
    
    return thumbnail;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
};

/**
 * Create a PDF blob from base64 data
 * @param {string} base64Data - Base64 encoded PDF data
 * @returns {Blob} - PDF blob
 */
export const base64ToBlob = (base64Data) => {
  try {
    // If the base64 data doesn't contain the data URL prefix, add it
    let formattedBase64 = base64Data;
    if (!base64Data.includes(';base64,')) {
      formattedBase64 = `data:application/pdf;base64,${base64Data}`;
    }
    
    const parts = formattedBase64.split(';base64,');
    const contentType = parts[0].includes(':') ? parts[0].split(':')[1] : 'application/pdf';
    const byteCharacters = atob(parts[1]);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return new Blob([], { type: 'application/pdf' });
  }
}; 