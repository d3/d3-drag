import constant from "./constant";
import {dispatch} from "d3-dispatch";
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

function defaultX(d) {
  return d && d.x;
}

function defaultY(d) {
  return d && d.y;
}

export default function() {
  var x = defaultX,
      y = defaultY,
      filter = defaultFilter,
      container = defaultContainer,
      mousestart = start("mousemove", "mouseup", mouse, mouseContext),
      touchstart = start("touchmove", "touchend touchcancel", touch, touchContext),
      listeners = dispatch("start", "drag", "end");

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

  function start(move, end, pointer, contextify) {
    return function(that, args, id) {
      var parent,
          p0,
          dx,
          dy;

      // You can’t listen for the beforestart event explicitly, but it’s
      // needed to expose the current identifier to accessors via d3.event.

      if (!customEvent({type: "beforestart", identifier: id}, function() {
        if (filter.apply(that, args)) {
          parent = container.apply(that, args);
          p0 = pointer(parent, id);
          dx = x.apply(that, args) - p0[0] || 0;
          dy = y.apply(that, args) - p0[1] || 0;
          return true;
        }
      })) return;

      // I’d like to call preventDefault on mousedown to disable native dragging
      // of links or images and native text selection. However, in Chrome this
      // causes mousemove and mouseup events outside an iframe to be dropped:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=269917
      // And if you preventDefault on touchstart on iOS, it prevents the click
      // event on touchend, even if there was no touchmove! So instead, we
      // cancel the specific undesirable behaviors. If you want to change this
      // behavior, you can unregister these listeners on start.

      var sublisteners = listeners.copy(),
          startevent = {type: "start", identifier: id, x: p0[0] + dx, y: p0[1] + dy, on: on},
          view = select(event.view).on(name("dragstart selectstart"), nodefault, true),
          context = select(contextify.apply(that, args)).on(name(move), moved).on(name(end), ended),
          noclick = false;

      customEvent(startevent, sublisteners.apply, sublisteners, ["start", that, args]);

      function on() {
        var value = sublisteners.on.apply(sublisteners, arguments);
        return value === sublisteners ? startevent : value;
      }

      function name(types) {
        var name = id == null ? ".drag" : ".drag-" + id;
        return types == null ? name : types.trim().split(/^|\s+/).map(function(type) { return type + name; }).join(" ");
      }

      function moved() {
        var p = pointer(parent, id);
        if (p == null) return; // This pointer didn’t change.
        nodefault(), noclick = true;
        customEvent({type: "drag", x: p[0] + dx, y: p[1] + dy, identifier: id}, sublisteners.apply, sublisteners, ["drag", that, args]);
      }

      function ended() {
        var p = pointer(parent, id);
        if (p == null) return; // This pointer didn’t end.
        view.on(name(), null);
        context.on(name(), null);
        if (noclick) view.on(name("click"), nodefault, true), setTimeout(afterended, 0);
        customEvent({type: "end", x: p[0] + dx, y: p[1] + dy, identifier: id}, sublisteners.apply, sublisteners, ["end", that, args]);
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

  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  return drag;
}
