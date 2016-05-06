import constant from "./constant";
import {event, select, mouse, touch} from "d3-selection";

function nodefault() {
  event.preventDefault();
}

// Ignore right-click by default, since that should open the context menu.
function mainbutton() {
  return !event.button;
}

function mouseId() {
  return null;
}

// Listen to the window for mousemove and mouseup such that we continue to
// receive events if the mouse goes outside the window.
function mouseContext() {
  return event.view;
}

// We only care about the first changed touch: if there are multiple new touches
// on DIFFERENT targets, we’ll receive multiple touchstart events; if there are
// multiple new touches on the SAME target, we only want to track the first.
function touchId() {
  return event.changedTouches[0].identifier;
}

// Listen to the event target for touchmove, touchend and touchcancel.
function touchContext() {
  return event.target;
}

function parent() {
  return this.parentNode;
}

function noop() {}

export default function(dragstarted) {
  var x = null,
      y = null,
      container = parent,
      filter = mainbutton,
      mousedowned = started("mousemove", "mouseup", mouse, mouseId, mouseContext),
      touchstarted = started("touchmove", "touchend touchcancel", touch, touchId, touchContext);

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
        .on("touchstart.drag", touchstarted);
  }

  function started(move, end, position, identify, contextify) {
    return function(d, i, nodes) {
      if (!filter.call(this, d, i, nodes)) return;

      var listen = dragstarted.call(this, d, i, nodes) || noop,
          dragged = typeof listen === "function" ? listen : listen.drag || noop,
          dragended = listen.dragend || noop,
          noclick = false,
          id = identify(),
          node = container.call(this, d, i, nodes),
          p0 = position(node, id),
          ox = x == null ? 0 : x.call(this, d, i, nodes) - p0[0],
          oy = y == null ? 0 : y.call(this, d, i, nodes) - p0[1],
          view = select(event.view).on(name("dragstart selectstart"), nodefault, true),
          context = select(contextify()).on(name(move), moved).on(name(end), ended);

      // I’d like to call preventDefault on mousedown to disable native dragging
      // of links or images and native text selection. However, in Chrome this
      // causes mousemove and mouseup events outside an iframe to be dropped:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=269917
      //
      // And if you preventDefault on touchstart on iOS, it prevents the click
      // event on touchend, even if there was no touchmove! So instead, we
      // cancel the specific undesirable behaviors.

      function name(types) {
        var name = id == null ? ".drag" : ".drag-" + id;
        return types == null ? name : types.trim()
            .split(/^|\s+/)
            .map(function(type) { return type + name; })
            .join(" ");
      }

      function moved() {
        var p = position(node, id);
        if (p == null) return; // This touch didn’t change.
        nodefault(), noclick = true;
        dragged.call(drag, p[0] + ox, p[1] + oy);
      }

      function ended() {
        if (!position(node, id)) return; // This touch didn’t end.
        view.on(name(), null);
        context.on(name(), null);
        if (noclick) view.on(name("click"), nodefault, true), setTimeout(afterended, 0);
        dragended.call(drag);
      }

      function afterended() {
        view.on(name("click"), null);
      }
    };
  }

  drag.x = function(_) {
    return arguments.length ? (x = _ == null || typeof _ === "function" ? _ : constant(+_), drag) : x;
  };

  drag.y = function(_) {
    return arguments.length ? (y = _ == null || typeof _ === "function" ? _ : constant(+_), drag) : y;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
  };

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
  };

  return drag;
}
