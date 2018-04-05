"use strict";
let path = require("path");

module.exports = {
	rot13: [{
		source: "./hello.txt",
		target: "./dist/hello.txt"
	}],
	plugins: {
		rot13: path.resolve("../../lib")
	}
};
