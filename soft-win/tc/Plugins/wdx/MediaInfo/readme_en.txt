TCMediaInfo 0.5 plugin for Total Commander
=========================================================

Plugin description
------------------
TCMediaInfo - is content plugin that allow to retreive info about many video and audio formats. Plugin use MediaInfo library, and support all formats that MediaInfo library have support for. Full list of formats you can find here:

http://mediainfo.sourceforge.net/Support/Formats

Prerequisites
-------------
This plugin has been tested with Total Commander 7.x and Total Commander 7.50 under Microsoft Windows XP Professional SP3 (x86), but should work under Vista and Seven. Currently only ANSI version.

Installation
------------
Just open wdx_tcmediainfo.zip in Total Commander, this will install the plugin automatically. 

Usage
-----
Since MediaInfo library can retreive a LOT information from file, plugin is fully customizable and allow to wrap almost any MediaInfo library's field. By default some most useful fields already configured and you instantly start use plugun. Please refer Total Commander documentation on how to configure columns.

Configuration
-------------
If you need additional information that not configured by default, you have to edit TCMedia.ini file, where all plugin settings are set. Refer allfields.txt file for full list of library properties. If you update library MediaInfo.dll to new version, run saveprops.bat for creating newer version of this file.

[Settings] - main settings section
Formats - here you set a list of all extensions supported by plugin, separated by semicolon.
MultiSeparator - here you set string, that will separate multiple results (for example list of sound languages). If your string have spaces, enclose it to quotes.

[Columns] - columns definition section
In this section you have to set pairs, where left side is English name of column, that will be appear in the TC interface, and right side is MediaInfo library's parameter, optionally followed by context and stream number. You can create few TC columns based on one MediaInfo library parameter.

Common syntax is following: 

TC_Column_Name=ML_Parameter_Name(Context#StreamID|All)

TC_Column_Name - name of column as it appear in TC

ML_Parameter_Name - name of MediaInfo library parameter

Context - since many params with the same name return different info for different kinds of objects (container, video, audio etc), and some work only in certain context, you have to set context in round brackets. Context can be one of Video, Audio, Text, Chapters, Image, Menu. If Context is omitted, will be retreived General context (usually container or just common properties).

StreamID - optionally, after context can be placed # sign and number of stream, for which info will be retreived. If instead number will be keyword "All" - info about all available streams of this kind will be collected (they will be separated with string, defined in MultiSeparator parameter).

If you want separator in TC menu, place -=- line.

[TC_Column_Name] - name of TC column, if you want redefine it's properties
Most columns not need any additional handling, but if they do (or if you need units), you can use additionaly some parameters. In this case create new section with name of Total Commander column you want to redefine.

OutType - type of output value, it's need mostly for date/time format: ft_datetime, ft_time and ft_date. Default is ft_string. Other types handled but without warranty yet :)

DefaultExpr - default expression for column (have no matter when Units are set). You can use aritmetic and string expressions (see appendix). Use "var" variable for substitute MediaInfo library output. 

Unit<1..n> - name of unit for example Bytes, Kbytes etc.

Unit<1..n>Expr - expression of this unit. You can use aritmetic and string expressions (see appendix). Use "var" variable for substitute MediaInfo library output. 

Obvious, that number of units should match to number of expressions. 

Note, that special handling, especially complex expressions, slower down plugin a bit.

Translation
-----------
For translation of fields you can use standard TC's mechanism. Look to TCMedia.lng file, it's content is obvious.


Version history
---------------
Version 0.50 (2009-09-07)
  First release.


Credits
-------
Christian Ghisler - for infinitely powerful tool.
MediaInfo team - for great library.
Jan Tungli - for nice lightweight and fast TCalcul expression engine.


License
-------
Copyright (c) 2009 Dmitry Yudin

This plugin is freeware.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.


APPENDIX
--------
Expression engine syntax.
    _____________________________________________________________________
   | Basic operations:                                                   |
   |=====================================================================|
   |   numeric:         x + y , x - y , x * y, x / y, x ^ y              |
   |   compare:         x > y, x < y, x >= y, x <= y, x = y, x <> y      |
   |   ansi compare:    s > t, s < t, s >= t, s <= t, s = t, s <> t      |
   |   boolean (1/0):   a AND b,  a OR b,  NOT(a)                        |
   |   set variable :   x:=formula (or value) ;                          |
   |   destroy variable: FreeVar(s);    // s=variable name               |
   |   logical:          ExistVar(s)  // s=variable name                 |
   |_____________________________________________________________________|

    _____________________________________________________________________
   | Type conversion:                                                    |
   |=====================================================================|
   |   boolean (1/0):   Logic(x)                                         |
   |   numeric:         Numeric(s)                                       |
   |   string:          String(x)                                        |
   |   char:            Char(x)                                          |
   |   integer:         Ascii(s)                                         |
   |   all types:       Eval(f)   // where f string is formula in [...]  |
   |   string :         NumBase(x,base) // base from <2..16>             |
   |   integer:         BaseNum(s,base) // base from <2..16>
   |_____________________________________________________________________|

    _____________________________________________________________________
   | Math operations:                                                    |
   |=====================================================================|
   |  numeric (integer): x Div y,  x Mod y                               |
   |_____________________________________________________________________|

    _____________________________________________________________________
   | Math functions:                                                     |
   |=====================================================================|
   |    Abs(x), Frac(x), Trunc(x), Heaviside(x) or H(x), Sign(x),        |
   |    Sqrt(x), Ln(x), Exp(x), Round(x, y)                              |
   |    Cos(x), CTg(x), Ch(x), CTh(x), Sin(x),  Sh(x), Tg(x), Th(x),     |
   |    ArcSin(x), ArcCos(x), ArcTg(x), ArcCtg(x),                       |
   |    MaxVal(x [,y, ...]),  MinVal(x [,y, ...]),                       |
   |    SumVal(x [,y,...]),   AvgVal(x [,y, ...])                        |
   |_____________________________________________________________________|

    _____________________________________________________________________
   | String operations:                                                  |
   |=====================================================================|
   |    s || t ,                                                         |
   |    s Like t,      // (%,_)                                          |
   |    s Wildcard t   // (*,?)                                          |
   |_____________________________________________________________________|

    _____________________________________________________________________
   | String functions:                                                   |
   |=====================================================================|
   |   integer: Length(s), Pos(t,s)                                      |
   |   string:  Trim(s), TrimLeft(s), TrimRight(s), Upper(s), Lower(s),  |
   |            Copy(s,x,[y]), CopyTo(s,x,[y]), Delete(s,x,[y]),         |
   |            Insert(s,t,x),                                           |
   |            Replace(s,t,v,[1/0=ReplaceAll,[1/0=IgnoreCase]] ),       |
   |            IFF(a,s,t);    //IF a>=1 then Result:=s else Result:=t   |
   |   numeric: Eval(s)                                                  |
   |_____________________________________________________________________|

    _____________________________________________________________________
   | Date & Time functions:                                              |
   |=====================================================================|
   |   integer: Year(s), Month(s), Day(s), WeekDay(s),                   |
   |            Hour(s), Minute(s), Sec(s)                               |
   |   numeric: StrToStamp(d)                                            |
   |   string:  StampToStr(x), StampToDateStr(x), StampToTimeStr(x)      |
   |_____________________________________________________________________|
