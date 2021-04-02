uniform float val;
uniform float dpr;
attribute float time;
attribute vec3 position2;
attribute vec2 uv2;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {;
  vec3 vPos;
  vPos.x = position.x * val + position2.x * (1.-val) + .03 * sin(time);
  vPos.y = position.y * val + position2.y * (1.-val) + .03 * cos(time);   
  vPos.z = position.z * val + position2.z * (1.-val);
  
  vec4 mvPosition = modelViewMatrix * vec4( vPos, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize =  1.1 * dpr  * (90./gl_Position.w);
  v_TexCoord = uv * val + uv2 * (1.-val);
}