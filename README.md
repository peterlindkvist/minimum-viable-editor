# Minimum Viable editor
A micro content editing system for the express framework and any frontend.

This content editor uses a js object as data format as most express templating engines.

Adds a nice looking [medium-editor](https://yabwe.github.io/medium-editor/) to every html-tag
with a data-mve attribute.

To edit a page, add #editor (defined in config) to the url. And then click on the
text you want to edit. Press ctrl + s or click the floppydisk in the lower right corner to save.

## Installation
It will be added to NPM, soon.

Fetch the repo and run `npm install && npm link`
then in your project run `npm link minimal-viable-editor`

In your node app:

    const mve = require('minimum-viable-editor');

    mve.init({
     storage : 'file',
     filePath : path.join(__dirname, 'data', 'content.json'),
     hash : 'editor'
    });

    const app = express();
    app.use(mve.addContent); // adds the content to req.content
    app.use('/', index);  //uses the req.content when populating the templates.
    app.use('/editor', mve.routes()); //add the editor endpoints.

And in the html add :

    <script type="text/javascript" src="/editor/assets/loader.js"></script>

Add an extra data-mve attribute to every tag you want to edit. Use the [lodash](https://lodash.com/docs/4.17.4#get) set/get format to define the data property.

(here with handlebars as templating engine)

    <div>
      <h3 data-mve="about.header">{{"about.header}}</h3>
      {{#each about.section }}
        <div data-mve="about.@index.text">
          {{{text}}}
        </div>
      {{/each}}
    </div>


## Security

The editor doesn't provide any kind of security by it own. But you can pass in a sequrity middleware to the routes.

    const auth = require('http-auth');
    const basicAuth = auth.connect(auth.basic({ realm: "Content Editor" }, (username, password, callback) => {
        callback(username === "user" && password === "pwd");
    }));
    app.use('/editor', mve.router(basicAuth));

If you add a security middleware to the whole route the js assets are blocked as well.

## Editing of invissible elements

Since its only possible to edit visible elements you have to create a different page and add these
texts as normal elements. And edit and save them there.
