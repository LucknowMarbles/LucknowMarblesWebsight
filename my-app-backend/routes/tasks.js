const express = require('express');
const router = express.Router();
const { 
  getTasks,
  createTask,
  updateChecklistItem,
  addChecklistItems,
  deleteChecklistItem,
  updateTaskStatus
} = require('../controller/task');
const uploadPurchaseController = require('../controller/uploadPurchase');

router.get('/', getTasks);
router.patch('/:taskId/checklist/:itemId', updateChecklistItem);
router.post('/', createTask);
router.post('/:taskId/checklist', addChecklistItems);
router.delete('/:taskId/checklist/:itemId', deleteChecklistItem);
router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;