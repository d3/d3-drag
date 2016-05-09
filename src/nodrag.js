import {event, select} from "d3-selection";
import cancel from "./cancel";

export default function() {
  var dragstart = "dragstart.nodrag-" + event.identifier,
      view = select(event.sourceEvent.view).on(dragstart, cancel, true);
  event.on("end.nodrag", function() {
    view.on(dragstart, null);
  });
}
