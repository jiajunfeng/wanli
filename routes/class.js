var Class = null;
var cc = cc || {};

//
function ClassManager() {
    //tells own name
    return arguments.callee.name || (arguments.callee.toString()).match(/^function ([^(]+)/)[1];
}
ClassManager.id = (0 | (Math.random() * 998));
ClassManager.compileSuper = function (func, name, id) {
    //make the func to a string
    var str = func.toString();
    //find parameters
    var pstart = str.indexOf('(');
    var pend = str.indexOf(')');
    var params = str.substring(pstart + 1, pend);
    params = params.trim();

    //find function body
    var bstart = str.indexOf('{');
    var bend = str.lastIndexOf('}');
    var str = str.substring(bstart + 1, bend);

    //now we have the content of the function, replace this._super
    //find this._super
    while (str.indexOf('this._super') != -1) {
        var sp = str.indexOf('this._super');
        //find the first '(' from this._super)
        var bp = str.indexOf('(', sp);

        //find if we are passing params to super
        var bbp = str.indexOf(')', bp);
        var superParams = str.substring(bp + 1, bbp);
        superParams = superParams.trim();
        var coma = superParams ? ',' : '';

        //find name of ClassManager
        var Cstr = arguments.callee.ClassManager();

        //replace this._super
        str = str.substring(0, sp) + Cstr + '[' + id + '].' + name + '.call(this' + coma + str.substring(bp + 1);
    }
    return Function(params, str);
};
ClassManager.compileSuper.ClassManager = ClassManager;
ClassManager.getNewID = function () {
    return this.id++;
};
var initializing = false;

cc.getClass = function (prop, prototype) {
    var result = function () {
        // All construction is actually done in the init method
        if (!initializing && this.ctor) {
            this.ctor.apply(this, arguments);
        }
    };

    result.implement = function (prop) {
        for (var name in prop) {
            prototype[name] = prop[name];
        }
    };
    return result;
}

cc.propertyFun = (function (name, fn, _super) {
    //trace("propertyFun is called");
    return function () {
        var tmp = this._super;

        // Add a new ._super() method that is the same method
        // but on the super-Class
        this._super = _super[name];

        // The method only need to be bound temporarily, so we
        // remove it when we're done executing
        var ret = fn.apply(this, arguments);
        this._super = tmp;
        //trace(arguments.length + arguments.callee + arguments[0]);

        return ret;
    };
});


(function () {
    initializing = false, fnTest = /\b_super\b/;
    var releaseMode = true;
    if (releaseMode) {
        console.log("release Mode");
    }

    /**
     * The base Class implementation (does nothing)
     * @class
     */
    Class = function () {
    };

    /**
     * Create a new Class that inherits from this Class
     * @param {object} prop
     * @return {function}
     */
    Class.extend = function (prop) {
        var p_super = this.prototype;

        // Instantiate a base Class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // The dummy Class constructor
        var Class = cc.getClass(prop, prototype);
        Class.id = ClassManager.getNewID();
        ClassManager[Class.id] = p_super;
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            if (releaseMode && typeof prop[name] == "function" && typeof p_super[name] == "function" && fnTest.test(prop[name])) {
                prototype[name] = ClassManager.compileSuper(prop[name], name, Class.id);
            }
            else if (typeof prop[name] == "function" && typeof p_super[name] == "function" /*&& fnTest.test(prop[name])*/) {
                prototype[name] = cc.propertyFun.call(this, name, prop[name], p_super);
            }
            else {
                prototype[name] = prop[name];
            }
        }
        prototype.__pid = Class.id;

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this Class extendable
        Class.extend = arguments.callee;

        //add implementation method
        //        Class.implement = function (prop) {
        //            for (var name in prop) {
        //                prototype[name] = prop[name];
        //            }
        //        };
        return Class;
    };
})();



exports.Class = Class
