/// Transliteration Cyrillic->Latin

var AkelPad=new ActiveXObject("AkelPad.document");

//Options
var pArraySource=new Array("à", "á", "â", "ã", "ä", "å", "¸",  "æ",  "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô", "õ", "ö",  "÷",  "ø",  "ù",   "ú", "û", "ü", "ý",  "þ",  "ÿ");
var pArrayTarget=new Array("a", "b", "v", "g", "d", "e", "jo", "zh", "z", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "ts", "ch", "sh", "shh", "`", "y", "'", "je", "ju", "ja");

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
  pResult=Transliterate(pSelText, pArraySource, pArrayTarget);
  AkelPad.ReplaceSel(pResult);

  if (nSelStart == nSelEnd)
    AkelPad.SetSel(0, -1);
  else
    AkelPad.SetSel(nSelStart, nSelStart + pResult.length);
}


//Functions
function Transliterate(pText, pArraySource, pArrayTarget)
{
  var oPattern;
  var i;

  for (i=0; i < pArraySource.length; ++i)
  {
    oPattern=new RegExp(PatternToString(pArraySource[i]), "g");
    pText=pText.replace(oPattern, pArrayTarget[i]);
  }
  for (i=0; i < pArraySource.length; ++i)
  {
    oPattern=new RegExp(PatternToString(pArraySource[i]), "gi");
    pText=pText.replace(oPattern, pArrayTarget[i].substr(0, 1).toUpperCase() + pArrayTarget[i].substr(1));
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
