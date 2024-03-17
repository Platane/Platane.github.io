import { vec2, vec3 } from "gl-matrix";
import { geometryPromise } from "jurassic-nursery/packages/game/renderer/geometries/model/model";
import { createSkeleton } from "jurassic-nursery/packages/game/renderer/geometries/model/skeleton";
import { setEntityColorSchema } from "jurassic-nursery/packages/game/renderer/geometries/model/colorSchema";
import { V_MAX } from "jurassic-nursery/packages/game/systems/walker";
import { variants } from "jurassic-nursery/packages/game/systems/gene";
import {
  onResize as onResizeCamera,
  updateLookAtMatrix,
  eye,
} from "jurassic-nursery/packages/game/entities/camera";
import {
  type Triceratops,
  triceratops,
} from "jurassic-nursery/packages/game/entities/triceratops";
import { updateWalkerPose } from "jurassic-nursery/packages/game/systems/walkerPose";
import { step } from "jurassic-nursery/packages/game/systems/walker";
import { getRayFromScreen } from "jurassic-nursery/packages/game/controls/utils/getRayFromScreen";
import { projectOnGround } from "jurassic-nursery/packages/game/utils/collision/projectOnGround";
import {
  gl,
  onResize as onResizeCanvas,
} from "jurassic-nursery/packages/game/renderer/canvas";
import { draw as drawSkinnedMesh } from "jurassic-nursery/packages/game/renderer/materials/skinnedMesh";
import { draw as drawShadow } from "jurassic-nursery/packages/game/renderer/materials/shadow";

//
// set camera
eye[0] = 0;
eye[1] = 1.6;
eye[2] = 14;

updateLookAtMatrix();

//
// prepare renderer
gl.clearColor(0, 0, 0, 0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawShadow();
  drawSkinnedMesh();
};

let lineLength = 0;

const onResize = (window.onresize = () => {
  onResizeCanvas();
  onResizeCamera();

  const o = vec3.create();
  const v = vec3.create();
  const h = vec3.create();
  getRayFromScreen(o, v, 1, 0);
  projectOnGround(h, o, v, 0);
  lineLength = h[0];

  render();
});
onResize();

//
// entities
{
  let _id = 1;
  for (let i = 5; i--; ) {
    const tri: Triceratops = {
      id: _id++,
      ...createSkeleton(),

      ...variants[0],

      food_level: 0,
      love_level: 0,
      happiness_level: 0,
      will_not_eat_again: new Set(),
      wandering_center: [0, 0],
      velocity: vec2.create(),
      delta_angle_mean: 0,
      tail_t: Math.random() * 3,
      feet_t: Math.random() * 3,
      v_max: V_MAX,
      seed: Math.floor(Math.random() * 100),

      activity: { type: "idle" },
    };

    tri.o[0] = -lineLength * 1.1;

    tri.o[0] += Math.random() - 0.5;
    tri.o[2] += Math.random() - 0.5;

    triceratops.set(tri.id, tri);
  }

  {
    let i = 0;
    for (const tri of triceratops.values()) {
      setEntityColorSchema(i, tri.colors);
      i++;
    }
  }
}

//
// loop
const loop = () => {
  step();

  let i = 0;
  for (const tri of triceratops.values()) {
    i++;
    if (!tri.go_to_target) {
      tri.go_to_target = [lineLength * (tri.o[0] > 0 ? -1 : 1) * 0.86, 0];
      tri.go_to_target[0] += (Math.random() - 0.5) * 1.5;
      tri.go_to_target[1] += (Math.random() - 0.5) * 1.5 + i;
    }

    updateWalkerPose(tri);
  }

  render();

  requestAnimationFrame(loop);
};

geometryPromise.then(loop);
