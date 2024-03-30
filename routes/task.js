const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const User = require("../models/user");
const { validateSessionToken } = require("../utils/helpers");


router.get("/", validateSessionToken, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

router.post("/", validateSessionToken, async (req, res) => {
  const user = req.user;
  const { role } = user;
  const { title, description } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const task = new Task({
      title,
      description,
      status: "PENDING",
      createdBy: user.id,
    });
    await task.save();
    res.json({
      state: "success",
      task,
    });
  } catch (error) {
    console.log("Error creating task:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:id", validateSessionToken, async (req, res) => {
  const user = req.user;
  const { role } = user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Please provide task id" });
  }
  const { status } = req.body;
  if (!status) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  if (!["PENDING", "INPROGRESS", "COMPLETED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (role === "USER" && task.assignedTo.toString() !== user.id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  task.status = status;
  await task.save();
  res.json({
    state: "success",
    task,
  });
});

router.delete("/:id", validateSessionToken, async (req, res) => {
  const user = req.user;
  const { role } = user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Please provide task id" });
  }
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (role === "USER" && task.assignedTo.toString() !== user.id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  await task.remove();
  res.json({
    state: "success",
    task,
  });
});

router.put("/:id/assign", validateSessionToken, async (req, res) => {
  const user = req.user;
  const { role } = user;
  if (role === "USER") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Please provide task id" });
  }
  const { assignedTo } = req.body;
  if (!assignedTo) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  const assignedUser = await User.findById(assignedTo);
  if (!assignedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  if (assignedUser.role === "ADMIN") {
    return res.status(400).json({ message: "Cannot assign task to ADMIN" });
  }
  if (task.status === "COMPLETED") {
    return res.status(400).json({ message: "Cannot assign completed task" });
  }
  if (assignedUser.role === "MANAGER") {
    return res.status(400).json({ message: "Cannot assign task to MANAGER" });
  }
  if (task.assignedTo) {
    return res.status(400).json({ message: "Task already assigned" });
  }
  task.assignedTo = assignedTo;
  await task.save();
  res.json({
    state: "success",
    task,
  });
});

module.exports = router;


/**
 * @openapi
 * tags:
 *   - name: Task Management
 *     description: API endpoints for managing tasks
 * 
 * /api/task:
 *   get:
 *     summary: Get all tasks
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 * 
 *   post:
 *     summary: Create a new task
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTask'
 *     responses:
 *       '200':
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   example: success
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields
 *       '401':
 *         description: Unauthorized access or missing session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized or No token provided
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * 
 * /api/task/{id}:
 *   put:
 *     summary: Update task status
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["PENDING", "INPROGRESS", "COMPLETED"]
 *     responses:
 *       '200':
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   example: success
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields
 *       '401':
 *         description: Unauthorized access or missing session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized or No token provided
 *       '404':
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *
 *   delete:
 *     summary: Delete task
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to delete
 *     responses:
 *       '200':
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   example: success
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide task id
 *       '401':
 *         description: Unauthorized access or missing session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized or No token provided
 *       '404':
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *
 * /api/task/{id}/assign:
 *   put:
 *     summary: Assign task to user
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to assign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedTo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Task assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   example: success
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields
 *       '401':
 *         description: Unauthorized access or missing session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized or No token provided
 *       '404':
 *         description: Task or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task or user not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:           
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT 
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the task
 *           example: 1234567890abcdef12345678
 *         title:
 *           type: string
 *           description: The title of the task
 *           example: Finish project
 *         description:
 *           type: string
 *           description: The description of the task
 *           example: Complete all tasks assigned in the project
 *         status:
 *           type: string
 *           enum: ["PENDING", "INPROGRESS", "COMPLETED"]
 *           description: The status of the task
 *           example: PENDING
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the task
 *           example: 1234567890abcdef12345678
 *         assignedTo:
 *           type: string
 *           description: The ID of the user to whom the task is assigned
 *           example: 1234567890abcdef12345678
 *     NewTask:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task
 *           example: Finish project
 *         description:
 *           type: string
 *           description: The description of the task
 *           example: Complete all tasks assigned in the project
 */
