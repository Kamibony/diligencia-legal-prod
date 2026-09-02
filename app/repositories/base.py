from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from google.cloud import firestore
from pydantic import BaseModel

from app.db import get_db

ModelType = TypeVar("ModelType", bound=BaseModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, collection_name: str, model: Type[ModelType]):
        self.collection_name = collection_name
        self.model = model

    @property
    def _collection(self) -> firestore.CollectionReference:
        return get_db().collection(self.collection_name)

    def get(self, document_id: str) -> Optional[ModelType]:
        doc_ref = self._collection.document(document_id)
        doc = doc_ref.get()
        if doc.exists:
            return self.model(**doc.to_dict())
        return None

    def create(self, document_id: str, data: ModelType) -> ModelType:
        doc_ref = self._collection.document(document_id)
        doc_ref.set(data.model_dump())
        return data

    def update(self, document_id: str, data: Dict[str, Any]) -> None:
        doc_ref = self._collection.document(document_id)
        doc_ref.update(data)

    def delete(self, document_id: str) -> None:
        doc_ref = self._collection.document(document_id)
        doc_ref.delete()
