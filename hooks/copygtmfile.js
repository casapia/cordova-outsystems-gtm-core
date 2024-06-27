#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

module.exports = function (context) {
  const rootdir = context.opts.projectRoot;
  const iosPlatformDir = path.join(rootdir, "platforms", "ios");
  const containerSrc = path.join(
    rootdir,
    "src",
    "ios",
    "container",
    "GTM-TMTPTRLZ_v2.json"
  );
  const containerDest = path.join(
    iosPlatformDir,
    "container",
    "GTM-TMTPTRLZ_v2.json"
  );

  if (fs.existsSync(iosPlatformDir)) {
    fs.mkdirSync(path.dirname(containerDest), { recursive: true });

    fs.copyFileSync(containerSrc, containerDest);
    console.log(`Copied GTM-XXXXXX.json to ${containerDest}`);
  } else {
    console.log(
      "iOS platform not found. Ensure you have added the iOS platform and built the project."
    );
  }
};
