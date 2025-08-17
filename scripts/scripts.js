/* 1) Grab elements so we can talk to them */
const contactForm   = document.querySelector('#contact-form');
const orderForm     = document.querySelector('#order-form');
const serviceSelect = document.querySelector('#service');
const submenuBox    = document.querySelector('#submenu');
const orderList     = document.querySelector('#order-list');
const orderTotal    = document.querySelector('#order-total');

const nameInput  = document.getElementById('name');
const emailInput = document.getElementById('email');
const allergyBox = document.getElementById('allergy');

/* helper to format money like $2.50 */
const money = n => '$' + n.toFixed(2);

/* 2) Menu “data” — this is our mini menu book.
      Each category has types with prices. */
const MENU = {
  pupusas: {
    label: 'Pupusas',
    types: [
      { id:'cheese',     label:'Cheese',           price:2.50 },
      { id:'bean',       label:'Bean & Cheese',    price:2.75 },
      { id:'chicharron', label:'Chicharrón',       price:3.00 },
      { id:'loroco',     label:'Loroco',           price:3.00 }
    ]
  },
  yuca: {
    label: 'Yuca and Chicharrón',
    types: [
      { id:'small', label:'Small Plate', price:7.50 },
      { id:'large', label:'Large Plate', price:10.50 }
    ]
  },
  sandwich: {
    label: 'Pan De Pollo',
    types: [
      { id:'regular', label:'Regular', price:10.00 },
      { id:'spicy',   label:'Spicy',   price:11.50 }
    ]
  },
  enchiladas: {
    label: 'Enchiladas',
    types: [
      { id:'chicken', label:'Chicken', price:9.50 },
      { id:'beef',    label:'Beef',    price:10.00 },
      { id:'veggie',  label:'Veggie',  price:8.50 }
    ]
  },
  pastelitos: {
    label: 'Pastelitos de Piña',
    types: [
      { id:'single', label:'Single', price:2.25 },
      { id:'dozen',  label:'Dozen',  price:23.25}
    ]
  },
  quesadillas: {
    label: 'Mini Quesadillas',
    types: [
      { id:'single', label:'Single', price:2.00 },
      { id:'dozen',  label:'Dozen',  price:22.00 }
    ]
  },
  horchata: {
    label: 'Horchata',
    types: [
      { id:'sm',  label:'Small',  price:2.50 },
      { id:'lg',  label:'Large',  price:3.50 },
      { id:'gal', label:'Gallon', price:12.00 }
    ]
  },
  maranon: {
    label: 'Jugo de Marañón',
    types: [
      { id:'sm', label:'Small',  price:2.75 },
      { id:'lg', label:'Large',  price:3.75 }
    ]
  }
};

/* This array is our shopping cart. We’ll push items in here. */
const order = [];

/* 3) Listen for things that happen (events) */

/* When the main dropdown changes, show the matching submenu */
serviceSelect.addEventListener('change', () => {
  const key = serviceSelect.value;

  if (!key) {
    submenuBox.innerHTML = '';
    submenuBox.classList.add('hidden');
    return;
  }

  // tiny UX touch: update the placeholder to show we listened
  allergyBox.setAttribute('placeholder', 'Allergies/requests (e.g., no cheese, gluten-free masa)');

  buildSubmenu(key);
  submenuBox.classList.remove('hidden');
});

/* Contact form: basic check (don’t let empty name or bad email through) */
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (nameInput.value.trim() === '') {
    alert('Please enter your name');
    nameInput.focus();
    return;
  }
  if (!emailInput.value.includes('@')) {
    alert('Please enter a valid email');
    emailInput.focus();
    return;
  }

  alert('Saved! We’ve got your contact info.');
});

/* Place order: if cart is empty, nudge the user */
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (order.length === 0) {
    alert('Your cart is empty. Add something first 🙂');
    return;
  }

  const msg = document.createElement('p');
  msg.textContent = `Order placed for ${nameInput.value || 'Guest'} — total ${money(getTotal())}.`;
  orderForm.parentNode.insertBefore(msg, orderForm.nextElementSibling);

  // remove the message after a few seconds
  setTimeout(() => msg.remove(), 4000);
});

/* Clear the whole order */
document.querySelector('#clear-order').addEventListener('click', () => {
  order.length = 0; // wipe the cart
  renderOrder();
});

/* 4) Build the submenu for a given category key (like 'pupusas') */
function buildSubmenu(key) {
  const conf = MENU[key];        // the config for that category
  submenuBox.innerHTML = '';     // start clean

  // label + dropdown for the TYPE (e.g., Cheese Pupusa, Chicken Enchilada)
  const typeLabel = document.createElement('label');
  typeLabel.setAttribute('for', 'sub-type');
  typeLabel.textContent = `Choose ${conf.label} type`;

  const typeSelect = document.createElement('select');
  typeSelect.id = 'sub-type';

  // fill dropdown from our data
  const optsFrag = document.createDocumentFragment();
  conf.types.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.label} (${money(t.price)})`;
    optsFrag.appendChild(opt);
  });
  typeSelect.appendChild(optsFrag);

  // quantity input
  const qtyLabel = document.createElement('label');
  qtyLabel.setAttribute('for', 'sub-qty');
  qtyLabel.textContent = 'Quantity';

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.id = 'sub-qty';
  qtyInput.min = '1';
  qtyInput.value = '1';

  // button to add this choice to the cart
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.id = 'add-item';
  addBtn.textContent = 'Add to Order';

  // drop all parts into the submenu box
  submenuBox.appendChild(typeLabel);
  submenuBox.appendChild(typeSelect);
  submenuBox.appendChild(qtyLabel);
  submenuBox.appendChild(qtyInput);
  submenuBox.appendChild(addBtn);

  // when user clicks “Add to Order”
  addBtn.addEventListener('click', () => {
    const chosenId = typeSelect.value;
    const chosenType = conf.types.find(t => t.id === chosenId);
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

    order.push({
      name: `${conf.label} — ${chosenType.label}`,
      qty,
      price: chosenType.price
    });

    renderOrder();

    // tiny visual feedback
    addBtn.disabled = true;
    setTimeout(() => (addBtn.disabled = false), 300);
  });
}

/* 5) Redraw the cart list + total based on what’s in the array */
function renderOrder() {
  orderList.innerHTML = '';

  order.forEach((item, index) => {
    const li = document.createElement('li');

    const itemText = document.createElement('span');
    itemText.textContent = `${item.qty} × ${item.name}`;

    const itemPrice = document.createElement('span');
    itemPrice.textContent = money(item.qty * item.price);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.dataset.index = index; // little tag we can read later

    li.appendChild(itemText);
    li.appendChild(itemPrice);
    li.appendChild(removeBtn);
    orderList.appendChild(li);
  });

  // one listener handles any remove button (event delegation)
  orderList.addEventListener('click', (e) => {
    if (e.target.matches('button[data-index]')) {
      const idx = Number(e.target.dataset.index);
      order.splice(idx, 1); // delete that item
      renderOrder();        // refresh the view
    }
  }, { once: true });

  orderTotal.innerHTML = `<strong>Total: ${money(getTotal())}</strong>`;
}

/* add everything in the cart */
function getTotal() {
  return order.reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* Bonus: quick BOM property example for the rubric */
console.log('Window size:', window.innerWidth, window.innerHeight);
