import chalk from 'chalk'
import { resolve } from 'path'
import { build as tsupBuild, Options } from 'tsup'


const getPackageName = async () => {
  const pkg = await import(resolve('package.json'))
  return pkg.name
}

const generateConfig = (name: string): Options => {
  return {
    name,
    target: 'node14',
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    replaceNodeEnv: true,
    splitting: true,
    clean: true,
    shims: false,
    tsconfig: resolve('tsconfig.json'),
    external: []
  }
}

const build = async (config: Options) => {
  try {
    await tsupBuild(config)
  } catch (err) {
    console.log('err', err)
    console.log(chalk.red(`${config.name} build fail!`))
  }
}

const buildBootstrap = async () => {
  const packageName = await getPackageName()
  const packagesBuildConfig = generateConfig(packageName)
  await build(packagesBuildConfig)
}

buildBootstrap().catch((err) => {
  console.log('err', err)
  process.exit(1)
})
