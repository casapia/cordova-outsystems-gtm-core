#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const xcode = require("xcode");
const { ConfigParser } = require("cordova-common");

module.exports = function (context) {
  const config = new ConfigParser(
    path.join(context.opts.projectRoot, "config.xml")
  );

  const gtmContainerName = config.getPlatformPreference(
    "GTM_CONTAINER_NAME",
    "ios"
  );
  console.log(`******* GTM container name: ${gtmContainerName}`);
  if (!gtmContainerName) {
    console.error("******* GTM container name not found in config.xml");
    return;
  }
  
  const projectName = config.name();
  console.log(`******* Project name: ${projectName}`);
  const rootdir = context.opts.projectRoot;
  console.log(`******* Project root: ${rootdir}`);

  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const wwwPath = path.join(iosPlatformDir, "www");
  const srcFile = path.join(wwwPath, gtmContainerName);
  console.log(`******* Looking for source file: ${srcFile}`);
  if (!fs.existsSync(srcFile)) {
    console.error(`******* Source file not found: ${srcFile}`);
    return;
  }
  const destContainerDir = path.join(iosPlatformDir, projectName, "container");
  const destFile = path.join(destContainerDir, gtmContainerName);
  if (!fs.existsSync(destContainerDir)) {
    fs.mkdirSync(destContainerDir, { recursive: true });
    console.log(`******* Created destination directory: ${destContainerDir}`);
  }

  fs.copyFileSync(srcFile, destFile);
  console.log(`******* Copied ${srcFile} to ${destFile}`);

  const xcodeprojPath = path.join(iosPlatformDir, `${projectName}.xcodeproj`);
  console.log(`******* Checking for Xcode project at: ${xcodeprojPath}`);
  if (!fs.existsSync(xcodeprojPath)) {
    console.error(`******* Xcode project not found at: ${xcodeprojPath}`);
    return;
  }

  const projectPath = path.join(xcodeprojPath, "project.pbxproj");
  console.log(`******* Reading project file: ${projectPath}`);
  if (!fs.existsSync(projectPath)) {
    console.error(`******* Project file not found: ${projectPath}`);
    return;
  }

  const project = xcode.project(projectPath);

  try {
    project.parseSync();
    console.log(`******* Parsed project file: ${projectPath}`);
  } catch (error) {
    console.error(`******* Failed to parse project file: ${error.message}`);
    return;
  }

  let containerGroupKey = project.getFirstProject().firstProject.mainGroup;
  if (!containerGroupKey) {
    console.error(`******* Could not find the container group in the project`);
    return;
  }
  console.log(
    `******* Found the container group in the project: ${containerGroupKey}`
  );

  const resourceFile = project.addResourceFile(
    destContainerDir,
    {},
    containerGroupKey
  );
  if (!resourceFile) {
    console.error(`******* Could not add ${destContainerDir} to the project`);
    return;
  }
  console.log(`******* Added ${destContainerDir} to the project`);

  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
