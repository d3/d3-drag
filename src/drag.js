import {dispatch} from "d3-dispatch";
import {event, select, mouse, window} from "d3-selection";

function prevent() {
  event.preventDefault();
}

// TODO touch
export default function() {
  var event = dispatch("dragstart", "drag", "dragend");

  function drag(selection) {
    selection.on("mousedown.drag", started);
  }

  function started(d, i, nodes) {
    var node = this,
        parent = node.parentNode,
        origin = mouse(parent),
        ox = d.x - origin[0] || 0,
        oy = d.y - origin[1] || 0,
        dragged = false;

    var context = select(window(node))
        .on("dragstart.drag", prevent)
        .on("selectstart.drag", prevent)
        .on("mousemove.drag", moved)
        .on("mouseup.drag", ended);

    emit("dragstart");

    function emit(type) {
      event.call(type, node, d, i, nodes);
    }

    function moved() {
      var p = mouse(parent);
      d.x = p[0] + ox;
      d.y = p[1] + oy;
      dragged = true;
      emit("drag");
    }

    function ended() {
      context.on(".drag", null);
      if (dragged) context.on("click.drag", prevent, true), setTimeout(afterended, 0);
      emit("dragend");
    }

    function afterended() {
      context.on("click.drag", null);
    }
  }

  drag.on = function() {
    var value = event.on.apply(event, arguments);
    return value === event ? drag : value;
  };

  return drag;
}
