#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

const gtmContainerName = "GTM-TMTPTRLZ_v2.json";

module.exports = function (context) {
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
  const destContainerDir = path.join(iosPlatformDir, "container");
  const destFile = path.join(destContainerDir, gtmContainerName);

  if (!fs.existsSync(destContainerDir)) {
    fs.mkdirSync(destContainerDir, { recursive: true });
    console.log(`******* Created destination directory: ${destContainerDir}`);
  }

  fs.copyFileSync(srcFile, destFile);
  console.log(`******* Copied ${srcFile} to ${destFile}`);

  // Add the file to the Xcode project
  const configXmlPath = path.join(rootdir, "config.xml");
  const configXml = fs.readFileSync(configXmlPath, "utf8");
  const projectNameMatch = configXml.match(/<name>([^<]*)<\/name>/);

  if (!projectNameMatch) {
    console.error("Could not find project name in config.xml");
    return;
  }

  const projectName = projectNameMatch[1].trim();
  console.log(`******* Found project name: ${projectName}`);
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

  // const groupName = "Container2";
  // let group = project.pbxGroupByName(groupName);
  // console.log("******* Group: ", group);

  // if (!group) {
  //   // Create the group if it doesn't exist
  //   group = project.addPbxGroup([], groupName, groupName.toLowerCase());
  //   project.addToPbxGroup(group, project.getFirstProject().firstProject.mainGroup);
  //   console.log(`******* Created group: ${groupName}`);
  // }

  // const fileOptions = {
  //   customFramework: true,
  //   sourceTree: "SOURCE_ROOT"
  // };

  // project.addSourceFile(destFile, fileOptions, group.uuid);
  // console.log(`******* Added ${srcFile} to the project`);

  // Save the project file
  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
