export default function DragEvent(type, subject, id, x, y, dispatch) {
  this.type = type;
  this.subject = subject;
  this.identifier = id;
  this.x = x;
  this.y = y;
  this._ = dispatch;
}

DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};
