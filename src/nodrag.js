import {event, select} from "d3-selection";
import cancel from "./cancel";

export default function() {
  select(event.on("end.nodrag", yesdrag).sourceEvent.view).on("dragstart.nodrag-" + event.identifier, cancel, true);
}

function yesdrag() {
  select(event.sourceEvent.view).on("dragstart.nodrag-" + event.identifier, null);
}
