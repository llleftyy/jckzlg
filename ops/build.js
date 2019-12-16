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

const INDEX_TEMPLATE = "templates/index.html";
const INDEX = "src/index.html";
const ARTICLES = "articles";

const main = async () => {
  const articleNames = await readdir(ARTICLES)
  const articles = await Promise.all(articleNames.map(name => {
    return readfile(`${ARTICLES}/${name}`).then(article => [name, article]);
  }));

  let template = String(await readfile(INDEX_TEMPLATE));
  articles.forEach(([name, article]) => {
    const includeDirective = `{{include:articles/${name}}}`;
    template = template.replace(includeDirective, article);
  });

  writefile(INDEX, template);
};

main();
