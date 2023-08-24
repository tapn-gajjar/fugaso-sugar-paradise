const gulp = require("gulp");
let /** @type {import("gulp-imagemin")} */ imagemin;
let /** @type {import("imagemin-webp")} */ webp;
const extReplace = require("gulp-ext-replace");

const startup = async () => {
    // @ts-ignore
    imagemin = (await import("gulp-imagemin")).default;
    webp = (await import("imagemin-webp")).default;
};

gulp.task("exportWebP", async () => {
    await startup();

    const src = "bin/assets/**/*.{jpg,jpeg,png}"; // Where your PNGs are coming from
    const dest = "bin/assets/"; // Where your WebPs are going

    return gulp.src(src)
        .pipe(imagemin([
            webp({
                quality: 90,
            }),
        ]))
        .pipe(extReplace(".webp"))
        .pipe(gulp.dest(dest));
});
