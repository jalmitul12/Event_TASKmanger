// Reference: https://vuejs.org/guide/quick-start.html#using-vue-from-cdn
// Reference: https://vuejs.org/examples/#todomvc
// Reference: https://vuejs.org/examples/#handling-input
// Reference: https://github.com/CodeWithSindhu/kanban-board-js
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      // Core Data Collections
      events: [],
      tasks: [],

      // Navigation & View States
      activeView: 'dashboard', // 'dashboard' | 'events' | 'tasks' | 'event-details'
      selectedEventId: null,
      taskViewMode: 'list', // 'list' | 'kanban'
      loading: false,

      // Toast Notification State
      notification: {
        show: false,
        message: '',
        type: 'success' // 'success' | 'error'
      },
      toastTimeout: null,

      // Filter and Search States
      eventSearchQuery: '',
      eventCategoryFilter: 'All',
      eventStatusFilter: 'All',

      taskSearchQuery: '',
      taskEventFilter: 'All',
      taskStatusFilter: 'All',
      taskPriorityFilter: 'All',
      taskOverdueFilter: false,
      taskSortBy: 'dueDate', // 'dueDate' | 'priority' | 'createdAt'
      taskSortOrder: 'asc',

      // Modals State
      activeModal: null, // null | 'event-form' | 'task-form' | 'confirm-delete'
      modalMode: 'create', // 'create' | 'edit'
      deleteTarget: null, // { type: 'event'|'task', id: string, name: string }

      // Form Models
      eventForm: {
        id: '',
        name: '',
        description: '',
        category: 'Tech Fest',
        startDate: '',
        endDate: '',
        venue: '',
        status: 'Planning'
      },
      taskForm: {
        id: '',
        title: '',
        description: '',
        eventId: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        assignedTo: ''
      },
      formErrors: {},

      // Drag and Drop Tracking
      draggedTaskId: null,

      // Predefined Option Sets
      categories: ['Tech Fest', 'Hackathon', 'Workshop', 'Cultural', 'Conference', 'Personal'],
      priorities: ['High', 'Medium', 'Low'],
      taskStatuses: ['Pending', 'In Progress', 'Completed'],
      eventStatuses: ['Planning', 'Active', 'Completed', 'On Hold']
    };
  },

  computed: {
    // ==========================================
    // Dashboard Summary Statistics
    // ==========================================
    totalEvents() {
      return this.events.length;
    },

    activeEventsCount() {
      return this.events.filter(e => e.status === 'Active').length;
    },

    upcomingEventsCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.events.filter(e => e.startDate >= today && e.status !== 'Completed').length;
    },

    totalTasks() {
      return this.tasks.length;
    },

    completedTasksCount() {
      return this.tasks.filter(t => t.status === 'Completed').length;
    },

    pendingTasksCount() {
      return this.tasks.filter(t => t.status === 'Pending').length;
    },

    inProgressTasksCount() {
      return this.tasks.filter(t => t.status === 'In Progress').length;
    },

    overdueTasksCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.tasks.filter(t => {
        return t.status !== 'Completed' && t.dueDate && t.dueDate < today;
      }).length;
    },

    overallCompletionRate() {
      if (this.totalTasks === 0) return 0;
      return Math.round((this.completedTasksCount / this.totalTasks) * 100);
    },

    // Tasks with upcoming deadlines (within next 7 days or overdue, not completed)
    upcomingDeadlines() {
      const today = new Date().toISOString().split('T')[0];
      return this.tasks
        .filter(t => t.status !== 'Completed' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    },

    // Selected event for the detail view
    selectedEvent() {
      if (!this.selectedEventId) return null;
      return this.events.find(e => e.id === this.selectedEventId) || null;
    },

    // Tasks belonging to the selected event
    selectedEventTasks() {
      if (!this.selectedEventId) return [];
      return this.tasks.filter(t => t.eventId === this.selectedEventId);
    },

    // Selected event calculated metrics
    selectedEventMetrics() {
      const tasks = this.selectedEventTasks;
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const inProgress = tasks.filter(t => t.status === 'In Progress').length;
      const pending = tasks.filter(t => t.status === 'Pending').length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return { total, completed, inProgress, pending, percent };
    },

    // ==========================================
    // Filtered Events
    // ==========================================
    filteredEvents() {
      const query = this.eventSearchQuery.toLowerCase().trim();

      return this.events.filter(event => {
        const matchesSearch = !query ||
          event.name.toLowerCase().includes(query) ||
          (event.description && event.description.toLowerCase().includes(query)) ||
          (event.venue && event.venue.toLowerCase().includes(query));

        const matchesCategory = this.eventCategoryFilter === 'All' || event.category === this.eventCategoryFilter;
        const matchesStatus = this.eventStatusFilter === 'All' || event.status === this.eventStatusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      });
    },

    // ==========================================
    // Filtered & Sorted Tasks
    // ==========================================
    filteredTasks() {
      const query = this.taskSearchQuery.toLowerCase().trim();
      const today = new Date().toISOString().split('T')[0];

      let list = this.tasks.filter(task => {
        const matchesSearch = !query ||
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.assignedTo && task.assignedTo.toLowerCase().includes(query));

        const matchesEvent = this.taskEventFilter === 'All' || task.eventId === this.taskEventFilter;
        const matchesStatus = this.taskStatusFilter === 'All' || task.status === this.taskStatusFilter;
        const matchesPriority = this.taskPriorityFilter === 'All' || task.priority === this.taskPriorityFilter;

        const isOverdue = task.status !== 'Completed' && task.dueDate && task.dueDate < today;
        const matchesOverdue = !this.taskOverdueFilter || isOverdue;

        return matchesSearch && matchesEvent && matchesStatus && matchesPriority && matchesOverdue;
      });

      // Sorting
      return list.sort((a, b) => {
        if (this.taskSortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return this.taskSortOrder === 'asc'
            ? new Date(a.dueDate) - new Date(b.dueDate)
            : new Date(b.dueDate) - new Date(a.dueDate);
        }

        if (this.taskSortBy === 'priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          const weightA = weights[a.priority] || 0;
          const weightB = weights[b.priority] || 0;
          return this.taskSortOrder === 'asc' ? weightB - weightA : weightA - weightB;
        }

        if (this.taskSortBy === 'createdAt') {
          return this.taskSortOrder === 'asc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        }

        return 0;
      });
    },

    // Kanban board columns grouped from filtered tasks
    kanbanTasks() {
      return {
        pending: this.filteredTasks.filter(t => t.status === 'Pending'),
        inProgress: this.filteredTasks.filter(t => t.status === 'In Progress'),
        completed: this.filteredTasks.filter(t => t.status === 'Completed')
      };
    }
  },

  methods: {
    // ==========================================
    // HTTP API Fetch Calls
    // ==========================================
    async fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.success) {
          this.events = json.data;
        }
      } catch (err) {
        this.showToast('Failed to fetch events from server', 'error');
      }
    },

    async fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        const json = await res.json();
        if (json.success) {
          this.tasks = json.data;
        }
      } catch (err) {
        this.showToast('Failed to fetch tasks from server', 'error');
      }
    },

    async fetchAll() {
      this.loading = true;
      try {
        await Promise.all([this.fetchEvents(), this.fetchTasks()]);
      } finally {
        this.loading = false;
      }
    },

    // ==========================================
    // Feedback / Toast Notification
    // ==========================================
    showToast(message, type = 'success') {
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.notification = { show: true, message, type };
      this.toastTimeout = setTimeout(() => {
        this.notification.show = false;
      }, 4000);
    },

    dismissToast() {
      this.notification.show = false;
    },

    // ==========================================
    // View Navigation
    // ==========================================
    switchView(viewName) {
      this.activeView = viewName;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    viewEventDetails(eventId) {
      this.selectedEventId = eventId;
      this.activeView = 'event-details';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ==========================================
    // Event Progress Calculations
    // ==========================================
    calculateEventProgress(event) {
      if (!event) return 0;
      const eventTasks = this.tasks.filter(t => t.eventId === event.id);
      if (eventTasks.length === 0) return 0;
      const completed = eventTasks.filter(t => t.status === 'Completed').length;
      return Math.round((completed / eventTasks.length) * 100);
    },

    getEventTaskStats(eventId) {
      const eventTasks = this.tasks.filter(t => t.eventId === eventId);
      const total = eventTasks.length;
      const completed = eventTasks.filter(t => t.status === 'Completed').length;
      return { total, completed };
    },

    // ==========================================
    // Event Form & CRUD Operations
    // ==========================================
    openCreateEventModal() {
      this.modalMode = 'create';
      this.eventForm = {
        id: '',
        name: '',
        description: '',
        category: 'Tech Fest',
        startDate: '',
        endDate: '',
        venue: '',
        status: 'Planning'
      };
      this.formErrors = {};
      this.activeModal = 'event-form';
    },

    openEditEventModal(event) {
      this.modalMode = 'edit';
      this.eventForm = {
        id: event.id,
        name: event.name,
        description: event.description || '',
        category: event.category || 'General',
        startDate: event.startDate,
        endDate: event.endDate,
        venue: event.venue || '',
        status: event.status || 'Planning'
      };
      this.formErrors = {};
      this.activeModal = 'event-form';
    },

    validateEventForm() {
      this.formErrors = {};
      if (!this.eventForm.name.trim()) {
        this.formErrors.name = 'Event name is required';
      }
      if (!this.eventForm.startDate) {
        this.formErrors.startDate = 'Start date is required';
      }
      if (!this.eventForm.endDate) {
        this.formErrors.endDate = 'End date is required';
      }
      if (this.eventForm.startDate && this.eventForm.endDate) {
        if (new Date(this.eventForm.startDate) > new Date(this.eventForm.endDate)) {
          this.formErrors.endDate = 'End date cannot be earlier than start date';
        }
      }
      return Object.keys(this.formErrors).length === 0;
    },

    async submitEventForm() {
      if (!this.validateEventForm()) return;

      this.loading = true;
      try {
        if (this.modalMode === 'create') {
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.eventForm)
          });
          const json = await res.json();
          if (json.success) {
            this.events.push(json.data);
            this.showToast(`Event "${json.data.name}" created successfully!`);
            this.closeModal();
          } else {
            this.showToast(json.error || 'Failed to create event', 'error');
          }
        } else {
          // Edit mode
          const res = await fetch(`/api/events/${this.eventForm.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.eventForm)
          });
          const json = await res.json();
          if (json.success) {
            const index = this.events.findIndex(e => e.id === this.eventForm.id);
            if (index !== -1) {
              this.events[index] = json.data;
            }
            this.showToast(`Event "${json.data.name}" updated successfully!`);
            this.closeModal();
          } else {
            this.showToast(json.error || 'Failed to update event', 'error');
          }
        }
      } catch (err) {
        this.showToast('Network error while saving event', 'error');
      } finally {
        this.loading = false;
      }
    },

    confirmDeleteEvent(event) {
      this.deleteTarget = {
        type: 'event',
        id: event.id,
        name: event.name
      };
      this.activeModal = 'confirm-delete';
    },

    async executeDelete() {
      if (!this.deleteTarget) return;

      this.loading = true;
      try {
        if (this.deleteTarget.type === 'event') {
          const res = await fetch(`/api/events/${this.deleteTarget.id}`, {
            method: 'DELETE'
          });
          const json = await res.json();
          if (json.success) {
            this.events = this.events.filter(e => e.id !== this.deleteTarget.id);
            // Cascade delete tasks in local state as well
            this.tasks = this.tasks.filter(t => t.eventId !== this.deleteTarget.id);
            if (this.selectedEventId === this.deleteTarget.id) {
              this.selectedEventId = null;
              this.activeView = 'events';
            }
            this.showToast(json.message || 'Event deleted successfully');
          } else {
            this.showToast(json.error || 'Failed to delete event', 'error');
          }
        } else if (this.deleteTarget.type === 'task') {
          const res = await fetch(`/api/tasks/${this.deleteTarget.id}`, {
            method: 'DELETE'
          });
          const json = await res.json();
          if (json.success) {
            this.tasks = this.tasks.filter(t => t.id !== this.deleteTarget.id);
            this.showToast('Task deleted successfully');
          } else {
            this.showToast(json.error || 'Failed to delete task', 'error');
          }
        }
      } catch (err) {
        this.showToast('Network error while deleting record', 'error');
      } finally {
        this.loading = false;
        this.closeModal();
      }
    },

    // ==========================================
    // Task Form & CRUD Operations
    // ==========================================
    openCreateTaskModal(preselectedEventId = null) {
      if (this.events.length === 0) {
        this.showToast('Please create at least one event before adding tasks', 'error');
        return;
      }

      this.modalMode = 'create';
      this.taskForm = {
        id: '',
        title: '',
        description: '',
        eventId: preselectedEventId || (this.selectedEventId || this.events[0].id),
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        assignedTo: ''
      };
      this.formErrors = {};
      this.activeModal = 'task-form';
    },

    openEditTaskModal(task) {
      this.modalMode = 'edit';
      this.taskForm = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        eventId: task.eventId,
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        dueDate: task.dueDate || '',
        assignedTo: task.assignedTo || ''
      };
      this.formErrors = {};
      this.activeModal = 'task-form';
    },

    validateTaskForm() {
      this.formErrors = {};
      if (!this.taskForm.title.trim()) {
        this.formErrors.title = 'Task title is required';
      }
      if (!this.taskForm.eventId) {
        this.formErrors.eventId = 'Please select an associated event';
      }
      return Object.keys(this.formErrors).length === 0;
    },

    async submitTaskForm() {
      if (!this.validateTaskForm()) return;

      this.loading = true;
      try {
        if (this.modalMode === 'create') {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.taskForm)
          });
          const json = await res.json();
          if (json.success) {
            this.tasks.push(json.data);
            this.showToast(`Task "${json.data.title}" added successfully!`);
            this.closeModal();
          } else {
            this.showToast(json.error || 'Failed to create task', 'error');
          }
        } else {
          // Edit mode
          const res = await fetch(`/api/tasks/${this.taskForm.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.taskForm)
          });
          const json = await res.json();
          if (json.success) {
            const index = this.tasks.findIndex(t => t.id === this.taskForm.id);
            if (index !== -1) {
              this.tasks[index] = json.data;
            }
            this.showToast(`Task "${json.data.title}" updated successfully!`);
            this.closeModal();
          } else {
            this.showToast(json.error || 'Failed to update task', 'error');
          }
        }
      } catch (err) {
        this.showToast('Network error while saving task', 'error');
      } finally {
        this.loading = false;
      }
    },

    confirmDeleteTask(task) {
      this.deleteTarget = {
        type: 'task',
        id: task.id,
        name: task.title
      };
      this.activeModal = 'confirm-delete';
    },

    // Quick status toggle (Completed <-> Pending)
    async toggleTaskCompletion(task) {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await this.updateTaskStatus(task.id, nextStatus);
    },

    // Update status via PATCH endpoint (e.g. from Kanban drag or select)
    async updateTaskStatus(taskId, newStatus) {
      try {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (json.success) {
          const index = this.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            this.tasks[index].status = newStatus;
            this.tasks[index].updatedAt = json.data.updatedAt;
          }
          this.showToast(`Task marked as ${newStatus}`);
        } else {
          this.showToast(json.error || 'Failed to update status', 'error');
        }
      } catch (err) {
        this.showToast('Failed to connect to backend', 'error');
      }
    },

    // ==========================================
    // Native Drag and Drop for Kanban Board
    // Reference: https://github.com/CodeWithSindhu/kanban-board-js
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
    // ==========================================
    onDragStart(evt, task) {
      this.draggedTaskId = task.id;
      evt.dataTransfer.effectAllowed = 'move';
      evt.dataTransfer.setData('text/plain', task.id);
    },

    onDragOver(evt) {
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'move';
    },

    async onDrop(evt, targetStatus) {
      evt.preventDefault();
      const taskId = evt.dataTransfer.getData('text/plain') || this.draggedTaskId;
      if (!taskId) return;

      const task = this.tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        await this.updateTaskStatus(taskId, targetStatus);
      }
      this.draggedTaskId = null;
    },

    // ==========================================
    // Utilities & Helpers
    // ==========================================
    closeModal() {
      this.activeModal = null;
      this.deleteTarget = null;
      this.formErrors = {};
    },

    getEventName(eventId) {
      const evt = this.events.find(e => e.id === eventId);
      return evt ? evt.name : 'Unknown Event';
    },

    formatDate(dateString) {
      if (!dateString) return 'Not set';
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateString;
    },

    isOverdue(dueDate, status) {
      if (!dueDate || status === 'Completed') return false;
      const today = new Date().toISOString().split('T')[0];
      return dueDate < today;
    },

    resetFilters() {
      this.eventSearchQuery = '';
      this.eventCategoryFilter = 'All';
      this.eventStatusFilter = 'All';

      this.taskSearchQuery = '';
      this.taskEventFilter = 'All';
      this.taskStatusFilter = 'All';
      this.taskPriorityFilter = 'All';
      this.taskOverdueFilter = false;
      this.taskSortBy = 'dueDate';
      this.taskSortOrder = 'asc';
    }
  },

  mounted() {
    this.fetchAll();

    // Listen for ESC key to close active modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }
});

app.mount('#app');
