#!/usr/local/bin/node
/***************************************************************************************************
 * Description
 *  1. reads articles/
 *  2. reads templates/index.html
 *  3. injects every article found in step 1 wherever its corresponding include directive is in
 *     the template read in step 2
 *  4. writes the resulting html file from step 3 to src/index.html
 **************************************************************************************************/
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);
const copyfile = util.promisify(fs.copyFile);
const exec = util.promisify(require('child_process').exec);

const INDEX_TEMPLATE = "index.html.template";
const INDEX_HTML = "public/index.html";
const PUBLIC = "public";
const MANIFEST = require("./manifest.json");
const ARTICLE_TEMPLATE = "article.html.template";

const getContent = async (inFile, type) => {
  const { stdout, stderr } =  await exec(
    `pandoc -f markdown -t html ${inFile}`
  );
  return stdout;
}

const getCompiledIncludes = async () => {
  const includes = {};
  for (let i = 0; i < MANIFEST.length; i++) {
    const { params, content_path, template_path, include_path } = MANIFEST[i];
    const { title, type, post_date, display_date } = params;
    let template = String(await readfile(template_path));
    Object.entries({ content_path, ...params }).forEach(([key, value]) => {
      const search = new RegExp(`{{${key}}}`, "g");
      template = template.replace(search, value);
    });
    const content = await getContent(content_path, type);
    template = template.replace(/{{content}}/g, content);
    includes[include_path] = template;
  }
  return includes;
}

const buildTemplate = (template, includes) => {
  let built = template;
  Object.entries(includes).forEach(([includePath, include]) => {
    built = built.replace(`{{include:${includePath}}}`, include);
  });

  return built;
}

const main = async () => {
  const includes = await getCompiledIncludes();

  const index = String(await readfile(INDEX_TEMPLATE));
  const indexHTML = buildTemplate(index, includes);

  writefile(INDEX_HTML, indexHTML);
  copyfile("moustache.png", "public/moustache.png");
  copyfile("tophat.png", "public/tophat.png");
  copyfile("smiley.png", "public/smiley.png");
  copyfile("glasses.png", "public/glasses.png");
  copyfile("email.png", "public/email.png");
  copyfile("twitter.png", "public/twitter.png");
  copyfile("rss.png", "public/rss.png");
  copyfile("index.css", "public/index.css");
};

main();
