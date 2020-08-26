# Expressive


### Getting started


```js
const app = express();

//  this will create and register the routers into the app
expressive.bootstrap(app, [controllers])

app.listen(3000);

// ... or you can register the routers yourself (there's no magic!):
const routers = expressive.create([controllers])
routers.forEach(cfg => app.use(cfg.basePath, cfg.router));


```
