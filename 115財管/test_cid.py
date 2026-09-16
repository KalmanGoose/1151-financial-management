from pypdf import PdfWriter
from pypdf.generic import (
    DictionaryObject, NameObject, NumberObject, ArrayObject,
    DecodedStreamObject, create_string_object
)

writer = PdfWriter()

# Setup ToUnicode CMap or Identity-H with predefined Adobe-CNS1
font_dict = DictionaryObject({
    NameObject("/Type"): NameObject("/Font"),
    NameObject("/Subtype"): NameObject("/Type0"),
    NameObject("/BaseFont"): NameObject("/MSung-Light"),
    NameObject("/Encoding"): NameObject("/ETenms-B5-H"),
    NameObject("/DescendantFonts"): ArrayObject([
        DictionaryObject({
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/CIDFontType0"),
            NameObject("/BaseFont"): NameObject("/MSung-Light"),
            NameObject("/CIDSystemInfo"): DictionaryObject({
                NameObject("/Registry"): create_string_object("Adobe"),
                NameObject("/Ordering"): create_string_object("CNS1"),
                NameObject("/Supplement"): NumberObject(0)
            })
        })
    ])
})

print("Font dict configured successfully")
