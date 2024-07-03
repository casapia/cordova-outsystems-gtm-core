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

  project.parseSync();

  const pbxGroupKey = project.findPBXGroupKey({ name: 'CustomTemplate' });
  if (!pbxGroupKey) {
    console.error(`******* Could not find PBXGroupKey 'CustomTemplate'`);
    return;
  }

  const resourceFile = project.addResourceFile(
    destContainerDir,
    {},
    pbxGroupKey
  );

  if (!resourceFile) {
    console.error(`******* Could not add ${destContainerDir} to the project`);
    return;
  }
  console.log(`******* Added ${destContainerDir} to the project`);

  // Add the resource file to the build target
  const target = project.getFirstTarget().uuid;
  if (!target) {
    console.error(`******* Could not find the build target`);
    return;
  }
  project.addToPbxBuildFileSection(resourceFile);
  project.addToPbxResourcesBuildPhase({ fileRef: resourceFile.fileRef, target: target });

  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
