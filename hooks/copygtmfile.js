#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

module.exports = function (context) {
  const rootdir = context.opts.projectRoot;
  const srcContainerDir = path.join(rootdir, "src", "ios", "container");
  const srcFile = path.join(srcContainerDir, "GTM-TMTPTRLZ_v2.json");
  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const destContainerDir = path.join(iosPlatformDir, "container");
  const destFile = path.join(destContainerDir, "GTM-TMTPTRLZ_v2.json");

  if (fs.existsSync(srcFile)) {
    if (!fs.existsSync(destContainerDir)) {
      fs.mkdirSync(destContainerDir, { recursive: true });
    }

    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${srcFile} to ${destFile}`);
  } else {
    console.error(`Source file not found: ${srcFile}`);
  }
};
