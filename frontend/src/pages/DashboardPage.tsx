/**
 * Main dashboard page for TechScope.
 *
 * Coordinates project and task management, dashboard data,
 * task details, comments, attachments, and related modal workflows.
 */

import { useEffect, useRef, useState } from "react";
import { getProjects } from "../services/projectService";
import type { Project } from "../services/projectService";
import { updateTask } from "../services/taskService";
import type { Task } from "../services/taskService";
import type { TaskPriority, TaskStatus} from "../types/dashboard";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardInsights from "../components/dashboard/DashboardInsights";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import EditTaskModal from "../components/dashboard/EditTaskModal";
import ProjectManagement from "../components/dashboard/ProjectManagement";
import ProjectProgress from "../components/dashboard/ProjectProgress";
import TaskBreakdown from "../components/dashboard/TaskBreakdown";
import TaskDetailsModal from "../components/dashboard/TaskDetailsModal";
import TasksSection from "../components/dashboard/TasksSection";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";

import RecentTasks from "../components/RecentTasks";
import Navbar from "../components/Navbar";
import CreateProjectForm from "../components/CreateProjectForm";
import CreateTaskForm from "../components/CreateTaskForm";
import LoadingSpinner from "../components/LoadingSpinner";
import RenameProjectModal from "../components/RenameProjectModal";
import DeleteProjectModal from "../components/DeleteProjectModal";
import DeleteTaskModal from "../components/DeleteTaskModal";
import { useDashboard } from "../context/DashboardContext";
import "../styles/dashboard.css";
import { getTaskActivities } from "../services/taskActivityService";
import type { TaskActivity } from "../services/taskActivityService";
import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from "../services/taskCommentService";

import type {TaskComment} from "../services/taskCommentService";
import type {TaskAttachment} from "../services/taskAttachmentService";

import {
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
  downloadTaskAttachment,
} from "../services/taskAttachmentService";

import { getCurrentUser } from "../services/authService";
import type { CurrentUser } from "../services/authService";

const SELECTED_PROJECT_STORAGE_KEY =
  "techscope-selected-project-id";

export default function DashboardPage() {

  const {
    selectedProjectId,
    setSelectedProjectId,
    dashboard,
    tasks,
    loading: dashboardLoading,
    error: dashboardError,
    refreshDashboard,
  } = useDashboard();

  const [projects, setProjects] = 
    useState<Project[]>([]);
  const [showRenameProjectModal, setShowRenameProjectModal] = 
    useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = 
    useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] =
    useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] =
    useState(false);
  const [showRecentTasksModal, setShowRecentTasksModal] =
    useState(false);

  const selectedProject =
    projects.find(
      (project) =>
        project.id === selectedProjectId
    ) ?? null;

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [taskPendingDeletion, setTaskPendingDeletion] = 
    useState<Task | null>(null);

  const [viewTask, setViewTask] =
    useState<Task | null>(null);

  const [taskActivities, setTaskActivities] =
    useState<TaskActivity[]>([]);

  const [commentPendingDeletion, setCommentPendingDeletion] = 
    useState<TaskComment | null>(null);

  const [taskComments, setTaskComments] =
    useState<TaskComment[]>([]);

  const [taskAttachments, setTaskAttachments] =
    useState<TaskAttachment[]>([]);

  const [selectedAttachmentFile, setSelectedAttachmentFile] = 
    useState<File | null>(null);

  const [uploadingAttachment, setUploadingAttachment] =
    useState(false);

  const [deletingAttachmentId, setDeletingAttachmentId] = 
    useState<number | null>(null);

  const [attachmentToDelete, setAttachmentToDelete] =
    useState<number | null>(null);

  const attachmentInputRef =
    useRef<HTMLInputElement | null>(null);

  const [attachmentError, setAttachmentError] =
    useState("");

  const [newComment, setNewComment] =
    useState("");

  const [editingCommentId, setEditingCommentId] =
    useState<number | null>(null);

  const [deletingCommentId, setDeletingCommentId] =
    useState<number | null>(null);

  const [editingCommentContent, setEditingCommentContent] = 
    useState("");

  const [isPostingComment, setIsPostingComment] =
    useState(false);

  const [isSavingComment, setIsSavingComment] =
    useState(false);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editPriority, setEditPriority] =
    useState<TaskPriority>("medium");

  const [editDueDate, setEditDueDate] =
    useState("");

  const [editLabels, setEditLabels] =
    useState<string[]>([]);

  const [isSavingTask, setIsSavingTask] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [initialError, setInitialError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const taskListRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  async function loadInitialData() {
    try {
      const [userProjects, user] =
        await Promise.all([
          getProjects(),
          getCurrentUser(),
        ]);

      setProjects(userProjects);
      setCurrentUser(user);

      if (userProjects.length > 0) {
        const storedProjectId = Number(
          localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
        );

        const storedProjectStillExists = userProjects.some(
          (project) => project.id === storedProjectId
        );

        setSelectedProjectId(
          storedProjectStillExists
            ? storedProjectId
            : userProjects[0].id
        );
      } else {
        setSelectedProjectId(null);
        localStorage.removeItem(
          SELECTED_PROJECT_STORAGE_KEY
        );
      }
    } catch (err) {
      setInitialError(
        err instanceof Error
          ? err.message
          : "Failed to load initial data"
      );
    } finally {
      setInitialLoading(false);
    }
  }

  loadInitialData();
}, [setSelectedProjectId]);

      useEffect(() => {
        if (selectedProjectId === null) {
          return;
        }

        localStorage.setItem(
          SELECTED_PROJECT_STORAGE_KEY,
          String(selectedProjectId)
        );
      }, [selectedProjectId]);


  async function handleTaskStatusChange(taskId: number, status: TaskStatus) {
    if (!selectedProjectId) return;

    setActionError("");

    try {
      await updateTask(selectedProjectId, taskId, { status });
      await refreshDashboard();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update task status");
    }
  }

    async function handleDetailStatusChange(task: Task, status: TaskStatus) {
    if (!selectedProjectId) return;

    setActionError("");

    try {
      await updateTask(selectedProjectId, task.id, { status });
       await refreshDashboard();
      setViewTask(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update task status");
    }
  }

function handleRequestDeleteTask(task: Task) {
  setTaskPendingDeletion(task);
}

function resetTaskDetailsUiState() {
  setNewComment("");
  setEditingCommentId(null);
  setEditingCommentContent("");
  setCommentPendingDeletion(null);

  setSelectedAttachmentFile(null);
  setAttachmentError("");
  setAttachmentToDelete(null);

  if (attachmentInputRef.current) {
    attachmentInputRef.current.value = "";
  }
}

async function handleViewTask(task: Task) {
  if (!selectedProjectId) return;

  setActionError("");
  resetTaskDetailsUiState();

  try {
    const [activities, comments, attachments] =
      await Promise.all([
        getTaskActivities(selectedProjectId, task.id),
        getTaskComments(selectedProjectId, task.id),
        getTaskAttachments(selectedProjectId, task.id),
      ]);

    setTaskActivities(activities);
    setTaskComments(comments);
    setTaskAttachments(attachments);

    setViewTask(task);
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to load task details"
    );
  }
}

async function handleCreateComment() {
  if (
    !selectedProjectId ||
    !viewTask ||
    !newComment.trim() ||
    isPostingComment
  ) {
    return;
  }

  setActionError("");

  try {
    setIsPostingComment(true);

    const comment = await createTaskComment(
      selectedProjectId,
      viewTask.id,
      {
        content: newComment,
      }
    );

    setTaskComments((previousComments) => [
      ...previousComments,
      comment,
    ]);

    const activities = await getTaskActivities(
      selectedProjectId,
      viewTask.id
    );

    setTaskActivities(activities);
    setNewComment("");
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to create comment"
    );
  } finally {
    setIsPostingComment(false);
  }
}

  function handleOpenEditTask(task: Task) {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditPriority(task.priority ?? "medium");
    setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
    setEditLabels(task.labels ?? []);
  }

  async function handleSaveEditTask(e: React.FormEvent) {
  e.preventDefault();

  if (!selectedProjectId || !selectedTask || isSavingTask) {
    return;
  }

  setActionError("");
  setIsSavingTask(true);

  try {
    await updateTask(selectedProjectId, selectedTask.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      due_date: editDueDate
        ? new Date(editDueDate).toISOString()
        : null,
      labels: editLabels,
    });

    await refreshDashboard();
    setSelectedTask(null);
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to update task"
    );
  } finally {
    setIsSavingTask(false);
  }
}

  function handleStartEditComment(comment: TaskComment) {
  setEditingCommentId(comment.id);
  setEditingCommentContent(comment.content);
}

function handleCancelEditComment() {
  setEditingCommentId(null);
  setEditingCommentContent("");
}

async function handleSaveComment(commentId: number) {
  if (
    !selectedProjectId ||
    !viewTask ||
    !editingCommentContent.trim() ||
    isSavingComment
  ) {
    return;
  }

  setActionError("");

  try {
    setIsSavingComment(true);

    const updatedComment = await updateTaskComment(
      selectedProjectId,
      viewTask.id,
      commentId,
      editingCommentContent.trim()
    );

    setTaskComments((previousComments) =>
      previousComments.map((comment) =>
        comment.id === commentId
          ? updatedComment
          : comment
      )
    );

    const activities = await getTaskActivities(
      selectedProjectId,
      viewTask.id
    );

    setTaskActivities(activities);

    handleCancelEditComment();
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to update comment"
    );
  } finally {
    setIsSavingComment(false);
  }
}

async function handleDeleteComment(commentId: number) {
  if (
    !selectedProjectId ||
    !viewTask ||
    deletingCommentId !== null
  ) {
    return;
  }

  setActionError("");

  try {
    setDeletingCommentId(commentId);

    await deleteTaskComment(
      selectedProjectId,
      viewTask.id,
      commentId
    );

    const comments = await getTaskComments(
      selectedProjectId,
      viewTask.id
    );

    setTaskComments(comments);

    const activities = await getTaskActivities(
      selectedProjectId,
      viewTask.id
    );

    setTaskActivities(activities);
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to delete comment"
    );
  } finally {
    setDeletingCommentId(null);
  }
}

async function handleUploadAttachment() {
  if (
    !selectedProjectId ||
    !viewTask ||
    !selectedAttachmentFile
  ) {
    return;
  }

  try {
    setUploadingAttachment(true);
    setAttachmentError("");

    const attachment = await uploadTaskAttachment(
      selectedProjectId,
      viewTask.id,
      selectedAttachmentFile
    );

    setTaskAttachments((previousAttachments) => [
      attachment,
      ...previousAttachments,
    ]);

    const activities = await getTaskActivities(
      selectedProjectId,
      viewTask.id
    );

    setTaskActivities(activities);
    setSelectedAttachmentFile(null);

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  } catch (err) {
    setAttachmentError(
      err instanceof Error
        ? err.message
        : "Failed to upload attachment"
    );
  } finally {
    setUploadingAttachment(false);
  }
}

async function handleDownloadAttachment(
  attachment: TaskAttachment
) {
  if (!selectedProjectId || !viewTask) return;

  setActionError("");

  try {
    await downloadTaskAttachment(
      selectedProjectId,
      viewTask.id,
      attachment.id,
      attachment.original_filename
    );
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to download attachment"
    );
  }
}

async function handleDeleteAttachment(
  attachmentId: number
) {
  if (
    !selectedProjectId ||
    !viewTask ||
    deletingAttachmentId !== null
  ) {
    return;
  }

  setActionError("");

  try {
    setDeletingAttachmentId(attachmentId);

    await deleteTaskAttachment(
      selectedProjectId,
      viewTask.id,
      attachmentId
    );

    const attachments = await getTaskAttachments(
      selectedProjectId,
      viewTask.id
    );

    setTaskAttachments(attachments);

    const activities = await getTaskActivities(
      selectedProjectId,
      viewTask.id
    );

    setTaskActivities(activities);

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }

    setSelectedAttachmentFile(null);
    setAttachmentToDelete(null);
  } catch (err) {
    setActionError(
      err instanceof Error
        ? err.message
        : "Failed to delete attachment"
    );
  } finally {
    setDeletingAttachmentId(null);
  }
}

  function scrollToTasks() {
    taskListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

 if (initialLoading || dashboardLoading) {
  return (
    <div className="dashboard-page">
      <Navbar selectedProjectId={null} />

      <LoadingSpinner
        size="large"
        message="Loading your dashboard..."
      />
    </div>
  );
}

const pageError = initialError || dashboardError;

if (pageError) {
  return (
    <div className="dashboard-page">
      <Navbar selectedProjectId={null} />
      <h2>Error: {pageError}</h2>
    </div>
  );
}

if (projects.length === 0) {
  return (
    <div className="dashboard-container">
      <DashboardHeader selectedProjectId={null} />

      <div className="empty-project-state">
        <p>
          No projects yet. Create your first project to get started.
        </p>

        <CreateProjectForm
          onProjectCreated={(project) => {
            setProjects([project]);
            setSelectedProjectId(project.id);
          }}
        />
      </div>
    </div>
  );
}

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <Navbar selectedProjectId={null} />
        <h2>No dashboard data found.</h2>
      </div>
    );
  }

  const completionPercentage =
    dashboard.total_tasks === 0
      ? 0
      : Math.round((dashboard.completed_tasks / dashboard.total_tasks) * 100);
  
  const todoPercentage =
  dashboard.total_tasks === 0
    ? 0
    : Math.round((dashboard.todo_tasks / dashboard.total_tasks) * 100);

  const inProgressPercentage =
    dashboard.total_tasks === 0
      ? 0
      : Math.round(
          (dashboard.in_progress_tasks / dashboard.total_tasks) * 100
        );

  const completedPercentage =
    dashboard.total_tasks === 0
      ? 0
      : Math.round(
          (dashboard.completed_tasks / dashboard.total_tasks) * 100
        );
    const highPriorityCount = tasks.filter(
    (task) => task.priority === "high"
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today && task.status !== "completed";
  });

  const dueTodayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    if (task.status === "completed") return false;

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === today.getTime();
  });

  const dueSoonTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    if (task.status === "completed") return false;

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const diffInMs = dueDate.getTime() - today.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays > 0 && diffInDays <= 3;
  });

   const dashboardInsights: string[] = [];

if (dashboard.total_tasks === 0) {
  dashboardInsights.push(
    "No tasks yet. Create your first task to get started."
  );
} else {
  if (highPriorityCount >= 3) {
    dashboardInsights.push(
      "High-priority workload is high."
    );
  }

  if (overdueTasks.length > 0) {
    dashboardInsights.push(
      overdueTasks.length === 1
        ? "1 overdue task needs attention."
        : `${overdueTasks.length} overdue tasks need attention.`
    );
  }

  if (
    dashboard.todo_tasks >
    dashboard.total_tasks / 2
  ) {
    dashboardInsights.push(
      "Most tasks are still in Todo status."
    );
  }

  if (dashboardInsights.length === 0) {
    dashboardInsights.push(
      "Project is progressing smoothly."
    );
  }
}

  const hasEditTaskChanges =
    selectedTask !== null &&
    (
      editTitle.trim() !== selectedTask.title.trim() ||
      editDescription.trim() !==
        (selectedTask.description ?? "").trim() ||
      editPriority !== selectedTask.priority ||
      editDueDate !==
        (selectedTask.due_date
          ? selectedTask.due_date.slice(0, 10)
          : "") ||
      JSON.stringify([...editLabels].sort()) !==
        JSON.stringify([...(selectedTask.labels ?? [])].sort())
    );

  return (
     
     <div className="dashboard-container">

     <DashboardHeader
      selectedProjectId={selectedProjectId}
     />

     <ProjectManagement
        projects={projects}
        selectedProjectId={selectedProjectId}
        hasSelectedProject={selectedProject !== null}
        onProjectChange={setSelectedProjectId}
        onCreateProject={() =>
          setShowCreateProjectModal(true)
        }
        onRenameProject={() =>
          setShowRenameProjectModal(true)
        }
        onDeleteProject={() =>
          setShowDeleteProjectModal(true)
        }
      />

     <DashboardQuickActions
        onCreateTask={() =>
          setShowCreateTaskModal(true)
        }
        onViewTasks={scrollToTasks}
        onRecentTasks={() =>
          setShowRecentTasksModal(true)
        }
      />

      {actionError && (
        <div
          className="dashboard-action-error"
          role="alert"
        >
          <span>{actionError}</span>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setActionError("")}
          >
            ×
          </button>
        </div>
      )}

      {overdueTasks.length > 0 && (
        <section className="deadline-warning-banner">
          <span>⚠️</span>

          <div>
            <h3>
              {overdueTasks.length === 1
                ? "1 overdue task requires your attention"
                : `${overdueTasks.length} overdue tasks require your attention`}
            </h3>
            <p>Review delayed tasks and update their status or due dates.</p>
          </div>
        </section>
      )}

      <DashboardStats
        totalTasks={dashboard.total_tasks}
        highPriorityTasks={dashboard.high_priority_tasks}
        todoTasks={dashboard.todo_tasks}
        completedTasks={dashboard.completed_tasks}
        overdueTasks={overdueTasks.length}
        dueTodayTasks={dueTodayTasks.length}
        dueSoonTasks={dueSoonTasks.length}
      />

      <ProjectProgress
        completionPercentage={completionPercentage}
        completedTasks={dashboard.completed_tasks}
        totalTasks={dashboard.total_tasks}
      />

      <TaskBreakdown
        todoPercentage={todoPercentage}
        inProgressPercentage={inProgressPercentage}
        completedPercentage={completedPercentage}
        todoTasks={dashboard.todo_tasks}
        inProgressTasks={dashboard.in_progress_tasks}
        completedTasks={dashboard.completed_tasks}
      />

      <DashboardInsights
        insights={dashboardInsights}
      />

      <UpcomingDeadlines 
        tasks={tasks} 
      />

      {showCreateProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              type="button"
              className="modal-close"
              aria-label="Close create project modal"
              onClick={() => setShowCreateProjectModal(false)}
            >
              ×
            </button>

            <CreateProjectForm
              onProjectCreated={(newProject) => {
                setProjects((currentProjects) => [
                  ...currentProjects,
                  newProject,
                ]);
                setSelectedProjectId(newProject.id);
                setShowCreateProjectModal(false);
              }}
            />
          </div>
        </div>
      )}

      {showRenameProjectModal && selectedProject && (
        <RenameProjectModal
          key={selectedProject.id}
          project={selectedProject}
          onClose={() =>
            setShowRenameProjectModal(false)
          }
          onProjectRenamed={(updatedProject) => {
            setProjects((currentProjects) =>
              currentProjects.map((project) =>
                project.id === updatedProject.id
                  ? updatedProject
                  : project
              )
            );

            setShowRenameProjectModal(false);
          }}
        />
      )}

      {showDeleteProjectModal && selectedProject && (
          <DeleteProjectModal
            project={selectedProject}
            onClose={() =>
              setShowDeleteProjectModal(false)
            }
            onProjectDeleted={(projectId) => {
              const deletedProjectIndex =
                projects.findIndex(
                  (project) =>
                    project.id === projectId
                );

              const remainingProjects =
                projects.filter(
                  (project) =>
                    project.id !== projectId
                );

              setProjects(remainingProjects);

              if (remainingProjects.length === 0) {
                setSelectedProjectId(null);

                localStorage.removeItem(
                  SELECTED_PROJECT_STORAGE_KEY
                );

                setShowDeleteProjectModal(false);

                return;
              }

              const nextProject =
                remainingProjects[
                  Math.min(
                    deletedProjectIndex,
                    remainingProjects.length - 1
                  )
                ];

              setSelectedProjectId(nextProject.id);

              setShowDeleteProjectModal(false);
            }}
          />
        )}


      {taskPendingDeletion && selectedProjectId && (
          <DeleteTaskModal
            projectId={selectedProjectId}
            task={taskPendingDeletion}
            onClose={() =>
              setTaskPendingDeletion(null)
            }
            onTaskDeleted={async () => {
              setTaskPendingDeletion(null);
              await refreshDashboard();
            }}
          />
        )}

      {showCreateTaskModal && selectedProjectId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setShowCreateTaskModal(false)}
            >
              ×
            </button>

           <CreateTaskForm
              projectId={selectedProjectId}
              onTaskCreated={() => {
                setShowCreateTaskModal(false);
              }}
            />
          </div>
        </div>
      )}

      {showRecentTasksModal && (
        <div className="modal-overlay">
          <div className="modal-content recent-tasks-modal">
            <button
              className="modal-close"
              onClick={() => setShowRecentTasksModal(false)}
            >
              ×
            </button>

            <h2>Recent Tasks</h2>
            <p className="recent-tasks-modal-subtitle">
              Your latest tasks at a glance
            </p>

            <RecentTasks
              tasks={dashboard.recent_tasks}
              defaultOpen={true}
              hideHeader={true}
            />
          </div>
        </div>
      )}

    {viewTask && (

      <TaskDetailsModal
        key={viewTask.id}
        task={viewTask}
        activities={taskActivities}
        comments={taskComments}
        attachments={taskAttachments}

        currentUserId={currentUser?.id ?? null}

        newComment={newComment}
        editingCommentId={editingCommentId}
        editingCommentContent={
          editingCommentContent
        }
        deletingCommentId={deletingCommentId}
        commentPendingDeletion={
          commentPendingDeletion
        }
        isPostingComment={isPostingComment}
        isSavingComment={isSavingComment}

        selectedAttachmentFile={
          selectedAttachmentFile
        }
        uploadingAttachment={
          uploadingAttachment
        }
        deletingAttachmentId={
          deletingAttachmentId
        }
        attachmentToDelete={
          attachmentToDelete
        }
        attachmentError={attachmentError}
        attachmentInputRef={
          attachmentInputRef
        }

        onClose={() => {
          resetTaskDetailsUiState();
          setViewTask(null);
        }}

        onEditTask={handleOpenEditTask}

        onStatusChange={
          handleDetailStatusChange
        }

        onNewCommentChange={setNewComment}
        onCreateComment={handleCreateComment}

        onStartEditComment={
          handleStartEditComment
        }
        onCancelEditComment={
          handleCancelEditComment
        }
        onEditingCommentContentChange={
          setEditingCommentContent
        }
        onSaveComment={handleSaveComment}

        onRequestDeleteComment={
          setCommentPendingDeletion
        }
        onCancelDeleteComment={() =>
          setCommentPendingDeletion(null)
        }
        onDeleteComment={handleDeleteComment}

        onAttachmentFileChange={
          setSelectedAttachmentFile
        }
        onClearAttachmentError={() =>
          setAttachmentError("")
        }
        onUploadAttachment={
          handleUploadAttachment
        }
        onDownloadAttachment={
          handleDownloadAttachment
        }
        onRequestDeleteAttachment={
          setAttachmentToDelete
        }
        onCancelDeleteAttachment={() =>
          setAttachmentToDelete(null)
        }
        onDeleteAttachment={
          handleDeleteAttachment
        }
      />
    )}

    {selectedTask && (
      <EditTaskModal
        title={editTitle}
        description={editDescription}
        priority={editPriority}
        dueDate={editDueDate}
        labels={editLabels}
        isSaving={isSavingTask}
        hasChanges={hasEditTaskChanges}
        onTitleChange={setEditTitle}
        onDescriptionChange={
          setEditDescription
        }
        onPriorityChange={setEditPriority}
        onDueDateChange={setEditDueDate}
        onLabelsChange={setEditLabels}
        onSubmit={handleSaveEditTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />
    )}
    
      <TasksSection
        tasks={tasks}
        taskListRef={taskListRef}
        onStatusChange={handleTaskStatusChange}
        onDeleteTask={handleRequestDeleteTask}
        onEditTask={handleOpenEditTask}
        onViewTask={handleViewTask}
      />

    </div>
  );
}