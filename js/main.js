let inp = $(".task-input");
let btn = $(".btn");
let list = $(".task-list");
let editedId = null;
let searchText = "";
let API = "http://localhost:8000/todo";
let pageCount = 1;
let page = 1;

render();

$(".search-inp").on("input", function (e) {
  searchText = e.target.value;
  render();
});
btn.on("click", function () {
  if (!inp.val().trim()) {
    alert("Заполните поле");
    inp.val("");
    return;
  }
  let newTask = {
    task: inp.val(),
  };
  postNewTask(newTask);
  inp.val("");
});

function postNewTask(newTask) {
  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(newTask),
  }).then(() => render());
}

async function render() {
  let res = await fetch(`${API}?q=${searchText}&_page=${page}&_limit=5`);
  let data = await res.json();
  list.html("");
  getPagination();
  data.forEach((item) => {
    list.append(`
        <li id=${item.id}>
        ${item.task}
        <button class="btn-delete">Delete</button>
        <button class="btn-edit">Edit</button>
        </li>      
      `);
  });
}

$("body").on("click", ".btn-delete", function (e) {
  let id = e.target.parentNode.id;
  fetch(`${API}/${id}/`, {
    method: "DELETE",
  }).then(() => render());
});

$("body").on("click", ".btn-edit", function (e) {
  editedId = e.target.parentNode.id;

  fetch(`${API}/${editedId}/`)
    .then((res) => res.json())
    .then((taskToEdit) => {
      $(".edit-inp").val(taskToEdit.task);
      $(".main-modal").css("display", "block");
    });
});

$(".btn-save").on("click", function (e) {
  if (!$(".edit-inp").val().trim()) {
    alert("Заполните поле");
    $(".edit-inp").val("");
    return;
  }
  let editedTask = {
    task: $(".edit-inp").val(),
  };
  fetch(`${API}/${editedId}/`, {
    method: "PUT",
    body: JSON.stringify(editedTask),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  }).then(() => {
    render();
    $(".main-modal").css("display", "none");
  });
});

$(".btn-close").on("click", function () {
  $(".main-modal").css("display", "none");
});
getPagination();
function getPagination() {
  fetch(`${API}?q=${searchText}`)
    .then((res) => res.json())
    .then((data) => {
      pageCount = Math.ceil(data.length / 5);
      $(".pagination-page").remove();
      for (let i = pageCount; i >= 1; i--) {
        $(".previous-btn").after(
          `<span class="pagination-page">
            <a href="#">${i}</a>
        </span>`
        );
      }
    });
}
$(".next-btn").on("click", function () {
  if (page >= pageCount) {
    return;
  }
  page++;
  render();
});

$(".previous-btn").on("click", function () {
  if (page <= 1) {
    return;
  }
  page--;
  render();
});

$("body").on("click", ".pagination-page", function (e) {
  page = e.target.innerText;
  render();
});
