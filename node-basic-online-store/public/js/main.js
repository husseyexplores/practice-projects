;(() => {
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

  // Modal listener
  $(document).on('click', '[data-custom-micromodal-trigger]', e => {
    const $target = $(e.target)
    const modalId = $target.data('custom-micromodal-trigger')
    const $modal = $('#' + modalId)
    const $row = $target.closest('tr')
    const orderData = $row.data('order_json')

    // Set the title
    $modal.find('.modal__title').text('Order ID: ' + orderData._id)
    const $baseRow = $modal.find('.modal__content tbody tr').first()

    // Set the content
    let productRowsHTML = ''
    orderData.items.forEach(product => {
      const $productRow = $baseRow.clone()
      // image
      $productRow.find('.image a').attr('href', `/product/${product._id}`)
      $productRow.find('.image img').attr('src', product.imageUrl)
      // title
      $productRow.find('.title a').attr('href', `/product/${product._id}`)
      $productRow.find('.title a').text(product.title)
      // qty
      $productRow.find('.quantity span').text(product.quantity)
      // price
      $productRow.find('.price span').text('$' + product.price)

      // Append the outerHTML
      productRowsHTML += $productRow[0].outerHTML
    })

    $modal.find('.modal__content tbody').html(productRowsHTML)

    // Total Price
    $modal.find('.modal__total-price').text('$' + orderData.totalPrice)
    // Invoice URL
    $modal.find('.modal__invoice').attr('href', `/orders/${orderData._id}`)

    MicroModal.show(modalId)
  })

  // Modal
  MicroModal.init({
    awaitCloseAnimation: true,
  });
})()
