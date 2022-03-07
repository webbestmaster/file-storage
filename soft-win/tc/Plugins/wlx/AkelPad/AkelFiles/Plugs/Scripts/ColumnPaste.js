/// Paste to column selection (4.2.0 or higher required)

var AkelPad=new ActiveXObject("AkelPad.document");

var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oFunction=AkelPad.SystemFunction();
var pScriptName=WScript.ScriptName;
var pSelText;
var pClipboardText;
var pLinesArray;
var nIndex;
var dwOptions;

if (hMainWnd)
{
  if (AkelPad.IsAkelEdit())
  {
    if (AkelPad.SendMessage(hWndEdit, 3125 /*AEM_GETSEL*/, 0, 0))
    {
      if (AkelPad.SendMessage(hWndEdit, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
      {
        pSelText=AkelPad.GetSelText();
        pClipboardText=AkelPad.GetClipboardText();

        if (pLinesArray=pSelText.split("\r"))
        {
          for (nIndex=0; nIndex < pLinesArray.length; ++nIndex)
          {
            pLinesArray[nIndex]=pClipboardText;
          }
          pSelText=pLinesArray.join("\r");

          dwOptions=AkelPad.SendMessage(hWndEdit, 3227 /*AEM_GETOPTIONS*/, 0, 0);
          if (!(dwOptions & 0x40 /*AECO_PASTESELECTCOLUMN*/))
            AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x40 /*AECO_PASTESELECTCOLUMN*/);
          AkelPad.ReplaceSel(pSelText);
          if (!(dwOptions & 0x40 /*AECO_PASTESELECTCOLUMN*/))
            AkelPad.SendMessage(hWndEdit, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x40 /*AECO_PASTESELECTCOLUMN*/);
        }
      }
      else AkelPad.MessageBox(hMainWnd, GetLangString(2), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
    }
    else AkelPad.MessageBox(hMainWnd, GetLangString(1), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
  }
  else AkelPad.MessageBox(hMainWnd, GetLangString(0), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
}


//Functions
function GetLangString(nStringID)
{
  var nLangID;

  nLangID=oFunction.Call("kernel32::GetUserDefaultLangID");
  nLangID=nLangID & 0x3ff; //PRIMARYLANGID

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "Требуется AkelPad 4.x.x или выше";
    if (nStringID == 1)
      return "Отсутствует выделенный текст.";
    if (nStringID == 2)
      return "Требуется вертикальное выделение.";
  }
  else
  {
    if (nStringID == 0)
      return "Required AkelPad 4.x.x or higher";
    if (nStringID == 1)
      return "No text selected.";
    if (nStringID == 2)
      return "Required column selection.";
  }
  return "";
}
