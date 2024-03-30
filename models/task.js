const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    description:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
    },
    status:{
        type: String,
        required: true,
        enum: ['PENDING','INPROGRESS','COMPLETED'],
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},{timestamps: true});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;