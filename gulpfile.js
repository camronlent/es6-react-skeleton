const gulp = require("gulp");
const util = require("gulp-util");
const browserify = require("browserify");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");

const SourceStream = require("vinyl-source-stream");
const SourceBuffer = require("vinyl-buffer");

let jsEntryPoint = "src/code/index.js";
let jsWatch = "src/code/**/*.js";
let sassWatch = "src/style/**/*.scss";

let sassOut = "build/css";

let vendorDir = "build/js";
let vendorName = "vendor.min.js";

let bundleDir = "build/js";
let bundleName = "bundle.min.js";

function sourceBundle() {
    let source = browserify({"entries": jsEntryPoint, "debug": true});
    source.external(["react", "react-dom", "whatwg-fetch"]);
    return doBundle(source, bundleName, bundleDir);
}

function libBundle() {
    let lib = browserify({ "require": ["react", "react-dom", "whatwg-fetch"], "debug": true});
    return doBundle(lib, vendorName, vendorDir);
}

function doBundle(bundle, file, outDir) {
    return bundle
        .transform("babelify", {"presets": ["es2015", "stage-1", "react"]})
        .bundle().on("error", logError)
        .pipe(SourceStream(file))
        .pipe(SourceBuffer())
        .pipe(uglify())
        .pipe(gulp.dest(outDir));
}

gulp.task("scripts", function() {
    return sourceBundle();
});

gulp.task("scripts-vendors", function() {
    return libBundle();
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
    gulp.watch(cssWatch, ["styles"]).on("change", logEvent).on("error", util.log);
});

function logError(error) {
    util.log(`error: ${ error.message }`);
    this.emit('end');
}

function logEvent(event) {
    util.log(`file: '${event.path}' event: '${event.type}', running tasks...`);
}
