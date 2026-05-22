from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user_id
from app.crud import todo as todo_crud
from app.database import get_db
from app.schemas.todo import TodoCreate, TodoRead, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[TodoRead])
def list_todos(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    return todo_crud.list_todos(db, user_id)


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(
    data: TodoCreate,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    return todo_crud.create_todo(db, user_id, data)


@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: int,
    data: TodoUpdate,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    todo = todo_crud.get_todo(db, todo_id, user_id)
    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo_crud.update_todo(db, todo, data)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    todo = todo_crud.get_todo(db, todo_id, user_id)
    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    todo_crud.delete_todo(db, todo)
