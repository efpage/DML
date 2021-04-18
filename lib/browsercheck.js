// Browser check for ES6
function get_browser() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }


try {
    sUsrAg = navigator.userAgent;
    new Function("(a = 0) => a");
}
catch (err) {
     document.writeln("<h3>Please update your Browser!</h3>");
    let b = get_browser();
    document.writeln("- Current: <b>"+b.name+", version "+b.version+"</b><br><br>");
    document.writeln("<div style='padding: 10px; border: thin solid silver; background-color: #ffffee; display: inline-block;'>");
    document.writeln("Full ECMAScript 6 (ES2015) support required<br>");
    document.writeln("</div><br><br>");
}
