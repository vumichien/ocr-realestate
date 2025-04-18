import * as pdfjs from 'pdfjs-dist';

// Set the worker path for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Convert a PDF page to a PNG image
 * @param {File} pdfFile - The PDF file to convert
 * @param {number} pageNum - The page number to convert (1-based)
 * @param {number} scale - The scale factor for rendering (default 2.0 for better quality)
 * @returns {Promise<string>} - Promise with base64 encoded PNG image
 */
export const convertPdfPageToImage = async (pdfFile, pageNum, scale = 2.0) => {
  try {
    // Read the PDF file
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    // Get the requested page (PDF pages are 1-based, but pdf.js is 0-based)
    const page = await pdfDocument.getPage(pageNum);
    
    // Set the scale for rendering
    const viewport = page.getViewport({ scale });
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the PDF page to the canvas
    const renderContext = {
      canvasContext: context,
      viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert the canvas to a base64 encoded PNG
    const base64Image = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
    
    return base64Image;
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw error;
  }
};

/**
 * Get the number of pages in a PDF document
 * @param {File} pdfFile - The PDF file
 * @returns {Promise<number>} - Promise with the number of pages
 */
export const getPdfPageCount = async (pdfFile) => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    return pdfDocument.numPages;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    throw error;
  }
};

export default {
  convertPdfPageToImage,
  getPdfPageCount
}; 