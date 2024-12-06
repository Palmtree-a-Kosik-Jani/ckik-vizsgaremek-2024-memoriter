
const fs = require('fs');

const uglifyJS = require('uglify-js');

const htmlMinifier = require('html-minifier');

const CleanCSS = require('clean-css');

function minify(){
    const sourceDir = '../public';

    const outputDir = '../public_minify'; 

    const minifyJavaScript = (file) => {
      const sourceCode = fs.readFileSync(`${sourceDir}/${file}`, 'utf8');
      const minifiedCode = uglifyJS.minify(sourceCode).code;
      fs.writeFileSync(`${outputDir}/${file}`, minifiedCode, 'utf8');
      console.log(`Minified ${file}`);
    };

    const minifyHtml = (file) => {
      const sourceCode = fs.readFileSync(`${sourceDir}/${file}`, 'utf8');

      const minifiedCode = htmlMinifier.minify(sourceCode, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      });

      fs.writeFileSync(`${outputDir}/${file}`, minifiedCode, 'utf8');

      console.log(`Minified ${file}`);
    };

    const minifyCss = (file) => {
      const sourceCode = fs.readFileSync(`${sourceDir}/${file}`, 'utf8');
      
      if(sourceCode.includes(".mCSB_scrollTools")){
        fs.writeFileSync(`${outputDir}/${file}`, sourceCode, 'utf8');
        console.log(file+" kihagyva!")
      }else{
        const minifiedCode = new CleanCSS().minify(sourceCode).styles;
        fs.writeFileSync(`${outputDir}/${file}`, minifiedCode, 'utf8');
      }

      console.log(`Minified ${file}`);
    };

    const allFiles = fs.readdirSync(sourceDir);
    
    allFiles.forEach(file => {
      if (file.endsWith('.js')) {
        minifyJavaScript(file);
      } else if (file.endsWith('.html')) {
        minifyHtml(file);
      } else if (file.endsWith('.css')) {
        minifyCss(file);
      }
    });
    console.log('Minification complete.');
}

module.exports = minify;