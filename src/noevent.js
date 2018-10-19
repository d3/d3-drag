import {event} from "d3-selection";

export function nopropagation(allowPropagation) {
  !allowPropagation && event.stopImmediatePropagation();
}

export default function(allowPropagation) {
  event.preventDefault();
  !allowPropagation && event.stopImmediatePropagation();
}
