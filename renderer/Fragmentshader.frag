uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float val;
varying vec2 v_TexCoord;
void main() {;
  float d = distance(gl_PointCoord, vec2(0.5,0.5));
  if(d < 0.5) {;
    vec4 texture1 = texture2D(texture1 , v_TexCoord);
    vec4 texture2 = texture2D(texture2 , v_TexCoord);
    gl_FragColor = texture1 * val + texture2 * (1. - val);
  } else {;
    discard;
  };
}