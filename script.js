// Cash-Flow Tracker - Raw JavaScript Implementation

// DOM Elements
const salaryInput = document.getElementById('salaryInput');
const setSalaryBtn = document.getElementById('setSalaryBtn');
const expenseNameInput = document.getElementById('expenseNameInput');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const salaryDisplay = document.getElementById('salaryDisplay');
const totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
const balanceDisplay = document.getElementById('balanceDisplay');
const expensesList = document.getElementById('expensesList');
const clearAllBtn = document.getElementById('clearAllBtn');
const currencySelect = document.getElementById('currencySelect');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const budgetAlert = document.getElementById('budgetAlert');
const alertMessage = document.getElementById('alertMessage');

// Chart instance
let chart = null;

// Application State
const appState = {
    salary: 0,
    expenses: [],
    baseCurrency: 'INR',
    currentCurrency: 'INR',
    exchangeRates: {}
};

// ==================== LocalStorage Functions ====================

/**
 * Save state to localStorage (only essential data)
 */
function saveToLocalStorage() {
    try {
        const dataToSave = {
            salary: appState.salary,
            expenses: appState.expenses
        };
        localStorage.setItem('cashflowData', JSON.stringify(dataToSave));
        console.log('Data saved to localStorage:', dataToSave);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('Error saving data, but app will still work', 'error');
    }
}

/**
 * Load state from localStorage
 */
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('cashflowData');
        console.log('Raw localStorage data:', savedData);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('Parsed data:', data);
            
            appState.salary = parseFloat(data.salary) || 0;
            appState.expenses = Array.isArray(data.expenses) ? data.expenses : [];
            
            console.log('✓ Data loaded successfully:');
            console.log('  Salary:', appState.salary);
            console.log('  Expenses count:', appState.expenses.length);
            console.log('  Full expenses:', appState.expenses);
            
            return true;
        } else {
            console.log('ℹ No saved data found in localStorage - starting fresh');
            appState.salary = 0;
            appState.expenses = [];
        }
    } catch (error) {
        console.error('✗ Error loading from localStorage:', error);
        appState.salary = 0;
        appState.expenses = [];
    }
    return false;
}

// ==================== Utility Functions ====================

/**
 * Format number as currency based on current currency
 */
function formatCurrency(amount) {
    const currencyLocales = {
        'INR': ['en-IN', 'INR'],
        'USD': ['en-US', 'USD'],
        'EUR': ['de-DE', 'EUR'],
        'GBP': ['en-GB', 'GBP'],
        'JPY': ['ja-JP', 'JPY'],
        'AUD': ['en-AU', 'AUD']
    };

    const [locale, currency] = currencyLocales[appState.currentCurrency] || ['en-IN', 'INR'];
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Calculate total expenses
 */
function calculateTotalExpenses() {
    return appState.expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate remaining balance
 */
function calculateBalance() {
    return appState.salary - calculateTotalExpenses();
}

/**
 * Validate expense input
 */
function validateExpenseInput(name, amount) {
    const errors = [];

    if (!name.trim()) {
        errors.push('Expense name cannot be empty');
    }

    if (amount === '' || amount === null) {
        errors.push('Expense amount cannot be empty');
    }

    if (!isNaN(amount) && amount <= 0) {
        errors.push('Expense amount must be greater than 0');
    }

    if (isNaN(amount)) {
        errors.push('Expense amount must be a valid number');
    }

    return errors;
}

/**
 * Validate salary input
 */
function validateSalaryInput(amount) {
    const errors = [];

    if (amount === '' || amount === null) {
        errors.push('Salary cannot be empty');
    }

    if (!isNaN(amount) && amount <= 0) {
        errors.push('Salary must be greater than 0');
    }

    if (isNaN(amount)) {
        errors.push('Salary must be a valid number');
    }

    return errors;
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    if (!document.getElementById('notificationStyles')) {
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== Currency Conversion Functions ====================

/**
 * Fallback exchange rates (updated as of April 2026)
 * Base: INR (Indian Rupee)
 */
const fallbackExchangeRates = {
    'INR': 1,
    'USD': 0.012,
    'EUR': 0.011,
    'GBP': 0.0095,
    'JPY': 1.8,
    'AUD': 0.018
};

/**
 * Fetch exchange rates from API with fallback
 */
async function fetchExchangeRates() {
    try {
        // Try multiple CORS-enabled APIs
        const apis = [
            'https://api.allorigins.win/raw?url=https://api.frankfurter.app/latest?base=INR',
            'https://api.exchangerate-api.com/v4/latest/INR',
        ];

        for (let apiUrl of apis) {
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle different API response formats
                    if (data.rates) {
                        appState.exchangeRates = data.rates;
                        appState.exchangeRates['INR'] = 1;
                        console.log('Exchange rates loaded from API');
                        return true;
                    } else if (data.conversion_rates) {
                        // For exchangerate-api.com format
                        appState.exchangeRates = data.conversion_rates;
                        console.log('Exchange rates loaded from API');
                        return true;
                    }
                }
            } catch (apiError) {
                console.log('API attempt failed, trying next option...');
                continue;
            }
        }

        // If all APIs fail, use fallback rates
        throw new Error('All APIs failed');
    } catch (error) {
        console.warn('Using fallback exchange rates:', error.message);
        appState.exchangeRates = { ...fallbackExchangeRates };
        showNotification('Using standard exchange rates (live rates unavailable)', 'error');
        return false;
    }
}

/**
 * Convert amount from base currency to target currency
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Convert to INR first (base currency)
    const amountInINR = fromCurrency === 'INR' ? amount : amount / (appState.exchangeRates[fromCurrency] || 1);
    
    // Then convert to target currency
    const convertedAmount = toCurrency === 'INR' ? amountInINR : amountInINR * (appState.exchangeRates[toCurrency] || 1);
    
    return convertedAmount;
}

/**
 * Update currency symbols in input fields
 */
function updateCurrencySymbols() {
    const currencySymbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'AUD': 'A$'
    };

    const symbol = currencySymbols[appState.currentCurrency] || '₹';
    
    // Update all currency symbol spans
    const currencySpans = document.querySelectorAll('.currency');
    currencySpans.forEach(span => {
        span.textContent = symbol;
    });
    
    console.log('Currency symbols updated to:', symbol);
}

/**
 * Convert display values when currency changes
 */
function updateCurrencyDisplay() {
    const rates = appState.exchangeRates;
    if (!rates || Object.keys(rates).length === 0) {
        showNotification('Exchange rates not available', 'error');
        return;
    }

    // Update symbols in input fields
    updateCurrencySymbols();
    
    // Convert all displayed values
    updateDisplay();
    renderExpenses();
}

// ==================== PDF Export Functions ====================

/**
 * Format currency for PDF (uses currency codes instead of symbols due to font limitations)
 */
function formatCurrencyForPDF(amount) {
    const currencyLabels = {
        'INR': { code: 'INR', symbol: '' },
        'USD': { code: 'USD', symbol: '' },
        'EUR': { code: 'EUR', symbol: '' },
        'GBP': { code: 'GBP', symbol: '' },
        'JPY': { code: 'JPY', symbol: '' },
        'AUD': { code: 'AUD', symbol: '' }
    };

    const currency = currencyLabels[appState.currentCurrency] || { code: 'INR', symbol: '' };
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    return `${currency.code} ${formattedAmount}`;
}

/**
 * Generate and download PDF report
 */
function generateAndDownloadPDF() {
    if (appState.salary === 0 && appState.expenses.length === 0) {
        showNotification('No data to export. Add salary and expenses first.', 'error');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const totalExpenses = calculateTotalExpenses();
        const balance = calculateBalance();
        
        // Title (without emoji to avoid encoding issues)
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Cash-Flow Tracker Report', 20, 20);
        
        // Generate date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
        
        // Line separator
        doc.setDrawColor(102, 126, 234);
        doc.line(20, 32, 190, 32);
        
        // Summary Section
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('Summary', 20, 42);
        
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(`Total Salary: ${formatCurrencyForPDF(appState.salary)}`, 25, 52);
        doc.text(`Total Expenses: ${formatCurrencyForPDF(totalExpenses)}`, 25, 62);
        
        // Balance with color
        if (balance < 0) {
            doc.setTextColor(229, 76, 60);
        } else {
            doc.setTextColor(39, 174, 96);
        }
        doc.setFont(undefined, 'bold');
        doc.text(`Remaining Balance: ${formatCurrencyForPDF(balance)}`, 25, 72);
        doc.setFont(undefined, 'normal');
        
        // Expenses Section
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(14);
        doc.text('Expenses List', 20, 90);
        
        if (appState.expenses.length === 0) {
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(10);
            doc.text('No expenses recorded', 25, 100);
        } else {
            let yPosition = 100;
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            
            appState.expenses.forEach((expense, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.text(`${index + 1}. ${expense.name}: ${formatCurrencyForPDF(expense.amount)}`, 25, yPosition);
                yPosition += 8;
            });
        }
        
        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text('This report was auto-generated by Cash-Flow Tracker', 20, doc.internal.pageSize.getHeight() - 10);
        
        // Download PDF
        doc.save(`Cash-Flow-Report-${new Date().getTime()}.pdf`);
        showNotification('PDF report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// ==================== Budget Alert Functions ====================

/**
 * Check and show budget alert if needed
 */
function checkBudgetAlert() {
    const balance = calculateBalance();
    const threshold = appState.salary * 0.1; // 10% of salary

    if (appState.salary > 0 && balance < threshold && balance >= 0) {
        // Low balance warning (below 10%)
        budgetAlert.classList.remove('hidden');
        alertMessage.textContent = `⚠️ Warning: Your balance is below 10% of your salary! (${formatCurrency(balance)} remaining)`;
    } else if (balance < 0) {
        // Negative balance warning
        budgetAlert.classList.remove('hidden');
        alertMessage.textContent = `🔴 CRITICAL: Your balance is negative! You've exceeded your salary by ${formatCurrency(Math.abs(balance))}`;
        budgetAlert.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        // Hide alert if balance is healthy
        budgetAlert.classList.add('hidden');
        budgetAlert.style.background = '';
    }
}

// ==================== UI Update Functions ====================

/**
 * Update all displays
 */
function updateDisplay() {
    const totalExpenses = calculateTotalExpenses();
    const balance = calculateBalance();

    console.log('updateDisplay() called:');
    console.log('  appState.salary:', appState.salary);
    console.log('  totalExpenses:', totalExpenses);
    console.log('  balance:', balance);
    
    const salaryText = formatCurrency(appState.salary);
    const expensesText = formatCurrency(totalExpenses);
    const balanceText = formatCurrency(balance);
    
    console.log('  Formatted values:');
    console.log('    Salary display:', salaryText);
    console.log('    Expenses display:', expensesText);
    console.log('    Balance display:', balanceText);

    salaryDisplay.textContent = salaryText;
    totalExpensesDisplay.textContent = expensesText;
    balanceDisplay.textContent = balanceText;

    // Update balance display color and check budget alert
    if (balance < 0) {
        balanceDisplay.style.color = '#e74c3c';
    } else if (balance < appState.salary * 0.1) {
        balanceDisplay.style.color = '#f39c12';
    } else {
        balanceDisplay.style.color = 'white';
    }

    checkBudgetAlert();
    updateChart();
}

/**
 * Render expenses list
 */
function renderExpenses() {
    console.log('renderExpenses() called with', appState.expenses.length, 'expenses');
    
    if (appState.expenses.length === 0) {
        console.log('No expenses - showing empty message');
        expensesList.innerHTML = '<p class="empty-message">No expenses added yet</p>';
        return;
    }

    expensesList.innerHTML = appState.expenses.map((expense, index) => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-name">${escapeHtml(expense.name)}</div>
                <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            </div>
            <div class="expense-actions">
                <button class="delete-btn" data-index="${index}" title="Delete expense">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');

    console.log('✓ Rendered', appState.expenses.length, 'expenses to screen');

    // Add delete button event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteExpense);
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update chart
 */
function updateChart() {
    const totalExpenses = calculateTotalExpenses();
    const balance = calculateBalance();
    const balanceValue = Math.max(balance, 0); // Don't show negative balance in chart

    const ctx = document.getElementById('balanceChart').getContext('2d');

    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Create new chart
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Remaining Balance', 'Total Expenses'],
            datasets: [{
                data: [balanceValue, totalExpenses],
                backgroundColor: [
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(245, 87, 108, 0.8)'
                ],
                borderColor: [
                    'rgba(79, 172, 254, 1)',
                    'rgba(245, 87, 108, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = balanceValue + totalExpenses;
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ==================== Event Handlers ====================

/**
 * Set salary
 */
function setSalary() {
    const salary = parseFloat(salaryInput.value);
    const errors = validateSalaryInput(salary);

    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }

    appState.salary = salary;
    salaryInput.value = '';
    
    console.log('Saving salary to localStorage:', salary);
    saveToLocalStorage();
    updateDisplay();
    renderExpenses();
    
    showNotification(`Salary set to ${formatCurrency(salary)}`);
}

/**
 * Add expense
 */
function addExpense() {
    const name = expenseNameInput.value;
    const amount = parseFloat(expenseAmountInput.value);

    const errors = validateExpenseInput(name, amount);

    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }

    // Check if adding expense would result in negative balance
    const newTotal = calculateTotalExpenses() + amount;
    if (newTotal > appState.salary && appState.salary > 0) {
        const confirmation = confirm(`Warning: This expense will exceed your salary. Your balance will be negative. Proceed?\n\nCurrent Balance: ${formatCurrency(calculateBalance())}\nNew Expense: ${formatCurrency(amount)}`);
        if (!confirmation) {
            return;
        }
    }

    const expense = {
        id: Date.now(),
        name: name,
        amount: amount
    };

    appState.expenses.push(expense);
    expenseNameInput.value = '';
    expenseAmountInput.value = '';

    console.log('Saving expense to localStorage:', expense);
    saveToLocalStorage();
    updateDisplay();
    renderExpenses();

    showNotification(`Expense "${name}" added successfully`);
}

/**
 * Delete expense
 */
function deleteExpense(event) {
    const index = parseInt(event.target.dataset.index);
    const expense = appState.expenses[index];

    const confirmation = confirm(`Delete expense "${expense.name}" (${formatCurrency(expense.amount)})?`);
    if (!confirmation) {
        return;
    }

    appState.expenses.splice(index, 1);

    console.log('Deleted expense, saving to localStorage');
    saveToLocalStorage();
    updateDisplay();
    renderExpenses();

    showNotification('Expense deleted successfully');
}

/**
 * Clear all data
 */
function clearAllData() {
    const confirmation = confirm('Are you sure you want to clear all data? This action cannot be undone.');
    if (!confirmation) {
        return;
    }

    appState.salary = 0;
    appState.expenses = [];

    localStorage.removeItem('cashflowData');
    salaryInput.value = '';
    expenseNameInput.value = '';
    expenseAmountInput.value = '';

    updateDisplay();
    renderExpenses();

    showNotification('All data cleared successfully');
}

// ==================== Event Listeners ====================

setSalaryBtn.addEventListener('click', setSalary);
addExpenseBtn.addEventListener('click', addExpense);
clearAllBtn.addEventListener('click', clearAllData);
downloadReportBtn.addEventListener('click', generateAndDownloadPDF);

// Currency converter event listener
currencySelect.addEventListener('change', (event) => {
    appState.currentCurrency = event.target.value;
    localStorage.setItem('selectedCurrency', appState.currentCurrency);
    updateCurrencyDisplay();
});

// Allow Enter key to set salary
salaryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        setSalary();
    }
});

// Allow Enter key to add expense
expenseAmountInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addExpense();
    }
});

// ==================== Initialize Application ====================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== App Initialization Started ===');
    
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
        appState.currentCurrency = savedCurrency;
        currencySelect.value = savedCurrency;
        console.log('Currency preference loaded:', savedCurrency);
    }

    // Update currency symbols to match current currency
    updateCurrencySymbols();

    // Load data from localStorage FIRST - CRITICAL
    const dataLoaded = loadFromLocalStorage();
    console.log('Data loaded:', dataLoaded);
    console.log('Loaded appState salary:', appState.salary);
    console.log('Loaded appState expenses:', appState.expenses.length);

    // IMMEDIATELY update display SYNCHRONOUSLY before async operations
    console.log('>>> CALLING updateDisplay() IMMEDIATELY <<<');
    updateDisplay();
    renderExpenses();
    console.log('>>> updateDisplay() COMPLETED <<<');

    // NOW fetch exchange rates in the background
    console.log('Fetching exchange rates in background...');
    await fetchExchangeRates();
    console.log('Exchange rates fetched');

    // Update display again after rates are loaded
    console.log('Updating display with exchange rates...');
    updateDisplay();

    // Log final state
    console.log('=== Cash-Flow Tracker Initialized Successfully ===');
    console.log('Final Salary displayed:', appState.salary);
    console.log('Final Expenses displayed:', appState.expenses.length);
});

// Save data before page unload (extra backup)
window.addEventListener('beforeunload', () => {
    if (appState.salary > 0 || appState.expenses.length > 0) {
        saveToLocalStorage();
        console.log('Data auto-saved before page unload');
    }
});


window.appState = appState;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
