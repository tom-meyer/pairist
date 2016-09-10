module.exports = Backbone.View.extend({
  className: 'track',

  initialize: function() {
    _.bindAll(this, 'render');
    this.render();
  },

  render: function() {
    var template = $('#track-template').html();
    $(this.el).append(Mustache.render(template, this.model.attributes));
  }

});
