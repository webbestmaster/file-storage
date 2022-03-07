Exif plugin version 1.8 for Total Commander

This plugin extracts digital camera data from JPG files, like exposure time.
Can be used in thumbnail view and custom column view, as well as in the
search and multi-rename functions.

Changelog:
20091016 Release 1.8 (beta)
20091016 Added: Unicode support (file names only)
20090318 Release 1.7 (beta)
20090318 Added: Merged additional fields from plugin branch 1.47 (author: Micha Petraru) into main plugin branch
20071122 Release 1.6
20071122 Fixed: Loading of .CR2 files didn't work
20071116 Added: New extension .CR2 for newer Canon RAW files (need to uninstall old plugin first)
20071116 Fixed: Find EXIF data even if other data comes before it, like Photoshop data or IPTC data
20050213 Fixed: Access violation caused by Nikon images (Buffer "data" was too small)
20041124 Fixed: MaxApertureValue uses APEX field type: RootOf(2)^value
20041124 Added: ApertureValue and ExposureTimeFraction(APEX) fields
20041116 Fixed: Division by zero error if nominator or denominator contained 0 (rational value)
20041027 Added: Better display of ExposureTimeFraction for jpegs which store it as 16666/1000000
20041020 Added: Support for files in JFIF mode
20041017 Added: Support for ISO field
20041017 Added: Support for Canon RAW image files
20041017 Fixed: jpg file wasn't closed after extracting the exif data!
