"""
API routes for the TechScope backend.

Defines endpoints for authentication, users, projects, tasks, notes,
comments, attachments, dashboard data, activities, and notifications.

"""

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.dashboard import ProjectDashboardResponse
from app.schemas.note import NoteCreate, NoteResponse
from app.schemas.notification import (
    MarkAllNotificationsReadResponse,
    NotificationResponse,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.schemas.task_activity import TaskActivityResponse
from app.schemas.task_attachment import TaskAttachmentResponse
from app.schemas.task_comment import (
    TaskCommentCreate,
    TaskCommentResponse,
    TaskCommentUpdate,
)
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.services import note_service, project_service, user_service
from app.services.dashboard_service import get_project_dashboard
from app.services.notification_service import NotificationService
from app.services.task_activity_service import get_task_activities
from app.services.task_attachment_service import (
    create_task_attachment,
    delete_task_attachment,
    get_task_attachment,
    get_task_attachments,
)
from app.services.task_comment_service import (
    create_task_comment,
    delete_task_comment,
    get_comment_response,
    get_task_comments,
    update_task_comment,
)
from app.services.task_service import (
    create_task,
    delete_task,
    get_project_tasks,
    get_task_for_user,
    update_task,
)

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "TechScope backend is running",
    }


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = user_service.get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    return user_service.create_user(
        db,
        user,
    )


@router.post(
    "/login",
    response_model=Token,
)
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    authenticated_user = user_service.authenticate_user(
        db,
        user.email,
        user.password,
    )

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": authenticated_user.email},
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return user_service.create_user(
        db,
        user,
    )


@router.get(
    "/users",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
):
    return user_service.get_users(db)


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.create_project(
        db,
        project,
        current_user,
    )


@router.get(
    "/projects",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.get_projects_for_user(
        db,
        current_user,
    )


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = project_service.get_project_by_id_for_user(
        db,
        project_id,
        current_user,
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


@router.put(
    "/projects/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = project_service.update_project_for_user(
        db,
        project_id,
        project_update,
        current_user,
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


@router.delete(
    "/projects/{project_id}",
    response_model=MessageResponse,
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = project_service.delete_project_for_user(
        db,
        project_id,
        current_user,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return {
        "message": "Project deleted successfully",
    }


@router.post(
    "/projects/{project_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    project_id: int,
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = project_service.get_project_by_id_for_user(
        db,
        project_id,
        current_user,
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return note_service.create_note_for_project(
        db,
        project,
        note,
    )


@router.get(
    "/projects/{project_id}/notes",
    response_model=list[NoteResponse],
)
def get_notes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = project_service.get_project_by_id_for_user(
        db,
        project_id,
        current_user,
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return note_service.get_notes_for_project(
        db,
        project,
    )


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_task(
    project_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(
        db,
        project_id,
        task_data,
        current_user.id,
    )


@router.get(
    "/projects/{project_id}/tasks",
    response_model=list[TaskResponse],
)
def list_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_project_tasks(
        db,
        project_id,
        current_user.id,
    )


@router.get(
    "/projects/{project_id}/tasks/{task_id}/activities",
    response_model=list[TaskActivityResponse],
)
def list_task_activities(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_for_user(
        db,
        project_id,
        task_id,
        current_user.id,
    )

    return get_task_activities(
        db,
        task.id,
    )


@router.post(
    "/projects/{project_id}/tasks/{task_id}/comments",
    response_model=TaskCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_task_comment(
    project_id: int,
    task_id: int,
    comment_data: TaskCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = create_task_comment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        comment_data=comment_data,
        user_id=current_user.id,
    )

    return get_comment_response(comment)


@router.get(
    "/projects/{project_id}/tasks/{task_id}/comments",
    response_model=list[TaskCommentResponse],
)
def list_project_task_comments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comments = get_task_comments(
        db=db,
        project_id=project_id,
        task_id=task_id,
        user_id=current_user.id,
    )

    return [
        get_comment_response(comment)
        for comment in comments
    ]


@router.patch(
    "/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
    response_model=TaskCommentResponse,
)
def update_project_task_comment(
    project_id: int,
    task_id: int,
    comment_id: int,
    comment_data: TaskCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = update_task_comment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        comment_id=comment_id,
        comment_data=comment_data,
        user_id=current_user.id,
    )

    return get_comment_response(comment)


@router.delete(
    "/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
    response_model=MessageResponse,
)
def delete_project_task_comment(
    project_id: int,
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task_comment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        comment_id=comment_id,
        user_id=current_user.id,
    )

    return {
        "message": "Comment deleted successfully",
    }


@router.post(
    "/projects/{project_id}/tasks/{task_id}/attachments",
    response_model=TaskAttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_task_attachment(
    project_id: int,
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_task_attachment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        file=file,
        user_id=current_user.id,
    )


@router.get(
    "/projects/{project_id}/tasks/{task_id}/attachments",
    response_model=list[TaskAttachmentResponse],
)
def list_task_attachments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_task_attachments(
        db=db,
        project_id=project_id,
        task_id=task_id,
        user_id=current_user.id,
    )


@router.get(
    "/projects/{project_id}/tasks/{task_id}/attachments/"
    "{attachment_id}/download",
)
def download_task_attachment(
    project_id: int,
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attachment = get_task_attachment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        attachment_id=attachment_id,
        user_id=current_user.id,
    )

    return FileResponse(
        attachment.file_path,
        filename=attachment.original_filename,
        media_type=attachment.content_type,
    )


@router.delete(
    "/projects/{project_id}/tasks/{task_id}/attachments/"
    "{attachment_id}",
    response_model=MessageResponse,
)
def remove_task_attachment(
    project_id: int,
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task_attachment(
        db=db,
        project_id=project_id,
        task_id=task_id,
        attachment_id=attachment_id,
        user_id=current_user.id,
    )

    return {
        "message": "Attachment deleted successfully",
    }


@router.patch(
    "/projects/{project_id}/tasks/{task_id}",
    response_model=TaskResponse,
)
def update_project_task(
    project_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(
        db,
        project_id,
        task_id,
        task_data,
        current_user.id,
    )


@router.delete(
    "/projects/{project_id}/tasks/{task_id}",
    response_model=MessageResponse,
)
def delete_project_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task(
        db,
        project_id,
        task_id,
        current_user.id,
    )

    return {
        "message": "Task deleted successfully",
    }


@router.get(
    "/projects/{project_id}/dashboard",
    response_model=ProjectDashboardResponse,
)
def get_dashboard(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_project_dashboard(
        db,
        project_id,
        current_user.id,
    )


@router.get(
    "/projects/{project_id}/notifications",
    response_model=list[NotificationResponse],
)
def list_notifications(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService.get_notifications(
        db=db,
        user_id=current_user.id,
        project_id=project_id,
    )


@router.get(
    "/projects/{project_id}/notifications/unread",
    response_model=list[NotificationResponse],
)
def list_unread_notifications(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService.get_unread_notifications(
        db=db,
        user_id=current_user.id,
        project_id=project_id,
    )


@router.patch(
    "/projects/{project_id}/notifications/read-all",
    response_model=MarkAllNotificationsReadResponse,
)
def mark_all_notifications_as_read(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_count = NotificationService.mark_all_as_read(
        db=db,
        user_id=current_user.id,
        project_id=project_id,
    )

    return {
        "message": "All project notifications marked as read",
        "updated_count": updated_count,
    }


@router.patch(
    "/projects/{project_id}/notifications/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_as_read(
    project_id: int,
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = NotificationService.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
        project_id=project_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return notification


@router.delete(
    "/projects/{project_id}/notifications/{notification_id}",
    response_model=MessageResponse,
)
def remove_notification(
    project_id: int,
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = NotificationService.delete_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
        project_id=project_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return {
        "message": "Notification deleted successfully",
    }