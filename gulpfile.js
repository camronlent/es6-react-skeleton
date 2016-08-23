const gulp = require("gulp");
const util = require("gulp-util");
const browserify = require("browserify");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const SourceStream = require("vinyl-source-stream");
const SourceBuffer = require("vinyl-buffer");

/** begin: config **/

let debug = true;

let jsEntryPoint = "src/code/index.js";
let jsWatch = "src/code/**/*.js";
let sassWatch = "src/style/**/*.scss";

let sassOut = "build/css";

let vendorOut = "build/js";
let vendorName = "vendor.min.js";

let sourceOut = "build/js";
let sourceName = "bundle.min.js";

/** end: config **/

function sourceBundle(debug) {
    let source = browserify({"entries": jsEntryPoint, "debug": debug});
    source.external(["react", "react-dom", "whatwg-fetch"]);
    return doBundle(debug, source, sourceOut, sourceName);
}

function vendorBundle(debug) {
    let vendor = browserify({ "require": ["react", "react-dom", "whatwg-fetch"], "debug": debug});
    return doBundle(debug, vendor, vendorOut, vendorName);
}

function doBundle(debug, bundle, out, file) {
    let bundler = debug ? doBundleDebug : doBundleRelease;
    return bundler(bundle, file)
        .pipe(gulp.dest(out));
}

function doBundleDebug(bundle, file) {
    return bundler(bundle, file);
}

function doBundleRelease(bundle, file) {
    return bundler(bundle, file)
        .pipe(SourceBuffer())
        .pipe(uglify());
}

function bundler(bundle, file) {
    return bundle
        .transform("babelify", {"presets": ["es2015", "stage-1", "react"]})
        .bundle().on("error", logError)
        .pipe(SourceStream(file));
}

gulp.task("scripts", function() {
    return sourceBundle(debug);
});

gulp.task("scripts-vendors", function() {
    return vendorBundle(debug);
});

gulp.task("styles", function() {
    let sassOptions = {};
    return gulp.src(sassWatch)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on("error", sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sassOut));
});

gulp.task("build", ["scripts-vendors", "scripts", "styles"]);

gulp.task("default", ["build"]);

gulp.task("watch", ["build"], function() {
    gulp.watch(jsWatch, ["scripts"]).on("change", logEvent).on("error", util.log);
    gulp.watch(sassWatch, ["styles"]).on("change", logEvent).on("error", util.log);
});

function logError(error) {
    util.log(`error: ${ error.message }`);
    this.emit('end');
}

function logEvent(event) {
    util.log(`file: '${event.path}' event: '${event.type}', running tasks...`);
}
