/// Transliteration Latin->Cyrillic

var AkelPad=new ActiveXObject("AkelPad.document");

//Options
var pArraySourceMulti=new Array("jo", "yo", "\xF6", "ch", "w", "shh", "sh", "je", "\xE4", "ju", "yu", "\xFC", "ja", "ya", "zh", "ts");
var pArrayTargetMulti=new Array("¸",  "¸",  "¸",    "÷",  "ù", "ù",   "ø",  "ý",  "ý",    "þ",  "þ",  "þ",    "ÿ",  "ÿ",  "æ",  "ö");
var pArraySourceSingle=new Array("c", "h", "x", "j", "'", "y", "#", "`", "a", "b", "v", "g", "d", "e", "z", "i", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f");
var pArrayTargetSingle=new Array("ö", "õ", "õ", "é", "ü", "û", "ú", "ú", "à", "á", "â", "ã", "ä", "å", "ç", "è", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô");

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
  pResult=Transliterate(pSelText, pArraySourceMulti, pArrayTargetMulti);
  pResult=Transliterate(pResult, pArraySourceSingle, pArrayTargetSingle);
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
