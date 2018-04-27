/*
 *
 *  Minetem compiler
 *  Repository: github.com/MinimineLP/Minetem
 *  Licensed under MIT, see LICENSE od LICENSE.md file
 *  Copyright (c) Minimine 2018
 *
 */

const fs = require("fs");
const path = require("path");
const data = require("./data.js");
const util = require("./util.js");

module.exports = {
  compile: compile
}

function compile(json, dir) {

  if(json.items) {
    json.items.forEach(function(value) {

      if(!value.id)console.throwException("CompilingError: Need id for every block");

      if(!value.parent)console.throwException("CompilingError: Can't create a block without a parent");
      if(!util.damage[value.parent])console.throwException(`CompilingError: Parent ${parent} is invalid`)

      if(!Number.isInteger(value.id))console.throwException(`CompilingError: The id must be a positive number between 1 and ${util.damage[value.parent]}`);
      if(parseInt(value.id)<1 || parseInt(value.id)>util.damage[value.parent])console.throwException(`CompilingError: The id must be a positive number between 1 and ${util.damage[value.parent]}`);

      if(!value.texture)console.throwException("CompilingError: Can't create a block without a texture");

      var json = util.textureFileLayout.onelayer.replaceAll('%path%', value.texture);

      var path = dir+`\\assets\\minecraft\\models\\custom\\${value.parent}\\${value.id}.json`;

      writeFile(path, json);

      // DEBUG:
      console.debug(`Compiled item with id ${value.id} and parent ${value.parent} into file `+fixBackslash(path));

      data.ids[value.parent].push(value.id);
    });
  }
}

function fixBackslash(str) {
  return str.replaceAll('\\\\', '/')
}


function writeFile(file, content) {
  if(fs.existsSync(file)) console.throwException("CompilingError: Can't use that id, please try another, it is propably used for another texture.");

  file = file.replaceAll("\\\\", "/");

  var parts = file.split("/");
  for(var i=1;i<parts.length;i++){

    var path = "";

    for(var c=0;c<i;c++)
      path += parts[c]+"/";

    if(!fs.existsSync(path))fs.mkdirSync(path);

  }

  fs.writeFileSync(file, content);
}
