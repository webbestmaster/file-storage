/// Insert contents of a file

var AkelPad=new ActiveXObject("AkelPad.document");

//Options
var pFilter="Text files (*.txt)\x00*.txt\x00All Files (*.*)\x00*.*\x00\x00";
var nFilterIndex=2;

var hMainWnd=AkelPad.GetMainWnd();
var pInitialFile=AkelPad.GetEditFile(0);
var pFile;
var _TCHAR;
var _TSTR;
var _TSIZE;

if (hMainWnd)
{
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

  pFile=FileOpenDialog(hMainWnd, pInitialFile, pFilter, nFilterIndex);

  if (pFile)
  {
    var OD_ADT_BINARY_ERROR    =1
    var OD_ADT_REG_CODEPAGE    =2
    var OD_ADT_DETECT_CODEPAGE =4
    var OD_ADT_DETECT_BOM      =8

    var nFlags=OD_ADT_BINARY_ERROR|OD_ADT_DETECT_CODEPAGE|OD_ADT_DETECT_BOM;
    var nCodePage=0;
    var nBOM=0;
    var pText;

    if (pText=AkelPad.ReadFile(pFile, nFlags, nCodePage, nBOM))
    {
      AkelPad.ReplaceSel(pText);
    }
  }
}


//Functions
function FileOpenDialog(hWnd, pInitialFile, pFilter, nFilterIndex)
{
  var nFlags=0x880804; //OFN_HIDEREADONLY|OFN_PATHMUSTEXIST|OFN_EXPLORER|OFN_ENABLESIZING
  var lpStructure;
  var lpFilterBuffer;
  var lpFileBuffer;
  var oFunction;
  var pResultFile="";
  var nCallResult;

  if (lpFilterBuffer=AkelPad.MemAlloc(256 * _TSIZE))
  {
    AkelPad.MemCopy(lpFilterBuffer, pFilter.substr(0, 255), _TSTR);

    if (lpFileBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      AkelPad.MemCopy(lpFileBuffer, pInitialFile.substr(0, 255), _TSTR);

      if (lpStructure=AkelPad.MemAlloc(76))  //sizeof(OPENFILENAMEA) or sizeof(OPENFILENAMEW)
      {
        //Fill structure
        AkelPad.MemCopy(lpStructure, 76, 3 /*DT_DWORD*/);                   //lStructSize
        AkelPad.MemCopy(lpStructure + 4, hWnd, 3 /*DT_DWORD*/);             //hwndOwner
        AkelPad.MemCopy(lpStructure + 12, lpFilterBuffer, 3 /*DT_DWORD*/);  //lpstrFilter
        AkelPad.MemCopy(lpStructure + 24, nFilterIndex, 3 /*DT_DWORD*/);    //nFilterIndex
        AkelPad.MemCopy(lpStructure + 28, lpFileBuffer, 3 /*DT_DWORD*/);    //lpstrFile
        AkelPad.MemCopy(lpStructure + 32, 256, 3 /*DT_DWORD*/);             //nMaxFile
        AkelPad.MemCopy(lpStructure + 52, nFlags, 3 /*DT_DWORD*/);          //Flags

        if (oFunction=AkelPad.SystemFunction())
        {
          //Call dialog
          oFunction.AddParameter(lpStructure);
          nCallResult=oFunction.Call("comdlg32::GetOpenFileName" + _TCHAR);

          //Result file
          if (nCallResult) pResultFile=AkelPad.MemRead(lpFileBuffer, _TSTR);
        }
        AkelPad.MemFree(lpStructure);
      }
      AkelPad.MemFree(lpFileBuffer);
    }
    AkelPad.MemFree(lpFilterBuffer);
  }
  return pResultFile;
}
