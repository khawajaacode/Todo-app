// DOM Elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const errorMessage = document.getElementById('error-message');
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');
const emptyState = document.getElementById('empty-state');
const emptyStateMessage = document.getElementById('empty-state-message');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const progressFill = document.getElementById('progress-fill');
const progressPercentage = document.getElementById('progress-percentage');
const searchInput = document.getElementById('search-input');

// State management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Event Listeners
todoForm.addEventListener('submit', addTask);
filterAll.addEventListener('click', () => setFilter('all'));
filterActive.addEventListener('click', () => setFilter('active'));
filterCompleted.addEventListener('click', () => setFilter('completed'));
clearCompletedBtn.addEventListener('click', clearCompleted);
searchInput.addEventListener('input', handleSearch);

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Initialize theme on load
document.body.setAttribute('data-theme', savedTheme);

// Initialize the app
init();

function init() {
    setTheme(savedTheme);
    renderTasks();
    updateTaskCount();
    updateClearCompletedButton();
    updateProgressBar();
}

function addTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        taskInput.classList.add('error');
        errorMessage.classList.remove('hidden');
        
        setTimeout(() => {
            taskInput.classList.remove('error');
            errorMessage.classList.add('hidden');
        }, 3000);
        
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    
    taskInput.value = '';
    renderTasks();
    updateTaskCount();
    updateProgressBar();
    
    // Clear search input when adding a new task
    if (searchInput.value) {
        searchInput.value = '';
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    
    saveTasks();
    renderTasks();
    updateTaskCount();
    updateClearCompletedButton();
    updateProgressBar();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    
    saveTasks();
    renderTasks();
    updateTaskCount();
    updateClearCompletedButton();
    updateProgressBar();
}

function clearCompleted() {
    try {
        tasks = tasks.filter(task => !task.completed);
        
        saveTasks();
        renderTasks();
        updateTaskCount();
        updateClearCompletedButton();
        updateProgressBar();
    } catch (error) {
        console.error("Error clearing completed tasks:", error);
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    [filterAll, filterActive, filterCompleted].forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    renderTasks();
}

function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        showEmptyState();
        return;
    }
    
    emptyState.classList.add('hidden');
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement('div');
    checkbox.className = `checkbox-container ${task.completed ? 'checked' : ''}`;
    
    const checkIcon = document.createElement('img');
    checkIcon.src = 'assets/icons/check.svg';
    checkIcon.alt = 'Completed';
    checkIcon.style.display = task.completed ? 'block' : 'none';
    checkbox.appendChild(checkIcon);
    
    checkbox.addEventListener('click', () => {
        toggleTask(task.id);
        checkIcon.style.display = task.completed ? 'none' : 'block';
    });
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    const trashIcon = document.createElement('img');
    trashIcon.src = 'assets/icons/trash.svg';
    trashIcon.alt = 'Delete';
    deleteBtn.appendChild(trashIcon);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(deleteBtn);
    
    return li;
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    
    switch (currentFilter) {
        case 'active':
            emptyStateMessage.textContent = 'No active tasks left - good job!';
            break;
        case 'completed':
            emptyStateMessage.textContent = 'No completed tasks yet';
            break;
        default:
            emptyStateMessage.textContent = 'Your task list is empty - add tasks to get started';
    }
}

function updateTaskCount() {
    const activeCount = tasks.filter(task => !task.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

function updateClearCompletedButton() {
    const hasCompleted = tasks.some(task => task.completed);
    clearCompletedBtn.classList.toggle('hidden', !hasCompleted);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update progress bar
function updateProgressBar() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    
    if (total === 0) {
        progressFill.style.width = '0%';
        progressPercentage.textContent = '0%';
    } else {
        const percentage = Math.round((completed / total) * 100);
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        renderTasks(); // Reset to normal view if search field is cleared
        return;
    }
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;
        
        return task.text.toLowerCase().includes(searchTerm);
    });
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        emptyStateMessage.textContent = `No tasks found matching "${searchTerm}"`;
        return;
    }
    
    emptyState.classList.add('hidden');
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        
        // Highlight the search term in the task text
        const taskTextElement = taskElement.querySelector('.task-text');
        const taskText = taskTextElement.textContent;
        const highlightedText = highlightSearchTerm(taskText, searchTerm);
        taskTextElement.innerHTML = highlightedText;
        
        taskList.appendChild(taskElement);
    });
}

// Helper function to highlight search terms
function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Helper function to escape special characters in search term for regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}