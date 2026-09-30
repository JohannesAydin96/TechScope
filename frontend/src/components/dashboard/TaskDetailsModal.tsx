/**
 * Task details modal for TechScope.
 *
 * Displays task information, insights, activity history, comments,
 * attachments, and actions for managing the selected task.
 */

import { useState } from "react";
import type { RefObject } from "react";

import type { Task } from "../../services/taskService";
import type { TaskStatus } from "../../types/dashboard";

import type { TaskActivity } from "../../services/taskActivityService";
import type { TaskComment } from "../../services/taskCommentService";
import type { TaskAttachment } from "../../services/taskAttachmentService";

type Props = {
  task: Task;
  activities: TaskActivity[];
  comments: TaskComment[];
  attachments: TaskAttachment[];

  currentUserId: number | null;

  newComment: string;
  editingCommentId: number | null;
  editingCommentContent: string;
  deletingCommentId: number | null;
  commentPendingDeletion: TaskComment | null;
  isPostingComment: boolean;
  isSavingComment: boolean;

  selectedAttachmentFile: File | null;
  uploadingAttachment: boolean;
  deletingAttachmentId: number | null;
  attachmentToDelete: number | null;
  attachmentError: string;
  attachmentInputRef: RefObject<HTMLInputElement | null>;

  onClose: () => void;
  onEditTask: (task: Task) => void;

  onStatusChange: (
    task: Task,
    status: TaskStatus
  ) => void | Promise<void>;

  onNewCommentChange: (content: string) => void;
  onCreateComment: () => void | Promise<void>;
  onStartEditComment: (
    comment: TaskComment
  ) => void;
  onCancelEditComment: () => void;
  onEditingCommentContentChange: (
    content: string
  ) => void;
  onSaveComment: (
    commentId: number
  ) => void | Promise<void>;

  onRequestDeleteComment: (
    comment: TaskComment
  ) => void;
  onCancelDeleteComment: () => void;
  onDeleteComment: (
    commentId: number
  ) => void | Promise<void>;

  onAttachmentFileChange: (
    file: File | null
  ) => void;
  onClearAttachmentError: () => void;
  onUploadAttachment: () => void | Promise<void>;
  onDownloadAttachment: (
    attachment: TaskAttachment
  ) => void | Promise<void>;
  onRequestDeleteAttachment: (
    attachmentId: number
  ) => void;
  onCancelDeleteAttachment: () => void;
  onDeleteAttachment: (
    attachmentId: number
  ) => void | Promise<void>;
};

function formatActivityField(
  field?: string | null
) {
  switch (field) {
    case "status":
      return "Status";

    case "priority":
      return "Priority";

    case "due_date":
      return "Due Date";

    case "title":
      return "Title";

    case "description":
      return "Description";

    case "labels":
      return "Labels";

    default:
      return field ?? "";
  }
}

function formatActivityValue(
  field: string | null | undefined,
  value: string | null | undefined
) {
  if (!value) {
    return "Empty";
  }

  if (field === "status") {
    switch (value) {
      case "todo":
        return "Todo";

      case "in_progress":
        return "In Progress";

      case "completed":
        return "Completed";

      default:
        return value;
    }
  }

  if (field === "priority") {
    switch (value) {
      case "low":
        return "Low";

      case "medium":
        return "Medium";

      case "high":
        return "High";

      default:
        return value;
    }
  }

  if (field === "due_date") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return value;
}

function formatActivityDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

function getAttachmentIcon(
  contentType?: string | null
): string {
  switch (contentType) {
    case "application/pdf":
      return "📄";

    case "image/png":
    case "image/jpeg":
    case "image/webp":
      return "🖼️";

    case "text/plain":
    case "text/csv":
      return "📝";

    case "application/json":
      return "🧩";

    case "application/zip":
      return "📦";

    default:
      return "📎";
  }
}

function getDeadlineStatus(dueDate: string) {
  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffInMs =
    due.getTime() - today.getTime();

  const diffInDays =
    diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 0) {
    return "Overdue";
  }

  if (diffInDays === 0) {
    return "Due Today";
  }

  if (diffInDays <= 3) {
    return "Due Soon";
  }

  return "Future";
}

function getTaskInsights(task: Task): string[] {
  const insights: string[] = [];

  if (task.status === "completed") {
    insights.push(
      "✅ This task has been completed."
    );
  }

  if (task.priority === "high") {
    insights.push(
      "⚠ This is a high-priority task."
    );
  } else if (task.priority === "low") {
    insights.push(
      "💡 This is a low-priority task."
    );
  }

  if (task.due_date) {
    const today = new Date();
    const due = new Date(task.due_date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (due.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (task.status !== "completed") {
      if (diffDays < 0) {
        const overdueDays =
          Math.abs(diffDays);

        insights.push(
          `🔴 This task is overdue by ${overdueDays} day${
            overdueDays !== 1 ? "s" : ""
          }.`
        );
      } else if (diffDays === 0) {
        insights.push(
          "🟠 This task is due today."
        );
      } else if (diffDays <= 3) {
        insights.push(
          `🟡 This task is due in ${diffDays} day${
            diffDays !== 1 ? "s" : ""
          }.`
        );
      }
    }
  }

  if (insights.length === 0) {
    insights.push(
      "ℹ No special insights for this task."
    );
  }

  return insights;
}

const ACTIVITY_BATCH_SIZE = 10;

export default function TaskDetailsModal({
  task,
  activities,
  comments,
  attachments,

  currentUserId,

  newComment,
  editingCommentId,
  editingCommentContent,
  deletingCommentId,
  commentPendingDeletion,
  isPostingComment,
  isSavingComment,

  selectedAttachmentFile,
  uploadingAttachment,
  deletingAttachmentId,
  attachmentToDelete,
  attachmentError,
  attachmentInputRef,

  onClose,
  onEditTask,
  onStatusChange,

  onNewCommentChange,
  onCreateComment,
  onStartEditComment,
  onCancelEditComment,
  onEditingCommentContentChange,
  onSaveComment,

  onRequestDeleteComment,
  onCancelDeleteComment,
  onDeleteComment,

  onAttachmentFileChange,
  onClearAttachmentError,
  onUploadAttachment,
  onDownloadAttachment,
  onRequestDeleteAttachment,
  onCancelDeleteAttachment,
  onDeleteAttachment,
}: Props) {
  const [visibleActivityCount, setVisibleActivityCount] =
    useState(ACTIVITY_BATCH_SIZE);

  const visibleActivities = activities.slice(
    0,
    visibleActivityCount
  );

  const hasMoreActivities =
    visibleActivityCount < activities.length;

  const hasExpandedActivities =
    visibleActivityCount > ACTIVITY_BATCH_SIZE;

  return (
    <div className="modal-overlay">
      <div className="modal-content task-details-modal">
        <button
          type="button"
          className="modal-close"
          aria-label="Close task details"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Task Details</h2>

        <div className="task-details-content">
          <div className="task-detail-title">
            <span>Title</span>
            <p>{task.title}</p>
          </div>

          <div className="task-details-grid">
            <div className="task-detail-row task-detail-description">
              <span>Description</span>
              <p title={task.description || "No description"}>
                {task.description || "No description"}
              </p>
            </div>

            <div className="task-detail-row">
              <span>Status</span>
              <p>
                {task.status === "todo"
                  ? "Todo"
                  : task.status === "in_progress"
                  ? "In Progress"
                  : task.status === "completed"
                  ? "Completed"
                  : task.status}
              </p>
            </div>

            <div className="task-detail-row">
              <span>Priority</span>
              <p>
                {task.priority === "low"
                  ? "Low"
                  : task.priority === "medium"
                  ? "Medium"
                  : task.priority === "high"
                  ? "High"
                  : task.priority}
              </p>
            </div>

            <div className="task-detail-row">
              <span>Due Date</span>
              <p>
                {task.due_date
                  ? task.due_date.split("T")[0]
                  : "No due date"}
              </p>
            </div>

            <div className="task-detail-row">
              <span>Due Status</span>
              <p>
                {task.due_date
                  ? getDeadlineStatus(task.due_date)
                  : "No due status"}
              </p>
            </div>

            <div className="task-detail-row">
              <span>Task ID</span>
              <p>#{task.id}</p>
            </div>
          </div>
        </div>
        
        <div className="task-insights">
          <h3>Task Insights</h3>

          {getTaskInsights(task).map(
            (insight, index) => (
              <div
                key={index}
                className="task-insight-item"
              >
                {insight}
              </div>
            )
          )}
        </div>

        <div className="task-activity-log">
          <h3>Activity Log</h3>

          {activities.length === 0 ? (
            <p className="task-activity-empty">
              No activity recorded for this
              task.
            </p>
          ) : (
            <>
              <div className="task-activity-list">
              {visibleActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="task-activity-item"
                >
                  <p>
                    <strong>
                      {activity.action ===
                      "task_created"
                        ? "🟢 Task Created"
                        : activity.action ===
                          "comment_added"
                        ? "💬 Comment Added"
                        : activity.action ===
                          "comment_updated"
                        ? "✏️ Comment Updated"
                        : activity.action ===
                          "comment_deleted"
                        ? "🗑️ Comment Deleted"
                        : activity.action ===
                          "attachment_added"
                        ? "📎 Attachment Added"
                        : activity.action ===
                          "attachment_deleted"
                        ? "🗑 Attachment Deleted"
                        : `🔄 ${formatActivityField(
                            activity.field_name
                          )} Updated`}
                    </strong>
                  </p>

                  {activity.action ===
                    "attachment_added" && (
                    <p>
                      {activity.new_value}
                    </p>
                  )}

                  {activity.action ===
                    "attachment_deleted" && (
                    <p>
                      {activity.old_value}
                    </p>
                  )}

                  {activity.field_name &&
                    activity.action !==
                      "attachment_added" &&
                    activity.action !==
                      "attachment_deleted" && (
                      <p>
                        {formatActivityValue(
                          activity.field_name,
                          activity.old_value
                        )}
                        {" → "}
                        {formatActivityValue(
                          activity.field_name,
                          activity.new_value
                        )}
                      </p>
                    )}

                  <span>
                    {formatActivityDate(
                      activity.created_at
                    )}
                  </span>
                </div>
              ))}
              </div>

              {(hasMoreActivities ||
                hasExpandedActivities) && (
                <div className="task-activity-pagination">
                  {hasMoreActivities && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleActivityCount(
                          (currentCount) =>
                            Math.min(
                              currentCount +
                                ACTIVITY_BATCH_SIZE,
                              activities.length
                            )
                        )
                      }
                    >
                      Show more
                    </button>
                  )}

                  {hasExpandedActivities && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleActivityCount(
                          ACTIVITY_BATCH_SIZE
                        )
                      }
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="task-comments">
          <h3>Comments</h3>

          <div className="task-comment-form">
            <textarea
              value={newComment}
              onChange={(event) =>
                onNewCommentChange(
                  event.target.value
                )
              }
              placeholder="Write a comment..."
              rows={3}
              disabled={isPostingComment}
            />

            <button
              type="button"
              onClick={onCreateComment}
              disabled={
                !newComment.trim() ||
                isPostingComment
              }
            >
              {isPostingComment
                ? "Posting..."
                : "Add Comment"}
            </button>
          </div>

          {comments.length === 0 ? (
            <p className="task-comments-empty">
              No comments yet.
            </p>
          ) : (
            <div className="task-comments-list">
              {comments.map((comment) => {
                const isEditing =
                  editingCommentId ===
                  comment.id;

                const isDeleting =
                  deletingCommentId ===
                  comment.id;

                const isOwnComment =
                  currentUserId ===
                  comment.user_id;

                const wasEdited =
                  new Date(
                    comment.updated_at
                  ).getTime() >
                  new Date(
                    comment.created_at
                  ).getTime() +
                    1000;

                return (
                  <div
                    key={comment.id}
                    className="task-comment-item"
                  >
                    <div className="task-comment-header">
                      <div>
                        <strong>
                          {comment.username}
                        </strong>

                        <div className="task-comment-date">
                          {formatActivityDate(
                            comment.created_at
                          )}

                          {wasEdited && (
                            <span className="task-comment-edited">
                              {" "}
                              · Edited
                            </span>
                          )}
                        </div>
                      </div>

                      {isOwnComment &&
                        !isEditing && (
                          <div className="task-comment-actions">
                            <button
                              type="button"
                              className="task-comment-edit"
                              onClick={() =>
                                onStartEditComment(
                                  comment
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              ✏ Edit
                            </button>

                            <button
                              type="button"
                              className="task-comment-delete"
                              onClick={() =>
                                onRequestDeleteComment(
                                  comment
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "🗑 Delete"}
                            </button>
                          </div>
                        )}
                    </div>

                    {isEditing ? (
                      <div className="task-comment-edit-form">
                        <textarea
                          value={
                            editingCommentContent
                          }
                          onChange={(event) =>
                            onEditingCommentContentChange(
                              event.target.value
                            )
                          }
                          rows={3}
                          disabled={
                            isSavingComment ||
                            isDeleting
                          }
                        />

                        <div className="task-comment-edit-actions">
                          <button
                            type="button"
                            onClick={() =>
                              onSaveComment(
                                comment.id
                              )
                            }
                            disabled={
                              !editingCommentContent.trim() ||
                              isSavingComment ||
                              isDeleting
                            }
                          >
                            {isSavingComment
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={
                              onCancelEditComment
                            }
                            disabled={
                              isSavingComment ||
                              isDeleting
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {commentPendingDeletion && (
          <div className="simple-confirm-overlay">
            <div
              className="simple-confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-comment-title"
            >
              <h3 id="delete-comment-title">
                Delete comment?
              </h3>

              <div className="simple-confirm-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={async () => {
                    await onDeleteComment(
                      commentPendingDeletion.id
                    );

                    onCancelDeleteComment();
                  }}
                  disabled={
                    deletingCommentId ===
                    commentPendingDeletion.id
                  }
                >
                  {deletingCommentId ===
                  commentPendingDeletion.id
                    ? "Deleting..."
                    : "Delete"}
                </button>

                <button
                  type="button"
                  onClick={
                    onCancelDeleteComment
                  }
                  disabled={
                    deletingCommentId ===
                    commentPendingDeletion.id
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="task-attachments">
          <h3>Attachments</h3>

          <div className="task-attachment-upload">
            <div className="attachment-file-picker">
              <input
                ref={attachmentInputRef}
                className="attachment-file-input"
                type="file"
                disabled={uploadingAttachment}
                onChange={(event) => {
                  onAttachmentFileChange(
                    event.target.files?.[0] ??
                      null
                  );

                  onClearAttachmentError();
                }}
              />

              <button
                type="button"
                className="attachment-file-trigger"
                onClick={() =>
                  attachmentInputRef.current?.click()
                }
                disabled={uploadingAttachment}
              >
                Choose file
              </button>

              <span
                className="attachment-file-name"
                title={
                  selectedAttachmentFile?.name ??
                  "No file selected"
                }
              >
                {selectedAttachmentFile?.name ??
                  "No file selected"}
              </span>

              {selectedAttachmentFile && (
                <button
                  type="button"
                  className="attachment-file-clear"
                  aria-label={`Clear selected file ${selectedAttachmentFile.name}`}
                  title="Clear selected file"
                  onClick={() => {
                    onAttachmentFileChange(null);
                    onClearAttachmentError();

                    if (
                      attachmentInputRef.current
                    ) {
                      attachmentInputRef.current.value =
                        "";
                    }
                  }}
                  disabled={uploadingAttachment}
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onUploadAttachment}
              disabled={
                !selectedAttachmentFile ||
                uploadingAttachment
              }
            >
              {uploadingAttachment
                ? "Uploading..."
                : "Upload"}
            </button>
          </div>

          {attachmentError && (
            <p className="task-attachment-error">
              {attachmentError}
            </p>
          )}

          {attachments.length === 0 ? (
            <p className="task-attachments-empty">
              No attachments yet.
            </p>
          ) : (
            <div className="task-attachments-list">
              {attachments.map(
                (attachment) => (
                  <div
                    key={attachment.id}
                    className="task-attachment-item"
                  >
                    <div className="task-attachment-info">
                      <strong>
                        {getAttachmentIcon(
                          attachment.content_type
                        )}{" "}
                        {
                          attachment.original_filename
                        }
                      </strong>

                      <span>
                        {formatFileSize(
                          attachment.file_size
                        )}
                        {" · "}
                        {formatActivityDate(
                          attachment.created_at
                        )}
                      </span>
                    </div>

                    <div className="task-attachment-actions">
                      <button
                        type="button"
                        onClick={() =>
                          onDownloadAttachment(
                            attachment
                          )
                        }
                      >
                        ⬇ Download
                      </button>

                      {currentUserId ===
                        attachment.user_id && (
                        <button
                          type="button"
                          disabled={
                            uploadingAttachment ||
                            deletingAttachmentId !==
                              null
                          }
                          onClick={() =>
                            onRequestDeleteAttachment(
                              attachment.id
                            )
                          }
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>

                    {attachmentToDelete ===
                      attachment.id && (
                      <div className="simple-confirm-overlay">
                        <div
                          className="simple-confirm-dialog"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby={`delete-attachment-title-${attachment.id}`}
                        >
                          <h3
                            id={`delete-attachment-title-${attachment.id}`}
                          >
                            Delete attachment?
                          </h3>

                          <div className="simple-confirm-actions">
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() =>
                                onDeleteAttachment(
                                  attachment.id
                                )
                              }
                              disabled={
                                deletingAttachmentId ===
                                attachment.id
                              }
                            >
                              {deletingAttachmentId ===
                              attachment.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                onCancelDeleteAttachment
                              }
                              disabled={
                                deletingAttachmentId ===
                                attachment.id
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="task-details-quick-actions">
          <h3>Quick Actions</h3>

          <div className="task-details-quick-actions-buttons">
            {task.status !== "completed" && (
              <button
                type="button"
                onClick={() =>
                  onStatusChange(
                    task,
                    "completed"
                  )
                }
              >
                ✓ Mark Completed
              </button>
            )}

            {task.status !==
              "in_progress" && (
              <button
                type="button"
                onClick={() =>
                  onStatusChange(
                    task,
                    "in_progress"
                  )
                }
              >
                ▶ Move to In Progress
              </button>
            )}

            {task.status !== "todo" && (
              <button
                type="button"
                onClick={() =>
                  onStatusChange(
                    task,
                    "todo"
                  )
                }
              >
                ↩ Move to Todo
              </button>
            )}
          </div>
        </div>

        <div className="task-details-actions">
          <button
            type="button"
            onClick={() => {
              onEditTask(task);
              onClose();
            }}
          >
            Edit Task
          </button>

          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}