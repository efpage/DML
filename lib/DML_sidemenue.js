/*------------------------------------------------------
Menue im aktuellen Kontext erzeugen
Topics definiert die Struktur als JSON:
sideMenue(
      {
        "Top1":
        {
          "Sub1": "test()",
          "Sub2": "#link2",
          "Sub3": "#link3"
        },
        "Top2": "#link2",
        "Top3": {
          "Sub1": {
            "SubSub1": "#link1",
            "SubSub2": "#link2",
          },
          "Sub2": "#link2",
        },
        "Top4": "#link4",
        "Top5": "#link5"
      });
Key ist der Text es Menue-Eintrages, Value der Link
Wird eine Klammer mit angegeben, dann wird der link als Funktionsaufruf interpretiert.

------------------------------------------------------*/
function sideMenue(topics, _style="") {
    return new _sideMenue(topics, _style);
}
class _sideMenue {
    /*------------------------------------------------------
     constructor: Menue rekursiv aufbauen
     ------------------------------------------------------*/
    constructor(topics, _style="") {
        this.base = div("");  // Invisible base area
        d = this.base;
        begin(this.base);

        this._mkMenue(topics, 0, _style); //--> Aufbau

        // Callback Mouse leaves area
        this.base.onmouseleave = (e) => {
            let src = this.base.firstElementChild;
            do {
                if (Number(src.name) > 0) {
                    src.style.display = "none";
                }
                src = src.nextSibling;
            } while (src);
        };

        // return this.base;

    }
    /*------------------------------------------------------
     Menuebaum rekursiv erzeugen
     ------------------------------------------------------*/
    _mkMenue(topics, level,_style) {
        Object.keys(topics).map(key => { // alle Topics durchgehen
            let s = "text-align: left;"
                + "padding: 5px; "
                + "width: 100%;"
                + "display: inline-block; "
                + "text-decoration: none;"
              
                // + "transition: opacity 0.3s;"
                + _style

            if (level > 0) {
                s += "margin-left: " + 10 * level + "px;";
                s += "display: none;"
            }
            // else s += "z-index: 0;"
            let lnk;
            let href = topics[key]
            if (typeof (href) == "string") {
                if (href.includes("()")){
                    lnk = link(key, "javascript:"+href,s);   // Aktiven functions-Link erzeugen
                } else
                    lnk = link(key, href, s);                // URL link erzeugen
            } else {
                lnk = link(key, "javascript:void(0);", s);                 // Element für Submenue
                this._mkMenue(href, level + 1,_style);  // ---> Rekursion
            }
            lnk.name = level;

            /*------------------------------------------------------
              Mouse enter Callback function
              ------------------------------------------------------*/
            lnk.onmouseenter = (e) => {
                let src = e.srcElement;
                let level = Number(src.name);
                while (src.nextSibling) {
                    let sib = src.nextSibling;
                    let newLevel = Number(sib.name);
                    if (newLevel <= level) return;
                    if (newLevel == level + 1) {
                        sib.style.display = "inline-block";
                    }
                    src = sib;
                }
            }
        })
    }


}