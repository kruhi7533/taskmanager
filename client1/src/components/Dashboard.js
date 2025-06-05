import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTasks, deleteTask, updateTask } from '../store/taskSlice';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui/ui/widgets/tooltip';
import './Dashboard.css';
import './TaskCard.css';
import './PriorityBadge.css';
import { FaSearch, FaFilter, FaTimes, FaCheck, FaTrash, FaEdit } from 'react-icons/fa';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, status, error } = useSelector((state) => state.tasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filteredTasks = tasks.filter(task => {
    // Debug logging
    console.log('Filtering task:', {
      title: task.title,
      priority: task.priority,
      status: task.status,
      searchTerm,
      statusFilter,
      priorityFilter
    });

    // Search filter - improved to match any part of the text
    const matchesSearch = searchTerm ? 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Status filter
    const matchesStatus = statusFilter ? task.status === statusFilter : true;

    // Priority filter - improved comparison
    const matchesPriority = priorityFilter ? 
      task.priority?.toLowerCase() === priorityFilter.toLowerCase() 
      : true;

    // Debug logging for priority filter
    console.log('Priority filter result:', {
      taskPriority: task.priority,
      filterPriority: priorityFilter,
      matchesPriority
    });

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskListRef = useRef(null);
  const sortableInitialized = useRef(false);
  const tooltipInitialized = useRef(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Initialize jQuery functionality after tasks are loaded
    if (filteredTasks.length > 0 && taskListRef.current) {
      // Initialize tooltips if not already initialized
      if (!tooltipInitialized.current) {
        try {
          $('[data-toggle="tooltip"]').tooltip();
          tooltipInitialized.current = true;
        } catch (error) {
          console.log('Tooltip initialization error:', error);
        }
      }

      // Initialize sortable if not already initialized
      if (!sortableInitialized.current) {
        try {
          $(taskListRef.current).sortable({
            items: '.task-card',
            handle: '.card-header',
            update: function(event, ui) {
              // Here you could implement custom sorting logic
              console.log('Task order updated');
            }
          });
          sortableInitialized.current = true;
        } catch (error) {
          console.log('Sortable initialization error:', error);
        }
      }

      // Hover effects
      $('.task-card').hover(
        function() {
          $(this).find('.task-actions').stop().fadeIn(200);
        },
        function() {
          $(this).find('.task-actions').stop().fadeOut(200);
        }
      );
    }

    // Cleanup
    return () => {
      // Cleanup tooltips
      if (tooltipInitialized.current) {
        try {
          $('[data-toggle="tooltip"]').tooltip('dispose');
        } catch (error) {
          console.log('Tooltip cleanup error:', error);
        }
        tooltipInitialized.current = false;
      }

      // Cleanup sortable
      if (sortableInitialized.current && taskListRef.current) {
        try {
          $(taskListRef.current).sortable('destroy');
        } catch (error) {
          console.log('Sortable cleanup error:', error);
        }
        sortableInitialized.current = false;
      }
    };
  }, [filteredTasks]);

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleComplete = (taskId) => {
    dispatch(updateTask({
      id: taskId,
      task: { status: 'completed' }
    }));
  };

  const handleEdit = (taskId) => {
    // Redirect to add task page with task ID as path parameter
    navigate(`/add-task/${taskId}`);
  };

  if (status === 'loading') {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-circle me-2"></i>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="filter-container">
        <div className="filter-row">
        <div className="filter-group">
          <label>Search</label>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch className="filter-icon" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="text-end mt-2">
        <button
          className="clear-filters"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
            setPriorityFilter('');
          }}
        >
          <FaTimes className="filter-icon" />
          Clear Filters
        </button>
      </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Tasks</h2>
        <Link to="/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Add New Task
        </Link>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
          <h4>No tasks found</h4>
          <p className="text-muted">Get started by adding a new task!</p>
          <Link to="/add" className="btn btn-primary mt-3">
            Create Your First Task
          </Link>
        </div>
      ) : (
        <div className="row g-4 task-list" ref={taskListRef}>
          {filteredTasks.map((task) => (
            <div 
              key={task._id} 
              id={`task-${task._id}`}
              className="col-md-6 col-lg-4 task-card"
              data-toggle="tooltip"
              title={`Created: ${new Date(task.createdAt).toLocaleDateString()}`}
            >
              <div className="card h-100 task-card">
                <div className="card-header">
                  <h5 className="card-title">{task.title}</h5>
                  <span className={`status-badge status-${task.status || 'pending'}`}>
                    {(task.status || 'pending').charAt(0).toUpperCase() + (task.status || 'pending').slice(1)}
                  </span>
                </div>
                <div className="card-body">
                  <p className="description">{task.description}</p>
                  <div className="priority-date-container">
                    <div className="priority">
                      <span className={`priority-badge ${task.priority || 'medium'}`}>
                        <i className="fas fa-star"></i>
                        {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div>
                        <i className="far fa-calendar-alt"></i>
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="position-absolute bottom-0 end-0 mb-3 me-3">
                    <div className="d-flex gap-2">
                      <button
                        className="action-btn btn-done"
                        onClick={() => handleComplete(task._id)}
                      >
                        <FaCheck />
                        Done
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(task._id)}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard; 