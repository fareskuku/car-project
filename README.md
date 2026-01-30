
# 🚌 Addis Metro - Bus Booking System

Hi! I'm **Fares**, and this is **Addis Metro**.


 Here are the main features:

* **Wizard Style Booking:** A step-by-step flow (Select Route → Pick Seats → Enter Info → Get Ticket).
* **Visual Seat Picker:** You can actually click the seats to select them. It even calculates the total price in real-time.
* **It Remembers You:** I used the browser's `LocalStorage`, so if you book a ticket and refresh the page, your ticket is still there in the "My Tickets" section.
* **Interactive Map:** You can see the bus routes and stations on an OpenStreetMap (thanks to Leaflet.js).
* **Mobile Friendly:** It looks good on a laptop, but I designed it to work perfectly on mobile phones too.

## 🛠️ How I Built It (The Tech Stack)

I kept it super simple. No `npm install`, no build steps, just code.

* **HTML5:** For the structure.
* **CSS3:** Flexbox and Grid for the layout (custom styled, no Bootstrap).
* **Vanilla JavaScript :** All the logic, validation, and DOM manipulation.
* **Leaflet.js:** The only external library I used (for the map tiles).

## 🚀 How to Run It

Since there's no backend server, running this is incredibly easy.

### **The Easy Way**

1. Download this folder.
2. Double-click `index.html`.
3. That's it!



## 📂 Project Structure

Here is how I organized my files so you don't get lost:

* `index.html` - The landing page.
* `booking.html` - The main logic is here (the booking wizard).
* `bookings.html` - Where users see their past tickets.
* `style.css` - One massive CSS file handling the look and feel.
* `script.js` - The brain of the operation. All the event listeners and logic are here.

## 💡 How the Logic Works

### **The Seat Picker**

I'm proud of this part. When you load the booking page:

1. The JS generates a grid of seats.
2. I wrote a small function to randomly "block" 20% of the seats to make it look like other people have already booked.
3. When you click a seat, it checks if you've exceeded your passenger count.

### **Saving Data**

Since I don't have a database (SQL/MongoDB), I save everything to the browser's LocalStorage. The data looks like this:

```javascript
// Example of how I store a ticket
{
  id: "ADD12345678",
  from: "Piazza",
  to: "Bole",
  passengers: 2,
  seats: ["3", "4"],
  totalPrice: 16,
  status: "valid"
}

```

## 🎨 Design Choices

I went with the **Ethiopian flag colors** (Green, Yellow, Red) but muted them a bit so they look professional and not too flashy.

* **Primary Green:** For main buttons and active states.
* **Red:** For errors or "Booked" seats.
* **Yellow:** For highlights.

