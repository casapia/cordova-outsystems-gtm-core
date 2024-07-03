#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

const gtmContainerName = "GTM-TMTPTRLZ_v2.json";

module.exports = function (context) {
  function getAppName(context) {
    const ConfigParser = context.requireCordovaModule("cordova-lib").configparser;
    var config = new ConfigParser("config.xml");
    return config.name();
  }

  const projectName = getAppName(context);
  const rootdir = context.opts.projectRoot;
  const pluginDir = context.opts.plugin.dir;
  const srcFile = path.join(
    pluginDir,
    "src",
    "ios",
    "container",
    gtmContainerName
  );
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

  // Add the file to the Xcode project
  // const configXmlPath = path.join(rootdir, "config.xml");
  // const configXml = fs.readFileSync(configXmlPath, "utf8");
  // const projectNameMatch = configXml.match(/<name>([^<]*)<\/name>/);

  // if (!projectNameMatch) {
  //   console.error("Could not find project name in config.xml");
  //   return;
  // }

  // const projectName = projectNameMatch[1].trim();
  // console.log(`******* Found project name: ${projectName}`);
  const projectPath = path.join(iosPlatformDir, `${projectName}.xcodeproj`, "project.pbxproj");
  console.log(`******* Reading project file: ${projectPath}`);

  const project = xcode.project(projectPath);
  project.parseSync();
  console.log(`******* Parsed project file: ${projectPath}`);

  const pbxGroupKey = project.findPBXGroupKey({ name: 'CustomTemplate' });
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

  // Save the project file
  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
