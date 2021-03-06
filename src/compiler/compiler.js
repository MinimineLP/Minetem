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

const overwriter = require("./overwriter.js");
const blocks = require("./blocks.js");
const items = require("./items.js");
const guis = require("./guis.js");
const data = require("./data.js");
const util = require("./util.js");

module.exports = {
  compile: compile
}

createData();

function compile(src, dest, functiondir) {
  if(!fs.existsSync(src)) console.throwException("Your compile-source must be an existing file!");
  if(!fs.existsSync(dest)) console.throwException("Your compile-destribunation must be an existing folder!");
  if(fs.lstatSync(src).isDirectory()) console.throwException("Source must be a file, not a Directory!");

  // DEBUG:
  console.debug(`Compiling "${src}" to "${dest}..."`);

  var json = JSON.parse(fs.readFileSync(src));
  var name = path.basename(src).slice(0,path.basename(src).lastIndexOf("."));
  var dir = dest + "\\" + name;

  try {
    if(fs.existsSync(dir+"\\assets\\minecraft\\models\\custom"))deleteRecursive(dir+"\\assets\\minecraft\\models\\custom");
  } catch (err) {
    console.throwException(`Could not delete old files, is the dir ${dir.replaceAll('\\\\', '/')} opened?`);
  }

  createDirs(dir);


  if(!fs.existsSync(dir+"\\pack.mcmeta"))fs.writeFileSync(dir+"\\pack.mcmeta",
  `{
    "pack": {
      "pack_format": 4,
      "description": "§3${name}\\n§bCompiled with Minetem compiler§r"
    }
  }`);

  // DEBUG:
  console.debug(`Created file: ${fixBackslash(dir+"\\pack.mcmeta")}`);



  if(functiondir != undefined) {
    functiondir += `/${name}`;

    if(!fs.existsSync(functiondir))writeFile("functiondir",
    `{
      "pack": {
        "pack_format": 0,
        "description": "Examples generated with Minetem compiler\\nhttps://github.com/MinimineLP/minetem/"
      }
    }`);

    functiondir += `/data/${name.toLowerCase()}`;

    deleteIfExists(`${functiondir}/functions/blocks`);
    deleteIfExists(`${functiondir}/functions/items`);
    deleteIfExists(`${functiondir}/functions/guis`);
    deleteIfExists(`${functiondir}/scripts/blocks`);
    deleteIfExists(`${functiondir}/scripts/items`);
    deleteIfExists(`${functiondir}/scripts/guis`);
  }


  // Compile Items
  blocks.compile(json, dir, functiondir);
  items.compile(json, dir, functiondir);
  guis.compile(json, dir, functiondir);

  overwriter.generateOverwrites(dir);

  console.log("Compiling successfully finished!");
}

function deleteRecursive(path) {
  if(fs.lstatSync(path).isDirectory()) {
    var files = fs.readdirSync(path);
    for(let file of files) {
      deleteRecursive(`${path}\\${file}`);
    }
    fs.rmdirSync(path);

    // DEBUG:
    console.debug(`deleted dir: ${fixBackslash(path)}`);
  }else{
    fs.unlinkSync(path);

    // DEBUG:
    console.debug(`deleted file: ${fixBackslash(path)}`);
  }
}
function writeFile(file, content) {
  if(fs.existsSync(file)) console.throwException("CompilingError: Can't use that id, please try another, it is propably used for another texture.");

  file = file.replaceAll("\\\\", "/");

  var parts = file.split("/");
  for(var i=1;i<parts.length;i++){

    var path = "";

    for(var c=0;c<i;c++)
      path += parts[c]+"/";

    if(!fs.existsSync(path)) createDir(path);

  }

  fs.writeFileSync(file, content);
}

function fixBackslash(str) {
  return str.replaceAll('\\\\', '/')
}

function createDir(dir) {
  fs.mkdirSync(dir);

  // DEBUG:
  console.debug(`Created dir: ${fixBackslash(dir)}`);
}

function createData() {
  util.damage.forEach(function(key, value){
    data.ids[key] = [];
  });
}

function createDirIfNotExists(path) {
  if(!fs.existsSync(path))createDir(path);
}

function createDirs(dir) {
  createDirIfNotExists(dir);
  createDirIfNotExists(dir+"\\assets");
  createDirIfNotExists(dir+"\\assets\\minecraft");
  createDirIfNotExists(dir+"\\assets\\minecraft\\textures");
  createDirIfNotExists(dir+"\\assets\\minecraft\\models");
  createDirIfNotExists(dir+"\\assets\\minecraft\\models\\item");
  createDir(dir+"\\assets\\minecraft\\models\\custom");
}

function deleteIfExists(path) {
  if(fs.existsSync(path))deleteRecursive(path);
}
