/****************************************************************************************
    Online-Editor (c) Eckehard Fiedler
    Show online code Editor plus Full page result including HTML
    ICE.oninput = debounce(function () {
      pw.update(ICE.textContent)
    })
****************************************************************************************/
const codefraction = 70;
function inputCodeEditor(srctxt, attrib) { return new _inputCodeEditor(srctxt, attrib) }
class _inputCodeEditor {
    constructor(srctxt, attrib) {
        this.editor = pre(srctxt, {
            "rows": "10",
            "class": "prettyprint ",
            "contenteditable": "true",
            "style": "overflow: auto; margin: 0px; padding: 5px 8px; width: " + (codefraction) + "%; text-align: left;"
        })
        setAttributes(this.editor, attrib)
        //this.editor.textContent = srctxt;
        return (this.editor)
    }
    refresh() {
        this.editor.textContent = this.editor.value
    }
}

/****************************************************************************************
    PageWindow: iframe to show a full page body content
    ta.oninput = debounce(function () {
      pw.update(ta.textContent)
    }, 250)
****************************************************************************************/
function pageWindow(txt, attrib) { return new _pageWindow(txt, attrib); }
class _pageWindow {
    constructor(txt, attrib) {
        this.base = begin(div("", "width: " + (100 - codefraction) + "%; "))
        this.error = div("", _bgsilver + "padding-left: 5px;")
        this.myFrame = make("iframe",
            {
                "frameBorder": "0",
                "seamless": "true",
                //  "class": "pageFrame",
                "style": "width: 100%; height: 100%; text-align: center;" + _bgwhite
            })
        this.doc = this.myFrame.contentDocument ? this.myFrame.contentDocument : this.myFrame.contentWindow.document;
        setAttributes(this.myFrame, attrib)
        let script = create("script", { "src": "..\\lib\\DML.js" });
        this.doc.head.appendChild(script)
        script.onload = () => { this.update(txt) }
        window.onerror = (e) => { this.error.textContent = e; }
        this.doc.onerror = (e) => { this.error.textContent = e; }

        this.doc.onchange = () => {
            alert("doc")
        }
        this.myFrame.onchange = () => {
            alert("frame")
        }

        end()
    }
    update(txt) {
        let sp = DMLgetSP(); // get stack pointer

        this.txt = txt
        this.error.textContent = ""
        this.doc.open()
        this.doc.write("<style>@import url(https://fonts.googleapis.com/css?family=Lora);"
            + " * { font-family: Lora; } "
            + "body {font-size: 16px;} "
            + "h1{font-size: 24px; font-weight: bold;}"
            + "h2{font-size: 22px; font-weight: bold;}"
            + "h3{font-size: 20px; font-weight: bold;}"
            + "</style>")
        this.doc.write(txt)
        this.doc.close()

        if (sp != DMLgetSP()) {
            alert("Stack mismacth in function pageWindow: " + DMLgetSP() + " <> " + sp)
            while (DMLgetSP() > sp) end();
        }

    }
}

/****************************************************************************************
    codeWindow: Show result of code (DML only)
****************************************************************************************/
function codeWindow(txt, attrib) { return new _codeWindow(txt, attrib); }
class _codeWindow {
    constructor(txt, attrib) {
        this.base = begin(div("", "width: " + (100 - codefraction) + "%;" + _bgwhite))  // outer div
        this.error = div("", _bgsilver + "padding-left: 5px;")
        this.innerdiv = div("", "overflow: auto; margin: 0px; padding: 8px 8px; text-align: center;")//white-space: nowrap;")
        setAttributes(this.base, attrib)
        if (this.base.style.textAlign)
            this.innerdiv.style.textAlign = this.base.style.textAlign  // Copy text alignment from outer box
        window.onerror = (e) => {
            //    this.error.textContent = e; 
        }
        this.update(txt)
        end()
        return this
    }
    update(txt) {
        this.error.textContent = ""
        this.innerdiv.innerHTML = ""
        begin(this.innerdiv)  // Open current base
        try {
            let sp = DMLgetSP(); // get stack pointer

            eval(txt)

            if (sp != DMLgetSP()) {
                alert("Stack mismacth in function codeWindow: " + DMLgetSP() + " <> " + sp)
                while (DMLgetSP() > sp) end();
            }

        } catch (e) {
            var err = e.constructor('Error in Evaled Script: ' + e.message);
            // +3 because `err` has the line number of the `eval` line plus two.
            //     err.lineNumber = e.lineNumber - err.lineNumber + 3;
            this.error.textContent = e.message;
            throw err;
        }
        end()
    }
}

/*========================================================
                Combined Editor/View
                60% Code, 40& Result
  ========================================================*/
function pageEditor(srctxt, baseattr, cwattrib) { new _pageEditor(srctxt, baseattr, cwattrib) }
class _pageEditor {
    constructor(srctxt, baseattr, cwattrib) {
        this.base = begin(div("", "display: flex"))
        setAttributes(this.base, baseattr)
        this.ice = inputCodeEditor(srctxt)
        this.cw = pageWindow(srctxt, cwattrib)
        this.ice.oninput = debounce(() => {
            let SP = DMLgetSP()
            this.cw.update(this.ice.textContent)
            if (SP != DMLgetSP())
                alert("Stack misalignment in PageEditor: " + srctxt)
        }, 250)
        end()
        this.ice.onfocus = () => {
            window.onerror = (e) => {
                this.cw.error.textContent = e.message;
            }
        }
        this.ice.onblur = () => {
            window.removeEventListener("error", window);

        }
    }
}


function codeEditor(srctxt, baseattr, cwattrib) { new _codeEditor(srctxt, baseattr, cwattrib) }
class _codeEditor {
    constructor(srctxt, baseattr, cwattrib) {
        this.base = begin(div("", "display: flex;"))
        
        setAttributes(this.base, baseattr)
        this.ice = inputCodeEditor(srctxt)
        this.cw = codeWindow(srctxt, cwattrib)
        this.ice.oninput = debounce(() => {
            let SP = DMLgetSP()
            this.cw.update(this.ice.textContent)
            if (SP != DMLgetSP())
                alert("Stack misalignment in CodeEditor: " + srctxt)

        }, 250)
        this.ice.onfocus = () => {
            window.onerror = (e) => {
                this.cw.error.textContent = e.message;
            }
        }
        this.ice.onblur = () => {
            window.removeEventListener("error", window);

        }
        end()
    }
}



