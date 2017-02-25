const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const plugins = require('../plugins')
const isCompatible = require('./validator').isCompatible

const app = express()

// Middleware Settings
app.use(cors())
app.use(express.static(path.resolve(__dirname, '..', 'build')))
app.use('/public', express.static(path.resolve(__dirname, '..', 'public')))
app.use(morgan('dev'))

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

module.exports = {app}
