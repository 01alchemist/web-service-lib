import path from "path";

export function resolveTsPaths(tsConfig: any, baseDir: string) {
  const { baseUrl = ".", paths: tsPaths = {} } = tsConfig.compilerOptions;
  const resolvedTsPaths: { [key: string]: string } = {};
  Object.keys(tsPaths).forEach((pathName) => {
    const [tsPath] = tsPaths[pathName];
    let cleanPathName = pathName.replace(/\*/gi, "");
    cleanPathName =
      cleanPathName[cleanPathName.length - 1] === "/"
        ? cleanPathName.substring(0, cleanPathName.length - 1)
        : cleanPathName;
    const resolvedPath = path.resolve(
      baseDir,
      baseUrl,
      tsPath.replace(/\*/gi, "")
    );
    resolvedTsPaths[cleanPathName] = resolvedPath;
  });
  return resolvedTsPaths;
}

export function generateBuildInfo(pkg: any): BuildInfo {
  const {
    CI,
    NODE_ENV: buildEnv = "[Not available]",
    CIRCLE_BUILD_NUM = "[Not available]",
    CIRCLE_BRANCH = "[Not available]",
    CIRCLE_PR_NUMBER = "[Not available]",
    CIRCLE_WORKFLOW_ID = "[Not available]",
  } = process.env;
  const build = CIRCLE_BUILD_NUM;
  const branch = CIRCLE_BRANCH;
  const release = CIRCLE_WORKFLOW_ID;
  let version = pkg.version;
  if (CI) {
    version = `${version}-build[${CIRCLE_BUILD_NUM}]`;
    if (CIRCLE_BRANCH === "develop") {
      version = `${version} (dev)`;
    } else if (CIRCLE_BRANCH !== "master") {
      version = `${version} (pr:${CIRCLE_PR_NUMBER})`;
    }
  } else {
    version = `${version}-(local)`;
  }
  return { version, build, branch, release, buildEnv, name: pkg.name };
}

type BuildInfo = {
  name: string;
  version: string;
  build: string;
  branch: string;
  release: string;
  buildEnv: string;
};

export function injectBuildInfo(
  type: string,
  { name, version, release, buildEnv }: BuildInfo
) {
  if (type === "service") {
    return `
  process.env.APP_VERSION = "${version}";
  process.env.RELEASE     = "${release}";
  process.env.APP_NAME    = "${name}";
  process.env.BUILD_ENV   = "${buildEnv}";
  `;
  }

  return `
  global.libraries = global.libraries || {}
  global.libraries["${name}"] = { name:"${name}", version:"${version}", buildEnv:"${buildEnv}" }
  `;
}
