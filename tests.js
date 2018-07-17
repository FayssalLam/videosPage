QUnit.module("SearchManager Tests", function () {
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <div class="form-group">
          <label for="quick-search">Search</label>
          <input type="text" class="form-control" id="quick-search" placeholder="Search ...">
        </div>
        <div class="form-group">
          <select id="selectPerPage" class="form-control">
            <option value="10">10</option>
            <option class="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input id="moreTen" type="checkbox" value="">
            Users that have more than 10 likes
          </label>
        </div>
    `;
    const searchManager = new app.SearchManager({
        searchContainer,
        vimeo : app.vimeo
    });

    QUnit.test('test _filterVideos with text', function (assert) {
        var results = searchManager._filterVideos({
            searchText : 'was filmed between 4th and 11th April 2011. I had'
        });
        var expectedResults = [{
            title : 'The Mountain'
        }]

        assert.equal(results[0].title, expectedResults[0].title, "The first's element title is ok");

        //TODO other results ( use assert.deepEquel )
    });

    QUnit.test('test _filterVideos with user have more than 10 likes', function (assert) {
        var results = searchManager._filterVideos({
            moreThanTen : true
        });
        var expectedResults = [{
            title : 'The Mountain'
        }]

        assert.equal(results[0].title, expectedResults[0].title, "The first's element title is ok");
    });

    QUnit.test('test _filterVideos with  user more likes 10 & text search... ', function (assert) {
        var results = searchManager._filterVideos({
            moreThanTen : true,
            searchText : 'This video has some iconic landmarks'

        });
        var expectedResults = [{
            title : 'Landscapes: Volume Two'
        }]

        assert.equal(results[0].title, expectedResults[0].title, "The first's element title is ok");
    });

    QUnit.test('test _filterVideos with likes less than 10 & search text ...', function (assert) {
        var results = searchManager._filterVideos({
            moreThanTen : false,
            searchText : 'hyper real fantasy'

        });
        var expectedResults = [{
            title : 'Nuit Blanche'
        }]

        assert.equal(results[0].title, expectedResults[0].title, "The first's element title is ok");
    });


});
