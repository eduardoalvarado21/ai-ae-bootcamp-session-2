# Functional Requirements

Core functional requirements for the TODO application.

## FR-1: Add a Task
- A user can create a task by entering a title.
- A user can optionally assign a due date when creating a task.
- A task with an empty title is rejected with a validation message.
- A new task is not completed by default.

## FR-2: Due Date
- Each task may have a due date (date only, `YYYY-MM-DD`).
- The due date is displayed alongside the task title.
- A due date can be added, changed, or removed after the task is created.
- Invalid dates are rejected with a validation message.

## FR-3: Edit a Task
- A user can edit the title of an existing task.
- A user can edit the due date of an existing task.
- Edits are validated using the same rules as when adding a task.
- A user can cancel an edit without changing the task.
- Edited changes are persisted and reflected immediately in the list.

## FR-4: Sort by Date
- The task list is sorted by due date in ascending order (earliest first).
- Tasks without a due date are listed after all tasks that have a due date.
- Tasks with the same due date keep their creation order.
- The list re-sorts automatically after a task is added, edited, or deleted.

## FR-5: Delete a Task
- A user can delete any task.
- The deletion removes the task from the list and from storage.
- Deleting a task that does not exist returns a not-found error.

## FR-6: View Tasks
- A user can view all tasks in a single list showing title and due date.
- An empty list shows a message indicating there are no tasks.

## API Summary (Backend)

| Method | Endpoint     | Description                             |
|--------|--------------|-----------------------------------------|
| GET    | `/api/todos` | List tasks sorted by due date           |
| POST   | `/api/todos` | Create a task (title, optional dueDate) |
| PUT    | `/api/todos/:id` | Update a task's title and/or due date |
| DELETE | `/api/todos/:id` | Delete a task                       |
