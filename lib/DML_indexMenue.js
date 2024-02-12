/*------------------------------------------------------
Menue im aktuellen Kontext erzeugen
Topics definiert die Struktur als JSON:
DML_indexMenue

Key ist der Text es Menue-Eintrages, Value der Link
Wird eine Klammer mit angegeben, dann wird der link als Funktionsaufruf interpretiert.

------------------------------------------------------*/
function DML_indexMenue(parent, mainpage, topics, _style = "") {
    return new _sideMenue(parent, mainpage,topics, _style);
}
class _sideMenue {
    /*------------------------------------------------------
     constructor: Menue rekursiv aufbauen
     das Menue wird in parent aufgebaut, 
     Zielseite für scrolling is mainpage
     ------------------------------------------------------*/
    constructor(parent, mainpage, topics, _style = "") {
        this.base = selectBase(div(""));  // Invisible base area
        
        mainpage.onscroll = () => {
            for (let i in this.items) {
                let t = this.items[i].link.getBoundingClientRect().top
                if (t > screen.height / 3) {
                    this.select(Math.max(0, i - 1))
                    return
                }
            }
        }



        this._mkMenue(parent, topics, _style); //--> Aufbau

        // Callback Mouse leaves area
        this.base.onmouseleave = (e) => {
            return
            let src = this.base.firstElementChild;
            do {
                if (src.level > 1) {
                    src.style.display = "none";
                }
                src = src.nextSibling;
            } while (src);
        };

        unselectBase();

    }
    /*------------------------------------------------------
     Menuebaum erzeugen
     ------------------------------------------------------*/
    _mkMenue(parent, topics, _style) {
        // alle Topics durchgehen
        selectBase(parent)
        this.items = [];
        for (let i in topics) {
            let item = topics[i]
            let s = "text-align: left;"
                + "display: block; "
                + "text-decoration: none;"
                + "overflow: hidden;"
                +"margin-left: " + 10 * item.level + "px;";

            // + "transition: opacity 0.3s;"


            if (item.level > 1) {
                
                //  s += "display: none;"

            }


            let lnk = span(item.text, _style);                // URL link erzeugen
            lnk.classList.add("Level" + item.level);
            lnk.Level = item.level
            lnk.link = item.link;
            lnk.level = item.level;
            lnk.nr = i;
            setAttributes(lnk, s)
            this.items[i] = lnk // save internal list for requests

            /*------------------------------------------------------
              Mouse enter Callback function
              ------------------------------------------------------*/
        /*    lnk.onmouseenter = (e) => {
                let src = e.srcElement;
                this.select(src.nr)
            }
        */    lnk.onclick = (e) => {
                e.srcElement.link.scrollIntoView({ behavior: "smooth" });
            }
        }
        unselectBase()
    }
    /*------------------------------------------------------
      find list index of target
      ------------------------------------------------------*/
    findIndex(target) {
        for (let i in this.items) {
            if (this.items[i].link == target)
                return (i)
        }
        return (-1)
    }
    /*------------------------------------------------------
      Select one item
      ------------------------------------------------------*/
    select(nr) {
        // Reset all items
        let item
        for (let _i in this.items) {
            item = this.items[_i]
            item.style.backgroundColor = ""
        }
        // Mark item[nr]
        this.items[nr].style.backgroundColor = "rgba(0,0,0,0.5)"
        
        let level = this.items[nr].level;

        return
        //search previous main item
        let i = nr
        while ((i > 0) && (this.items[i].level > 1))
            i--;
        // hide tree above
        /*    for (let k = 0; k < i; k++)
                if (this.items[k].level > 1) {
                    this.items[k].style.display = "none"
                    this.items[k].style.opacity = 0;
                }
         */   // Make tree visible until nr
        for (; i < nr; i++) {
            this.items[i].style.display = "block"
            this.items[i].style.opacity = 1;
        }
        // Make next lower level visibe
        while (this.items[++i].level > level) {
            this.items[i].style.display = "block"
            this.items[i].style.opacity = 1;
        }
        while (this.items[++i].level == level) {
            this.items[i].style.display = "block"
            this.items[i].style.opacity = 1;
        }

        // Hide all after
        for (; i < this.items.length; i++)
            if (this.items[i].level > 1) {
                this.items[i].style.display = "none"
                this.items[i].style.opacity = 0;
            }

    }


}