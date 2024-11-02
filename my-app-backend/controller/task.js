const Task = require('../modals/Task');

// Get tasks with optional user filter
exports.getTasks = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const query = userId && userId !== 'all' 
      ? { assignedTo: userId }
      : {};

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Update checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;
    const { completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        'checklist._id': itemId 
      },
      { 
        $set: { 'checklist.$.completed': completed }
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task or checklist item not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ message: 'Error updating checklist item' });
  }
};

// Create new task with checklist
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      assignedTo, 
      dueDate, 
      checklist // Array of checklist item descriptions
    } = req.body;

    // Validate required fields
    if (!title || !description || !dueDate) {
      return res.status(400).json({ 
        message: 'Title, description, and due date are required' 
      });
    }

    // Format checklist items
    const formattedChecklist = checklist.map(item => ({
      description: item,
      completed: false
    }));

    // Create new task
    const newTask = new Task({
      title,
      description,
      assignedTo,
      dueDate: new Date(dueDate),
      status: 'pending',
      checklist: formattedChecklist
    });

    await newTask.save();

    // Populate assignedTo field before sending response
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      message: 'Error creating task',
      error: error.message 
    });
  }
};

// Add checklist items to existing task
exports.addChecklistItems = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { checklistItems } = req.body; // Array of new checklist item descriptions

    if (!Array.isArray(checklistItems) || checklistItems.length === 0) {
      return res.status(400).json({ 
        message: 'Checklist items must be provided as an array' 
      });
    }

    // Format new checklist items
    const newChecklistItems = checklistItems.map(item => ({
      description: item,
      completed: false
    }));

    // Add new items to existing checklist
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: { 
          checklist: { 
            $each: newChecklistItems 
          }
        }
      },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Checklist items added successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error adding checklist items:', error);
    res.status(500).json({ 
      message: 'Error adding checklist items',
      error: error.message 
    });
  }
};

// Delete checklist item
exports.deleteChecklistItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: { 
          checklist: { _id: itemId } 
        }
      },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Checklist item deleted successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ 
      message: 'Error deleting checklist item',
      error: error.message 
    });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value' 
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ 
      message: 'Error updating task status',
      error: error.message 
    });
  }
};