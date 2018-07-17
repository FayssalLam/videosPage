(function() {
    window.app = window.app || {};

    app.UIManager = function({ container, containerId, videoTemplate, videoTemplateId, paginationContainer, paginationContainerId }) {
        this.videosContainer = container || document.getElementById(containerId);
        this.videoTemplate = videoTemplate || document.getElementById(videoTemplateId);
        this.paginationContainer = paginationContainer || document.getElementById(paginationContainerId);
    };

    app.UIManager.prototype.render = function({ videos, itemsPerPage }) {
        itemsPerPage = itemsPerPage || 10;

        this._currentPage = 1;
        this._itemsPerPage = itemsPerPage;
        this._videosElements = videos.map((video) => this._creteVideoContainer({ video }));

        this._renderPage();

    };

    app.UIManager.prototype._renderPage = function() {
        var from = (this._currentPage - 1) * this._itemsPerPage,
        to = Math.min((this._currentPage) * this._itemsPerPage, this._videosElements.length);

        var appendFunc = document.appendChild.bind(this.videosContainer);
        this.videosContainer.innerHTML = "";
        this._videosElements
        .slice(from, to)
        .map((fragment) => document.importNode(fragment, true))
        .forEach(appendFunc);

        var pagination = this._createPagination();

        this.paginationContainer.innerHTML = '';
        this.paginationContainer.appendChild(pagination);
    }

    app.UIManager.prototype._createPagination = function() {
        var totalItems = this._videosElements.length,
        currentPage = this._currentPage,
        itemsPerPage = this._itemsPerPage;

        //TODO optimize
        var ul = document.createElement('ul');
        ul.classList.add('pager');

        var previous = document.createElement('li'),
        next = document.createElement('li');
        previous.innerHTML = '<a href="#">Previous</a></li>';
        next.innerHTML = '<a href="#">next</a></li>';

        if (totalItems > itemsPerPage) {
            var hasNextPage = itemsPerPage * currentPage < totalItems;
            if (currentPage != 1) {
                previous.getElementsByTagName('a')[0].addEventListener('click', (e) => {
                    e.preventDefault();
                    this._currentPage--;
                    this._renderPage();
                });
                ul.appendChild(previous);
            }
            if (hasNextPage) {
                next.getElementsByTagName('a')[0].addEventListener('click', (e) => {
                    e.preventDefault();
                    this._currentPage++;
                    this._renderPage();
                });
                ul.appendChild(next);
            }
        }

        return ul;
    }

    app.UIManager.prototype._creteVideoContainer = function({ video }) {
        var templateContent = this.videoTemplate.content;

        //templateContent.querySelector('.video').innerHTML = video.video;
        templateContent.querySelector('.title').innerHTML = video.title;
        templateContent.querySelector('.videolink').href = video.videolink;
        templateContent.querySelector('.author').innerHTML = video.author;
        templateContent.querySelector('.videoPicture').src = video.videoPicture;
        templateContent.querySelector('#authorImg').src = video.userPicture;
        templateContent.querySelector('.description').innerHTML = video.description;
        templateContent.querySelector('.authorlink').href = video.authorlink;
        templateContent.querySelector('.authorTitle').href = video.authorlink;
        templateContent.querySelector('.likes').innerHTML = video.likes+" likes";
        templateContent.querySelector('.views').innerHTML = video.views+" views";
        templateContent.querySelector('.comments').innerHTML = video.comments+" comments";

        var clone = document.importNode(templateContent, true);

        return clone;
    };

    app.SearchManager = function({ searchContainer, searchContainerId, vimeo }) {
        this.searchContainer = searchContainer || document.getElementById(searchContainerId);
        this.vimeo = vimeo;
        this._TextSearched = "";
        this._moreThanTen = false;
        this._onChangeListeners = [];
        this._initEventListeners();
    };

    app.SearchManager.prototype._filterVideos = function({ searchText, moreThanTen }) {
        searchText = searchText || "";
        moreThanTen = moreThanTen || false;
        return this.vimeo.data
        .map((item) => {
            let userTotalLikes = item.user.metadata.connections.likes.total;
            let userPicture = (item.user.pictures !== null) ? item.user.pictures.sizes[3].link : 'http://via.placeholder.com/300x300';
            return {
                title: item.name,
                videolink: item.link,
                videoPicture: item.pictures.sizes[2].link,
                video: item.embed.html,
                description: item.description,
                likes: item.user.metadata.connections.likes.total,
                comments: item.metadata.connections.comments.total,
                views: item.stats.plays,
                authorlink: item.user.link,
                author: item.user.name,
                userPicture,                    
                userTotalLikes,

            };
        })
        .filter((vid) => {
            if (vid.description !== null) {

                var idx = vid.description.toLowerCase().indexOf(searchText.toLowerCase());
                var filtred = idx !== -1;
                if (moreThanTen) {
                    filtred = (filtred && vid.userTotalLikes > 10);
                }
            }
            return filtred;
        });
    };
    app.SearchManager.prototype._eventsfilter = function(e) {
        var choisedEvent = e.target.id;
        if (choisedEvent == "moreTen") {
            this._moreThanTen = e.target.checked;
        } else if (choisedEvent == "selectPerPage") {
            this._perPage = e.target.value;
        } else { this._TextSearched = e.target.value; }
        var videos = this._filterVideos({
            searchText: this._TextSearched,
            moreThanTen: this._moreThanTen
        });
        itemsPerPage = this._perPage;
        this._callListeners({ videos, itemsPerPage });


    }

    app.SearchManager.prototype._callListeners = function({ videos, itemsPerPage }) {
        this._onChangeListeners.forEach((calB) => {
            calB.call(null, { videos, itemsPerPage });
        });
    };

    app.SearchManager.prototype.onChange = function(callBack) {
        this._onChangeListeners.push(callBack);
    };
    app.SearchManager.prototype._initEventListeners = function() {
        var searchContainerEvt = this.searchContainer;
        var searchInput = searchContainerEvt.querySelector("#quick-search");
        var checkedInput = searchContainerEvt.querySelector("#moreTen");
        var selectPerPage = searchContainerEvt.querySelector("#selectPerPage");
        searchInput.addEventListener("keyup", (e) => {
            this._eventsfilter(e);
        });
        checkedInput.addEventListener("click", (e) => {
            this._eventsfilter(e);
        });
        selectPerPage.addEventListener("change", (e) => {
            this._eventsfilter(e);
        });
    };


})();



document.addEventListener("DOMContentLoaded", function() {
    var vimeo = app.vimeo;

    var uiManager = new app.UIManager({
        containerId: 'videos',
        paginationContainerId: 'pagination',
        videoTemplateId: 'video-template',
        vimeo: vimeo
    });

    var searchManager = new app.SearchManager({
        searchContainerId: 'sidebar',
        vimeo: vimeo
    });


    var videos = searchManager._filterVideos({
        searchText: searchManager._TextSearched,
        moreThanTenthis: searchManager._moreThanTen
    });

    searchManager.onChange(({ videos, itemsPerPage }) => {
        uiManager.render({ videos, itemsPerPage });
    });

    searchManager._callListeners({ videos, itemsPerPage: 10 });



    window.d = {
        uiManager,
        searchManager
    };


});
