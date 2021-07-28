/****************************************************************************************
  DML-Table with extended fuctions
  (c) 30.5.2021  

  DML_table: extends the standard HTML tables
  can be used in HTML as <table is DML_table>
  
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
    tableAttrib = {} or ""  // Whole table attributes
    headAttrib = {} or ""   // header line attributes
    bodyAttrib = {} or ""   // TBody attributes for body 0
    cellAttrib = {} or ""   // TD-Attribute
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


function table(mx, my, options = {}) { return new _table(mx, my, options) }
class _table extends HTMLTableElement {
    constructor(mx, my, options) {
        super()   // Create table element
        this._tabletimeout = {}


        if (options == false) {
            this.showHead = false
            options = {}
        } else {
            this.showHead = _init(options.showHead, true)  // Tablehead
        }
        setOptions(this, options, {
            tableAttrib: "border: 1px solid black; ",
            headAttrib: "background-color: silver; ",
            bodyAttrib: "",
            cellAttrib: "",
            onCellClick: null,
            canSelect: false,
            selectColor: "silver",
            invalidSelectColor: "#CC6060",
            invalidColor: "#FF8070",
            selectedRow: -1,
            selectedCol: -1
        })
        this.rowSelect = _init(options.rowSelect, true)
        this._rowid = options.rowid || []; // Optional row  array
        this._rowvalue = options.rowvalue || []; // Optional content of a array
        this._rowvalid = options.rowvalid || []; // Flag to make indicate row is valid array

        // Variablen

        // Select-Funktion
        this.onclick = (e) => {
            if (e.srcElement.cellIndex<0) return;
            let col = e.srcElement.cellIndex;
            let row = e.srcElement.parentElement.rowIndex;
            this.select(col, row)
        }

        //   this.doSelect = (e) => {
        this.doSelect = (e) => {
            if (!this.canSelect) return
            let el = e.target
            let row = el.parentElement.rowIndex
            let col = el.cellIndex
            this.select(col, row)
        }

        // Create table
        setAttributes(this, this.tableAttrib)
        this.buildTable(mx, my)

        // set content
        if (options.head) this.head = options.head
        if (options.body) this.body = options.body

        // Select before setting onSelect
        this.select(this.selectedCol, this.selectedRow)
        if (options.onSelect) // wait til end to set
            this.onSelect = options.onSelect;
        this.colorize();
        //    autobind(this)
        appendBase(this)
    } // end table()

    /*------------------------------------------------------
        set complete rwoId as array ar
    ------------------------------------------------------*/
    getrowvalid(i) {
        return arrayvalue(this._rowvalid, i, true); // Optional row Id
    }

    setrowvalid(i, value) {
        this._rowvalid[i] = value
        clearTimeout(this._tabletimeout)
        this._tabletimeout = setTimeout(() => {
            this.colorize();
        }, 10);
    }

    /*------------------------------------------------------
        Set colors according to selectedRow and getrowvalid     
        ------------------------------------------------------*/
    colorize() {
        //this.rows
        //let rows = el.parentElement.parentElement.childNodes

        for (let r in this.rows) {
            let ri = this.rows[r]
            let valid = this.getrowvalid(r)  // check, if row is valid
            for (let i = 0; i < ri.childElementCount; i++) {
                if ((ri.rowIndex === this.selectedRow) && (this.rowSelect || i == this.selectedCol)) {
                    // ri.cells[i].style.border = "solid 3px gray"
                    if (valid)
                        ri.cells[i].style.backgroundColor = this.selectColor
                    else
                        ri.cells[i].style.backgroundColor = this.invalidSelectColor

                }
                else {
                    //ri.cells[i].style.border = null
                    if (valid)
                        ri.cells[i].style.backgroundColor = null
                    else
                        ri.cells[i].style.backgroundColor = this.invalidColor
                }
            }
        }
    }

    /*------------------------------------------------------
  
     ------------------------------------------------------*/
    buildTable(mx, my) {
        let x, y, th, tb, td

        this.innerHTML = "" // delete Table
        if (this.showHead) {
            th = createAt(this, "THEAD");
            for (x = 0; x < mx; x++)
                createAt(th, "th", this.headAttrib).innerHTML = "&nbsp"
        }

        tb = createAt(this, "TBODY", this.bodyAttrib)
        for (y = 0; y < my; y++) {
            let tr = createAt(tb, "TR")
            for (x = 0; x < mx; x++) {
                td = createAt(tr, "TD", this.cellAttrib)
                td.innerHTML = "&nbsp"
                td.onclick = this.onCellClick
            }
        }
    }


    put(mx, my, head, body) {
        this.buildTable(mx, my);
        if (head) this.head = head
        if (body) this.body = body
    }

    /*------------------------------------------------------
      return cell reference
      ------------------------------------------------------*/
    cell(x, y) {
        let r = this.rows[y]
        return r.cells[x]
    }
    /*------------------------------------------------------
       set style for column
      ------------------------------------------------------*/
    colStyle(c, w, includeHead = false) {
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
    select(col, row) {
        this.selectedRow = row
        this.selectedCol = col


        this.colorize()

        if (this.onSelect)
            this.onSelect(col, row, this)
    }
    /*------------------------------------------------------
      Kurzform für Zeilen selektieren. Erfordert rowSelect=true
      ------------------------------------------------------*/
    selectRow(row) {
        this.select(0, row)
    }
    /*========================================================
      properties
      ========================================================*/
    get rowCount() {
        if (this.rows)
            return this.rows.length
        return 0
    }


    get colCount() {
        if (this.rows.length == 0)
            return 0
        return this.rows[0].childElementCount
    }


    /*------------------------------------------------------
      head
      ------------------------------------------------------*/
    get head() {
        let ret = []
        for (let i in this.tHead.childNodes) {
            let n = this.tHead.childNodes[i]
            ret.push(n.innerHTML)
        }
        return ret
    }
    set head(ar) {
        if (this.showHead) {
            this.tHead.innerHTML = ""
            for (let i in ar)
                createAt(this.tHead, "th", this.headAttrib).innerHTML = ar[i]
        }
    }

    /*------------------------------------------------------
      cells: Get or set 2d-Array
      ------------------------------------------------------*/

    get body() {
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
    }
    set body(ar) {
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

    /*------------------------------------------------------
      set complete rwoId as array ar,
      get rowid array referene 
      get selectedrowid als value
      ------------------------------------------------------*/

    get rowid() {
        return this._rowid; // Optional row Id
    }
    set rowid(ar) {
        this._rowid = ar
    }


    /*------------------------------------------------------
      selectedRowid
      ------------------------------------------------------*/
    get selectedRowid() {
        if (this.selectedRow < 0)
            return ""
        return this._rowid[this.selectedRow]
    }

    /*------------------------------------------------------
      set complete rwoId as array ar
      ------------------------------------------------------*/

    get rowvalue() {
        return this._rowvalue; // Optional row Id
    }
    set rowvalue(ar) {
        this._rowvalue = ar
    }


    /*------------------------------------------------------
      selectedRowvalue
      ------------------------------------------------------*/
    get selectedRowvalue() {
        return this._rowvalue[this.selectedRow]
    }


    /*------------------------------------------------------
      selectedCellvalue
      ------------------------------------------------------*/
    get selectedCellvalue() {
        if ((this.selectedCol < 0) || (this.selectedRow < 0)) {
            return ""
        }
        let c = this.cell(this.selectedCol, this.selectedRow)
        return c.textContent
    }


    /*------------------------------------------------------
      selectedCell
      ------------------------------------------------------*/

    get selectedCell() {
        return this.cell(this.selectedCol, this.selectedRow)
    }
}
customElements.define('dml-table', _table, { extends: "table" })