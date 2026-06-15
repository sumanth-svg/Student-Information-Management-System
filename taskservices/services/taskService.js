import Tasks from "../models/tasks.js";
import { decodeToken, isAdmin, ownerFilter } from "../middleware/auth.js";
import * as vectorService from "./vectorService.js";

export async function createTask(data, token) {
    try {
        const payload = decodeToken(token);
        data.title = (data.title || "").trim();
        data.description = (data.description || "").trim();

        // A student always owns the tasks they create. When an admin assigns a
        // task to a student from the UI, make that student the owner too so it
        // appears in both the admin's all-tasks view and the student's view.
        if (isAdmin(payload) && data.createdby == null && Number(data.assignedto) > 0) {
            data.createdby = Number(data.assignedto);
        } else if (!isAdmin(payload) || data.createdby == null) {
            data.createdby = payload.crid;
        }
        data.vector = await vectorService.generateVector(`${data.title} ${data.description}`.trim());
        await Tasks.create(data);

        return {
            code: 200,
            message: "New task has been created"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

export async function getAllTasks(PAGE, SIZE, token) {
    try {
        const payload = decodeToken(token);

        const page = Number(PAGE);
        const size = Number(SIZE);

        if (isNaN(page) || isNaN(size) || page <= 0 || size <= 0) {
            return {
                code: 400,
                message: "Invalid page or size value",
                page: 1,
                size: 0,
                totalrecords: 0,
                totalpages: 0,
                tasks: []
            };
        }

        const skip = (page - 1) * size;
        // Admin sees every task; a student sees only their own.
        const filter = ownerFilter(payload, "createdby");

        const tasks = await Tasks.find(filter)
            .sort({ createdat: -1 })
            .skip(skip)
            .limit(size);

        const totalrecords = await Tasks.countDocuments(filter);

        return {
            code: 200,
            message: "Tasks fetched successfully",
            page: page,
            size: size,
            totalrecords: totalrecords,
            totalpages: Math.ceil(totalrecords / size),
            tasks: tasks
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message,
            page: 1,
            size: 0,
            totalrecords: 0,
            totalpages: 0,
            tasks: []
        };
    }
}

export async function vectorSearch(key, token)
{
    let response;
    try
    {
        const payload = decodeToken(token);

        const searchVector = await vectorService.generateVector(key);

        const tasks = await Tasks.find(ownerFilter(payload, "createdby"))

        const tasksData = tasks.map((task)=>{
            const similarity = vectorService.cosineSimilarity(searchVector, task.vector);
            return {...task._doc, similarity};
        })
        .filter((task)=>task.similarity > 0.10)
        .sort((a,b)=>b.similarity - a.similarity)
        .slice(0,5);

        response = {code: 200, tasks: tasksData};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function getTask(id, token) {
    try {
        const payload = decodeToken(token);

        const task = await Tasks.findOne({
            _id: id,
            ...ownerFilter(payload, "createdby")
        });

        if (!task) {
            return {
                code: 404,
                message: "Task not found"
            };
        }

        return {
            code: 200,
            message: "Task fetched successfully",
            task: task
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

export async function updateTask(id, data, token) {
    try {
        const payload = decodeToken(token);

        delete data.createdby;
        delete data._id;
        delete data.id;
        data.title = (data.title || "").trim();
        data.description = (data.description || "").trim();
        data.vector = await vectorService.generateVector(`${data.title} ${data.description}`.trim());
        const result = await Tasks.findOneAndUpdate(
            {
                _id: id,
                ...ownerFilter(payload, "createdby")
            },
            data,
            { new: true }
        );

        if (!result) {
            return {
                code: 404,
                message: "Task not found or not allowed to update"
            };
        }

        return {
            code: 200,
            message: "Task updated successfully"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

export async function deleteTask(id, token) {
    try {
        const payload = decodeToken(token);

        const result = await Tasks.findOneAndDelete({
            _id: id,
            ...ownerFilter(payload, "createdby")
        });

        if (!result) {
            return {
                code: 404,
                message: "Task not found or not allowed to delete"
            };
        }

        return {
            code: 200,
            message: "Task has been deleted"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}
