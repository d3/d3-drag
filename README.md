# d3-drag

[Drag-and-drop](https://en.wikipedia.org/wiki/Drag_and_drop) is an easy-to-learn and simple pointing interaction technique: move the pointer to an object, press and hold to grab it, “drag” the object to a new location, and then release to “drop”. You might use it to reposition nodes in a [force-directed graph](https://github.com/d3/d3-force), to implement a custom [slider](https://en.wikipedia.org/wiki/Slider_(computing)), or even to paint lines on a canvas.

Alas, it’s still somewhat tedious to implement robust drag-and-drop using standard browser APIs. Until [Pointer Events](https://www.w3.org/TR/pointerevents/) are widely available, you must handle mouse and multitouch input separately, and deal with a handful of browser bugs.

This module offers as a (hopefully!) painless solution. The [drag behavior](#api-reference) provides a convenient abstraction for drag-and-drop using mouse and touch input. It’s flexible and configurable, too: the drag behavior is agnostic about DOM representation, so you can use it to drag SVG, HTML or even Canvas graphics.

## Installing

If you use NPM, `npm install d3-drag`. Otherwise, download the [latest release](https://github.com/d3/d3-drag/releases/latest). You can also load directly from [d3js.org](https://d3js.org), either as a [standalone library](https://d3js.org/d3-drag.v0.0.min.js) or as part of [D3 4.0 alpha](https://github.com/mbostock/d3/tree/4). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3_drag` global is exported:

```html
<script src="https://d3js.org/d3-dispatch.v0.4.min.js"></script>
<script src="https://d3js.org/d3-selection.v0.7.min.js"></script>
<script src="https://d3js.org/d3-drag.v0.0.min.js"></script>
<script>

var drag = d3_drag.drag();

</script>
```

[Try d3-drag in your browser.](https://tonicdev.com/npm/d3-drag)

## API Reference

<a href="#drag" name="drag">#</a> d3.<b>drag</b>([<i>started</i>])

Creates a new drag behavior. If *started* is specified, registers the specified function as a `start` event listener via [*drag*.on](#drag_on), equivalent to:

```js
var drag = d3.drag().on("start", started);
```

The returned behavior, [*drag*](#_drag), is an object and a function, and can be applied to a [selection](https://github.com/d3/d3-selection) by calling it.

<a href="#_drag" name="_drag">#</a> <i>drag</i>(<i>selection</i>)

Applies this drag behavior to the specified [*selection*](https://github.com/d3/d3-selection). This function is typically not invoked directly, and is instead invoked via [*selection*.call](https://github.com/d3/d3-selection#selection_call). For example, to instantiate a drag behavior and apply it to a selection:

```js
d3.selectAll(".node").call(d3.drag(started));
```

Internally, the drag behavior uses [*selection*.on](https://github.com/d3/d3-selection#selection_on) to bind the necessary event listeners for dragging. The listeners use the name `.drag`, so you can subsequently unbind the drag behavior as follows:

```js
selection.on(".drag", null);
```

Applying the drag behavior also sets the [-webkit-tap-highlight-color](https://developer.apple.com/library/mac/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html#//apple_ref/doc/uid/TP40006510-SW5) style to transparent, disabling the tap highlight on iOS. If you want a different tap highlight color, remove or re-apply this style after applying the drag behavior.

<a href="#drag_container" name="drag_container">#</a> <i>drag</i>.<b>container</b>([<i>container</i>])

If *container* is specified, sets the container accessor to the specified object or function and returns the drag behavior. If *container* is not specified, returns the current container accessor, which defaults to:

```js
function container() {
  return this.parentNode;
}
```

The *container* of a drag gesture determines the coordinate system of subsequent [drag events](#drag-events), affecting *event*.x and *event*.y. The element returned by the container accessor is subsequently passed to [d3.mouse](https://github.com/d3/d3-selection#mouse) or [d3.touch](https://github.com/d3/d3-selection#touch), as appropriate, to determine the local coordinates of the pointer.

The default container accessor returns the parent node of the element in the originating selection (see [*drag*](#_drag)) that received the initiating input event. This is often appropriate when dragging SVG or HTML elements, since those elements are typically positioned relative to a parent. For dragging graphical elements with a Canvas, however, you may want to redefine the container as the initiating element itself:

```js
function container() {
  return this;
}
```

Alternatively, the container may be specified as the element directly, such as `drag.container(canvas)`.

<a href="#drag_filter" href="drag_filter">#</a> <i>drag</i>.<b>filter</b>([<i>filter</i>])

If *filter* is specified, sets the filter to the specified function and returns the drag behavior. If *filter* is not specified, returns the current filter, which defaults to:

```js
function filter() {
  return !d3.event.button;
}
```

If the filter returns falsey, the initiating event is ignored and no drag gestures are started. Thus, the filter determines which input events are ignored; the default filter ignores mousedown events on secondary buttons, since those buttons are typically intended for other purposes, such as the context menu.

<a href="#drag_subject" name="drag_subject">#</a> <i>drag</i>.<b>subject</b>([<i>subject</i>])

If *subject* is specified, sets the subject accessor to the specified object or function and returns the drag behavior. If *subject* is not specified, returns the current subject accessor, which defaults to:

```js
function subject(d) {
  return d == null ? this : d;
}
```

The *subject* of a drag gesture represents *the thing being dragged*. It is computed when an initiating input event is received, such as a mousedown or touchstart, immediately before the drag gesture starts. The subject is then exposed as *event*.subject on subsequent [drag events](#drag-events) for this gesture.

The default subject is the [datum](https://github.com/d3/d3-selection#selection_datum) of the element in the originating selection (see [*drag*](#_drag)) that received the initiating input event. If the datum is undefined, the default subject is the element itself. When dragging circle elements in SVG, the default subject is the datum of the circle element that received the initiating mousedown or touchstart; with [Canvas](https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element), the default subject is the canvas element’s datum (regardless of where on the canvas you click). In this case, a custom subject accessor that performs hit-testing would be more appropriate, such as:

```js
function subject() {
  for (var i = 0, n = circles.length, circle, x, y; i < n; ++i) {
    circle = circles[i];
    x = d3.event.x - circle.x;
    y = d3.event.y - circle.y;
    if (x * x + y * y < circle.radius * circle.radius) return circle;
  }
}
```

Typically, the returned subject should be an object that exposes `x` and `y` properties, so that the relative position of the subject and the pointer can be preserved during the drag gesture; see [*drag*.x](#drag_x) and [*drag*.y](#drag_y). If the subject is null or undefined, no drag gesture is started for this pointer; however, other starting touches may yet start drag gestures. See also [*drag*.filter](#drag_filter).

The subject of a drag gesture may not be changed after the gesture starts. The subject accessor is invoked with the same context and arguments as [*selection*.on](https://github.com/d3/d3-selection#selection_on) listeners: the current datum `d` and index `i`, with the `this` context as the current DOM element. During the evaluation of the subject accessor, [d3.event](https://github.com/d3/d3-selection#event) is a beforestart [drag event](#drag-events). Use *event*.sourceEvent to access the initiating input event and *event*.identifier to access the touch identifier. The *event*.x and *event*.y are relative to the [container](#drag_container), and are computed using [d3.mouse](https://github.com/d3/d3-selection#mouse) or [d3.touch](https://github.com/d3/d3-selection#touch) as appropriate.

<a href="#drag_x" name="drag_x">#</a> <i>drag</i>.<b>x</b>([<i>x</i>])

If *x* is specified, sets the *x*-position accessor to the specified function and returns the drag behavior. If *x* is not specified, returns the current *x*-accessor, which defaults to:

```js
function x() {
  return d3.event.subject.x;
}
```

The *x*- and *y*-accessors determine the starting position of the [*subject*](#drag_subject), such that the relative position of the subject (*event*.x and *event*.y) and the pointer is maintained during the drag gesture; see [Drag Events](#drag-events). The default accessors assume the *subject* exposes `x` and `y` properties representing its position.

<a href="#drag_y" name="drag_y">#</a> <i>drag</i>.<b>y</b>([<i>y</i>])

If *y* is specified, sets the *y*-position accessor to the specified function and returns the drag behavior. If *y* is not specified, returns the current *y*-accessor, which defaults to:

```js
function y() {
  return d3.event.subject.y;
}
```

The *x*- and *y*-accessors determine the starting position of the [*subject*](#drag_subject), such that the relative position of the subject (*event*.x and *event*.y) and the pointer is maintained during the drag gesture; see [Drag Events](#drag-events). The default accessors assume the *subject* exposes `x` and `y` properties representing its position.

<a href="#drag_on" name="drag_on">#</a> <i>drag</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>])

If *listener* is specified, sets the event *listener* for the specified *typenames* and returns the drag behavior. If an event listener was already registered for the same type and name, the existing listener is removed before the new listener is added. If *listener* is null, removes the current event listeners for the specified *typenames*, if any. If *listener* is not specified, returns the first currently-assigned listener matching the specified *typenames*, if any. When a specified event is dispatched, each *listener* will be invoked with the same context and arguments as [*selection*.on](https://github.com/d3/d3-selection#selection_on) listeners: the current datum `d` and index `i`, with the `this` context as the current DOM element.

The *typenames* is a string containing one or more *typename* separated by whitespace. Each *typename* is a *type*, optionally followed by a period (`.`) and a *name*, such as `drag.foo` and `drag.bar`; the name allows multiple listeners to be registered for the same *type*. The *type* must be one of the following:

* `start` - after a new pointer becomes active (on mousedown or touchstart).
* `drag` - after an active pointer moves (on mousemove or touchmove).
* `end` - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).

See [*dispatch*.on](https://github.com/d3/d3-dispatch#dispatch_on) for more.

Changes to registered listeners via *drag*.on during a drag gesture *do not affect* the current drag gesture. Instead, you must use [*event*.on](#event_on), which also allows you to register temporary event listeners for the current drag gesture. **Separate events are dispatched for each active pointer** during a drag gesture. For example, if simultaneously dragging multiple subjects with multiple fingers, a start event is dispatched for each finger, even if both fingers start touching simultaneously. See [Drag Events](#drag-events) for more.

By default, the drag behavior does not [prevent default behaviors](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) on mousedown and touchstart; this is necessary because of a [Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=485892#c7) that prevents the capture of mousemove events outside an iframe, and because it would prevent clicks after touchend. When [Pointer Events](https://www.w3.org/TR/pointerevents/) are more widely available, the drag behavior may change to prevent default behaviors on pointerdown. The drag behavior also does not [stop event propagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation) of these initiating events by default. When combining the drag behavior with other behaviors (such as [zooming](https://github.com/d3/d3-zoom); see [example](http://bl.ocks.org/mbostock/6123708)), you may wish to stop propagation on the source event:

```js
drag.on("start", function() {
  d3.event.sourceEvent.stopPropagation(); // Don’t notify other listeners.
});
```

While mousedown and touchstart’s default behaviors are allowed, the drag behavior registers several default named listeners to prevent other browser default behaviors:

* `.nodrag` - prevents [drag-and-drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API).
* `.noselect` - prevents [text selection](https://www.w3.org/TR/selection-api/).
* `.noclick` - prevents [clicks](https://developer.mozilla.org/en-US/docs/Web/Events/click) if the subject is moved.
* `.noscroll` - prevents [scrolling](https://developer.mozilla.org/en-US/docs/Web/Events/scroll).

Remove a listener if you desire the corresponding browser default behavior; for example, `drag.on(".noclick", null)` enables clicks after dragging.

### Drag Events

When a [drag event listener](#drag_on) is invoked, [d3.event](https://github.com/d3/d3-selection#event) is set to the current drag event. The *event* object exposes several fields:

* `type` - the string “start”, “drag” or “end”; see [*drag*.on](#drag_on).
* `subject` - the drag subject, defined by [*drag*.subject](#drag_subject).
* `x` - the *x*-coordinate of the subject; see [*drag*.x](#drag_x) and [*drag*.container](#drag_container).
* `y` - the *y*-coordinate of the subject; see [*drag*.y](#drag_y) and [*drag*.container](#drag_container).
* `identifier` - the string “mouse”, or a numeric [touch identifier](https://www.w3.org/TR/touch-events/#widl-Touch-identifier).
* `sourceEvent` - the underlying input event, such as mousemove or touchmove.

The *event* object also exposes the [*event*.on](#event_on) method.

<a href="#event_on" name="event_on">#</a> <i>event</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>])

Equivalent to [*drag*.on](#drag_on), but only applies to the current drag gesture. Before the drag gesture starts, a [copy](https://github.com/d3/d3-dispatch#dispatch_copy) of the current drag [event listeners](#drag_on) is made. This copy is bound to the current drag gesture and modified by *event*.on. This is useful for temporary listeners that only receive events for the current drag gesture. For example, this start event listener registers temporary drag and end event listeners as closures:

```js
function started() {
  var circle = d3.select(this).classed("dragging", true);

  d3.event.on("drag", dragged).on("end", ended);

  function dragged(d) {
    circle.raise().attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function ended() {
    circle.classed("dragging", false);
  }
}
```
