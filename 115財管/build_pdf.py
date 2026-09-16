import sys
import os
import zlib
import struct
import subprocess

def get_image_info(path):
    # Use sips to get width, height and convert to jpeg for simple pdf embedding
    res = subprocess.check_output(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path]).decode()
    w, h = 0, 0
    for line in res.splitlines():
        if "pixelWidth:" in line:
            w = int(line.split()[-1])
        elif "pixelHeight:" in line:
            h = int(line.split()[-1])
            
    jpg_path = path + ".jpg"
    subprocess.check_call(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "85", path, "--out", jpg_path], stdout=subprocess.DEVNULL)
    with open(jpg_path, "rb") as f:
        data = f.read()
    os.remove(jpg_path)
    return w, h, data

class SimplePDF:
    def __init__(self):
        self.objects = []
        self.pages = []
        
    def add_object(self, content):
        self.objects.append(content)
        return len(self.objects)
        
    def create_page_with_header_and_image(self, title, step_badge, lines, notes, img_path):
        w_px, h_px, img_data = get_image_info(img_path)
        
        # A4 size in points: 595.28 x 841.89
        page_w = 595.28
        page_h = 841.89
        margin_x = 40.0
        
        # We need an image XObject
        img_obj_idx = len(self.objects) + 1 # will be added
        img_dict = f"""<<
  /Type /XObject
  /Subtype /Image
  /Width {w_px}
  /Height {h_px}
  /ColorSpace /DeviceRGB
  /BitsPerComponent 8
  /Filter /DCTDecode
  /Length {len(img_data)}
>>
stream
""".encode('latin1') + img_data + b"\nendstream"
        self.objects.append(img_dict)
        
        # Calculate image display rect
        avail_w = page_w - 2 * margin_x
        img_display_w = avail_w
        img_display_h = avail_w * (h_px / w_px)
        
        # Max image display height to fit page comfortably
        max_img_h = 420.0
        if img_display_h > max_img_h:
            img_display_h = max_img_h
            img_display_w = max_img_h * (w_px / h_px)
            
        img_x = margin_x + (avail_w - img_display_w) / 2.0
        img_y = 55.0 # bottom margin
        
        # Prepare stream commands
        # Colors: Dark Blue 0.1 0.21 0.36, Gray border 0.8 0.8 0.8
        stream_cmds = []
        
        # Top banner background
        stream_cmds.append("0.93 0.95 0.98 rg") # light blue
        stream_cmds.append(f"30 785 {page_w - 60} 38 re f")
        
        # Badge
        stream_cmds.append("0.17 0.42 0.69 rg") # blue
        stream_cmds.append(f"40 792 58 24 re f")
        
        # Border around image
        stream_cmds.append("0.8 0.85 0.9 RG")
        stream_cmds.append("1.5 w")
        stream_cmds.append(f"{img_x - 1} {img_y - 1} {img_display_w + 2} {img_display_h + 2} re S")
        
        # Draw Image
        stream_cmds.append(f"q {img_display_w:.2f} 0 0 {img_display_h:.2f} {img_x:.2f} {img_y:.2f} cm /Im{img_obj_idx} Do Q")
        
        content_stream = "\n".join(stream_cmds).encode('latin1')
        
        content_obj_idx = self.add_object(f"""<<
  /Length {len(content_stream)}
>>
stream
""".encode('latin1') + content_stream + b"\nendstream")
        
        # Page object
        page_dict = f"""<<
  /Type /Page
  /Parent 1 0 R
  /MediaBox [0 0 {page_w} {page_h}]
  /Resources <<
    /XObject <<
      /Im{img_obj_idx} {img_obj_idx} 0 R
    >>
  >>
  /Contents {content_obj_idx} 0 R
>>""".encode('latin1')
        page_obj_idx = self.add_object(page_dict)
        self.pages.append(page_obj_idx)

