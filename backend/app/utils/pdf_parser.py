import re
import logging
import pdfplumber
from fastapi import HTTPException
from pdf2image import convert_from_path
import pytesseract

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class PDFParser:
    @staticmethod
    def clean_text(text: str) -> str:
        """Minimally clean extracted text to remove only obvious artifacts."""
        if not text:
            return ""

        # Log raw text for debugging
        logger.debug(f"Raw extracted text: {text[:500]}...")

        # Remove multiple newlines (keep single newlines for structure)
        text = re.sub(r'\n\s*\n+', '\n', text)

        # Remove page number artifacts (e.g., "Page 1")
        text = re.sub(r'Page\s+\d+', '', text)

        # Remove leading/trailing whitespace
        text = text.strip()

        # Log cleaned text
        logger.debug(f"Cleaned text: {text[:500]}...")

        return text

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract and minimally clean text from a PDF file using pdfplumber or OCR if necessary."""
        try:
            # First try pdfplumber for text-based PDFs
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

            if text.strip():
                cleaned_text = PDFParser.clean_text(text)
                if cleaned_text:
                    return cleaned_text

            # If no text extracted, try OCR
            logger.info(
                f"No text extracted with pdfplumber for {file_path}, attempting OCR...")
            images = convert_from_path(file_path)
            text = ""
            for image in images:
                page_text = pytesseract.image_to_string(image, lang='eng+rus')
                text += page_text + "\n"

            if not text.strip():
                raise HTTPException(
                    status_code=400, detail="No text could be extracted from the PDF")

            cleaned_text = PDFParser.clean_text(text)
            if not cleaned_text:
                raise HTTPException(
                    status_code=400, detail="No valid text after cleaning")

            return cleaned_text

        except Exception as e:
            logger.error(
                f"Error parsing PDF {file_path}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Error parsing PDF: {str(e)}")
