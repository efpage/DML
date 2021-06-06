# DML
<b>An Object Oriented Web Programming Framework</b>

DML is a new and radical approach to make web programming more efficient. Frameworks like VUE or REACT use Javascript to create dynamic content too, but need their own and very special ecosystem. This brings additional complexity to web design - and a long and steep learning curve. 

DML is different, it was designed to make web programming easier and more efficient. Why use different languages like HTML,CSS,JS,AJAX,JQUERY and PHP to solve 1 single task? 

The initial approach was simple, but was found to be amazingly useful: DML exposes (most) HTML-tags as Javascript functions. So, instead of creating a `<h1>Headline</h1>`-tag you can write `h1("Headline")` to create a DOM-object in Javascript now. What is the advantage, as the result will be identical?

<b>All DML-functions return a reference</b> to the newly created object, that can directly be assigned to a JS-variable. In standard web sites - as html and JS are parsed by different systems - we need some ID´s to communicate between HTML and JS. The usual way is
```
  <h1 id="MyHeadline">Headline</h1>
  <script>
    var h = document.getElementById("MyHeadline");
    h.textContent = "New Headline";
  </script>
```
BUT (!!!) id´s are always! globally scoped, so encapsulation is simply not possible in web sites. With DML, things are different: you can write the same script as follows

```
  <script>
    h = h1("MyHeadline");
    h.textContent = "New Headline";
  </script>
```
Sounds like a small advantage, but in fact, this is a huge step! DML brings Javascript closer to the DOM, which has a great impact: DOM-elements are created as part of Javascript object, so they can be fully encapsulated too. No need to create a virtual DOM, no need to use a shadow DOM. Pleas try out to see the advantages. DML-websites run smooth without unnecessary page refreshes even with very complex content. The <a href="https://efpage.de/DML/DML_homepage/">DML-homepage</a> was created only using DML!

Don't be fooled by the apparent simplicity: DML provides a complete design platform to create web components and templates - just in a very different way you may be used to. This lib is made for OO-programmers rather than for web designers. Just add the DML-Library to your website and start HTML-Programming... And let the power of OO be with you!

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
