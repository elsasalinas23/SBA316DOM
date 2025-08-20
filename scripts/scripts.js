/* 0) GET PAGE PIECES (grab things from HTML so we can use them) */
const orderForm     = document.querySelector('#order-form');   // the big form
const serviceSelect = document.querySelector('#service');       // main dropdown
const submenuBox    = document.querySelector('#submenu');       // where JS builds type + qty + Add button
const orderList     = document.querySelector('#order-list');    // <ul> for each line item
const orderTotal    = document.querySelector('#order-total');   // "Total: $.."
const clearBtn      = document.querySelector('#clear-order');   // Clear button
const placeOrderBtn = document.querySelector('#place-order');   // Place Order button
const confirmLine   = document.querySelector('#confirmation');  // confirmation text

// (optional inputs – good for rubric)
const nameInput  = document.getElementById('name');
const emailInput = document.getElementById('email');

/* helper: turn 2.5 into "$2.50" */
const money = (n) => `$${Number(n).toFixed(2)}`;

/* 1) MENU DATA – you can change prices/labels here only */
const MENU = {
  pupusas: {
    label: 'Pupusas',
    types: [
      { id: 'cheese',     label: 'Cheese',        price: 2.50 },
      { id: 'bean',       label: 'Bean & Cheese', price: 2.75 },
      { id: 'chicharron', label: 'Chicharrón',    price: 3.00 },
      { id: 'loroco',     label: 'Loroco',        price: 3.00 },
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
    label: 'Pan de Pollo',
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
    label: 'Pastelitos de piña',
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
      { id: 'sm', label: 'Small',  price: 2.50 },
      { id: 'lg', label: 'Large',  price: 3.50 },
      { id: 'gal', label: 'Gallon', price: 12.00 },
    ],
  },
  maranon: {
    label: 'Jugo de Marañón',
    types: [
      { id: 'sm', label: 'Small', price: 2.75 },
      { id: 'lg', label: 'Large', price: 3.50 },
    ],
  },
};

/* 2) CART (starts empty). Each item will be: { name, type, qty, price } */
let order = [];

/* 3) WHEN MAIN DROPDOWN CHANGES, build the small submenu */
serviceSelect.addEventListener('change', () => {
  const key = serviceSelect.value;     // e.g., "pupusas"
  submenuBox.innerHTML = '';           // clear anything old

  if (!key) {                          // if user picked the blank option
    submenuBox.classList.add('hidden');
    return;
  }

  buildSubmenu(key);                   // make the type + qty + Add button
  submenuBox.classList.remove('hidden');
});

/* 4) BUILD SUBMENU (type select + qty input + Add button) */
function buildSubmenu(key) {
  const conf = MENU[key];              // the chosen menu section (like MENU.pupusas)

  // label: "Choose type"
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Choose type';

  // select: options like "Cheese ($2.50)"
  const typeSelect = document.createElement('select');
  typeSelect.id = 'sub-type';

  const frag = document.createDocumentFragment();
  conf.types.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.label} (${money(t.price)})`;
    frag.appendChild(opt);
  });
  typeSelect.appendChild(frag);

  // label: "Quantity"
  const qtyLabel = document.createElement('label');
  qtyLabel.textContent = 'Quantity';

  // input: number
  const qtyInput = document.createElement('input');
  qtyInput.id = 'sub-qty';
  qtyInput.type = 'number';
  qtyInput.min  = '1';
  qtyInput.value = '1';

  // button: "Add to Order"
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = 'Add to Order';

  // put these pieces into the submenu box
  submenuBox.appendChild(typeLabel);
  submenuBox.appendChild(typeSelect);
  submenuBox.appendChild(qtyLabel);
  submenuBox.appendChild(qtyInput);
  submenuBox.appendChild(addBtn);

  // when user clicks Add, push the new item and redraw
  addBtn.addEventListener('click', () => {
    const chosenId = typeSelect.value;                        // like 'cheese'
    const chosen = conf.types.find(t => t.id === chosenId);   // full object
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

    order.push({
      name: conf.label,          // e.g., "Pupusas"
      type: chosen.label,        // e.g., "Cheese"
      qty,
      price: chosen.price,       // unit price
    });

    renderOrder();               // rebuild the list & total
  });
}

/* 5) REBUILD THE ORDER LIST + TOTAL */
function renderOrder() {
  // 5a) list items
  orderList.innerHTML = '';  // wipe old rows

  order.forEach((item, index) => {
    const li = document.createElement('li');

    const left = document.createElement('span');
    left.textContent = `${item.qty}× ${item.name} – ${item.type}`;

    const right = document.createElement('span');
    right.textContent = money(item.qty * item.price);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      order.splice(index, 1);     // delete this one line
      renderOrder();              // redraw
    });

    li.appendChild(left);
    li.appendChild(right);
    li.appendChild(removeBtn);
    orderList.appendChild(li);
  });

  // 5b) total line
  const total = getTotal();
  orderTotal.innerHTML = `<strong>Total: ${money(total)}</strong>`;

  // 5c) enable/disable the Place button
  placeOrderBtn.disabled = order.length === 0;
}

/* 6) TOTAL HELPER */
function getTotal() {
  return order.reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* 7) CLEAR ORDER BUTTON – easy and obvious */
clearBtn.addEventListener('click', () => {
  order.length = 0;         // empty the array
  renderOrder();            // redraw -> shows empty list + Total $0.00
  confirmLine.classList.add('hidden');
  confirmLine.textContent = '';
});

/* 8) PLACE ORDER BUTTON – simple message, no popups */
placeOrderBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Guest';
  confirmLine.textContent = `Order placed for ${name} – total ${money(getTotal())}`;
  confirmLine.classList.remove('hidden');

  // (optional) after 4 seconds, hide the message again
  setTimeout(() => {
    confirmLine.classList.add('hidden');
    confirmLine.textContent = '';
  }, 4000);
});

/* 9) INITIAL DRAW so you see "Total: $0.00" immediately */
renderOrder();

