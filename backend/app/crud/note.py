from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def list_notes(db: Session, user_id: str) -> list[Note]:
    stmt = (
        select(Note)
        .where(Note.user_id == user_id)
        .order_by(Note.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_note(db: Session, note_id: int, user_id: str) -> Note | None:
    stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
    return db.scalar(stmt)


def create_note(db: Session, user_id: str, data: NoteCreate) -> Note:
    note = Note(
        user_id=user_id,
        title=data.title,
        content=data.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note: Note, data: NoteUpdate) -> Note:
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note) -> None:
    db.delete(note)
    db.commit()
