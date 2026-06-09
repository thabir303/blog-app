from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User, UserRole
from app.schemas.comment import CommentCreate, CommentUpdate


def get_comment_by_id(db: Session, comment_id: int) -> Optional[Comment]:
    return db.query(Comment).filter(Comment.id == comment_id).first()


def get_comments_by_post(db: Session, post_id: int) -> List[Comment]:
    return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at).all()


def create_comment(db: Session, post: Post, comment_data: CommentCreate, owner: User) -> Comment:
    if owner.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot post comments")

    db_comment = Comment(content=comment_data.content, post_id=post.id, owner_id=owner.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def update_comment(db: Session, comment: Comment, comment_data: CommentUpdate, current_user: User) -> Comment:
    if current_user.role != UserRole.SUPER_ADMIN and comment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only update your own comments")

    if comment_data.content is not None:
        comment.content = comment_data.content

    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment: Comment, post: Post, current_user: User) -> None:
    is_super_admin = current_user.role == UserRole.SUPER_ADMIN
    is_moderator = current_user.role == UserRole.MODERATOR
    is_post_owner = post.owner_id == current_user.id
    is_comment_owner = comment.owner_id == current_user.id

    if not (is_super_admin or is_moderator or is_post_owner or is_comment_owner):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
