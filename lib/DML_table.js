/****************************************************************************************
  table definition
  Create Table of fixed size mx,my. 
  If showHead==false, table head is not created
  supports a rowId, that contains a value for each row. 

  Cell or row hover with CSS only

  properties
  read values
    table.rowCount
    table.colCount
    table.selectedRowid
    table.selectedRowvalue
    table.selectedCellvalue()
  Set or read values
    table.head = [...]
    table.body = [[.],[.],[.]], if only one column [...]
    table.rowid = []
    table.rowValue = []


  functions
    table.cell(x,y): full cell access
    table.colStyle(1, "width: 150px; color: green; ")
    table.colStyle(["width: 20px","width: 120px","width: 55px; background-color: green;"])
    table.put(mx, my, head, body): rebuild
    buildTable(mx, my, showHead, attrib, headAttrib)
    setrowvalid(row,status) // set status for a row. Internal array : _rowvalid
    getrowvalid(row)

  options:
    head || []   // set header data [...]
    body || []   // set body data [[.],[.],[.]], if only one column [...]
    tableAttrib = {} or ""
    bodyAttrib = {} or ""
    headAttrib = {} or "" 
    showHead = true
    onClick || null  // Events
    onSelect || null
    canSelect || false
    rowSelect || true
    selectColor || "silver"
    invalidSelectColor: "#CC6060",
    invalidColor: "#FF8070",
    selectedRow || -1
    selectedCol || -1
    rowid || []; // Optional row Id
    rowvalue || []; // Optional content of a row

****************************************************************************************/


function table(mx, my, options = {}) {
    let t = make('table', options.bodyAttrib)
    t._tabletimeout = {}

    if (options == false) {
        t.showHead = false
        options = {}
    } else {
        t.showHead = _init(options.showHead, true)  // Tablehead
    }
    setOptions(t, options, {
        onCellClick: null,
        canSelect: false,
        selectColor: "silver",
        invalidSelectColor: "#CC6060",
        invalidColor: "#FF8070",
        selectedRow: -1,
        selectedCol: -1
    })
    t.rowSelect = _init(options.rowSelect, true)
    t._rowid = options.rowid || []; // Optional row Id
    t._rowvalue = options.rowvalue || []; // Optional content of a row
    t._rowvalid = options.rowvalid || []; // Flag to make indicate row is valid

    // Variablen

    // Select-Funktion
    t.onclick = (e) => {
        let col = e.srcElement.cellIndex;
        let row = e.srcElement.parentElement.rowIndex;
        t.select(col, row)
    }

    //   t.doSelect = (e) => {
    t.doSelect = function (e) {
        if (!t.canSelect) return
        let el = e.target
        let row = el.parentElement.rowIndex
        let col = el.cellIndex
        t.select(col, row)
    }.bind(t)

    /*------------------------------------------------------
        set complete rwoId as array ar
    ------------------------------------------------------*/
    t.getrowvalid = function (i) {
        return arrayvalue(t._rowvalid, i, true); // Optional row Id
    }

    t.setrowvalid = function (i, value) {
        t._rowvalid[i] = value
        clearTimeout(t._tabletimeout)
        t._tabletimeout = setTimeout(() => {
            t.colorize();
        }, 10);
    }



    /*------------------------------------------------------
        Set colors according to selectedRow and getrowvalid     
      ------------------------------------------------------*/
    t.colorize = function () {
        //this.rows
        //let rows = el.parentElement.parentElement.childNodes

        for (let r in this.rows) {
            let ri = this.rows[r]
            let valid = t.getrowvalid(r)  // check, if row is valid
            for (let i = 0; i < ri.childElementCount; i++) {
                if ((ri.rowIndex === t.selectedRow) && (t.rowSelect || i == t.selectedCol)) {
                    // ri.cells[i].style.border = "solid 3px gray"
                    if (valid)
                        ri.cells[i].style.backgroundColor = t.selectColor
                    else
                        ri.cells[i].style.backgroundColor = t.invalidSelectColor

                }
                else {
                    //ri.cells[i].style.border = null
                    if (valid)
                        ri.cells[i].style.backgroundColor = null
                    else
                        ri.cells[i].style.backgroundColor = t.invalidColor
                }
            }
        }
    }

    // Create table
    t.buildTable(mx, my, t.showHead)

    // set Attributes
    if (options.headAttrib) if (t.tHead) setAttributes(t.tHead, options.headAttrib)
    if (options.bodyAttrib) setAttributes(t.tBodies[0], options.bodyAttrib)
    if (options.tableAttrib) setAttributes(t, options.tableAttrib)

    // set content
    if (options.head) t.head = options.head
    if (options.body) t.body = options.body

    // Select before setting onSelect
    t.select(options.selectedCol, options.selectedRow)
    if (options.onSelect)
        t.onSelect = options.onSelect;
    t.colorize();
    return t
} // end table()

/*========================================================
  functions
  ========================================================*/
/*------------------------------------------------------
  generate new empty table
  ------------------------------------------------------*/
HTMLTableElement.prototype.buildTable = function (mx, my, showHead, attrib, headAttrib) {
    let x, y, th, tb, tr, td

    this.innerHTML = "" // delete Table
    this.showHead = showHead;
    if (showHead) {
        th = createAt(this, "thead");
        for (x = 0; x < mx; x++)
            createAt(th, "th", headAttrib).innerHTML = "&nbsp"
    }

    tb = createAt(this, "tbody")
    for (y = 0; y < my; y++) {
        let tr = createAt(tb, "tr")
        for (x = 0; x < mx; x++) {
            td = createAt(tr, "td", attrib)
            td.innerHTML = "&nbsp"
            td.onclick = this.onCellClick
        }
    }
}


HTMLTableElement.prototype.put = function (mx, my, head, body) {
    this.buildTable(mx, my, this.showHead);
    if (head) this.head = head
    if (body) this.body = body
}

/*------------------------------------------------------
  return cell reference
  ------------------------------------------------------*/
HTMLTableElement.prototype.cell = function (x, y) {
    return this.rows[y].cells[x]
}
/*------------------------------------------------------
   set style for column
  ------------------------------------------------------*/
HTMLTableElement.prototype.colStyle = function (c, w, includeHead = false) {
    if (Array.isArray(c)) {
        let n = Math.min(c.length, this.colCnt)
        for (let k = 0; k < n; k++) {
            let w2 = c[k]
            for (let i = 0; i < this.rows.length; i++) {
                this.rows[i].childNodes[k].style.cssText = w2
            }
            if (includeHead)
                this.head[k].style.cssText = w2
        }
    } else {
        for (let i = 0; i < this.rows.length; i++) {
            this.rows[i].childNodes[c].style.cssText = w
        }
        if (includeHead)
            if (this.tHead)
                this.tHead.childNodes[c].style.cssText += w
    }
}
/*------------------------------------------------------
  Select one gol
  ------------------------------------------------------*/
HTMLTableElement.prototype.select = function (col, row) {
    this.selectedRow = row
    this.selectedCol = col


    this.colorize()

    if (this.onSelect)
        this.onSelect(col, row, this)
}
/*------------------------------------------------------
  Kurzform für Zeilen selektieren. Erfordert rowSelect=true
  ------------------------------------------------------*/
HTMLTableElement.prototype.selectRow = function (row) {
    this.select(0, row)
}
/*========================================================
  properties
  ========================================================*/
Object.defineProperty(
    HTMLTableElement.prototype, "rowCount", {
    get: function () {
        return this.rows.length
    }
})
Object.defineProperty(
    HTMLTableElement.prototype, "colCount", {
    get: function () {
        if (this.rows.length == 0)
            return 0
        return this.rows[0].childElementCount
    }
})

/*------------------------------------------------------
  head
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "head", {
    get: function () {
        let ret = []
        for (let i in this.tHead.childNodes) {
            let n = this.tHead.childNodes[i]
            ret.push(n.innerHTML)
        }
        return ret
    },
    set: function (ar) {
        if (this.showHead)
            for (let i in ar)
                if (i < this.tHead.childElementCount)
                    this.tHead.childNodes[i].innerHTML = ar[i]
    }
})
/*------------------------------------------------------
  cells: Get or set 2d-Array
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "body", {
    get: function () {
        let r, ret = []
        for (let y = 0; y < this.rowCount; y++) {
            r = []
            let n = Array.from(this.rows[y].childNodes)
            for (let i in n) {
                let x = n[i]
                r.push(x.innerHTML)
            }
            ret.push(r)
        }
        return ret
    },
    set: function (ar) {
        if (1 == this.colCount) {
            for (let y = 0; y < ar.length; y++) {
                if (y < this.rowCount)
                    this.cell(0, y).innerHTML = ar[y]
            }
        } else {
            for (let y = 0; y < Math.min(ar.length, this.rowCount); y++) {
                for (let x = 0; x < Math.min(ar[y].length, this.colCount); x++) {
                    this.cell(x, y).innerHTML = ar[y][x]
                }
            }
        }
    }
})
/*------------------------------------------------------
  set complete rwoId as array ar,
  get rowid array referene 
  get selectedrowid als value
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "rowid", {
    get: function () {
        return this._rowid; // Optional row Id
    },
    set: function (ar) {
        this._rowid = ar
    },
})

/*------------------------------------------------------
  selectedRowid
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "selectedRowid", {
    get: function () {
        if (this.selectedRow < 0)
            return ""
        return this._rowid[this.selectedRow]
    }
})
/*------------------------------------------------------
  set complete rwoId as array ar
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "rowvalue", {
    get: function () {
        return this._rowvalue; // Optional row Id
    },
    set: function (ar) {
        this._rowvalue = ar
    }
})

/*------------------------------------------------------
  selectedRowvalue
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "selectedRowvalue", {
    get: function () {
        return this._rowvalue[this.selectedRow]
    }
})

/*------------------------------------------------------
  selectedCellvalue
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "selectedCellvalue", {
    get: function () {
        if ((this.selectedCol < 0) || (this.selectedRow < 0)) {
            return ""
        }
        let c = this.cell(this.selectedCol, this.selectedRow)
        return c.textContent
    }
})

/*------------------------------------------------------
  selectedCell
  ------------------------------------------------------*/
Object.defineProperty(
    HTMLTableElement.prototype, "selectedCell", {
    get: function () {
        return this.cell(this.selectedCol, this.selectedRow)
    }
})


