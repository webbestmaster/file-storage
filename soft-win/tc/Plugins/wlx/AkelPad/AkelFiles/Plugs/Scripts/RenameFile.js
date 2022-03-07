/// Rename current editing file

var AkelPad=new ActiveXObject("AkelPad.document");
var fso=new ActiveXObject("Scripting.FileSystemObject");

var hMainWnd=AkelPad.GetMainWnd();
var oFunction=AkelPad.SystemFunction();
var pScriptName=WScript.ScriptName;
var pFileFullName=AkelPad.GetEditFile(0);
var pFileName=fso.GetFileName(pFileFullName);
var pFileDir=GetParent(pFileFullName);
var pText="";

if (hMainWnd)
{
  pText=AkelPad.InputBox(hMainWnd, pScriptName, GetLangString(0), pFileName);

  if (pText)
  {
    var OD_ADT_BINARY_ERROR    =1
    var OD_ADT_REG_CODEPAGE    =2
    var OD_ADT_DETECT_CODEPAGE =4
    var OD_ADT_DETECT_BOM      =8

    var pNewFileFullName=pFileDir + "\\" + pText;
    var nFlags=OD_ADT_BINARY_ERROR|OD_ADT_DETECT_CODEPAGE|OD_ADT_DETECT_BOM;
    var nCodePage=0;
    var nBOM=0;

    //Close editing file
    AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4422 /*IDM_NONMENU_FILECLOSE*/, 0);

    //Rename file
    fso.MoveFile(pFileFullName, pNewFileFullName);

    //Open file
    AkelPad.OpenFile(pNewFileFullName, nFlags, nCodePage, nBOM);
  }
}


//Functions
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
      return "\u041D\u043E\u0432\u043E\u0435\u0020\u0438\u043C\u044F\u003A";
  }
  else
  {
    if (nStringID == 0)
      return "New name:";
  }
  return "";
}
