(() => {
  const $toggleNav = $('#toggle-nav')
  const $navHamburger = $('#nav-hamburger')
  const $navCross = $('#nav-cross')
  const $nav = $('#nav')
  let isNavOpen = false

  $toggleNav.click(e => {
    e.preventDefault()
    isNavOpen = !isNavOpen
    if (isNavOpen) {
      $nav.removeClass('hidden')
      $navHamburger.hide()
      $navCross.show()
    } else {
      $nav.addClass('hidden')
      $navHamburger.show()
      $navCross.hide()
    }
  })
})()