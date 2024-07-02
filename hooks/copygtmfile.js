#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");
const plist = require('plist');

const destFileName = "GTM-TMTPTRLZ_v2.json";

module.exports = function (context) {
  const rootdir = context.opts.projectRoot;
  const pluginDir = context.opts.plugin.dir;
  const srcFile = path.join(
    pluginDir,
    "src",
    "ios",
    "container",
    destFileName
  );
  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const destContainerDir = path.join(iosPlatformDir, "container");
  const destFile = path.join(destContainerDir, destFileName);

  console.log(`******* Looking for source file: ${srcFile}`);

  if (fs.existsSync(srcFile)) {
    console.log(`******* Source file found: ${srcFile}`);

    if (!fs.existsSync(destContainerDir)) {
      fs.mkdirSync(destContainerDir, { recursive: true });
      console.log(`******* Created destination directory: ${destContainerDir}`);
    }

    fs.copyFileSync(srcFile, destFile);
    console.log(`******* Copied ${srcFile} to ${destFile}`);
  } else {
    console.error(`******* Source file not found: ${srcFile}`);
    return;
  }

  const platformRoot = path.join(context.opts.projectRoot, 'platforms/ios');
  // Read the iOS project's config.xml to get the project name
  const configXmlPath = path.join(context.opts.projectRoot, 'config.xml');
  const configXml = fs.readFileSync(configXmlPath, 'utf8');
  const projectNameMatch = configXml.match(/<name>([^<]*)<\/name>/);

  if (!projectNameMatch) {
    console.error('Could not find project name in config.xml');
    return;
  }

  // Read the iOS project file
  const projectName = projectNameMatch[1].trim();
  const projectPath = path.join(platformRoot, `${projectName}.xcodeproj`, 'project.pbxproj');
  console.log(`******* Reading project file: ${projectPath}`);

  // Add the file to the Xcode project
  const project = xcode.project(projectPath);
  project.parseSync();
  console.log(`******* Parsed project file: ${projectPath}`);

  const fileToAdd = path.join('container', destFileName);
  if (project.hasFile(fileToAdd)) {
    console.log(`******* File ${fileToAdd} already exists in the project`);
    return;
  }

  // Determine the group dynamically or create a new one
  const groupName = 'Container';
  let group = project.pbxGroupByName(groupName);
  console.log(`******* Group: ${group}`);

  if (!group) {
    // Create the group if it doesn't exist
    group = project.addPbxGroup([], groupName, groupName);
    project.addToPbxGroup(group, project.getFirstProject().firstProject.mainGroup);
    console.log(`******* Created group: ${groupName}`);
  }

  const fileOptions = {
    customFramework: true,
    sourceTree: 'SOURCE_ROOT'
  };

  project.addSourceFile(fileToAdd, fileOptions, group.uuid);
  console.log(`******* Added ${fileToAdd} to the project`);

  // Save the project file
  fs.writeFileSync(projectPath, project.writeSync());
  console.log(`******* Saved the project file: ${projectPath}`);
};
