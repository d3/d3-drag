import {select, mouse, window} from "d3-selection";

// TODO touch
// TODO default origin detects {x, y} or [x, y] automatically?
export default function(origin) {

  // TODO suppress native dragstart, selectstart
  function mousedowned() {
    var context = select(window(this)).on("mousemove.drag", mousemoved).on("mouseup.drag", mouseupped),
        subject = select(this),
        parent = this.parentNode,
        point0 = mouse(parent),
        offsetX = 0,
        offsetY = 0;

    if (origin != null) {
      var o = origin.apply(this, arguments);
      offsetX = o.x - point0[0];
      offsetY = o.y - point0[1];
    }

    subject.dispatch("d3:dragstart");

    function mousemoved() {
      var point1 = mouse(parent),
          dx = point1[0] - point0[0],
          dy = point1[1] - point0[1];
      point0 = point1;
      subject.dispatch("d3:drag", {
        detail: {
          x: point1[0] + offsetX,
          y: point1[1] + offsetY,
          dx: dx,
          dy: dy
        }
      });
    }

    // TODO suppress click if dragged
    function mouseupped() {
      context.on("mousemove.drag", null).on("mouseup.drag", null);
      subject.dispatch("d3:dragend");
    }
  }

  return function(selection) {
    selection.on("mousedown.drag", mousedowned);
  };
}
