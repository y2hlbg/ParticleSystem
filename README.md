# ParticleSystem

A particle system



The MyParticleSystem.ts is a base class.



ThreeWorld.ts is extends MyParticleSystem.



Rendering effect is like  [https://le-voyage-azarien.art/](https://le-voyage-azarien.art/) 



Base the renderer, you  can also modify it according to your needs.


we can use it in vue 

```vue
<template>
  <div class='page home'>
    <div class="container" ref="container"></div>
  </div>
</template>

<script lang='ts'>
  import { Vue, Component, Watch, Emit, Prop, } from 'vue-property-decorator'
  import * as THREE from 'three'
  import ThreeWorld from './renderer/ThreeWorld'
  
  @Component({components: {
  }})
  
  export default class Home extends Vue {
    private mounted () {
      const container:HTMLElement = this.$refs.container
      this.GL = new ThreeWorld(container, this.endCallBack, this.setIndex)
    }
    
    private endCallBack() {
    }
    
    private setIndex(index) {
    }
  }
</script>

<style lang='scss' scoped>
  .home {
  }
</style>

```

