const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const cleanCSS = require("gulp-clean-css");
const htmlmin = require("gulp-htmlmin");

gulp.task('js_handler', () => {
    return gulp.src('./src/js/*.js')
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('css_handler', () => {
    return gulp.src('./src/css/*.css')
    .pipe(concat('bundle.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('html_handler', () => {
    return gulp.src("./src/*.html")
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: false
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['js_handler', 'css_handler', 'html_handler'])