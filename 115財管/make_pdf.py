import os
import CoreGraphics
from Quartz import (
    CGPDFContextCreateWithURL,
    CGPDFContextBeginPage,
    CGPDFContextEndPage,
    CGPDFContextClose,
    CGRectMake,
    CGPointMake,
    CGSizeMake,
    CGDataProviderCreateWithFilename,
    CGImageCreateWithPNGDataProvider,
    CGContextDrawImage,
    CGContextShowTextAtPoint,
    CGContextSelectFont,
    CGContextSetRGBFillColor,
    CGContextFillRect,
    CGContextStrokeRect,
    CGContextSetRGBStrokeColor,
    CGContextSetLineWidth,
    CFURLCreateWithFileSystemPath,
    kCFURLPOSIXPathStyle
)
print("Quartz imported successfully")
