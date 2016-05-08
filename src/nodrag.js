import {event, select} from "d3-selection";
import nodefault from "./nodefault";

export default function() {
  select(event.on("end.nodrag", yesdrag).sourceEvent.view).on("dragstart.nodrag-" + event.identifier, nodefault, true);
}

function yesdrag() {
  select(event.sourceEvent.view).on("dragstart.nodrag-" + event.identifier, null);
}
