/****************************************************************************************
    DMLjellyfish-Menue: An innovative round menue
    Needs index array 
[
    {"color": ,"text": , "link": }
    ...
]
Title is center menue, same format
****************************************************************************************/
let mouseX = 0, mouseY = 0
window.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}
function ifcol(col) {
  if (col)
    return "background-color: " + col + ";"
  else
    return ""
}

/****************************************************************************************
  Moving Buton
****************************************************************************************/


/*------------------------------------------------------
  Create a moving round button
  You can bring force to the button, it will return 
  to the initial position 
  ------------------------------------------------------*/
function movingButton(s, x, y, diameter, attr) { return new _movingButton(s, x, y, diameter, attr) }
class _movingButton {
  constructor(s, x, y, diameter, attr) {
    this.offset = diameter / 2
    this.p0 = { x: x, y: y }     // Startpunkt
    this.d = { x: 0, y: 0 }      // Auslenkung
    this.u = { x: 0, y: 0 }      // Geschwindigkeit
    this.f = { x: 0, y: 0 }      // Kraft
    this.button = rbutton(s, x, y, diameter, attr)

  }

  repaint() {

    //    let f0 = {x: trunc(this.d.x*100), y: trunc(this.d.y*100)}
    //    this.button.textContent = JSON.stringify(f0)
    this.u.x = this.u.x * 0.999 + (this.f.x / 100) - this.d.x / 1000;
    this.u.y = this.u.y * 0.999 + (this.f.y / 100) - this.d.y / 1000;
    this.d.x += this.u.x / 30;
    this.d.y += this.u.y / 30;
    this.button.style.transform = "translate(" + px(this.d.x - this.offset) + "," + px(this.d.y - this.offset) + ")"
    this.f.x = this.f.x * 0.99
    this.f.y = this.f.y * 0.99
  }
  // bring force to the button
  force(fx, fy) {
    this.f.x = fx;
    this.f.y = fy
  }
  // Momentanposition 
  p() {
    return { x: this.p0.x + this.d.x, y: this.p0.y + this.d.y }
  }
  delta(mouseX, mouseY) {
    let ret = {};
    let rect = this.button.getBoundingClientRect()
    ret.x = mouseX - (rect.left + rect.width / 2)
    ret.y = mouseY - (rect.top + rect.height / 2)
    ret.dist = Math.sqrt(ret.x * ret.x + ret.y * ret.y)
    return ret
  }

}



/****************************************************************************************
  Jellyfish - Menue
****************************************************************************************/

function DMLjellyfish(title, width, height, props, cbattrib, btattrib, baseattrib) { return new _jellyfish(title, width, height, props, cbattrib, btattrib, baseattrib) }
class _jellyfish {
  constructor(title, width, height, props, cbattrib = "", btattrib = "", baseattrib = "") {
    let x, y;
    this.props = props
    this.button = []
    this.center = { x: trunc(width / 2), y: trunc(height / 2) }
    this.base = selectBase(div("", "width: " + width + "px; height: " + height + "px;" + _center))
    setAttributes(this.base, baseattrib)
    this.canvas = canvas2D({ "width": width, "height": height })
    this.canvas.ctx.lineWidth = 3
    this.centerbutton = movingButton(title.text, this.center.x, this.center.y, height / 3.5, cbattrib + "border: solid 3px; " + ifcol(title.color))
    this.centerbutton.button.classList.add("DMLjellyfish")
    this.centerbutton.button.classList.add("center")
    this.centerbutton.button.onclick = () => window.open(this.button[i].link)
    for (let i in props) {
      let phi = i / props.length * 2 * Math.PI
      x = this.center.x + Math.sin(phi) * width / 3
      y = this.center.y - Math.cos(phi) * height / 3
      this.canvas.line(this.center.x, this.center.y, x, y)
      this.button[i] = movingButton(props[i].text, x, y, height / 4, btattrib + "border: solid 3px;")
      this.button[i].button.classList.add("DMLjellyfish")
      this.button[i].button.link = props[i].link
      this.button[i].button.classList.add("jelly")
      this.button[i].button.center = { "x": x, "y:": y }
      if (props[i].color)
        this.button[i].button.style.backgroundColor = props[i].color
      this.button[i].button.onclick = () => window.open(this.button[i].button.link, "_self")
    }
    unselectBase();

    setInterval(() => {

      this.mousePos(mouseX, mouseY)
      for (let i in this.props) {
          /*    this (Math.random() > 0.99) {
                this.button[i].f.x += (Math.random() - 0.5) * 3
                this.button[i].f.y += (Math.random() - 0.5) * 3
              }
          */    this.repaint()
      }
    }, 20)


    return this
  }

  mousePos(mouseX, mouseY) {
    let delta;
    for (let i in this.props) {
      delta = this.button[i].delta(mouseX, mouseY)
      if (delta.dist < 150)
        this.button[i].force(delta.x / 50, delta.y / 50)
      else
        this.button[i].force(0, 0)
    }
  }

  repaint() {
    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i in this.props) {
      let p = this.button[i].p()
      this.canvas.line(this.center.x, this.center.y, p.x, p.y)
      this.button[i].repaint()

    }
  }

}

