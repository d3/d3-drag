import {event, select} from "d3-selection";
import cancel from "./cancel";

export default function() {
  select(event.on("end.noselect", yesselect).sourceEvent.view).on("selectstart.noselect-" + event.identifier, cancel, true);
}

function yesselect() {
  select(event.sourceEvent.view).on("selectstart.noselect-" + event.identifier, null);
}
