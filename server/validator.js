const semVer = require('semver')

function isCompatible (plugin) {
  let manifest = plugin.manifest
  try {
    // check existance and syntax validity && check compatibility of dependencies
    return checkManifest(manifest) && checkPluginCompatibility(manifest)
  } catch (e) {
    if (e && e.msg) {
      console.log(e.msg)
    } else {
      console.log(e)
    }
  }
}

/**
 * Checks and cleans the manifest based on the required and optional fields defined within the function
 * Any extra fields in the manifest are removed to prevent people from injecting things through manifests
 * Probably highly unlikely
 *
 * @param {Object} manifest
 * @return {boolean}
 */
export function checkManifest (manifest) {
  const required = ['name', 'description', 'version', 'dependencies']
  const optional = ['icon', 'author', 'repo', 'license', 'plugins']
  for (let key in manifest) {
    let index = required.indexOf(key)
    let optionalIndex = optional.indexOf(key)
    if (index === -1 && optionalIndex === -1) {
      delete manifest[key]
    } else {
      if (index !== -1) {
        required.splice(index, 1)
      }
      if (optionalIndex !== -1) {
        optional.splice(optionalIndex, 1)
      }
    }
  }
  if (required.length !== 0) {
    throw new Error(`Plugin ${manifest.name} missing required field (${required[0]}) from manifest file`)
  }
  return true
}

function checkPluginCompatibility (manifest) {
  return checkCoreDependencies(manifest.dependencies.core, manifest.name) &&
    checkPluginsDependencies(manifest.dependencies.plugins)
}

function checkCoreDependencies (core, name) {
  const pitrolVer = require('../package.json').version
  const nodeVer = process.version
  if (!core) {
    throw new Error(`Plugin ${name} missing dependencies core field from manifest file`)
  }
  if (!semVer.satisfies(pitrolVer, core.pitrol)) {
    console.warn(`Plugin ${name} expects version: ${core.pitrol}, pitrol version: ${pitrolVer}`)
    return false
  }
  // NOTE: we can get alot more specific including A B B+
  // info source http://elinux.org/RPi_HardwareHistory
  const piVers = ['zero', '2', '3']
  if (!Array.isArray(core.hardware)) {
    throw new Error(`Plugin ${name} hardware list is not an Array`)
  }
  if (core.hardware.length === 0) {
    throw new Error(`Plugin ${name} hardware list does not contain any versions`)
  }
  core.hardware.forEach((hardware) => {
    if (piVers.indexOf(hardware) === -1) {
      throw new Error(`Plugin ${name} hardware version: ${hardware} is invalid`)
    }
  })
  // TODO get pi version and check with actual hardware rather than just sudo checking for valid hardware name
  if (!semVer.satisfies(nodeVer, core.node)) {
    console.warn(`Plugin ${name} expects version: ${core.node}, node version: ${nodeVer}`)
    return false
  }
  return true
}

function checkPluginsDependencies (plugins) {
  // TODO check plugins[i]
  return true
}

module.exports = {isCompatible, checkManifest, checkCoreDependencies}
