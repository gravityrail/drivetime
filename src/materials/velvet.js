/*
 * Trying to go for a velvety look for mountains...
 */

const hmr = require('three-hmr/three-hmr')
const cache = hmr.cache(__filename)
const glslify = require('glslify')

const vertexShader = glslify('../shaders/velvet.vert')
const fragmentShader = glslify('../shaders/velvet.frag')

import THREE from 'three'

module.exports = function (opt) {
  const material = new THREE.RawShaderMaterial({
    vertexShader, fragmentShader
  })
  hmr.enable(cache, material)
  return material
}

if (module.hot) {
  module.hot.accept(err => {
    if (err) throw errr
  })
  hmr.update(cache, {
    vertexShader, fragmentShader
  })
}
