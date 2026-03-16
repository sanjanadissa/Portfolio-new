export const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidFragmentShader = `
uniform sampler2D uPrevTrails;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uResolution;
uniform float uDecay;
uniform bool uIsMoving;

varying vec2 vUv;

void main() {
  vec4 prevState = texture2D(uPrevTrails, vUv);
  float newValue = prevState.r * uDecay;

  if (uIsMoving) {
    vec2 mouseDirection = uMouse - uPrevMouse;
    float lineLength = length(mouseDirection);

    if (lineLength > 0.001) {
      vec2 mouseDir = mouseDirection / lineLength;

      vec2 toPixel = vUv - uPrevMouse;
      float projAlong = dot(toPixel, mouseDir);
      projAlong = clamp(projAlong, 0.0, lineLength);

      vec2 closestPoint = uPrevMouse + projAlong * mouseDir;
      float dist = length(vUv - closestPoint);

      float lineWidth = 0.045;
      float intensity = smoothstep(lineWidth, 0.0, dist) * 0.3;

      newValue += intensity;
    }
  }

  gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
}
`;

export const displayFragmentShader = `
uniform sampler2D uFluid;
uniform sampler2D uTopTexture;
uniform sampler2D uBottomTexture;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uTopTextureSize;
uniform vec2 uBottomTextureSize;
uniform float uImageScale;

varying vec2 vUv;

vec2 getScaledUV(vec2 uv, vec2 texSize) {
  if (texSize.x < 1.0 || texSize.y < 1.0) return uv;

  vec2 s = uResolution / texSize;
  float scale = min(s.x, s.y) * uImageScale;

  vec2 scaledSize = texSize * scale;
  vec2 offset = (uResolution - scaledSize) * 0.5;

  vec2 result = (uv * uResolution - offset) / scaledSize;

  if (result.x < 0.0 || result.x > 1.0 ||
      result.y < 0.0 || result.y > 1.0) {
    return vec2(-1.0);
  }
  return result;
}

void main() {
  float fluid = texture2D(uFluid, vUv).r;

  vec2 topUV    = getScaledUV(vUv, uTopTextureSize);
  vec2 bottomUV = getScaledUV(vUv, uBottomTextureSize);

  vec4 topColor    = (topUV.x < 0.0) ? vec4(0.0) : texture2D(uTopTexture,    topUV);
  vec4 bottomColor = (bottomUV.x < 0.0) ? vec4(0.0) : texture2D(uBottomTexture, bottomUV);

  float threshold = 0.02;
  float edgeWidth = 0.004 / uDpr;
  float t = smoothstep(threshold, threshold + edgeWidth, fluid);

  vec4 finalColor = mix(topColor, bottomColor, t);
  gl_FragColor = finalColor;
}
`;
