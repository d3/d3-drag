import {event} from "d3-selection";

export default function() {
  var e = event, s;
  while (s = e.sourceEvent) e = s;
  e.preventDefault();
  e.stopPropagation();
}
