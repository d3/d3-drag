# d3-drag

…

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

<a href="#drag_subject" name="drag_subject">#</a> <i>drag</i>.<b>subject</b>([<i>subject</i>])

If *subject* is specified, sets the subject accessor to the specified function and returns the drag behavior. If *subject* is not specified, returns the current subject accessor, which defaults to:

```js
function subject() {
  return d3.event.sourceEvent.button ? null : this;
}
```

The *subject* of a drag gesture represents the thing being dragged. It is computed when an initiating input event is received, such as a mousedown or touchstart, immediately before the drag gesure starts. If non-null, the subject is then exposed as *event*.subject on subsequent [drag events](#drag-events) for this gesture.

If the subject accessor returns null or undefined, the initiating event is ignored and a drag gesture is not started. Thus, a subject accessor determines which input events are ignored; the default subject accessor ignores mousedown events on secondary buttons, since those buttons are typically intended for other purposes. (The right button for the context menu, and the middle button for scrolling.)

The default subject is the element in the originating selection (see [*drag*](#_drag)) that received the initiating input event. When dragging circle elements in SVG, it would be the circle element that received the mousedown or touchstart; with [Canvas](https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element), the default subject is the canvas element (regardless of where on the canvas you click). A custom subject accessor can perform hit-testing and return an appropriate datum to represent the object to be dragged:

```js
function subject() {
  var circle, i, x, y, n = circles.length;
  for (i = 0; i < n; ++i) {
    circle = circles[i];
    x = d3.event.x - circle.x;
    y = d3.event.y - circle.y;
    if (x * x + y * y < circle.radius * circle.radius) return circle;
  }
}
```

The subject of a drag gesture may not be changed after the gesture starts; it can only be computed immediately before. The subject accessor is invoked with the same context and arguments as [*selection*.on](https://github.com/d3/d3-selection#selection_on) listeners: the current datum `d` and index `i`, with the `this` context as the current DOM element. During the evaluation of the subject accessor, [d3.event](https://github.com/d3/d3-selection#event) is set to a beforestart [drag event](#drag-events); use *event*.sourceEvent to access the initiating input event and *event*.identifier to access the touch identifier, if needed.

<a href="#drag_container" name="drag_container">#</a> <i>drag</i>.<b>container</b>([<i>container</i>])

…

```js
function container() {
  return this.parentNode;
}
```

<a href="#drag_x" name="drag_x">#</a> <i>drag</i>.<b>x</b>([<i>x</i>])

…

```js
function x(d) {
  return (d == null ? d3.event.subject : d).x;
}
```

<a href="#drag_y" name="drag_y">#</a> <i>drag</i>.<b>y</b>([<i>y</i>])

…

```js
function y(d) {
  return (d == null ? d3.event.subject : d).y;
}
```

<a href="#drag_on" name="drag_on">#</a> <i>drag</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>])

…

Types:

* `start` -
* `drag` -
* `end` -

Built-in listeners:

* `.nodrag` -
* `.noselect` -
* `.noclick` -
* `.noscroll` -

### Drag Events

<a href="#event" name="event">#</a> <i>event</i>

* `type` - “beforestart”, “start”, “drag” or “end”
* `subject` -
* `identifier` - “mouse” or a touch identifier (long)
* `x` -
* `y` -
* `sourceEvent` -

<a href="#event_on" name="event_on">#</a> <i>event</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>])

… Like [*drag*.on](#drag_on), but only applies to the current drag.
