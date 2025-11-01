# MUNI PSBB090 Team Item Selector - A Drag & Drop Resource Manager

[futupas.github.io/muni-psbb090-softskills-table](https://futupas.github.io/muni-psbb090-softskills-table/)

Welcome to the Team Item Selector! This is a simple, front-end only web application designed for a fun and interactive way to distribute a list of "survival" items among different teams. The interface is built with a sleek dark theme and features a fully interactive drag-and-drop system.

The core challenge is to equip your teams for survival (or at least a very interesting time on a deserted island) without exceeding their capacity for items or total weight.


## Key Features

*   **Drag & Drop Interface**: Intuitively drag items from the main list to any team, and drag them back if you change your mind.
*   **Dynamic Teams**: Add new teams on the fly or remove them with a single click. Team names are editable and start with a randomly assigned funny name.
*   **Resource Constraints**: Each team has a maximum item count and a maximum weight limit. The app prevents adding items that would exceed these limits and displays a clear notification.
*   **Live Stats**: Team headers show a real-time count of their items and total weight, allowing for quick strategic decisions.
*   **Sortable Item List**: The main list of available items can be sorted by name, count, or weight in ascending or descending order. Items that are out of stock are automatically moved to the bottom.
*   **Resizable Layout**: The vertical divider between the item list and the teams can be dragged to resize the panels to your preference.
*   **Modern UI**: A clean, high-contrast dark theme with user-friendly notifications and interactive elements.
*   **No Backend Needed**: This is a pure front-end application. All logic is handled in the browser using Vanilla JavaScript.

## How to Run

Since this is a front-end only project, running it is very simple.

1.  **Download the Code**: Clone this repository or download the ZIP file and extract `index.html`, `styles.css`, and `app.js`.
2.  **Open in Browser**: Open the `index.html` file in any modern web browser like Chrome, Firefox, or Edge.

That's it! The application is now ready to use.

## Tech Stack

This project was built from scratch using fundamental web technologies:

*   **HTML5**: For the structure and content of the application.
*   **CSS3**: For all styling, layout, and animations. It heavily utilizes modern features like **CSS Grid**, **Flexbox**, and **CSS Variables** for a clean and maintainable stylesheet.
*   **Vanilla JavaScript (ES6+)**: For all the application logic, including state management, DOM manipulation, and handling all user interactions. No external libraries or frameworks were used.

## Acknowledgements

This project was developed with the assistance of **Google's Gemini**, which was used for code generation, feature implementation, debugging, and iterative refinement of the user interface and functionality.
