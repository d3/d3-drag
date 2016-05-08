import {event, select} from "d3-selection";
import nodefault from "./nodefault";

export default function() {
  event.on("drag.noclick", null).on("end.noclick", function() {
    var click = "click.noclick-" + event.identifier,
        view = select(event.sourceEvent.view).on(click, nodefault, true);
    setTimeout(function() { view.on(click, null); }, 0);
  });
}
