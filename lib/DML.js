/* DML.js

(C) 28/07/2021 Eckehard Fiedler

Revision DML1.01: 12.02.2024: added begin/end for compatibility

Create dynamic Websites on the fly. 

Content can be created completely or as a combination with standard HTML-Elemtents. 
General page structure should be:

<head>
  <meta charset="utf-8">
  <title>title</title>
  <style> ... some CSS stuff </style>
  <script type="text/javascript" src="create.js"></script>
</head>

<body>

  ... Your HTML-Content, referenced Element with ID:
  <h1 id="myHeader">My Header</h1>

  <script>
    // =============== references ===============
    let myHeader = elementById("myHeader"); // Get from HTML
    // =============== letiables ===============
    ... define global letiables here
    // =============== dynamic created HTML ===============
    ... create new contents
    // =============== functions ===============
    ... all actions defined here
  </script>
</body>

Object Creation 
===============
First, an html-Element can be selected as base element:

    begin(ID)  (ID can be an element ID or en element reference) 
    end()  -> restor previous base point

if no element was selected or se selection was remove with select(""), the document body is used, 
elements are appended to the end of the document. HTML Elements can be added by

    let c = appendBase(obj) 

New Objects can be created with:

     let c = create(typ,attr,content)   Create element with contents (either text or other object) 

As most elements will be added to the document directly, there is a short form:

    let c = make(typ, attr ,content), that combines appendBase(create(...)


Example: Create an h1-Object:
============================
    
  make("h1","Hello World"))

make/appendBase returns the object reference, so any DOM-Property can be set on the fly as

  make("h1","Hello World").style.color = "#aa0000"

or: 

  let c = make("h1","Hello World")
  c.style.color = "#aa0000"

or
  let h = make("h1","Hello World")
  with (h.style)
  {   color = "#A00000"
      border = "solid #006F00"
      backgroundColor = "#aaaaaa"
      width = "50%"
      borderRadius = "30px"
      textAlign = "center"
  }

It´s easy to copy a comlete style set like this:

  v2.style.cssText = v1.style.cssText

Some functions for list and table creation are provided, that create new or set already defined list/table elements
from arrays.

We also very proudly present the most simple AJAX-request:

httpGet(url, par1...).response = function(s, par1...) { ...do something  }

As function(s) is called delayed, it may not be able to access dynamic elements (e.g. a loop counter). Therefore, 
parameters par1-par3 can be set to transfer state informations at the time, httpGet ist called.     

*/
/* ----------------------------------------------------------------------------
    global variables
   ---------------------------------------------------------------------------- */

var _base // Global element stores current insert position. If empty, elements are added at the end of document.
var _baseStack = [] // Stack for storing _base positions
var _block = false // global var for blocking loaders
var _onresizeElements = [] // global list for onresize handlers

/* ----------------------------------------------------------------------------
   constants
   ---------------------------------------------------------------------------- */

const svgref = "http://www.w3.org/2000/svg";
const PI2 = 2 * Math.PI
const _style = "style"
const _bold = "font-weight: bold;"
const _italic = "font-style: italic;"
const _fs = "font-size: "
const _bigtext = "font-size: 130%;"
const _bg = "background-color: "
const _bgred = "background-color: red;"
const _bgred2 = "background-color: #f50;"
const _bgy = "background-color: #ffc;"
const _bggreen = "background-color: #695;"
const _bgblue = "background-color: blue;"
const _bgorange = "background-color: #fc0;"
const _bgsilver = "background-color: silver;"
const _bgyellow = "background-color: #ffffee;"
const _bgwhite = "background-color: white;"
const _bgblack = "background-color: black;"
const _bgtrans = "background-color: rgba(0,0,0,0.05);"
const _bgwtrans = "background-color: rgba(255,255,255,0.5);"
const _red = "color: red;"
const _blue = "color: blue;"
const _navy = "color: navy;"
const _white = "color: white;"
const _yellow = "color: yellow;"

const _center = "text-align: center;"
const _right = "text-align: right;"
const _top = "vertical-align: top;"
const _bottom = "vertical-align: bottom;"
const _middle = "vertical-align: middle;"
const _flexmiddle = "display: flex; align-items: center;"
const _blur = "filter: blur(2px);"
const _shadow = "box-shadow: 3px 3px 4px gray;"
const _bigshadow = "box-shadow: 6px 6px 8px gray;"
const _smallShadow = "box-shadow: 2px 2px 3px gray;"
const _txtShadow = "text-shadow: 5px 6px 4px  rgba(0,0,0,0.44);"
const _bigTxtShadow = "text-shadow: 8px 13px 5px  rgba(0,0,0,0.44);"
const _border = "border: thin solid silver;"
const _noborder = "border: 0px;"
const _radius = "border-radius: 8px;"
const _miniRadius = "border-radius: 5px;"
const _padding = "padding: 2px;"
const _tpadding = "padding: 1px 5px 1px 5px;"
const _bigPadding = "padding: 10px;"
const _smallMargin = "margin: 2px;"
const _margin = "margin: 5px;"
const _marginLeft = "margin-left: 5px;"
const _marginRight = "margin-right: 5px;"
const _bigMarginLeft = "margin-left: 10px;"
const _bigMarginRight = "margin-right: 10px;"
const _inShadow = "-webkit-box-shadow: inset 5px 5px 3px -2px rgba(0,0,0,0.64);" +
  "-moz-box-shadow: inset 5px 5px 3px -2px rgba(0,0,0,0.64);" +
  "box-shadow: inset 5px 5px 3px -2px rgba(0,0,0,0.64);"
// Combined styles 
const _box = _bgwhite + _border + _shadow
const _ybox = _border + _shadow + _bg + "#ffc;"

// Flex Layout definitions: At leas 3 columns without header
const _bodyFlex = "display: flex; flex-flow: row nowrap; justify-content: space-between;"
const _sideFlex = "flex-shrink: 0.5;" // side will shrink less
const _columnFlex = "flex-grow: 0; display: flex;  flex-flow: row nowrap;"
const _flex = "display: flex;"
const _flexSpaceAround = "display: flex; justify-content: space-around;"
const _flexSpaceBetween = "display: flex; justify-content: space-around;"
// Use width: calc(100% - 200px); for expandable element
const _sticky = "position: -webkit-sticky; position: sticky; top: 0px;"
const _btnstyle = "width: 100px; height: 24px;" +
  "  display: inline-flex; align-items: center;" +
  " justify-content: center; margin: 8px;"
const _flybox = "position: fixed;" +
  "padding: 6px;" +
  "box-shadow: 5px 5px 6px silver;" +
  "border-radius: 8px;" +
  "background-color: #ffffff;" +
  "border: thin solid gray;" +
  "left: 50%;" +
  "top: 50%;" +
  "transform: translate(-50%, -50%);"

/****************************************************************************************
  Spracheinstellung
  Voreinstellung ist Deutsch. Nach Aufruf von getLanguage(...) wird die Sprache umgestellt
  mit L(["de","en","fr"]) 
****************************************************************************************/
let _language = 0
const de = 0
const en = 1
const fr = 2

let languages = ["de", "en", "fr"]

// Get language number from string
function getLanguage(s) {
  let s2 = s.toLowerCase(s).substr(1, 2)
  for (let i in languages) {
    if (s.toLowerCase(s) == languages[i])
      return _language = i
  }
}

/*------------------------------------------------------
   Deliver language specific string
   can be L(["de","en","fr"]) or 
   L("de","en","fr")
  ------------------------------------------------------*/
function L(s, sen, sfr) {
  if (Array.isArray(s)) {
    return s[_language]
  }
  if (_language == 1)
    if (sen) return sen
  if (_language == 2)
    if (sfr) return sfr
  return s
}

/****************************************************************************************
  Helper functions
****************************************************************************************/

/*------------------------------------------------------
  automatically binds all methods to the class instance
  !!! important !!!

// Fix autobind
(function autobind(self, proto){
for(let key of Object.getOwnPropertyNames( proto )){
if(key !== 'constructor') self[key] = self[key].bind(self);
}
let parentProto = Object.getPrototypeOf(proto);
if (parentProto !== Object.prototype){
autobind(self, parentProto);
}
})(this, this.constructor.prototype);

  ------------------------------------------------------*/
function autobind(instance) {
  let proto = Object.getPrototypeOf(instance);
  let propertyNames = Object.getOwnPropertyNames(proto);
  for (let name of propertyNames) {
    let value = proto[name];
    if ((typeof value === 'function')) {
      if (name !== 'constructor')
        instance[name] = proto[name].bind(instance);
    }
  }
}

/*------------------------------------------------------
   immediate call. Replaces (f())()
   can be used to check, if f is a function
  ------------------------------------------------------*/
function call(f, ...args) {
  if (f instanceof Function)
    return f(...args)
}

/*------------------------------------------------------
   dynamic script import
   gets single moduleName or arra of Modulenames for dynamic import
   calls callback, after last module is loaded
   prevents double import by creating a semaphore variable from filename

   _import(["..\\lib\\DML_table.js","..."], callback)
   _import(["..\\lib\\DML_table.js","..."]).ready = () =>{ }

  ------------------------------------------------------*/
function _import(moduleNames, callback) {

  if (typeof (moduleNames) == 'string')
    moduleNames = [moduleNames]

  let count = moduleNames.length
  for (i in moduleNames) {
    let moduleName = moduleNames[i];
    let varName = extractFilename(moduleName).replace('.', '_');
    if (typeof (window[varName]) == 'undefined') {
      window[varName] = varName // define a semaphore
      let script = document.createElement('script');
      script.src = moduleNames[i];
      script.onload = () => {
        if (--count == 0) {
          if (callback) callback()
        }
      };
      document.head.appendChild(script); //or something of the likes
    } else { // if one lib was defined, cancel import
      if (callback) {
        callback()
        return
      }

    }
  }
}

/*!
loadCSS: load a CSS file asynchronously.
[c]2014 @scottjehl, Filament Group, Inc.
Licensed MIT
*/
function loadCSS(href, before, media) {
  "use strict";
  // Arguments explained:
  // `href` is the URL for your CSS file.
  // `before` optionally defines the element we'll use as a reference for injecting our <link>
  // By default, `before` uses the first <script> element in the page.
  // However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
  // If so, pass a different reference element to the `before` argument and it'll insert before that instead
  // note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
  var ss = window.document.createElement("link");
  var ref = before || window.document.getElementsByTagName("script")[0];
  ss.rel = "stylesheet";
  ss.href = href;
  // temporarily, set media to something non-matching to ensure it'll fetch without blocking render
  ss.media = "only x";
  // inject link
  ref.parentNode.insertBefore(ss, ref);
  // set media back to `all` so that the styleshet applies once it loads
  setTimeout(function () {
    ss.media = media || "all";
  });
}

/* ----------------------------------------------------------------------------
   Create style Object {"style" : s}
   if either s1 or s2 is an object, style property is added to the object
   other parameter has to be a string "color: red; width: 100px"

   style("color: red;") -> {style: "color: red;"}
   style({"id":"test"},"color: red;") -> {"id":"test", style: "color: red;"}
   style("color: red;", {"id":"test"}) -> {"id":"test", style: "color: red;"}
   ----------------------------------------------------------------------------*/
function style(s1, s2) {
  let r = {}
  if (!s2) {
    r["style"] = s1
    return r
  }

  if (typeof (s1) === "object") {
    r = s1
    r["style"] = s2
  } else {
    if (typeof (s2) === "object")
      r = s2
    r["style"] = s1
  }
  return r
}

/* =======================================================================
   extract(): simplified version of jsonPath
   extracts an array of values from an array of objects, Simple subst for JsonPath
   filter is an object {"key1": "Value1", "key2": "Value2", ...} to define 
   a subset where Key1=Value1 and Key2 = Value2...
   Result is an array of values from column resultKey 
   if resultKey is an array, multiple keys can be extracted
   if filter is a string, extract returns array of values  result = item[filter]
   =======================================================================*/
function extract(s, filter, resultKey) {

  // Parse result strings
  function strchk(k) {
    //    if (k.constructor === String)
    //      k=JSON.parse(k)
    return k
  }


  let t = [],
    k; // empty array as return
  let doArray = false;
  if (resultKey)
    doArray = Array.isArray(resultKey); // Check result key

  if (typeof (filter) == "object") {
    if (Object.keys(filter).length > 0) { // Filter was set
      let keys = Object.keys(filter)
      let values = Object.values(filter)
      let doPush = true

      s.forEach(function (item) { // Ceck, if all filters are in item
        doPush = true
        for (let i = 0; i < keys.length; i++) {
          if (item[keys[i]] != values[i])
            doPush = false
        }
        if (doPush) {
          if (resultKey) {
            let o = {} // Output value
            if (doArray) { // 1: copy multiple keys
              for (let _i in resultKey) {
                let key = resultKey[_i]
                k = item[key]
                o[key] = strchk(k)
              }
            } else {
              k = item[resultKey]
              o = strchk(k) // 2: copy value of key element
            }
            t.push(o)
          } else
            t.push(item); // 3: no key, copy item
        }
      })
      return (t)

    } else { // Filter empty -> Fast copy without filter
      s.forEach(function (item) {
        if (resultKey) {
          let o = {} // Output value
          if (doArray) { // 1: copy multiple keys
            for (let _i in resultKey) {
              let key = resultKey[_i]
              k = item[key]
              o[key] = strchk(k)
            }
          } else {
            k = item[resultKey]
            o = strchk(k) // 2: copy value of key element
          }
          t.push(o)
        } else
          t.push(item); // or copy item
      })
      return t
    }
  } else { // if Filter == string, use as key
    for (let _i in s) {
      item = s[_i]
      t.push(item[filter]) // Copy s[resultKey]
    }
    return t
  }

}

/*------------------------------------------------------
  fitSelector: return only elements of a that exist in b
  a = {...} and b {...}
  ------------------------------------------------------*/
function fitSelector(a, b) {
  if (a == null) return
  if (b == null) return

  let c = {}
  let ka = Object.keys(a)
  let kb = Object.keys(b)
  for (let i in ka) {
    let k = ka[i]
    if (kb.includes(k))
      c[k] = a[k]
  }
  return (c)
}

/*------------------------------------------------------
  extractFit(): like extract, but fits filter to existing keys in s[0]

  ------------------------------------------------------*/
function extractFit(s, filter, resultKey) {
  let fs = fitSelector(filter, s[0])
  return extract(s, fs, resultKey)
}

/*------------------------------------------------------
  joinOver: Join two objects overwriting same properties with second
  ------------------------------------------------------*/
function joinOver(first, second) {
  if (!second) return first
  if (!first) return second
  const keys = Object.keys(second)
  for (let i in keys) {
    let k = keys[i];
    first[k] = second[k]
  }
  return first
}

/*------------------------------------------------------
   My Pretty Printer
   Remove linebreaks in short arrays
  ------------------------------------------------------*/
function pretty(s) {
  let js = JSON.stringify(s, null, 4)
  let out = "",
    A = " "
  let mode = 0
  for (let _B in js) {
    let B = js[_B]
    if (B == "[")
      mode = 1
    if ("]{}".includes(B))
      mode = 0
    if (mode == 1) {
      if (B != '\n' && B != '\r') {
        if (B != ' ')
          out += B
        /* else
           if (A != ' ')
             out += B*/
      }
      A = B
    } else
      out += B
  }
  return out
}

/*------------------------------------------------------
    print with <pre> 
  ------------------------------------------------------*/
function addPre(s) {
  return "<pre>" + pretty(s) + "</pre>"
}

/*------------------------------------------------------
   Math-shortcuts 
  ------------------------------------------------------*/
function round(f, n = 0) {
  m = Math.pow(10, n)
  return (Math.round(f * m) / m)
}

// trunc: integer value 
function trunc(x) {
  return Math.trunc(x)
}

// Floor: next lower value
function floor(x) {
  return Math.floor(x)
}

function abs(x) {
  return Math.abs(x)
}

function exp10(r) {
  return Math.pow(10, r)
}

function log10(r) {
  return Math.log10(r)
}

/*------------------------------------------------------
   check, if x in range L to H
  ------------------------------------------------------*/
function inRange(x, L, H) {
  if (x < L) return false
  if (x > H) return false
  return true
}

/*------------------------------------------------------
   force result to range L to H
  ------------------------------------------------------*/
function constrain(x, L, H) {
  if (x < L) return L
  if (x > H) return H
  return x
}

/*------------------------------------------------------
  Max/Min-Werte berechnen
  ------------------------------------------------------*/
function min(a, b) { return Math.min(a, b) }

function max(a, b) { return Math.max(a, b) }

function getMin(x0, xmin) {
  xmin = Number(xmin)
  if (x0)
    return Math.min(x0, xmin)
  else
    return xmin
}

function getMax(x1, xmax) {
  xmax = Number(xmax)
  if (x1)
    return Math.max(x1, xmax)
  else
    return xmax
}

/*------------------------------------------------------
   make xy-object
  ------------------------------------------------------*/
function p(x, y) {
  return { x: x, y: y }
}
/*------------------------------------------------------
   make pixel-coordinate, accepts "150px", 150 or 150.0
  ------------------------------------------------------*/
function px(x) {
  if (typeof (x) == "string")
    return x
  return Math.round(x) + 'px'
}
/*------------------------------------------------------
  read pixel coordinate as number
  ------------------------------------------------------*/
function getpx(x) {
  if (typeof (x) == "string") {
    x = x.replace('px', '').trim()
    return Number(x)
  }
  return x
}

/*------------------------------------------------------
  get value from array of default, if not defined
  ------------------------------------------------------*/
function arrayvalue(ar, i, def) {
  let a = ar[i]
  if (typeof a === 'undefined')
    return def
  else
    return ar[i]
}

/****************************************************************************************
  special functions
****************************************************************************************/
/*------------------------------------------------------
   smooth transition 0..1, 
  ------------------------------------------------------*/
function smooth(x) {
  if (x < 0) return 0
  else if (x > 1) return 1
  else return x * x * (3 - x - x); // 3.683
}

/*------------------------------------------------------
   quadratic transition 0..1, 
  ------------------------------------------------------*/
function smooth2(x) {
  if (x < 0) return 0
  else if (x > 1) return 1
  else if (x < 0.5) return 2 * x * x
  else {
    x = 1 - x;
    return 1 - 2 * x * x;
  }
}

/*------------------------------------------------------
   return the filename from full path
  ------------------------------------------------------*/
function extractFilename(name) {
  if (name.includes('\\'))
    return name.substring(name.lastIndexOf('\\') + 1)
  else
    return name.substring(name.lastIndexOf('/') + 1)
}
/*------------------------------------------------------
  Returns a function, that, as long as it continues to be invoked, will not
  be triggered. The function will be called after it stops being called for
  N milliseconds. If `immediate` is passed, trigger the function on the
  leading edge, instead of the trailing.

var myEfficientFn = debounce(function() {
  // All the taxing stuff you do
}, 250);
window.addEventListener('resize', myEfficientFn);
 ------------------------------------------------------*/
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/*------------------------------------------------------
  find out, if page is shown on touch device
  ------------------------------------------------------*/
function isTouchDevice() {
  return ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);
}
/*------------------------------------------------------
  check for mobile device
  ------------------------------------------------------*/
function isMobileDevice() {
  if (navigator.userAgent.indexOf("Mobile") > 0) {
    return true;
  } else {
    return false;
  }
}

/*------------------------------------------------------
   use def if par is not defined, for initializations 
   (as || is not working on zero params)
  ------------------------------------------------------*/
function _init(par, def) {
  if (typeof (par) == 'undefined')
    return def
  else
    return par
}


/*------------------------------------------------------
    Quick default initialization
    Checks, if options are set. if not, defaults are used
    sets only values that are present in defaults
    call: setOptions(this,options,{low: 10, high: 100,...})
  ------------------------------------------------------*/
function setOptions(target, options, defaults) {
  let keys = Object.keys(defaults)
  for (let i in keys) {
    let k = keys[i];
    if (typeof (options[k]) != 'undefined')
      target[k] = options[k]
    else
      target[k] = defaults[k]
  }
}

/*------------------------------------------------------
  Make Object Draggable
  ------------------------------------------------------*/
function dragElement(el, install = true) {
  let onAfterDrag = null
  let active = false
  let currentX, currentY
  let initialX, initialY
  let xOffset = 0,
    yOffset = 0

  // if install == false -> remove event
  if (!install) {
    el.removeEventListener("touchstart", dragStart)
    el.removeEventListener("mousedown", dragStart)
    return
  }

  el.addEventListener("touchstart", dragStart, false)
  el.addEventListener("mousedown", dragStart, false)

  function dragStart(e) {
    e = e || window.event;
    if (el != e.target) return // Leave, if element is child of elmnt
    if (e.offsetY > 25) return // only top 20 Pixel active


    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset
      initialY = e.touches[0].clientY - yOffset
    } else {
      initialX = e.clientX - xOffset
      initialY = e.clientY - yOffset
    }

    //   if (e.target === el) {
    active = true
    document.addEventListener("touchend", dragEnd, false)
    document.addEventListener("touchmove", drag, false)
    document.addEventListener("mouseup", dragEnd, false)
    document.addEventListener("mousemove", drag, false)
    document.body.style.cursor = "move";
    //   }
  }

  function dragEnd(e) {
    initialX = currentX
    initialY = currentY

    active = false
    document.removeEventListener("touchend", dragEnd, false)
    document.removeEventListener("touchmove", drag, false)
    document.removeEventListener("mouseup", dragEnd, false)
    document.removeEventListener("mousemove", drag, false)
    document.body.style.cursor = "default";

  }

  function drag(e) {
    if (active) {

      e.preventDefault()

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX
        currentY = e.touches[0].clientY - initialY
      } else {
        currentX = e.clientX - initialX
        currentY = e.clientY - initialY
      }

      xOffset = currentX
      yOffset = currentY

      setTranslate(currentX, currentY, el)
      if (onAfterDrag)
        call(onAfterDrag)
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)"
  }
  return this
}


/****************************************************************************************

    General Functions: 
    begin: select new base point for object creation
    popBase: restore previous base
    create: create free Elemtent
    appendBase: Add new element at base point
    make:   appendBase(create(typ, attrib, c))
      - typ: html-object type, e.g. "button"
      - attrib: array of attributes {"key":"value",...}
      - c: Text of object to appendBase, can be used for quick creation: make("div",{},"Hello world") => Div with content, c can be element

     
****************************************************************************************/

/*------------------------------------------------------
  Select new base element for object creation 
  returns the new base for further usage, e.g.
  let myDiv = begin(div())

  saves old base with pushBase(), restore with popBase()
  Check Stack mismatch:
  let l = baseStackLength()
  begin(...)
  ....
  end(l)
  ------------------------------------------------------*/
function begin(ID) {
  // Save old base
  _baseStack.push(_base)
  if (_baseStack.length > 100) {
    alert("DML error: _baseStackOverflow in bushBase()")
    _baseStack = []
  }
  // select new base, either ID or element
  if (typeof (ID) === 'string')
    _base = document.getElementById(ID)
  else
    _base = ID
  return _base
}

function sb(ID) { begin(ID) } // Alias shortcut

/*------------------------------------------------------
  read curent _base
  ------------------------------------------------------*/
function getBase() {
  return _base
}

/*------------------------------------------------------
   get current stack position
  ------------------------------------------------------*/
function DMLgetSP() {
  return _baseStack.length
}

/*------------------------------------------------------
  set Stackpointer for stored value
  ------------------------------------------------------*/
function DMLsetSP(SP, msg = "DMLsetSP") {
  if (SP > _baseStack.length)
    alert("Error in " + msg + ", Stack pointer below desired SP")
  else
    while (_baseStack.length > SP)
      _base = _baseStack.pop()
  return _baseStack.length
}

/*------------------------------------------------------
   check, if current position is equal to chk
   chk is the stacklength before push, gives stack mismatch alert
  ------------------------------------------------------*/
function DMLchkSP(oldCnt = 0, txt = "Missing end()") {
  if (DMLgetSP() != oldCnt)
    alert("DML error: _baseStack size mismatch - " + txt + ", before: " + oldCnt + ", after: " + DMLgetSP())
  return _baseStack.length
}

/*------------------------------------------------------
  Stack-Prüfung für Einzelfunktionen
  f: ()=>{return new construct(xyz) }
  ------------------------------------------------------*/
function checkSP(f, txt) {
  let sp = DMLgetSP()
  let ret = f()
  DMLchkSP(sp, txt)
  return ret
}

/*------------------------------------------------------
   restore last base from stack, returns Stack position.
   if cnt set, end is called cnt times
   oldCnt is provided for test purpose. If SP after end
   is different, error message is displayed
  ------------------------------------------------------*/
function end(cnt = 1, oldCnt = -1, msg = "end") {
  for (let i = 0; i < cnt; i++) {
    if (_baseStack.length <= 0) {
      alert("DML error: _baseStack empty in popBase()")
      break
    } else
      _base = _baseStack.pop() // restore old stack

    if (oldCnt >= 0) {
      if (DMLgetSP() != oldCnt)
        alert("DML error: _baseStack size mismatch - " + msg + ", before: " + oldCnt + ", after: " + DMLgetSP())
    }
  }
  // if chk, check Stacklength after pop == chk
  return _baseStack.length
}


/* ----------------------------------------------------------------------------
   Check, if node is element or string
   create span from string
   if c is object, return Object only
   ----------------------------------------------------------------------------*/
function chk_node(c) {
  if (typeof (c) == "string") {
    let ret = create("span")
    ret.innerHTML = c
    return ret
    //  return textNode(c)
  } else return c
}

function textNode(s) {
  return document.createTextNode(s)
}
/* ----------------------------------------------------------------------------
   Set JSON array as element attributes:
   {"class":"test", "style":"color: red; display: none"}
   If only a string is provided as attrib, it is assumed to be a style definition
   so "color: red;" is converted to {"style":"color: red;"}
   style strings are disassembled and set via style.setProperty() to prevent unwanted
   overwrite of style attributes. 

   Style properties are always added, to remove use style.removeProperty()
   ---------------------------------------------------------------------------- */
function setAttributes(el, attrib) {
  if (typeof (attrib) == "string") // Check for string attribute          
    attrib = { "style": attrib } // Convert strings to {"style",attrib}

  // set attributes
  if (typeof (attrib) == "object") {
    // Slpit JSON, set attributes individually
    Object.keys(attrib).forEach(function (key) {
      let val = attrib[key]
      if (key != "style") {
        el.setAttribute(key, val); // Normal attributes
      } else { // set Style parameters individually
        let ar = val.split(';'); // Split style Elements
        ar.forEach(function (pair) {
          if (pair) { // If not empty    
            let kv = pair.split(":")
            if (kv.length == 2) {
              let p = kv[0].trim()
              let v = kv[1].trim()
              el.style.setProperty(p, v); // Set property
            }
          }
        })
      }
    })
  }
  return (el)
}

/*------------------------------------------------------
   general short cut function. Creates an element and appends
   to existing object. Type is string like 'div'
  ------------------------------------------------------*/
function createAt(obj, typ, attrib) {
  let ret = document.createElement(typ)
  setAttributes(ret, attrib)
  obj.appendChild(ret)
  return ret
}


// ----------------------------------------------------------------------------
// create object with content and attributes. Content can be text or object
// attrib is an JSON-object {"id":"test", "class": myclass}
// ----------------------------------------------------------------------------
function create(typ, attrib, c) {
  let el = document.createElement(typ)
  if (c) {
    if (typeof (c) == 'string') el.innerHTML = c
    else el.appendChild(c); // sicherstellen, daß c objekttyp ist
  }
  if (attrib) { setAttributes(el, attrib) }
  return el
}


// ----------------------------------------------------------------------------
// Append object at current base
// ----------------------------------------------------------------------------
function appendBase(c) {
  let e = chk_node(c)
  if (_base) _base.appendChild(e)
  else {
    // if (document.body) document.body.append(e)
    if (document.body) document.body.appendChild(e)
    else {
      console.log("null Body found: " + c.textContent)
      return
    }
  }
  return (e)
}
// ----------------------------------------------------------------------------
// Append object at current base without check for String
// ----------------------------------------------------------------------------
function _appendBase(c) {
  if (_base)
    _base.appendChild(c)
  else
    document.body.append(c)
  return (c)
}

// ----------------------------------------------------------------------------
// make: create element with content and appendBase at current base
// attributes is an JSON-object {"id":"test", "class": myclass}
// ----------------------------------------------------------------------------
function make(typ, attrib, c) {
  return appendBase(create(typ, attrib, c))
}

/*------------------------------------------------------
 Add an array of prperties to obj; 
 can be array of string or array of object 
 addProps(obj,"option",["a","b","c"])
 addProps(obj,"option",[{text:"a", value: 2},{text: "b", value: 2},{text: "c", value: 3}])
  
 all Object keys are set as attributes of the "option", 
 Value of the first key ("text") is used as option value
  ------------------------------------------------------*/
function addProps(obj, prop, ar) {
  if (!typeof (obj) == "object") alert("Error in addProps: First Parameter should be object")
  let w
  //  ar.forEach((item) => {
  ar.forEach(function (item) {
    if (typeof (item) == "string") {
      obj.add(create(prop, {}, item)) // If array of stirngs, set as text
    } else if (typeof (item) == "object") {
      let o = create(prop, item, Object.values(item)[0]) // if array of objects, first value is used as child node text
      obj.add(o)
    } else {
      obj.add(create(prop, {}, JSON.stringify(item))) // Convert anythig else to STRING
    }
  })
}

// Set new Options
function putProps(obj, prop, ar) {
  obj.innerHTML = ""
  addProps(obj, prop, ar)
}


// ----------------------------------------------------------------------------
// Appends an array of prperties to obj as childs; 
// if key is set, ar[i].key is used
// ----------------------------------------------------------------------------
function appendChilds(obj, prop, ar) {
  if (typeof (obj) != "object")
    alert("Error in appendChilds: First Parameter should be object")
  for (let w in ar) {
    let item = ar[w]
    // w = item
    obj.appendChild(create(prop, {}, item))
  }

}

// Get ElementById
function elementById(ID) {
  return document.getElementById(ID)
}

/****************************************************************************************
  DML shortcut function definitions
****************************************************************************************/


/* ============================================================================
   following functions use their name as argument: h1(text) creates  <h1> text </h1> 
   return object reference let b = button("test")
   ============================================================================ */

function br(cnt) { let n = cnt || 1; let br; for (let i = 0; i < n; i++) br = make("br"); return br; } // br() or br(5) for one or multiple linebreaks
function nbsp(n = 1) {
  let s = "";
  for (let i = 0; i < n; i++) { s += "\xa0" }
  print(s)
}

function h1(s, attrib) { return make("h1", attrib, s) }

function h2(s, attrib) { return make("h2", attrib, s) }

function h3(s, attrib) { return make("h3", attrib, s) }

function h4(s, attrib) { return make("h4", attrib, s) }

function h5(s, attrib) { return make("h5", attrib, s) }

function h6(s, attrib) { return make("h6", attrib, s) }

function hr(attrib) { return make("hr", attrib) }

function p(s, attrib) { return make("p", attrib, s) }
// function slider(attrib) { let sl = make("input", attrib); sl.type = "range"; return sl }
function image(s, attrib) {
  let d = make("img", attrib);
  d.src = s, d.alt = s;
  return d;
}

function span(s, attrib) { return make("span", attrib, s) }

function link(s, link, attrib) {
  let lnk = make("a", attrib, s);
  lnk.href = link;
  return lnk;
}
// Create link
function pre(s, attrib) { return make("pre", attrib, textNode(s)); } // Unformatted text
//function txt(s, attrib) { let d = make("pre", attrib, textNode(s)); d.style.display = "inline-block"; return d; }


/*------------------------------------------------------
  Various DIV´s
  ------------------------------------------------------*/
function div(s, attrib) {
  return make("div", attrib, s)
}

function idiv(s, attrib) {
  let d = make("div", attrib, s);
  // if (d) if (d.style)
  d.style.display = "inline-block";
  return d;
}
const inlineDiv = idiv; // Alias
const inlinediv = idiv; // Alias

// Create div and select as base 
function sdiv(s, attrib) {
  return begin(div(s, attrib))
}

// create idiv and select as base
function sidiv(s, attrib) {
  return begin(idiv(s, attrib))
}

/*------------------------------------------------------
  Create an overlay with an element of 0 px as an anchor
  returns the reference to the overlaying div
  requires end(2) 
  ------------------------------------------------------*/
function overlay(s, attrib) {
  begin(div("", "position: relative; width: 0px; height: 0px;"))
  return begin(idiv(s, attrib))
}



/*------------------------------------------------------
   Create a button
  ------------------------------------------------------*/
function button(s, attrib) {
  return make("button", attrib, s)
}

/*------------------------------------------------------
   Round button
  ------------------------------------------------------*/
function rbutton(s, x, y, diameter, attr) {
  let b = button(s, attr)
  let style = b.style
  b.parentElement.style.position = "relative"
  style.position = "absolute"
  style.left = px(x)
  style.top = px(y)
  style.height = b.style.width = diameter + "px"
  style.borderRadius = trunc(diameter / 2) + "px"
  style.transform = "translate(-50%, -50%)"
  return b
};

/*------------------------------------------------------
   normal textarea, not expanding
  ------------------------------------------------------*/
function textarea(content, attrib, placeholder) {
  let ta = make("textarea", attrib);
  if (placeholder) ta.placeholder = placeholder;
  if (content) ta.value = content;
  return ta
} // multiline text input

/*------------------------------------------------------
   create textarea, that expands vertically
  ------------------------------------------------------*/
function expandableTextarea(content, attrib, placeholder) {
  let ta = textarea(content, attrib, placeholder)
  setAttributes(ta, {
    "rows": "1",
    "style": /*"border: none; background-color: rgba(0,0,0,0);"+*/ " box-sizing: border-box; overflow: hidden; min-height: 35px"
  })
  setAttributes(ta, attrib)

  ta.onchange = ta.onkeyup = ta.doResize = ta.autosize
  ta.autosize()
  // ta.autosize(); // run once on startup
  return ta
}

/*------------------------------------------------------
    rezise Textarea
  ------------------------------------------------------*/
HTMLTextAreaElement.prototype.autosize = function () { // Expand Textarea
  let el = this
  setTimeout(function () {
    el.style.height = "22px"
    el.style.height = (el.scrollHeight) + "px"
  }, 1);
}



/*------------------------------------------------------
  Add text or element count times to current base 
  count (optional)
  ------------------------------------------------------*/
function print(s, count = 1) {
  for (let i = 0; i < count; i++) {
    if (typeof (s) == 'string')
      appendBase(s)
    else
      if (i == 0)
        appendBase(s)
      else
        appendBase(s.cloneNode(true))
  }
}

/*------------------------------------------------------
   Add text or node + br() to the current base
   count (optional)
  ------------------------------------------------------*/
function println(s, count = 1) {
  for (let i = 0; i < count; i++) {
    print(s)
    br()
  }
}

// ----------------------------------------------------------------------------
// Create label with margins. Childbefore will insert element left of label
// ----------------------------------------------------------------------------
function label(s, attrib, childbefore) {
  let lbl = make("label", attrib, childbefore)
  if (typeof (s) == "string")
    lbl.appendChild(textNode(s))
  else
    lbl.appendChild(s)
  lbl.style.marginRight = "5px"
  lbl.style.marginLeft = "5px"
  return lbl
}


// ----------------------------------------------------------------------------
// Create a text of constant width
// ----------------------------------------------------------------------------
function blocktext(s, width, attrib) {
  let sp = span(s)
  inlineDiv(sp, attrib).style.width = px(width)
  return (sp)
}

/* ----------------------------------------------------------------------------
inputSelect(options, attrib, def) 
Create an input slect field 
def is the default index 

Options can be two formats:
  inputSelect(["a","b","c"])
  inputSelect([{text:"a", value: 2},{text: "b", value: 2},{text: "c", value: 3}])

 ----------------------------------------------------------------------------*/
function inputSelect(options, attrib, def) {
  let s = make("select", attrib)
  setAttributes(s, attrib)
  s.addOptions(options)
  if (def) s.selectedIndex = def
  return s
}
HTMLSelectElement.prototype.addOptions = function (options) { addProps(this, "option", options) }
HTMLSelectElement.prototype.selectOptionByValue = function (txt) { // Select Field that contains txt
  let o
  for (let i = 0; i < this.options.length; i++) {
    o = this.options[i].textContent
    if (o.includes(txt)) {
      this.options.selectedIndex = i
      return
    }
  }
}





// ----------------------------------------------------------------------------
// Create Checkbox with labgel s after CB, def is true/false
// ----------------------------------------------------------------------------
function checkbox(s, attrib, def) {
  let sel
  if (s && (s != "")) {
    sel = create("INPUT", attrib)
    sel.type = "checkbox"
    let lbl = label(s, attrib, sel)
  } else {
    sel = make("INPUT", attrib)
    sel.type = "checkbox"
  }
  sel.style.marginRight = "5px"
  sel.style.marginLeft = "5px"
  if (def)
    sel.checked = def
  return sel
}


// ----------------------------------------------------------------------------
// Text Input with label: 1st Attribute for Label text, 2.nd Attrib for 
// Input field 
// ---------------------------------------------------------------------------- 
function inputText(s, options = {}) { return new _inputText(s, options) }
class _inputText {
  constructor(s, options = {}) {
    options = joinOver({
      baseAttrib: {},
      labelAttrib: {},
      inputAttrib: {},
      fieldWidth: [],
      doBreak: true
    }, options)

    this.label = null
    this.base = sidiv("", options.baseAttrib)
    if (s != "") {
      this.label = idiv(s, options.labelAttrib)
      if (options.fieldWidth[0])
        this.label.style.width = px(options.fieldWidth[0])
    }
    this.input = create("input", options.inputAttrib)
    if (options.fieldWidth[1])
      this.input.style.width = px(options.fieldWidth[1])
    this.base.appendChild(this.input)
    end()
    if (options.doBreak)
      br();


    // define for backward compatibility
    this.input.input = this.input
    this.input.label = this.label
    this.input.base = this.base
    this.parentObject = this
    return this.input
  }
  get value() { return this.input.value }
  set value(w) { this.input.value = w }
}
// ----------------------------------------------------------------------------
// Number Input with label: 1st Attribute for Label text, 2.nd Attrib for 
// Input field 
// ----------------------------------------------------------------------------
function inputNumber(s, attrib, inpAttrib) {
  let result
  let d = inlineDiv()
  if (s != "") {
    let lbl = inlineDiv(s, attrib)
    d.appendChild(lbl)
  }
  result = make("input", inpAttrib)
  result.type = "number"
  d.appendChild(result)
  return result
}

/*------------------------------------------------------
Create a message box
------------------------------------------------------*/
function msgBox(s, attrib, callback) {
  let sp = DMLgetSP()

  let d = sidiv("", "text-align: center;" +
    "position: fixed;" +
    "padding: 6px;" +
    "box-shadow: 5px 5px 6px silver;" +
    "border-radius: 8px;" +
    "background-color: #ffffff;" +
    "border: thin solid gray;" +
    "left: 50%;" +
    "top: 50%;" +
    "transform: translate(-50%, -50%);" +
    "width: 250px")

  setAttributes(d, attrib)
  let workarea = sdiv(s)

  begin(d)
  button("ok", _btnstyle).onclick = () => {
    d.remove()
    if (callback)
      callback()
  }
  end(3)
  dragElement(d)
  DMLchkSP(sp, "msgBox")

  return workarea
}

/*------------------------------------------------------
Create a message box
------------------------------------------------------*/
function askBox(s, attrib, doYes, doNo) {
  let sp = DMLgetSP()

  let d = sidiv("", "text-align: center;" + _flybox + "width: 250px")

  setAttributes(d, attrib)
  let workarea = sdiv(s)

  begin(d)
  button("Yes", _btnstyle).onclick = () => {
    d.remove()
    if (doYes instanceof Function) doYes()
  }
  button("No", _btnstyle).onclick = () => {
    d.remove()
    if (doNo instanceof Function) doNo()
  }
  end(3)
  dragElement(d)
  DMLchkSP(sp, "msgBox")

  return workarea
}



/****************************************************************************************
  html5-canvas: canvas2D 
    this.canvas the canvas element. 
    if attrib.visible = false, the canvas is not visible. Can be used for offscree-rendering

    this.ctx: 2D-context to draw
    this.points: internal array
    this.width/height: read/set canvas size
    stroke(): draw
    clear(): clear canvas
    clrPoints()
    addPoint(x,y)

    for painting without stroke use _line, _circle, _rect...

    line(x1,y1,x2,y2); draw line
    circle(x, y, d, options = {fill: false})
    rect(x, y, w, h, options = {fill: false, center: false, angle: 0})
    
    ployline(newPoints): draw polyline with internal or external array
    softline(newPoints): draw smooth polyline with internal or external array
    text(s, x, y, options = {angle: 0,hor: "center",vert: "middle"})
    font(size, decoration = "", color = "black", family = "Arial")
    marker(x, y, d, type = 0, options = {})
    
    type:
        0: circle
        1: rect
        2: rhombus
  
****************************************************************************************/
function canvas2D(attrib) { return new _canvas2D(attrib) }
class _canvas2D {
  constructor(attrib) {
    if (!attrib)
      attrib = { visible: true }
    else
      if (!attrib.hasOwnProperty("visible"))
        attrib.visible = true;
    if (attrib.visible)
      this.canvas = make("canvas", attrib)  // create and append
    else
      this.canvas = create("canvas", attrib) // only create
    this.ctx = this.canvas.getContext("2d")
    this.points = [] // polyline buffer
    this.shadow = 0;
  }

  get width() { return this.canvas.width }
  set width(w) { this.canvas.width = w }
  get height() { return this.canvas.height }
  set height(h) { this.canvas.height = h }

  // start new path
  beginPath() {
    this.ctx.beginPath();
  }

  // draw path
  stroke() {
    this.ctx.stroke();
  }

  // Clear canvas
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  setLineType(width = 1, color = "black", dash = []) {
    if (typeof (dash) == 'number')
      dash = [dash]
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.setLineDash(dash);
  }

  setFillStyle(color = "white") {
    this.ctx.fillStyle = color;
  }

  // simplified standard shadow, dist=0 -> no shadow
  set shadow(dist = 0) {
    this._shadow = dist;
    if (dist) {
      this.ctx.shadowBlur = dist * 1.3;
      this.ctx.shadowColor = "rgba(0,0,0,0.5)";
      this.ctx.shadowOffsetX = dist
      this.ctx.shadowOffsetY = dist
    } else
      this.ctx.shadowColor = "transparent";
  }
  get shadow() { return this._shadow }

  // Draw single line
  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
  _line(x1, y1, x2, y2) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
  }

  // draw rectangle
  rect(x, y, w, h, options = {}) {
    setOptions(this, options, {
      fill: false,
      center: false,
      angle: 0
    })
    this.ctx.beginPath();
    if (this.angle != 0) {
      this.ctx.save()
      this.ctx.translate(x, y)
      this.ctx.rotate(this.angle * Math.PI / 180);
      if (this.center)
        this.ctx.rect(-w / 2, -h / 2, w, h)
      else
        this.ctx.rect(0, 0, w, h)
      this.ctx.restore();
    } else {
      if (this.center)
        this.ctx.rect(x - w / 2, y - h / 2, w, h)
      else
        this.ctx.rect(x, y, w, h)
    }
    if (this.fill) this.ctx.fill()
    this.ctx.stroke()
  }

  // rect without stroke
  _rect(x, y, w, h, options = {}) {
    setOptions(this, options, {
      fill: false,
      center: false,
      angle: 0
    })
    if (this.angle != 0) {
      this.ctx.save()
      this.ctx.translate(x, y)
      this.ctx.rotate(this.angle * Math.PI / 180);
      if (this.center)
        this.ctx.rect(-w / 2, -h / 2, w, h)
      else
        this.ctx.rect(0, 0, w, h)
      this.ctx.restore();
    } else {
      if (this.center)
        this.ctx.rect(x - w / 2, y - h / 2, w, h)
      else
        this.ctx.rect(x, y, w, h)
    }
    if (this.fill) this.ctx.fill()
  }


  // draw a circle diameter d
  circle(x, y, d, options = {}) {
    setOptions(this, options, {
      fill: false
    })
    this.ctx.beginPath();
    this.ctx.arc(x, y, d / 2, 0, PI2)
    if (this.fill)
      this.ctx.fill()
    this.ctx.stroke()
  }

  // draw circle without stroke
  _circle(x, y, d, options = {}) {
    this.fill = options.fill || false
    this.ctx.moveTo(x, y)
    this.ctx.arc(x, y, d / 2, 0, PI2)
    if (this.fill) this.ctx.fill()
  }

  /*------------------------------------------------------
   draw polyline, uses this.points or external array[{x,y}] if set
  ------------------------------------------------------*/
  // clr internal polyline buffer
  clrPoints() {
    this.points = [];
  }

  // Polyline, uses this.points 
  addPoint(x, y) {
    this.points.push({ x: x, y: y })
  }

  // draw polyline
  polyline(newPoints, options = {}) {
    this.fill = options.fill || false

    this.ctx.beginPath();
    //------------------------------
    this._polyline(newPoints)
    //------------------------------
    if (this.fill) this.ctx.fill()
    this.ctx.stroke();
  }

  // only polyline, without stroke
  _polyline(newPoints) {

    let _points;
    if (newPoints) _points = newPoints
    else _points = this.points

    if (_points.length > 0) {
      this.ctx.moveTo(_points[0].x, _points[0].y)
      for (let i = 1; i < _points.length; i++) {
        this.ctx.lineTo(_points[i].x, _points[i].y);
      }
    }
  }

  // Soft polyline
  softline(newPoints, options = {}) {
    this.fill = options.fill || false

    let _points;
    if (newPoints) _points = newPoints
    else _points = this.points

    this.ctx.beginPath();
    //------------------------------
    this._softline(_points)
    //------------------------------
    if (this.fill) this.ctx.fill();
    this.ctx.stroke();
  }

  // softline painting only
  _softline(_points) {
    this.ctx.moveTo(_points[0].x, _points[0].y);
    for (var i = 1; i < _points.length - 2; i++) {
      var xc = (_points[i].x + _points[i + 1].x) / 2;
      var yc = (_points[i].y + _points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(_points[i].x, _points[i].y, xc, yc);
    }
    this.ctx.quadraticCurveTo(_points[i].x, _points[i].y, _points[i + 1].x, _points[i + 1].y);
  }


  /*------------------------------------------------------
    print rotated text:
    angle 0..360
    hor: left, center, right
    vert: top, middle, alphabetic, bottom
    
    use 
     - ctx.font
     - ctx.fillStyle
   
    ------------------------------------------------------*/
  text(s, x, y, options = {}) {
    setOptions(this, options, {
      angle: 0,
      hor: "center",
      vert: "middle",
    })

    this.ctx.save()
    this.ctx.textAlign = this.hor
    this.ctx.textBaseline = this.vert
    this.ctx.translate(x, y)
    this.ctx.rotate(this.angle * Math.PI / 180);
 /*   if (this.bgcolor) {
      let w = this.ctx.measureText(s).width
      this.ctx.fillStyle = this.bgcolor
      this.ctx.fillRect(0, 0,w,-20)
    }
    this.ctx.fillStyle = this.txtcolor
 */   this.ctx.fillText(s, 0, 0)
    this.ctx.restore();
  }

  font(size, decoration = "", color = "black", family = "Arial") {
    this.ctx.fillStyle = color
    this.ctx.font = decoration + " " + size + "px " + family
  }

  /*------------------------------------------------------
   marker
      type
        0: circle
        1: rect
        2: rhombus
    ------------------------------------------------------*/
  marker(x, y, d, type = 0, options = {}) {
    let d2
    switch (type) {
      case 0:
        this.circle(x, y, d, options);
        break;
      case 1:
        options[center] = true;
        this.rect(x, y, d, d, options)
        break;
      case 2:
        options[center] = true
        options[angle] = 45
        this.rect(x, y, d, d, options)
        break;
    }
  }
  _marker(x, y, d, type = 0, options = {}) {
    let d2
    switch (type) {
      case 0:
        this._circle(x, y, d, options);
        break;
      case 1:
        options[center] = true;
        this._rect(x, y, d, d, options)
        break;
      case 2:
        options[center] = true
        options[angle] = 45
        this._rect(x, y, d, d, options)
        break;
    }
  }

}


/****************************************************************************************
  SVG-Function
****************************************************************************************/

function svg(attrib) {
  let ret = document.createElementNS(svgref, "svg");
  Object.keys(attrib).forEach(key => {
    ret.setAttributeNS(null, key, attrib[key]);
  })
  appendBase(ret);
  return ret
}

function svg_line(attrib) {
  let ret = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  Object.keys(attrib).forEach(key => {
    ret.setAttributeNS(null, key, attrib[key]);
  })
  appendBase(ret);
  return ret
}



/****************************************************************************************
                            Lists   
****************************************************************************************/
/*------------------------------------------------------
  ul()
  Gets array of string or array of object[key] ul([opts])
    ul.items: get or set content
    ul.clear(): Clear list
    ul.add(): Add new elements to the list 
    ul.put(): Clear list befor add
  ------------------------------------------------------*/
function ul(opts, attrib) {
  let lst = make("ul", attrib)
  lst.items = opts
  return lst
}
HTMLUListElement.prototype.add = function (opts) { if (opts) appendChilds(this, "li", opts) }
HTMLUListElement.prototype.put = function (opts) { this.clear(); if (opts) appendChilds(this, "li", opts) }
HTMLUListElement.prototype.clear = function () {
  let x = this.items
  this.innerHTML = ""
}

Object.defineProperty(
  HTMLUListElement.prototype, "items", {
  get: function () {
    let elem, ret = []
    for (let i = 0; i < this.childNodes.length; i++) {
      let n = this.childNodes[i]
      elem = n.innerHTML
      ret.push(elem)
    }
    return ret
  },
  set: function (opts) {
    this.clear()
    this.add(opts)
  }
}
)
// --------------- Ende ul -------------

/*------------------------------------------------------
  ol()
  Getst array of string or array of object[key] ul([opts])
    ol.items: get or set content
    ol.clear(): Clear list
    ol.add(): Add new elements to the list 
    ol.put(): Clear list befor add
  ------------------------------------------------------*/
function ol(opts, attrib) {
  let lst = make("ol", attrib)
  lst.items = opts
  return lst
}
HTMLOListElement.prototype.add = function (opts) { if (opts) appendChilds(this, "li", opts) }
HTMLOListElement.prototype.put = function (opts) { this.clear(); if (opts) appendChilds(this, "li", opts) }
HTMLOListElement.prototype.clear = function () { this.innerHTML = "" }

Object.defineProperty(
  HTMLOListElement.prototype, "items", {
  get: function () {
    let elem, ret = []
    for (let i in this.childNodes) {
      let n = this.childNodes[i]
      elem = n.innerHTML
      ret.push(elem)
    }
    return ret
  },
  set: function (opts) {
    this.clear()
    this.add(opts)
  }
}
)

// --------------- Ende oL -------------


//===========================================================================
//                   Fieldsets and radio groups
//===========================================================================

// Create Fieldset
function fieldset(s, options = {}) {
  setOptions(this, options, {
    legendAttrib: "",
    fieldsetAttrib: ""
  })

  let fs = make("fieldset", fieldsetAttrib)
  fs.textAlign = "left"
  s = s.replace(/ /g, "\xa0"); // Add whitespaces
  fs.appendChild(create("legend", legendAttrib, s))
  return fs
}

// Create a List of Radio buttons with text and value
// Text and Value as array
// Returns array of Radio-Buttons
function radio(txt, value, groupname, onchange, def) {
  let i, rb, group = []
  for (i = 0; i < txt.length; i++) {
    rb = create("input", { "type": "radio" }); // Create button

    group.push(rb)
    if (value[i]) rb.value = value[i] // Set Value or
    else rb.value = txt[i] // Text as value
    if (i === def)
      rb.checked = true

    // Set groupname, if not given, use global
    if (groupname) rb.name = groupname

    // Set onchange-Handler, if not given, use global
    if (onchange) rb.onchange = onchange

    // Embed RB in label
    //    let lb = make("label", {}, rb)
    let lbl = label(rb)
    let tlb = label(txt[i])
    // tlb.style.marginLeft = "5px"
    lbl.appendChild(tlb)
    br()
  }
  return group
}

// Radio group Value
function RadioValue(groupName) {
  let group = document.getElementsByName(groupName)
  if (group) {
    for (let i in group) {
      let item = group[i]
      if (item.checked) {
        return item.value
      }
    }
  }
}
// Get selectedItem
function selectedRadioItem(groupName) {
  let group = document.getElementsByName(groupName)
  if (group) {
    for (let i in group) {
      let item = group[i]
      if (item.checked) {
        return item
      }
    }
  }
}

// Set Value of a radio group
function setRadioValue(groupName, value) {
  let group = document.getElementsByName(groupName)
  if (group) {
    for (let i in group) {
      let item = group[i]
      if (item.value === value) {
        item.checked = true
        return item
      }
    }
  }
}

// Set Radio-Button by Index, starting with 0
function setRadioIndex(groupName, idx) {
  let group = document.getElementsByName(groupName)
  if (group)
    group[idx].checked = true
}


// ********************************** Ajax Functions **********************************
/* Ajax Fetch asynchronous: url is the requested Adress with parameters  
   par1-3 are call parameters forwarded to the response function
   returns a promise, that can be resolved by exec_async
   Multiple calls of dml_fetch can be combined in an array of promises
   exec_all is executed, if all promises are resolved
 
   for single call, use
   exec_async(dml_fetch(url, par1...)),(r) => {
      r.result...
      r.par1...
   })
 
   for multiple calls
   pr[i] = dml_fetch(url, par1...)
   exec_async(pr, (r) => {
      for (let i in r) {
           r[i].result...
         r[i].par1...
      })
   }
*/
async function dml_fetch(url, par1, par2, par3) {
  let response = await fetch(url, {
    method: "GET",
    //mode: 'no-cors',
    headers: { "Content-type": "application/json;charset=UTF-8" }
  })

  if (response.ok) {
    let ret = await response.json()
    return { result: ret, par1: par1, par2: par2, par3: par3 }
  }
  throw new Error(`HTTP error! status: ${response.status}`);
}

/* Execute functions asycronous after all promises have been resolved
   exec_async([pr],f): wait for array of promises, execute function with array of results
   if only one promise is suplied, a single result is returned as f(result,par1,par2,par3)
   for multiple promises, multiple results are replied. f can be a function or an array of functions
   for single function f(r), r is an array of objects
   f(r)  {
      for (let i in r) {
        r[i].result is the ajax answer of the first call
        r[i].par1-par3 are the call parameters
      }
   }
   if f is an array of functions [f1,f2,f3,f4], each function is called as
      f(result,par1,par2,par3)
 
   */
function exec_async(pr, f) {
  call(async () => {
    if (!Array.isArray(pr)) pr = [pr] // Make array from single promise
    const res = await Promise.all(pr)
    if (res.length == 1) {
      let r = res[0]
      f(r.result, r.par1, r.par2, r.par3)
    } else {
      if (!Array.isArray(f))
        f(res)
      else {
        for (let i in res) {
          let r = res[i]
          f(r.result, r.par1, r.par2, r.par3)
        }
      }
    }
  })
}

/****************************************************************************************
  older Ajax functions
****************************************************************************************/


// Ajax HTTP-Get request, result is supplied by httpGet(url,par).response = function(s,par){}
// url is the requested Adress, s is the response JSON object. 
// par1-3 are call parameters forwarded to the response function
// httpGet(url, a,b,c).response = function (s,a,b,c) { ... do something  }
// Error-function not jet defined. May be defined as
// with (httpGet...)
// {   resonse = function ....
//     error = function 
// }
// This function is based on the fetch API 
function httpGet(url, par1, par2, par3) {
  let ret = { // define return functions
    error: function () { },
    response: function () { }
  }

  fetch(url, {
    method: "GET",
    headers: { "Content-type": "application/json;charset=UTF-8" }
  })
    .then(res => { // evaluate return object
      if (!res.ok) {
        console.log("Status: " + res.status + ", " + res.statusText)
        if (typeof (ret.error) == "function") {
          ret.error("File not found", res)
        }
        throw new Error(res.statusText);
      }
      return res.json()
    })

    .then(data => {
      if (typeof (ret.response) == "function")
        ret.response(data, par1, par2, par3)
    })

  return ret
}

// Ajax HTTP-Get request, result is supplied by httpGet(url,par).response = function(s,par){}
// url is the requested Adress, s is the response JSON object. 
// par1-3 are call parameters forwarded to the response function
// httpGet(url, a,b,c).response = function (s,a,b,c) { ... do something  }
// Error-function not jet defined. May be defined as
// with (httpGet...)
// {   resonse = function ....
//     error = function 
// }
function httpGet2(url, par1, par2, par3) {
  let ret = {
    error: function () { },
    response: function () { }
  }
  let xhttp = new XMLHttpRequest()

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (typeof (ret.response) == "function") {
        try {
          let t = JSON.parse(xhttp.responseText)
          ret.response(t, par1, par2, par3)
        } catch (e) {
          ret.response(xhttp.responseText, par1, par2, par3)
        }
      }
    } else
      ret.error("ReadyState == " + this.readyState)
  }
  xhttp.open("GET", url, true)
  //  xhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded')
  //  xhttp.setRequestHeader('Accept', 'text/csv')
  //  xhttp.setRequestHeader('Content-Type', 'application/json')
  xhttp.setRequestHeader('Accept', 'application/json')
  xhttp.send()
  return ret
}

// Request SQlite table names 
function sqliteGetTableNames(url, par1, par2, par3) {
  let ret = { response: function () { } }
  let s
  httpGet(url + '?q=SELECT name FROM sqlite_master WHERE type = "table"').response =
    function (s) {
      let t = extract(s, {}, "name")
      if (typeof (ret.response) == "function")
        ret.response(t, par1, par2, par3); // --> callback aufrufen
    }
  return ret
}

// Request SQlite table head keys
function sqliteGetKeys(url, table, par1, par2, par3) {
  let ret = { response: function () { } }
  let s
  httpGet(url + "?q=select * from " + table + " LIMIT 1").response =
    function (s) {
      let t = Object.keys(s[0])
      if (typeof (ret.response) == "function") ret.response(t, par1, par2, par3); // --> callback aufrufen
    }
  return ret
}

// Request SQlite table, filter: {"typId": "RA-N"}
// Returns JSON result from + TableName request
function sqliteGetTable(url, tableName, filter, par1, par2, par3) {
  let f = "",
    ret = { response: function () { } }

  // build Filterstring for SQL from object Key/Value pairs
  if (filter)
    if (Object.keys(filter).length > 0) {
      let k = Object.keys(filter)
      f = " where "
      for (let i = 0; i < k.length; i++) {
        if (i > 0) f += " and "
        f += k[i] + '="' + filter[k[i]] + '"'
      }
    }

  // Load Data
  httpGet(url + "?q=select * from " + tableName + f).response = function (s) {
    if (typeof (ret.response) == "function")
      ret.response(s, tableName, par1, par2, par3); // --> Request-Ergebnis zurück
  }
  return ret
}

/*------------------------------------------------------
  slider with range marker. 
  
  function slider({options...})
 
  example: slider("width: 30px, height: 150px",{{vertical: true, showrange: true}})
 
  Options:{
    baseattrib || {}
    vertical || false    // vertical slider
    showRange || false   // show range marker
    min || 100           // slider range
    max || 0
    value || 50          // current value
    sliderattrib         // attributes for slider
    rangeattrib          // attributes for range marler
  }
  
  Properties: 
  slider.low (get)
  slider.high
  slider.setRange(low, high)
  slider.updateRange()
  ------------------------------------------------------*/
function slider(options = {}) {

  // Set a base object to determine size
  let base = begin(idiv("", options.baseattrib)) // Set div as a base, define width and height#
  let height = getpx(base.style.height)
  let width = getpx(base.style.width)


  // Create ancor
  let zero = div("",
    "width: 0px; height: 0px;") // 0px Range container

  // Create slider object
  let sl = make("input", options.sliderattrib)
  sl.type = "range"
  sl.style.position = "relative"
  sl.base = base;

  // Store values ins slider object, special late definition
  setOptions(sl, options, {
    vertical: false,
    showRange: false,
    rangeattrib: "",
    min: 0,
    max: 100,
    low: sl.min,
    high: sl.max,
    value: 50
  })

  sl.offx = 0;
  sl.offy = 0;


  // Set vertical slider
  if (sl.vertical) {
    sl.offy = 6;
    setAttributes(sl, { "orient": "vertical", "style": "-webkit-appearance: slider-vertical;left: 0px; top: 0px;" })
    if ((width == 0) || (height == 0)) {
      width = 30;
      base.style.width = px(width)
      height = 150;
      base.style.height = px(height)
    }
  } else
  // set horizontal slider
  {
    sl.offx = 6;
    if ((base.style.width == "") || (base.style.height == "")) {
      width = 150;
      base.style.width = px(width)
      height = 30;
      base.style.height = px(height)
    }
    sl.style.top = "-1px";

  }

  // Expand slider to client rect
  sl.style.width = "100%";
  sl.style.height = "100%";

  // Get measure for range   
  let BC = sl.getBoundingClientRect();
  sl.rangewidth = BC.width - 2 * sl.offx;
  sl.rangeheight = BC.height - 2 * sl.offy;
  // Create range marker
  sl.range = create("div", "position: relative;" + _bggreen)
  setAttributes(sl.range, sl.rangeattrib);


  end()

  // ************  Now, lets extend the new object:  *******************************


  sl.setRange = function (low, high) {
    sl.low = low;
    sl.high = high;
    sl.updateRange()
  }

  sl.updateRange = function () { // Show range object
    sl.low = constrain(Number(sl.low), Number(sl.min), Number(sl.max))
    sl.high = constrain(Number(sl.high), Number(sl.min), Number(sl.max))
    if (sl.vertical) {
      let ltot = sl.rangeheight;
      let f = ltot / (sl.max - sl.min)
      sl.range.style.height = px(f * (sl.high - sl.low))
      sl.range.style.top = px(f * (sl.max - sl.high) + sl.offy)
      sl.range.style.left = px(sl.offx)
      sl.range.style.width = px(sl.rangewidth)
    } else {
      let ltot = sl.rangewidth
      let f = ltot / (sl.max - sl.min)
      sl.range.style.width = px(f * (sl.high - sl.low))
      sl.range.style.left = px(f * (sl.low) + sl.offx)
      sl.range.style.top = px(sl.offy)
      sl.range.style.height = px(sl.rangeheight)
    }
  }
  // **********************************************************************************************
  sl.updateRange()
  if (sl.showRange) { // only show range maker, if showRange == true
    zero.appendChild(sl.range)
  }

  return sl;
}


/****************************************************************************************
  Unit specific code
****************************************************************************************/
/*------------------------------------------------------
 Register onresize for some elements
------------------------------------------------------*/
function registerOnresize(el) {
  _onresizeElements.push(el)
}

let _oldOnResize = window.onresize
window.onresize = () => {
  for (let i in _onresizeElements) {
    let el = _onresizeElements[i]
    if (el.onresize)
      el.onresize(el)
  }
  if (_oldOnResize)
    _oldOnResize()
}


const selectBase = begin
const unselectBase = end