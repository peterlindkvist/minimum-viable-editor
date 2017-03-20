# Minimum Viable Editor
A micro content editing system for the express framework and any frontend.

This content editor uses a js object as data format, the same as most express templating engines.

Adds a nice looking [medium-editor](https://yabwe.github.io/medium-editor/) to every html-tag
with a data-mve attribute.

To edit a page, add #editor (defined in config) to the url. And then click on the
text you want to edit. Press ctrl + s or click the floppydisk in the lower right corner to save.

## Edit Areas

Add a `data-mve="[path to text in content json]"` attribute and the content becomes editable.

## Lists of Items

Add a `data-mve-list="[path to list in content json]"` attribute to be able to clone, delete
and rearrenge items within the list. The path can be relative to a parent list, add `./` in the begining of the path.

    <ul data-mve-list="content.items">
      {{#each content.items}}
        <li data-mve="./">{{name}}</li>
      {{/each}}
    </ul>

The data path for the items will content.items.0, content.items.1.

## Installation
It will be added to NPM, soon.

Fetch the repo and run `npm install && npm link`
then in your project run `npm link minimal-viable-editor`

In your node app:

    const mve = require('minimum-viable-editor');

    mve.init({
      storage : 'file',
      contentPath : path.join(__dirname, 'data', 'content.json'),
      filesPath : path.join(__dirname, 'data', 'files'),
      editorUrl : '/editor',
      hash : 'editor'
    });

    const app = express();
    app.use(mve.addContent); // adds the content to req.content
    app.use('/', index);  //uses the req.content when populating the templates.
    app.use('/editor', mve.assetsRouter); // add the public assets router
    app.use('/editor', basicAuth, mve.contentRouter); // add the private content router (behind some kind of authentification)

Add a json file in the filePath folder with your content data. And add the folder assets upload.

And in the html add :

    <script type="text/javascript" src="/editor/assets/loader.js"></script>

Add an extra data-mve attribute to every tag you want to edit. Use the [lodash](https://lodash.com/docs/4.17.4#get) set/get format to define the data property.

(here with handlebars as templating engine)

    <div>
      <h3 data-mve="about.header">{{"about.header}}</h3>
      <img data-mve="about.image" src="{{about.image.src}}" />
      <div data-mve-list="{{about.sections}}"
        {{#each about.sections }}
          <div data-mve="./text">
            {{{text}}}
          </div>
        {{/each}}
        </div>
    </div>


## Security

The editor doesn't provide any kind of security by it own. But you can add a middleware in front of the contentRouter.

    const auth = require('http-auth');
    const basicAuth = auth.connect(auth.basic({ realm: "Content Editor" }, (username, password, callback) => {
        callback(username === "user" && password === "pwd");
    }));
    app.use('/editor', basicAuth, mve.contentRouter);


## Editing of invisible elements

Since its only possible to edit visible elements you have to create a different page and add these
texts as normal elements. And edit and save them there.
