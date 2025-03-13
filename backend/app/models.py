from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, index=True)
    key = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


class ResearchTopic(Base):
    __tablename__ = "research_topics"

    id = Column(Integer, primary_key=True, index=True)
    original_topic = Column(String)
    refined_topic = Column(String)
    final_topic = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    files = relationship("UploadedFile", back_populates="research_topic")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    research_topic_id = Column(Integer, ForeignKey("research_topics.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    research_topic = relationship("ResearchTopic", back_populates="files")
