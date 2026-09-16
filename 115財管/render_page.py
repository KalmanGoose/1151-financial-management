import subprocess
import os

# We can render an HTML page into an image using WebKit/qlmanage or convert text+screenshot
# Let's see if qlmanage can create thumbnails of html
res = subprocess.run(["qlmanage", "-p", "guide.html"], capture_output=True, timeout=2)
