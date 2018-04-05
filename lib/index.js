let rot13 = require("rot-thirteen");
let fs = require("./promisified-fs");

// rot13 is a Function that takes a String and returns a String
// Let's turn it into a faucet-pipeline plugin!
module.exports = (configs, assetManager, options) => {
	let { watcher } = options;
	buildAll(configs, assetManager, options).
		then(run(watcher));
};

function run(watcher) {
	return process => {	// We turn the plugin configuration into a function process
		process();	// Initially call it without arguments to process all configured sources
		if(watcher) {	// While in `--watch` mode
			watcher.on("edit", process);	// call it with an Array of modified files to process those
		}
	};
}

// We want to build the processing function from an Array of all config objects
function buildAll(configs, assetManager, options) {
	let transforms = configs.map(config =>
		build(config, assetManager, options));	// so we build a processing function for each config object
	return Promise.all(transforms).	// (N.B. This example doesn't use Promises here, but yours might.)
		then(transforms =>	// and then combine them into a single function
			files =>	// that takes an optional Array of files to process
				transforms.map(transform => transform(files)));	// and calls each processing function with those
}

// Now we'll build a processing function for a single config object
function build(config, assetManager, options) {
	let source = assetManager.resolvePath(config.source);	// First we wind the source path
	let target = assetManager.resolvePath(config.target, {	// and the target path
		enforceRelative: true	// which is customarily configured with a relative path
	});

	return files => {	// Now we build the processing function, which again takes an optional Array of files to process
		if(files && !files.includes(source)) return;	// If this is called from the watcher but the associated source was not modified, we’re done
		return fs.readFile(source).	// To process a source file we first read it
			then(buffer => apply(buffer, config, options)).	// then transform its contents in some way
			then(writeContent(target, assetManager),	// and write the results to the target file
					writeError(target, assetManager));	// or write a diagnostic message if it failed
	};
}

// This performs the actual transformation
function apply(buffer, { skip }, { compact }) {
	if(skip) {	// skip is an optional custom flag from our config object.  You can handle any custom flags here.
		return buffer;	// If it is true, we return the buffer unmodified
	}
	let contents = buffer.toString();	// We read a Buffer, but rot13 works on Strings.  We could have passed {encoding: 'utf8'} to readFile above instead of converting the buffer here.
	let result = rot13(contents);	// Here we finally call rot13
	if(!compact) {	// compact is true when faucet was called with the `--compact` flag
		return result;	// If it is false, we are done and return the result
	}
	return rot13(result);	// In production, we run rot13 *twice*!
}

// The transformation succeeded
function writeContent(path, assetManager) {
	return data => assetManager.writeFile(path, data);	// so we write the transformed data to the target path
}

// The transformation failed
function writeError(path, assetManager) {
	return error => assetManager.writeFile(path, null, { error });	// so we print the error message as diagnostic output
}
