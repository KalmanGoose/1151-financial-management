from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, NumberObject, ArrayObject, DecodedStreamObject, TextStringObject

writer = PdfWriter()
page = writer.add_blank_page(width=595.28, height=841.89)
print("blank page created")
