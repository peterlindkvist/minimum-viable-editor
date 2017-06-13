# Minimum Viable Editor
A micro content editing system for the express framework and any frontend.

This content editor uses a js object as data format, the same as most express templating engines.

Adds a nice looking [medium-editor](https://yabwe.github.io/medium-editor/) to every html-tag
with a data-mve-html attribute.

To edit a page, add #editor (defined in config) to the url. And then click on the
text you want to edit. Press ctrl + s or click the floppydisk in the lower right corner to save.

## Editor Attributes

### data-mve-text

Add a `data-mve-text="[path to text in content json]"` attribute and the tag becomes contenteditable.

### data-mve-number

Add a `data-mve-number="[path to text in content json]"` attribute and the tag becomes contenteditable but only numbers and "." is allowed. The property in json will be a number instead of a string.

### data-mve-html

Add a `data-mve-html="[path to text in content json]"` attribute and a medium editor is added to the tag.

### data-mve-list

Add a `data-mve-list="[path to list in content json]"` attribute to be able to clone, delete
and rearrenge items within the list. The path can be relative to a parent list, add `./` in the begining of the path.

    <ul data-mve-list="content.items">
      {{#each content.items}}
        <li data-mve-html="./">{{name}}</li>
      {{/each}}
    </ul>

The data path for the items become content.items.0, content.items.1.

### data-mve-with

Changes the scope for the data-mve-* tags below. Makes refactoring and texts in partials easier. And saves some bytes in the html.

    <section data-mve-with="article">
      <h2 data-mve-text="./header">{{article.header}}</h2>
    </section>

## Installation

### Install package

It will be added to NPM, as soon its stable.

    npm install peterlindkvist/minimum-viable-editor --save

or

Fetch the repo and run `npm install && npm link`
then in your project run `npm link minimal-viable-editor`

### Simple setup

In your node app:

    const mve = require('minimum-viable-editor');

    router.use(mve.simpleSetup({
      dataPath : './data';              // folder for content json and uploaded files.
      users : ['user:123']              //users to be able to edit the content in the form username:password
    }));

    router.get('/content.json', mve.addContent(), (req, res, next) => res.json(req.content));

See advanced setup for more config parameters.

Add a json file in the dataPath folder with your content data. And add the folder assets upload.

### Advanced setup

To be able to control more of the routing the internal routing can be used instead.

    const mve = require('minimum-viable-editor');

    mve.setup({
      storage : 'file',
      contentPath : './data/content.json',
      filesPath : ./data/files,
      editorUrl : '/editor',
      hash : 'editor',
      mediumOptions : {
        toolbar: {
          buttons: ['bold', 'italic', 'anchor', 'h2', 'orderedlist', 'unorderedlist']
        }
      }
    });

    const app = express();
    app.use(mve.addContent()); // adds the content to req.content
    app.use('/', index);  //uses the req.content when populating the templates.
    app.use('/editor', mve.assetsRouter); // add the public assets router
    app.use('/editor', basicAuth, mve.contentRouter); // add the private content router (behind some kind of authentification)


### HTML

And in the html add (in handlebars) :

      <script type="text/javascript" src="{{_mve.loader}}"></script>

Where the handlebars template data is `req.content`.

Add an extra data-mve attribute to every tag you want to edit. Use the [lodash](https://lodash.com/docs/4.17.4#get) set/get format to define the data property.

(here with handlebars as templating engine)

    <div>
      <h3 data-mve-text="about.header">{{"about.header}}</h3>
      <img data-mve-image="about.image" src="{{about.image.src}}" />
      <div data-mve-list="{{about.sections}}"
        {{#each about.sections }}
          <div data-mve-html="./text">
            {{{text}}}
          </div>
        {{/each}}
      </div>
    </div>

## Tree editor

MVE also includes a simple json tree editor.

    router.get('/content', mve.basicAuth, mve.addContent(), (req, res, next) => {
      res.render('content', {
        html : mve.treeEditor(req.content),
        _mve : req.content._mve
      });
    });

## Internationalization (Beta)

Add a lang parameter to addContent to retrive another language.

    router.get('/content', mve.basicAuth, mve.addContent('sv_se'), (req, res, next) => {
      res.render('content', {
        html : mve.treeEditor(req.content),
        _mve : req.content._mve
      });
    });

    router.get('/content.json', mve.addContent('sv_se', false), (req, res, next) => {
      res.json(req.content);
    });     

A `sv_se.json` need to be added to the data folder. The _mve property in content is updated for the new language.

## Security

The editor doesn't provide any kind of security except the basic auth. To change authentification middleware pass a auth middleware to setup as a auth-parameter. Or Implement something more complicated with the advanced setup.


## Editing of invisible elements

Since its only possible to edit visible elements you have to create a different page and add these
texts as normal elements. To fetch the editor directly instead of adding #editor, use the index.js.

    <script type="text/javascript" src="{{_mve.index}}"></script>

## syncronize content

It could be discussed if the data folder with content should be commited and deployed together with the source. It simplifies deployment of new features a lot. To avoid to write over changed content during deployment a sync script is provided. Add to scripts in `package.json`

    "sync-content" : "mve-sync https://[remote server]/content.json ./data/sv_se.json"

And run `npm run sync-content` before starting on new content and before release. The local content and remote content will be deep merged with the remote content as master.

## Tests

soon :(
