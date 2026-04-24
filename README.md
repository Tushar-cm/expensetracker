# 💰 Cash-Flow Tracker - Salary & Expense Tracker

A modern, fully functional web application for tracking your salary and expenses in real-time with data persistence and financial visualization.

## ✨ Features

### Core Functionality
- ✅ **Salary Input**: Set your total salary with validation
- ✅ **Expense Management**: Add expenses with name and amount
- ✅ **Real-time Calculations**: Automatic balance computation (Salary - Expenses)
- ✅ **Expense List**: View all expenses with individual delete functionality
- ✅ **Input Validation**: Prevents empty, negative, or invalid inputs
- ✅ **Warnings**: Alerts when expense exceeds available salary

### Data Persistence
- 💾 **LocalStorage Integration**: All data saved automatically to browser
- 🔄 **Automatic Recovery**: Data loads on page refresh
- 🗑️ **Clear All Option**: Delete all data with confirmation

### User Features
- 🗑️ **Trash Icon**: Quick delete button on each expense
- 📊 **Doughnut Chart**: Visual representation (Remaining Balance vs Total Expenses)
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎨 **Modern UI**: Gradient backgrounds, smooth animations, and intuitive layout
- 💬 **Notifications**: Success/error messages for all actions
- ⌨️ **Keyboard Support**: Press Enter to submit forms

### Technical Implementation
- 🟡 **Raw JavaScript**: No frameworks, pure vanilla JS
- 📈 **Chart.js Integration**: Beautiful pie/doughnut charts
- 🎯 **HTML5**: Semantic markup with proper accessibility
- 🎨 **CSS3**: Flexbox, Grid, and modern styling
- 💪 **Error Handling**: Comprehensive validation and error messages

## 📁 File Structure

```
prodesk_expensetracker/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # All JavaScript logic
└── README.md          # This file
```

## 🚀 How to Use

### 1. **Opening the Application**
   - Open `index.html` in any modern web browser
   - No server or installation required!

### 2. **Setting Your Salary**
   - Enter your total salary in the "Total Salary" field
   - Click "Set Salary" button (or press Enter)
   - Your salary will display in the Summary Section

### 3. **Adding Expenses**
   - Enter an expense name (e.g., "Grocery", "Rent")
   - Enter the expense amount
   - Click "Add Expense" button (or press Enter when in amount field)
   - The expense will appear in the list below

### 4. **Monitoring Your Balance**
   - **Total Salary**: Shows your entered salary
   - **Total Expenses**: Running total of all expenses
   - **Remaining Balance**: Calculated automatically (Salary - Expenses)
   - Balance color changes: Green (healthy) → Yellow (low) → Red (negative)

### 5. **Deleting Expenses**
   - Click the 🗑️ trash icon next to any expense
   - Confirm the deletion
   - Balance updates automatically

### 6. **Viewing the Chart**
   - Scroll to the "Financial Overview" section
   - Interactive doughnut chart shows expense distribution
   - Hover over chart segments for detailed percentages

### 7. **Data Management**
   - All data automatically saves to browser's localStorage
   - Refresh page - data persists!
   - Click "Clear All Data" to reset everything

## 💾 LocalStorage Details

Data is stored as JSON in localStorage under key: `cashflowData`

Example structure:
```json
{
  "salary": 5000,
  "expenses": [
    {"id": 1234567890, "name": "Grocery", "amount": 150},
    {"id": 1234567891, "name": "Rent", "amount": 1200}
  ]
}
```

## ✅ Validation Rules

### Salary Input
- Cannot be empty
- Must be a positive number
- Decimal values accepted

### Expense Input
- Name cannot be empty
- Amount cannot be empty
- Amount must be positive
- Amount must be a valid number
- User warned if expense exceeds available balance

## 🎨 Design Features

- **Modern Gradient UI**: Purple and blue combination
- **Responsive Grid Layout**: Adapts to all screen sizes
- **Smooth Animations**: Slide-in effects and pulse animations
- **Color-coded Cards**: 
  - Purple gradient (Salary)
  - Pink/Red gradient (Total Expenses)
  - Cyan gradient (Balance)
- **Interactive Elements**: Hover effects and active states

## 🔒 Security Features

- XSS Protection: HTML escaping for user input
- Input Validation: Comprehensive error checking
- Confirmation Dialogs: For destructive actions
- Error Handling: Try-catch blocks for localStorage operations

## 📊 Chart.js Integration

- **Chart Type**: Doughnut Chart
- **Data**: Remaining Balance vs Total Expenses
- **Updates**: Automatically updates when expenses change
- **Responsive**: Scales with screen size
- **Tooltips**: Shows amounts and percentages on hover

## 🌐 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, animations
- **Vanilla JavaScript**: No dependencies except Chart.js
- **Chart.js v3**: For data visualization
- **LocalStorage API**: For data persistence

## 📝 Notes

- No backend server required
- Entirely client-side processing
- Data storage limited by browser's localStorage limit (~5-10MB)
- Each browser/device maintains separate data
- Private browsing mode won't persist data

## 🎯 Future Enhancements (Optional)

- Export to CSV/PDF
- Multiple salary entries (monthly tracking)
- Category-based expense filtering
- Budget limits and alerts
- Dark mode toggle
- Cloud backup integration

## 📧 Support

If you encounter any issues:
1. Check browser console for errors (F12 → Console)
2. Clear browser cache and try again
3. Ensure localStorage is enabled in browser
4. Try a different browser
5. Check that all files (HTML, CSS, JS) are in the same directory

---

**Enjoy tracking your finances! 💰**

Made with ❤️ - Cash-Flow Tracker v1.0

# expensetracker