import fitz
import pandas as pd
from typing import Dict, List
import tabula


class PDFExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)

    def extract_text(self) -> str:
        text = ""
        for page in self.doc:
            text += page.get_text()
        return text

    def extract_tables(self) -> List[pd.DataFrame]:
        try:
            tables = tabula.read_pdf(
                self.pdf_path, pages='all', multiple_tables=True)
            return tables
        except Exception as e:
            print(f"Error extracting tables: {e}")
            return []

    def extract_images(self) -> List[Dict]:
        images = []
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            image_list = page.get_images()

            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = self.doc.extract_image(xref)
                if base_image:
                    image_data = {
                        'page_num': page_num + 1,
                        'image_index': img_index,
                        'image_bytes': base_image["image"],
                        'extension': base_image["ext"]
                    }
                    images.append(image_data)
        return images

    def extract_all(self) -> Dict:
        return {
            'text': self.extract_text(),
            'tables': self.extract_tables(),
            'images': self.extract_images()
        }

    def close(self):
        self.doc.close()
