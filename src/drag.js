import {dispatch} from "d3-dispatch";
import {event, customEvent, select, mouse, touch} from "d3-selection";
import cancel from "./cancel";
import constant from "./constant";
import DragEvent from "./event";
import noclick from "./noclick";
import nodrag from "./nodrag";
import noselect from "./noselect";

function defaultX(d) {
  return (d == null ? event.subject : d).x;
}

function defaultY(d) {
  return (d == null ? event.subject : d).y;
}

// Ignore right-click, since that should open the context menu.
function defaultSubject() {
  return event.sourceEvent.button ? null : this;
}

function defaultContainer() {
  return this.parentNode;
}

export default function() {
  var x = defaultX,
      y = defaultY,
      subject = defaultSubject,
      container = defaultContainer,
      active = {};

  // I’d like to call preventDefault on mousedown to disable native dragging
  // of links or images and native text selection. However, in Chrome this
  // causes mousemove and mouseup events outside an iframe to be dropped:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=269917
  // And if you preventDefault on touchstart on iOS, it prevents the click
  // event on touchend, even if there was no touchmove! So instead, we
  // cancel the specific undesirable behaviors. If you want to change this
  // behavior, you can unregister these listeners!

  var listeners = dispatch("start", "drag", "end")
      .on("start.nodrag", nodrag)
      .on("start.noselect", noselect)
      .on("drag.noclick", noclick)
      .on("drag.noscroll", cancel);

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned() {
    var parent = container.apply(this, arguments);
    if (!start("mouse", parent, mouse, this, arguments)) return;
    select(event.view).on("mousemove.drag", mousemoved).on("mouseup.drag", mouseupped);
  }

  function mousemoved() {
    active.mouse("drag");
  }

  function mouseupped() {
    var m = active.mouse;
    select(event.view).on("mousemove.drag mouseup.drag", null);
    delete active.mouse;
    m("end");
  }

  function touchstarted() {
    var parent = container.apply(this, arguments);
    for (var touches = event.changedTouches, i = 0, n = touches.length; i < n; ++i) {
      start(touches[i].identifier, parent, touch, this, arguments);
    }
  }

  function touchmoved() {
    for (var touches = event.changedTouches, i = 0, n = touches.length, t; i < n; ++i) {
      if (t = active[touches[i].identifier]) {
        t("drag");
      }
    }
  }

  function touchended() {
    for (var touches = event.changedTouches, i = 0, n = touches.length, t; i < n; ++i) {
      if (t = active[touches[i].identifier]) {
        delete active[touches[i].identifier];
        t("end");
      }
    }
  }

  function start(id, parent, point, that, args) {
    var p0 = point(parent, id), dx, dy,
        sublisteners = listeners.copy(),
        node;

    if (!customEvent(new DragEvent("beforestart", node, id, p0[0], p0[1], sublisteners), function() {
      node = event.subject = subject.apply(that, args);
      if (node == null) return false;
      dx = x.apply(that, args) - p0[0] || 0;
      dy = y.apply(that, args) - p0[1] || 0;
      return true;
    })) return false;

    (active[id] = function(type, p) {
      if (p == null) p = point(parent, id);
      customEvent(new DragEvent(type, node, id, p[0] + dx, p[1] + dy, sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
    })("start", p0);

    return true;
  }

  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag) : subject;
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
