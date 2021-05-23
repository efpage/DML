# DML
<b>An Object Oriented Web Programming Framework</b>

DML is a Javascript framework for object oriented web programming. Unlike other frameworks it does not implement a new syntax or it´s own unique logic. All you need is already implemented in modern browsers. DML just adds a small set of function to let you use the HTML DOM API in a very convenient way. And it adds a new and radical approach to use object oriented technics (OO) to create stunning web pages and powerful web applications just using Javascript. 

Don't be fooled by the apparent simplicity: DML provides a complete design platform with web components and templates - just in a very different way you may be used to. This lib is made for OO-programmers rather than for web designers. Just add the DML-Library to your website and start HTML-Programming... And let the power of OO be with you!

A minimal DML page will look like this:

```
<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="utf-8">
  <title>title</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="..\lib\DML.js"></script>
</head>

<body>
  <script>  "use strict";
    h1("test")
    p("test")
  </script>
</body>

</html>
```


## DML in a nutshell
1. DML implements only a very small set of "generic" functions to let you use the HTML DOM API in a more "natural" way. Most HTML-tags are implemented as javascript functions: h1() creates a headline, p() create a paragraph and so on.
2. All DML-function return a reference to the DOM-element they just created. No need for ID´s, Classes and complicated Javascript functions to retrieve DOM references any more.
3. DOM references are returned as LOCAL variables, removing unwanted side effects and naming conflicts. DOM elements created inside a class are owned only by the instantiated object. True encapsulation can be realized.
4. Functions act as templates: Groups of DOM elements can be created by functions. As functions can use any kind of logic, functional templating is far more flexible than static templates.
5. Classes can be used to implement DOM objects AND event logic. Class objects can therefore generate very complex web objects, that are still completely encapsulated. This is the true basis for OO and to reuse web components.
6. The DML library is organized in multiple script libraries. The first - and always necessary - is DML.js. Functional units (like Menues, Table handlers etc.) are put together in separate units that usually contain only one class definition. General scripts should reside in the "lib"-folder, project specific scripts should be placed on the same level as your html-files. 
7. Yes - it´s true: DML creates dynamic web pages by direct DOM manipulation, which is not search engine friendly (except with google, which can handle this). But this is not different from React or Vue.  

For more information see: https://efpage.de/DML/DML_homepage/
