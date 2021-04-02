import * as THREE from 'three'
import MyParticleSystem from './MyParticleSystem'
const log = console.log.bind(this)
export default class ThreeWorld extends MyParticleSystem {
  public SceneGeometryNow
  private fbxData
  private mixerCat
  public uniforms = {
    texture1: {
      value:  new THREE.TextureLoader().load("./static/miaodong-a2.png")
    },
    texture2: {
      value:  new THREE.TextureLoader().load("./static/miaodong-b1.png")
    },
    texture3: {
      value:  new THREE.TextureLoader().load("./static/miaodong-c1.png")
    },
    texture4: {
      value:  new THREE.TextureLoader().load("./static/miaodong-d1.png")
    },
    val: {
      value: 1.0
    },
    dpr: {
      value: window.devicePixelRatio
    }
  }
  public async initScene() {
    try {
      let res = await this.loader(['./static/model-1.json', './static/model-2.json', './static/model-3.json', './static/model-4.json', './static/anim-1.fbx'])
      let [scene1, scene2, scene3, scene4, fbxData ] = res
      // @ts-ignore
      this.MAXLENGTH = Math.max(scene1.length, scene2.length, scene3.length, scene4.length,)
      log(this.MAXLENGTH)
      let [SceneGeometry1, SceneGeometry2, SceneGeometry3, SceneGeometry4,] = [scene1, scene2, scene3, scene4, ].map((item:Array<Object>) => {
        return this.objPreprocessor(item)
      })
      this.SceneGeometry1 = SceneGeometry1
      this.SceneGeometry2 = SceneGeometry2
      this.SceneGeometry3 = SceneGeometry3
      this.SceneGeometry4 = SceneGeometry4
      this.setFbxAni(fbxData)
      this.toNextSceen(SceneGeometry1, SceneGeometry2)
    } catch (error) {
      log(error)
    }
  }
  public setFbxAni(fbxData) {
    this.fbxData = fbxData
    this.scene.add(this.fbxData)
    this.mixerCat = new THREE.AnimationMixer(this.fbxData)
    let animationAction = this.mixerCat.clipAction(this.fbxData.animations[8])
    animationAction.loop = THREE.LoopOnce
    animationAction.clampWhenFinished = true
    animationAction.play()
  }
  public updateAnimationAction() {
    const delta = this.clock.getDelta()
    if (this.mixerCat) {
      // if(this.mixerCat.time) log(this.mixerCat.time)
      this.mixerCat.update(delta)
      if(this.mixerCat.time > 5.0 && this.mixerCat.time < 5.1) {
        this.tween1.start()
      }
    }
  }
  public updateParticleSystem() {
    let time = Date.now() * 0.005
    if (this.fbxData) {
      this.camera.position.x = this.fbxData.children[1].position.x
      this.camera.position.y = this.fbxData.children[1].position.y
      this.camera.position.z = this.fbxData.children[1].position.z
    }
    if (this.particleSystem) {
      let bufferObj = this.particleSystem.geometry
      // 粒子系统缓缓旋转
      // this.particleSystem.rotation.y = 0.01 * time
      // let position = bufferObj.attributes.position
      let _time = bufferObj.attributes.time.array
      let len = _time.length
      for (let i = 0; i < len; i++) {
        _time[i] = 1.5 * (2.0 + Math.sin(0.02 * i + time))
      }
      // 需指定属性需要被更新
      bufferObj.attributes.time.needsUpdate = true
      bufferObj.attributes.uv.needsUpdate = true
      bufferObj.attributes.uv2.needsUpdate = true
      bufferObj.attributes.position.needsUpdate = true
      bufferObj.attributes.position2.needsUpdate = true
    }
  }
}