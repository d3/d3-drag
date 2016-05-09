import {event, select} from "d3-selection";
import cancel from "./cancel";

function noselectstart() {
  var selectstart = "selectstart.noselect-" + event.identifier,
      view = select(event.sourceEvent.view).on(selectstart, cancel, true);
  event.on("end.noselect", function() {
    view.on(selectstart, null);
  });
}

function nouserselect() {
  var style = this.ownerDocument.documentElement.style,
      value = style.MozUserSelect;
  style.MozUserSelect = "none";
  event.on("end.noselect", function() {
    style.MozUserSelect = value;
  });
}

export default function() {
  return ("onselectstart" in this ? noselectstart : nouserselect).apply(this, arguments);
}
