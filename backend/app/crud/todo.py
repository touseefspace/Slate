from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


def list_todos(db: Session, user_id: str) -> list[Todo]:
    stmt = (
        select(Todo)
        .where(Todo.user_id == user_id)
        .order_by(Todo.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_todo(db: Session, todo_id: int, user_id: str) -> Todo | None:
    stmt = select(Todo).where(Todo.id == todo_id, Todo.user_id == user_id)
    return db.scalar(stmt)


def create_todo(db: Session, user_id: str, data: TodoCreate) -> Todo:
    todo = Todo(
        user_id=user_id,
        title=data.title,
        description=data.description,
        completed=False,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_todo(db: Session, todo: Todo, data: TodoUpdate) -> Todo:
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo: Todo) -> None:
    db.delete(todo)
    db.commit()
