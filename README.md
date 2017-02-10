# Minimum Viable editor
A micro content editing system for the express framework and any frontend.

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
    app.use(mve.addContent); // adds the content json to req.content
    app.use('/', index);  //uses the req.content when populating the templates.
    app.use('/editor', mve.routes()); //add the editor endpoints.

And in the html add :

    <script type="text/javascript" src="/editor/assets/loader.js"></script>

Add an extra attribute to every tag you want to edit. (handlebars as templating engine)

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
