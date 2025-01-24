const HIDE_SOLUTIONS = "hide_solutions";

/**
 * Change the visibility state of solutions.
 * @param {boolean} show whether to show solutions
 */
function hide_solutions(show) {
  document.querySelectorAll("details")
    .forEach((div) => {
      const classes = div.classList;
      if (!show)
        classes.add("hidden");
      else
        classes.remove("hidden");
    });
}

/**
 * Query whether we are configured to hide solutions.
 * @returns {boolean}
 */
function is_hiding_solutions() {
  const hide = localStorage.getItem(HIDE_SOLUTIONS);
  return !!hide;
}

/**
 * Toggle the visibility status of solutions
 */
function toggle_show_solutions() {
  if (is_hiding_solutions()) {
    localStorage.removeItem(HIDE_SOLUTIONS);
    hide_solutions(true);
  } else {
    localStorage.setItem(HIDE_SOLUTIONS, "true");
    hide_solutions(false);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  if (is_hiding_solutions())
    hide_solutions(false);
});

// Register for keydown and a slightly obscure function key to not interfere
// with mdbook's search bar functionality (in `searcher.js`).
document.addEventListener("keydown", function (event) {
  if (event.key == 'F10') {
    toggle_show_solutions();
  }
});
