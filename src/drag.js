import {dispatch} from "d3-dispatch";
import {event, customEvent, select, mouse, touch} from "d3-selection";
import nodrag, {yesdrag} from "./nodrag";
import noevent, {nopropagation} from "./noevent";
import constant from "./constant";
import DragEvent from "./event";

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
      listeners = dispatch("start", "drag", "end").on("start", started),
      active = 0,
      mousemoving,
      touchending;

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
    var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
    if (!gesture) return;

    select(event.view)
        .on("mousemove.drag", mousemoved, true)
        .on("mouseup.drag", mouseupped, true);

    nodrag(event.view);
    nopropagation();
    mousemoving = false;
    gesture("start");
  }

  function mousemoved() {
    noevent();
    mousemoving = true;
    gestures.mouse("drag");
  }

  function mouseupped() {
    var view = select(event.view)
        .on("mousemove.drag mouseup.drag", null);

    if (mousemoving) {
      view.on("click.drag", noevent, true);
      setTimeout(function() { view.on("click.drag", null); }, 0);
    }

    yesdrag(event.view);
    noevent();
    gestures.mouse("end");
  }

  function touchstarted() {
    if (!filter.apply(this, arguments)) return;
    var touches = event.changedTouches,
        c = container.apply(this, arguments),
        n = touches.length, i, gesture;

    nopropagation();
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(touches[i].identifier, c, touch, this, arguments)) {
        gesture("start");
      }
    }
  }

  function touchmoved() {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    noevent();
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        gesture("drag");
      }
    }
  }

  function touchended() {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    nopropagation();
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        gesture("end");
      }
    }
  }

  function beforestart(id, container, point, that, args) {
    var p0 = point(container, id), dx, dy,
        sublisteners = listeners.copy(),
        node;

    if (!customEvent(new DragEvent("beforestart", node, id, active, p0[0], p0[1], sublisteners), function() {
      if ((event.subject = node = subject.apply(that, args)) == null) return false;
      dx = x.apply(that, args) - p0[0] || 0;
      dy = y.apply(that, args) - p0[1] || 0;
      return true;
    })) return;

    return function gesture(type) {
      var p, n;
      switch (type) {
        case "start": p = p0, gestures[id] = gesture, n = active++; break;
        case "end": delete gestures[id], --active; // nobreak
        case "drag": p = point(container, id), n = active; break;
      }
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
