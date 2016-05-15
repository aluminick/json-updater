//require module
var fs = require('fs');

var globalSpace = 0;

//validates inputs
var check = {
	file: function (file, callback) {
		/******************************
			Check if file is accessible
		*******************************/
		fs.access(file, fs.R_OK | fs.W_OK, function (err) {
			if(err) return callback(err);
			return callback(null);
		});
	},
	obj: function (obj, callback) {
		/******************************
			Check if json is valid
		*******************************/
		try {
			JSON.parse(obj);
		} catch (err) {
			return callback(err);
		}
		return callback(null);
	},
	space: function (space, callback) {
		/******************************
			Check if space is valid
		*******************************/
		if((typeof space === 'string' && space === '\t') || typeof space === 'number')
			globalSpace = space;
		return callback(null);
	}
};

/******************************
	Reader and Writer
*******************************/
var stream = {
	read: function (file, space, callback) { 
		/*****************************************
			Read and returns content of the file
		******************************************/
		if(typeof space === 'function')
			callback = space;

		var readerStream = fs.createReadStream(file);
		var data = '';

		readerStream.on('error', function (err) {
			return callback(err);
		});

		readerStream.on('data', function (chunk) {
			data += chunk;
		});

		readerStream.on('end', function () {
			if(typeof space !== 'function') {
				data = JSON.parse(data);
				data = JSON.stringify(data, null, globalSpace);
			}

			return callback(null, data);
		});
	},
	write: function (file, obj, fileData, callback) { 
		/*****************************************
			Writes obj to json file
			VARIABLES:
				jsonObj = json format of obj to be inserted
				strObj = string format of obj to be written to json file
				close = object for checking closing bracket
				startIdx = where to start writing to file
		******************************************/
		var jsonObj = JSON.parse(obj);
		var strObj = JSON.stringify(jsonObj, null, globalSpace);

		var close = {
			found: false,
			bracket: ''
		};

		var startIdx = 0;

		var i = fileData.length;

		for(i; i > 0; i--) {
			/*****************************
				Marks where to start writing to file
			******************************/
			if(close.found === false) {
				if(fileData.charAt(i) === '}' || file.charAt(i) === ']') {
					close.found = true;
					close.bracket = fileData.charAt(i);
				}
			} else { //where to start appending
				if(!(/\s/.test(fileData.charAt(i)))) {
					startIdx = i+1;
					break;
				}
			}
		}

		strObj = ',' + strObj.substring(1, strObj.length-1) + close.bracket;
		
		/***************************
			Start writing strObj to json file
		***************************/
		var writerOptions = {
			flags: 'r+',
			start: startIdx
		};
		var writerStream = fs.createWriteStream(file, writerOptions);
		writerStream.write(strObj);
		writerStream.end();

		writerStream.on('error', function (err) {
			return callback(err);
		});

		writerStream.on('finish', function () {
			return callback(null);
		})
	}
};

/**************************************
	Calls Reader and Writer
***************************************/
var execute = {
	insert: function (file, obj, callback) {
		stream.read(file, function (err, fileData) {
			if(err) return callback(err);
			stream.write(file, obj, fileData, function (err) {
				if(err) return callback(err);

				return callback(null);
			});
		});
	},
	read: function (file, space, callback) {
		stream.read(file, space, function (err, fileData) {
			if(err) return callback(err);
			return callback(null, fileData);
		});
	}
};

function insertJson(file, obj, space, callback) {

	if(typeof space === 'function')
		callback = space;

	var obj = JSON.stringify(obj);

	//1. check file
	check.file(file, function (err) {
		if(err) return callback(err);

		//2. check object
		check.obj(obj, function (err) {
			if(err) return callback(err);

			//3. check spaces
			check.space(space, function (err) {
				if(err) return callback(err);
				
				//4. insert to file
				execute.insert(file, obj, function (err) {
					if(err) return callback(err);
					
					return callback(null);
				});
			});
		});
	});
}

function readJson(file, space, callback) {
	if(typeof space === 'function'){
		callback = space;
		space = null;
	}
		
		//1. check file
	check.file(file, function (err) {
		if(err) return callback(err);

			//2. check spaces
			check.space(space, function (err) {
				if(err) return callback(err);
				
				//3. read file
				execute.read(file, space, function (err, data) {
					if(err) return callback(err);
					
					return callback(null, data);
				});
			});
	});
}

module.exports = {
	insert: function (file, obj, space, callback) {
		insertJson(file, obj, space, function (err) {
			if(err) return callback(err);
			return callback(null);
		});
	},
	read: function (file, space, callback) {
		readJson(file, space, function (err, data) {
			if(err) return callback(err);
			return callback(null, data);
		});
	}
};