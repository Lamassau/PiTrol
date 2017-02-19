const checkManifest = require('./validator').checkManifest
const checkCoreDependencies = require('./validator').checkCoreDependencies

describe('checkManifest()', function () {
  let manifest

  beforeEach(function () {
    manifest = {
      name: 'x',
      description: 'y',
      version: '1.0.0',
      icon: '',
      author: 'ghost',
      repo: '',
      license: '',
      dependencies: {
        core: {
          pitrol: '1.0.0',
          hardware: ['zero', '2', '3'],
          node: '^6.0.0'
        },
        plugins: {}
      }
    }
  })

  it('should error if missing required field', function () {
    delete manifest.version
    expect(function () {
      checkManifest(manifest)
    }).toThrow(new Error(`Plugin ${manifest.name} missing required field (version) from manifest file`))
  })

  it('should remove extra fields', function () {
    manifest.extra = 'cake'
    checkManifest(manifest)
    expect(manifest.extra).toEqual(undefined)
  })
})

describe('checkCoreDependencies()', function () {
  let core
  let name = 'test'

  beforeEach(function () {
    core = {
      pitrol: '1.0.0',
      hardware: ['zero', '2', '3'],
      node: '>6.0.0'
    }
  })
  it('should return true if core dependencies are correct', function () {
    expect(checkCoreDependencies(core, name)).toEqual(true)
  })
  it('should throw if missing core field', function () {
    expect(function () {
      checkCoreDependencies(undefined, name)
    }).toThrow(`Plugin ${name} missing dependencies core field from manifest file`)
  })
  it('should return false if pitrol version is not statisfied', function () {
    core.pitrol = '>99.0.0'
    expect(checkCoreDependencies(core, name)).toEqual(false)
  })
  it('should throw if hardware list is not an array', function () {
    core.hardware = {}
    expect(function () {
      checkCoreDependencies(core, name)
    }).toThrow(`Plugin ${name} hardware list is not an Array`)
  })
  it('should throw if hardware list is an empty array', function () {
    core.hardware = []
    expect(function () {
      checkCoreDependencies(core, name)
    }).toThrow(`Plugin ${name} hardware list does not contain any versions`)
  })
  it('should throw if hardware list contains an invalid hardware', function () {
    const hardware = 'cake'
    core.hardware.push(hardware)
    expect(function () {
      checkCoreDependencies(core, name)
    }).toThrow(`Plugin ${name} hardware version: ${hardware} is invalid`)
  })
  it('should return false if node version isn\'t compatible', function () {
    core.node = '<1.0.0'
    expect(checkCoreDependencies(core, name)).toEqual(false)
  })
})
