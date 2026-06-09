from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.services.comment_service import (
    get_comments_by_post,
    get_comment_by_id,
    create_comment,
    update_comment,
    delete_comment,
)
from app.services.post_service import get_post_by_id
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    if not get_post_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    return get_comments_by_post(db, post_id)


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment_endpoint(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return create_comment(db, post, comment_data, current_user)


@router.put("/{post_id}/comments/{comment_id}", response_model=CommentResponse)
def update_comment_endpoint(
    post_id: int,
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = get_comment_by_id(db, comment_id)
    if not comment or comment.post_id != post_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    return update_comment(db, comment, comment_data, current_user)


@router.delete("/{post_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_endpoint(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = get_comment_by_id(db, comment_id)
    if not comment or comment.post_id != post_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    delete_comment(db, comment, post, current_user)
