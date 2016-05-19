import {event} from "d3-selection";
import noevent from "./noevent";

function noselectstart(selection) {
  selection.on("selectstart.drag", noevent, true);
}

function yesselectstart(selection) {
  selection.on("selectstart.drag", null);
}

function nouserselect() {
  var root = event.view.document.documentElement, style = root.style;
  root.__noselect = style.MozUserSelect;
  style.MozUserSelect = "none";
}

function yesuserselect() {
  var root = event.view.document.documentElement;
  root.style.MozUserSelect = root.__noselect;
  delete root.__noselect;
}

export function noselect(selection) {
  return ("onselectstart" in event.target ? noselectstart : nouserselect)(selection);
}

export function yesselect(selection) {
  return ("onselectstart" in event.target ? yesselectstart : yesuserselect)(selection);
}
