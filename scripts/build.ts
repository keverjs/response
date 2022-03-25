import fs from 'fs/promises'
import typescript from 'rollup-plugin-typescript2'
import chalk from 'chalk'
import { rollup } from 'rollup'
import { resolve } from 'path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'


const getPackagesName = async () => {
  const pkg = await import(resolve('package.json'))
  return pkg.name
}


const cleanDir = async (dir: string) => {
  try {
    const stat = await fs.stat(dir)
    if (stat.isDirectory()) {
      await fs.rm(dir, {
        recursive: true,
      })
    }
  } catch(err) {}
}

const cleanFile = async (file: string) => {
  try {
    const stat = await fs.stat(file)
    if (stat.isFile()) {
      await fs.rm(file)
    }
  } catch(err) {}
}

const cleanOldDist = async () => {
  await cleanDir('dist')
}

const cleanOtherDts = async (packageName) => {
  const dtsPath = resolve(`dist/src`)
  await Promise.all([cleanDir(dtsPath), cleanFile(`dist/${packageName}.d.ts`)])
  
}

const pascalCase = (str) => {
  const re = /-(\w)/g
  const newStr = str.replace(re, function (match, group1) {
    return group1.toUpperCase()
  })
  return newStr.charAt(0).toUpperCase() + newStr.slice(1)
}

const formats = ['esm', 'cjs']

const generateBuildConfigs = (packageName) => {
  const formatConfigs = []
  for (let format of formats) {
    formatConfigs.push({
      packageName,
      config: {
        input: resolve(`src/index.ts`),
        output: {
          name: pascalCase(packageName),
          file: resolve(`dist/index.${format}.js`),
          inlineDynamicImports: true,
          format,
        },
        plugins: [
          typescript({
            verbosity: -1,
            tsconfig: resolve('tsconfig.json'),
            tsconfigOverride: {
              include: [`package/${packageName}/src`],
            },
          }),
        ],
        external: [],
      },
    })
  }
  return formatConfigs
}

const extractDts = () => {
  const extractorConfigPath = resolve('api-extractor.json')
  const extractorConfig =
    ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })
  return result
}

const buildEntry = async (packageConfig) => {
  try {
    const packageBundle = await rollup(packageConfig.config)
    await packageBundle.write(packageConfig.config.output)
    const extractResult = extractDts()
    // await cleanPackagesDtsDir(packageConfig.packageName)
    if (!extractResult.succeeded) {
      console.log(chalk.red(`${packageConfig.packageName} d.ts extract fail!`))
    }
    console.log(chalk.green(`${packageConfig.packageName} build successful! `))
  } catch (err) {
    console.log('err', err)
    console.log(chalk.red(`${packageConfig.packageName} build fail!`))
  }
}

const build = async (packagesConfig) => {
  for (let config of packagesConfig) {
    await buildEntry(config)
  }
}

const buildBootstrap = async () => {
  const packagesName = await getPackagesName()

  await cleanOldDist()
  const packagesBuildConfig = generateBuildConfigs(packagesName)
  await build(packagesBuildConfig)
  await cleanOtherDts(packagesName)
}

buildBootstrap().catch((err) => {
  console.log('err', err)
  process.exit(1)
})
