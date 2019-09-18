window.fn = {};

window.fn.openMenu = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.fn.load = function(page, mytitle) {
  var content = document.getElementById('myNavigator');
  var menu = document.getElementById('menu');
  data = { data: { title: mytitle }, animation: 'slide' };
  content.pushPage(page, data).then(menu.close.bind(menu));
};

//-- called from window.fn.load() --
document.addEventListener('init', function(event) {
  var page = event.target;

  if (page.id === 'home.html') {
    page.querySelector('ons-toolbar .center').innerHTML = 'Han Chiang App';
  } else if (page.id === '1-news.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadNewsContent();
  } else if (page.id === '2-timetable.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadTimetableContent();
  } else if (page.id === '3-classroom.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadClassrmBkContent();
  } else if (page.id === '4-calendars.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadCalendarContent();
  } else if (page.id === 'tempclassroom.html') {
    page.querySelector(
      'ons-toolbar .center'
    ).innerHTML = page.data.title.substr(19);
  } else if (page.id === 'tempcalendar.html') {
    page.querySelector(
      'ons-toolbar .center'
    ).innerHTML = page.data.title.substr(9);
  } else {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  }

  if (page.id === 'tempnews.html') {
    var newContent = '';
    newContent +=
      newsTopImageCollection[newsItem] +
      newsTitleCollection[newsItem] +
      newsDateCollection[newsItem] +
      newsContentCollection[newsItem];
    $('#div-newscontent').html(newContent);
  }

  if (page.id === 'temptimetable.html') {
    var newContent = '';
    newContent += timeTableContents[timeTableItem].content;

    $('#div-timetablecontent').html(newContent);
    $('#div-timetablecontent img').css('width', '200%');
  }

  if (page.id === 'tempclassroom.html') {
    var newContent = '';
    newContent += classroomContents[classroomItem].content;

    $('#div-classroomcontent').html(newContent);
    $('#div-classroomcontent img').css('width', '500%');
  }

  if (page.id === 'tempcalendar.html') {
    var newContent = '';
    newContent += calendarContents[calendarItem].content;

    $('#div-calendarcontent').html(newContent);
    $('#div-calendarcontent img').css('width', '200%');
  }
});

//--------- NEWS ------------
function loadNewsContent() {
  var newsContent = '';
  const apiRoot = 'https://hjuapp.site/wp-json';
  //const apiRoot = 'http://www.hanchiangnews.com/en/wp-json';
  //var imgUrl;
  var allPosts = [];

  var wp = new WPAPI({ endpoint: apiRoot });
  wp.posts()
    .categories(5) // 5 = news, 6 = calendar, 8 = timetables, 9 = classroom booking
    .perPage(30)
    .order('desc')
    .orderby('date')
    .then(function(posts) {
      posts.forEach(function(post) {
        allPosts.push(post);
      });

      getThumbnail2Text(allPosts);
    });
}

var newsListPage; // cache of the news page
var newsTopImageCollection = [];
var newsTitleCollection = [];
var newsDateCollection = [];
var newsContentCollection = [];

function getThumbnail2Text(allPosts) {
  var j = 0;
  const length = allPosts.length;

  var newsContent = '';
  allPosts.forEach(function(post) {
    $.ajax({
      url: 'https://hjuapp.site/wp-json/wp/v2/media/' + post.featured_media,
      type: 'GET',
      success: function(res) {
        j++;
        newsContent += '<ons-list>';
        newsTopImageCollection[j] =
          '<img src= "' + res.media_details.sizes.medium.source_url + '">';
        newsTitleCollection[j] =
          '<ons-list-header>' + post.title.rendered + '</ons-list-header>';
        newsDateCollection[j] =
          '<h4 style="margin-left: 20px">' + extractDate(post) + '</h4>';

        newsContentCollection[j] =
          '<div class="news-content-rendered">' +
          post.content.rendered +
          '</div>';

        newsContent += '<ons-list-item tappable';
        newsContent += ' onclick="getNewsContent(';
        newsContent += j;
        newsContent += ')"';
        newsContent += '>';
        newsContent += '<div class="left">';
        newsContent += '<img src= "';
        newsContent += res.media_details.sizes.thumbnail.source_url;
        newsContent += '" class="list-item__thumbnail">';
        newsContent += '</div>';
        newsContent += '<div class="center">';
        newsContent +=
          '<span class ="list-item__title">' + post.title.rendered + '</span>';
        newsContent +=
          '<span class ="list-item__subtitle">' + extractDate(post) + '</span>';
        newsContent += '</div>';

        newsContent += '</ons-list-item>';
        newsContent += '</ons-list>';

        if (j == length) {
          $('.ui-content').html(newsContent);

          $('.progress-circular').css('display', 'none');
          newsListPage = newsContent;
        }
      }
    });
  });
}

function extractDate(post) {
  var today = new Date(post.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return today;
}

var newsItem;
//-- called from embedded markup inserted in getThumbnail2Text() --
function getNewsContent(item) {
  newsItem = item;
  var content = document.getElementById('myNavigator');

  data = { data: { title: 'News' }, animation: 'slide' };
  content.pushPage('tempnews.html', data);
}

//--------- TIMETABLE ----------------
var timeTableContents = [];
var k = 0;

function loadTimetableContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(8) // 5 = news, 6 = calendar, 8 = timetables, 9 = classroom booking
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        k++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getTimeTableContent(';
        content += k;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        timeTableContents[k] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';

      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var timetableItem;
function getTimeTableContent(t) {
  timeTableItem = t;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = timeTableContents[t];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('temptimetable.html', data);
}

//-------- CLASSROOM ---------
var classroomContents = [];
var r = 0;

function loadClassrmBkContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(9) // 6 = calendar, 8 = timetables, 9 = classroom booking
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        r++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getClassroomContent(';
        content += r;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        classroomContents[r] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';
      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var classroomItem;
function getClassroomContent(p) {
  classroomItem = p;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = classroomContents[p];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('tempclassroom.html', data);
}

//-------- CALENDAR ---------
var calendarContents = [];
var n = 0;

function loadCalendarContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(6) //6 = calendars
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        n++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getCalendarContent(';
        content += n;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        calendarContents[n] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';
      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var calendarItem;
function getCalendarContent(n) {
  calendarItem = n;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = calendarContents[n];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('tempcalendar.html', data);
}

//---- zoomIn image ------
function zoomIn() {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize + 200;
  $('.enlargeable img').width(imagesize);
}

//---- zoomOut image ------
function zoomOut() {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize - 200;
  $('.enlargeable img').width(imagesize);
}

function fitWidth() {
  //$('img').width($(document).width());
  $('.enlargeable img').width('100%');
  draggable.draggabilly('setPosition', 0, 0);
}

var draggable;
function makeEmDraggable() {
  draggable = $('.enlargeable img').draggabilly({
    // options...
  });
}

//--- default zoom -----
function zoomDefault(zoomLevel) {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize + zoomLevel;
  $('.enlargeable img').width(imagesize);
}
