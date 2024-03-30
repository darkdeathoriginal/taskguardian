const express = require("express");
const router = express.Router();
const { ROLES } = require("../config");
const { validateSessionToken } = require("../utils/helpers");
const User = require("../models/user");

/**
 * @openapi
 *  tags:
 *    name: User Management
 *    description: API endpoints for managing user roles
 * 
 * /api/user/update:
 *   put:
 *     summary: Update user role
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the user to update
 *               role:
 *                 type: string
 *                 enum: ["ADMIN", "MANAGER", "REGULAR"]
 *                 description: The new role for the user
 *     responses:
 *       '200':
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   example: success
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Invalid request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields or Invalid Role
 *       '401':
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the user
 *           example: 1234567890abcdef12345678
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: johndoe
 *         role:
 *           type: string
 *           enum: ["ADMIN", "MANAGER", "REGULAR"]
 *           description: The role of the user
 *           example: ADMIN
 */


router.put("/update", validateSessionToken, async (req, res) => {
  const user = req.user;
  const { id, role } = req.body;
  if (user.role !== "ADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!id || !role) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid Role" });
  }
  const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.json({
    state: "success",
    user: updatedUser,
  });
});

module.exports = router;
