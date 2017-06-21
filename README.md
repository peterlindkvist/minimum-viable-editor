# Minimum Viable Editor
A micro content editing system for the express framework and any frontend.

This content editor uses a js object as data format, the same as most express templating engines.

Adds a nice looking [medium-editor](https://yabwe.github.io/medium-editor/) to every html-tag with a data-mve-html attribute.

To edit a page, add #editor (defined in config) to the url. And then click on the text you want to edit. Press ctrl + s or click the floppydisk in the lower right corner to save.

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

Changes the scope for the data-mve-* tags below. Makes refactoring and texts in partials easier. And might save some bytes in the html.

    <section data-mve-with="article">
      <h2 data-mve-text="./header">{{article.header}}</h2>
    </section>

### data-mve-image (Beta)

Adds an imagefile upload for images.

    <img src={{image}} data-mve-image="{{image}} />

Click on the image to upload a new one.

## Installation

### Install package

    npm install minimum-viable-editor --save

### Setup

In your node app:

    const mve = require('minimum-viable-editor');

    router.use(mve.setup({
      dataPath : './data';              // folder for content json and uploaded files.
      users : ['user:123']              //users to be able to edit the content in the form username:password
    }));

    router.get('/content.json', mve.addContent(), (req, res, next) => res.json(req.content));

See setup parameters for more config parameters.

Add a json file in the dataPath folder with your content data. And add the folder assets upload.

#### Setup parameters
Parameters to pass into mve.setup.

| Parameter     | Default          | Description                                                                   |
|---------------|------------------|-------------------------------------------------------------------------------|
| auth          | mve.basicAuth()  | Authentification middleware for content routes.                               |
| contentPath   | [dataPath]       | Folder on server for storage of content.                                      |
| dataPath      | ./data           | Folder on server for content and file storage.                                |
| editorUrl     | /mve             | Route for mve. Used for communication between server and client               |
| filesPath     | [dataPath]/files | Folder for file uploads.                                                      |
| hash          | editor           | Hash to att to url in browser to show the editor. eg. /page#editor            |
| mediumOptions | {}               | Options for the [Medium Editor](https://github.com/yabwe/medium-editor)       |
| splitContent  | false            | If the content should be splited into multiple files.                         |
| storage       | file             | Use file storage, more types are in the roadmap as cloud or database storage. |
| users         | []               | Array of allowed users for content reading and writing. ["user:pwd",...]      |

#### Methods
Public method in the package.

| Method          | Parameters        | Description                                                            |
|-----------------|-------------------|------------------------------------------------------------------------|
| mve.addContent  | lang, addMetaData | Middleware that adds content to req.content                            |
| mve.setup       | see setup         | Initializes the editor                                                 |
| mve.getContent  | lang              | fetches the content from storage, returns a promise.                   |
| mve.getMetaData | lang              | fetches metadata about the javascript assets to load.                  |
| mve.basicAuth   |                   | Middleware for basicAuth, used by the content router. Uses setup.users |
| mve.treeEditor  | content           | returns html for a simple data object editor                           |

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

## Internationalization

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

## Syncronize content

It could be discussed if the data folder with content should be commited and deployed together with the source. It simplifies deployment of new features a lot. To avoid to write over changed content during deployment a sync script is provided. Add to scripts in `package.json`

    "sync-content" : "mve-sync https://[remote server]/content.json ./data/sv_se.json"

And run `npm run sync-content` before starting on new content and before release. The local content and remote content will be deep merged with the remote content as master.

## Tests

soon :(
