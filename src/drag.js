import constant from "./constant";
import noop from "./noop";
import {event, customEvent, select, mouse, touch} from "d3-selection";

function nodefault() {
  event.preventDefault();
}

// Ignore right-click, since that should open the context menu.
// Ignore multiple starting touches on the same element.
function defaultFilter() {
  return event.identifier == null
      ? !event.sourceEvent.button
      : event.sourceEvent.changedTouches[0].identifier === event.identifier;
}

function defaultContainer() {
  return this.parentNode;
}

// Listen to the window for mousemove and mouseup such that we continue to
// receive events if the mouse goes outside the window.
function mouseContext() {
  return event.view;
}

// Listen to the event target for touchmove, touchend and touchcancel.
function touchContext() {
  return event.target;
}

export default function(dragstarted) {
  var x = null,
      y = null,
      filter = defaultFilter,
      container = defaultContainer,
      mousestart = start("mousemove", "mouseup", mouse, mouseContext),
      touchstart = start("touchmove", "touchend touchcancel", touch, touchContext);

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
        .on("touchstart.drag", touchstarted);
  }

  function mousedowned() {
    mousestart(this, arguments);
  }

  function touchstarted() {
    for (var touches = event.changedTouches, i = 0, n = touches.length; i < n; ++i) {
      touchstart(this, arguments, touches[i].identifier);
    }
  }

  function start(move, end, position, contextify) {
    return function(that, args, id) {
      var parent,
          p0,
          dx,
          dy;

      if (!customEvent({type: "beforedragstart", identifier: id}, function() {
        if (filter.apply(that, args)) {
          parent = container.apply(that, args);
          p0 = position(parent, id);
          dx = x == null ? 0 : x.apply(that, args) - p0[0];
          dy = y == null ? 0 : y.apply(that, args) - p0[1];
          return true;
        }
      })) return;

      var listen = customEvent({type: "dragstart", identifier: id, x: p0[0], y: p0[1]}, dragstarted, that, args) || noop,
          dragged = typeof listen === "function" ? listen : listen.drag || noop,
          dragended = listen.dragend || noop,
          noclick = false,
          view = select(event.view).on(name("dragstart selectstart"), nodefault, true),
          context = select(contextify.apply(that, args)).on(name(move), moved).on(name(end), ended);

      // I’d like to call preventDefault on mousedown to disable native dragging
      // of links or images and native text selection. However, in Chrome this
      // causes mousemove and mouseup events outside an iframe to be dropped:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=269917
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
        var p = position(parent, id);
        if (p == null) return; // This touch didn’t change.
        nodefault(), noclick = true;
        dragged.call(that, p[0] + dx, p[1] + dy);
      }

      function ended() {
        var p = position(parent, id);
        if (p == null) return; // This touch didn’t end.
        view.on(name(), null);
        context.on(name(), null);
        if (noclick) view.on(name("click"), nodefault, true), setTimeout(afterended, 0);
        dragended.call(that, p[0] + dx, p[1] + dy);
      }

      function afterended() {
        view.on(name("click"), null);
      }
    };
  }

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
  };

  drag.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), drag) : x;
  };

  drag.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), drag) : y;
  };

  return drag;
}
