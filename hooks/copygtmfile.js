#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

module.exports = function (context) {
  const rootdir = context.opts.projectRoot;
  const pluginDir = context.opts.plugin.dir;
  const srcFile = path.join(
    pluginDir,
    "src",
    "ios",
    "container",
    "GTM-TMTPTRLZ_v2.json"
  );
  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const destContainerDir = path.join(iosPlatformDir, "container");
  const destFile = path.join(destContainerDir, "GTM-TMTPTRLZ_v2.json");

  console.log(`Looking for source file: ${srcFile}`);

  if (fs.existsSync(srcFile)) {
    console.log(`Source file found: ${srcFile}`);

    if (!fs.existsSync(destContainerDir)) {
      fs.mkdirSync(destContainerDir, { recursive: true });
      console.log(`Created destination directory: ${destContainerDir}`);
    }

    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${srcFile} to ${destFile}`);
  } else {
    console.error(`Source file not found: ${srcFile}`);
  }
};
