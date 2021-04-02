import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import Stats from "three/examples/jsm/libs/stats.module.js"
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import axios from 'axios'
import VertextShader from './VertextShader.vert'
import Fragmentshader from './Fragmentshader.frag'
const log = console.log.bind(this)
export default class MyParticleSystem {
  private container:HTMLElement
  public endCallBack:Function
  private HEIGHT
  private WIDTH
  public scene
  public camera
  private renderer
  private stats
  private ambientLight
  private animationFrame
  private orbitControls
  public shaderMaterial
  public particleSystem // 粒子系统
  private particles // 粒子点
  public tween1
  public tween2
  public uniforms = {
    // texture1: {
    //   value:  new THREE.TextureLoader().load("./static/miaodong-a2.png")
    // },
    // texture2: {
    //   value:  new THREE.TextureLoader().load("./static/miaodong-b1.png")
    // },
    // texture1: {
    //   value:  new THREE.TextureLoader().load("./static/miaodong-c1.png")
    // },
    // texture2: {
    //   value:  new THREE.TextureLoader().load("./static/miaodong-d1.png")
    // },
    val: {
      value: 1.0
    },
    dpr: {
      value: window.devicePixelRatio
    }
  }
  public clock = new THREE.Clock()
  private isTouched = false
  private isEnd = false
  private touchStartX = 0
  private touchStartY = 0
  public MAXLENGTH = 0
  public isLinkShader = false
  public SceneGeometryNow
  public currentIndex = 1
  public SceneGeometry1
  public SceneGeometry2
  public SceneGeometry3
  public SceneGeometry4
  constructor(canvasContainer: HTMLElement, endCallBack: Function, setIndex: Function) {
    // canvas容器
    this.container = canvasContainer || document.body
    this.endCallBack = endCallBack
    this.render()
  }
  public render() {
    // 创建场景
    this.createScene()
    // 创建灯光
    this.createLights()
    // 性能监控插件
    this.initStats()
    // 物体添加
    this.initScene()
    // 轨道控制插件（鼠标拖拽视角、缩放等）
    this.addOrbitControls()
    // 循环更新渲染场景
    this.update()
  }
  /**
   * create scene and camera
   */
  public createScene() {
    this.HEIGHT = window.innerHeight
    this.WIDTH = window.innerWidth
    // 创建场景
    this.scene = new THREE.Scene()
    // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
    this.scene.fog = new THREE.Fog(0xffffff, 1, 600)
    // 创建相机
    let aspectRatio = this.WIDTH / this.HEIGHT
    let fieldOfView = 60
    let nearPlane = 1
    let farPlane = 1000
    
    this.camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    )

    // 设置相机的位置
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 60
    this.camera.lookAt(new THREE.Vector3(80, 0, -100))
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      // 在 css 中设置背景色透明显示渐变色
      alpha: true,
      // 开启抗锯齿
      antialias: true,
    })
    // 渲染背景颜色同雾化的颜色
    this.renderer.setClearColor('#000000', 1)
    // 移动端设备上可能由于 dpr 导致页面看起来比较糊, 这时候需要加上下边的代码
    this.renderer.setPixelRatio(window.devicePixelRatio || 3)
    log(window.devicePixelRatio)
    // 定义渲染器的尺寸；在这里它会填满整个屏幕
    this.renderer.setSize(this.WIDTH, this.HEIGHT)

    // 打开渲染器的阴影地图
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMapSoft = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // 在 HTML 创建的容器中添加渲染器的 DOM 元素
    this.container.appendChild(this.renderer.domElement)
    // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
    window.addEventListener('resize', this.handleWindowResize.bind(this), false)
  }
  /**
   * create light
   */
  public createLights() {
    // 环境光源
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(this.ambientLight)
  }
  /**
   * state
   */
  public initStats() {
    this.stats = Stats()
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.bottom = '0px'
    this.stats.domElement.style.zIndex = 100
    this.container.appendChild(this.stats.domElement)
  }
  /**
   * init Scene
   */
  public initScene() {

  }
  // 用于处理 fbx 模型动画, 需要自定义
  public setFbxAni(fbxData) {
  }
  public addOrbitControls(isUseOrbitControls=false) {
    if (!isUseOrbitControls) {
      let mouse = {
        x: 0,
        y: 0,
      }
      this.renderer.domElement.addEventListener('touchstart', (event) => {
        event.preventDefault()
        this.touchStartX = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
        this.touchStartY = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1
        this.isTouched = true
      }, false)
      this.renderer.domElement.addEventListener('touchmove', (event) => {
        event.preventDefault()
        mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1
        let moveLengthX = mouse.x - this.touchStartX
        let moveLengthY = mouse.y - this.touchStartY
        this.camera.rotateY(moveLengthX / 30)
        this.camera.rotateX(moveLengthY / 30)
        this.isTouched = true
      }, false)
      this.renderer.domElement.addEventListener('touchend', (event) => {
        event.preventDefault()
        mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1
        this.isTouched = false
      }, false)  
    } else {
      this.orbitControls = new OrbitControls(this.camera, this.container)
      this.orbitControls.enableZoom = true
      this.orbitControls.enableRotate = true
      this.orbitControls.enablePan = false
    }
  }
  public update() {
    if(this.isEnd) return
    this.updateAnimationAction()
    this.updateParticleSystem()
    TWEEN.update()
    this.stats.update()
    this.renderer.render(this.scene, this.camera)
    this.animationFrame = requestAnimationFrame(() => {
      this.update()
    })
  }
  public setShader() {
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VertextShader,
      fragmentShader: Fragmentshader,
      depthTest: true, // 这个不设置的话，会导致带透明色的贴图始终会有方块般的黑色背景
      transparent: true,
    })
    this.isLinkShader = true
  }
  /**
   * scene change
   */
  public async toNextSceen(geometry1, geometry2) {
    if (!this.isLinkShader) {
      this.setShader()
      this.SceneGeometryNow = new THREE.BufferGeometry()
    }

    this.SceneGeometryNow.setAttribute('position', new THREE.Float32BufferAttribute(geometry1.position, 3))
    this.SceneGeometryNow.setAttribute('uv', new THREE.Float32BufferAttribute(geometry1.color, 2))
    // this.SceneGeometryNow.setAttribute('pointIndex', new THREE.Float32BufferAttribute(geometry1.pointIndexArr, 1))
    this.SceneGeometryNow.setAttribute('time', new THREE.Float32BufferAttribute(geometry1.pointIndexArr, 1))

    this.SceneGeometryNow.setAttribute('position2', new THREE.Float32BufferAttribute(geometry2.position, 3))
    this.SceneGeometryNow.setAttribute('uv2', new THREE.Float32BufferAttribute(geometry2.color, 2))
    // this.SceneGeometryNow.setAttribute('pointIndex2', new THREE.Float32BufferAttribute(geometry2.pointIndexArr, 1))
    // this.SceneGeometryNow.setAttribute('time2', new THREE.Float32BufferAttribute(geometry2.pointIndexArr, 1))
    
    if(!this.particleSystem) this.particleSystem = new THREE.Points(this.SceneGeometryNow, this.shaderMaterial)

    if (!this.tween1 && !this.tween2) {
      let pos = { val: 1. }
      // 使val值从0到1，1到0循环往复变化
      this.tween1 = new TWEEN.Tween(pos).to({ val: 0 }, 1500).easing(TWEEN.Easing.Quadratic.InOut).delay(4000).onUpdate(updateCallback).onComplete(completeCallback_Go.bind(pos, 'go'))
      this.tween2 = new TWEEN.Tween(pos).to({ val: 1 }, 1500).easing(TWEEN.Easing.Quadratic.InOut).delay(1000).onUpdate(updateCallback).onComplete(completeCallback_Back.bind(pos, 'back'))
      this.tween1.chain(this.tween2)
      this.tween2.chain(this.tween1)
      this.tween1.start()
      let _this = this
      function completeCallback_Back() {
        _this.currentIndex += 1
        if( _this.currentIndex < 4) {
          _this.updateShaderData()
        } else {
          _this.destroyed()
        }
      }
      function completeCallback_Go() {
        _this.currentIndex += 1
        if( _this.currentIndex < 4) {
          _this.updateShaderData()
        } else {
          _this.destroyed()
        }
      }
      // 每次都将更新的val值赋值给uniforms，让其传递给shader
      function updateCallback() {
        // @ts-ignore
        _this.particleSystem.material.uniforms.val.value = this._object.val
      }
      this.scene.add(this.particleSystem)
    }
  }
  public updateAnimationAction() {

  }
  /**
   * update ParticleSystem
   */
  public updateParticleSystem() {

  }
  /**
   * 
   */
  public updateShaderData() {
    this.particleSystem.material.uniforms.needsUpdate = true
    if(this.currentIndex % 2 != 1) {
      let geometry1  = this[`SceneGeometry${this.currentIndex+1}`]
      // @ts-ignore
      this.particleSystem.material.uniforms.texture1 = this.uniforms[`texture${this.currentIndex+1}`]
      this.SceneGeometryNow.setAttribute('position', new THREE.Float32BufferAttribute(geometry1.position, 3))
      this.SceneGeometryNow.setAttribute('uv', new THREE.Float32BufferAttribute(geometry1.color, 2))
      this.SceneGeometryNow.setAttribute('pointIndex', new THREE.Float32BufferAttribute(geometry1.pointIndexArr, 1))
      this.SceneGeometryNow.setAttribute('time', new THREE.Float32BufferAttribute(geometry1.pointIndexArr, 1))
    } else {
      this.particleSystem.material.uniforms.texture2 = this.uniforms[`texture${this.currentIndex+1}`]
      let geometry2  = this[`SceneGeometry${this.currentIndex+1}`]
      this.SceneGeometryNow.setAttribute('position2', new THREE.Float32BufferAttribute(geometry2.position, 3))
      this.SceneGeometryNow.setAttribute('uv2', new THREE.Float32BufferAttribute(geometry2.color, 2))
      this.SceneGeometryNow.setAttribute('pointIndex2', new THREE.Float32BufferAttribute(geometry2.pointIndexArr, 1))
      this.SceneGeometryNow.setAttribute('time2', new THREE.Float32BufferAttribute(geometry2.pointIndexArr, 1))
    }
  }
  /**
   * destroy
   */
  private destroyed() {
    this.isEnd = true
    setTimeout(() => {
      window.cancelAnimationFrame(this.animationFrame)
      this.renderer.domElement.addEventListener('touchstart', null, false)
      this.renderer.domElement.addEventListener('touchmove', null, false)
      this.renderer.domElement.addEventListener('touchend', null, false)
      this.renderer.domElement.addEventListener('resize', null, false)
      this.scene = null
      this.ambientLight = null
      this.camera = null
      this.stats = null
      this.tween1 = null
      this.tween2 = null
      this.SceneGeometryNow.dispose()   
    }, 1000)
    log('end')
    this.endCallBack()

  }
  /**
   * Preprocessor obj
   */
  public objPreprocessor(modelData) {
    let scene = modelData
    const sceneLengt = scene.length
    const particlesArr = []
    const uvArr = []
    // const geometry = new THREE.BufferGeometry()
    const pointIndexArr = []
    // debugger
    for (let i = 0; i < this.MAXLENGTH; i++) {
      pointIndexArr.push(i)
      let item = scene[i % sceneLengt]
      let x = item.position.x
      let y = item.position.y
      let z = item.position.z
      let u = item.uv.u
      let v = item.uv.v
      particlesArr.push(x, y, z)
      uvArr.push(u, v)
    }
    let position =  new Float32Array(particlesArr)
    let color = new Float32Array(uvArr)
    return {
      position: position,
      color: color,
      pointIndexArr: pointIndexArr,
    }
  }
  /**
   * 窗口大小变动时调用
   */
  private handleWindowResize() {
    // 更新渲染器的高度和宽度以及相机的纵横比
    this.HEIGHT = window.innerHeight
    this.WIDTH = window.innerWidth
    this.renderer.setSize(this.WIDTH, this.HEIGHT)
    this.camera.aspect = this.WIDTH / this.HEIGHT
    this.camera.updateProjectionMatrix()
  }
  /**
   * loader with fbx and json
   */
  public loader(pathArr) {
    // 各类loader实例
    // let gltfLoader = new GLTFLoader()
    // let plyLoader = new PLYLoader()
    let fbxLoader = new FBXLoader()
    // let mtlLoader = new MTLLoader()
    // let objLoader = new OBJLoader()
    // let pcdLoader = new PCDLoader()
    let basePath, pathName, pathFomat
    if (Object.prototype.toString.call(pathArr) !== '[object Array]') {
      pathArr = new Array(1).fill(pathArr.toString())
    }
    let promiseArr = pathArr.map((path) => {
      // 模型基础路径
      basePath = path.substring(0, path.lastIndexOf('/') + 1)
      // 模型名称
      pathName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
      // 后缀为js或json的文件统一当做js格式处理
      pathName = pathName === 'json' ? 'js' : pathName
      // 模型格式
      pathFomat = path.substring(path.lastIndexOf('.') + 1).toLowerCase()
      // console.log(pathFomat)
      switch (pathFomat) {
        // case 'gltf':
        //   return new Promise(function (resolve) {
        //     gltfLoader.load(path, (gltf) => {
        //       console.log(gltf)
        //       resolve(gltf)
        //     })
        //   })
        //   break
        // case 'pcd':
        //   return new Promise(function (resolve) {
        //     pcdLoader.load(path, (points) => {
        //       resolve(points)
        //     })
        //   })
        //   break
        // case 'ply':
        //   return new Promise(function (resolve) {
        //     plyLoader.load(path, (geometry) => {
        //       // geometry.computeVertexNormals()
        //       resolve(geometry)
        //     })
        //   })
        //   break
        case 'json':
          return new Promise(function (resolve) {
            axios.get(path).then(response => {
              // console.log(response.data)
              resolve(response.data)
            }, (response) => {
              console.log("error")
            })
          })
          break
        case 'js':
          return new Promise(function (resolve) {
            axios.get(path).then(response => {
              // console.log(response.data)
              resolve(response.data)
            }, (response) => {
              console.log("error")
            })
          })
          break
        case 'fbx':
          return new Promise(function (resolve) {
            fbxLoader.load(path, (object) => {
              resolve(object)
            })
          })
          break
        // case 'obj':
        //   return new Promise(function (resolve) {
        //     objLoader.load(path, (object) => {
        //       resolve(object)
        //     })
        //   })
        //   break
        // case 'mtl':
        //   return new Promise(function (resolve) {
        //     mtlLoader.setPath(basePath)
        //     mtlLoader.load(pathName + '.mtl', (mtl) => {
        //       resolve(mtl)
        //     })
        //   })
        //   break
        // case 'objmtl':
        //   return new Promise(function (resolve, reject) {
        //     mtlLoader.setPath(basePath)
        //     mtlLoader.load(`${pathName}.mtl`, (mtl) => {
        //       mtl.preload()
        //       objLoader.setMaterials(mtl)
        //       objLoader.setPath(basePath)
        //       objLoader.load(pathName + '.obj', resolve, undefined, reject)
        //     })
        //   })
        //   break
        default:
          return ''
      }
    })
    return Promise.all(promiseArr)
  }
  // 递归遍历模型及模型子元素并开启投影
  private onShadow(obj) {
    if (obj.type === 'Mesh') {
      obj.castShadow = true
      obj.receiveShadow = true
    }
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach((item) => {
        this.onShadow(item)
      })
    }
    return
  }
  // 将几何模型变成几何缓存模型
  private toBufferGeometry(geometry) {
    // debugger
    if (geometry.type === 'BufferGeometry') return geometry
    return new THREE.BufferGeometry().fromGeometry(geometry)
  }
  private destory() {
    window.cancelAnimationFrame(this.animationFrame)
  }
  /**
   * addPoion (not use)
   */
  private addPoion(number: number) {
    var particleCount = number
    this.particles = new THREE.BufferGeometry()
    // debugger
      // pMaterial = new THREE.PointsMaterial({
      //   color: 0xFFFFFF,
      //   size: 1
      // })
    const particlesArr = []
    const uvArr = []
    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

      // create a particle with random
      // position values, -250 -> 250
      let pX = Math.random() * 500 - 250,
          pY = Math.random() * 500 - 250,
          pZ = Math.random() * 500 - 250;

      // add it to the geometry
      particlesArr.push(pX, pY, pZ)
      // uvArr.push(Math.random(),  Math.random())
      // if (p%2 == 0) {
      //   this.particles.colors.push(new THREE.Color('#54d75f'))  // green
      // } else {
      //   this.particles.colors.push(new THREE.Color('#eeee00'))
      // }
      // this.particles.colors.push(
      //   new THREE.Color('#ffffff'), // red
        
      // )
    }
    // // debugger
    // this.particles.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(particlesArr), 3))
    // this.particles.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvArr), 2))
    this.particles.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(particlesArr), 3 ) )
    // this.particles.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array(uvArr), 1 ) )
    // debugger
    // create the particle system
    // @ts-ignore
    // var particleSystem = new THREE.Points(
    //   particles,
    //   pMaterial)
    // // add it to the scene
    // this.scene.add(this.particleSystem)
    return this.particles
  }
}