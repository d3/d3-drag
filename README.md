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

…

<a href="#_drag" name="_drag">#</a> <i>drag</i>(<i>selection</i>)

… Typically invoked via [*selection*.call](https://github.com/d3/d3-selection#selection_call).

Registered listeners use the name `.drag`, allowing you to unbind the drag behavior if desired:

```js
selection.on(".drag", null);
```

<a href="#drag_subject" name="drag_subject">#</a> <i>drag</i>.<b>subject</b>([<i>subject</i>])

…

```js
function subject() {
  return d3.event.sourceEvent.button ? null : this;
}
```

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

<a href="#event_on" name="event_on">#</a> <i>event</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>])

… Like [*drag*.on](#drag_on), but only applies to the current drag.
