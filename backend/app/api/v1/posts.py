from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostListResponse
from app.services.post_service import get_posts, get_post_by_id, create_post, update_post, delete_post
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=PostListResponse)
def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    posts, total, total_pages = get_posts(db, page=page, limit=limit)
    return {
        "items": posts,
        "total": total,
        "page": page,
        "page_size": limit,
        "total_pages": total_pages,
    }


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post_endpoint(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_post(db, post_data, current_user)


@router.get("/{post_id}", response_model=PostResponse)
def get_post_endpoint(post_id: int, db: Session = Depends(get_db)):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post_endpoint(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return update_post(db, post, post_data, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_endpoint(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    delete_post(db, post, current_user)
