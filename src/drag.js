import {dispatch} from "d3-dispatch";
import {select, pointer} from "d3-selection";
import nodrag, {yesdrag} from "./nodrag.js";
import noevent, {nonpassive, nonpassivecapture, nopropagation} from "./noevent.js";
import constant from "./constant.js";
import DragEvent from "./event.js";

// Ignore right-click, since that should open the context menu.
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(event, d) {
  return d == null ? {x: event.x, y: event.y} : d;
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

export default function() {
  var filter = defaultFilter,
      container = defaultContainer,
      subject = defaultSubject,
      touchable = defaultTouchable,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousedownx,
      mousedowny,
      mousemoving,
      touchending,
      framerate = 60,
      timestamp = Date.now(),
      clickDistance2 = 0;

  function drag(selection) {
    selection
        .on("pointerdown.drag", pointerdowned)
      .filter(touchable)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function pointerdowned(event, d) {
    requestAnimationFrame((t1) => {
      requestAnimationFrame((t2) => {
        framerate = 1000 / (t2 - t1);
      });
    });

    if (touchending || !filter.call(this, event, d)) return;

    var gesture = beforestart(this, container.call(this, event, d), event, d, event.pointerId);
    if (!gesture) return;
    select(event.view)
      .on("pointermove.drag", pointermoved, nonpassivecapture)
      .on("pointerup.drag", pointerupped, nonpassivecapture);
    nodrag(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }

  function pointermoved(event) {
    // Polling rate on some devices means our calculation of dx/dy will always result in 0 unless we wait long enough between updates
    if (Date.now() - timestamp < (1000 / framerate)) return; 
    timestamp = Date.now();
    
    noevent(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures[event.pointerId]("drag", event);
  }

  function pointerupped(event) {
    select(event.view).on("pointermove.drag pointerup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent(event);
    gestures[event.pointerId]("end", event);
  }

  function beforestart(that, container, event, d, identifier, touch) {
    var dispatch = listeners.copy(),
        pointerType = event.pointerType,
        p = pointer(touch || event, container), dx, dy,
        s;

    if ((s = subject.call(that, new DragEvent("beforestart", {
        sourceEvent: event,
        target: drag,
        identifier,
        pointerType,
        active,
        x: p[0],
        y: p[1],
        dx: 0,
        dy: 0,
        dispatch
      }), d)) == null) return;
      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;
      
    return function gesture(type, event, touch) {
      var p0 = p, n;
      switch (type) {
        case "start": gestures[identifier] = gesture, n = active++; break;
        case "end": delete gestures[identifier], --active; // falls through
        case "drag": p = pointer(touch || event, container), n = active; break;
      }

      dispatch.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event,
          subject: s,
          target: drag,
          identifier,
          pointerType,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch
        }),
        d
      );
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

  drag.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag) : touchable;
  };

  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  drag.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };

  return drag;
}
