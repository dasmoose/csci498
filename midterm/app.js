$(document).ready(function () {

  // Create Model
  var CatPic = Backbone.Model.extend({});

  // Create Collection
  var Cattery = Backbone.Collection.extend({
    model: CatPic,
    url: 'http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=d618505af7c9d6dcf7de0aa79aca157b&nojsoncallback=1&tags=cat',
    parse: function (response) {
      return response.results;
    }
  });

  // Enter into Database
  var db = SQLite({ shortName: 'catDB' });

  var remove_cat = function (id) {
    db.destroy('cattery', { id: id });
    $(document.getElementById(id)).remove(); 
    return false;
  }

  db.dropTable('cattery');
  db.createTable('cattery', 'title TEXT, url TEXT, id INTEGER PRIMARY KEY');

  collect = new Cattery();
  collect.fetch({
    success: function (collection, response) {
      _.each(response.photos, function (model) {
        _.each(model, function (mer) {
          var url_l = "http://farm" + mer.farm + ".static.flickr.com/" + mer.server + "/" + mer.id + "_" + mer.secret + "_m.jpg"; 
          db.insert('cattery', { title: mer.title, url: url_l, id: mer.id });
        });
      });
      db.select('cattery', '*', null, null, function (results) { 
        var x; 
        for(x=0; x<results.rows.length; x++) { 
          $( '#cat_data tr:last').after('<tr id=\"' + results.rows.item(x).id  + '\"><td>' + results.rows.item(x).title + '</td> <td><img src=\"' + results.rows.item(x).url + '\"></td><td><p class="delete" id=\"' + results.rows.item(x).id + '\">X</p></td></tr>');
        } 
      });
    },
    failure: function () {
      console.log('FAIL');
    }
});


$( '#form' ).submit(function() {
  var title =  $( '#title' ).val();
  var url = $( '#url' ).val();
  var id = $( '#hidden_id').val();

  if( id == "" ){
    db.insert('cattery', { title: title, url: url });
    db.select('cattery', '*', null, null, function (results) {
    $( '#cat_data tr:last' ).after('<tr id=\"' + results.rows.item(results.rows.length-1).id  + '\"><td>' + results.rows.item(results.rows.length-1).title + '</td> <td><img src=\"' + results.rows.item(results.rows.length-1).url + '\"></td><td><p class="delete" id=\"' + results.rows.item(results.rows.length-1).id + '\">X</p></td></tr>'); 
    });
  }
  else {
   db.update('cattery', { url: url, title: title}, { id: id }); 
    $('tr#' + id)[0].innerHTML = $('tr#' + id).textContent = '<td>' + title + '</td> <td><img src=\"' + url + '\"></td><td><p class="delete" id=\"' + id + '\">X</p></td>';
  }
  $( '#url' ).val("");
  $( '#title' ).val("");
  $( '#hidden_id' ).val("");
});

$(document).on('click', 'tr', function() {
  var tr = $(this);
  $( '#title' ).val(tr.context.cells[0].textContent);
  $( '#url' ).val(tr.context.cells[1].firstElementChild.src);
  $( '#hidden_id' ).val(tr.attr('id'));
});

$(document).on('click', '.delete',  function() {
  var id = $(this).attr('id');
  db.destroy('cattery', { id: id }); 
  $('tr#' + id).remove();
});

});
