/*
	Alpha by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/





// // add items to cart
// document.querySelector('.add-to-cart').addEventListener('click', addToCart)

// function addToCart() {
// 	const form = document.querySelector('cart');
// 	// grab the name of the item
// 	const productName = document.querySelector('.product-name')
// 	// grab the price of the item
// 	const productPrice = document.querySelector('.product-price')
// 	// put the name & price into sessionStorage
// 	sessionStorage.setItem(productName.innerText, productPrice.innerText)
// 	form.addEventListener('submit', function(event) {
// 		event.preventDefault()
// 	})
// }



// 1. Use querySelectorAll to listen to ALL buttons on the page
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
});

function addToCart(event) {
    event.preventDefault(); // Stop form refresh immediately
    
    // 2. Use event.currentTarget to find the specific product container that was clicked
    const productContainer = event.currentTarget.closest('.product-container');
    const name = productContainer.querySelector('.product-name').innerText;
    const price = productContainer.querySelector('.product-price').innerText;

    // 3. Retrieve existing cart or start with an empty array if it doesn't exist
    // You must use JSON.parse because sessionStorage only stores strings
    let cart = JSON.parse(sessionStorage.getItem('shoppingCart')) || [];

    // 4. Add the new product object to the array
    cart.push({ name: name, price: price });

    // 5. Save the updated array back to sessionStorage as a string
    sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    console.log('Cart updated:', cart);
}


// Services

class Services {
	constructor(price, item){
		this._price = price
		this._item = item
	}
	get price(){
		return this._price
	}
	get item(){
		return this._item
	}
	// details(){
	// 	console.log(`Our ${this._item} costs ${this._price}. Contact us to inquire about discounts!`)
	// }
}
class FlowersAndPlants extends Services{
	constructor(price, item, binomialNomenclature){
		super(price, item)
		this._binomialNomenclature = binomialNomenclature
	}
	get binomialNomenclature(){
		return this._binomialNomenclature
	}
}


// inventory
let mixedFlowers1 = new FlowersAndPlants('$55', 'Mixed Flowers 01', 'See in store')
let mixedFlowers2 = new FlowersAndPlants('$65', 'Mixed Flowers 02', 'See in store')
let mixedFlowers3 = new FlowersAndPlants('$55', 'Mixed Flowers 03', 'See in store')
let roses1 = new FlowersAndPlants('$85', 'Roses 01', 'Rosa alba')
let roses2 = new FlowersAndPlants('$85', 'Roses 02', 'Rosa chinensis')
let roses3 = new FlowersAndPlants('$85', 'Mixed Flowers 03', 'Rosa \'Soleil d\'Or\'')
let tulips1 = new FlowersAndPlants('$75', 'Tulips', 'Tulipa gesneriana')
let carnations1 = new FlowersAndPlants('$75', 'Carnations', 'Dianthus caryophyllus')

let flowersAndPlantsArr = [mixedFlowers1, mixedFlowers2, mixedFlowers3, roses1, roses2, 
roses3, tulips1, carnations1]

console.log(flowersAndPlantsArr)

//flowersAndPlantsArr.forEach((x) => (x.details()))

// for(flower of flowersAndPlantsArr)
// 	flower.details()
// ;


// Weddings Form
document.addEventListener('load', function() {
	
	const form = document.getElementById('weddingForm');
	form.addEventListener('submit', handleSubmit);
})


//function sendEmail(){
function handleSubmit(event) {
	event.preventDefault();

	let name = document.querySelector('#name').value
	let email = document.querySelector('#email').value

	data = {
	  "to": `${email}`,
	  "subject": `Welcome ${name}!`,
	  "template": "user-welcome",
	  "templateVariables": {
		"name": `${name}`
  		}
	}

	fetch("https://api.enveloop.com/messages", {
 	 method: "POST",
	  body: JSON.stringify(data),
	  headers: {
 	   "Content-Type": "application/json",
 	   //"Authorization": "token test_74JCihkIhVoAMQGaATu1iDoHz3MglCqD",
		"Authorization": "token live_cIVwfPHAEUmOrwpJeaXcq8UviCP04i/D"
 	 },
	})
	.then(response => response.json()) 
	.then(json => console.log(json))
	.catch(err => console.log(err))
}



(function($) {

	var	$window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			wide:      ( '1281px',  '1680px' ),
			normal:    ( '981px',   '1280px' ),
			narrow:    ( '737px',   '980px'  ),
			narrower:  ( '737px',   '840px'  ),
			mobile:    ( '481px',   '736px'  ),
			mobilep:   ( null,      '480px'  )
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			alignment: 'right'
		});

	// NavPanel.

		// Button.
			$(
				'<div id="navButton">' +
					'<a href="#navPanel" class="toggle"></a>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

	// Header.
		if (!browser.mobile
		&&	$header.hasClass('alt')
		&&	$banner.length > 0) {

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt reveal'); },
					leave:		function() { $header.removeClass('alt'); }
				});

			});

		}

})(jQuery);