module.exports.movePlugins = function(src, dest)
{
	var exec = require('child_process').exec
	exec(`cp -r ${src} ${dest}`, function(error, stdout, stderr){
		if (error) {
			console.error(`exec error: ${error}`)
		}
	})
}
