/****************************************************************************************
Markdwon by Dr. Ecki
Spezialversion für meine Bedürfnisse

# h1
## h2 
### h3
%%% Programmtext %%%
&col &col &end Spaltenabschnitt 50% 
&center &end Zentrierter Abschnitt
!IMG:name,(left|center|right),height px,offset x px, offset y px
Erzeugt einen Index aus h1 und h2 mit 
[
    {"level": level, "text":hp, "link":ref}
]
****************************************************************************************/

/*------------------------------------------------------
   check if tag at start, than call function for the contents,
   return true or false
  ------------------------------------------------------*/
function mkHeadline(s, tag, f, index) {
    if (s.startsWith(tag)) {
        if (f) {
            let hp, level = tag.length;  // headline-part oft content
            let content = s.slice(tag.length).trim()  // trim tag and whitespaces
            if (content.includes("|")) {
                let tmp = content.split("|")          // if line contains |, second is for index
                content = tmp[0]
                hp = tmp[1]
            } else
                hp = content;

            let ref = f("")
            ref.innerHTML = toHTML(content)
            if ((level < 4) && (hp))
                if (Array.isArray(index))
                    index.push({ "level": level, "text": hp, "link": ref })
        }
        return true
    }
    return false
}

/*------------------------------------------------------
  Substitute DMLmarkdown b[]b, i[]i und u[]u
  ------------------------------------------------------*/
function toHTML(s) {
    let ar = ["b", "u", "i"]
    let tag1, tag2, flag
    for (i in ar) {
        c = ar[i]
        tag1 = c + "\\["
        tag2 = "\\]" + c
        let r1 = new RegExp(tag1, 'g')
        let r2 = new RegExp(tag2, 'g')
        s = s.replace(r1, "<" + c + ">").replace(r2, "</" + c + ">")
    }
    
    if (s.includes("%%%")) {
        let out = s.split("%%%")
        for (let i = 1; i < out.length; i += 2)
            out[i] = "<pre class='prettyprint' style='display: inline; padding: 1px 4px'>" + out[i] + "</pre>"
        s = out.join("")
    }
    return s
}

/*------------------------------------------------------
  Simple DMLmarkdown-style function call
  inp is a string, 
  out is div
  headline is an array of menue entries 
   ------------------------------------------------------*/
function DML_markdown(inp, out, index) {
    let output, iscol = false, attr, attr2;


    // *********** Funktonen ****************

    // subfunction Read Block til End
    /* function getblock(s) {
         let ret = s;
         while (true) {
             if (++n >= output.length) break  // ------>
             s = getline()
             it (!t) break  // ------>
             if (t.startsWith('&')) break  // ------>
             ret += "\n" + s
         }
         n--;    // jump back to allow evaluation of last line
         return ret
     }
 */
    // get line n -> s: line, global t = s.trim()
    function getline() {
        if (n >= output.lenght)
            return ""
        return output[n++]
    }

    // Get first line and read until end or delimiter without trim()
    function getuntil(line, delimiter) {
        let ret = ""
        // Remove first line if empty
        if (line.trim() == "")
            line = getline().replace(/\t/g, "  ") 

        while (true) {
            if (line.includes(delimiter)) {
                while (line.includes(delimiter))
                    line = line.replace(delimiter, '')
                ret += line;
                return ret  // ------>
            } else
                ret += line + "\n"
            if (n >= output.length)
                return ret  // ------>;
            line = getline().replace(/\t/g, "  ")
        }
    }

    // unselectBase if iscol was set
    function setcol() {
        if (iscol)
            unselectBase()
        iscol = true;
    }

    // *********** Programm ****************

    while (out.firstChild) out.removeChild(out.firstChild);
    //out.innerHTML = ""; // Clear output
    selectBase(out)

    // remove double linefeed, split source lines
    output = inp.replace(/(\r\n|\n|\r)/gm, "\n").split("\n")
    let n = 0, s, t;
    let buffer = ""
    const _br = "border-radius: 0px 10px 10px 0px;"
    while (n < output.length) {
        s = getline().replace(/\t/g, "  ") // Line in s
        t = s.trim()

        if (mkHeadline(s, '######', h6, index)) continue
        if (mkHeadline(s, '#####', h5, index)) continue
        if (mkHeadline(s, '####', h4, index)) continue
        if (mkHeadline(s, '###', h3, index)) continue
        if (mkHeadline(s, '##', h2, index)) continue
        if (mkHeadline(s, '#', h1, index)) continue
        if (t == "---") { hr(); continue }
        if (t == "<") { br(); continue }  // additional line break  // ------>

        // Gray box heading
        if (s.startsWith('!!!')) {
            idiv(toHTML(s.slice(3).trim()), "padding: 2px 5px; margin-top: 25px;  background-color: #ddd;"+_border+_bold); continue }
        

        // List ul
        if (s.startsWith('- ')) {
            let ar = [toHTML(s.slice(2).trim())]  // Remember first line 
            while (n < output.lenght - 1) {
                if (output[n].startsWith('- ')) {
                    s = getline();
                    ar.push(toHTML(s.splice(2).trim()))
                } else break
            }
            ul(ar); continue
        }

        // 2-Colum side by side
        if (t.startsWith('&col')) {
            setcol()
            selectBase(div("", "display : inline-flex; width: 50%; padding: 0px 4px;")); continue
        }
        if (t.startsWith('&center')) {
            setcol()
            selectBase(div("", "text-align: center")); continue
        }
        if (t.startsWith('&end')) {
            unselectBase();
            iscol = false; continue
        }

        // Place images, Parameter left/center/right, Scale, Positon dx,dy
        if (t.startsWith('!IMG:')) {
            let params = s.slice(5).split(",");  // remove tag and get arguments
            attr2 = attr = ""
            if (params.length > 1) {
                if (params[1] == "center") attr2 = "text-align: center;"
                if (params[1] == "right") attr2 = "text-align: right;"
            }
            if (params.length > 2)              // Scale
                if (params[2])
                    attr += "height:" + params[2] + ";"
            if (params.length > 4) {
                attr += "position: relative; left: " + params[3] + "; top: " + params[4] + ";"
                div(image(params[0], attr), attr2 + ' height: 0px; ')
            }
            else
                div(image(params[0], attr), attr2)
            continue
        }

        // Call js function
        if (t.startsWith('!CALL:')) {
            let params = s.slice(6).split(",");  // remove tag and get arguments
            attr = ""
            if (params.length > 1) {
                if (params[1] == "center") attr = "text-align: center;"
                if (params[1] == "right") attr = "text-align: right;"
            }
            selectBase(div("", attr))
            window[params[0]]();
            unselectBase(); continue
        }

        if (t == '!BEGIN:') {  // Gather lines in buffer
            buffer = ""
            while (n < output.length) {
                s = getline().replace(/\t/g, "  ") // Line in s
                t = s.trim()
                if (t.startsWith("!")) break
                if (buffer == "")
                    buffer = s
                else
                    buffer += "\n" + s
            }
        }

        // Format block with css
        if (t.startsWith('!FORMAT:')) {
            p("", s.slice(8)).innerHTML = toHTML(buffer)                          // print paragraph
            continue
        }

        // Format Block bigger
        if (t.startsWith('!BIG:')) {
            p("", "font-size: 120%; font-weight: 500;").innerHTML = toHTML(buffer)
            continue;
        }


        // Evaluate code block
        if (t.startsWith('!EVAL:')) {
            eval(buffer)
            continue;
        }


        if (t.startsWith('!CODE_EDITOR:')) {
            let param = s.slice(13);  // remove tag and get arguments
            let attr = "";
            if (param.trim()) {
                if (param == "left") attr = "text-align: left;"
                if (param == "right") attr = "text-align: right;"
            }
            codeEditor(buffer, "width: 100%; max-height: 700px; overflow: auto; " + _br + _bigshadow, "background-color: #ffd;" + _br + _border+attr);
            continue;
        }

        if (t.startsWith('!PAGE_EDITOR:')) {
            pageEditor(buffer, "width: 100%;" + _br + _bigshadow, "background-color: #ffd;" + _br + _border);
            continue;
        }

        if (t.startsWith('!CODE:')) {
            pre(buffer, { "class": "prettyprint ", "style": "overflow: auto; padding: 2px 5px; width: 100%; margin:0 auto;" + _shadow })
            continue;
        }

        // Program text
        if (s.startsWith('%%%')) {
            s = getuntil(s.slice(3), '%%%')
            let el = pre(s, { "class": "prettyprint ", "style": "overflow: auto; padding: 2px 5px; width: 100%; max-height: 350px; margin:0 auto;" + _shadow })
            // el.innerHTML = PR.prettyPrintOne(s)
            continue
        }
        // Program text light
        if (s.startsWith('$$$')) {
            s = getuntil(s.slice(3), '$$$')
            let el = pre(s, {
                "class": " ", "style": "overflow: auto; padding: 4px 10px; width: 100%; margin:0 auto; background-color: #FFC;"
                    + _bold + _border + _radius + _shadow
            })
            // el.innerHTML = PR.prettyPrintOne(s)
            continue
        }
        // Program text transparent
        if (s.startsWith('???')) {
            s = getuntil(s.slice(3), '???')
            let el = pre(s, { "class": " ", "style": "overflow: auto;  width: 100%; margin:0 auto; " + _bold })
            // el.innerHTML = PR.prettyPrintOne(s)
            continue
        }

        // Kommentare
        if (s.startsWith('///')) {
            s = getuntil(s.slice(3), '///')
            continue
        }

        // Paragraph
        if (t) {
            p().innerHTML = toHTML(s)
        }


    }
    unselectBase()
    PR.prettyPrint()
}