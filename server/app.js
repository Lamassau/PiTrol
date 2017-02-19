const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const plugins = require('../plugins')
const semVer = require('semver')

const app = express()

// Middleware Settings
app.use(cors())
app.use(express.static(path.resolve(__dirname, '..', 'build')))
app.use('/public', express.static(path.resolve(__dirname, '..', 'public')))
app.use(morgan('combined'))

// Allowed HTTP methods
const METHODS = {
  'GET': app.get.bind(app),
  'POST': app.post.bind(app),
  'PATCH': app.patch.bind(app),
  'DELETE': app.delete.bind(app)
}

// Main UI Page Rendered
app.get('/', (req, res) => res.status(200).render('index.html'))

// Plugin Handler
for (var i = 0; i < plugins.length; i++) {
  /* Each plugin is expected to have a name and a reference to a list of features.
     We iterate through this list and handle each feature seperately and according
     to its specifications.
  */
  const plugin = plugins[i]
  const plugingRef = plugin.ref
  if (isCompatible(plugin.ref)) {
    const pluginFeatures = plugingRef.features
    handleFeatures(pluginFeatures, plugin)
  }
}

function handleFeatures (pluginFeatures, plugin) {
  for (var j = 0; j < pluginFeatures.length; j++) {
    const pluginFeature = pluginFeatures[j]
    const pluginFeatureName = pluginFeature.name
    const pluginFeaturesMethods = pluginFeature.methods
    const pluginFeatureRef = pluginFeature.ref
    for (var k = 0; k < pluginFeaturesMethods.length; k++) {
      const pluginFeaturesMethod = pluginFeaturesMethods[k].toUpperCase()
      if (METHODS[pluginFeaturesMethod] === undefined) {
        console.error(`${pluginFeaturesMethod} is invalid on upsupported request. Skipping this feature`)
      } else {
        const subAPIURL = `/API/${plugin.name}/${pluginFeatureName}`
        console.log(`Serving ${pluginFeaturesMethod} @ ${subAPIURL}`)
        METHODS[pluginFeaturesMethod](subAPIURL, pluginFeatureRef)
      }
    }
  }
}

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
function checkManifest (manifest) {
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
module.exports = app
