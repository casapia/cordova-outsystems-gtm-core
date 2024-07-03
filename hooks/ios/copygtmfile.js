#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");
const { ConfigParser } = require("cordova-common");

const gtmContainerName = "GTM-TMTPTRLZ_v2.json";

module.exports = function (context) {
  function getAppName(context) {
    const config = new ConfigParser(path.join(context.opts.projectRoot, "config.xml"));
    return config.name();
  }

  const projectName = getAppName(context);
  console.log(`******* Project name: ${projectName}`);
  const rootdir = context.opts.projectRoot;
  console.log(`******* Project root: ${rootdir}`);
  const pluginDir = context.opts.plugin.dir;
  console.log(`******* Plugin directory: ${pluginDir}`);
  const srcFile = path.join(pluginDir, "src", "ios", "container", gtmContainerName);
  console.log(`******* Looking for source file: ${srcFile}`);
  if (!fs.existsSync(srcFile)) {
    console.error(`******* Source file not found: ${srcFile}`);
    return;
  }

  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const destContainerDir = path.join(iosPlatformDir, projectName, "container");
  const destFile = path.join(destContainerDir, gtmContainerName);

  if (!fs.existsSync(destContainerDir)) {
    fs.mkdirSync(destContainerDir, { recursive: true });
    console.log(`******* Created destination directory: ${destContainerDir}`);
  }

  fs.copyFileSync(srcFile, destFile);
  console.log(`******* Copied ${srcFile} to ${destFile}`);

  const projectPath = path.join(iosPlatformDir, `${projectName}.xcodeproj`, "project.pbxproj");
  console.log(`******* Reading project file: ${projectPath}`);

  const project = xcode.project(projectPath);
  try {
    project.parseSync();
    console.log(`******* Parsed project file: ${projectPath}`);
  } catch (error) {
    console.error(`******* Failed to parse project file: ${error.message}`);
    return;
  }

  let pbxGroupKey = project.findPBXGroupKey({ name: 'container' });
  if (!pbxGroupKey) {
    pbxGroupKey = project.pbxCreateGroup('container', '""', 'SOURCE_ROOT');
    project.addToPbxGroup(pbxGroupKey, project.findPBXGroupKey({ name: 'CustomTemplate' }));
    console.log('******* Created PBXGroupKey: ', pbxGroupKey);
  } else {
    console.log('******* Found PBXGroupKey: ', pbxGroupKey);
  }

  const resourceFile = project.addResourceFile(destFile, {}, pbxGroupKey);
  if (!resourceFile) {
    console.error(`******* Could not add ${destFile} to the project`);
    return;
  }
  console.log(`******* Added ${destFile} to the project`);

  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
