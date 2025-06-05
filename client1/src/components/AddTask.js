import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addTask, updateTask, fetchTask } from '../store/taskSlice';
import { FaArrowLeft } from 'react-icons/fa';

function AddTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [taskId, setTaskId] = useState(id || new URLSearchParams(window.location.search).get('id'));
  const [isEditing, setIsEditing] = useState(!!taskId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      setLoading(true);
      dispatch(fetchTask(taskId))
        .then(task => {
          if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
            setPriority(task.priority || 'medium');
            setDueDate(task.dueDate || '');
          }
        })
        .catch(error => {
          console.error('Error fetching task:', error);
          alert('Error loading task details. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskId, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const task = {
      title,
      description,
      status,
      priority,
      dueDate
    };

    try {
      let result;
      if (isEditing) {
        result = await dispatch(updateTask({
          id: taskId,
          task
        })).unwrap();
      } else {
        result = await dispatch(addTask(task)).unwrap();
      }
      
      // Show success message (optional)
      console.log('Task saved successfully:', result);
      
      // Redirect to dashboard
      navigate('/');  // Redirect to root path which shows Dashboard
    } catch (error) {
      console.error('Error saving task:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="container-fluid">
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '20px',
        zIndex: 1000
      }}>
        <button
          className="btn btn-outline-secondary"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => navigate('/')}
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Back
        </button>
      </div>
      <div className="row justify-content-center" style={{ marginTop: '1px' }}>
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add New Task</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">
                    <i className="fas fa-heading me-2"></i>Title
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="form-label">
                    <i className="fas fa-align-left me-2"></i>Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      <i className="fas fa-tasks me-2"></i>Status
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={status}
                      onChange={handleChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="priority" className="form-label">
                      <i className="fas fa-star me-2"></i>Priority
                    </label>
                    <select
                      className="form-select"
                      id="priority"
                      name="priority"
                      value={priority}
                      onChange={handleChange}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="dueDate" className="form-label">
                    <i className="far fa-calendar-alt me-2"></i>Due Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dueDate"
                    name="dueDate"
                    value={dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="d-flex justify-content-between gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTask;