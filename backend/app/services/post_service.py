import math

from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from app.models.post import Post
from app.models.user import User, UserRole
from app.schemas.post import PostCreate, PostUpdate


def get_post_by_id(db: Session, post_id: int) -> Optional[Post]:
    return db.query(Post).filter(Post.id == post_id).first()


def get_posts(db: Session, page: int = 1, limit: int = 10) -> tuple[List[Post], int, int]:
    query = db.query(Post)
    total = query.count()
    total_pages = max(1, math.ceil(total / limit))
    offset = (page - 1) * limit
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return posts, total, total_pages


def create_post(db: Session, post_data: PostCreate, owner: User) -> Post:
    if owner.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guests cannot create posts")

    db_post = Post(title=post_data.title, content=post_data.content, owner_id=owner.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def update_post(db: Session, post: Post, post_data: PostUpdate, current_user: User) -> Post:
    if current_user.role == UserRole.SUPER_ADMIN:
        pass
    elif current_user.role == UserRole.REGULAR_USER and post.owner_id == current_user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content

    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post: Post, current_user: User) -> None:
    if current_user.role in (UserRole.SUPER_ADMIN, UserRole.MODERATOR):
        pass
    elif current_user.role == UserRole.REGULAR_USER and post.owner_id == current_user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
