import mammoth from 'mammoth';

/**
 * Processes a .docx file and converts it to HTML.
 * Uses mammoth.js to extract content from the DOCX file.
 *
 * @param file The .docx file to be processed.
 * @returns A promise that resolves with the HTML content.
 */
export async function processDocx(file: File): Promise<string> {
  try {
    console.log(`Processing DOCX file: ${file.name}`);

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth.js to convert DOCX to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages);
    }

    // Get the HTML content
    let htmlContent = result.value;

    // --- FIX FOR HYDRATION ERROR ---
    // Mammoth wraps the content in <p> tags, but for full documents, it might
    // produce a full HTML structure. We only want the *inner* content.
    // A simple regex can extract the content from the body tag if it exists.
    const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/);
    if (bodyContentMatch && bodyContentMatch[1]) {
      htmlContent = bodyContentMatch[1];
    }
    // --- END FIX ---
    
    // If the HTML is empty, provide a fallback
    if (!htmlContent || htmlContent.trim() === '') {
      return `
        <h1>${file.name}</h1>
        <p>This document appears to be empty or could not be processed.</p>
        <p>File size: ${file.size} bytes</p>
      `;
    }

    console.log('DOCX to HTML conversion completed successfully.');
    return htmlContent;
    
  } catch (error) {
    console.error('Error processing DOCX file:', error);
    
    // Return a user-friendly error message as HTML
    return `
      <h1>Error Processing Document</h1>
      <p>Sorry, we couldn't process the file "${file.name}".</p>
      <p>Please make sure it's a valid .docx file and try again.</p>
      <p>File size: ${file.size} bytes</p>
      <details>
        <summary>Technical Details</summary>
        <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </details>
    `;
  }
} 