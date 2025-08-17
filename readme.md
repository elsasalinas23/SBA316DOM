README 

# Tía Vene’s House – DOM Project

A tiny single-page ordering app that uses **DOM** + **BOM** features to build menus, validate forms, and manage a simple shopping cart.

## Features
- Build submenu UI **dynamically** from a JS “MENU” object
- Add items to a cart, remove items, and auto-update **Total**
- **Form validation**: HTML `required` + JS event validation
- Uses **DocumentFragment**, **createElement**, **appendChild**
- Uses **classList** to show/hide UI
- Uses **BOM** (`window.innerWidth`, `window.innerHeight`)
- Logs **parent/child/sibling** navigation for rubric

## How to Run
1. Open `index.html` in any browser (no server needed).
2. Open DevTools ► **Console** to see rubric logs (first/last child, window size).

## File Structure
## Requirements Mapping (Rubric → Where)
- `getElementById` → `nameInput`, `emailInput`, `allergyBox`
- `querySelector` → `contactForm`, `orderForm`, `serviceSelect`, `orderList`, etc.
- Parent/Child/Sibling → in `renderOrder()` logs `firstChild`, `lastChild`, `parentNode`
- Iterate collections → `conf.types.forEach(...)`, `order.forEach(...)`
- `createElement` → options, buttons, `li`, etc.
- `appendChild`/`prepend` → many places (submenu + cart items)
- `DocumentFragment` → building `<option>` list
- Modify HTML/text → `submenuBox.innerHTML = ''`, `textContent`
- Modify style/class → `classList.add/remove('hidden')`
- Modify attributes → `setAttribute('for', 'sub-type')`
- 2+ event listeners → `change`, `submit`, `click`
- 2+ BOM usages → `window.innerWidth`, `window.innerHeight`
- HTML attribute validation → `required` on inputs
- DOM event validation → JS checks in contact form
- Runs without errors → tested in browser
- README included (this file)

## How to Use
1. Fill **Contact Info** (name + email).
2. Choose a **category** from the dropdown (e.g., Pupusas).
3. Pick a **type**, set **quantity**, click **Add to Order**.
4. Remove items with **Remove**. Clear all with **Clear order**.
5. Click **Place Order**.

## Stretch Ideas
- Persist cart to `localStorage`
- Add images per item in the cart

## Credits
- Photos: Personal pictures taking by self 
-

