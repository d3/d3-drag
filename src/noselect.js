import {event, select} from "d3-selection";
import nodefault from "./nodefault";

export default function() {
  select(event.on("end.noselect", yesselect).sourceEvent.view).on("selectstart.noselect-" + event.identifier, nodefault, true);
}

function yesselect() {
  select(event.sourceEvent.view).on("selectstart.noselect-" + event.identifier, null);
}
