/// Search and replace using regular expressions (custom dialog)
//
// Example for "Replace with function" flag:
//   What: \d+
//   With: parseInt($0) + 1;
// Or
//   What: \d+
//   With: var n = parseInt($0); return n >= 20 ? 20 : ++n;

var AkelPad=new ActiveXObject("AkelPad.document");
var WshShell=new ActiveXObject("WScript.shell");

//Options
var bShowCountOfChanges=true;
var nSearchStrings=10;

//Buttons
var BT_FINDNEXT   =1
var BT_REPLACE    =2
var BT_REPLACEALL =3

//Direction
var DN_DOWN      =0x00000001
var DN_UP        =0x00000002
var DN_BEGINNING =0x00000004
var DN_SELECTION =0x00000008
var DN_ALLFILES  =0x00000010

//Control IDs
var IDC_FIND           =1001
var IDC_REPLACE        =1002
var IDC_MATCHCASE      =1003
var IDC_MULTILINE      =1004
var IDC_ESCAPESEQ      =1005
var IDC_FUNCTION       =1006
var IDC_FORWARD        =1007
var IDC_BACKWARD       =1008
var IDC_BEGINNING      =1009
var IDC_INSEL          =1010
var IDC_ALLFILES       =1011
var IDC_FIND_BUTTON    =1012
var IDC_REPLACE_BUTTON =1013
var IDC_ALL_BUTTON     =1014
var IDC_CANCEL         =1015

//String IDs
var STRID_LOWJSCRIPT   =0
var STRID_WHAT         =1
var STRID_WITH         =2
var STRID_MATCHCASE    =3
var STRID_MULTILINE    =4
var STRID_ESCAPESEQ    =5
var STRID_FUNCTION     =6
var STRID_DIRECTION    =7
var STRID_FORWARD      =8
var STRID_BACKWARD     =9
var STRID_BEGINNING    =10
var STRID_INSEL        =11
var STRID_ALLFILES     =12
var STRID_FINDNEXT     =13
var STRID_REPLACE      =14
var STRID_REPLACEALL   =15
var STRID_CANCEL       =16
var STRID_SYNTAXERROR  =17
var STRID_FINISHED     =18
var STRID_COUNTFILES   =19
var STRID_COUNTCHANGES =20

var hMainWnd=AkelPad.GetMainWnd();
var oFunction=AkelPad.SystemFunction();
var pScriptName=WScript.ScriptName;
var hInstanceDLL=AkelPad.GetInstanceDll();
var bAkelEdit=AkelPad.IsAkelEdit();
var hWndDialog;
var hWndWhat;
var hWndStatic;
var hWndCase;
var hWndGlobal;
var hWndMultiline;
var hWndEscSequences;
var hWndReplaceFunction;
var hWndGroup;
var hWndDown;
var hWndUp;
var hWndBeginning;
var hWndSelection;
var hWndAllFiles;
var hWndFindNext;
var hWndReplace;
var hWndReplaceAll;
var hWndCancel;
var hWndFocus;
var hGuiFont;
var lpBuffer;
var pFindIt="";
var pReplaceWith="";
var pReplaceWithEsc;
var lpFindStrings;
var lpReplaceStrings;
var bSensitive=false;
var bMultiline=false;
var bEscSequences=false;
var bReplaceFunction=false;
var nDirection=DN_DOWN;
var nFindItLength;
var nSearchResult;
var nButton=0;
var i;
var _TCHAR;
var _TSTR;
var _TSIZE;

if (hMainWnd)
{
  if (ScriptEngineMajorVersion() <= 5 && ScriptEngineMinorVersion() < 5)
  {
    AkelPad.MessageBox(hMainWnd, GetLangString(STRID_LOWJSCRIPT), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }

  if (AkelPad.IsOldWindows())
  {
    _TCHAR="A";
    _TSTR=0 /*DT_ANSI*/;
    _TSIZE=1 /*sizeof(char)*/;
  }
  else
  {
    _TCHAR="W";
    _TSTR=1 /*DT_UNICODE*/;
    _TSIZE=2 /*sizeof(wchar_t)*/;
  }

  if (AkelPad.WindowRegisterClass(pScriptName))
  {
    if (lpBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      //Create dialog
      AkelPad.MemCopy(lpBuffer, pScriptName, _TSTR);
      oFunction.AddParameter(0);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(0);
      oFunction.AddParameter(0x90CA0000);     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX
      oFunction.AddParameter(0);
      oFunction.AddParameter(0);
      oFunction.AddParameter(392);
      oFunction.AddParameter(223);
      oFunction.AddParameter(hMainWnd);
      oFunction.AddParameter(0);              //ID
      oFunction.AddParameter(hInstanceDLL);
      oFunction.AddParameter(DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
      hWndDialog=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

      if (hWndDialog)
      {
        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(pScriptName);
  }
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1)  //WM_CREATE
  {
    //Find
    lpFindStrings=new Array(nSearchStrings);

    try
    {
      for (i=0; i < nSearchStrings; ++i)
      {
        lpFindStrings[i]=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Find" + i);
      }
    }
    catch (nError)
    {
    }
    pFindIt=lpFindStrings[0];

    //Replace
    lpReplaceStrings=new Array(nSearchStrings);

    try
    {
      for (i=0; i < nSearchStrings; ++i)
      {
        lpReplaceStrings[i]=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Replace" + i);
      }
    }
    catch (nError)
    {
    }
    pReplaceWith=lpReplaceStrings[0];

    try
    {
      bSensitive=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Sensitive");
      bMultiline=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Multiline");
      bEscSequences=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\EscSequences");
      bReplaceFunction=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\ReplaceFunction");
      nDirection=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Direction");
    }
    catch (nError)
    {
    }

    oFunction.AddParameter(17);  //DEFAULT_GUI_FONT
    hGuiFont=oFunction.Call("gdi32::GetStockObject");

    //Dialog caption
    AkelPad.MemCopy(lpBuffer, pScriptName, _TSTR);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(lpBuffer);
    oFunction.Call("user32::SetWindowText" + _TCHAR);


    ////Static window What

    //Create window
    AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000000);  //WS_VISIBLE|WS_CHILD
    oFunction.AddParameter(6);
    oFunction.AddParameter(18);
    oFunction.AddParameter(33);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(-1);          //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndStatic=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndStatic, hGuiFont, GetLangString(STRID_WHAT));


    ////Edit window What

    //Create window
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50210042);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
    oFunction.AddParameter(41);
    oFunction.AddParameter(15);
    oFunction.AddParameter(240);
    oFunction.AddParameter(160);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_FIND);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndWhat=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Fill combobox
    for (i=0; i < nSearchStrings && lpFindStrings[i]; ++i)
    {
      AkelPad.MemCopy(lpBuffer, lpFindStrings[i], _TSTR);
      AkelPad.SendMessage(hWndWhat, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }

    //Set font and text
    if (AkelPad.GetSelStart() != AkelPad.GetSelEnd() && !(nDirection == DN_SELECTION) && !AkelPad.SendMessage(AkelPad.GetEditWnd(), 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
      SetWindowFontAndText(hWndWhat, hGuiFont, AkelPad.GetSelText());
    else
    {
      SetWindowFontAndText(hWndWhat, hGuiFont, "");
      AkelPad.SendMessage(hWndWhat, 0x14E /*CB_SETCURSEL*/, 0, 0);
    }


    ////Static window With

    //Create window
    AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000000);  //WS_VISIBLE|WS_CHILD
    oFunction.AddParameter(6);
    oFunction.AddParameter(41);
    oFunction.AddParameter(33);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(-1);          //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndStatic=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndStatic, hGuiFont, GetLangString(STRID_WITH));


    ////Edit window With

    //Create window
    AkelPad.MemCopy(lpBuffer, "COMBOBOX", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50210042);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
    oFunction.AddParameter(41);
    oFunction.AddParameter(37);
    oFunction.AddParameter(240);
    oFunction.AddParameter(160);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_REPLACE);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndWith=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Fill combobox
    for (i=0; i < nSearchStrings && lpReplaceStrings[i]; ++i)
    {
      AkelPad.MemCopy(lpBuffer, lpReplaceStrings[i], _TSTR);
      AkelPad.SendMessage(hWndWith, 0x143 /*CB_ADDSTRING*/, 0, lpBuffer);
    }

    //Set font and text
    SetWindowFontAndText(hWndWith, hGuiFont, "");
    AkelPad.SendMessage(hWndWith, 0x14E /*CB_SETCURSEL*/, 0, 0);


    ////Checkbox Sensitive

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(70);
    oFunction.AddParameter(158);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_MATCHCASE);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndCase=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndCase, hGuiFont, GetLangString(STRID_MATCHCASE));


    ////Checkbox Multiline

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(91);
    oFunction.AddParameter(158);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_MULTILINE);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndMultiline=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndMultiline, hGuiFont, GetLangString(STRID_MULTILINE));


    ////Checkbox Esc-sequences

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(112);
    oFunction.AddParameter(158);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_ESCAPESEQ);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndEscSequences=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndEscSequences, hGuiFont, GetLangString(STRID_ESCAPESEQ));


    ////Checkbox Replace with function

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(133);
    oFunction.AddParameter(158);
    oFunction.AddParameter(20);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_FUNCTION);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndReplaceFunction=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndReplaceFunction, hGuiFont, GetLangString(STRID_FUNCTION));


    ////GroupBox 1

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000007);  //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
    oFunction.AddParameter(182);
    oFunction.AddParameter(67);
    oFunction.AddParameter(99);
    oFunction.AddParameter(94);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(-1);          //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndGroup=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndGroup, hGuiFont, GetLangString(STRID_DIRECTION));


    ////Radiobutton Down

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(189);
    oFunction.AddParameter(83);
    oFunction.AddParameter(90);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_FORWARD);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndDown=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndDown, hGuiFont, GetLangString(STRID_FORWARD));


    ////Radiobutton Up

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(189);
    oFunction.AddParameter(101);
    oFunction.AddParameter(90);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_BACKWARD);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndUp=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndUp, hGuiFont, GetLangString(STRID_BACKWARD));


    ////Radiobutton Beginning

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(189);
    oFunction.AddParameter(119);
    oFunction.AddParameter(90);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_BEGINNING);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndBeginning=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndBeginning, hGuiFont, GetLangString(STRID_BEGINNING));


    ////Radiobutton Selection

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(189);
    oFunction.AddParameter(137);
    oFunction.AddParameter(90);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_INSEL);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndSelection=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndSelection, hGuiFont, GetLangString(STRID_INSEL));


    if (AkelPad.IsMDI())
    {
      ////Radiobutton AllFiles

      //Create window
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      oFunction.AddParameter(0);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(0);
      oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
      oFunction.AddParameter(189);
      oFunction.AddParameter(164);
      oFunction.AddParameter(90);
      oFunction.AddParameter(16);
      oFunction.AddParameter(hWnd);
      oFunction.AddParameter(IDC_ALLFILES);
      oFunction.AddParameter(hInstanceDLL);
      oFunction.AddParameter(0);
      hWndAllFiles=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

      //Set font and text
      SetWindowFontAndText(hWndAllFiles, hGuiFont, GetLangString(STRID_ALLFILES));


      ////GroupBox 2

      //Create window
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      oFunction.AddParameter(0);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(0);
      oFunction.AddParameter(0x50000007);  //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
      oFunction.AddParameter(182);
      oFunction.AddParameter(153);
      oFunction.AddParameter(99);
      oFunction.AddParameter(31);
      oFunction.AddParameter(hWnd);
      oFunction.AddParameter(-1);          //ID
      oFunction.AddParameter(hInstanceDLL);
      oFunction.AddParameter(0);
      hWndGroup=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

      //Set font and text
      SetWindowFontAndText(hWndGroup, hGuiFont, "");
    }


    ////Button window FindNext

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010001);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
    oFunction.AddParameter(294);
    oFunction.AddParameter(10);
    oFunction.AddParameter(81);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_FIND_BUTTON);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndFindNext=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndFindNext, hGuiFont, GetLangString(STRID_FINDNEXT));


    ////Button window Replace

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
    oFunction.AddParameter(294);
    oFunction.AddParameter(37);
    oFunction.AddParameter(81);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_REPLACE_BUTTON);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndReplace=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndReplace, hGuiFont, GetLangString(STRID_REPLACE));


    ////Button window ReplaceAll

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
    oFunction.AddParameter(294);
    oFunction.AddParameter(63);
    oFunction.AddParameter(81);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_ALL_BUTTON);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndReplaceAll=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndReplaceAll, hGuiFont, GetLangString(STRID_REPLACEALL));


    ////Button window Cancel

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
    oFunction.AddParameter(294);
    oFunction.AddParameter(89);
    oFunction.AddParameter(81);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(IDC_CANCEL);
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndCancel=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndCancel, hGuiFont, GetLangString(STRID_CANCEL));


    //Checks
    if (bSensitive) AkelPad.SendMessage(hWndCase, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bMultiline) AkelPad.SendMessage(hWndMultiline, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bEscSequences) AkelPad.SendMessage(hWndEscSequences, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bReplaceFunction)
    {
      AkelPad.SendMessage(hWndReplaceFunction, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      EnableWindow(hWndEscSequences, false);
    }

    if (nDirection == DN_ALLFILES)
    {
      if (AkelPad.IsMDI())
        AkelPad.SendMessage(hWndAllFiles, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      else
        nDirection=DN_DOWN;
    }
    else if (nDirection == DN_BEGINNING) AkelPad.SendMessage(hWndBeginning, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else if (nDirection == DN_SELECTION) AkelPad.SendMessage(hWndSelection, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    if (nDirection == DN_DOWN) AkelPad.SendMessage(hWndDown, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else if (nDirection == DN_UP) AkelPad.SendMessage(hWndUp, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    //Center dialog
    CenterWindow(hMainWnd, hWnd);
  }
  else if (uMsg == 7)  //WM_SETFOCUS
  {
    oFunction.AddParameter(hWndWhat);
    oFunction.Call("user32::SetFocus");
  }
  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if (wParam == 27)  //VK_ESCAPE
    {
      //Escape key pushes Cancel button
      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(273);  //WM_COMMAND
      oFunction.AddParameter(IDC_CANCEL);
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
    else if (wParam == 13)  //VK_RETURN
    {
      //Return key pushes OK button
      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(273);  //WM_COMMAND
      oFunction.AddParameter(IDC_FIND_BUTTON);
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
  }
  else if (uMsg == 273)  //WM_COMMAND
  {
    if ((wParam & 0xffff) == IDC_FIND)
    {
      if ((wParam >> 16) == 1 /*CBN_SELCHANGE*/)
      {
        i=AkelPad.SendMessage(hWndWhat, 0x147 /*CB_GETCURSEL*/, 0, 0);
        nFindItLength=AkelPad.SendMessage(hWndWhat, 0x149 /*CB_GETLBTEXTLEN*/, i, 0);
      }
      else
      {
        oFunction.AddParameter(hWndWhat);
        nFindItLength=oFunction.Call("user32::GetWindowTextLength" + _TCHAR);
      }

      if (nFindItLength)
      {
        EnableWindow(hWndFindNext, true);
        EnableWindow(hWndReplace, true);
        EnableWindow(hWndReplaceAll, true);
      }
      else
      {
        EnableWindow(hWndFindNext, false);
        EnableWindow(hWndReplace, false);
        EnableWindow(hWndReplaceAll, false);
      }
    }
    else if ((wParam & 0xffff) == IDC_MATCHCASE ||
             (wParam & 0xffff) == IDC_MULTILINE ||
             (wParam & 0xffff) == IDC_ESCAPESEQ ||
             (wParam & 0xffff) == IDC_FUNCTION)
    {
      if ((wParam & 0xffff) == IDC_MATCHCASE)
        bSensitive=AkelPad.SendMessage(hWndCase, 240 /*BM_GETCHECK*/, 0, 0);
      else if ((wParam & 0xffff) == IDC_MULTILINE)
        bMultiline=AkelPad.SendMessage(hWndMultiline, 240 /*BM_GETCHECK*/, 0, 0);
      else if ((wParam & 0xffff) == IDC_ESCAPESEQ)
        bEscSequences=AkelPad.SendMessage(hWndEscSequences, 240 /*BM_GETCHECK*/, 0, 0);
      else if ((wParam & 0xffff) == IDC_FUNCTION)
      {
        bReplaceFunction=AkelPad.SendMessage(hWndReplaceFunction, 240 /*BM_GETCHECK*/, 0, 0);
        EnableWindow(hWndEscSequences, !bReplaceFunction);
      }
    }
    else if ((wParam & 0xffff) == IDC_FORWARD ||
             (wParam & 0xffff) == IDC_BACKWARD ||
             (wParam & 0xffff) == IDC_BEGINNING ||
             (wParam & 0xffff) == IDC_INSEL ||
             (wParam & 0xffff) == IDC_ALLFILES)
    {
      if (nDirection & DN_ALLFILES)
        AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, false, 0);
      else if (nDirection & DN_BEGINNING)
        AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, false, 0);

      if ((wParam & 0xffff) == IDC_FORWARD)
        nDirection=DN_DOWN;
      else if ((wParam & 0xffff) == IDC_BACKWARD)
        nDirection=DN_UP;
      else if ((wParam & 0xffff) == IDC_BEGINNING)
        nDirection=DN_BEGINNING;
      else if ((wParam & 0xffff) == IDC_INSEL)
        nDirection=DN_SELECTION;
      else if ((wParam & 0xffff) == IDC_ALLFILES)
        nDirection=DN_ALLFILES;
    }
    else if ((wParam & 0xffff) == IDC_FIND_BUTTON ||
             (wParam & 0xffff) == IDC_REPLACE_BUTTON ||
             (wParam & 0xffff) == IDC_ALL_BUTTON)
    {
      if ((wParam & 0xffff) == IDC_FIND_BUTTON)
        nButton=BT_FINDNEXT;
      else if ((wParam & 0xffff) == IDC_REPLACE_BUTTON)
        nButton=BT_REPLACE;
      else if ((wParam & 0xffff) == IDC_ALL_BUTTON)
        nButton=BT_REPLACEALL;

      //Find
      oFunction.AddParameter(hWndWhat);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(256);
      oFunction.Call("user32::GetWindowText" + _TCHAR);
      pFindIt=AkelPad.MemRead(lpBuffer, _TSTR);

      if (nSearchStrings)
      {
        for (i=0; i < nSearchStrings; ++i)
        {
          if (lpFindStrings[i] == pFindIt)
          {
            AkelPad.SendMessage(hWndWhat, 0x144 /*CB_DELETESTRING*/, i, 0);
            lpFindStrings.splice(i, 1);
          }
        }
        lpFindStrings.unshift(pFindIt);
        if (lpFindStrings.length > nSearchStrings)
          lpFindStrings.pop();

        AkelPad.MemCopy(lpBuffer, pFindIt, _TSTR);
        AkelPad.SendMessage(hWndWhat, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
        AkelPad.SendMessage(hWndWhat, 0x14E /*CB_SETCURSEL*/, 0, 0);
      }

      //Replace
      oFunction.AddParameter(hWndWith);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(256);
      oFunction.Call("user32::GetWindowText" + _TCHAR);
      pReplaceWith=AkelPad.MemRead(lpBuffer, _TSTR);

      if (nSearchStrings)
      {
        for (i=0; i < nSearchStrings; ++i)
        {
          if (lpReplaceStrings[i] == pReplaceWith)
          {
            AkelPad.SendMessage(hWndWith, 0x144 /*CB_DELETESTRING*/, i, 0);
            lpReplaceStrings.splice(i, 1);
          }
        }
        lpReplaceStrings.unshift(pReplaceWith);
        if (lpReplaceStrings.length > nSearchStrings)
          lpReplaceStrings.pop();

        AkelPad.MemCopy(lpBuffer, pReplaceWith, _TSTR);
        AkelPad.SendMessage(hWndWith, 0x14A /*CB_INSERTSTRING*/, 0, lpBuffer);
        AkelPad.SendMessage(hWndWith, 0x14E /*CB_SETCURSEL*/, 0, 0);
      }

      pReplaceWithEsc=pReplaceWith;
      if (bReplaceFunction)
      {
        //Replace with function
        if (!/(^|[^\w.])return\s+\S/.test(pReplaceWithEsc))
          pReplaceWithEsc="return " + pReplaceWithEsc;
        pReplaceWithEsc='var args={}, l=arguments.length;' 
                      + 'for (var i=0; i < l; ++i)\n' 
                      + '  args["$" + i]=arguments[i];\n' 
                      + 'args.offset=arguments[l - 2];\n' 
                      + 'args.s=arguments[l - 1];\n' 
                      + 'with (args)\n' 
                      + '{\n' 
                      +    pReplaceWithEsc 
                      + '\n}'; 
        pReplaceWithEsc=new Function(pReplaceWithEsc);
      }
      else if (bEscSequences)
      {
        //Esc-sequences
        pReplaceWithEsc=pReplaceWithEsc.replace(/\\\\/g, "\0");
        if (pReplaceWithEsc.search(/\\[^rnt]/g) != -1)
        {
          AkelPad.MessageBox(hWndDialog, GetLangString(STRID_SYNTAXERROR), pScriptName, 16 /*MB_ICONERROR*/);
          return 0;
        }
        pReplaceWithEsc=pReplaceWithEsc.replace(/(?:\\r\\n|\\r|\\n)/g, "\r");
        pReplaceWithEsc=pReplaceWithEsc.replace(/\\t/g, "\t");
        pReplaceWithEsc=pReplaceWithEsc.replace(/\0/g, "\\");
      }

      hWndFocus=oFunction.Call("user32::GetFocus");
      if (nButton == BT_REPLACEALL)
        EnableWindow(hWndReplaceAll, false);

      nSearchResult=SearchReplace();

      if (nButton == BT_REPLACEALL)
        EnableWindow(hWndReplaceAll, true);
      oFunction.AddParameter(hWndFocus);
      oFunction.Call("user32::SetFocus");

      if (nSearchResult == -1)
      {
        if (nDirection & DN_ALLFILES)
        {
          AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, false, 0);
          nDirection&=~DN_DOWN;
        }
        else if (nDirection & DN_BEGINNING)
        {
          AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, false, 0);
          nDirection&=~DN_DOWN;
        }
      }
      else
      {
        if (nDirection == DN_ALLFILES)
        {
          AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, true, 0);
          nDirection|=DN_DOWN;
        }
        else if (nDirection == DN_BEGINNING)
        {
          AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, true, 0);
          nDirection|=DN_DOWN;
        }
      }
    }
    else if ((wParam & 0xffff) == IDC_CANCEL)
    {
      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(16);  //WM_CLOSE
      oFunction.AddParameter(0);
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
  }
  else if (uMsg == 16)  //WM_CLOSE
  {
    if (nDirection != DN_DOWN) nDirection&=~DN_DOWN;

    for (i=0; i < nSearchStrings && lpFindStrings[i]; ++i)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Find" + i, lpFindStrings[i], "REG_SZ");
    for (i=0; i < nSearchStrings && lpReplaceStrings[i]; ++i)
      WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Replace" + i, lpReplaceStrings[i], "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Sensitive", bSensitive, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Multiline", bMultiline, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\EscSequences", bEscSequences, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\ReplaceFunction", bReplaceFunction, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\SearchReplace\\Direction", nDirection, "REG_DWORD");

    //Destroy dialog
    oFunction.AddParameter(hWnd);
    oFunction.Call("user32::DestroyWindow");
  }
  else if (uMsg == 2)  //WM_DESTROY
  {
    //Exit message loop
    oFunction.AddParameter(0);
    oFunction.Call("user32::PostQuitMessage");
  }
  return 0;
}

function SearchReplace()
{
  var hWndInitialEdit;
  var hWndCurrentEdit;
  var oPattern;
  var lpArray;
  var pSelText;
  var pResult;
  var nInitialSelStart;
  var nInitialSelEnd;
  var nSelStart;
  var nSelEnd;
  var lpInitialScroll;
  var nMatches=-1;
  var nChanges=0;
  var nChangedFiles=0;
  var nError;
  var nResult=-1;
  var i;

  hWndInitialEdit=AkelPad.GetEditWnd();
  hWndCurrentEdit=hWndInitialEdit;
  oPattern=new RegExp(pFindIt, (bSensitive?"":"i") + (nButton == BT_REPLACEALL || nDirection & DN_UP?"g":"") + (bMultiline?"m":""));

  while (1)
  {
    nInitialSelStart=AkelPad.GetSelStart();
    nInitialSelEnd=AkelPad.GetSelEnd();

    if (nButton == BT_REPLACE)
    {
      if (nInitialSelStart != nInitialSelEnd)
      {
        pSelText=AkelPad.GetSelText();

        if (lpArray=pSelText.match(oPattern))
        {
          if (lpArray.index == 0 && lpArray[0].length == (nInitialSelEnd - nInitialSelStart))
          {
            pResult=pSelText.replace(oPattern, pReplaceWithEsc);
            AkelPad.ReplaceSel(pResult);

            nInitialSelStart=AkelPad.GetSelStart();
            nInitialSelEnd=AkelPad.GetSelEnd();
          }
        }
      }
      nButton=BT_FINDNEXT;
    }

    if (nDirection & DN_DOWN)
    {
      if (nButton == BT_FINDNEXT)
      {
        nSelStart=nInitialSelEnd;
        nSelEnd=-1;
      }
      else
      {
        nSelStart=nInitialSelStart;
        nSelEnd=-1;
      }
    }
    else if (nDirection & DN_UP)
    {
      if (nButton == BT_FINDNEXT)
      {
        nSelStart=0;
        nSelEnd=nInitialSelStart;
      }
      else
      {
        nSelStart=0;
        nSelEnd=nInitialSelEnd;
      }
    }
    else if (nDirection & DN_BEGINNING)
    {
      nSelStart=0;
      nSelEnd=-1;
    }
    else if (nDirection & DN_SELECTION)
    {
      nSelStart=nInitialSelStart;
      nSelEnd=nInitialSelEnd;
    }
    else if (nDirection & DN_ALLFILES)
    {
      nSelStart=0;
      nSelEnd=-1;
    }
    lpInitialScroll=SaveScroll(hWndCurrentEdit);
    SetRedraw(hWndCurrentEdit, false);

    try
    {
      if (bAkelEdit) ScrollLock(hWndCurrentEdit, true);
      AkelPad.SetSel(nSelStart, nSelEnd);
      nSelStart=AkelPad.GetSelStart();
      nSelEnd=AkelPad.GetSelEnd();
      pSelText=AkelPad.GetSelText();
      if (bAkelEdit) ScrollLock(hWndCurrentEdit, false);

      if (nButton == BT_FINDNEXT)
      {
        if (lpArray=pSelText.match(oPattern))
        {
          if (bAkelEdit) ScrollLock(hWndCurrentEdit, true);

          if (nDirection & DN_UP)
          {
            for (i=0; lpArray[i]; ++i);
            AkelPad.SetSel(nSelStart + (lpArray.lastIndex - lpArray[i - 1].length), nSelStart + lpArray.lastIndex);
          }
          else
          {
            AkelPad.SetSel(nSelStart + lpArray.index, nSelStart + lpArray.index + lpArray[0].length);
          }

          if (bAkelEdit)
          {
            ScrollLock(hWndCurrentEdit, false);
            ScrollCaret(hWndCurrentEdit);
          }
          SetRedraw(hWndCurrentEdit, true);
          nResult=AkelPad.GetSelStart();
        }
        else
        {
          AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);
          RestoreScroll(hWndCurrentEdit, lpInitialScroll);
          SetRedraw(hWndCurrentEdit, true);

          if (nDirection & DN_ALLFILES)
          {
            //Next MDI frame
            AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4404 /*IDM_NONMENU_MDINEXT*/, 0);
            hWndCurrentEdit=AkelPad.GetEditWnd();
            if (hWndCurrentEdit != hWndInitialEdit)
            {
              AkelPad.SetSel(0, 0);
              continue;
            }
          }
          AkelPad.MessageBox(hWndDialog, GetLangString(STRID_FINISHED), pScriptName, 64 /*MB_ICONINFORMATION*/);
        }
      }
      else if (nButton == BT_REPLACEALL)
      {
        if (bShowCountOfChanges)
        {
          nMatches=pSelText.match(oPattern);
          nMatches=nMatches?nMatches.length:0;
          nChanges+=nMatches;
          ++nChangedFiles;
        }

        if (nMatches)
        {
          pResult=pSelText.replace(oPattern, pReplaceWithEsc);
          AkelPad.ReplaceSel(pResult);

          if (nDirection & DN_SELECTION)
            AkelPad.SetSel(nSelStart, nSelStart + pResult.length);
          else
            AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);
        }
        else AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);

        RestoreScroll(hWndCurrentEdit, lpInitialScroll);
        SetRedraw(hWndCurrentEdit, true);

        if (nDirection & DN_ALLFILES)
        {
          //Next MDI frame
          AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4404 /*IDM_NONMENU_MDINEXT*/, 0);
          hWndCurrentEdit=AkelPad.GetEditWnd();
          if (hWndCurrentEdit != hWndInitialEdit)
          {
            AkelPad.SetSel(0, 0);
            continue;
          }
        }

        if (bShowCountOfChanges)
        {
          if (nDirection & DN_ALLFILES)
            AkelPad.MessageBox(hWndDialog, GetLangString(STRID_COUNTFILES) + nChangedFiles + "\n" + GetLangString(STRID_COUNTCHANGES) + nChanges, pScriptName, 64 /*MB_ICONINFORMATION*/);
          else
            AkelPad.MessageBox(hWndDialog, GetLangString(STRID_COUNTCHANGES) + nChanges, pScriptName, 64 /*MB_ICONINFORMATION*/);
        }
      }
    }
    catch (nError)
    {
      RestoreScroll(hWndCurrentEdit, lpInitialScroll);
      SetRedraw(hWndCurrentEdit, true);
      AkelPad.MessageBox(hWndDialog, nError.description, pScriptName, 16 /*MB_ICONERROR*/);
    }
    break;
  }
  return nResult;
}


//Functions
function SetWindowFontAndText(hWnd, hFont, pText)
{
  var lpWindowText;

  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);

  if (lpWindowText=AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpWindowText, pText.substr(0, 255), _TSTR);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(lpWindowText);
    oFunction.Call("user32::SetWindowText" + _TCHAR);

    AkelPad.MemFree(lpWindowText);
  }
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);

  if (bRedraw)
  {
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(0);
    oFunction.AddParameter(true);
    oFunction.Call("user32::InvalidateRect");
  }
}

function SaveScroll(hWnd)
{
  var lpPoint;

  if (lpPoint=AkelPad.MemAlloc(8 /*sizeof(POINT)*/, true))
    AkelPad.SendMessage(hWnd, 1245 /*EM_GETSCROLLPOS*/, 0, lpPoint);
  return lpPoint;
}

function RestoreScroll(hWnd, lpPoint)
{
  AkelPad.SendMessage(hWnd, 1246 /*EM_SETSCROLLPOS*/, 0, lpPoint);
  AkelPad.MemFree(lpPoint, true);
}

function EnableWindow(hWnd, bEnable)
{
  oFunction.AddParameter(hWnd);
  oFunction.AddParameter(bEnable);
  oFunction.Call("user32::EnableWindow");
}

function CenterWindow(hWndParent, hWnd)
{
  var lpRect;
  var nLeftParent;
  var nTopParent;
  var nRightParent;
  var nBottomParent;
  var nLeft;
  var nTop;
  var nRight;
  var nBottom;
  var X;
  var Y;

  if (lpRect=AkelPad.MemAlloc(16))  //sizeof(RECT)
  {
    if (!hWndParent)
      hWndParent=oFunction.Call("user32::GetDesktopWindow");

    //Get rect
    oFunction.AddParameter(hWndParent);
    oFunction.AddParameter(lpRect);
    oFunction.Call("user32::GetWindowRect");

    nLeftParent=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
    nTopParent=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
    nRightParent=AkelPad.MemRead(lpRect + 8, 3 /*DT_DWORD*/);
    nBottomParent=AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);

    //Get rect
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(lpRect);
    oFunction.Call("user32::GetWindowRect");

    nLeft=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
    nTop=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
    nRight=AkelPad.MemRead(lpRect + 8, 3 /*DT_DWORD*/);
    nBottom=AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);

    //Center window
    X=nLeftParent + ((nRightParent - nLeftParent) / 2 - (nRight - nLeft) / 2);
    Y=nTopParent + ((nBottomParent - nTopParent) / 2 - (nBottom - nTop) / 2);

    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(0);
    oFunction.AddParameter(X);
    oFunction.AddParameter(Y);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x15);  //SWP_NOZORDER|SWP_NOACTIVATE|SWP_NOSIZE
    oFunction.Call("user32::SetWindowPos");

    AkelPad.MemFree(lpRect);
  }
}

function ScrollLock(hWnd, bLock)
{
  AkelPad.SendMessage(hWnd, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, bLock);
}

function ScrollCaret(hWnd)
{
  var dwScrollFlags=0;
  var dwScrollResult;

  dwScrollResult=AkelPad.SendMessage(hWnd, 3184 /*AEM_SCROLLCARETTEST*/, 0x04|0x08 /*AESC_UNITCHARX|AESC_UNITCHARY*/, MakeLong(1, 1));
  if (dwScrollResult & 0x1 /*AECSE_SCROLLEDX*/)
    dwScrollFlags|=0x10 /*AESC_UNITRECTDIVX*/;
  if (dwScrollResult & 0x2 /*AECSE_SCROLLEDY*/)
    dwScrollFlags|=0x20 /*AESC_UNITRECTDIVY*/;
  AkelPad.SendMessage(hWnd, 3183 /*AEM_SCROLLCARET*/, dwScrollFlags, MakeLong(3, 2));
}

function MakeLong(a, b)
{
  return ((a & 0xffff) | ((b & 0xffff) << 16));
}

function GetParent(pFile)
{
  var i;

  for (i=pFile.length - 1; i >= 0; --i)
  {
    if (pFile.charAt(i) == '\\')
      return pFile.substr(0, i);
  }
  return "";
}

function GetLangString(nStringID)
{
  var nLangID;

  nLangID=oFunction.Call("kernel32::GetUserDefaultLangID");
  nLangID=nLangID & 0x3ff; //PRIMARYLANGID

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == STRID_LOWJSCRIPT)
      return "\u0412\u0435\u0440\u0441\u0438\u044F\u0020\u004A\u0053\u0063\u0072\u0069\u0070\u0074\u0020\u043D\u0438\u0436\u0435\u002C\u0020\u0447\u0435\u043C\u0020\u0035\u002E\u0035\u002E";
    if (nStringID == STRID_WHAT)
      return "\u0427\u0442\u043E\u003A";
    if (nStringID == STRID_WITH)
      return "\u0427\u0435\u043C\u003A";
    if (nStringID == STRID_MATCHCASE)
      return "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C\u0020\u0440\u0435\u0433\u0438\u0441\u0442\u0440";
    if (nStringID == STRID_MULTILINE)
      return "\u041C\u043D\u043E\u0433\u043E\u0441\u0442\u0440\u043E\u0447\u043D\u043E";
    if (nStringID == STRID_ESCAPESEQ)
      return "\u0045\u0073\u0063\u002D\u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438";
    if (nStringID == STRID_FUNCTION)
      return "\u0417\u0430\u043C\u0435\u043D\u044F\u0442\u044C\u0020\u043D\u0430\u0020\u0444\u0443\u043D\u043A\u0446\u0438\u044E";
    if (nStringID == STRID_DIRECTION)
      return "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435";
    if (nStringID == STRID_FORWARD)
      return "\u0412\u043D\u0438\u0437";
    if (nStringID == STRID_BACKWARD)
      return "\u0412\u0432\u0435\u0440\u0445";
    if (nStringID == STRID_BEGINNING)
      return "\u0421\u0020\u043D\u0430\u0447\u0430\u043B\u0430";
    if (nStringID == STRID_INSEL)
      return "\u0412\u0020\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0438";
    if (nStringID == STRID_ALLFILES)
      return "\u0412\u0441\u0435\u0020\u0444\u0430\u0439\u043B\u044B";
    if (nStringID == STRID_FINDNEXT)
      return "\u041D\u0430\u0439\u0442\u0438\u0020\u0434\u0430\u043B\u0435\u0435";
    if (nStringID == STRID_REPLACE)
      return "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C";
    if (nStringID == STRID_REPLACEALL)
      return "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C\u0020\u0432\u0441\u0451";
    if (nStringID == STRID_CANCEL)
      return "\u041E\u0442\u043C\u0435\u043D\u0430";
    if (nStringID == STRID_SYNTAXERROR)
      return "\u0421\u0438\u043D\u0442\u0430\u043A\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F\u0020\u043E\u0448\u0438\u0431\u043A\u0430\u003A\n \\\\ - \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439\u0020\u0441\u043B\u044D\u0448\n \\r - \u043A\u043E\u043D\u0435\u0446\u0020\u0441\u0442\u0440\u043E\u043A\u0438\n \\t - \u0437\u043D\u0430\u043A\u0020\u0442\u0430\u0431\u0443\u043B\u044F\u0446\u0438\u0438";
    if (nStringID == STRID_FINISHED)
      return "\u041F\u043E\u0438\u0441\u043A\u0020\u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u002E";
    if (nStringID == STRID_COUNTFILES)
      return "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u043D\u044B\u0445\u0020\u0444\u0430\u0439\u043B\u043E\u0432\u003A\u0020";
    if (nStringID == STRID_COUNTCHANGES)
      return "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u0020\u0437\u0430\u043C\u0435\u043D\u003A\u0020";
  }
  else
  {
    if (nStringID == STRID_LOWJSCRIPT)
      return "JScript version is less than 5.5.";
    if (nStringID == STRID_WHAT)
      return "What:";
    if (nStringID == STRID_WITH)
      return "With:";
    if (nStringID == STRID_MATCHCASE)
      return "Case sensitive";
    if (nStringID == STRID_MULTILINE)
      return "Multiline";
    if (nStringID == STRID_ESCAPESEQ)
      return "Esc-sequences";
    if (nStringID == STRID_FUNCTION)
      return "Replace with function";
    if (nStringID == STRID_DIRECTION)
      return "Direction";
    if (nStringID == STRID_FORWARD)
      return "Down";
    if (nStringID == STRID_BACKWARD)
      return "Up";
    if (nStringID == STRID_BEGINNING)
      return "Beginning";
    if (nStringID == STRID_INSEL)
      return "In selection";
    if (nStringID == STRID_ALLFILES)
      return "All files";
    if (nStringID == STRID_FINDNEXT)
      return "Find next";
    if (nStringID == STRID_REPLACE)
      return "Replace";
    if (nStringID == STRID_REPLACEALL)
      return "Replace all";
    if (nStringID == STRID_CANCEL)
      return "Cancel";
    if (nStringID == STRID_SYNTAXERROR)
      return "Syntax error:\n \\\\ - backslash\n \\r - line feed\n \\t - tabulation";
    if (nStringID == STRID_FINISHED)
      return "Search finished.";
    if (nStringID == STRID_COUNTFILES)
      return "Changed files: ";
    if (nStringID == STRID_COUNTCHANGES)
      return "Count of changes: ";
  }
  return "";
}
