/// Filter lines using regular expressions (custom dialog)

var AkelPad=new ActiveXObject("AkelPad.document");
var WshShell=new ActiveXObject("WScript.shell");

//Options
var bRegExp=true;      //Regular expressions search
var bSensitive=false;  //Case sensitive search
var nAction=1;         //1 - extract lines that contains pStrExp (include)
                       //2 - delete lines that contains pStrExp (exclude)

var hMainWnd=AkelPad.GetMainWnd();
var oFunction=AkelPad.SystemFunction();
var pScriptName=WScript.ScriptName;
var hInstanceDLL=AkelPad.GetInstanceDll();
var hWndDialog;
var hWndString;
var hWndStatic;
var hWndRegExp;
var hWndCase;
var hWndGroup;
var hWndInclude;
var hWndExclude;
var hWndAll;
var hWndOK;
var hWndCancel;
var hGuiFont;
var lpBuffer;
var pStrExp="";
var nStrExpLength;
var _TCHAR;
var _TSTR;
var _TSIZE;

if (hMainWnd)
{
  if (ScriptEngineMajorVersion() <= 5 && ScriptEngineMinorVersion() < 5)
  {
    AkelPad.MessageBox(hMainWnd, GetLangString(0), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
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
      oFunction.AddParameter(351);
      oFunction.AddParameter(179);
      oFunction.AddParameter(hMainWnd);
      oFunction.AddParameter(0);              //ID
      oFunction.AddParameter(hInstanceDLL);
      oFunction.AddParameter(DialogCallback); //Script function callback. To use it class must be registered by WindowRegisterClass.
      hWndDialog=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

      if (hWndDialog)
      {
        //Disable main window, to make dialog modal
        EnableWindow(hMainWnd, false);

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
    try
    {
      pStrExp=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\String");
      bRegExp=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\RegExp");
      bSensitive=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\Sensitive");
      nAction=WshShell.RegRead("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\Action");
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


    ////Edit window

    //Create window
    AkelPad.MemCopy(lpBuffer, "EDIT", _TSTR);
    oFunction.AddParameter(0x200);       //WS_EX_CLIENTEDGE
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010080);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|ES_AUTOHSCROLL
    oFunction.AddParameter(11);
    oFunction.AddParameter(31);
    oFunction.AddParameter(323);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1001);        //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndString=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndString, hGuiFont, pStrExp);

    //Select text
    AkelPad.SendMessage(hWndString, 177 /*EM_SETSEL*/, 0, -1);


    ////Static window

    //Create window
    AkelPad.MemCopy(lpBuffer, "STATIC", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000000);  //WS_VISIBLE|WS_CHILD
    oFunction.AddParameter(14);
    oFunction.AddParameter(13);
    oFunction.AddParameter(305);
    oFunction.AddParameter(13);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(-1);          //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndStatic=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndStatic, hGuiFont, GetLangString(3));


    ////Checkbox RegExp

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(65);
    oFunction.AddParameter(155);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1002);        //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndRegExp=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndRegExp, hGuiFont, GetLangString(4));


    ////Checkbox Sensitive

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010003);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
    oFunction.AddParameter(14);
    oFunction.AddParameter(86);
    oFunction.AddParameter(155);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1003);        //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndCase=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndCase, hGuiFont, GetLangString(5));


    ////GroupBox 1

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000007);  //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
    oFunction.AddParameter(180);
    oFunction.AddParameter(55);
    oFunction.AddParameter(155);
    oFunction.AddParameter(52);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(-1);          //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndGroup=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndGroup, hGuiFont, "");


    ////Checkbox Include

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(186);
    oFunction.AddParameter(67);
    oFunction.AddParameter(143);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1004);        //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndInclude=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndInclude, hGuiFont, GetLangString(6));


    ////Checkbox Exclude

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50000009);  //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
    oFunction.AddParameter(186);
    oFunction.AddParameter(86);
    oFunction.AddParameter(143);
    oFunction.AddParameter(16);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1005);        //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndExclude=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndExclude, hGuiFont, GetLangString(7));

    if (AkelPad.IsMDI())
    {
      ////All files button window

      //Create window
      AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
      oFunction.AddParameter(0);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(0);
      oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
      oFunction.AddParameter(101);
      oFunction.AddParameter(125);
      oFunction.AddParameter(75);
      oFunction.AddParameter(23);
      oFunction.AddParameter(hWnd);
      oFunction.AddParameter(1006);        //ID
      oFunction.AddParameter(hInstanceDLL);
      oFunction.AddParameter(0);
      hWndAll=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

      //Set font and text
      SetWindowFontAndText(hWndAll, hGuiFont, GetLangString(8));
    }

    ////OK button window

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
    oFunction.AddParameter(180);
    oFunction.AddParameter(125);
    oFunction.AddParameter(75);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(1);           //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndOK=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndOK, hGuiFont, GetLangString(1));


    ////Cancel button window

    //Create window
    AkelPad.MemCopy(lpBuffer, "BUTTON", _TSTR);
    oFunction.AddParameter(0);
    oFunction.AddParameter(lpBuffer);
    oFunction.AddParameter(0);
    oFunction.AddParameter(0x50010000);  //WS_VISIBLE|WS_CHILD|WS_TABSTOP
    oFunction.AddParameter(260);
    oFunction.AddParameter(125);
    oFunction.AddParameter(75);
    oFunction.AddParameter(23);
    oFunction.AddParameter(hWnd);
    oFunction.AddParameter(2);           //ID
    oFunction.AddParameter(hInstanceDLL);
    oFunction.AddParameter(0);
    hWndCancel=oFunction.Call("user32::CreateWindowEx" + _TCHAR);

    //Set font and text
    SetWindowFontAndText(hWndCancel, hGuiFont, GetLangString(2));


    //Checks
    if (bRegExp) AkelPad.SendMessage(hWndRegExp, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bSensitive) AkelPad.SendMessage(hWndCase, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (nAction == 2)
      AkelPad.SendMessage(hWndExclude, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else
      AkelPad.SendMessage(hWndInclude, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    //Center dialog
    CenterWindow(hMainWnd, hWnd);
  }
  else if (uMsg == 7)  //WM_SETFOCUS
  {
    oFunction.AddParameter(hWndString);
    oFunction.Call("user32::SetFocus");
  }
  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if (wParam == 27)  //VK_ESCAPE
    {
      //Escape key pushes Cancel button
      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(273);  //WM_COMMAND
      oFunction.AddParameter(2);    //"Cancel"
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
    else if (wParam == 13)  //VK_RETURN
    {
      //Return key pushes OK button
      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(273);  //WM_COMMAND
      oFunction.AddParameter(1);    //"OK"
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
  }
  else if (uMsg == 273)  //WM_COMMAND
  {
    if ((wParam & 0xffff) == 1001)  //"String"
    {
      oFunction.AddParameter(hWndString);
      nStrExpLength=oFunction.Call("user32::GetWindowTextLength" + _TCHAR);

      if (nStrExpLength)
      {
        EnableWindow(hWndOK, true);
        if (hWndAll) EnableWindow(hWndAll, true);
      }
      else
      {
        EnableWindow(hWndOK, false);
        if (hWndAll) EnableWindow(hWndAll, false);
      }
    }
    else if ((wParam & 0xffff) == 1002 ||   //"RegExp"
             (wParam & 0xffff) == 1003 ||   //"Sensitive"
             (wParam & 0xffff) == 1004 ||   //"Include"
             (wParam & 0xffff) == 1005)     //"Exclude"
    {
      if ((wParam & 0xffff) == 1002)
        bRegExp=AkelPad.SendMessage(hWndRegExp, 240 /*BM_GETCHECK*/, 0, 0);
      else if ((wParam & 0xffff) == 1003)
        bSensitive=AkelPad.SendMessage(hWndCase, 240 /*BM_GETCHECK*/, 0, 0);
      else if ((wParam & 0xffff) == 1004)
        nAction=1;
      else if ((wParam & 0xffff) == 1005)
        nAction=2;
    }
    else if ((wParam & 0xffff) == 1    ||   //"OK"
             (wParam & 0xffff) == 1006)     //"All"
    {
      oFunction.AddParameter(hWndString);
      oFunction.AddParameter(lpBuffer);
      oFunction.AddParameter(256);
      oFunction.Call("user32::GetWindowText" + _TCHAR);
      pStrExp=AkelPad.MemRead(lpBuffer, _TSTR);

      EnableWindow(hWndOK, false);
      if (hWndAll) EnableWindow(hWndAll, false);

      if ((wParam & 0xffff) == 1)
        LinesFilter(false);
      else
        LinesFilter(true);

      oFunction.AddParameter(hWndDialog);
      oFunction.AddParameter(16);  //WM_CLOSE
      oFunction.AddParameter(0);
      oFunction.AddParameter(0);
      oFunction.Call("user32::PostMessage" + _TCHAR);
    }
    else if ((wParam & 0xffff) == 2)  //"Cancel"
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
    //Enable main window
    EnableWindow(hMainWnd, true);

    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\String", pStrExp, "REG_SZ");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\RegExp", bRegExp, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\Sensitive", bSensitive, "REG_DWORD");
    WshShell.RegWrite("HKCU\\Software\\Akelsoft\\AkelPad\\Plugs\\Scripts\\LinesFilter\\Action", nAction, "REG_DWORD");

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

function LinesFilter(bAllDocuments)
{
  var hWndEditFirst=AkelPad.GetEditWnd();
  var oPattern;
  var pSelText;
  var pArray;
  var pResult;
  var nSelStart;
  var nSelEnd;
  var i;

  oPattern=new RegExp("[^\r]*(" + (bRegExp?pStrExp:PatternToString(pStrExp)) + ")[^\r]*\r?", "g" + (bSensitive?"":"i"));

  while (1)
  {
    nSelStart=AkelPad.GetSelStart();
    nSelEnd=AkelPad.GetSelEnd();
    if (nSelStart == nSelEnd)
      AkelPad.SetSel(0, -1);
    else
      SelCompliteLine(hWndEditFirst, nSelStart, nSelEnd);
    nSelStart=AkelPad.GetSelStart();
    nSelEnd=AkelPad.GetSelEnd();
    pSelText=AkelPad.GetSelText();
    pResult="";

    if (nAction == 1)
    {
      if (pArray=pSelText.match(oPattern))
      {
        pResult=pArray.join("");
      }
    }
    else
    {
      pResult=pSelText.replace(oPattern, "");
    }
    AkelPad.ReplaceSel(pResult);
    AkelPad.SetSel(nSelStart, nSelStart);
    AkelPad.SetSel(nSelStart, nSelStart + pResult.length);

    if (bAllDocuments)
    {
      //Next MDI frame
      AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4404 /*IDM_NONMENU_MDINEXT*/, 0);
      hWndEditCurrent=AkelPad.GetEditWnd();
      if (hWndEditCurrent == hWndEditFirst) break;
    }
    else break;
  }
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

function SelCompliteLine(hWnd, nMinSel, nMaxSel)
{
  var nMinLine;
  var nMaxLine;
  var nMinLineIndex;
  var nMaxLineIndex;
  var nMaxLineLength;

  if (nMinSel < nMaxSel)
  {
    nMinLine=AkelPad.SendMessage(hWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nMinSel);
    nMaxLine=AkelPad.SendMessage(hWnd, 1078 /*EM_EXLINEFROMCHAR*/, 0, nMaxSel);
    nMinLineIndex=AkelPad.SendMessage(hWnd, 187 /*EM_LINEINDEX*/, nMinLine, 0);
    nMaxLineIndex=AkelPad.SendMessage(hWnd, 187 /*EM_LINEINDEX*/, nMaxLine, 0);
    nMaxLineLength=AkelPad.SendMessage(hWnd, 193 /*EM_LINELENGTH*/, nMaxSel, 0);

    if (nMaxLineIndex == nMaxSel) --nMaxLine;
    else if (nMaxLineLength) nMaxSel=nMaxLineIndex + nMaxLineLength + 1;
    nMinSel=nMinLineIndex;

    AkelPad.SetSel(nMinSel, nMaxSel);
    return nMaxLine - nMinLine + 1;
  }
  return 0;
}

function PatternToString(pPattern)
{
  var pString="";
  var pCharCode;
  var i;

  for (i=0; i < pPattern.length; ++i)
  {
    pCharCode=pPattern.charCodeAt(i).toString(16);
    while (pCharCode.length < 4) pCharCode="0" + pCharCode;
    pString=pString + "\\u" + pCharCode;
  }
  return pString;
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
    if (nStringID == 0)
      return "\u0412\u0435\u0440\u0441\u0438\u044F\u0020\u004A\u0053\u0063\u0072\u0069\u0070\u0074\u0020\u043D\u0438\u0436\u0435\u002C\u0020\u0447\u0435\u043C\u0020\u0035\u002E\u0035\u002E";
    if (nStringID == 1)
      return "\u004F\u004B";
    if (nStringID == 2)
      return "\u041E\u0442\u043C\u0435\u043D\u0430";
    if (nStringID == 3)
      return "\u0421\u0442\u0440\u043E\u043A\u0430\u0020\u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442\u003A";
    if (nStringID == 4)
      return "\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0435\u0020\u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F";
    if (nStringID == 5)
      return "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C\u0020\u0440\u0435\u0433\u0438\u0441\u0442\u0440";
    if (nStringID == 6)
      return "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C\u0020\u0441\u0442\u0440\u043E\u043A\u0438";
    if (nStringID == 7)
      return "\u0423\u0434\u0430\u043B\u0438\u0442\u044C\u0020\u0441\u0442\u0440\u043E\u043A\u0438";
    if (nStringID == 8)
      return "\u0412\u0441\u0435";
  }
  else
  {
    if (nStringID == 0)
      return "JScript version is less than 5.5.";
    if (nStringID == 1)
      return "OK";
    if (nStringID == 2)
      return "Cancel";
    if (nStringID == 3)
      return "String contain:";
    if (nStringID == 4)
      return "Regular expressions";
    if (nStringID == 5)
      return "Case sensitive";
    if (nStringID == 6)
      return "Include lines";
    if (nStringID == 7)
      return "Exclude lines";
    if (nStringID == 8)
      return "All";
  }
  return "";
}
