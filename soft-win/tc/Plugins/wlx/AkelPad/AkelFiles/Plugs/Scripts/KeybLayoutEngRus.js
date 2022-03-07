/// Convert keyboard layout En->Ru

var AkelPad=new ActiveXObject("AkelPad.document");

//Options
var pArraySource=new Array("'", ",", ".", ":", ";", "<", ">", "\"", "[", "]", "`", "{", "}", "~", "#", "@",  "^", "$", "?", "&", "/", "|", "A", "a", "B", "b", "C", "c", "D", "d", "E", "e", "F", "f", "G", "g", "H", "h", "I", "i", "J", "j", "K", "k", "L", "l", "M", "m", "N", "n", "O", "o", "P", "p", "Q", "q", "R", "r", "S", "s", "T", "t", "U", "u", "V", "v", "W", "w", "X", "x", "Y", "y", "Z", "z");
var pArrayTarget=new Array("ý", "á", "þ", "Æ", "æ", "Á", "Þ", "Ý",  "õ", "ú", "¸", "Õ", "Ú", "¨", "¹", "\"", ":", ";", ",", "?", ".", "/", "Ô", "ô", "È", "è", "Ñ", "ñ", "Â", "â", "Ó", "ó", "À", "à", "Ï", "ï", "Ð", "ð", "Ø", "ø", "Î", "î", "Ë", "ë", "Ä", "ä", "Ü", "ü", "Ò", "ò", "Ù", "ù", "Ç", "ç", "É", "é", "Ê", "ê", "Û", "û", "Å", "å", "Ã", "ã", "Ì", "ì", "Ö", "ö", "×", "÷", "Í", "í", "ß", "ÿ");

var hMainWnd=AkelPad.GetMainWnd();
var nSelStart;
var nSelEnd;
var pSelText;
var pResult;

if (hMainWnd)
{
  nSelStart=AkelPad.GetSelStart();
  nSelEnd=AkelPad.GetSelEnd();
  if (nSelStart == nSelEnd)
    AkelPad.SetSel(0, -1);

  pSelText=AkelPad.GetSelText();
  pResult=ConvertLayout(pSelText, pArraySource, pArrayTarget);
  AkelPad.ReplaceSel(pResult);

  if (nSelStart == nSelEnd)
    AkelPad.SetSel(0, -1);
  else
    AkelPad.SetSel(nSelStart, nSelStart + pResult.length);
}


//Functions
function ConvertLayout(pText, pArraySource, pArrayTarget)
{
  var oPattern;
  var i;

  for (i=0; i < pArraySource.length; ++i)
  {
    oPattern=new RegExp(PatternToString(pArraySource[i]), "g");
    pText=pText.replace(oPattern, pArrayTarget[i]);
  }
  return pText;
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
