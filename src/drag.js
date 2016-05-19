import {dispatch} from "d3-dispatch";
import {event, customEvent, select, mouse, touch} from "d3-selection";
import cancel from "./cancel";
import constant from "./constant";
import DragEvent from "./event";
import {noselect, yesselect} from "./noselect";

// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(d) {
  return d;
}

function defaultX() {
  return event.subject.x;
}

function defaultY() {
  return event.subject.y;
}

export default function(started) {
  var filter = defaultFilter,
      container = defaultContainer,
      subject = defaultSubject,
      x = defaultX,
      y = defaultY,
      gestures = {},
      active = 0,
      mousemoving,
      touchending;

  var listeners = dispatch("start", "drag", "end")
      .on("start", started);

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned() {
    if (touchending || !filter.apply(this, arguments)) return;
    var parent = container.apply(this, arguments), m;
    if (!(m = beforestart("mouse", parent, mouse, this, arguments))) return;

    select(event.view)
        .on("mousemove.drag", mousemoved, true)
        .on("mouseup.drag", mouseupped, true)
        .on("dragstart.drag", cancel, true)
        .call(noselect);

    mousemoving = false;
    m("start");
  }

  function mousemoved() {
    mousemoving = true;
    gestures.mouse("drag");
  }

  function mouseupped() {
    var v = select(event.view).on("mousemove.drag mouseup.drag dragstart.drag", null).call(yesselect);
    if (mousemoving) v.on("click.drag", cancel, true), setTimeout(function() { v.on("click.drag", null); }, 0);
    gestures.mouse("end");
  }

  function touchstarted() {
    if (!filter.apply(this, arguments)) return;
    var parent = container.apply(this, arguments);
    for (var touches = event.changedTouches, i = 0, n = touches.length, t; i < n; ++i) {
      if (t = beforestart(touches[i].identifier, parent, touch, this, arguments)) {
        t("start");
      }
    }
  }

  function touchmoved() {
    for (var touches = event.changedTouches, i = 0, n = touches.length, t; i < n; ++i) {
      if (t = gestures[touches[i].identifier]) {
        t("drag");
      }
    }
  }

  function touchended() {
    for (var touches = event.changedTouches, i = 0, n = touches.length, t; i < n; ++i) {
      if (t = gestures[touches[i].identifier]) {
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
        t("end");
      }
    }
  }

  function beforestart(id, parent, point, that, args) {
    var p0 = point(parent, id), dx, dy,
        sublisteners = listeners.copy(),
        node;

    if (!customEvent(new DragEvent("beforestart", node, id, active, p0[0], p0[1], sublisteners), function() {
      node = event.subject = subject.apply(that, args);
      if (node == null) return false;
      dx = x.apply(that, args) - p0[0] || 0;
      dy = y.apply(that, args) - p0[1] || 0;
      return true;
    })) return;

    return function gesture(type) {
      var p, n;
      switch (type) {
        case "start": p = p0, gestures[id] = gesture, n = active++; break;
        case "end": delete gestures[id], --active; // nobreak
        case "drag": p = point(parent, id), n = active; event.preventDefault(); break;
      }
      event.stopImmediatePropagation();
      customEvent(new DragEvent(type, node, id, n, p[0] + dx, p[1] + dy, sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
    };
  }

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
  };

  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag) : subject;
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
