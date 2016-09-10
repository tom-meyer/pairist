var Storage = require('./storage.js');
var TracksGroupView = require('./tracksGroupView.js');
var TrackView = require('./trackView.js');

$(function() {

  var t1 = new Track();
  t1.set({
    name: 'Mangage Snapshots',
    devs: [
      {name: 'Tom'},
      {name: 'Chris'},
    ]
  });

  var Stage = Backbone.View.extend({
    el: $('#stage'),

    initialize: function() {
      _.bindAll(this, 'render');
      this.listenTo(this.model, "change", this.render);
      this.render();
    },

    render: function() {
      //var template = $('#template').html();
      //$(this.el).append(Mustache.render(template, t1.attributes));
      this.model
    },

    addTrackGroup: function() {
    }

  });

  var stage = new Stage({
    model: new Stage(Tracks.byStage())
  });

});
