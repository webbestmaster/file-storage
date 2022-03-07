Autodesk® 3ds Max® Preview plugin 1.1.2.0 for Total Commander
=============================================================

 * License:
-----------

This software is released as freeware.


 * Disclaimer:
--------------

This software is provided "AS IS" without any warranty, either expressed or
implied, including, but not limited to, the implied warranties of
merchantability and fitness for a particular purpose. The author will not be
liable for any special, incidental, consequential or indirect damages due to
loss of data or any other reason.


 * Installation:
----------------

 1. Unzip the archive to an empty directory
 2. In Total Commander choose "Configuration => Options"
 3. Choose "Edit/View"
 4. Click "Configure internal viewer..."
 5. Click "LS-Plugins"
 6. Click "Add" and select 3dsmax.wlx
 7. Click "OK" twice
 8. 3dsmax.ini is initialized by a copy of the provided template file
    3dsmax.template.ini during the very first plugin initialization.


 * Description:
---------------

Autodesk 3ds Max stores a preview thumbnail for Max files. This is typically
shown in the File-Open dialog of Autodesk 3ds Max.

The Autodesk 3ds Max Preview plugin shows the embedded preview thumbnail of
3ds Max files (Version 3 and later). It can also be used for the thumbnail view
of Total Commander 6.5 and later.

Extracting the preview thumbnail does not require Autodesk 3ds Max to be
installed.

The default thumbnail width, height and background color can be set in
section [Autodesk 3ds Max Preview Settings] of 3dsmax.ini.


 * Examples:
------------

You can download some example 3ds Max files from
http://tbeu.totalcmd.net/3dsmax/3dsMax_SampleFiles.zip. Total download
size is about 92 kByte.


 * Limitations:
---------------

 o 3ds Max files must be of Vs. 3 and later.


 * ChangeLog:
-------------

 o Version 1.1.2.0 (13.04.2007)
   - fixed vertical scrolling
 o Version 1.1.1.0 (02.02.2007)
   - added: copy preview bitmap to clipboard (CTRL+C)
 o Version 1.1.0.0 (28.11.2006)
   - added support for new lister option: "Center images" (for Total Commander
     >= 7 beta 1)
   - added: avoid flickering of preview window when switching from one file to
     the next (for Total Commander >= 7 beta 2)
   - added scrolling
 o Version 1.0.4.0 (25.03.2006)
   - fixed displaying of thumbnails in multiple instances of lister window
 o Version 1.0.3.1 (13.03.2006)
   - fixed: display empty lister window in case of failed thumbnail extraction
 o Version 1.0.3.0 (12.03.2006)
   - added option Debug in 3dsmax.ini
   - fixed error handling
 o Version 1.0.2.0 (12.03.2006)
   - added option BackColor, Height and Width in 3dsmax.ini
 o Version 1.0.1.0 (01.03.2006)
   - added thumbnail view
   - added fit image to window in Quick View mode
 o Version 1.0.0.1 (28.02.2006)
   - first nightly build


 * References:
--------------

 o LS-Plugin Writer's Guide by Christian Ghisler
   - http://ghisler.fileburst.com/beta/listplughelp1.7.zip
 o Sparks Knowledgebase - How To Extract Thumbnail Images?
   - http://sparks.discreet.com/knowledgebase/public/solutions/ExtractThumbnailImg.htm


 * Trademark and Copyright Statements:
--------------------------------------

 o Autodesk and 3ds Max are registered trademarks or trademarks of Autodesk,
   Inc./Autodesk Canada Co.
   - http://www.autodesk.com/3dsmax
 o Total Commander is Copyright © 1993-2007 by Christian Ghisler, C. Ghisler & Co.
   - http://www.ghisler.com
 o UPX - The Ultimate Packer for eXecutables is Copyright © 1996-2007 by Markus
   Oberhumer, Laszlo Molnar & John Reiser
   - http://upx.sourceforge.net


 * Feedback:
------------

If you have problems, questions, suggestions please contact Thomas Beutlich.
 o Email: support@tbeu.de
 o URL: http://tbeu.totalcmd.net