const BASE_URL = "https://jsonplace-univclone.herokuapp.com";

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      let result = response.json();

      return result;
    })
    .catch(function (error) {
      console.log(error);
    });
}

/*-------- Users --------*/
function fetchUsers(url) {
  return fetchData(`${url}/users`);
}
/* Users */
function renderUser(user) {
  let result = $(`#user-list`).append(
    $(`<div>`)
      .addClass("user-card")
      .html(
        `<header>
  <h2>${user.name}</h2>
</header>
<section class="company-info">
  <p><b>Contact:</b>${user.email}</p>
  <p><b>Works for:</b>${user.company.name}</p>
  <p><b>Company creed:</b>${user.company.catchPhrase}</p>
</section>
<footer>
  <button class="load-posts">POSTS BY ${user.username}</button>
  <button class="load-albums">ALBUMS BY ${user.username}</button>
</footer>`
      )
      .data("user", user)
  );

  return result;
}
/* UserList */
function renderUserList(userList) {
  $(`#user-list`).empty();
  userList.forEach((element) => {
    $(`#user-list`).append(renderUser(element));
  });
}

$("#user-list").on("click", ".user-card .load-albums", function () {
  // load albums for this user
  let el = $(this).closest(".user-card").data(`user`);

  fetchUserAlbumList(el.id).then(renderAlbumList);

  // render albums for this user
});

/*--------- Albums or Photos---------- */

/* fetch Albums */
function fetchUserAlbumList(userId) {
  return fetchData(
    `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
  );
}

/* render a single album */
function renderAlbum(album) {
  $(`#album-list`).append(
    $(`<div>`).html(
      `<div class="album-card">
  <header>
    <h3>${album.title}, ${album.user.username} </h3>
  </header>
  <section class="photo-list">
  </section>
</div>`)
  );

  album.photos.forEach((element) => {
    return $(`.photo-list`).append(renderPhoto(element));
  });
}

// /* render a single photo */
function renderPhoto(photo) {
  $(`.photo-list`).append(
    $(`<div>`).addClass(`photo-card`).html(
      `<a href="${photo.url}" target="_blank">
    <img src="${photo.url}">
    <figure>${photo.title}</figure>
  </a>`
    )
  );
}

/* render an array of albums */
function renderAlbumList(albumList) {
  $(`#app section.active`).removeClass(`active`);
  $(`#album-list`).addClass(`active`).empty();

  albumList.forEach((el) => {
    return $(`#album-list`).append(renderAlbum(el));
  });
}

/*--------Post--------*/

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

fetchUserPosts(1).then((el) => {
  console.log("user posts", el);
}); // why does this work?  Wait, what?

fetchPostComments(1).then((el) => {
  console.log("comments", el);
}); // again, I'm freaking out here! What gives!?

function renderPost(post) {
$(`#post-list`).append($(`<div>`).addClass(`post-card`).html(
`<div>
<header>
  <h3>${post.title}</h3>
  <h3>${post.user.username}</h3>
</header>
<p>${post.body}</p>
<footer>
  <div class="comment-list"></div>
  <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
</footer>
</div>`).data('post', post))
}


function renderPostList(postList) {
  $(`#app section.active`).removeClass(`active`);
  $(`#post-list`).empty();
  $(`#post-list`).addClass('active')
  postList.forEach((el) => {
   
    return $(`#post-list`).append(renderPost(el));
  });
}

$("#user-list").on("click", ".user-card .load-posts", function () {

  let el = $(this).closest(".user-card").data(`user`);

  fetchUserPosts(el.id).then(renderPostList);
});

/* Comments */
function setCommentsOnPost(post) {
  console.log(post);
  if (post.comments) {
    return Promise.reject(null);
  }

  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    
    return post;
  });
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');

  setCommentsOnPost(post)
    .then(function (post) {
      let comment = postCardElement.find(`.comment-list`)
      comment.empty()
     
      post.comments.forEach((el) => {
        return comment.prepend($(`<h3>`).text(`${el.body} ${el.email}`))
      })
      toggleComments(postCardElement)
      console.log('building comments for the first time...', post);
    })
    .catch(function () {
      toggleComments(postCardElement)
      console.log('comments previously existed, only toggling...', post);
    });
});

/*-------BootStrap------*/
function bootstrap() {
  fetchUsers(BASE_URL).then(function (data) {
    // console.log(data)
    renderUserList(data);
  });
}

bootstrap();
