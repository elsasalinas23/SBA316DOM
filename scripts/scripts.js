// These are "nicknames" (variables) so we can talk to page elements easily
const contactForm   = document.querySelector('#contact-form');   // the top contact form
const orderForm     = document.querySelector('#order-form');     // the order form (with the place order button)
const serviceSelect = document.querySelector('#service');        // main dropdown: Pupusas, Enchiladas, etc.
const submenuBox    = document.querySelector('#submenu');        // where we build the type + quantity UI
const orderList     = document.querySelector('#order-list');     // <ul> that shows the cart lines
const orderTotal    = document.querySelector('#order-total');    // <p> that shows "Total: $.."
const clearBtn      = document.querySelector('#clear-order');    // button to clear the cart

// Use getElementById
const nameInput  = document.getElementById('name');              // "Full name" input
const emailInput = document.getElementById('email');             // "Email" input
const allergyBox = document.getElementById('allergy');           // Allergies/notes textarea

// 1) SMALL HELPER ; MENU DATA (“menu book”)
const money = (n) => `$${Number(n).toFixed(2)}`; // Turns number (like 2.5) into "$2.50"

const MENU = {    // Each category has a nice label and a list of types with price you can add or delete 
  pupusas: {
    label: 'Pupusas',
    types: [
      { id: 'cheese',     label: 'Cheese',           price: 2.50 },
      { id: 'bean',       label: 'Bean & Cheese',    price: 2.75 },
      { id: 'chicharron', label: 'Chicharrón',       price: 3.00 },
      { id: 'loroco',     label: 'Loroco',           price: 3.00 },
    ],
  },
  yuca: {
    label: 'Yuca and Chicharrón',
    types: [
      { id: 'small', label: 'Small Plate', price: 7.50 },
      { id: 'large', label: 'Large Plate', price: 10.50 },
    ],
  },
  sandwich: {
    label: 'Pan De Pollo',
    types: [
      { id: 'regular', label: 'Regular', price: 10.00 },
      { id: 'spicy',   label: 'Spicy',   price: 11.50 },
    ],
  },
  enchiladas: {
    label: 'Enchiladas',
    types: [
      { id: 'chicken', label: 'Chicken', price: 6.50 },
      { id: 'beef',    label: 'Beef',    price: 6.50 },
      { id: 'veggie',  label: 'Veggie',  price: 6.50 },
    ],
  },
  pastelitos: {
    label: 'Pastelitos de Piña',
    types: [
      { id: 'single', label: 'Single', price: 2.25 },
      { id: 'dozen',  label: 'Dozen',  price: 23.25 },
    ],
  },
  quesadillas: {
    label: 'Mini Quesadillas',
    types: [
      { id: 'single', label: 'Single', price: 2.80 },
      { id: 'dozen',  label: 'Dozen',  price: 22.00 },
    ],
  },
  horchata: {
    label: 'Horchata',
    types: [
      { id: 'sm',  label: 'Small',  price: 2.50 },
      { id: 'lg',  label: 'Large',  price: 3.50 },
      { id: 'gal', label: 'Gallon', price: 12.00 },
    ],
  },
  maranon: {
    label: 'Jugo de Marañon',
    types: [
      { id: 'sm', label: 'Small', price: 2.75 },
      { id: 'lg', label: 'Large', price: 3.50 },
    ],
  },
};

/* -----------------------------
   3) STATE (your shopping cart)
   ----------------------------- */

// The cart starts empty. Every time the user adds something, we push an object into it.
const order = [];  // each item looks like: { name:'Pupusas', type:'Cheese', qty:2, price:2.50 }

/* -----------------------------
   4) EVENT LISTENERS (user actions)
   ----------------------------- */

// When the main dropdown changes, build the matching submenu UI.
serviceSelect.addEventListener('change', () => {
  const key = serviceSelect.value;            // example: 'pupusas' or 'enchiladas'
  if (!key) {                                 // if they picked the blank option...
    submenuBox.innerHTML = '';                // clear any old submenu
    submenuBox.classList.add('hidden');       // hide the box
    return;                                   // stop here
  }

  // Tiny UX: encourage useful notes (shows we listened to the customer)
  allergyBox.setAttribute(
    'placeholder',
    'Allergies/requests (e.g., no cheese, gluten-free masa)'
  );

  buildSubmenu(key);                          // make the submenu for this category
  submenuBox.classList.remove('hidden');      // show the box
});

// Contact form: on submit, we block page refresh and do basic checks
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();                         // stop the normal browser submit/refresh

  // Check name
  if (nameInput.value.trim() === '') {
    alert('Please enter your name');
    nameInput.focus();
    return;                                   // stop here if invalid
  }

  // Check email (very simple check for @)
  if (!emailInput.value.includes('@')) {
    alert('Please enter a valid email');
    emailInput.focus();
    return;                                   // stop here if invalid
  }

  alert("Saved! We've got your contact info.");
});

// Order form submit: either nudge the user (empty cart) or show a short confirmation
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();                         // don’t refresh the page

  if (order.length === 0) {                   // no items yet?
    alert('Your cart is empty. Add something first 😊');
    return;
  }

  // Create a friendly message element under the form
  const msg = document.createElement('p');    // <p></p>
  msg.textContent =
    `Order placed for ${nameInput.value || 'Guest'} — total ${money(getTotal())}`;
  orderForm.parentElement.insertBefore(msg, orderForm.nextElementSibling);

  // Remove the message after 4 seconds so the page stays tidy
  setTimeout(() => msg.remove(), 4000);
});

// Clear the entire cart when clicking the "clear order" button
clearBtn.addEventListener('click', () => {
  order.length = 0;                           // wipe the array (cart is now empty)
  renderOrder();                              // redraw the UI (list + total)
});

/* -----------------------------
   5) BUILD THE SUBMENU (ADD CHILDREN HERE)
   -----------------------------
   We make: a LABEL + SELECT (for types) + LABEL + INPUT (for qty) + BUTTON (Add).
*/
function buildSubmenu(key) {
  const conf = MENU[key];                     // example: MENU['pupusas']
  submenuBox.innerHTML = '';                  // start with a clean box

  /* ---- TYPE label + <select> ---- */
  const typeLabel = document.createElement('label');      // make a <label>
  typeLabel.setAttribute('for', 'sub-type');              // set its "for" attribute
  typeLabel.textContent = `Choose ${conf.label} type`;    // user-facing text

  const typeSelect = document.createElement('select');    // make the dropdown itself
  typeSelect.id = 'sub-type';

  // Build <option> tags using a DocumentFragment (fast, one-shot insert)
  const optsFrag = document.createDocumentFragment();     // temporary container
  conf.types.forEach((t) => {                             // loop all types
    const opt = document.createElement('option');         // make <option>
    opt.value = t.id;                                     // machine value
    opt.textContent = `${t.label} (${money(t.price)})`;   // human label
    optsFrag.appendChild(opt);                            // ADD CHILD to the fragment
  });
  typeSelect.appendChild(optsFrag);                       // ADD CHILD fragment to <select>

  /* ---- QTY label + <input type="number"> ---- */
  const qtyLabel = document.createElement('label');
  qtyLabel.setAttribute('for', 'sub-qty');
  qtyLabel.textContent = 'Quantity';

  const qtyInput = document.createElement('input');
  qtyInput.type  = 'number';
  qtyInput.id    = 'sub-qty';
  qtyInput.min   = '1';
  qtyInput.value = '1';

  /* ---- "Add to Order" button ---- */
  const addBtn = document.createElement('button');
  addBtn.type = 'button';                                 // not a submit button
  addBtn.id   = 'add-item';
  addBtn.textContent = 'Add to Order';

  /* ---- Put everything into the submenu box (ADD CHILDREN) ---- */
  submenuBox.appendChild(typeLabel);
  submenuBox.appendChild(typeSelect);
  submenuBox.appendChild(qtyLabel);
  submenuBox.appendChild(qtyInput);
  submenuBox.appendChild(addBtn);

  /* ---- When user clicks Add, push an item into the cart ---- */
  addBtn.addEventListener('click', () => {
    // Find the chosen type object (so we know its label + price)
    const chosenId   = typeSelect.value;                  // e.g., 'cheese'
    const chosenType = conf.types.find(t => t.id === chosenId);

    // Make sure quantity is at least 1 and is a number
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

    // Add a new item into the cart array
    order.push({
      name: conf.label,             // e.g., 'Pupusas'
      type: chosenType.label,       // e.g., 'Cheese'
      qty,                          // number
      price: chosenType.price,      // number
    });

    // Tiny UX: prevent double click spam
    addBtn.disabled = true;
    setTimeout(() => (addBtn.disabled = false), 300);

    // Redraw the cart list and total
    renderOrder();
  });
}

/* -----------------------------
   6) DRAW THE CART LIST + TOTAL
   ----------------------------- */
function renderOrder() {
  orderList.innerHTML = '';                         // clear the <ul> before rebuilding

  // Build one <li> per item in the cart
  order.forEach((item, index) => {
    const li = document.createElement('li');        // <li></li>

    const itemText = document.createElement('span');// left side text
    itemText.textContent = `${item.qty}× ${item.name} — ${item.type}`;

    const itemPrice = document.createElement('span');// right side price
    itemPrice.textContent = money(item.qty * item.price);

    const removeBtn = document.createElement('button'); // remove button
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.dataset.index = index;                // save which index to remove later

    // ADD CHILDREN into the <li>, then ADD CHILD <li> into the <ul>
    li.appendChild(itemText);
    li.appendChild(itemPrice);
    li.appendChild(removeBtn);
    orderList.appendChild(li);
  });

  // Handle clicks on any remove button using ONE listener on the <ul> (event delegation)
  orderList.addEventListener('click', (e) => {
    if (e.target.matches('button[data-index]')) {   // did we click a remove button?
      const idx = Number(e.target.dataset.index);   // which item?
      order.splice(idx, 1);                         // remove it from the array
      renderOrder();                                // redraw list + total
    }
  }, { once: true });                               // attach once per render to keep it clean

  // Recalculate total and show it
  orderTotal.innerHTML = `<strong>Total: ${money(getTotal())}</strong>`;

  // === Parent/Child/Sibling navigation (rubric proof) ===
  if (orderList.firstChild && orderList.lastChild) {
    console.log('First order item:', orderList.firstChild.textContent);
    console.log('Last  order item:', orderList.lastChild.textContent);
    console.log('Order list parent tag:', orderList.parentNode.tagName);
  }
}

/* -----------------------------
   7) TOTAL HELPER
   ----------------------------- */
function getTotal() {
  // Start at 0, then add qty * price for each item
  return order.reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* -----------------------------
   8) BOM EXAMPLE (window size)
   -----------------------------
   This prints ONLY in the DevTools, It does not show on the page.
*/
console.log('Window size:', window.innerWidth, '×', window.innerHeight);

