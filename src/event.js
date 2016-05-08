export default function DragEvent(type, id, x, y, dispatch) {
  this.type = type;
  this.identifier = id;
  this.x = x;
  this.y = y;
  this._ = dispatch;
}

DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

DragEvent.prototype.preventDefault = function() {
  this.sourceEvent.preventDefault();
};
