/**
 * GulpFlow provides a [gulp](https://gulpjs.com) plugin for [Flow](http://flowtype.org).
 *
 * @module GulpFlow
 * @main GulpFlow
 */

var _ = require("underscore");
var Class = require("yajscf");
var through = require("through2");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var execFile = require("child_process").execFileSync;
var flow = require("flow-bin");

const PLUGIN_NAME = "gulp-flow";

/**
 * GulpFlow is a Gulp plugin for type-checking code with `flow`.
 *
 * @class GulpFlow
 */
module.exports = Class.extend(
{
    init: function()
    {
        this.options = [
            "--json"
        ];
    },

    check: function()
    {
        var me = this;
        this.results = {};
        return through.obj(function(file, encoding, callback)
        {
            if(file.isNull())
            {
                callback();
                return;
            }
            else if(file.isStream())
            {
                this.emit("error", new PluginError(PLUGIN_NAME, "streams are not supported (yet?)"));
            }
            try
            {
                var output = execFile(flow, _.union(["check-contents"], me.options), {
                    input: file.contents.toString("utf-8")
                }).toString("utf-8");
            }
            catch(e)
            {
                // flow normally exits with a non-zero status if errors are found
                output = e.stdout.toString("utf-8");
            }
            me.results[file.path] = output;

            this.push(file);
            callback();
        });
    },

    reporter: function()
    {
        var me = this;
        return through.obj(function(file, encoding, callback)
        {
            _.forEach(me.results, gutil.log);
        });
    }
});
