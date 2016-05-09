import {event, select} from "d3-selection";
import cancel from "./cancel";

export default function() {
  event.on("drag.noclick", null).on("end.noclick", function() {
    var click = "click.noclick-" + event.identifier,
        view = select(event.sourceEvent.view).on(click, cancel, true);
    setTimeout(function() { view.on(click, null); }, 0);
  });
}
