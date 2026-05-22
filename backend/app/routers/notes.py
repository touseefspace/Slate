from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user_id
from app.crud import note as note_crud
from app.database import get_db
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    return note_crud.list_notes(db, user_id)


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    data: NoteCreate,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    return note_crud.create_note(db, user_id, data)


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: int,
    data: NoteUpdate,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    note = note_crud.get_note(db, note_id, user_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note_crud.update_note(db, note, data)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Session = Depends(get_db),
):
    note = note_crud.get_note(db, note_id, user_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    note_crud.delete_note(db, note)
