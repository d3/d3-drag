import constant from "./constant";
import {dispatch} from "d3-dispatch";
import {event, customEvent, select, mouse, touch} from "d3-selection";

function nodefault() {
  event.preventDefault();
}

function defaultX(d) {
  return d && d.x;
}

function defaultY(d) {
  return d && d.y;
}

// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return !event.sourceEvent.button;
}

function defaultContainer() {
  return this.parentNode;
}

function nodrag() {
  var name = ".nodrag-" + event.identifier,
      view = select(event.sourceEvent.view).on("dragstart" + name, nodefault, true);
  event.on("end" + name, function() { view.on("dragstart" + name, null); });
}

function noselect() {
  var name = ".noselect-" + event.identifier,
      view = select(event.sourceEvent.view).on("selectstart" + name, nodefault, true);
  event.on("end" + name, function() { view.on("selectstart" + name, null); });
}

function noscroll() {
  var name = ".noscroll-" + event.identifier;
  event.on("drag" + name, function() { event.sourceEvent.preventDefault(); });
}

function noclick() {
  var name = ".noclick-" + event.identifier,
      view = select(event.sourceEvent.view),
      start = event.on("drag" + name, function() { start.on("drag" + name, null).on("end" + name, end); });

  function end() {
    view.on("click" + name, nodefault, true);
    setTimeout(function() { view.on("click" + name, null); }, 0);
  }
}

export default function(started) {
  var x = defaultX,
      y = defaultY,
      filter = defaultFilter,
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
      .on("start.noscroll", noscroll)
      .on("start.noclick", noclick)
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
    if (!start("mouse", mouse, this, arguments)) return;
    select(event.view).on("mousemove.drag", mousemoved).on("mouseup.drag", mouseupped);
  }

  function mousemoved() {
    active.mouse("drag");
  }

  function mouseupped() {
    active.mouse("end");
    select(event.view).on("mousemove.drag mouseup.drag", null);
    delete active.mouse;
  }

  function touchstarted() {
    for (var touches = event.changedTouches, i = 0, n = touches.length; i < n; ++i) {
      start(touches[i].identifier, touch, this, arguments);
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
        t("end");
        delete active[touches[i].identifier];
      }
    }
  }

  function start(id, point, that, args) {

    if (!customEvent({type: "beforestart", identifier: id}, function() {
      if (filter.apply(that, args)) {
        parent = container.apply(that, args);
        return true;
      }
    })) return false;

    var parent,
        startevent,
        sublisteners = listeners.copy(),
        p0 = point(parent, id),
        dx = x.apply(that, args) - p0[0] || 0,
        dy = y.apply(that, args) - p0[1] || 0;

    active[id] = function(type) {
      var p1 = point(parent, id);
      customEvent({
        type: type,
        identifier: id,
        x: p1[0] + dx,
        y: p1[1] + dy
      }, sublisteners.apply, sublisteners, [type, that, args]);
    };

    customEvent(startevent = {
      type: "start",
      identifier: id,
      x: p0[0] + dx,
      y: p0[1] + dy,
      on: on
    }, sublisteners.apply, sublisteners, ["start", that, args]);

    function on() {
      var value = sublisteners.on.apply(sublisteners, arguments);
      return value === sublisteners ? startevent : value;
    }

    return true;
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
