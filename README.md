# json-updater


Inserts new object to your json file without overwriting the content.

__why use this?__

`json-updater` __doesn't rewrite__ the whole file but appends the new object to your json file object, which makes it much faster.


### installation
`npm install --save json-updater`

### API

__insert(filename, obj[,space], callback)__

`obj` object(s) to insert
 
 The optional `space` argument formats your `obj`. Default `0` spaces.
 
 _Using default space:_
 ```javascript
 var jsonUpdater = require('json-updater');
 var file = __dirname + '/users.json';
 
 var obj = {
 	"1": {
    	"first_name": "Will",
        "last_name": "Smith"
    }
 };
 
 //you can also insert multiple objects
 var multiObj = {
 	"2": {
    	"first_name": "Google",
        "last_name": "Chrome"
    },
    "3": {
    	"first_name": "Mozilla",
        "last_name": "Firefox"
    },
    "arr": [
      "foo",
      "bar"
    ]
 }
 
 jsonUpdater.insert(file, obj, function (err) {
 	if(err) return console.error(err);
    //-- your code
 });
```
 
 _With space or tab:_
 
```javascript
jsonUpdater.insert(file, obj, 1, function (err){
	if(err) return console.error(err);
	//-- your code here...
});

jsonUpdater.insert(file, obj, '\t', function (err) {
	if(err) return console.error(err);
    //-- your code here...
});
```

__read(filename[,space], callback)__

The callback gets two arguments `(err, data)` where `data` is the content of the file

The optional `space` argument formats the `data` from callback.

```javascript
jsonUpdater.read(file, '\t', function (err, data) {
	if(err) return console.log(err);
    console.log(data);
});
```
